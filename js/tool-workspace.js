window.PFWorkspace = (function () {
  "use strict";
  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    var units = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + " " + units[i];
  }
  function toast(message, type) {
    var region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region"; region.className = "toast-region"; region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "success");
    el.textContent = message;
    region.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }
  function setState(root, state) { root.setAttribute("data-state", state); }
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("This file could not be read as an image.")); };
      img.src = url;
    });
  }
  function createDropzone(el, options) {
    var input = el.querySelector('input[type="file"]');
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.accept = (options.accept || []).join(",");
      input.className = "visually-hidden";
      el.appendChild(input);
    }
    function validate(file) {
      if (options.accept && options.accept.length && !options.accept.includes(file.type)) {
        toast("Unsupported file type: " + (file.type || "unknown"), "error");
        return false;
      }
      var maxBytes = (options.maxSizeMB || 25) * 1024 * 1024;
      if (file.size > maxBytes) { toast("File is too large. Maximum size is " + options.maxSizeMB + " MB.", "error"); return false; }
      return true;
    }
    function handleFiles(fileList) {
      var file = fileList[0];
      if (!file) return;
      if (!validate(file)) return;
      options.onFile(file);
    }
    el.addEventListener("click", function (e) { if (e.target === input) return; input.click(); });
    input.addEventListener("change", function () { handleFiles(input.files); });
    ["dragenter", "dragover"].forEach(function (evt) { el.addEventListener(evt, function (e) { e.preventDefault(); el.classList.add("dragover"); }); });
    ["dragleave", "dragend", "drop"].forEach(function (evt) { el.addEventListener(evt, function (e) { e.preventDefault(); el.classList.remove("dragover"); }); });
    el.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); });
    el.setAttribute("tabindex", "0"); el.setAttribute("role", "button");
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    return { input: input, reset: function () { input.value = ""; } };
  }
  return { formatBytes: formatBytes, toast: toast, setState: setState, downloadBlob: downloadBlob, loadImage: loadImage, createDropzone: createDropzone };
})();