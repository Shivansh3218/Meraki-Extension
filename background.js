// // Open IndexedDB database
// const openDB = () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("MyDatabase", 1);

//     request.onerror = (event) => {
//       console.error("Error opening IndexedDB", event);
//       reject(event);
//     };

//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       resolve(db);
//     };

//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       db.createObjectStore("MyObjectStore", { keyPath: "id", autoIncrement: true });
//     };
//   });
// };

// // Add data to IndexedDB
// const addToIndexedDB = (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const db = await openDB();
//       const transaction = db.transaction(["MyObjectStore"], "readwrite");
//       const objectStore = transaction.objectStore("MyObjectStore");
//       const request = objectStore.add(data);

//       request.onerror = (event) => {
//         console.error("Error adding data to IndexedDB", event);
//         reject(event);
//       };

//       request.onsuccess = (event) => {
//         console.log("Data added to IndexedDB", event);
//         resolve(event);
//       };
//     } catch (error) {
//       console.error("Error adding data to IndexedDB", error);
//       reject(error);
//     }
//   });
// };

let myArray = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
  } else if (request.type == "base64Data") {
    myArray.push(request.data);
  } else if (request.type === "attendance") {
    // console.log(request.meetRecord)
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
