# my_app.rb

require 'sinatra/base'
require 'json'

class TabataApp < Sinatra::Base
  # necessary to write to docker stdout
  $stdout.sync = true

  # client facing endpoint
  get '/' do
    File.read(File.join('public', 'index.html'))
  end

  # TODO: Whitelist params: Expects 2 audio files and two starting-points
  post '/api/v1' do

    active_track = params['active_track']
    rest_track = params['rest_track']
    active_track_name = active_track[:filename]
    rest_track_name = rest_track[:filename]
    active_tempfile = params['active_track'][:tempfile]
    rest_tempfile = params['rest_track'][:tempfile]

    active_interval = params['active_interval'].split(',')
    rest_interval = params['rest_interval'].split(',')
    active_startingpoint = active_interval[0]
    active_endpoint = active_interval[1]
    rest_startingpoint = rest_interval[0]
    rest_endpoint = rest_interval[1]

    # TODO: Remove endpoints because they can be manually calculated
    active_part = create_active_track(active_tempfile, active_startingpoint, active_endpoint)
    passive_part = create_rest_track(rest_tempfile, rest_startingpoint, rest_endpoint)

    one_interval = concat_tracks('active_output.mp3', 'rest_output.mp3')

    final_track = create_final_track('one_output.mp3')

    if true
      send_file 'tmp/final_output.mp3', :filename => 'track.mp3', :type => 'audio/mpeg', disposition: 'attachment'
    else
      # status 500
      # TODO: Come up with error handling
    end
    # TODO: Cleanup tmp folder

  end

  private

  def create_active_track track, startpoint, endpoint
    create_track track, startpoint, endpoint, 'active'
  end

  def create_rest_track track, startpoint, endpoint
    create_track track, startpoint, endpoint, 'rest'
  end

  def create_track track, startpoint, endpoint, kind
    system "ffmpeg -y -ss #{startpoint} -to #{endpoint} -i #{track.path} tmp/#{kind}_output.mp3"
  end

  def concat_tracks first, second
    system "ffmpeg -y -i \"concat:tmp/#{first}|tmp/#{second}\" -c copy tmp/one_output.mp3"
  end

  def create_final_track track
    system "ffmpeg -y -i \"concat:tmp/#{track}|tmp/#{track}|tmp/#{track}|tmp/#{track}|tmp/#{track}|tmp/#{track}|tmp/#{track}|tmp/#{track}\" -c copy tmp/final_output.mp3"
  end

  # start the server if ruby file executed directly
  run! if app_file == $0
end
