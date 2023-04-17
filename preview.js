let loadingScreen = document.querySelector("#loading-screen");
let buttonsContainer = document.querySelector(".buttons");
// downloadBtn.addEventListener("click", getData);
// getData()
let resultArr = [];
let totalSize = 1000;

function getChromeLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}
async function getData() {
  console.log("functiopn is running");
  console.log("for loop");
  let resultSize = 0;

  let resultVar = await getChromeLocalStorage([`data_chunk_0`]);
  resultSize = resultVar.data_chunk_0.totalChunks;
  // console.log(resultVar, resultSize);

  for (let i = 0; i < resultSize; i++) {
    let randomVar = await getChromeLocalStorage([`data_chunk_${i}`]);
    resultArr.push(randomVar[`data_chunk_${i}`].chunk);
    console.log(randomVar, "Video Data");
  }
  console.log({ resultArr });

  // Function to convert base64 to Blob
  function base64ToBlob(base64String, mimeType) {
    const binaryString = atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeType });
  }

  // Function to concatenate Blobs
  function concatenateBlobs(blobsArray) {
    return new Blob(blobsArray, { type: blobsArray[0].type });
  }

  // Convert base64 strings to Blobs
  const blobsArray = resultArr.map((base64String) =>
    base64ToBlob(base64String, "video/mp4")
  );

  // Concatenate Blobs into a single video Blob
  const videoBlob = concatenateBlobs(blobsArray);

  // Create a video element
  const videoElement = document.querySelector("#recorded-video");
  videoElement.classList.add("video-player");
  videoElement.src = URL.createObjectURL(videoBlob);
  let loader = document.querySelector("#loader");
  loader.classList.add("none");
  videoElement.controls = true;
  videoElement.play();

  const downloadButton = document.querySelector("#download-recording");

  downloadButton.addEventListener("click", () => {
    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(videoBlob);
    downloadLink.download = "video.mp4";
    document.body.appendChild(downloadLink);

    // Trigger download
    downloadLink.click();

    // Clean up
    downloadLink.remove();
  });
  chrome.storage.local.clear(function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log("chrome.storage.local cleared successfully.");
    }
  });
}

chrome.storage.local.get("attendanceRecord", (result) => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  } else {
    const attendance = result.attendanceRecord;

    let attendeesNames = attendance.attendee_names;
    let meetingID = attendance.meet_code;
    let attendedDurationInSec = attendance.attendedDurationInSec;
    let meetingTime = attendance.meeting_time;
    let meet_duration = attendance.meet_duration;
    let date = new Date();
    let extractedDate = new Date(date);
    let startTimeString = attendance.startMeetTime;
    let dateString = date.toString().slice(4, 15);
    let timeString = extractedDate.toLocaleTimeString();
    let meetingIDSpan = document.querySelector("#meetingID");
    let meetingDateSpan = document.querySelector("#meetingDate");
    let meetingTimeSpan = document.querySelector("#meetingTime");
    let totalStudentsSpan = document.querySelector("#totalStudents");
    let totalMeetingDurationSpan = document.querySelector(
      "#totalMeetingDurationSpan"
    );

    totalMeetingDurationSpan.innerText += `: ${meet_duration}`;
    totalStudentsSpan.innerText += `: ${JSON.parse(attendeesNames).length}`;
    meetingIDSpan.innerText += `: ${meetingID}`;
    meetingDateSpan.innerText += `${dateString}`;
    meetingTimeSpan.innerText += `${startTimeString} to ${timeString}`;

    console.log(attendance);

    let data = [
      {
        attendedDurationInSec: JSON.parse(attendedDurationInSec),
        attendee_names: JSON.parse(attendeesNames),
        meet_duration: meet_duration,
        meeting_time: meetingTime,
        meeting_title: meetingID,
      },
    ];

    function convertSecondsToTime(seconds) {
      // Calculate hours, minutes, and remaining seconds
      const hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      const minutes = Math.floor(seconds / 60);
      seconds %= 60;

      // Construct the time string
      const timeString = `${hours} hours, ${minutes} minutes, ${
        seconds - 1
      } seconds`;

      return timeString;
    }

    const table = document.createElement("table");

    const headerRow = document.createElement("tr");

    const attendeeHeader = document.createElement("th");
    attendeeHeader.textContent = "Attendee Names";
    headerRow.appendChild(attendeeHeader);

    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Total Meeting duration";
    headerRow.appendChild(nameHeader);

    const meetDurationHeader = document.createElement("th");
    meetDurationHeader.textContent = "Attended Meeting duration";
    headerRow.appendChild(meetDurationHeader);

    // const idHeader = document.createElement("th");
    // idHeader.textContent = "Meeting id";
    // headerRow.appendChild(idHeader);

    table.appendChild(headerRow);

    const dataRow = document.createElement("tr");
    table.appendChild(dataRow);

    const nameCell = document.createElement("td");
    nameCell.innerHTML = data[0].attendee_names
      .map((name, index) => {
        if (index === 0) return `<strong>${name} Teacher</strong>`;
        else return `${name}`;
      })
      .join("");
    dataRow.appendChild(nameCell);

    const duration_cell = document.createElement("td");
    duration_cell.textContent = data[0].meet_duration;
    dataRow.appendChild(duration_cell);

    const attendanceDurationCell = document.createElement("td");
    attendanceDurationCell.innerHTML = data[0].attendedDurationInSec
      .map((time) => `${convertSecondsToTime(time)}`)
      .join("");
    dataRow.appendChild(attendanceDurationCell);

    // const title_cell = document.createElement("td");
    // title_cell.textContent = data[0].meeting_title;
    // dataRow.appendChild(title_cell);

    // Add the data row to the table

    // loadingScreen.classList.add("none");
    document.body.appendChild(table);

    document
      .querySelector("#download-attendance")
      .addEventListener("click", attendanceDownload);

    function attendanceDownload() {
      const html = table.outerHTML;
      const Datablob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(Datablob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Attendance-Table.html";
      document.body.appendChild(link);
      link.click();
    }
    getData();
  }
});
