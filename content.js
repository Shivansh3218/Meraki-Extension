// window.onload = () => {
// };

setTimeout(() => {
  chrome.runtime.sendMessage({ action: "getContentTabId" });
}, 1000);

let videoRecordingEnabled = false;
let intervalId;
const previewPageUrl = chrome.runtime.getURL("preview.html");

//attendance tracker variables

let studentDetails = new Map();
let studentsNameSet = new Set();
let ui_buttons;
let totalClassDuration = 1;
let goingToStop = 0;
let isAttendanceWorking = false;
let buttonClickInd = 0;
let startTime;
let flag = false; // make if false to block non-meraki classes
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
  let studentsJoiningTime = [];
  let lastSeenAt = [];
let mapKeys = studentDetails.keys();

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
recButtonsContainer.style.marginLeft = "30px";

let pauseBtn = document.createElement("button");
pauseBtn.id = "pauseBtn";
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

// "duration" variable - to calculate duration of video recording:-
let duration = 0;

recButtonsContainer.addEventListener("click", () => {
  if (videoRecordingEnabled == false) {
    StartVideoRecording();
  }
});
pauseBtn.addEventListener("click", () => SendPauseMessage());

stopBtn.addEventListener("click", (event) => {
  let endButton = document.querySelector(".Gt6sbf");
  endButton.click();
  setTimeout(() => {
    location.reload();
  }, 2000);
  event.stopPropagation();
  if (videoRecordingEnabled == true) {
    stopVideoRecording();
    recButtonsContainer.innerHTML = "";
    recButtonsContainer.appendChild(redDot);
    recButtonsContainer.appendChild(recSessionTxt);
  }
});

function insertRecButton() {
  try {
    if (document.getElementsByClassName("VfPpkd-kBDsod NtU4hc").length > 0) {
      ui_buttons = document.getElementsByClassName("VfPpkd-kBDsod NtU4hc");
      document
        .getElementsByClassName("lefKC")[0]
        .appendChild(recButtonsContainer);
    }
  } catch (error) {
  }
}

let muteVideoRecording = false;

let insertingmute = setInterval(() => {
  try {
    if (
      document.getElementsByClassName(
        "U26fgb JRY2Pb mUbCce kpROve yBiuPb y1zVCf HNeRed M9Bg4d"
      )[0] !== null
    ) {
      let mutee = document.getElementsByClassName(
        "U26fgb JRY2Pb mUbCce kpROve yBiuPb y1zVCf HNeRed M9Bg4d"
      )[0];

      mutee.addEventListener("click", () => {
        muteVideoRecording = !muteVideoRecording;
      });

      window.clearInterval(insertingmute);
    }
  } catch (err) {}
}, 500);

let insideMuteInterval = setInterval(() => {
  try {
    if (
      document.getElementsByClassName(
        "VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN JxICCe Uulb3c"
      )[0] !== null
    ) {
      let insideMute = document.getElementsByClassName(
        "VfPpkd-Bz112c-LgbsSe yHy1rc eT1oJ tWDL4c uaILN JxICCe Uulb3c"
      )[0];

      insideMute.addEventListener("click", () => {
        muteVideoRecording = !muteVideoRecording;
        if (muteVideoRecording === true) {
          handleMute();
        } else {
          handleUnMute();
        }
      });
      window.clearInterval(insideMuteInterval);
    }
  } catch (err) {
  }
}, 500);

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
          stop();
        }
      });
    clearInterval(tryInsertingButton);
  } catch (error) {}
}

