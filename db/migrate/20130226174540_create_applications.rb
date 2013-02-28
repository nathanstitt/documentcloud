class CreateApplications < ActiveRecord::Migration
  def self.up
    create_table :applications do |t|
      t.string :name, :email, :organization_name, :usage, :null=>false
      t.boolean :validated, :default=>'f', :null=>false
      t.references :organization
      t.column :fields, :hstore
      t.timestamps
    end
  end

  def self.down
    drop_table :applications
  end
end
