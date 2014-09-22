class Search < ActiveRecord::Base

  self.establish_connection( DC::ANALYTICS_DB ) unless Rails.env.test?

  belongs_to :organization
  belongs_to :account

  # Will have a reference to the Document if the
  # search was limited to it, otherwise will be nil
  belongs_to :document

  validates :query, :presence=>true

  before_create :set_occured_to_now

  def self.log(options)
    return unless options[:account] && options[:query].present?
    if !options[:organization]
      options[:organization] = options[:account].organization
    end
    self.create!(options)
  end

  private

  def set_occured_to_now
    self.occured_at ||= Time.now
  end

end
