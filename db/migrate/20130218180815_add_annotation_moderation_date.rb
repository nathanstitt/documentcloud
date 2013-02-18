class AddAnnotationModerationDate < ActiveRecord::Migration
  def self.up
    add_column :annotations, :moderation_date, :date
  end

  def self.down
    remove_column :annotations, :moderation_date
  end
end
