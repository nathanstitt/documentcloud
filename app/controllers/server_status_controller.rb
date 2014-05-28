class ServerStatusController < ApplicationController

  before_action :prefer_secure
  before_action :current_account

  layout 'home'

  def index
    @javascripts=[:server_status]
  end

end
