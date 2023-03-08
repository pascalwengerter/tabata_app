const createWaveSurfer = (containerId, timelineId, regionColor) => WaveSurfer.create({
  container: containerId,
  waveColor: "#DEB887",
  progressColor: "DC3545",
  plugins: [
    WaveSurfer.timeline.create({
      container: timelineId
    }),
    WaveSurfer.regions.create({
      regions: [
        {
          start: 0,
          end: 20,
          loop: false,
          resize: false,
          color: `hsla(400, 100%, 30%, ${regionColor})`
        }
      ],
      dragSelection: {
        slop: 5
      }
    })
  ]
});

// Create WaveSurfer instances
const wavesurferActive = createWaveSurfer("#waveform-active", "#wave-active-timeline", "0.5")
const wavesurferRelax = createWaveSurfer("#waveform-relax",  "#wave-relax-timeline", "0.7")

const addChangeEventListener = (inputId, waveSurferInstance) => document.getElementById(inputId).addEventListener('change', function (e) {
  let file = this.files[0];

  if (file) {
    let reader = new FileReader();

    reader.onload = function (evt) {
      let blob = new window.Blob([new Uint8Array(evt.target.result)]);

      waveSurferInstance.loadBlob(blob);
    };

    reader.onerror = function (evt) {
      console.error("An error ocurred reading the file: ", evt);
    };

    reader.readAsArrayBuffer(file);
  }
}, false);

// Load files into wavesurfer instances once user adds file to corresponding input 
addChangeEventListener("fileinput-active", wavesurferActive)
addChangeEventListener("fileinput-relax", wavesurferRelax)

const revealInterval = (wavesurfer_name) => {
  const current_interval = wavesurfer_name.regions.list[Object.keys(wavesurfer_name.regions.list)[0]]
  return [current_interval.start, current_interval.end];
}

// Send files + start & end dates for both tracks to server
let form = document.forms.namedItem("submit_files");
form.addEventListener('submit', function (ev) {

  const active_interval = revealInterval(wavesurferActive);
  const rest_interval = revealInterval(wavesurferRelax);

  const response_element = document.getElementById("error");
  const form_payload = new FormData(form);

  form_payload.append("active_interval", active_interval);
  form_payload.append("rest_interval", rest_interval);

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    let a;
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

  xhttp.open("POST", "/api/v1", true);

  xhttp.onload = function (oEvent) {
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
