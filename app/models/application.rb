class Application < ActiveRecord::Base

  validates_presence_of   :name, :email, :organization_name, :usage
  validates_format_of     :email, :with => DC::Validators::EMAIL

  belongs_to :organization
  named_scope :sorted, :order=>'created_at desc'

  has_one  :security_key,    :dependent => :destroy, :as => :securable

  validates_uniqueness_of :email, :case_sensitive => false, :message=>"has already applied.  Perhaps you have already submitted an application"

  after_create :send_verify_email_instructions

  # When an account is created by a third party, send an email with a secure
  # key to set the password.
  def send_verify_email_instructions(admin=nil)
    create_security_key if security_key.nil?
    LifecycleMailer.deliver_verify_application_email(self)
  end

  # MD5 hash of processed email address, for use in Gravatar URLs.
  def hashed_email
    @hashed_email ||= Digest::MD5.hexdigest(email.downcase.gsub(/\s/, '')) if email
  end

  def as_json(options={})
    super(options).merge({
        :hashed_email => hashed_email
      })
  end
end
