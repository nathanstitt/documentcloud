class SolrTask < ActiveRecord::Base

  belongs_to :record, polymorphic: true


  def self.index_later(record, options={})
    SolrTask.create!({ :record=>record, 'options'=>options })
    
  end

  def self.perform
    SolrTask.where(:failed=>false).find_each do | job |
      job.update_attributes(:attempts, job.attempts+1)
      begin
        if options['removal']
          # Here we have to be careful.  The record won't be found
          # this is takenf rom the Sunspot::Rails::Searchable#solr_clean_index_orphans
          new job.record_type do | fake_instance |
            fake_instance.id = job.record_id
            fake_instance.solr_remove_from_index
          end
        else
          job.record.solr_index
        end
        job
      rescue Errno::ECONNREFUSED, Net::ReadTimeout
        if job.attempts < MAX_TRIES
          job.update_attributes(:failed=>true)
        end
      end
    end
end
