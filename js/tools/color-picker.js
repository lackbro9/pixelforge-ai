(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");
  var canvas = document.getElementById("picker-canvas");
  var ctx = canvas.getContext("2d", { willReadFrequently: true });
  var palette = [];

  W.createDropzone(dz, { accept: ["image/jpeg", "image/png", "image/webp"], maxSizeMB: 20, onFile: loadFile });

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      var maxW = 800;
      var scale = Math.min(1, maxW / res.img.naturalWidth);
      canvas.width = Math.round(res.img.naturalWidth * scale);
      canvas.height = Math.round(res.img.naturalHeight * scale);
      ctx.drawImage(res.img, 0, 0, canvas.width, canvas.height);
      W.setState(card, "preview");
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  function rgbToHex(r, g, b) { return "#" + [r, g, b].map(function (v) { return v.toString(16).padStart(2, "0"); }).join(""); }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0); else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  canvas.addEventListener("click", function (e) {
    var r = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - r.left) * (canvas.width / r.width));
    var y = Math.round((e.clientY - r.top) * (canvas.height / r.height));
    var data = ctx.getImageData(x, y, 1, 1).data;
    var hex = rgbToHex(data[0], data[1], data[2]);
    var hsl = rgbToHsl(data[0], data[1], data[2]);
    document.getElementById("swatch-preview").style.background = hex;
    document.getElementById("value-hex").textContent = hex;
    document.getElementById("value-rgb").textContent = "rgb(" + data[0] + ", " + data[1] + ", " + data[2] + ")";
    document.getElementById("value-hsl").textContent = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";
    document.getElementById("color-result").hidden = false;
    palette.unshift(hex); palette = palette.slice(0, 12);
    renderPalette();
  });

  function renderPalette() {
    document.getElementById("palette-row").innerHTML = palette.map(function (c) {
      return '<button class="btn-icon" style="background:' + c + ';border:1px solid var(--border);border-radius:6px;" title="' + c + '" onclick="navigator.clipboard.writeText(\'' + c + '\');window.PFWorkspace.toast(\'Copied ' + c + '\')"></button>';
    }).join("");
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-copy"));
      navigator.clipboard.writeText(target.textContent).then(function () { W.toast("Copied " + target.textContent); });
    });
  });

  document.getElementById("reset-btn").addEventListener("click", function () { W.setState(card, "empty"); document.getElementById("color-result").hidden = true; });
})();