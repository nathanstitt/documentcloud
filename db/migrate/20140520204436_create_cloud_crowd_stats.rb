class CreateCloudCrowdStats < ActiveRecord::Migration
  def change
    create_table :cloud_crowd_stats do |t|
      t.tsrange :period
      t.integer :pending_count, :average_wait, :processing_count
    end
  end
end
