let loadingScreen = document.querySelector("#loading-screen");
let buttonsContainer = document.querySelector(".buttons");
let downloadAttendanceBtn  =  document.querySelector("#download-attendance")
let downloadButton =  document.querySelector("#download-recording");
let meetingIDSpan = document.querySelector("#meetingID");
let meetingTitleSpan = document.querySelector("#meetingTitle");
let meetingDateSpan = document.querySelector("#meetingDate");
let meetingTimeSpan = document.querySelector("#meetingTime");
let totalStudentsSpan = document.querySelector("#totalStudents");
let totalMeetingDurationSpan = document.querySelector(
  "#totalMeetingDurationSpan"
);
// downloadBtn.addEventListener("click", getData);
// getData()
let resultArr = [];
let totalSize = 1000;
let arrayBufferVideo = null;

let accessKeyId = "";
let secretAccessKey = "";
let sessionToken = "";
let bucketName = "";
let videoObj = null;
let videoName = "";
let videoBlob = null;
let isMerakiCall;

let isUploading = false;
const modal = document.getElementById("myModal");

let uploadPara = document.querySelector("#upload-para");
let submitBtn = document.querySelector("#aws-upload");

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
  let resultSize = 0;

  let resultVar = await getChromeLocalStorage([`data_chunk_0`]);
  resultSize = resultVar.data_chunk_0.totalChunks;
  console.log(resultVar, resultSize);

  for (let i = 0; i < resultSize; i++) {
    let randomVar = await getChromeLocalStorage([`data_chunk_${i}`]);
    resultArr.push(randomVar[`data_chunk_${i}`].chunk);
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

  console.log(blobsArray);
  // Concatenate Blobs into a single video Blob
  videoBlob = concatenateBlobs(blobsArray);

  console.log(videoBlob);

  // Define a function that converts a Blob to an ArrayBuffer
  function blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("loadend", () => {
        resolve(reader.result);
      });
      reader.addEventListener("error", () => {
        reject(reader.error);
      });
      reader.readAsArrayBuffer(videoBlob);
    });
  }

  // Use the function to convert the Blob to an ArrayBuffer
  blobToArrayBuffer(videoBlob)
    .then((arrayBuffer) => {
      // Do something with the ArrayBuffer
      arrayBufferVideo = arrayBuffer;
      console.log(
        "Converted Blob to ArrayBuffer:",
        arrayBuffer,
        arrayBufferVideo
      );
    })
    .catch((error) => {
      console.error("Error converting Blob to ArrayBuffer:", error);
    });

  // Create a video element
  const videoElement = document.querySelector("#recorded-video");
  videoElement.classList.add("video-player");
  videoElement.src = URL.createObjectURL(videoBlob);
  let loader = document.querySelector("#loader");
  loader.classList.add("none");
  videoElement.classList.remove("none")


  downloadButton.classList.remove("pointerNone")

  downloadButton.addEventListener("click", () => {
    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(videoBlob);
    downloadLink.download = "video.mp4";
    document.body.appendChild(downloadLink);

    // Trigger download
    downloadLink.click();

    // Clean up
    resultArr = [];
    downloadLink.remove();
  });
  if (isMerakiCall === true) {
    let data = {
      attendies_data: JSON.stringify(attendanceRecord),
    };
    submitBtn.classList.remove("pointerNone");
    submitBtn.addEventListener("click", uploadVideo);
    
    setTimeout(() => {
      fetch("https://merd-api.merakilearn.org/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }, 2000);
  } else if (isMerakiCall === false) {
    submitBtn.addEventListener("click", () => {
      alert("This feature is accessible to the meraki server based classes only");
    });
  } else if (isMerakiCall === null) {
    submitBtn.style.display = "none";
  }

  chrome.storage.local.clear(function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log("chrome.storage.local cleared successfully.");
      chrome.storage.local.get("attendanceRecord", (result) => {
        console.log(result , "inside clear ")
      })
      
    }
  });
}

