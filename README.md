# Meraki Extension Details for Developers
## About Extension
The Meraki Extension is designed to provide the facility to record meeting attendance and recordings during Google Meet sessions. It allows users to save the recordings for future use or upload them as needed.

## How to Use
### Follow these steps to use the Meraki Extension:

Clone the repository: git clone https://github.com/Shivansh3218/Screen-recorder-extension.git <br/>
Open the Manage extension tab in your Chrome browser and enable developer mode.<br/>
Click on "Load extension" and select the cloned folder.<br/>
Join any Google Meet session and start recording the meeting attendance and video using the extension.<br/>
Click on "Stop" to finish recording and obtain the recorded video and attendance data, which are ready to download.
## Page Structure
### The Meraki Extension consists of the following files:

Content.js: This file contains all the functions that run during a Google Meet session.<br/>
Background.js: This file includes background operations of the extension, including saving video data in Chrome storage.<br/>
Preview.js: This file contains the code for the preview page, where the recorded video and attendance data are received.<br/>
Manifest.json: This file contains the various requirements and permissions for the extension, including where it can run.<br/><br/>
## Functions in Content.js
### The Content.js file includes the following functions:

startRecording: To start recording the video of the meeting.<br/>
merakiClassChecker: To check if the class is coming from the Meraki platform or any external meeting by matching the URL with the Meraki class link.<br/>
start: To start recording the attendance of members using the extension.<br/>
stop: To stop recording the attendance.<br/>
stopRecording: To stop the video recording.<br/>
handleDataAvailable: To push the chunks of the video blob into an array and send a message to the background file for storing in chrome.storage.local.<br/>
toTimeFormat: To convert the time from seconds to hours, minutes, and seconds format.<br/>
insertButton: To add the recording button to the UI of the Google Meet page.<br/>
blob2base64: To convert the video blob to base64 format for sending to the preview page.<br/><br/><br/>
## JS Concepts Implemented
### The Meraki Extension utilizes the following JavaScript concepts:

Maps and Sets: Used to prevent repetition of attendance for a particular member.<br/>
Media Recorder: Used to record a specified media stream during the meeting (in the startRecording function).<br/>
getDisplayMedia: To capture the user's screen.<br/>
getUserMedia: To capture the user's microphone for audio recording.<br/>
chrome.runtime.sendMessage: To send the video and attendance data to the next page.<br/>
chrome.tabs.create: To open and navigate to the preview page in a new tab.<br/>
FileReader: To convert the base64 file to video on the preview page.<br/>
chrome.storage.local: To store and retrieve data in the extension's local storage for persisting it on page refreshes.<br/>
That's it! The Meraki Extension is designed to help developers easily record meeting attendance and recordings during Google Meet sessions, and it includes various JavaScript concepts and functionalities for smooth operation. Feel free to customize and modify the extension to suit your specific requirements. Happy coding!
