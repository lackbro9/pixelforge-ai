(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var currentFile = null, currentImg = null, originalUrl = null, resultBlob = null, resultUrl = null;

  var qualityInput = document.getElementById("quality-range");
  var qualityValue = document.getElementById("quality-value");
  var formatSelect = document.getElementById("format-select");

  W.createDropzone(dz, {
    accept: ["image/jpeg", "image/png", "image/webp"],
    maxSizeMB: 20,
    onFile: function (file) { loadFile(file); }
  });

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      currentFile = file; currentImg = res.img; originalUrl = res.url;
      document.getElementById("preview-name").textContent = file.name;
      document.getElementById("preview-meta").textContent = W.formatBytes(file.size) + " · " + res.img.naturalWidth + "×" + res.img.naturalHeight;
      document.getElementById("preview-thumb").src = res.url;
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  qualityInput.addEventListener("input", function () { qualityValue.textContent = Math.round(qualityInput.value * 100) + "%"; });

  document.getElementById("compress-btn").addEventListener("click", function () {
    W.setState(card, "processing");
    var fill = document.getElementById("progress-fill");
    fill.style.width = "20%";
    setTimeout(function () {
      var canvas = document.createElement("canvas");
      canvas.width = currentImg.naturalWidth; canvas.height = currentImg.naturalHeight;
      var ctx = canvas.getContext("2d");
      var mime = formatSelect.value === "original" ? (currentFile.type === "image/png" ? "image/png" : "image/jpeg") : formatSelect.value;
      if (mime !== "image/png") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(currentImg, 0, 0);
      fill.style.width = "65%";
      canvas.toBlob(function (blob) {
        fill.style.width = "100%";
        if (!blob) { document.getElementById("error-message").textContent = "Compression failed in this browser."; W.setState(card, "error"); return; }
        resultBlob = blob;
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        resultUrl = URL.createObjectURL(blob);
        document.getElementById("result-before-img").src = originalUrl;
        document.getElementById("result-after-img").src = resultUrl;
        document.getElementById("stat-before").textContent = W.formatBytes(currentFile.size);
        document.getElementById("stat-after").textContent = W.formatBytes(blob.size);
        var pct = Math.max(0, Math.round((1 - blob.size / currentFile.size) * 100));
        document.getElementById("stat-saved").textContent = pct + "%";
        setTimeout(function () { W.setState(card, "result"); }, 250);
      }, mime, parseFloat(qualityInput.value));
    }, 150);
  });

  document.getElementById("download-btn").addEventListener("click", function () {
    if (!resultBlob) return;
    var ext = resultBlob.type === "image/png" ? "png" : "jpg";
    W.downloadBlob(resultBlob, "compressed-" + currentFile.name.replace(/\.[^.]+$/, "") + "." + ext);
    W.toast("Download started.");
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    currentFile = null; currentImg = null; resultBlob = null;
    W.setState(card, "empty");
  });
})();