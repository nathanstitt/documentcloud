class CreateSolrTasks < ActiveRecord::Migration
  def change
    create_table :solr_tasks do |t|
      t.integer :attempts,   default: 0
      t.boolean :pending,    default: true
      t.hstore  :options,    default: '', null: false
      t.references :record,  polymorphic: true
      t.timestamps
    end
  end
end