async function merakiClassChecker(url) {

  const data = await fetch("https://dev-api.navgurukul.org/classes", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5Nzc2IiwiZW1haWwiOiJzaGl2YW5zaEBuYXZndXJ1a3VsLm9yZyIsImlhdCI6MTY3OTAzNTE4OCwiZXhwIjoxNzEwNTkyNzg4fQ.Ayzgfkk9k6PE_kaybCAznNeEXmF01zp7pLa5zOQ0f4k`,
      "version-code": 99,
    },
  });
  let parsed_data = await data.json();
  for (let ind = 0; ind < parsed_data.length; ind++) {
    if (parsed_data[ind].meet_link === url) {
      flag = true;
      break;
    }
  }
  return flag;
}

let meet_url = window.location.href.slice(0, 36);
const checked_url = merakiClassChecker(meet_url).then((res) =>
  console.log(res, "checked url promise", flag, "returned value")
);

setInterval(insertButton, 1000);

async function start() {
  startTime = new Date();
  startAttendanceTracker = setInterval(attendanceTracker, 1000);
}

// to get the meeting name/title
const getMeetingName = () => {
  const elm = document.querySelector("[data-meeting-title]");
  if (elm && elm.dataset.meetingTitle) {
    return elm.dataset.meetingTitle;
  } else {
    return document.title;
  }
};

let stop = (STOP = () => {
  clearInterval(startAttendanceTracker);
  // clearInterval(lastSeenInterval)

  let mapKeys = studentDetails.keys();
  for (i = 0; i < studentDetails.size; i++) {
    let studentName = mapKeys.next().value;
    sortedtstudentsNameSet.push(studentName);
  }
  sortedtstudentsNameSet.sort();
  for (studentName of sortedtstudentsNameSet) {
    let data = studentDetails.get(studentName);
    studentsAttendedDuration.push(data[0].toString());
    studentsJoiningTime.push(data[2].toString())
    lastSeenAt.push(data[3].toString())
  }
  const end_time = new Date();

  record = {
    startMeetTime: startMeetTime,
    attendee_names: JSON.stringify(sortedtstudentsNameSet),
    attendedDurationInSec: JSON.stringify(studentsAttendedDuration),
    meet_code: meetingCode,
    meeting_title: getMeetingName().replace("Meet - ", ""),
    meeting_time: startTime.toISOString(),
    isMerakiCall: flag,
    studentsJoiningTime: JSON.stringify(studentsJoiningTime),
    lastSeenAt: JSON.stringify(lastSeenAt)
  };

  record.meet_duration = meetingDuration;

  console.log(record, "The meeting Record")
});

function attendanceTracker() {
  console.log(studentDetails, "Student Details")
  // console.log(studentsNameSet, "Student name set")
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
        let startMeetingTime;
        let lastSeenAt = new Date().toLocaleTimeString()
        if(startMeetingTime==null){
          startMeetingTime = new Date().toLocaleTimeString()
        }
          if(isAttendanceWorking){
          let lastSeenInterval =   setInterval(()=>{
              
          lastSeenAt = new Date().toLocaleTimeString()
          
          data[3]= lastSeenAt
            },1000)
          }

        data.push(currStatus);
        data.push(joiningTime)
        data.push(startMeetingTime);
        data.push(lastSeenAt)
        studentDetails.set(studentName, data);
        console.log(isAttendanceWorking, "is attendace working")
        console.log(data, "Student Data")
      }
    }
    if (studentsNameSet.size - 1 == -1) {
      goingToStop += 1;
    } else {
      meetingDuration = toTimeFormat(totalClassDuration);
      totalClassDuration += 1;
      goingToStop = 0;
    }
    if (goingToStop == 2) {
      isAttendanceWorking = false;
      goingToStop = 0;
      stop();
    }
  } else {
    try {
      ui_buttons[1].click();
      buttonClickInd += 1;
      goingToStop = 0;
    } catch (error) {
      goingToStop += 1;
      if (goingToStop == 2) {
        isAttendanceWorking = false;
        goingToStop = 0;
        stop();
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

let recorderWorking = true;

function SendPauseMessage(e) {
  chrome.runtime.sendMessage({ action: "pauseVideo" });
  if (recorderWorking === true) {
    // pausing video recording timer:-
    clearInterval(intervalId);
    pauseBtn.innerHTML = "&#9654;";
    recorderWorking = false;
    // recording paused
  } else if (recorderWorking === false) {
    // resume recording
    pauseBtn.innerHTML = "&#10074;&#10074;";
    recorderWorking = true;
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

//mute and unmute functions

function handleMute() {
  if (videoRecordingEnabled === true) {
    chrome.runtime.sendMessage({ action: "muteAudio", message: true });
  } else {
  }
}
function handleUnMute() {
  if (videoRecordingEnabled === true) {
    chrome.runtime.sendMessage({ action: "unmuteAudio", message: false });
  }
}

function StartVideoRecording() {
  chrome.runtime.sendMessage({
    message: "closePreview",
    closeURL: previewPageUrl,
  });
  if (videoRecordingEnabled === false) {
    chrome.runtime.sendMessage({
      action: "openPopUp",
      message: "firstOpenPopUp",
    });
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: "Mute-audio",
        message: muteVideoRecording,
      });
    }, 500);

    videoRecordingEnabled = true;
  }
}

async function stopVideoRecording() {
  window.onbeforeunload = null;
  // stop timer for video duration calculation:-
  clearInterval(intervalId);
  duration = 0;
  meetTimeBtn.innerText = "00:00:00";
  videoRecordingEnabled = false;
  stop();

  chrome.runtime.sendMessage({ action: "stopRecording" });
  chrome.runtime.sendMessage({ type: "attendance", meetRecord: record });

  let data = {
    attendies_data: JSON.stringify(record),
  };
  if (flag === true) {
  }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "startRecordingTimer") {
    duration = 0;
    clearInterval(intervalId);
    meetTimeBtn.innerText = "00:00:00";
    recButtonsContainer.innerHTML = "";
    recButtonsContainer.appendChild(redDot);
    recButtonsContainer.appendChild(meetTimeBtn);
    recButtonsContainer.appendChild(pauseBtn);
    recButtonsContainer.appendChild(stopBtn);
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
  if (message.message === "PopupClosed") {
    recButtonsContainer.innerHTML = "";
    recButtonsContainer.appendChild(redDot);
    recButtonsContainer.appendChild(recSessionTxt);
    videoRecordingEnabled = false;
  }
  if (message.message === "closePreviewFirst") {
    alert("Please close the preview page first to record this meeting");
  }
});

window.onbeforeunload = null;
