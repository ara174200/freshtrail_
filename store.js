/* Farm to Table Tracked: accounts, sessions and batches (kept in this browser's localStorage) */
(function () {
  "use strict";
  var FT = (window.FT = window.FT || {});
  var K = { users: "ft_users_v1", batches: "ft_batches_v1", session: "ft_session_v1" };
  var mem = {};

  function read(key, def) {
    try {
      var v = localStorage.getItem(key);
      return v ? JSON.parse(v) : def;
    } catch (e) {
      return mem[key] !== undefined ? mem[key] : def;
    }
  }
  function write(key, val) {
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode: memory only */ }
  }

  function fnv(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return "f" + h.toString(16);
  }
  function hash(u, p) {
    var s = "freshtrail|" + u + "|" + p;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      });
    }
    return Promise.resolve(fnv(s));
  }

  var USER_RE = /^[a-z0-9_]{3,20}$/;

  FT.store = {
    validUsername: function (u) { return USER_RE.test(u); },

    register: function (role, username, password) {
      username = String(username || "").trim().toLowerCase();
      if (!USER_RE.test(username)) { return Promise.resolve({ ok: false, error: "Username must be 3 to 20 characters: lowercase letters, numbers or underscore." }); }
      if (String(password || "").length < 6) { return Promise.resolve({ ok: false, error: "Password must be at least 6 characters." }); }
      var users = read(K.users, {});
      if (Object.prototype.hasOwnProperty.call(users, username)) { return Promise.resolve({ ok: false, error: "That username is already taken. Try another one." }); }
      return hash(username, password).then(function (h) {
        users[username] = { role: role, hash: h, created: new Date().toISOString() };
        write(K.users, users);
        write(K.session, { username: username, role: role });
        return { ok: true, username: username, role: role };
      });
    },

    login: function (role, username, password) {
      username = String(username || "").trim().toLowerCase();
      var users = read(K.users, {});
      var u = Object.prototype.hasOwnProperty.call(users, username) ? users[username] : null;
      if (!u) { return Promise.resolve({ ok: false, error: "Wrong username or password." }); }
      return hash(username, password).then(function (h) {
        if (h !== u.hash) { return { ok: false, error: "Wrong username or password." }; }
        if (u.role !== role) { return { ok: false, error: "This account is registered as a " + FT.roleLabel(u.role).toLowerCase() + "." }; }
        write(K.session, { username: username, role: role });
        return { ok: true, username: username, role: role };
      });
    },

    session: function () {
      var s = read(K.session, null);
      if (!s || !s.username) { return null; }
      var users = read(K.users, {});
      return users[s.username] && users[s.username].role === s.role ? s : null;
    },
    logout: function () { mem[K.session] = null; try { localStorage.removeItem(K.session); } catch (e) { /* ignore */ } },
    requireRole: function (role) {
      var s = FT.store.session();
      if (!s || s.role !== role) { location.replace("auth.html?role=" + role); return null; }
      return s;
    },

    getBatch: function (id) { var b = read(K.batches, {}); return b[id] || null; },
    putBatch: function (batch) { var b = read(K.batches, {}); b[batch.id] = batch; write(K.batches, b); },
    newBatchId: function () {
      var b = read(K.batches, {}), id, n = 0;
      do { id = FT.makeId(); n++; } while (b[id] && n < 50);
      return id;
    },
    batchesByFarmer: function (u) {
      var b = read(K.batches, {});
      return Object.keys(b).map(function (k) { return b[k]; })
        .filter(function (x) { return x.farmer === u; })
        .sort(function (a, c) { return String(c.created).localeCompare(String(a.created)); });
    },
    checkinsBy: function (u, role) {
      var b = read(K.batches, {});
      return Object.keys(b).map(function (k) { return b[k]; })
        .filter(function (x) { return x[role] && x[role].user === u; })
        .sort(function (a, c) { return String(c[role].at).localeCompare(String(a[role].at)); });
    },

    /* admin helpers (accounts stored in this browser only) */
    listUsers: function () {
      var users = read(K.users, {});
      return Object.keys(users).map(function (k) { return { username: k, role: users[k].role, created: users[k].created }; })
        .sort(function (a, c) { return String(c.created).localeCompare(String(a.created)); });
    },
    setPassword: function (username, password) {
      var users = read(K.users, {});
      if (!users[username]) { return Promise.resolve(false); }
      if (String(password || "").length < 6) { return Promise.resolve(false); }
      return hash(username, password).then(function (h) { users[username].hash = h; write(K.users, users); return true; });
    },
    deleteUser: function (username) {
      var users = read(K.users, {});
      delete users[username];
      write(K.users, users);
    }
  };

  /* Registration alert: sends username, role and time only. The password is never included. */
  FT.notifyRegistration = function (role, username) {
    var n = FT.cfg.notify || {}, when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var text = "New " + role + " account on Farm to Table Tracked: username \"" + username + "\" registered at " + when + " IST.";
    try {
      if (n.web3formsKey) {
        return fetch("https://api.web3forms.com/submit", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: n.web3formsKey, subject: "FreshTrail: new " + role + " registered", from_name: "FreshTrail website", message: text })
        }).catch(function () { /* alerts are best-effort */ });
      }
      if (n.formspreeUrl) {
        return fetch(n.formspreeUrl, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ subject: "FreshTrail: new " + role + " registered", message: text, role: role, username: username })
        }).catch(function () { /* alerts are best-effort */ });
      }
    } catch (e) { /* ignore */ }
    return Promise.resolve();
  };
})();
