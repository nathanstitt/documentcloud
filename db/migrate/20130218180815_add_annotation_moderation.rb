class AddAnnotationModeration < ActiveRecord::Migration
  def self.up
    add_column :annotations, :moderation_approval, :bool
  end

  def self.down
    remove_column :annotations, :moderation_approval
  end
end
