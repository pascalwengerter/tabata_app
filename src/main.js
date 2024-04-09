import "./assets/stylesheets/bootstrap.min.css";
import "./assets/stylesheets/styles.css";

import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js";

const createWaveSurfer = (
  containerId,
  timelineId,
  regionColorFactor,
  duration
) => {
  const waveSurfer = WaveSurfer.create({
    container: containerId,
    waveColor: "rgb(200, 0, 0)",
    progressColor: "rgb(100, 0, 100)",
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    plugins: [
      TimelinePlugin.create({
        container: timelineId,
      }),
    ],
  });

  const regions = waveSurfer.registerPlugin(RegionsPlugin.create());

  waveSurfer.on("decode", () => {
    regions.addRegion({
      start: 0,
      end: duration,
      minLength: duration,
      maxLength: duration,
      color: `rgba(200, 0, 0, ${regionColorFactor})`,
      resize: false,
    });
  });

  return waveSurfer;
};

const wavesurferActive = createWaveSurfer(
  "#waveform-active",
  "#wave-active-timeline",
  "0.5",
  20
);
const wavesurferRelax = createWaveSurfer(
  "#waveform-relax",
  "#wave-relax-timeline",
  "0.7",
  10
);

const audioFileInputActive = document.getElementById("fileinput-active");
const audioFileInputRelax = document.getElementById("fileinput-relax");

audioFileInputActive.addEventListener("change", function (event) {
  const file = event.target.files[0];
  const blobURL = URL.createObjectURL(file);
  wavesurferActive.load(blobURL);
});

audioFileInputRelax.addEventListener("change", function (event) {
  const file = event.target.files[0];
  const blobURL = URL.createObjectURL(file);
  wavesurferRelax.load(blobURL);
});

const audioFilePlayActive = document.getElementById("active-play-btn");
const audioFilePauseActive = document.getElementById("active-pause-btn");
const audioFilePlayRelax = document.getElementById("relax-play-btn");
const audioFilePauseRelax = document.getElementById("relax-pause-btn");

audioFilePlayActive.addEventListener("click", function () {
  if (wavesurferActive) {
    wavesurferActive.play();
  }
});
audioFilePauseActive.addEventListener("click", function () {
  if (wavesurferActive?.isPlaying) {
    wavesurferActive.pause();
  }
});
audioFilePlayRelax.addEventListener("click", function () {
  if (wavesurferRelax) {
    wavesurferRelax.play();
  }
});
audioFilePauseRelax.addEventListener("click", function () {
  if (wavesurferRelax?.isPlaying) {
    wavesurferRelax.pause();
  }
});

const revealInterval = (waveSurferInstance) => {
  const currentInterval =
    waveSurferInstance.regions.list[
      Object.keys(waveSurferInstance.regions.list)[0]
    ];
  return [currentInterval.start, currentInterval.end];
};

const form = document.forms.namedItem("submit_files");

form.addEventListener(
  "submit",
  function (ev) {
    const responseElement = document.getElementById("error");
    const formPayload = new FormData(form);

    formPayload.append("active_interval", revealInterval(wavesurferActive));
    formPayload.append("rest_interval", revealInterval(wavesurferRelax));

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      let a;
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        // Trick for making downloadable link
        a = document.createElement("a");
        a.href = window.URL.createObjectURL(xhttp.response);
        a.download = "musclemate-tabata-track.mp3";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
      }
    };

    xhttp.open("POST", "/api/v1", true);

    xhttp.onload = function (_onEvent) {
      if (xhttp.status == 200) {
        responseElement.innerHTML = "Uploaded!";
      } else {
        responseElement.innerHTML =
          "Error " +
          xhttp.status +
          " occurred when trying to upload your file.<br />";
      }
    };

    xhttp.responseType = "blob";
    xhttp.send(formPayload);
    ev.preventDefault();
  },
  false
);
