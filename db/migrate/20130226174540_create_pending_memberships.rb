class CreatePendingMemberships < ActiveRecord::Migration
  def self.up
    create_table :pending_memberships do |t|
      t.string :first_name, :last_name, :email, :organization_name, :usage, :null=>false
      t.string :editor, :website
      t.boolean :validated, :default=>'f', :null=>false
      t.text :notes
      t.references :organization
      t.column :fields, :hstore
      t.timestamps
    end
  end

  def self.down
    drop_table :pending_memberships
  end
end
