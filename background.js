chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureTab") {
      chrome.tabs.captureVisibleTab(null, {format: 'png'}, dataUrl => { // Capture and send the current tab image as png file.
        sendResponse({dataUrl: dataUrl});
      });
      return true;
    }
});