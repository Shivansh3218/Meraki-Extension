window.addEventListener("load", () => {
  // setInterval(()=>{

  // var participantList = document.querySelector('.AE8xFb');
  //   participantList.addEventListener("DOMNodeInserted", function(event) {
  //     console.log("running on kjashndioujahsiudhasiuhdiasghduihsauihdiuosahdui9haws")
  //     // Get the name and entry time of the new participant
  //     var participantName = document.querySelector(".zWGUib").textContent;
  //     var entryTime = new Date().getTime();

  //     console.log(participantName, entryTime ,"This is the entry name and time")
  //   })
  // },1000)

  let stream = null;
  let audio = null;
  let mixedStream = null;
  let chunks = [];
  let recorder = null;
  let isRecordingVideo = false;
  let intervalId;
  const previewUrl = chrome.runtime.getURL("preview.html");

  //attendance tracker variables

  let studentDetails = new Map();
  let studentsNameSet = new Set();
  let ui_buttons;
  let totalClassDuration = 1;
  let goingToStop = 0;
  let isAttendanceWorking = false;
  let buttonClickInd = 0;
  let startTime;
  let flag = true; // make if false to block non-meraki classes
  let meetingDuration;
  var record;
  const redirectUrl = "https://merd-api.merakilearn.org/attendance";
  // let newWindow1 = window.open(redirectUrl);

  let meetingCode = window.location.pathname.substring(1);
  let date = new Date();
  let startMeetTime = new Date(date).toLocaleTimeString();
  let dd = date.getDate();
  let mm = date.toLocaleString("default", { month: "short" });
  let yyyy = date.getFullYear();
  date = dd + "-" + mm + "-" + yyyy;
  let sortedtstudentsNameSet = [];
  let studentsAttendedDuration = [];
  //   let studentsJoiningTime = [];
  let mapKeys = studentDetails.keys();

  // let videoDisplay = document.createElement("video");
  // videoDisplay.classList.add("video-feedback");

  const redDot = document.createElement("span");
  redDot.style.height = "15px";
  redDot.style.width = "15px";
  redDot.style.backgroundColor = "#f44336";
  redDot.style.borderRadius = "50%";

  const recSessionTxt = document.createElement("span");
  recSessionTxt.innerHTML = "Record Session";
  recSessionTxt.style.fontSize = "18px";

  let recButtonsContainer = document.createElement("div");
  recButtonsContainer.style.display = "flex";
  recButtonsContainer.style.justifyContent = "space-around";
  recButtonsContainer.style.alignItems = "center";
  recButtonsContainer.style.textAlign = "center";
  recButtonsContainer.style.gap = "2px";
  recButtonsContainer.id = "recButtonsContainer";
  // recButtonsContainer.className = "Jyj1Td CkXZgc";
  recButtonsContainer.style.border = "none";
  recButtonsContainer.style.backgroundColor = "#6d6d6d";
  recButtonsContainer.style.color = "white";
  recButtonsContainer.style.height = "1.8rem";
  recButtonsContainer.style.width = "10rem";
  recButtonsContainer.style.padding = "0.5rem";
  recButtonsContainer.style.borderRadius = "5px";
  recButtonsContainer.style.cursor = "pointer";
  recButtonsContainer.appendChild(redDot);
  recButtonsContainer.appendChild(recSessionTxt);
  recButtonsContainer.style.position = "fixed";
  recButtonsContainer.style.top = "20px";
  recButtonsContainer.style.left = "20px";

  let pauseBtn = document.createElement("button");
  pauseBtn.id = "pauseBtn";
  // recButton.className = "Jyj1Td CkXZgc";
  pauseBtn.innerHTML = "&#10074;&#10074;";
  pauseBtn.style.border = "none";
  pauseBtn.style.backgroundColor = "white";
  pauseBtn.style.color = "white";
  pauseBtn.style.height = "1.5rem";
  pauseBtn.style.width = "1.8rem";
  pauseBtn.style.borderRadius = "50%";
  pauseBtn.style.cursor = "pointer";
  pauseBtn.style.color = "#6d6d6d";

  // create the stop button
  let stopBtn = document.createElement("button");
  stopBtn.id = "stopBtn";
  stopBtn.innerHTML = "&#9632;";
  stopBtn.style.border = "none";
  stopBtn.style.backgroundColor = "white";
  stopBtn.style.color = "white";
  stopBtn.style.height = "1.5rem";
  stopBtn.style.width = "1.8rem";
  stopBtn.style.borderRadius = "50%";
  stopBtn.style.cursor = "pointer";
  stopBtn.style.color = "#6d6d6d";

  // Adding meeting time button to meet ui
  let meetTimeBtn = document.createElement("button");
  meetTimeBtn.id = "meetTimeBtn";
  meetTimeBtn.className = "Jyj1Td CkXZgc";
  meetTimeBtn.type = "button";
  meetTimeBtn.style.border = "none";
  meetTimeBtn.style.color = "white";
  meetTimeBtn.style.backgroundColor = "#6d6d6d";
  meetTimeBtn.style.fontSize = "16px";

  // let muteBtn = null;

  // "duration" variable - to calculate duration of video recording:-
  let duration = 0;

  recButtonsContainer.addEventListener("click", () => {
    if (isRecordingVideo == false) {
      clearInterval(intervalId);
      duration = 0;
      meetTimeBtn.innerText = "00:00:00";
      shareScreen();
      recButtonsContainer.innerHTML = "";
      recButtonsContainer.appendChild(redDot);
      recButtonsContainer.appendChild(meetTimeBtn);
      recButtonsContainer.appendChild(pauseBtn);
      recButtonsContainer.appendChild(stopBtn);
    }
  });
  pauseBtn.addEventListener("click", () => handlePause());

  stopBtn.addEventListener("click", (event) => {
    let endButton = document.querySelector(".Gt6sbf");
    // endButton.click();
    setTimeout(() => {
      location.reload();
    }, 2000);
    event.stopPropagation();
    if (isRecordingVideo == true) {
      stopRecording();
      recButtonsContainer.innerHTML = "";
      recButtonsContainer.appendChild(redDot);
      recButtonsContainer.appendChild(recSessionTxt);
    }
  });

  function insertRecButton() {
    try {
      if (document.getElementsByClassName("VfPpkd-kBDsod NtU4hc").length > 0) {
        // muteBtn = document.getElementsByClassName(
        //   "VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN JxICCe HNeRed Uulb3c"
        // )[0];
        ui_buttons = document.getElementsByClassName("VfPpkd-kBDsod NtU4hc");
        document
          .getElementsByClassName("jsNRx")[0]
          .appendChild(recButtonsContainer);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // if(muteBtn!==null){
  //   console.log(muteBtn)
  //   muteBtn.addEventListener("click", () => {
  //     console.log("Hello mute is clicked");
  //   });
  // }

  // Listen for changes to the mute button
  let listen = false;
  let isMuted = false;
  let muteInterval;

  if (listen === false) {
    muteInterval = setInterval(() => {
      if (document.querySelector(".Tmb7Fd") != null) {
        console.log("listen");
        listen = true;
        addMute();
      }
    }, 1000);
  }
  function addMute() {
    console.log(muteInterval, "mute interval");
    clearInterval(muteInterval);

    console.log(muteInterval, "mute interval after");
    setTimeout(() => {
      let muteButton = document.querySelector("[jsname='BOHaEe']");
      muteButton.addEventListener("click", () => {
        console.log("mute is clickwed", isMuted);
        if (isMuted === false) {
          isMuted = true;
          muteAudio();
        } else {
          unmuteAudio();
          isMuted = false;
        }
      });
    }, 3000);
  }

  let insertBtnInterval = setInterval(() => {
    insertRecButton();
  }, 1000);

  function insertButton() {
    try {
      ui_buttons = document.getElementsByClassName("VfPpkd-kBDsod NtU4hc");
      if (!isAttendanceWorking) {
        isAttendanceWorking = true;
        StartTime = new Date().toLocaleTimeString();
        studentDetails.clear();
        studentsNameSet.clear();
        totalClassDuration = 0;
        start();
      }

      document
        .getElementsByClassName("Gt6sbf QQrMi")
        .addEventListener("click", function () {
          if (isAttendanceWorking) {
            // stop();
          }
        });
      clearInterval(tryInsertingButton);
    } catch (error) {}
  }

  async function merakiClassChecker(url) {
    const API_URL = "https://dev-api.navgurukul.org/classes";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5Nzc2IiwiZW1haWwiOiJzaGl2YW5zaEBuYXZndXJ1a3VsLm9yZyIsImlhdCI6MTY3OTAzNTE4OCwiZXhwIjoxNzEwNTkyNzg4fQ.Ayzgfkk9k6PE_kaybCAznNeEXmF01zp7pLa5zOQ0f4k";

    const data = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "version-code": 99,
      },
    });
    const parsed_data = await data.json();
    for (let ind = 0; ind < parsed_data.length; ind++) {
      if (parsed_data[ind].meet_link === url) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  let meet_url = window.location.href;
  const checked_url = merakiClassChecker(meet_url);
  checked_url.then((result) => {
    if (result) {
      setInterval(insertButton, 1000);
    }
  });

  async function start() {
    startTime = new Date();
    startAttendanceTracker = setInterval(attendanceTracker, 1000);
  }

  // to get the meeting name/title
  const getMeetingName = () => {
    const elm = document.querySelector("[data-meeting-title]");
    if (elm && elm.dataset.meetingTitle) {
      return elm.dataset.meetingTitle;
    }
    return document.title;
  };

  let stop = (STOP = () => {
    clearInterval(startAttendanceTracker);

    //   let studentsJoiningTime = [];
    let mapKeys = studentDetails.keys();
    for (i = 0; i < studentDetails.size; i++) {
      let studentName = mapKeys.next().value;
      sortedtstudentsNameSet.push(studentName);
    }
    sortedtstudentsNameSet.sort();
    for (studentName of sortedtstudentsNameSet) {
      let data = studentDetails.get(studentName);
      studentsAttendedDuration.push(data[0].toString());
      // studentsJoiningTime.push(data[1]);
    }
    const end_time = new Date();

    record = {
      startMeetTime: startMeetTime,
      attendee_names: JSON.stringify(sortedtstudentsNameSet),
      attendedDurationInSec: JSON.stringify(studentsAttendedDuration),
      meet_code: meetingCode,
      meeting_title: getMeetingName().replace("Meet - ", ""),
      meeting_time: startTime.toISOString(),
    };

    record.meet_duration = meetingDuration;

    let data = {
      attendies_data: JSON.stringify(record),
    };
    // fetch("https://merd-api.merakilearn.org/attendance", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Success:", data);
    //   })
    //   .catch((error) => {
    //     console.error("Error:", error);
    //   });
    // const api = redirectUrl; // endpoint where this data will go
    // fetch(api, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(updatedRecord),
    // })
    //   .then((response) => {
    //     response.json()
    //   console.log(response)
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  });

  function attendanceTracker() {
    let currentlyPresentStudents = document.getElementsByClassName("zWGUib");
    if (currentlyPresentStudents.length > 0) {
      studentsNameSet.clear();
      let numberOfjoinedStudents = parseInt(
        document.querySelector(".uGOf1d").innerText
      );

      for (i = 0; i < numberOfjoinedStudents; i++) {
        try {
          studentsNameSet.add(currentlyPresentStudents[i].innerHTML);
        } catch (exception) {}
      }
      for (studentName of studentsNameSet) {
        if (studentDetails.has(studentName)) {
          let data = studentDetails.get(studentName);
          data[0] += 1;
          studentDetails.set(studentName, data);
        } else {
          let joiningTime = new Date().toLocaleTimeString();
          let currStatus = 1;
          let data = [];
          data.push(currStatus);
          data.push(joiningTime);
          studentDetails.set(studentName, data);
        }
      }
      if (studentsNameSet.size - 1 == -1) {
        goingToStop += 1;
      } else {
        meetingDuration = toTimeFormat(totalClassDuration);
        // meetTimeBtn.innerHTML = toTimeFormat(totalClassDuration);
        totalClassDuration += 1;
        goingToStop = 0;
      }
      if (goingToStop == 2) {
        isAttendanceWorking = false;
        // meetTimeBtn.innerHTML = "Track Attendance";
        // meetTimeBtn.style.border = "2px solid #C5221F";
        goingToStop = 0;
        // stop();
      }
    } else {
      try {
        // ui_buttons[buttonClickInd % ui_buttons.length].click();
        ui_buttons[1].click();
        buttonClickInd += 1;
        goingToStop = 0;
      } catch (error) {
        goingToStop += 1;
        if (goingToStop == 2) {
          isAttendanceWorking = false;
          // meetTimeBtn.innerHTML = "Track Attendance";
          // meetTimeBtn.style.border = "2px solid #C5221F";
          goingToStop = 0;
          // stop();
        }
      }
    }
  }
  function toTimeFormat(time) {
    const SECONDS_IN_HOUR = 3600;
    const SECONDS_IN_MINUTE = 60;

    let hours = Math.floor(time / SECONDS_IN_HOUR);
    let minutes = Math.floor((time % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
    let seconds = time % SECONDS_IN_MINUTE;

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");

    return hours === "00"
      ? `${minutes}:${seconds}`
      : `${hours}:${minutes}:${seconds}`;
  }

  //Recorder functions

  //   async function setupStream() {
  //     try {
  //       stream = await navigator.mediaDevices.getDisplayMedia({
  //         video: true,
  //         audio: true,
  //       });

  //       audio = await navigator.mediaDevices.getUserMedia({
  //         audio: true
  //       })

  //       setupVideoFeedback();
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }

  function handlePause() {
    if (recorder.state === "recording") {
      // pausing video recording timer:-
      clearInterval(intervalId);
      pauseBtn.innerHTML = "&#9654;";
      recorder.pause();
      // recording paused
    } else if (recorder.state === "paused") {
      // resume recording
      recorder.resume();
      pauseBtn.innerHTML = "&#10074;&#10074;";
      // resume the timer button:-
      intervalId = setInterval(() => {
        const hours = Math.floor(duration / 3600000)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((duration % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const seconds = ((duration % 60000) / 1000).toFixed(0).padStart(2, "0");
        meetTimeBtn.innerText = `${hours}:${minutes}:${seconds}`;
        duration += 1000;
      }, 1000);
    }
  }
  function muteAudio() {
    localStream.getAudioTracks().forEach(function (track) {
      track.enabled = !track.enabled;
    });
  }
  function unmuteAudio() {
    localStream.getAudioTracks().forEach(function (track) {
      track.enabled = true;
    });
  }

  //   function setupVideoFeedback() {
  //     if (stream) {
  //       intervalId = setInterval(() => {
  //         const hours = Math.floor(duration / 3600000)
  //           .toString()
  //           .padStart(2, "0");
  //         const minutes = Math.floor((duration % 3600000) / 60000)
  //           .toString()
  //           .padStart(2, "0");
  //         const seconds = ((duration % 60000) / 1000).toFixed(0).padStart(2, "0");
  //         meetTimeBtn.innerText = `${hours}:${minutes}:${seconds}`;
  //         duration += 1000;
  //       }, 1000);
  //     } else {
  //       console.log("No asdasdasdasdasdasdasd available");
  //     }
  //   }

  //   async function startRecording() {
  //     isRecordingVideo = true;
  //     await setupStream();

  //     chrome.runtime.sendMessage({
  //       message: "closePreview",
  //       closeURL: previewUrl,
  //     });

  //     if (stream && audio) {
  //       mixedStream = new MediaStream([
  //         ...stream.getTracks(),
  //         ...audio.getTracks(),
  //       ]);

  //       recorder = new MediaRecorder(mixedStream);
  //       recorder.ondataavailable = handleDataAvailable;
  //       recorder.start(1000);
  //       recorder.onstop = stopRecording;
  //     } else {
  //       recButtonsContainer.innerHTML = "";
  //       recButtonsContainer.appendChild(redDot);
  //       recButtonsContainer.appendChild(recSessionTxt);
  //       isRecordingVideo = false;

  //       console.log("No stream available.");
  //     }
  //   }

  //   function handleStop(e) {
  //     clearInterval(insertBtnInterval);
  //   }

  function handleDataAvailable(e) {
    console.log(chunks);
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
    console.log("shareScreen");
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
              const systemSource =
                context.createMediaStreamSource(screenStream);

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
        recButtonsContainer.innerHTML = "";
        recButtonsContainer.appendChild(redDot);
        recButtonsContainer.appendChild(recSessionTxt);
        isRecordingVideo = false;
      });
  
  }

  function onCombinedStreamAvailable(stream) {
    console.log("onCombinedStreamAvailable");
    localStream = stream;
    if (localStream != null) {
      intervalId = setInterval(() => {
        const hours = Math.floor(duration / 3600000)
          .toString()
          .padStart(2, "0");
        const minutes = Math.floor((duration % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const seconds = ((duration % 60000) / 1000).toFixed(0).padStart(2, "0");
        meetTimeBtn.innerText = `${hours}:${minutes}:${seconds}`;
        duration += 1000;
      }, 970);
      recorder = new MediaRecorder(localStream);
      // recorder.onstop = stopRecording;
      recorder.ondataavailable = handleDataAvailable;

      recorder.start(1500);
      console.log(recorder.state);
    } else {
      console.log("localStream is missing");
    }
  }

  async function stopRecording() {
    // stop timer for video duration calculation:-
    clearInterval(intervalId);
    duration = 0;
    meetTimeBtn.innerText = "00:00:00";
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
    isRecordingVideo = false;
    stop();

    chrome.runtime.sendMessage({ action: "createTab", url: previewUrl });

    chrome.runtime.sendMessage({ type: "attendance", meetRecord: record });
  }
});
