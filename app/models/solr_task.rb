# SolrTask is a record of a failed indexing operation
class SolrTask < ActiveRecord::Base

  MAX_TRIES = 3 # How many times a task should be re-tried before giving up

  belongs_to :record, polymorphic: true

  scope :pending, ->{ where("pending=?", true) }

  # Retries indexing on the record.
  # If the operation was a deletion, it removes it from the index,
  # otherwise it calls `solr_index` on it
  def retry
    self.update_attributes(:attempts => self.attempts+1)
    if options['removal']
      # Here we have to be careful.  The record won't be found since it was a delete.
      # this is taken from the Sunspot::Rails::Searchable#solr_clean_index_orphans
      self.record_type.constantize.new do | fake_instance |
        fake_instance.id = self.record_id
        fake_instance.solr_remove_from_index
      end
    else
      self.record.solr_index if self.record
    end
    self.update_attributes(:pending=>false)
  rescue Errno::ECONNREFUSED, Net::ReadTimeout
    if self.attempts >= MAX_TRIES
      self.update_attributes!(:pending=>false)
    end
  end

  # If any of the common Solr exceptions occur,
  # save the record's type and ID and retry the indexing later
  def self.perform(records, options={}, &block)
    yield
    rescue Errno::ECONNREFUSED, Net::ReadTimeout
      # If records isn't an array, the splat will convert it to one so it can be iterated
      [*records].each do |record|
        SolrTask.create!({ :record=>record, 'options'=>options })
      end
  end

  # Retries each pending task
  def self.retry_failures
    SolrTask.pending.find_each{ | job | job.retry }
  end

end
