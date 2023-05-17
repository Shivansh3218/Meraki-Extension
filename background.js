let myArray = [];
let popUpId;
let meetWindowId;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopUp") {
    // Access the popup's window object
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 700,
      height: 600,
    });
  }
  if (request.action === "popupId") {
    // Access the popup's window object
    popUpId = request.message;
    console.log(popUpId, "popUpId");
  }
  if (request.action === "getContentTabId") {
    meetWindowId = sender.tab.id;
    console.log(meetWindowId, "meeeting window id");
    // Send the tab ID back to the content script
  }
  if (request.action === "doSomething") {
    // Access the popup's window object
    console.log("Hello from popup.js");
    function sendMessageToContentScript(message) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
    }

    // Example usage: sending a message with data
    sendMessageToContentScript({
      action: "startRecordingTimer",
      data: "recording-started",
    });
  }
  if (request.message === "closePreview") {
    myArray = [];
    try {
      chrome.tabs.query(
        {
          url: request.closeURL,
        },
        function (tabs) {
          if (tabs.length > 0) {
            chrome.tabs.remove(tabs[0].id, function () {});
          }
        }
      );
    } catch (er) {
      console.log(err);
    }
  }
  if (request.action === "createTab") {
    myArray.map((chunk, index) => {
      const key = `data_chunk_${index}`;
      const chunkData = { chunk, index, totalChunks: myArray.length };
      chrome.storage.local.set({ [key]: chunkData }, () => {
        console.log(`Chunk ${index + 1} of ${myArray.length} stored`);
      });
    });
    chrome.tabs.create({ url: request.url });
    chrome.windows.getAll({ populate: true }, function (windows) {
      windows.forEach(function (window) {
        if (window.tabs[0].url.endsWith("popup.html")) {
          chrome.windows.remove(window.id);
        }
      });
    });
  } else if (request.type == "base64Data") {
    myArray.push(request.data);
  } else if (request.type === "attendance") {
    let attendanceRecord = request.meetRecord;
    chrome.storage.local.set({ attendanceRecord }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Object has been stored in chrome.storage.local");
      }
    });
  }
});

chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    console.log("onDisconnect");
    chrome.tabs.sendMessage(meetWindowId, { message: "PopupClosed" });
  });

  console.log("onConnect");
});
