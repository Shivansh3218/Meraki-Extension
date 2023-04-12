let downloadBtn = document.querySelector("#video-download");
// document.querySelector("#btnExport").addEventListener("click", clearStorage);

downloadBtn.addEventListener("click", getData);
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
    console.log(randomVar, "asodjhasiujdbhiaushbdiouhbasiudghbasuoihdous");
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
  const videoElement = document.createElement("video");
  videoElement.src = URL.createObjectURL(videoBlob);

  videoElement.controls = true; // Set controls attribute to true

  // Append the video element to the DOM
  document.body.appendChild(videoElement);

  // Play the video
  videoElement.play();

  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download Video";
  document.body.appendChild(downloadButton);

  // Add click event listener to download button
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

// function clearStorage() {
//   chrome.storage.local.clear(function () {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError);
//     } else {
//       console.log("chrome.storage.local cleared successfully.");
//     }
//   });
// }

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
      const timeString = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    
      return timeString;
    }
    
    const table = document.createElement("table");

    const headerRow = document.createElement("tr");

    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Total Meeting duration";
    headerRow.appendChild(nameHeader);

    const idHeader = document.createElement("th");
    idHeader.textContent = "Meeting id";
    headerRow.appendChild(idHeader);

    const attendeeHeader = document.createElement("th");
    attendeeHeader.textContent = "attendee_names";
    headerRow.appendChild(attendeeHeader);

    const meetDurationHeader = document.createElement("th");
    meetDurationHeader.textContent = "attendedDurationInSec";
    headerRow.appendChild(meetDurationHeader);

    table.appendChild(headerRow);

    const dataRow = document.createElement("tr");
    const duration_cell = document.createElement("td");
    duration_cell.textContent = data[0].meet_duration;
    dataRow.appendChild(duration_cell);

    const title_cell = document.createElement("td");
    title_cell.textContent = data[0].meeting_title;
    dataRow.appendChild(title_cell);

    const nameCell = document.createElement("td");
    nameCell.innerHTML = data[0].attendee_names
      .map((skill) => `<li>${skill}</li>`)
      .join("");
    dataRow.appendChild(nameCell);

    const attendanceDurationCell = document.createElement("td");
    attendanceDurationCell.innerHTML = data[0].attendedDurationInSec
      .map((time) => `<li>${convertSecondsToTime(time)}</li>`)
      .join("");
    dataRow.appendChild(attendanceDurationCell);

    // Add the data row to the table
    table.appendChild(dataRow);

    document.body.appendChild(table);
    document
      .querySelector("#btnExport")
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
  }
});
