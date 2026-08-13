(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var currentFile = null;

  W.createDropzone(dz, { accept: ["image/jpeg", "image/png", "image/webp"], maxSizeMB: 20, onFile: loadFile });

  function loadFile(file) {
    currentFile = file;
    W.loadImage(file).then(function (res) {
      document.getElementById("preview-thumb").src = res.url;
      document.getElementById("preview-name").textContent = file.name;
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  document.getElementById("extract-btn").addEventListener("click", function () {
    if (typeof Tesseract === "undefined") {
      document.getElementById("error-message").textContent = "The OCR engine could not be loaded from the CDN. Check your internet connection and try again.";
      W.setState(card, "error");
      return;
    }
    W.setState(card, "processing");
    var fill = document.getElementById("progress-fill");
    var label = document.getElementById("processing-label-text");
    fill.style.width = "0%";
    Tesseract.recognize(currentFile, "eng", {
      logger: function (m) {
        if (m.status === "recognizing text") {
          fill.style.width = Math.round(m.progress * 100) + "%";
          label.textContent = "Recognizing text... " + Math.round(m.progress * 100) + "%";
        } else {
          label.textContent = m.status;
        }
      }
    }).then(function (result) {
      var text = result.data.text.trim();
      document.getElementById("ocr-text").value = text || "(No readable text was found in this image.)";
      setTimeout(function () { W.setState(card, "result"); }, 150);
    }).catch(function (err) {
      document.getElementById("error-message").textContent = "OCR failed: " + err.message;
      W.setState(card, "error");
    });
  });

  document.getElementById("copy-btn").addEventListener("click", function () {
    navigator.clipboard.writeText(document.getElementById("ocr-text").value).then(function () { W.toast("Text copied to clipboard."); });
  });
  document.getElementById("download-btn").addEventListener("click", function () {
    var blob = new Blob([document.getElementById("ocr-text").value], { type: "text/plain" });
    W.downloadBlob(blob, "extracted-text.txt");
    W.toast("Download started.");
  });
  document.getElementById("reset-btn").addEventListener("click", function () { currentFile = null; W.setState(card, "empty"); });
})();