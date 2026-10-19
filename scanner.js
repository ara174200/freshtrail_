/* QR scanner: uses the browser's built-in BarcodeDetector when present, otherwise loads html5-qrcode on demand. */
(function () {
  "use strict";
  var FT = (window.FT = window.FT || {});
  var CDN = [
    "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"
  ];
  var modal, stream, timer, h5, active = false;

  function build() {
    if (modal) { return; }
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Scan a QR code");
    modal.innerHTML = '<div class="modal-card"><div class="modal-head"><h3>Scan QR code</h3><button type="button" class="close-btn" aria-label="Close scanner">' + FT.icon("x") + '</button></div><div class="scan-view" id="ft-scan-view"></div><p class="scan-msg" id="ft-scan-msg">Starting camera...</p></div>';
    document.body.appendChild(modal);
    modal.querySelector(".close-btn").addEventListener("click", FT.scanStop);
    modal.addEventListener("click", function (e) { if (e.target === modal) { FT.scanStop(); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && active) { FT.scanStop(); } });
  }
  function msg(t) { var m = document.getElementById("ft-scan-msg"); if (m) { m.textContent = t; } }
  function loadLib(i) {
    return new Promise(function (resolve, reject) {
      if (window.Html5Qrcode) { resolve(); return; }
      if (i >= CDN.length) { reject(new Error("lib")); return; }
      var s = document.createElement("script");
      s.src = CDN[i]; s.onload = function () { resolve(); };
      s.onerror = function () { s.remove(); loadLib(i + 1).then(resolve, reject); };
      document.head.appendChild(s);
    });
  }
  function fail(onFail, why) {
    var text = why === "denied" ? "Camera permission was blocked. Allow the camera, or type the Batch ID instead." : "The camera isn't available here. Type the Batch ID instead.";
    msg(text);
    setTimeout(function () { FT.scanStop(); if (onFail) { onFail(text); } }, 1600);
  }

  FT.scanStop = function () {
    active = false;
    if (timer) { clearInterval(timer); timer = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    if (h5) { var x = h5; h5 = null; x.stop().then(function () { x.clear(); }, function () { /* ignore */ }); }
    if (modal) { modal.classList.remove("open"); var v = document.getElementById("ft-scan-view"); if (v) { v.innerHTML = ""; } }
  };

  /* opts: { onCode(text), onFail(message) } */
  FT.scan = function (opts) {
    build();
    modal.classList.add("open");
    active = true;
    var view = document.getElementById("ft-scan-view");
    view.innerHTML = "";
    msg("Starting camera...");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { fail(opts.onFail, "none"); return; }

    function done(text) { FT.scanStop(); opts.onCode(text); }

    if ("BarcodeDetector" in window) {
      var det;
      try { det = new window.BarcodeDetector({ formats: ["qr_code"] }); } catch (e) { det = null; }
      if (det) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (st) {
          if (!active) { st.getTracks().forEach(function (t) { t.stop(); }); return; }
          stream = st;
          var v = document.createElement("video");
          v.setAttribute("playsinline", ""); v.muted = true; v.srcObject = st;
          view.appendChild(v); v.play();
          msg("Point the camera at the QR label on the crate.");
          timer = setInterval(function () {
            if (v.readyState < 2) { return; }
            det.detect(v).then(function (codes) { if (codes && codes.length && active) { done(codes[0].rawValue); } }, function () { /* keep trying */ });
          }, 250);
        }, function (err) { fail(opts.onFail, err && err.name === "NotAllowedError" ? "denied" : "none"); });
        return;
      }
    }

    loadLib(0).then(function () {
      if (!active) { return; }
      var box = document.createElement("div");
      box.id = "ft-reader";
      view.appendChild(box);
      h5 = new window.Html5Qrcode("ft-reader");
      return h5.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, function (text) { if (active) { done(text); } }, function () { /* per-frame misses */ })
        .then(function () { msg("Point the camera at the QR label on the crate."); });
    }).catch(function (err) {
      fail(opts.onFail, err && (err.name === "NotAllowedError" || /permission/i.test(String(err))) ? "denied" : "none");
    });
  };
})();
