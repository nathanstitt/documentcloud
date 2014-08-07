class CreateSolrTasks < ActiveRecord::Migration
  def change
    create_table :solr_tasks do |t|
      t.integer :attempts
      t.boolean :failed,     default: false
      t.hstore  :options,    default: '', null: false
      t.references :record,  polymorphic: true
      t.timestamps
    end
  end
end
