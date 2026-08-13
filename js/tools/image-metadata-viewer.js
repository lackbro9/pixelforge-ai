(function () {
  "use strict";
  var W = window.PFWorkspace;
  var card = document.getElementById("workspace-card");
  var dz = document.getElementById("dropzone");

  W.createDropzone(dz, { accept: ["image/jpeg", "image/png", "image/webp"], maxSizeMB: 25, onFile: loadFile });

  function readExif(arrayBuffer) {
    var view = new DataView(arrayBuffer);
    if (view.getUint16(0) !== 0xFFD8) return null;
    var offset = 2, tags = {};
    while (offset < view.byteLength) {
      if (view.getUint16(offset) === 0xFFE1) {
        var exifStart = offset + 4;
        if (view.getUint32(exifStart) !== 0x45786966) break;
        var tiffStart = exifStart + 6;
        var little = view.getUint16(tiffStart) === 0x4949;
        var ifdOffset = tiffStart + view.getUint32(tiffStart + 4, little);
        var count = view.getUint16(ifdOffset, little);
        var NAMES = { 0x010F: "Make", 0x0110: "Model", 0x0112: "Orientation", 0x0132: "DateTime" };
        for (var i = 0; i < count; i++) {
          var entryOffset = ifdOffset + 2 + i * 12;
          var tag = view.getUint16(entryOffset, little);
          if (NAMES[tag]) {
            var type = view.getUint16(entryOffset + 2, little);
            var valueOffset = entryOffset + 8;
            if (type === 2) {
              var strOffset = tiffStart + view.getUint32(valueOffset, little);
              var str = "";
              for (var c = 0; c < 32; c++) { var ch = view.getUint8(strOffset + c); if (ch === 0) break; str += String.fromCharCode(ch); }
              tags[NAMES[tag]] = str;
            } else if (type === 3) {
              tags[NAMES[tag]] = view.getUint16(valueOffset, little);
            }
          }
        }
        return tags;
      } else {
        offset += 2 + view.getUint16(offset + 2);
      }
    }
    return null;
  }

  function loadFile(file) {
    W.loadImage(file).then(function (res) {
      var rows = [
        ["File name", file.name],
        ["File type", file.type || "Unknown"],
        ["File size", W.formatBytes(file.size)],
        ["Last modified", new Date(file.lastModified).toLocaleString()],
        ["Width", res.img.naturalWidth + " px"],
        ["Height", res.img.naturalHeight + " px"],
        ["Megapixels", ((res.img.naturalWidth * res.img.naturalHeight) / 1000000).toFixed(2) + " MP"],
        ["Aspect ratio", (res.img.naturalWidth / res.img.naturalHeight).toFixed(3)]
      ];
      document.getElementById("preview-thumb").src = res.url;
      renderRows(rows);
      W.setState(card, "preview");

      if (file.type === "image/jpeg") {
        file.arrayBuffer().then(function (buf) {
          var exif = readExif(buf);
          if (exif && Object.keys(exif).length) {
            var extra = Object.keys(exif).map(function (k) { return [k, String(exif[k])]; });
            renderRows(rows.concat([["", ""]]).concat(extra).filter(function(r){return r[0]!=="";}));
            document.getElementById("exif-note").textContent = "Basic EXIF tags found and shown above.";
          } else {
            document.getElementById("exif-note").textContent = "No readable EXIF tags were found in this file (many images, especially edited or web-exported ones, have none).";
          }
        }).catch(function () { document.getElementById("exif-note").textContent = "EXIF data could not be read from this file."; });
      } else {
        document.getElementById("exif-note").textContent = "EXIF metadata only applies to JPEG files.";
      }
    }).catch(function (err) {
      document.getElementById("error-message").textContent = err.message;
      W.setState(card, "error");
    });
  }

  function renderRows(rows) {
    document.getElementById("meta-table").innerHTML = rows.map(function (r) {
      return '<tr><td style="padding:8px 12px;color:var(--text-muted);border-bottom:1px solid var(--border);">' + r[0] + '</td><td style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:600;">' + r[1] + '</td></tr>';
    }).join("");
  }

  document.getElementById("reset-btn").addEventListener("click", function () { W.setState(card, "empty"); });
})();