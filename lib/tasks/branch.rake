desc "List the current git branch"
task :branch do
  sh "git branch -v"
end

# Switch to a given git branch.
rule(/^branch:/) do |t|
  branch = t.name.split(':').last
  remote = `git remote`.split(/\n/).first
  mtime = File.exists?('Gemfile') ? File.mtime('Gemfile') : Time.at(0)
  sh "git fetch"
  sh "git branch -f #{branch} #{remote}/#{branch}"
  sh "git checkout #{branch}"
  if $BUNDLE_RUN_UPDATE && File.exists?('Gemfile') && File.mtime('Gemfile') > mtime
    sh 'bundle install --quiet --deployment --without development test'
  end
end
