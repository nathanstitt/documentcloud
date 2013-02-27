class Application < ActiveRecord::Base

  validates_presence_of   :name, :email, :organization, :usage
  validates_format_of     :email, :with => DC::Validators::EMAIL
  validates_uniqueness_of :email, :case_sensitive => false, :message=>"has already applied.  Perhaps you've already submitted an application?"

end
