function reveal_interval(wavesurfer_name){
  var current_interval = wavesurfer_name.regions.list[Object.keys(wavesurfer_name.regions.list)[0]]
  return [current_interval.start,current_interval.end];
}
function log_interval(wavesurfer_name){
  var current_interval = wavesurfer_name.regions.list[Object.keys(wavesurfer_name.regions.list)[0]]
  console.log('"start": ' + '"' + current_interval.start + '",' + '"end": ' + '"' + current_interval.end + '"');
}

// active WaveSurfer instance
var wavesurfer_active = WaveSurfer.create({
  container: '#waveform_active',
  waveColor: '#DEB887',
  progressColor: '#dc3545',
  plugins: [
    WaveSurfer.timeline.create({
      container: "#wave_active-timeline"
    }),
    WaveSurfer.regions.create({
      regions: [
        {
          start: 0,
          end: 20,
          loop: false,
          resize: false,
          color: 'hsla(400, 100%, 30%, 0.5)'
        }
      ],
      dragSelection: {
        slop: 5
      }
    })
  ]
})

// Once the user loads a file in the fileinput_active, the file should be loaded into waveform_active
document.getElementById("fileinput_active").addEventListener('change', function(e){
  var file = this.files[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function (evt) {
      var blob = new window.Blob([new Uint8Array(evt.target.result)]);

      wavesurfer_active.loadBlob(blob);
    };

    reader.onerror = function (evt) {
      console.error("An error ocurred reading the file: ", evt);
    };

    reader.readAsArrayBuffer(file);
  }
}, false);

wavesurfer_active.on('region-update-end', function () {
  log_interval(wavesurfer_active);
});

// relax WaveSurfer instance
var wavesurfer_relax = WaveSurfer.create({
  container: '#waveform_relax',
  waveColor: '#DEB887',
  progressColor: '#dc3545',
  plugins: [
    WaveSurfer.timeline.create({
      container: "#wave_relax-timeline"
    }),
    WaveSurfer.regions.create({
      regions: [
        {
          start: 0,
          end: 10,
          loop: false,
          resize: false,
          color: 'hsla(400, 100%, 30%, 0.7)'
        }
      ],
      dragSelection: {
        slop: 5
      }
    })
  ]
})

// Once the user loads a file in the fileinput_active, the file should be loaded into waveform_active
document.getElementById("fileinput_relax").addEventListener('change', function(e){
  var file = this.files[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function (evt) {
      var blob = new window.Blob([new Uint8Array(evt.target.result)]);

      wavesurfer_relax.loadBlob(blob);
    };

    reader.onerror = function (evt) {
      console.error("An error ocurred reading the file: ", evt);
    };

    reader.readAsArrayBuffer(file);
  }
}, false);

wavesurfer_relax.on('region-update-end', function () {
  log_interval(wavesurfer_relax);
});

// TODO: Bonus: Cut tracks to begin/end on client side already. Then only send pre-cut tracks to server!

// Send files + start & end dates for both tracks to server
var form = document.forms.namedItem("submit_files");
form.addEventListener('submit', function(ev) {

  var prepare_active_interval = []
  var prepare_rest_interval = []
  prepare_active_interval = reveal_interval(wavesurfer_active);
  prepare_rest_interval = reveal_interval(wavesurfer_relax);

  var active_interval = prepare_active_interval;
  var rest_interval = prepare_rest_interval;

  var response_element = document.getElementById("error");
  var form_payload = new FormData(form);

  form_payload.append("active_interval", active_interval);
  form_payload.append("rest_interval", rest_interval);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var a;
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      // Trick for making downloadable link
      a = document.createElement('a');
      a.href = window.URL.createObjectURL(xhttp.response);
      // Give filename you wish to download
      a.download = "final_output.mp3";
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
    }
  };

  xhttp.open("POST", "http://localhost:5000/api/v1", true);

  xhttp.onload = function(oEvent) {
    if (xhttp.status == 200) {
      response_element.innerHTML = "Uploaded!";
    } else {
      response_element.innerHTML = "Error " + xhttp.status + " occurred when trying to upload your file.<br \/>";
    }
  };

  xhttp.responseType = 'blob';
  xhttp.send(form_payload);
  ev.preventDefault();
}, false);
