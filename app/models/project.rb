require 'set'

# A Project, (or Folder, Bucket, Tag, Collection, Notebook, etc.) is a
# name under which to group a set of related documents, purely for
# organizational purposes.
class Project < ActiveRecord::Base
  include DC::Access
  
  belongs_to :account
  has_many :project_memberships, :dependent => :destroy
  has_many :collaborations,      :dependent => :destroy
  has_many :documents,           :through => :project_memberships
  has_many :collaborators,       :through => :collaborations, :source => :account

  validates_presence_of   :title, :unless => :hidden?
  validates_uniqueness_of :title, :scope => :account_id, :unless => :hidden?

  after_create    :create_default_collaboration
  after_create    :reindex_documents
  before_destroy  :document_ids
  after_destroy   :reindex_documents

  # Sanitizations:
  text_attr :title
  styleable_attr :description

  named_scope :alphabetical, {:order => :title}
  named_scope :visible, :conditions => {:hidden => false}
  named_scope :hidden, :conditions => {:hidden => true}
  named_scope :accessible, lambda {|account|
    {:conditions => ['account_id = ? or id in (select project_id from collaborations where account_id = ?)', account.id, account.id]}
  }

  delegate :full_name, :to => :account, :prefix => true, :allow_nil => true

  attr_writer :annotation_count

  # Load all of the projects belonging to an account in one fell swoop.
  def self.load_for(account)
    self.visible.accessible(account).all(:include => ['account', 'collaborations'])
  end

  def hidden?
    hidden
  end

  def set_documents(new_ids)
    new_ids = new_ids.to_set
    old_ids = self.document_ids.to_set
    ProjectMembership.destroy_all(:project_id => id, :document_id => (old_ids - new_ids).to_a)
    (new_ids - old_ids).each {|doc_id| self.project_memberships.create(:document_id => doc_id) }
    @document_ids = nil
    reindex_documents new_ids ^ old_ids
  end
  
  def add_documents(new_ids)
    rows = self.project_memberships.all(:conditions => {:document_id => new_ids.uniq}, :select => :document_id)
    add_ids = new_ids - rows.map(&:document_id)
    add_ids.each {|id| self.project_memberships.create(:document_id => id) }
    reindex_documents add_ids
  end
  
  def remove_documents(ids)
    memberships = self.project_memberships.all(:conditions => {:document_id => ids})
    memberships.each {|m| m.destroy }
    reindex_documents memberships.map {|m| m.document_id }
  end

  def add_collaborator(account, creator=nil)
    if !hidden? && account.reviewer?
      account.errors.add_to_base("Please create a real contributor account for this user.")
      return false
    end
    self.collaborations.create(:account => account, :creator => creator)
    @collaborator_ids = nil
    update_reviewer_counts
    true
  end

  def remove_collaborator(account)
    self.collaborations.owned_by(account).first.destroy
    @collaborator_ids = nil
    update_reviewer_counts
    if hidden? && self.collaborations.count == 0
      self.destroy
    end
  end

  def update_reviewer_counts
    return false unless hidden?
    Document.find(document_ids.first).update_attributes :reviewer_count => collaborations.count
  end

  def create_default_collaboration
    add_collaborator self.account unless hidden?
  end

  def other_collaborators(account)
    collaborations = self.collaborations.not_owned_by(account).all(:select => ['account_id'])
    Account.all(:conditions => {:id => collaborations.map {|c| c.account_id }})
  end

  def add_document(document)
    self.project_memberships.create(:document => document)
    @document_ids = nil
  end

  # N.B. document_ids are raw numeric document ids, used internally for data access
  def document_ids
    @document_ids ||= project_memberships.map {|m| m.document_id }
  end
  
  def canonical_document_ids
    sparse_documents = Document.all(
      :select=>"documents.id, documents.slug", 
      :joins=>"join project_memberships on documents.id = project_memberships.document_id", 
      :conditions => [ "project_memberships.project_id = ?", id ])
    sparse_documents.map { |d| d.canonical_id }
  end

  def collaborator_ids
    @collaborator_ids ||= collaborations.not_owned_by(account).map {|m| m.account_id }
  end

  # How many annotations belong to documents belonging to this project?
  # How many of those annotations are accessible to a given account?
  # 
  # TODO: incorporate PREMODERATED and POSTMODERATED comments into counts
  def annotation_count(account=nil)
    account ||= self.account
    @annotation_count ||= Annotation.count_by_sql <<-EOS
      select count(*) from annotations 
        inner join project_memberships on project_memberships.document_id = annotations.document_id
      where project_memberships.project_id = #{id}
      and (annotations.access in (#{PUBLIC}, #{EXCLUSIVE}) or 
        annotations.access = #{PRIVATE} and annotations.account_id = #{account.id})
    EOS
  end

  def canonical
    data = ActiveSupport::OrderedHash.new
    data['id']            = id
    data['title']         = title
    data['description']   = description
    data['document_ids']  = canonical_document_ids
    data
  end

  def to_json(opts={})
    acc = opts[:account]
    attrs = attributes.merge(
      :account_full_name  => account_full_name,
      :annotation_count   => annotation_count(acc),
      :document_count     => project_memberships.count
    )
    if opts[:include_collaborators]
      attrs[:collaborators] = other_collaborators(acc).map {|c| c.canonical(:include_organization => true) }
    end
    attrs['title'] ||= "[Untitled Project]"
    attrs.to_json
  end


  private

  def reindex_documents(ids=nil)
    ids ||= self.document_ids
    return if ids.empty?
    update_reviewer_counts
    Document.find_each(:conditions => ["id in (?)", ids]) {|doc| doc.index }
  end

end