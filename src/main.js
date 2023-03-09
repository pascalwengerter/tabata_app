import './assets/stylesheets/bootstrap.min.css'
import './assets/stylesheets/styles.css'

import WaveSurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js"
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js"

const createWaveSurfer = (containerId, timelineId, regionColor) => WaveSurfer.create({
  container: containerId,
  waveColor: "#DEB887",
  progressColor: "DC3545",
  plugins: [
    TimelinePlugin.create({
      container: timelineId
    }),
    RegionsPlugin.create({
      regions: [
        {
          end: 20,
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

addChangeEventListener("fileinput-active", wavesurferActive)
addChangeEventListener("fileinput-relax", wavesurferRelax)

document.getElementById("active-play-btn").onclick = () => wavesurferActive.play()
document.getElementById("active-pause-btn").onclick = () => wavesurferActive.pause()
document.getElementById("relax-play-btn").onclick = () => wavesurferRelax.play()
document.getElementById("relax-pause-btn").onclick = () => wavesurferRelax.pause()

const revealInterval = (waveSurferInstance) => {
  const currentInterval = waveSurferInstance.regions.list[Object.keys(waveSurferInstance.regions.list)[0]]
  return [currentInterval.start, currentInterval.end];
}

const form = document.forms.namedItem("submit_files");
form.addEventListener('submit', function (ev) {

  const responseElement = document.getElementById("error");
  const formPayload = new FormData(form);

  formPayload.append("active_interval", revealInterval(wavesurferActive));
  formPayload.append("rest_interval", revealInterval(wavesurferRelax));

  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    let a;
    if (xhttp.readyState === 4 && xhttp.status === 200) {
      // Trick for making downloadable link
      a = document.createElement('a');
      a.href = window.URL.createObjectURL(xhttp.response);
      a.download = "musclemate-tabata-track.mp3";
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
    }
  };

  xhttp.open("POST", "/api/v1", true);

  xhttp.onload = function (oEvent) {
    if (xhttp.status == 200) {
      responseElement.innerHTML = "Uploaded!";
    } else {
      responseElement.innerHTML = "Error " + xhttp.status + " occurred when trying to upload your file.<br \/>";
    }
  };

  xhttp.responseType = 'blob';
  xhttp.send(formPayload);
  ev.preventDefault();
}, false);
