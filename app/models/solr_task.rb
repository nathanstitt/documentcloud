class SolrTask < ActiveRecord::Base

  MAX_TRIES = 3 # How many times a task should be re-tried before giving up

  belongs_to :record, polymorphic: true

  def retry
    self.update_attributes(:attempts, self.attempts+1)
    if options['removal']
      # Here we have to be careful.  The record won't be found since it was a delete.
      # this is taken from the Sunspot::Rails::Searchable#solr_clean_index_orphans
      new self.record_type do | fake_instance |
        fake_instance.id = self.record_id
        fake_instance.solr_remove_from_index
      end
    else
      self.record.solr_index
    end
  rescue Errno::ECONNREFUSED, Net::ReadTimeout
    if self.attempts < MAX_TRIES
      self.update_attributes(:failed=>true)
    end
  end



  # If any of the common Solr exceptions occur,
  # save the record's type and ID and retry the indexing later
  def self.perform(record, options={}, &block)
    yield
    rescue Errno::ECONNREFUSED, Net::ReadTimeout
      SolrTask.create!({ :record=>record, 'options'=>options })
  end

  # Loops through
  def self.retry_failures
    SolrTask.where(:failed=>false).find_each{ | job | job.retry }
  end

end
