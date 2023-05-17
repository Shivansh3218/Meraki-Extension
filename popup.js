window.onload = function () {
  // let send = document.querySelector("#send");
  // setTimeout(() => send.click(), 1);
  // send.addEventListener("click", () => console.log("uiser clicked"));
  chrome.windows.getCurrent(function(popupWindow) {
    const popupId = popupWindow.id;
    console.log('Popup ID:', popupId);
    chrome.runtime.sendMessage({action:"popupId", message:popupId})
    // Perform any actions with the popup ID
  });
};
var port = chrome.runtime.connect()

window.onbeforeunload = (event) => {
 
  const confirmationMessage = 'Closing this tab will cause you to lose your meeting recording. Are you sure you want to leave?';
  event.preventDefault();
  event.returnValue = confirmationMessage;
};
let startRec = document.querySelector("#start-recording");
let stopRec = document.querySelector("#stop-recording");

let stream = null;
let audio = null;
let mixedStream = null;
let chunks = [];
let recorder = null;
let isRecordingVideo = false;
let intervalId;
const previewUrl = chrome.runtime.getURL("preview.html");

startRec.addEventListener("click", shareScreen);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "stopRecording") {
    stopRecording();
  }

  if (request.action === "start-Recording") {
    shareScreen();
    console.log("Start recording");
  }
  if (request.action === "muteAudio") {
    muteAudio();
  }
  if (request.action === "unmuteAudio") {
    unmuteAudio();
  }
  if (request.action === "pauseVideo") {
    handlePause();
  }
});

function muteAudio() {
  if (isRecordingVideo === true) {
    localStream.getAudioTracks().forEach(function (track) {
      track.enabled = !track.enabled;
    });
  } else {
    console.log("recording not enabled");
  }
}
function unmuteAudio() {
  if (isRecordingVideo === true) {
    localStream.getAudioTracks().forEach(function (track) {
      track.enabled = true;
    });
  }
}
function handlePause() {
  if (recorder.state === "recording") {
    // pausing video recording timer:-
    recorder.pause();
    // recording paused
  } else if (recorder.state === "paused") {
    // resume recording
    recorder.resume();
  }
}

function handleDataAvailable(e) {
  if (e.data) {
    chunks.push(e.data);
    const blobToBase64 = (blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64Strings = reader.result
            .toString()
            .replace(/^data:(.*,)?/, "");
          resolve(base64Strings);
        };
        reader.onerror = (error) => reject(error);
      });
    };

    blobToBase64(e.data)
      .then((base64Strings) => {
        chrome.runtime.sendMessage({
          type: "base64Data",
          data: base64Strings,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

function shareScreen() {
  chrome.runtime.sendMessage({
    message: "closePreview",
    closeURL: previewUrl,
  });

  isRecordingVideo = true;
  var screenConstraints = { video: true, audio: true };
  navigator.mediaDevices
    .getDisplayMedia(screenConstraints)
    .then(function (screenStream) {
      /* use the screen & audio stream */

      var micConstraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(micConstraints)
        .then(function (micStream) {
          var composedStream = new MediaStream();

          screenStream.getVideoTracks().forEach(function (videoTrack) {
            composedStream.addTrack(videoTrack);
          });

          var context = new AudioContext();

          var audioDestinationNode = context.createMediaStreamDestination();

          //check to see if we have a screen stream and only then add it
          if (screenStream && screenStream.getAudioTracks().length > 0) {
            const systemSource = context.createMediaStreamSource(screenStream);

            const systemGain = context.createGain();
            systemGain.gain.value = 1.0;

            systemSource.connect(systemGain).connect(audioDestinationNode);
          }

          if (micStream && micStream.getAudioTracks().length > 0) {
            const micSource = context.createMediaStreamSource(micStream);

            //set it's volume
            const micGain = context.createGain();
            micGain.gain.value = 1.0;

            //add it to the destination
            micSource.connect(micGain).connect(audioDestinationNode);
          }

          audioDestinationNode.stream
            .getAudioTracks()
            .forEach(function (audioTrack) {
              composedStream.addTrack(audioTrack);
            });
          onCombinedStreamAvailable(composedStream);
        })
        .catch(function (err) {
          console.log(err);
        });
    })
    .catch(function (err) {
      console.log(err);
      // recButtonsContainer.innerHTML = "";
      // recButtonsContainer.appendChild(redDot);
      // recButtonsContainer.appendChild(recSessionTxt);
      // isRecordingVideo = false;
    });
}

function onCombinedStreamAvailable(stream) {
  localStream = stream;
  if (localStream != null) {
    //   intervalId = setInterval(() => {
    //     const hours = Math.floor(duration / 3600000)
    //       .toString()
    //       .padStart(2, "0");
    //     const minutes = Math.floor((duration % 3600000) / 60000)
    //       .toString()
    //       .padStart(2, "0");
    //     const seconds = ((duration % 60000) / 1000).toFixed(0).padStart(2, "0");
    //     meetTimeBtn.innerText = `${hours}:${minutes}:${seconds}`;
    //     duration += 1000;
    //   }, 970);
    recorder = new MediaRecorder(localStream);
    //   if (isMuted === true) {
    //     localStream.getAudioTracks().forEach(function (track) {
    //       track.enabled = !track.enabled;
    //     });
    //   } else {
    //     localStream.getAudioTracks().forEach(function (track) {
    //       track.enabled = true;
    //     });
    //   }
    // recorder.onstop = stopRecording;
    recorder.ondataavailable = handleDataAvailable;

    recorder.start(1000);
    chrome.runtime.sendMessage({
      action: "doSomething",
      message: "recording-started",
    });

    chrome.windows.getCurrent(function (currentWindow) {
      chrome.windows.update(currentWindow.id, {
        focused: false,
        state: "minimized",
      });
    });
    console.log(recorder.state);
  } else {
    console.log("localStream is missing");

    // chrome.runtime.sendMessage({value:"recordingNotStarted"})
  }
}

async function stopRecording() {
  // stop timer for video duration calculation:-
  if (recorder.state !== "inactive") {
    recorder.stop();
  }
  isRecordingVideo = false;
  stop();

  window.onbeforeunload = null;

  chrome.runtime.sendMessage({ action: "createTab", url: previewUrl });

  // chrome.runtime.sendMessage({ type: "attendance", meetRecord: "record" });
}

// if (isRecordingVideo) {
//   window.onbeforeunload = (e) => {
//     e.preventDefault();
//     return "";
//   };
// } else {
//   window.onbeforeunload = null;
// }

// popup.js

// popup.js

// Function to send a message to background.js
function sendMessageToBackgroundScript(message) {
  chrome.runtime.sendMessage(message);
  console.log("sending message");
}

// Example usage: sending a message with data

// document
//   .querySelector("#send")
//   .addEventListener("click", () =>
// chrome.runtime.sendMessage({action:"doSomething", message:"This is message from popup.js"})
//   );