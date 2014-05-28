namespace :crowd do

  task :stats => :environment do
    start_time = Time.now-10.days
    begin
      stat = CloudCrowdStat.new( :period=>((start_time - 5.minutes )..start_time) )
      stat.pending_count = start_time.hour * rand(10)+2
      stat.average_wait  = stat.pending_count.to_f * 0.5
      stat.processing_count = stat.pending_count.to_f * 0.75
      stat.save!
    end while (start_time += 5.minutes) < Time.now
  end

  task :console do
    sh "crowd -c config/cloud_crowd/#{RAILS_ENV} -e #{RAILS_ENV} console"
  end

  [:server, :node].each do |resource|
    namespace resource do

      desc "Stop the crowdcloud #{resource.to_s}"
      task :stop do
        sh "crowd -c config/cloud_crowd/#{crowd_folder} -e #{RAILS_ENV} #{resource} stop"
      end

      desc "Run the crowdcloud #{resource.to_s} in the foreground"
      task :run do
        port = (resource == :server) ? '-p 8080' : ''
        sh "crowd -c config/cloud_crowd/#{crowd_folder} -e #{RAILS_ENV} #{port} #{resource} start"
      end

      desc "Start the crowdcloud #{resource.to_s}"
      task :start do
        port = (resource == :server) ? '-p 8080' : ''
        sh "crowd -c config/cloud_crowd/#{crowd_folder} -e #{RAILS_ENV} #{port} -d #{resource} start"
      end

      desc "Restart the crowdcloud #{resource.to_s}"
      task :restart => [:stop, :start]

    end
  end
  
  namespace :node do 
    desc "Handy unix shotgun for culling zombie crowd worker processes"
    task :cull do
      `ps aux | egrep "crowd|pdftk|pdftailor|tesseract|gm|soffice" | ruby -e 'STDIN.read.split("\n").each{ |line| puts line.split[1] unless line =~ /rake|grep/ }' | xargs kill`
    end
    
    task :cleanup_tmp do
      `rm -rf /tmp/cloud_crowd_tmp/*; rm -rf /tmp/d#{Time.now.year}*`
    end
  end
  

end

def crowd_folder
  File.exists?('EXPRESS') ? 'express' : RAILS_ENV
end



