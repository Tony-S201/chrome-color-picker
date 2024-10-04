document.getElementById('togglePicker').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { // Use chrome API to get the current tab.
      chrome.tabs.sendMessage(tabs[0].id, {action: "togglePicker"}); // Open the color picker popup from the current tab.
    });
    window.close();
});