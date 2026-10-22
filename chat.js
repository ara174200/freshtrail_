/* Help chatbot: rule-based, no API, no key, can't fail. Keeps its history while you move between pages. */
(function () {
  "use strict";
  var FT = window.FT;
  var KEY = "ft_chat_v1";
  var phone = FT.cfg.phone, email = FT.cfg.email;
  var contactLine = "the team at " + phone + " or " + email;

  var A = {
    register: "To register: 1) On the home page pick your role (Farmer, Wholesaler or Mandi vendor). 2) Tap the Register tab. 3) Choose a username (3 to 20 letters, numbers or _) and a password of 6 or more characters. No email needed.",
    login: "To log in, open your role from the home page, stay on the Log in tab and enter your username and password. If it says your account is registered as another role, go back and pick that role instead.",
    password: "We don't store an email, so passwords can't be reset automatically. Please contact " + contactLine + ", or simply register a new username.",
    scan: "To scan: tap Scan QR and allow the camera. Camera scanning needs a secure (https) page. If the camera is blocked or unavailable, type the Batch ID printed under the QR code instead.",
    batch: "\"Batch not found\" usually means a typo. Batch IDs look like FT-7K2Q9 (FT, a dash, then 5 letters or numbers). Check the label on the crate, or ask the farmer to open My batches. You can also try the demo batch from the Track page.",
    print: "After a farmer creates a batch, the success card has Download PNG and Print label buttons. The printed label shows the QR, Batch ID, crop, farm and harvest date. Stick it on the crate.",
    fresh: "Freshness starts at 100 on harvest day and drops each day, depending on the crop: score = 100 - 90 x (days since harvest / shelf life in days). Spinach lasts about 3 days, tomato 7, cabbage 14, potato and onion 30. 85+ is Very Fresh, 65+ Fresh, 40+ Use Soon, below that Old.",
    dates: "Dates can't be in the future. Received must be on or after the harvest date, and departed on or after received. Wholesalers must enter both dates; mandi vendors can leave departed empty.",
    roles: "Farmer: creates a batch and prints its QR label. Wholesaler and Mandi vendor: scan the crate and log the dates they received and sent it on. Consumer: no account needed, just scan the QR or type the Batch ID to see the journey.",
    how: "Tag: the farmer creates a batch and sticks the QR on the crate. Track: the wholesaler and mandi vendor scan it and log their dates. Show: the consumer scans the same QR and sees harvest date, farm, handlers and freshness.",
    split: "If a wholesaler sends one crate to several mandi vendors: after checking the batch in, scroll to Split into lots, enter each vendor's weight and tap Create lot. Each lot gets its own QR. The weights can't add up to more than the batch. Each mandi vendor scans only their own lot QR.",
    contact: "You can reach " + contactLine + ".",
    fallback: "I'm not sure about that. You can reach " + contactLine + "."
  };
  var CHIPS = ["How do I register?", "How do I scan a QR?", "Batch not found", "How is freshness calculated?", "I forgot my password", "Wholesaler sending to many mandis", "Contact the team"];

  function match(text) {
    var t = text.toLowerCase();
    if (/forgot|reset|lost.*(pass|login)|password/.test(t) && !/short|length|characters|least/.test(t)) { return "password"; }
    if (/regist|sign ?up|create.*account|new account|account/.test(t)) { return "register"; }
    if (/log ?in|sign ?in|can'?t get in|wrong (user|pass)/.test(t)) { return "login"; }
    if (/split|lots?\b|divide|distribut|several|multiple|share the|many mandi|weigh/.test(t)) { return "split"; }
    if (/not found|no batch|invalid|batch|\bid\b/.test(t)) { return "batch"; }
    if (/scan|camera|qr/.test(t)) { return "scan"; }
    if (/print|download|label|sticker|png/.test(t)) { return "print"; }
    if (/fresh|score|shelf|spoil/.test(t)) { return "fresh"; }
    if (/date|received|departed|future/.test(t)) { return "dates"; }
    if (/farmer|wholesal|mandi|consumer|role|vendor|shopper/.test(t)) { return "roles"; }
    if (/how.*work|what is|about|tag|track|show/.test(t)) { return "how"; }
    if (/contact|team|phone|call|email|help|support|developer/.test(t)) { return "contact"; }
    return "fallback";
  }

  var msgs = [], fab, sheet, list, input;
  try { msgs = JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch (e) { msgs = []; }
  if (!msgs.length) { msgs = [{ who: "bot", text: "Hi! I'm the FreshTrail helper. What do you need help with?" }]; }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (e) { /* ignore */ } }

  function bubble(m) {
    var d = document.createElement("div");
    d.className = "msg " + (m.who === "bot" ? "bot" : "user");
    d.textContent = m.text;
    list.appendChild(d);
    return d;
  }
  function scrollDown() { list.scrollTop = list.scrollHeight; }
  function ask(text) {
    text = String(text || "").trim();
    if (!text) { return; }
    var u = { who: "user", text: text };
    msgs.push(u); bubble(u); scrollDown();
    var typing = document.createElement("div");
    typing.className = "msg bot";
    typing.innerHTML = '<span class="dots" aria-label="Typing"><i></i><i></i><i></i></span>';
    list.appendChild(typing); scrollDown();
    setTimeout(function () {
      typing.remove();
      var b = { who: "bot", text: A[match(text)] };
      msgs.push(b); bubble(b); save(); scrollDown();
    }, 400);
  }
  function open() {
    sheet.classList.add("open"); fab.classList.add("hidden");
    try { sessionStorage.setItem(KEY + "_open", "1"); } catch (e) { /* ignore */ }
    scrollDown();
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() {
    sheet.classList.remove("open"); fab.classList.remove("hidden");
    try { sessionStorage.removeItem(KEY + "_open"); } catch (e) { /* ignore */ }
    fab.focus();
  }

  function init() {
    fab = document.createElement("button");
    fab.type = "button"; fab.className = "chat-fab";
    fab.setAttribute("aria-label", "Need help? Open the chat helper");
    fab.innerHTML = '<span class="ico" data-icon="chat"></span>Need help?';
    sheet = document.createElement("section");
    sheet.className = "chat-sheet";
    sheet.setAttribute("aria-label", "FreshTrail helper chat");
    sheet.innerHTML =
      '<div class="chat-head"><span class="chat-av ico" data-icon="chat"></span><div class="tt"><h2>FreshTrail helper</h2><small><i></i>Instant answers, no sign-in</small></div><button type="button" class="close-btn" aria-label="Close help"><span class="ico" data-icon="x"></span></button></div>' +
      '<div class="chat-msgs" role="log" aria-live="polite"></div>' +
      '<div class="chips"></div>' +
      '<form class="chat-form"><label class="sr-only" for="ft-chat-in">Type your question</label><input id="ft-chat-in" type="text" placeholder="Type your question" autocomplete="off" maxlength="200"><button type="submit" aria-label="Send message"><span class="ico" data-icon="send"></span></button></form>';
    document.body.appendChild(fab);
    document.body.appendChild(sheet);
    FT.hydrateIcons(fab); FT.hydrateIcons(sheet);
    list = sheet.querySelector(".chat-msgs");
    input = sheet.querySelector("#ft-chat-in");
    msgs.forEach(bubble);
    var chips = sheet.querySelector(".chips");
    CHIPS.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = c;
      b.addEventListener("click", function () { ask(c); });
      chips.appendChild(b);
    });
    fab.addEventListener("click", open);
    sheet.querySelector(".close-btn").addEventListener("click", close);
    sheet.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("open")) { close(); } });
    try { if (sessionStorage.getItem(KEY + "_open") === "1") { sheet.classList.add("open"); fab.classList.add("hidden"); scrollDown(); } } catch (e) { /* ignore */ }
    window.FT.openChat = open;
  }
  FT.ready(init);
})();
