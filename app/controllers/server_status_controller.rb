class ServerStatusController < ApplicationController

  before_action :prefer_secure
  before_action :current_account, :except=> :data

  layout 'home'

  def index
    @stylesheets=[:server_status]
    @javascripts=[:server_status]
  end

  def data
    rows = [ rand(10), rand(10) ]
    render :json=>rows
  end

end
