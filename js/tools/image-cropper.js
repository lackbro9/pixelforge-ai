(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var stage = document.getElementById("crop-stage");
  var img = document.getElementById("crop-image");
  var box = document.getElementById("crop-box");
  var aspectSelect = document.getElementById("aspect-select");
  var currentFile = null, currentImg = null, resultBlob = null;
  var rect = null, dragging = false, startX = 0, startY = 0;

  W.createDropzone(dz, { accept: ["image/jpeg", "image/png", "image/webp"], maxSizeMB: 20, onFile: loadFile });

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      currentFile = file; currentImg = res.img;
      img.src = res.url;
      document.getElementById("preview-name").textContent = file.name + " · " + res.img.naturalWidth + "×" + res.img.naturalHeight;
      box.style.display = "none";
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  function pointerPos(e) {
    var r = stage.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: Math.min(Math.max(clientX - r.left, 0), r.width), y: Math.min(Math.max(clientY - r.top, 0), r.height) };
  }

  function aspectRatio() {
    var v = aspectSelect.value;
    if (v === "1:1") return 1;
    if (v === "4:3") return 4 / 3;
    if (v === "16:9") return 16 / 9;
    return null;
  }

  function start(e) {
    e.preventDefault();
    var p = pointerPos(e);
    startX = p.x; startY = p.y; dragging = true;
    box.style.display = "block";
    updateBox(p.x, p.y);
  }
  function move(e) {
    if (!dragging) return;
    e.preventDefault();
    var p = pointerPos(e);
    updateBox(p.x, p.y);
  }
  function end() { dragging = false; if (rect && rect.w > 4 && rect.h > 4) document.getElementById("apply-crop-btn").disabled = false; }

  function updateBox(x, y) {
    var w = x - startX, h = y - startY;
    var ar = aspectRatio();
    if (ar) h = (w >= 0 ? 1 : -1) * Math.abs(w) / ar * (h >= 0 ? 1 : -1) * (Math.abs(h) >= 0 ? 1 : 1), h = w / ar;
    var left = w >= 0 ? startX : startX + w;
    var top = h >= 0 ? startY : startY + h;
    var width = Math.abs(w), height = Math.abs(h);
    rect = { x: left, y: top, w: width, h: height };
    box.style.left = left + "px"; box.style.top = top + "px"; box.style.width = width + "px"; box.style.height = height + "px";
  }

  stage.addEventListener("mousedown", start);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  stage.addEventListener("touchstart", start, { passive: false });
  stage.addEventListener("touchmove", move, { passive: false });
  stage.addEventListener("touchend", end);

  document.getElementById("apply-crop-btn").addEventListener("click", function () {
    if (!rect || rect.w < 4 || rect.h < 4) { W.toast("Draw a crop selection first.", "error"); return; }
    W.setState(card, "processing");
    document.getElementById("progress-fill").style.width = "50%";
    setTimeout(function () {
      var scale = currentImg.naturalWidth / stage.clientWidth;
      var sx = rect.x * scale, sy = rect.y * scale, sw = rect.w * scale, sh = rect.h * scale;
      var canvas = document.createElement("canvas");
      canvas.width = Math.round(sw); canvas.height = Math.round(sh);
      var ctx = canvas.getContext("2d");
      ctx.drawImage(currentImg, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      var mime = currentFile.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(function (blob) {
        document.getElementById("progress-fill").style.width = "100%";
        resultBlob = blob;
        document.getElementById("result-after-img").src = URL.createObjectURL(blob);
        document.getElementById("stat-after").textContent = canvas.width + "×" + canvas.height;
        document.getElementById("stat-saved").textContent = W.formatBytes(blob.size);
        setTimeout(function () { W.setState(card, "result"); }, 200);
      }, mime, 0.92);
    }, 150);
  });

  document.getElementById("download-btn").addEventListener("click", function () {
    if (!resultBlob) return;
    var ext = resultBlob.type === "image/png" ? "png" : "jpg";
    W.downloadBlob(resultBlob, "cropped-" + currentFile.name.replace(/\.[^.]+$/, "") + "." + ext);
    W.toast("Download started.");
  });
  document.getElementById("reset-btn").addEventListener("click", function () {
    currentFile = null; currentImg = null; resultBlob = null; rect = null;
    document.getElementById("apply-crop-btn").disabled = true;
    W.setState(card, "empty");
  });
})();