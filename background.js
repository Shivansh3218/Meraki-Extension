let myArray = [];
let popUpId;
let meetWindowId;
let isPopUpOpened = false;
let firstPopUpOpen = true;
let popupArr = [];
// closePopup();

function openPopup() {
  if (!isPopUpOpened) {
    //console.log("inside popupopend, running twice? ");
    chrome.windows.create(
      {
        url: "popup.html",
        type: "popup",
        width: 700,
        height: 600,
      },
      function (window) {
        popUpId = window.id; // Store the ID of the newly opened popup
        //console.log(window.id, "new popup id");
        isPopUpOpened = true;
      }
    );
  } else {
    //console.log("Popup already opened");
  }
}

function closePopup(id) {
  //console.log(popUpId, isPopUpOpened, "inside close popup");
  if (isPopUpOpened) {
    chrome.windows.remove(id, function () {
      if (chrome.runtime.lastError) {
        try {
          //console.log(chrome.runtime.lastError);
        } catch (err) {
          //console.log(err);
        }
      }
    });
  }
  isPopUpOpened = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopUp") {
    //console.log("message recieved open pop up is popup opened?", isPopUpOpened);
    openPopup();
  }

  if (request.action === "popupId") {
    // Access the popup's window object
    popUpId = request.message;
    // if (connect > 1) {
    //   popupArr.push(popUpId);
    //   //console.log(popupArr);
    //   for (let i = 0; i < popupArr.length - 1; i++) {
    //     closePopup(popupArr[i]);
    //   }
    //   popUpId = popupArr[popupArr.length - 1];
    // }
    //console.log(popUpId, "popUpId");
  }
  if (request.action === "getContentTabId") {
    meetWindowId = sender.tab.id;
    //console.log(meetWindowId, "content window id");
    // //console.log(meetWindowId, "meeeting window id");
  }

  if (request.action === "doSomething") {
    // Access the popup's window object
    // //console.log("Hello from popup.js");
    //console.log(meetWindowId, "meet window id in do something")
    try {
      chrome.tabs.sendMessage(meetWindowId, { action: "startRecordingTimer" });
    } catch (err) {
      console.log(err);
    }
  }
  if (request.action === "stopRecording") {
    //console.log("stop recording message to background");
  }
  if (request.message === "closePreview") {
    //console.log("close preview event");
    myArray = [];
    try {
      chrome.tabs.query(
        {
          url: request.closeURL,
        },
        function (tabs) {
          if (tabs.length > 0) {
            //console.log(tabs[0].id, "tabs id of preview");
            chrome.tabs.remove(tabs[0].id, function () {
              if (chrome.runtime.lastError) {
                try {
                } catch (err) {
                  //console.log(err);
                }
                //console.log(chrome.runtime.lastError);
              }
            });
          }
        }
      );
    } catch (er) {
      //console.log(err);
    }
  }
  if (request.action === "createTab") {
    //console.log("message to create tab", popUpId, "current popup id", myArray);
    myArray.map((chunk, index) => {
      const key = `data_chunk_${index}`;
      const chunkData = { chunk, index, totalChunks: myArray.length };
      chrome.storage.local.set({ [key]: chunkData }, () => {
        // //console.log(`Chunk ${index + 1} of ${myArray.length} stored`);
      });
    });
    chrome.tabs.create({ url: request.url });
    // closePopup(popUpId);
    chrome.windows.remove(popUpId, function () {
      if (chrome.runtime.lastError) {
        try {
          //console.log(chrome.runtime.lastError);
        } catch (err) {
          //console.log(err);
        }
      }
    });
  } else if (request.type == "base64Data") {
    myArray.push(request.data);
  } else if (request.type === "attendance") {
    let attendanceRecord = request.meetRecord;
    chrome.storage.local.set({ attendanceRecord }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        // //console.log("Object has been stored in chrome.storage.local");
      }
    });
  }
});

let connect = 0;
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    //console.log("onDisconnect");
    //console.log(meetWindowId, "content window id inside disconnect");
    try {
      chrome.tabs.sendMessage(meetWindowId, { message: "PopupClosed" });
    } catch (err) {
      console.log(err);
    }
    isPopUpOpened = false;
  });
  //console.log("onConnect");
  // connect += 1;
  // //console.log(
  //   connect,
  //   isPopUpOpened,
  //   "connect count",
  //   `is connected with popupid = ${popUpId}`
  // );
  // if(connect>1){
  //   closePopup(popupArr[popupArr[length-2]])
  // }
});
