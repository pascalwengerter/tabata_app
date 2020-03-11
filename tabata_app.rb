# tabata_app.rb

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

    tmp_final_track_name = (params['active_track'][:tempfile].path + params['rest_track'][:tempfile].path).gsub('.mp3', '').gsub('/tmp/', '')
    active_tempfile = params['active_track'][:tempfile]
    rest_tempfile = params['rest_track'][:tempfile]

    active_interval = params['active_interval'].split(',')
    rest_interval = params['rest_interval'].split(',')
    # TODO: Remove endpoints because they can be manually calculated
    active_startingpoint = active_interval[0]
    active_endpoint = active_interval[1]
    rest_startingpoint = rest_interval[0]
    rest_endpoint = rest_interval[1]

    active_part = create_active_track(active_tempfile, active_startingpoint, active_endpoint)
    passive_part = create_rest_track(rest_tempfile, rest_startingpoint, rest_endpoint)
    one_interval = concat_tracks('active_output', 'rest_output')
    final_track = create_final_track('one_output', tmp_final_track_name)

    delete_tracks [active_tempfile.path, rest_tempfile.path, 'active_output', 'rest_output', 'one_output']

    if true
      send_file "/tmp/#{tmp_final_track_name}.mp3", :filename => 'tabata_track.mp3', :type => 'audio/mpeg', disposition: 'attachment'
      # TODO: Delete tmp final track
    else
      # TODO: Come up with error handling
      status 500
      body 'Not all necessary parameters received'
    end

  end

  private

  def create_active_track track, startpoint, endpoint
    create_track track, startpoint, endpoint, 'active'
  end

  def create_rest_track track, startpoint, endpoint
    create_track track, startpoint, endpoint, 'rest'
  end

  def create_track track, startpoint, endpoint, kind
    system "ffmpeg -ss #{startpoint} -to #{endpoint} -i #{track.path} /tmp/#{kind}_output.mp3"
  end

  def concat_tracks first, second
    system "ffmpeg -i \"concat:/tmp/#{first}.mp3|/tmp/#{second}.mp3\" -c copy /tmp/one_output.mp3"
  end

  def create_final_track track, track_name
    system "ffmpeg -y -i \"concat:/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3|/tmp/#{track}.mp3\" -c copy /tmp/#{track_name}.mp3"
  end

  def delete_track track_name
    File.delete("/tmp/#{track_name}.mp3") if File.exist?("/tmp/#{track_name}.mp3")
    File.delete("#{track_name}") if File.exist?("#{track_name}")
  end

  def delete_tracks tracks
    tracks.each do |track|
      delete_track track
    end
  end

  # start the server if ruby file executed directly
  run! if app_file == $0
end
