(function() {
    console.log("Color Picker Lite is loading...")
    let isPickerActive = false;
    let cachedDataUrl = null;
    let lastCaptureTime = 0;
    const captureInterval = 50; // Min interval between captures (ms).
  
    // Create element to display the current color.
    const colorDisplay = document.createElement('div');
    colorDisplay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px;
      background: white;
      border-radius: 30px;
      border: 8px solid black;
      font-family: Arial, sans-serif;
      font-weight: 800;
      z-index: 10000;
      display: none;
    `;
    document.body.appendChild(colorDisplay);

    // Convert RGB to HEX.
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
    // Capture color.
    function captureColor(event) {
        const now = Date.now();
        if (now - lastCaptureTime < captureInterval) {
          return;
        }
        lastCaptureTime = now;
    
        if (!cachedDataUrl) {
          chrome.runtime.sendMessage({action: "captureTab"}, response => {
            cachedDataUrl = response.dataUrl; // Get the img url from background script.
            getPixelColor(event);
          });
        } else {
          getPixelColor(event);
        }
    }

    // Capture pixel color.
    function getPixelColor(event) {
        const img = new Image();
        img.onload = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
          
          const imageData = ctx.getImageData(event.clientX, event.clientY, 1, 1);
          const [r, g, b] = imageData.data;
    
          const hexColor = rgbToHex(r, g, b);
          colorDisplay.innerHTML = `
          Color: ${hexColor}<br>
          RGB: ${r} ${g} ${b}
          `;
          colorDisplay.style.borderColor = hexColor;
        };
        img.src = cachedDataUrl; // Assign image from background script url.
    }

    // Enable or disable the color picker.
    function togglePicker() {
        isPickerActive = !isPickerActive;
        document.body.style.cursor = isPickerActive ? "crosshair" : "";
        colorDisplay.style.display = isPickerActive ? "block" : "none";
        
        if (isPickerActive) {
          document.addEventListener('mousemove', captureColor);
          document.addEventListener('click', copyColor);
        } else {
          document.removeEventListener('mousemove', captureColor);
          document.removeEventListener('click', copyColor);
          cachedDataUrl = null; // Clean cache.
        }
    }
  
    // Copy the color.
    function copyColor(event) {
        event.preventDefault();
        const colorText = colorDisplay.innerHTML.split('<br>')[0].split(': ')[1];
        navigator.clipboard.writeText(colorText).then(() => {
          alert('Captured color : ' + colorText);
          togglePicker(); // Disable picker after copy.
        }, (err) => {
          console.error('Copy error : ', err);
        });
    }
  
    // Listen background service worker.
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "togglePicker") {
          togglePicker();
        }
    });
  
    console.log("Color Picker Lite is ready!");
})();