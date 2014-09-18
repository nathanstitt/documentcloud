class CreateSearches < ActiveRecord::Migration
  def change
    create_table :searches do |t|
      t.references :organization, :account, :null=>false
      t.references :document
      t.text       :query, :null=>false
      t.timestamp  :occured_at, :null=>false
    end
    add_index :searches, [:organization_id, :occured_at]
  end
end
