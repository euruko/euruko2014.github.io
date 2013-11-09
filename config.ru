require 'sinatra/base'

class Euruko < Sinatra::Base
  get '/' do
    erb :index
  end
end

run Euruko
