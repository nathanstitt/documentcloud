class CreateApplications < ActiveRecord::Migration
  def self.up
    create_table :applications do |t|
      t.string :name, :email, :organization, :usage, :null=>false
      t.column :fields, :hstore
      t.timestamps
    end
  end

  def self.down
    drop_table :applications
  end
end
