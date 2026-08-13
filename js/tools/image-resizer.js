(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var currentFile = null, currentImg = null, resultBlob = null;
  var widthInput = document.getElementById("width-input");
  var heightInput = document.getElementById("height-input");
  var lockRatio = document.getElementById("lock-ratio");
  var presetSelect = document.getElementById("preset-select");
  var ratio = 1;

  var PRESETS = {
    "instagram-square": [1080, 1080], "instagram-story": [1080, 1920],
    "twitter-post": [1200, 675], "facebook-cover": [820, 312], "youtube-thumbnail": [1280, 720]
  };

  W.createDropzone(dz, { accept: ["image/jpeg", "image/png", "image/webp"], maxSizeMB: 20, onFile: loadFile });

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      currentFile = file; currentImg = res.img;
      ratio = res.img.naturalWidth / res.img.naturalHeight;
      widthInput.value = res.img.naturalWidth; heightInput.value = res.img.naturalHeight;
      document.getElementById("preview-name").textContent = file.name;
      document.getElementById("preview-meta").textContent = res.img.naturalWidth + "×" + res.img.naturalHeight + " · " + W.formatBytes(file.size);
      document.getElementById("preview-thumb").src = res.url;
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  widthInput.addEventListener("input", function () {
    if (lockRatio.checked) heightInput.value = Math.round(widthInput.value / ratio);
  });
  heightInput.addEventListener("input", function () {
    if (lockRatio.checked) widthInput.value = Math.round(heightInput.value * ratio);
  });
  presetSelect.addEventListener("change", function () {
    var p = PRESETS[presetSelect.value];
    if (!p) return;
    widthInput.value = p[0]; heightInput.value = p[1];
  });

  document.getElementById("resize-btn").addEventListener("click", function () {
    W.setState(card, "processing");
    var fill = document.getElementById("progress-fill");
    fill.style.width = "30%";
    setTimeout(function () {
      var w = parseInt(widthInput.value, 10), h = parseInt(heightInput.value, 10);
      if (!w || !h || w < 1 || h < 1) { document.getElementById("error-message").textContent = "Enter valid width and height values."; W.setState(card, "error"); return; }
      var canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(currentImg, 0, 0, w, h);
      fill.style.width = "80%";
      var mime = currentFile.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(function (blob) {
        fill.style.width = "100%";
        resultBlob = blob;
        document.getElementById("result-after-img").src = URL.createObjectURL(blob);
        document.getElementById("stat-before").textContent = currentImg.naturalWidth + "×" + currentImg.naturalHeight;
        document.getElementById("stat-after").textContent = w + "×" + h;
        document.getElementById("stat-saved").textContent = W.formatBytes(blob.size);
        setTimeout(function () { W.setState(card, "result"); }, 200);
      }, mime, 0.92);
    }, 150);
  });

  document.getElementById("download-btn").addEventListener("click", function () {
    if (!resultBlob) return;
    var ext = resultBlob.type === "image/png" ? "png" : "jpg";
    W.downloadBlob(resultBlob, "resized-" + currentFile.name.replace(/\.[^.]+$/, "") + "." + ext);
    W.toast("Download started.");
  });
  document.getElementById("reset-btn").addEventListener("click", function () { currentFile = null; currentImg = null; resultBlob = null; W.setState(card, "empty"); });
})();