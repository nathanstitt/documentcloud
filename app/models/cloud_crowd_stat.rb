class CloudCrowdStat < ActiveRecord::Base


  scope :recent, -> { where('lower(period) < ?',Time.now-1.day) }

  def self.record(interval)
    CloudCrowd::Job.class_eval do
      config_path = "./config/cloud_crowd/#{Rails.env}/database.yml"
      configuration = YAML.load(ERB.new(File.read(config_path)).result)
      self.establish_connection(configuration)
    end

    stat = CloudCrowdStat.new({:period=>interval})

    stat.pending_count = CloudCrowd::Job.incomplete.count
    stat.average_wait  = CloudCrowd::Job.complete
      .where("completed_at between ? and ?", interval.first, interval.last)
      .average('created_at-completed_at')
    stat.processing_count = CloudCrowd::Job.incomplete
      .where("distributed_at is not null").count

    stat.save!
  end


end
