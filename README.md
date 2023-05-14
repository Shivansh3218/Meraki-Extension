# Meraki Extension Details for Developers
## About Extension
<b>The Meraki Extension is designed to provide the facility to record meeting attendance and recordings during Google Meet sessions. It allows users to save the recordings for future use or upload them as needed.</b>

## How to Use
### Follow these steps to use the Meraki Extension:

Clone the repository: git clone https://github.com/Shivansh3218/Meraki-Extension.git <br/>
Open the Manage extension tab in your Chrome browser and enable developer mode.<br/>
Click on "Load extension" and select the cloned folder.<br/>
Join any Google Meet session and start recording the meeting attendance and video using the extension.<br/>
Click on "Stop" to finish recording and obtain the recorded video and attendance data, which are ready to download.
## Page Structure
### The Meraki Extension consists of the following files:

<b>Content.js</b>: This file contains all the functions that run during a Google Meet session.<br/>
<b>Background.js</b>: This file includes background operations of the extension, including saving video data in Chrome storage.<br/>
<b>Preview.js</b>: This file contains the code for the preview page, where the recorded video and attendance data are received.<br/>
<b>Manifest.json</b>: This file contains the various requirements and permissions for the extension, including where it can run.<br/><br/>
## Functions in Content.js
### The Content.js file includes the following functions:

<b>shareScreen</b>: To start recording the video of the meeting.<br/>
<b>merakiClassChecker</b>: To check if the class is coming from the Meraki platform or any external meeting by matching the URL with the Meraki class link.<br/>
<b>start</b>: To start recording the attendance of members using the extension.<br/>
<b>stop</b>: To stop recording the attendance.<br/>
<b>stopRecording</b>: To stop the video recording.<br/>
<b>handleDataAvailable</b>: To push the chunks of the video blob into an array and send a message to the background file for storing in chrome.storage.local.<br/>
<b>toTimeFormat</b>: To convert the time from seconds to hours, minutes, and seconds format.<br/>
<b>insertButton</b>: To add the recording button to the UI of the Google Meet page.<br/>
<b>blob2base64</b>: To convert the video blob to base64 format for sending to the preview page.<br/><br/><br/>
## JS Concepts Implemented
### The Meraki Extension utilizes the following JavaScript concepts:

<b>Maps and Sets</b>: Used to prevent repetition of attendance for a particular member.<br/>
<b>Media Recorder</b>: Used to record a specified media stream during the meeting (in the startRecording function).<br/>
<b>getDisplayMedia</b>: To capture the user's screen.<br/>
<b>getUserMedia</b>: To capture the user's microphone for audio recording.<br/>
<b>chrome.runtime.sendMessage</b>: To send the video and attendance data to the next page.<br/>
<b>chrome.tabs.create</b>: To open and navigate to the preview page in a new tab.<br/>
<b>FileReader</b>: To convert the base64 file to video on the preview page.<br/>
<b>AWS S3</b>: To upload the video into s3 bucket.<br/>
<b>chrome.storage.local</b>: To store and retrieve data in the extension's local storage for persisting it on page refreshes.<br/>
<br/>
</br>
Points To Remember:-
1. This extension uses chrome.localStorage to store and transfer video and attendance data
2. The extension might take 1 or 2 seconds load thus your attendance might start 1 secs late.
3. Remember to download the video and attendance data before closing the preview page after stopping the meeting.
4. The stop button also causes the Google Meet to end.

That's it! The Meraki Extension is designed to help developers easily record meeting attendance and recordings during Google Meet sessions, and it includes various JavaScript concepts and functionalities for smooth operation. Feel free to customize and modify the extension to suit your specific requirements. Happy coding!