chrome.storage.local.get("attendanceRecord", (result) => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
  } else {
    const attendance = result.attendanceRecord;
    console.log(attendance, "Attendance record")

    isMerakiCall = attendance.isMerakiCall;
    console.log(isMerakiCall, "is a meraki call");
    let gmeetTitle = attendance.meeting_title
    let attendeesNames = attendance.attendee_names;
    let meetingID = attendance.meet_code;
    let attendedDurationInSec = attendance.attendedDurationInSec;
    let meetingTime = attendance.meeting_time;
    let meet_duration = attendance.meet_duration;
    let studentsJoiningTime = attendance.studentsJoiningTime;
    let lastSeenAt = attendance.lastSeenAt
    let date = new Date();
    let extractedDate = new Date(date);
    let startTimeString = timeConverter(attendance.startMeetTime);
    let dateString = date.toString().slice(4, 15);
    let timeString = timeConverter(extractedDate.toLocaleTimeString());


    videoName = result.attendanceRecord.meeting_title;
    totalMeetingDurationSpan.innerText += `: ${meet_duration}`;
    totalStudentsSpan.innerText += `: ${JSON.parse(attendeesNames).length}`;
    meetingTitleSpan.innerText += `: ${gmeetTitle}`;
    meetingIDSpan.innerText += `: ${meetingID}`;
    meetingDateSpan.innerText += `: ${dateString}`;
    meetingTimeSpan.innerText += `${startTimeString} to ${timeString}`;

    // console.log(attendance);

    let data = {
      attendedDurationInSec: JSON.parse(attendedDurationInSec),
      attendee_names: JSON.parse(attendeesNames),
      meet_duration: meet_duration,
      meeting_time: meetingTime,
      meeting_title: meetingID,
      studentsJoiningTime:JSON.parse(studentsJoiningTime),
      lastSeenAt:JSON.parse(lastSeenAt)
    };
    // console.log(data);

    function timeConverter(time) {
      let str = time.split("");
      for (let i = 0; i < str.length; i++) {
        if (isNaN(str[0]) === false && isNaN(str[1]) === true) {
          str.unshift("0");
        }
      }
      str = str.join("");
      return str.substring(0, 5) + str.substring(8);
    }

    function convertSecondsToTime(seconds) {
      // Calculate hours, minutes, and remaining seconds
      let hours = Math.floor(seconds / 3600);
      seconds %= 3600;
      let minutes = Math.floor(seconds / 60);
      seconds %= 60;
      seconds > 1 ? (seconds = seconds - 1) : seconds;
      // Construct the time string
      if (minutes <= 9) {
        minutes = "0" + minutes;
      }
      if (hours <= 9) {
        hours = "0" + hours;
      }
      if (seconds <= 9) {
        seconds = "0" + seconds;
      }
      const timeString =
        hours === "00"
          ? `${minutes}:${seconds}`
          : `${hours}:${minutes}:${seconds}`;

      return timeString;
    }
console.log(data.studentsJoiningTime , "Student joining time")
    const tableBody = document.querySelector("#myTable");
    for (let i = 0; i < Math.max(data.attendee_names.length, 1); i++) {
      const row = document.createElement("tr");
      const array1Cell = document.createElement("td");
      array1Cell.textContent = data.attendee_names[i] || "";
      row.appendChild(array1Cell);

      const studentSeenAt = document.createElement("td");
      studentSeenAt.textContent =
       data.studentsJoiningTime[i] || "";
      row.appendChild(studentSeenAt);

       
      const studentLastSeenAt = document.createElement("td");
      studentLastSeenAt.textContent =
       data.lastSeenAt[i] || "";
      row.appendChild(studentLastSeenAt);

      const meetDuration = document.createElement("td");
      meetDuration.textContent = i === 0 ? meet_duration : meet_duration;
      row.appendChild(meetDuration);
      // Create a cell for array2 data
      const attendeDuration = document.createElement("td");
      attendeDuration.textContent =
        convertSecondsToTime(data.attendedDurationInSec[i]) || "";
      row.appendChild(attendeDuration);
      // Append the row to the table body
      tableBody.appendChild(row);
      

      // Append the row to the table body
      tableBody.appendChild(row);
      document.querySelector("#tableLoader").classList.add("none");
      tableBody.classList.remove("none");

    downloadAttendanceBtn.classList.remove("pointerNone");
    }

    document
      .querySelector("#download-attendance")
      .addEventListener("click", attendanceDownload);

    function attendanceDownload() {
      var csv = "";
      for (var i = 0; i < tableBody.rows.length; i++) {
        var row = tableBody.rows[i];
        for (var j = 0; j < row.cells.length; j++) {
          var cell = row.cells[j].innerText.replace(/"/g, '""');
          if (j > 0) {
            csv += ",";
          }
          csv += '"' + cell + '"';
        }
        csv += "\n";
      }

      // Create a temporary anchor element and trigger the download
      var link = document.createElement("a");
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
      );
      link.setAttribute("download", "table.csv");
      link.click();
    }
    getData();
  }
});

// fetch(
//   "https://merd-api.merakilearn.org/attendance/createdTempCredentialsForUploadVideo",
//   {
//     method: "POST",
//   }
// )
//   .then((res) => console.log(res.json()))
//   .then((data) => {
//     accessKeyId = data.Credentials.AccessKeyId;
//     secretAccessKey = data.Credentials.SecretAccessKey;
//     sessionToken = data.Credentials.SessionToken;
//     bucketName = data.Bucket;
//   });

function uploadVideo(event) {
  event.preventDefault(); // prevent form submission
  isUploading = true;
  modal.style.display = "block";
  window.onbeforeunload = (e) => {
    e.preventDefault();
    return "";
  };

  let randomNum = Math.floor(Math.random() * 100000000000000);

  // configure the AWS SDK with your credentials
  AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    sessionToken: sessionToken,
    region: "ap-south",
  });
  console.log(arrayBufferVideo, {
    file: arrayBufferVideo,
    bucketName: bucketName,
    Key: accessKeyId,
    secretAccessKey: secretAccessKey,
    sessionToken: sessionToken,
  });
  // create a new S3 instance
  const s3 = new AWS.S3();

  // create the S3 upload parameters
  const params = {
    Bucket: bucketName,
    Key: `videos/${videoName + randomNum}`,
    Body: arrayBufferVideo,
    ContentType: "video/mp4",
    ACL: "public-read", // set the ACL to allow public read access
  };

  // upload the video to S3 bucket
  s3.upload(params, function (err, data) {
    if (err) {
      console.error(err);
      alert("Error uploading video to S3 bucket");
      isUploading = false;
      modal.style.display = "none";
      window.onbeforeunload = null;
    } else {
      console.log("Video uploaded successfully:", data.Location);
      alert("Video uploaded successfully");
      isUploading = false;
      modal.style.display = "none";
      window.onbeforeunload = null;
    }
  }).on("httpUploadProgress", function (progress) {
    const percent = Math.round((progress.loaded / progress.total) * 100);
    uploadPara.innerHTML = ` ${percent}%`;
    console.log(`Uploading: ${percent}%`);
  });
}
