/* Farm to Table Tracked: shared helpers (icons, dates, score, QR, header/footer, toast) */
(function () {
  "use strict";
  var FT = (window.FT = window.FT || {});
  var DEFAULTS = {
    teamName: "Team FreshTrail",
    phone: "",
    email: "",
    notify: { web3formsKey: "", formspreeUrl: "" },
    adminPin: "change-me-123"
  };
  FT.cfg = Object.assign({}, DEFAULTS, window.FT_CONFIG || {});

  FT.$ = function (s, r) { return (r || document).querySelector(s); };
  FT.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  FT.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- icons ---------- */
  var S = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  var P = {
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9v11h16V9"/><path d="M4 9h16"/><path d="M10 20v-6h4v6"/>',
    basket: '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
    sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  };
  FT.icon = function (name) { return '<svg ' + S + '>' + (P[name] || "") + "</svg>"; };
  FT.hydrateIcons = function (root) {
    FT.$$("[data-icon]", root).forEach(function (n) {
      if (!n.firstChild) { n.innerHTML = FT.icon(n.getAttribute("data-icon")); }
    });
  };

  /* ---------- dates ---------- */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  FT.isoDate = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  FT.today = function () { return FT.isoDate(new Date()); };
  FT.addDays = function (iso, n) { var d = FT.parseDate(iso); d.setDate(d.getDate() + n); return FT.isoDate(d); };
  FT.validDate = function (s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(FT.parseDate(s).getTime()); };
  FT.parseDate = function (s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  FT.fmtDate = function (s) { if (!FT.validDate(s)) { return "-"; } var d = FT.parseDate(s); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); };
  FT.fmtShort = function (s) { if (!FT.validDate(s)) { return "-"; } var d = FT.parseDate(s); return d.getDate() + " " + MON[d.getMonth()]; };
  FT.daysSince = function (s) {
    var a = FT.parseDate(s), b = FT.parseDate(FT.today());
    return Math.max(0, Math.round((b - a) / 86400000));
  };
  FT.ago = function (n) { return n === 0 ? "today" : n === 1 ? "1 day ago" : n + " days ago"; };

  /* ---------- freshness ---------- */
  FT.CROPS = ["Tomato", "Potato", "Onion", "Spinach", "Cabbage", "Cauliflower", "Brinjal", "Okra", "Carrot", "Green Chilli", "Other"];
  FT.SHELF = { "Tomato": 7, "Potato": 30, "Onion": 30, "Spinach": 3, "Cabbage": 14, "Cauliflower": 7, "Brinjal": 7, "Okra": 5, "Carrot": 14, "Green Chilli": 7, "Other": 7 };
  FT.score = function (crop, days) {
    var life = FT.SHELF[crop] || 7;
    return Math.max(5, Math.min(100, Math.round(100 - 90 * days / life)));
  };
  FT.scoreLabel = function (sc) {
    if (sc >= 85) { return { text: "Very Fresh", color: "#15803d" }; }
    if (sc >= 65) { return { text: "Fresh", color: "#15803d" }; }
    if (sc >= 40) { return { text: "Use Soon", color: "#9a5b05" }; }
    return { text: "Old", color: "#b42318" };
  };

  /* ---------- batch ids and links ---------- */
  var ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  FT.makeId = function () {
    var s = "FT-", i, a = new Uint8Array(5);
    if (window.crypto && crypto.getRandomValues) { crypto.getRandomValues(a); }
    else { for (i = 0; i < 5; i++) { a[i] = Math.floor(Math.random() * 256); } }
    for (i = 0; i < 5; i++) { s += ALPHA.charAt(a[i] % ALPHA.length); }
    return s;
  };

  function b64enc(str) {
    return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64dec(str) {
    var s = str.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) { s += "="; }
    return decodeURIComponent(escape(atob(s)));
  }
  /* Compact copy of a batch that travels inside the QR link, so the journey page works on any phone. */
  FT.encodeBatch = function (b) {
    function pack(c) {
      var ok = typeof c.lat === "number" && typeof c.lng === "number";
      return [c.received, c.departed || "", ok ? c.lat : "", ok ? c.lng : "", ok ? String(c.place || "").slice(0, 60) : ""];
    }
    var w = b.wholesaler ? pack(b.wholesaler) : 0;
    var m = b.mandi ? pack(b.mandi) : 0;
    return b64enc(JSON.stringify([b.id, b.crop, b.variety || "", b.qty || 0, b.harvest, b.farm, b.village || "", w, m]));
  };
  function cleanStr(v, max) { return typeof v === "string" ? v.slice(0, max) : ""; }
  FT.decodeBatch = function (s) {
    try {
      var j = JSON.parse(b64dec(String(s)));
      if (!Array.isArray(j) || !/^FT-[A-Z0-9]{5}$/.test(j[0]) || !FT.validDate(j[4])) { return null; }
      var out = {
        id: j[0], crop: cleanStr(j[1], 40), variety: cleanStr(j[2], 60), qty: Math.max(0, +j[3] || 0),
        harvest: j[4], farm: cleanStr(j[5], 80), village: cleanStr(j[6], 80), notes: "",
        farmer: "", wholesaler: null, mandi: null, imported: true
      };
      if (!out.crop || !out.farm) { return null; }
      [["wholesaler", j[7]], ["mandi", j[8]]].forEach(function (p) {
        var v = p[1];
        if (Array.isArray(v) && FT.validDate(v[0])) {
          var okLoc = typeof v[2] === "number" && typeof v[3] === "number" && Math.abs(v[2]) <= 90 && Math.abs(v[3]) <= 180;
          out[p[0]] = { user: "(imported)", received: v[0], departed: FT.validDate(v[1]) ? v[1] : null, at: "",
            lat: okLoc ? v[2] : null, lng: okLoc ? v[3] : null, place: okLoc ? cleanStr(v[4], 60) : "" };
        }
      });
      return out;
    } catch (e) { return null; }
  };
  FT.mapUrl = function (c) { return "https://www.google.com/maps?q=" + c.lat + "," + c.lng; };
  FT.pageUrl = function (name) { return new URL(name, location.href); };
  FT.journeyUrl = function (batch, full) {
    var u = FT.pageUrl("journey.html");
    u.search = "";
    u.hash = "";
    u.searchParams.set("b", batch.id);
    u.searchParams.set("d", FT.encodeBatch(full ? batch : { id: batch.id, crop: batch.crop, variety: batch.variety, qty: batch.qty, harvest: batch.harvest, farm: batch.farm, village: batch.village }));
    return u.toString();
  };
  /* Accepts a Batch ID, a journey link, or text scanned from a QR code. */
  FT.parseBatchInput = function (raw) {
    raw = String(raw || "").trim();
    if (!raw) { return null; }
    var id = null, payload = null, m;
    if (/[?&]b=/.test(raw) || /^https?:/i.test(raw)) {
      try {
        var u = new URL(raw, location.href);
        id = (u.searchParams.get("b") || "").toUpperCase();
        payload = u.searchParams.get("d");
      } catch (e) { id = null; }
    }
    if (!id || !/^FT-[A-Z0-9]{5}$/.test(id)) {
      m = raw.toUpperCase().match(/FT-?([A-Z0-9]{5})(?![A-Z0-9])/);
      id = m ? "FT-" + m[1] : null;
    }
    return id ? { id: id, payload: payload } : null;
  };

  FT.demoBatch = function () {
    var t = FT.today();
    return {
      id: "FT-7K2Q9", crop: "Tomato", variety: "Desi", qty: 120, harvest: FT.addDays(t, -2),
      farm: "Ramesh Farm", village: "Nashik", notes: "", farmer: "demo",
      wholesaler: { user: "demo", received: FT.addDays(t, -1), departed: FT.addDays(t, -1), at: "" },
      mandi: { user: "demo", received: t, departed: null, at: "" }, demo: true
    };
  };

  /* ---------- QR ---------- */
  FT.qr = function (text) {
    var q = new window.FTQRCode(-1, 0);
    q.addData(text);
    q.make();
    return q;
  };
  FT.qrSvg = function (text, label) {
    var q = FT.qr(text), n = q.getModuleCount(), m = 2, size = n + m * 2, d = "", r, c;
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) { if (q.isDark(r, c)) { d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z"; } }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges" role="img" aria-label="' + FT.esc(label || "QR code") + '"><rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#10231a"/></svg>';
  };
  FT.downloadQR = function (text, filename) {
    var q = FT.qr(text), n = q.getModuleCount(), m = 4, scale = Math.max(4, Math.floor(720 / (n + m * 2)));
    var size = (n + m * 2) * scale, cv = document.createElement("canvas"), ctx, r, c;
    cv.width = size; cv.height = size;
    ctx = cv.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#10231a";
    for (r = 0; r < n; r++) { for (c = 0; c < n; c++) { if (q.isDark(r, c)) { ctx.fillRect((c + m) * scale, (r + m) * scale, scale, scale); } } }
    cv.toBlob(function (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    }, "image/png");
  };
  FT.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    var ta = document.createElement("textarea"), ok = false;
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return Promise.resolve(ok);
  };

  /* ---------- toast ---------- */
  FT.toast = function (msg, type) {
    var wrap = FT.$(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; wrap.setAttribute("aria-live", "polite"); document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .25s"; }, 3200);
    setTimeout(function () { t.remove(); }, 3500);
  };

  /* ---------- header / footer ---------- */
  FT.roleLabel = function (r) { return { farmer: "Farmer", wholesaler: "Wholesaler", mandi: "Mandi vendor", consumer: "Consumer" }[r] || r; };
  FT.panelFor = function (role) { return role === "farmer" ? "farmer.html" : "checkin.html?role=" + role; };

  FT.brandHtml = function () {
    return '<a class="brand" href="index.html"><span class="brand-logo ico" data-icon="leaf"></span><span class="brand-name">Farm to Table Tracked</span></a>';
  };
  FT.renderHeader = function () {
    var host = FT.$("#site-header");
    if (!host) { return; }
    var s = FT.store && FT.store.session();
    var right;
    if (s) {
      right = '<span class="pill">' + FT.esc(FT.roleLabel(s.role)) + " &middot; " + FT.esc(s.username) + '</span><a class="linkbtn" href="' + FT.panelFor(s.role) + '">My panel</a><button class="linkbtn" id="ft-logout" type="button">Log out</button>';
    } else {
      right = '<a class="btn btn-primary btn-sm" href="index.html#roles">Get started</a>';
    }
    host.innerHTML = '<header class="site-header"><div class="container bar">' + FT.brandHtml() +
      '<nav class="nav-links" aria-label="Main"><a href="index.html#how">How it works</a><a href="index.html#roles">Roles</a><a href="track.html">Track a batch</a><a href="index.html#team">Team</a><a href="index.html#contact">Contact</a></nav>' +
      '<div class="bar-right">' + right + "</div></div></header>";
    FT.hydrateIcons(host);
    var lo = FT.$("#ft-logout");
    if (lo) { lo.addEventListener("click", function () { FT.store.logout(); location.href = "index.html"; }); }
  };
  FT.renderFooter = function () {
    var host = FT.$("#site-footer");
    if (!host) { return; }
    host.innerHTML = '<footer class="site-footer"><div class="container"><span>&copy; 2026 ' + FT.esc(FT.cfg.teamName) + '. HCL Jigsaw Edition 7.</span><span>Farm to Table Tracked</span></div></footer>';
  };

  FT.ready = function (fn) {
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", fn); } else { fn(); }
  };
  FT.ready(function () { FT.hydrateIcons(document); });
})();
