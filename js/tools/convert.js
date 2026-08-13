(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var currentFile = null, currentImg = null, resultBlob = null;
  var accept = (card.getAttribute("data-accept") || "image/jpeg,image/png,image/webp").split(",");
  var fixedTarget = card.getAttribute("data-fixed-target");
  var targetSelect = document.getElementById("target-format");
  var bgColor = document.getElementById("bg-color");

  W.createDropzone(dz, { accept: accept, maxSizeMB: 20, onFile: loadFile });

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      currentFile = file; currentImg = res.img;
      document.getElementById("preview-name").textContent = file.name;
      document.getElementById("preview-meta").textContent = W.formatBytes(file.size) + " · " + res.img.naturalWidth + "×" + res.img.naturalHeight + " · " + file.type;
      document.getElementById("preview-thumb").src = res.url;
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  function targetMime() { return fixedTarget || (targetSelect ? targetSelect.value : "image/png"); }
  function extFor(mime) { return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg"; }

  document.getElementById("convert-btn").addEventListener("click", function () {
    W.setState(card, "processing");
    var fill = document.getElementById("progress-fill");
    fill.style.width = "30%";
    setTimeout(function () {
      var mime = targetMime();
      var canvas = document.createElement("canvas");
      canvas.width = currentImg.naturalWidth; canvas.height = currentImg.naturalHeight;
      var ctx = canvas.getContext("2d");
      if (mime === "image/jpeg") { ctx.fillStyle = (bgColor ? bgColor.value : "#ffffff"); ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(currentImg, 0, 0);
      fill.style.width = "70%";
      canvas.toBlob(function (blob) {
        fill.style.width = "100%";
        if (!blob) { document.getElementById("error-message").textContent = "Conversion failed in this browser. WebP encoding may not be supported here."; W.setState(card, "error"); return; }
        resultBlob = blob;
        document.getElementById("result-after-img").src = URL.createObjectURL(blob);
        document.getElementById("stat-before").textContent = currentFile.type;
        document.getElementById("stat-after").textContent = mime;
        document.getElementById("stat-saved").textContent = W.formatBytes(blob.size);
        setTimeout(function () { W.setState(card, "result"); }, 200);
      }, mime, 0.92);
    }, 150);
  });

  document.getElementById("download-btn").addEventListener("click", function () {
    if (!resultBlob) return;
    W.downloadBlob(resultBlob, "converted-" + currentFile.name.replace(/\.[^.]+$/, "") + "." + extFor(resultBlob.type));
    W.toast("Download started.");
  });
  document.getElementById("reset-btn").addEventListener("click", function () { currentFile = null; currentImg = null; resultBlob = null; W.setState(card, "empty"); });
})();