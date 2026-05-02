// Daroach Learning — LADDER ENGINE (bilingual: English + Punjabi)
// Single-track linear progression. Same order for every learner.
// Failure model: 3 hearts per concept block; KO -> restart current block from card 1.
// Punjabi (Gurmukhi) is rendered alongside English on every chrome surface.
// Card content stays English by default; cards may add optional `pa`-fields
// (titlePa, bodyPa, frontPa, backPa, promptPa, passagePa, namePa) to opt in.
// No language toggle — Punjabi is always on for our native-Punjabi learners.

(async () => {
  const app = document.getElementById("app");
  const hpFill = document.getElementById("hp-fill");
  const hpText = document.getElementById("hp-text");
  const zeniEl = document.getElementById("zeni");
  const ballsEl = document.getElementById("balls");
  const powerFill = document.getElementById("power-fill");
  const powerLevel = document.getElementById("power-level");
  const rankLabel = document.getElementById("rank-label");
  const ladderProgressEl = document.getElementById("ladder-progress");
  const mapBtn = document.getElementById("map-btn");
  const exportBtn = document.getElementById("export-btn");
  const resetBtn = document.getElementById("reset-btn");
  const soundBtn = document.getElementById("sound-btn");

  // ===== Constants =====
  const SUPER_SAIYAN = 1_000_000;

  // ----- Scaling HP -----
  // Each rank tier grants more max HP, so leveling up gives a bigger buffer.
  // Damage per wrong stays roughly constant, so progression remains real:
  // a tougher run still drains the bar — you just have more room to learn.
  const MAX_HP_BY_TIER = [30, 45, 60, 75, 90, 105, 120, 150];
  const DAMAGE = {
    mcq:   10,  // shared MCQ / fill / read wrong
    boss:  15,  // boss hits hurt more
    tap:   12,  // tap: only first wrong on a card costs HP
    match:  8,  // match: each wrong pair nibbles HP
    speed:  0   // speed sprint never drains HP (timed, by design)
  };
  // Senzu Bean theme: correct reviews restore a sliver of HP.
  const HEAL_ON_REVIEW = 5;

  const XP = {
    intro: 10, flash: 30, mcq: 80, fill: 120, read: 100, boss: 150,
    match: 140, tap: 130, speed: 40
  };
  const XP_WRONG = 5;
  const STREAK_BONUS = 5;

  const ZENI_BASE = 80;
  const ZENI_REVIEW_BONUS = 30;
  const ZENI_BOSS_CLEAR = 500;

  // Leitner-style review boxes
  const BOX_INTERVAL = { 1: 2, 2: 5, 3: 12, 4: 30, 5: 70 };
  const REVIEW_QUEUE_MAX = 80;
  const REVIEW_PROBABILITY = 0.20;
  const MAX_REVIEWS_IN_A_ROW = 2;
  const SENZU_REVIEW_MAX = 3;

  const RANKS = [
    { min: 0,         name: "🌍 EARTHLING",            namePa: "ਧਰਤੀਵਾਸੀ" },
    { min: 1_000,     name: "🥋 Z FIGHTER",            namePa: "ਜ਼ੈੱਡ ਯੋਧਾ" },
    { min: 9_000,     name: "💥 OVER 9000!",           namePa: "9000 ਤੋਂ ਪਾਰ!" },
    { min: 25_000,    name: "🔥 ELITE FIGHTER",        namePa: "ਚੋਟੀ ਦਾ ਯੋਧਾ" },
    { min: 75_000,    name: "🟠 SAIYAN",               namePa: "ਸਾਇਆਨ" },
    { min: 200_000,   name: "✨ SUPER SAIYAN TRAINEE", namePa: "ਸੁਪਰ ਸਾਇਆਨ ਸਿੱਖਿਆਰਥੀ" },
    { min: 500_000,   name: "💛 ASCENDED WARRIOR",     namePa: "ਉੱਚ ਯੋਧਾ" },
    { min: 1_000_000, name: "🌟 SUPER SAIYAN",         namePa: "ਸੁਪਰ ਸਾਇਆਨ" }
  ];
  function rankFor(power) {
    let r = RANKS[0];
    for (const cur of RANKS) if (power >= cur.min) r = cur;
    return r;
  }
  function rankIndex(power) {
    let i = 0;
    for (let k = 0; k < RANKS.length; k++) if (power >= RANKS[k].min) i = k;
    return i;
  }
  function maxHpFor(power) {
    return MAX_HP_BY_TIER[rankIndex(power)] || MAX_HP_BY_TIER[0];
  }

  // Bilingual hype/fail lines — both rendered
  const HYPES = [
    { en: "OVER 9000! 💥",            pa: "9000 ਤੋਂ ਪਾਰ!" },
    { en: "KAMEHAMEHA! 🌊⚡",          pa: "ਜ਼ਬਰਦਸਤ!" },
    { en: "SUPER SAIYAN! 💛",         pa: "ਸ਼ਾਬਾਸ਼!" },
    { en: "POWER UP! 🔥",             pa: "ਤਾਕਤ ਵਧੀ!" },
    { en: "FINAL FLASH! ✨",          pa: "ਚਮਕਦਾਰ!" },
    { en: "GALICK GUN! 💜",           pa: "ਕਮਾਲ!" },
    { en: "SPIRIT BOMB! 🌟",          pa: "ਸ਼ਾਨਦਾਰ!" },
    { en: "INSTANT TRANSMISSION! ⚡",  pa: "ਫਟਾਫਟ ਸਹੀ!" },
    { en: "BOOM! 💥",                 pa: "ਧਮਾਕਾ!" },
    { en: "NICE! ⭐",                 pa: "ਵਾਹ!" },
    { en: "SMART! 🧠",                pa: "ਸਿਆਣੇ!" },
    { en: "YOU ROCK! 🤘",             pa: "ਤੁਸੀਂ ਜ਼ਬਰਦਸਤ ਹੋ!" },
    { en: "DRAGON FIST! 🐲",          pa: "ਡ੍ਰੈਗਨ ਵਾਰ!" },
    { en: "MASENKO! ✨",              pa: "ਚਮਤਕਾਰ!" },
    { en: "BIG BANG ATTACK! 💥",      pa: "ਵੱਡਾ ਧਮਾਕਾ!" },
    { en: "LEGENDARY! 👑",            pa: "ਸ਼ਾਹੀ ਜਿੱਤ!" },
  ];
  const FAILS = [
    { en: "Almost! Train harder, young warrior!",  pa: "ਨੇੜੇ ਸੀ! ਹੋਰ ਮਿਹਨਤ ਕਰੋ, ਨੌਜਵਾਨ ਯੋਧਾ!" },
    { en: "Not quite — power up and try again!",   pa: "ਬਿਲਕੁਲ ਨਹੀਂ — ਤਾਕਤ ਵਧਾਓ ਤੇ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ!" },
    { en: "Senzu bean time! Keep going!",          pa: "ਸੈਨਜ਼ੂ ਬੀਨ ਦਾ ਵੇਲਾ! ਜਾਰੀ ਰੱਖੋ!" },
    { en: "A true Saiyan never gives up!",         pa: "ਸੱਚਾ ਸਾਇਆਨ ਕਦੇ ਹਾਰ ਨਹੀਂ ਮੰਨਦਾ!" },
    { en: "Close one — even Goku misses sometimes.", pa: "ਨੇੜੇ ਸੀ — ਗੋਕੂ ਵੀ ਕਈ ਵਾਰ ਖੁੰਝਦਾ ਹੈ।" },
    { en: "Shake it off — the next one is yours!", pa: "ਛੱਡੋ — ਅਗਲਾ ਤੁਹਾਡਾ ਹੋਵੇਗਾ!" },
  ];
  const COMBO_LINES = {
    3:  { en: "🔥 3x COMBO!",                  pa: "🔥 3 ਵਾਰੀ ਲਗਾਤਾਰ!" },
    5:  { en: "⚡ 5x KAMEHAMEHA STREAK!",       pa: "⚡ 5 ਵਾਰੀ ਲਗਾਤਾਰ!" },
    7:  { en: "💫 7x SUPER SAIYAN STREAK!",    pa: "💫 7 ਵਾਰੀ ਲਗਾਤਾਰ!" },
    10: { en: "🌟 10x LEGENDARY STREAK!",      pa: "🌟 10 ਵਾਰੀ ਲਗਾਤਾਰ!" },
    15: { en: "👑 15x UNSTOPPABLE!",            pa: "👑 15 ਵਾਰੀ — ਨਾ ਰੁਕਣ ਵਾਲੇ!" },
    20: { en: "🐲 20x DRAGON MASTERY!",         pa: "🐲 20 ਵਾਰੀ — ਡ੍ਰੈਗਨ ਮਾਹਿਰ!" },
  };

  // Common bilingual button labels (English  ·  Punjabi)
  const T = {
    next:        { en: "Next",         pa: "ਅੱਗੇ" },
    gotIt:       { en: "Got it",       pa: "ਸਮਝ ਆ ਗਈ" },
    submit:      { en: "Submit",       pa: "ਜਮ੍ਹਾਂ ਕਰੋ" },
    again:       { en: "Again",        pa: "ਦੁਬਾਰਾ" },
    iGotIt:      { en: "I got it",     pa: "ਮੈਨੂੰ ਯਾਦ ਹੈ" },
    imDone:      { en: "I'm done",     pa: "ਮੈਂ ਮੁਕਾ ਲਿਆ" },
    continue:    { en: "Continue",     pa: "ਜਾਰੀ ਰੱਖੋ" },
    riseAgain:   { en: "Rise again",   pa: "ਫਿਰ ਉੱਠੋ" },
    letsGo:      { en: "Let's go",     pa: "ਚੱਲੋ" },
    start:       { en: "START",        pa: "ਸ਼ੁਰੂ" },
    close:       { en: "Close",        pa: "ਬੰਦ ਕਰੋ" },
    openMap:     { en: "Open Map",     pa: "ਨਕਸ਼ਾ ਖੋਲ੍ਹੋ" },
    typeAnswer:  { en: "Type your answer…", pa: "ਆਪਣਾ ਜਵਾਬ ਲਿਖੋ…" },
    streak:      { en: "Streak",       pa: "ਲਗਾਤਾਰ" },
    review:      { en: "REVIEW",       pa: "ਦੁਹਰਾਈ" },
    score:       { en: "Score",        pa: "ਸਕੋਰ" },
    pairs:       { en: "pairs",        pa: "ਜੋੜੇ" },
    found:       { en: "found",        pa: "ਲੱਭੇ" },
    time:        { en: "Time!",        pa: "ਸਮਾਂ!" },
    answer:      { en: "Answer",       pa: "ਜਵਾਬ" },
    question:    { en: "QUESTION",     pa: "ਸਵਾਲ" },
    flashAns:    { en: "ANSWER",       pa: "ਜਵਾਬ" },
    flipHint:    { en: "Tap the card to flip", pa: "ਕਾਰਡ ਤੇ ਟੈਪ ਕਰੋ" },
    flipBack:    { en: "Tap card to flip back", pa: "ਵਾਪਸ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ" },
    revealHint:  { en: "Tap card to reveal", pa: "ਜਵਾਬ ਦੇਖਣ ਲਈ ਟੈਪ ਕਰੋ" },
    flashcard:   { en: "Flashcard",    pa: "ਫਲੈਸ਼ ਕਾਰਡ" },
    noHearts:    { en: "No HP lost on intros", pa: "ਜਾਣ-ਪਛਾਣ ਤੇ HP ਨਹੀਂ ਘਟਦਾ" },
  };
  function bi(key) {
    const t = T[key]; if (!t) return key;
    return `${t.en} <span class="pa pa-inline">${t.pa}</span>`;
  }
  function paLine(text) {
    if (!text) return "";
    return `<div class="pa-block" lang="pa">${text}</div>`;
  }
  function paInline(text) {
    if (!text) return "";
    return ` <span class="pa pa-inline" lang="pa">${text}</span>`;
  }

  // ===== Player system (multi-kid + online leaderboard) =====
  // Each kid on this device gets a separate save slot. The OnlineLB module
  // (see online.js) mirrors every save into Firestore so all devices share
  // a global 🏆 leaderboard.
  const PLAYER_KEY     = "dl_player_v1";   // legacy active player name
  const PLAYERS_KEY    = "dl_players_v1";  // legacy player-name list
  const ACCOUNT_KEY    = "dl_account_v1";
  const CHILDREN_KEY   = "dl_children_v1";
  const ACTIVE_CHILD_KEY = "dl_active_child_v1";
  const DEVICE_KEY     = "dl_device_v1";
  const LOCAL_LB_KEY   = "dl_lb_v1";
  const MAX_CHILDREN_PER_ACCOUNT = 3;

  function rdJSON(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (_) { return fb; } }
  function wrJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function sanitizeName(s) { return String(s || "").replace(/[^\p{L}\p{N} _\-.']/gu, "").trim().slice(0, 20); }
  function slugify(s)      { return sanitizeName(s).toLowerCase().replace(/\s+/g, "-") || "player"; }
  function uid(prefix) {
    if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function getAccount() {
    const a = rdJSON(ACCOUNT_KEY, null);
    if (a && typeof a.id === "string") return a;
    return null;
  }
  function setAccount(a) { wrJSON(ACCOUNT_KEY, a); }

  function getChildren() {
    const a = rdJSON(CHILDREN_KEY, []);
    if (!Array.isArray(a)) return [];
    return a.filter(c => c && typeof c.id === "string" && typeof c.name === "string");
  }
  function setChildren(a) { wrJSON(CHILDREN_KEY, a); }

  function findChildById(id) {
    return getChildren().find(c => c.id === id) || null;
  }
  function findChildByName(name) {
    name = sanitizeName(name);
    return getChildren().find(c => sanitizeName(c.name) === name) || null;
  }

  // ===== Avatar (boy / girl) =====
  const AVATAR_KEY = "dl_avatar_v1"; // namespaced per child: dl_avatar_v1__<childId>
  function getAvatar(childId, legacyName) {
    if (childId) {
      const v = localStorage.getItem(`${AVATAR_KEY}__${childId}`);
      if (v) return v;
    }
    if (legacyName) return localStorage.getItem(`${AVATAR_KEY}__${legacyName}`) || "";
    return "";
  }
  function setAvatar(childId, av) { if (childId && av) localStorage.setItem(`${AVATAR_KEY}__${childId}`, av); }
  function avatarSrc(av) { return av === "girl" ? "girlstart.png" : "boystart.png"; }

  // HTML-escape user-controlled strings before string-template injection.
  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  // Welcome / avatar-picker modal. Returns { name, avatar } or null if cancelled.
  // mode: "full" = name + avatar, "avatar" = avatar only.
  // Pass { cancellable: false } for the very first run when there's no player yet.
  function openWelcomeModal({ mode = "full", suggestedName = "", title = "", cancellable = true } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "welcome-overlay";
      const safeName = escHTML(suggestedName);
      const headTitle = title || (mode === "avatar"
        ? `Pick a fighter for ${safeName || "this player"}!`
        : "⚡ Start Your Adventure");
      const headTitlePa = mode === "avatar"
        ? `${safeName || "ਇਸ ਯੋਧੇ"} ਲਈ ਇੱਕ ਯੋਧਾ ਚੁਣੋ!`
        : "⚡ ਆਪਣੀ ਯਾਤਰਾ ਸ਼ੁਰੂ ਕਰੋ";
      overlay.innerHTML = `
        <div class="welcome-card" role="dialog" aria-modal="true">
          ${cancellable ? '<button type="button" class="welcome-cancel" id="welcome-cancel" aria-label="Close">✕</button>' : ''}
          <p class="welcome-kicker">Punjabi Ji</p>
          <h2 class="welcome-title">${headTitle}</h2>
          <p class="welcome-subtitle pa" lang="pa">${headTitlePa}</p>
          <p class="welcome-hint">Set your name, pick a fighter, and jump in.</p>
          <p class="welcome-pa pa" lang="pa">ਆਪਣਾ ਨਾਂ ਰੱਖੋ, ਯੋਧਾ ਚੁਣੋ ਅਤੇ ਖੇਡ ਸ਼ੁਰੂ ਕਰੋ।</p>
          ${mode === "full" ? `
            <p class="welcome-label">Your fighter name <span class="pa pa-inline" lang="pa">· ਆਪਣਾ ਨਾਂ</span></p>
            <input class="welcome-input" id="welcome-name" type="text" maxlength="20"
                   autocomplete="off" spellcheck="false" placeholder="e.g. Goku"
                   value="${safeName}" />
          ` : ""}
          <p class="welcome-label">Choose your fighter <span class="pa pa-inline" lang="pa">· ਯੋਧਾ ਚੁਣੋ</span></p>
          <div class="avatar-row">
            <button type="button" class="avatar-pick" data-av="boy">
              <img src="boystart.png" alt="Boy fighter" />
              <span>Boy <span class="pa pa-inline" lang="pa">· ਮੁੰਡਾ</span></span>
            </button>
            <button type="button" class="avatar-pick" data-av="girl">
              <img src="girlstart.png" alt="Girl fighter" />
              <span>Girl <span class="pa pa-inline" lang="pa">· ਕੁੜੀ</span></span>
            </button>
          </div>
          <div class="welcome-steps">
            <span>1. Name <span class="pa pa-inline" lang="pa">· ਨਾਂ</span></span>
            <span>2. Avatar <span class="pa pa-inline" lang="pa">· ਯੋਧਾ</span></span>
            <span>3. Start <span class="pa pa-inline" lang="pa">· ਸ਼ੁਰੂ</span></span>
          </div>
          <button type="button" class="welcome-go" id="welcome-go" disabled>Begin Training! ⚡ <span class="pa pa-inline" lang="pa">· ਸਿਖਲਾਈ ਸ਼ੁਰੂ ਕਰੋ!</span></button>
        </div>`;
      document.body.appendChild(overlay);

      let chosenAv = "";
      const goBtn   = overlay.querySelector("#welcome-go");
      const nameInp = overlay.querySelector("#welcome-name");

      function validate() {
        const nm = nameInp ? sanitizeName(nameInp.value) : "ok";
        goBtn.disabled = !chosenAv || (mode === "full" && !nm);
      }
      overlay.querySelectorAll(".avatar-pick").forEach(b => {
        b.addEventListener("click", () => {
          overlay.querySelectorAll(".avatar-pick").forEach(x => x.classList.remove("selected"));
          b.classList.add("selected");
          chosenAv = b.dataset.av;
          validate();
        });
      });
      if (nameInp) {
        nameInp.addEventListener("input", validate);
        nameInp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !goBtn.disabled) goBtn.click(); });
        setTimeout(() => nameInp.focus(), 60);
      }
      goBtn.addEventListener("click", () => {
        const nm = nameInp ? sanitizeName(nameInp.value) : suggestedName;
        cleanup();
        resolve({ name: nm, avatar: chosenAv });
      });

      function close() { cleanup(); resolve(null); }
      function cleanup() {
        document.removeEventListener("keydown", onKey, true);
        overlay.remove();
      }
      function onKey(e) {
        if (cancellable && e.key === "Escape") { e.preventDefault(); close(); }
      }
      if (cancellable) {
        const cancelBtn = overlay.querySelector("#welcome-cancel");
        if (cancelBtn) cancelBtn.addEventListener("click", close);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      }
      document.addEventListener("keydown", onKey, true);
    });
  }

  function migrateLegacyPlayersIntoChildren() {
    if (getChildren().length) return;
    const legacyPlayers = rdJSON(PLAYERS_KEY, []);
    const activeLegacy = sanitizeName(localStorage.getItem(PLAYER_KEY) || "");
    const names = [];
    if (Array.isArray(legacyPlayers)) names.push(...legacyPlayers.map(sanitizeName).filter(Boolean));
    if (activeLegacy) names.push(activeLegacy);
    const uniq = Array.from(new Set(names)).slice(0, MAX_CHILDREN_PER_ACCOUNT);
    if (!uniq.length) return;
    const children = uniq.map(name => ({ id: uid("child"), name }));
    setChildren(children);
    const active = children.find(c => c.name === activeLegacy) || children[0];
    localStorage.setItem(ACTIVE_CHILD_KEY, active.id);
    for (const c of children) {
      const oldAv = localStorage.getItem(`${AVATAR_KEY}__${c.name}`);
      if (oldAv && !localStorage.getItem(`${AVATAR_KEY}__${c.id}`)) {
        localStorage.setItem(`${AVATAR_KEY}__${c.id}`, oldAv);
      }
    }
  }
  migrateLegacyPlayersIntoChildren();

  let account = getAccount();
  if (!account) {
    account = { id: uid("acct"), name: "Family" };
    setAccount(account);
  }

  let children = getChildren();
  let currentChildId = localStorage.getItem(ACTIVE_CHILD_KEY) || "";
  let currentChild = findChildById(currentChildId);

  if (!currentChild) {
    // First run or repaired state: force one child profile.
    let name = "";
    let avatar = "boy";
    while (!name) {
      const result = await openWelcomeModal({ mode: "full", cancellable: false });
      name = sanitizeName(result && result.name);
      avatar = (result && result.avatar) || "boy";
    }
    const child = { id: uid("child"), name };
    children = [child];
    setChildren(children);
    localStorage.setItem(ACTIVE_CHILD_KEY, child.id);
    setAvatar(child.id, avatar);
    currentChild = child;

    // First-run migration: any existing solo dl_* progress becomes this child's slot.
    ["dl_pos_v2","dl_hp_v2","dl_power_v2","dl_zeni_v2","dl_balls_v2",
     "dl_review_v2","dl_cleared_v2","dl_history_v2","dl_seen_v2"].forEach(base => {
      const v = localStorage.getItem(base);
      const ns = `${base}__${child.id}`;
      if (v != null && localStorage.getItem(ns) == null) localStorage.setItem(ns, v);
    });
  }

  currentChildId = currentChild.id;
  const currentPlayer = currentChild.name;

  // Ensure legacy name-keyed progress is available on child-id keys.
  ["dl_pos_v2","dl_hp_v2","dl_power_v2","dl_zeni_v2","dl_balls_v2",
   "dl_review_v2","dl_cleared_v2","dl_history_v2","dl_seen_v2","dl_daily_v2"].forEach(base => {
    const oldKey = `${base}__${currentPlayer}`;
    const newKey = `${base}__${currentChildId}`;
    const oldVal = localStorage.getItem(oldKey);
    if (oldVal != null && localStorage.getItem(newKey) == null) localStorage.setItem(newKey, oldVal);
  });

  if (!getAvatar(currentChildId, currentPlayer)) {
    const result = await openWelcomeModal({ mode: "avatar", suggestedName: currentPlayer, cancellable: false });
    setAvatar(currentChildId, (result && result.avatar) || "boy");
  }

  // Keep legacy keys in sync for compatibility with older builds.
  localStorage.setItem(PLAYER_KEY, currentPlayer);
  wrJSON(PLAYERS_KEY, getChildren().map(c => c.name));

  // Stable per-device id so the same name on two devices doesn't overwrite.
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = (crypto.randomUUID ? crypto.randomUUID() : `d-${Date.now()}-${Math.random().toString(36).slice(2,10)}`);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  function switchToPlayer(ref) {
    let child = findChildById(ref);
    if (!child) child = findChildByName(ref);
    if (!child) return;
    if (child.id === currentChildId) return;
    localStorage.setItem(ACTIVE_CHILD_KEY, child.id);
    localStorage.setItem(PLAYER_KEY, child.name);
    location.reload();
  }
  function deletePlayer(ref) {
    let child = findChildById(ref);
    if (!child) child = findChildByName(ref);
    if (!child) return;
    const name = child.name;
    if (!confirm(`Delete fighter "${name}" and all their progress?\n\nਯੋਧਾ "${name}" ਅਤੇ ਉਹਨਾਂ ਦੀ ਸਾਰੀ ਤਰੱਕੀ ਮਿਟਾਉਣੀ ਹੈ?`)) return;
    ["dl_pos_v2","dl_hp_v2","dl_power_v2","dl_zeni_v2","dl_balls_v2",
     "dl_review_v2","dl_cleared_v2","dl_history_v2","dl_seen_v2","dl_daily_v2"]
      .forEach(base => {
        localStorage.removeItem(`${base}__${child.id}`);
        localStorage.removeItem(`${base}__${name}`); // legacy cleanup
      });
    localStorage.removeItem(`${AVATAR_KEY}__${child.id}`);
    localStorage.removeItem(`${AVATAR_KEY}__${name}`); // legacy cleanup
    const lb = rdJSON(LOCAL_LB_KEY, {});
    for (const k of Object.keys(lb)) {
      const row = lb[k] || {};
      if (row.childId === child.id || row.player === name || row.id === `${child.id}__${deviceId}`) delete lb[k];
    }
    wrJSON(LOCAL_LB_KEY, lb);
    const next = getChildren().filter(c => c.id !== child.id);
    setChildren(next);
    wrJSON(PLAYERS_KEY, next.map(c => c.name));
    if (child.id === currentChildId) {
      localStorage.removeItem(ACTIVE_CHILD_KEY);
      localStorage.removeItem(PLAYER_KEY);
      location.reload();
    }
    else if (typeof renderBoard === "function") renderBoard();
  }

  function canAddChild() {
    return getChildren().length < MAX_CHILDREN_PER_ACCOUNT;
  }

  function addChild(name, avatar) {
    name = sanitizeName(name);
    if (!name) return null;
    const existing = findChildByName(name);
    if (existing) {
      if (avatar) setAvatar(existing.id, avatar);
      return existing;
    }
    const kids = getChildren();
    if (kids.length >= MAX_CHILDREN_PER_ACCOUNT) return null;
    const child = { id: uid("child"), name };
    kids.push(child);
    setChildren(kids);
    wrJSON(PLAYERS_KEY, kids.map(c => c.name));
    if (avatar) setAvatar(child.id, avatar);
    return child;
  }

  // Wire the header chip.
  const playerChipEl  = document.getElementById("player-chip");
  const playerChipNm  = document.getElementById("player-chip-name");
  const playerChipIc  = document.querySelector("#player-chip .player-chip-icon");
  function paintChipAvatar() {
    if (!playerChipIc) return;
    const av = getAvatar(currentChildId, currentPlayer);
    if (av) playerChipIc.innerHTML = `<img src="${avatarSrc(av)}" alt="${av}" />`;
    else    playerChipIc.textContent = "👤";
  }
  paintChipAvatar();

  // ===== Floating fighter portrait (in-game avatar with reactive aura) =====
  const fpEl    = document.getElementById("fighter-portrait");
  const fpImg   = document.getElementById("fp-img");
  const fpBurst = document.getElementById("fp-burst");
  function paintPortrait() {
    if (!fpEl || !fpImg) return;
    const av = getAvatar(currentChildId, currentPlayer);
    // Portrait is the animation king — always visible. Fall back to a default
    // fighter image if no avatar has been chosen yet.
    if (av) {
      fpImg.src = avatarSrc(av);
      fpImg.alt = av;
    } else {
      fpImg.src = "boystart.png";
      fpImg.alt = "fighter";
    }
    fpEl.style.display = "block";
  }
  function updateAura() {
    if (!fpEl) return;
    const max    = maxHpFor(state.power);
    const lowHp  = max > 0 && state.hp / max <= 0.34;
    const superR = state.power >= 75_000;          // SAIYAN+
    const streak = (state.streak || 0) >= 3;
    const wasStreak = fpEl.classList.contains("aura-streak");
    fpEl.classList.toggle("aura-low",    lowHp);
    fpEl.classList.toggle("aura-super",  superR && !lowHp);
    fpEl.classList.toggle("aura-streak", streak && !lowHp && !superR);
    // First frame entering streak: shockwave ring + shout
    if (!wasStreak && streak && !lowHp && !superR) {
      fpEl.classList.add("just-streak");
      setTimeout(() => fpEl && fpEl.classList.remove("just-streak"), 750);
      fpShout("STREAK!", "");
    }
  }
  // Pop a tiny speech bubble off the portrait.
  function fpShout(text, variant) {
    if (!fpEl || !text) return;
    // motionOK gate: shouts are visual, but harmless even without animation
    const node = document.createElement("div");
    node.className = "fp-shout" + (variant ? " " + variant : "");
    node.textContent = text;
    // Cap to 1 visible at a time
    fpEl.querySelectorAll(".fp-shout").forEach(n => n.remove());
    fpEl.appendChild(node);
    setTimeout(() => node.remove(), 1700);
  }
  function fpFlash(kind) {
    if (!fpEl) return;
    fpEl.classList.remove("fp-correct", "fp-damage");
    void fpEl.offsetWidth;
    fpEl.classList.add(kind === "damage" ? "fp-damage" : "fp-correct");
    if (kind !== "damage" && fpBurst) {
      fpBurst.classList.remove("fire");
      void fpBurst.offsetWidth;
      fpBurst.classList.add("fire");
    }
    setTimeout(() => fpEl && fpEl.classList.remove("fp-correct", "fp-damage"), 520);
  }
  paintPortrait();
  if (playerChipNm) playerChipNm.textContent = currentPlayer;
  if (playerChipEl) playerChipEl.addEventListener("click", async () => {
    if (!canAddChild()) {
      toast({
        en: `This account can have up to ${MAX_CHILDREN_PER_ACCOUNT} fighters.`,
        pa: `ਇਸ ਖਾਤੇ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ${MAX_CHILDREN_PER_ACCOUNT} ਯੋਧੇ ਹੋ ਸਕਦੇ ਹਨ।`
      });
      return;
    }
    const result = await openWelcomeModal({
      mode: "full",
      suggestedName: "",
      title: "Switch fighter \u00b7 \u0a2f\u0a4b\u0a27\u0a3e \u0a2c\u0a26\u0a32\u0a4b"
    });
    if (!result) return;
    const nm = sanitizeName(result.name);
    if (!nm) return;
    const child = addChild(nm, result.avatar);
    if (!child) {
      toast({
        en: `This account can have up to ${MAX_CHILDREN_PER_ACCOUNT} fighters.`,
        pa: `ਇਸ ਖਾਤੇ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ${MAX_CHILDREN_PER_ACCOUNT} ਯੋਧੇ ਹੋ ਸਕਦੇ ਹਨ।`
      });
      return;
    }
    switchToPlayer(child.id);
  });

  // ===== Storage =====
  const KEY = {
    pos:    `dl_pos_v2__${currentChildId}`,
    hp:     `dl_hp_v2__${currentChildId}`,
    power:  `dl_power_v2__${currentChildId}`,
    zeni:   `dl_zeni_v2__${currentChildId}`,
    balls:  `dl_balls_v2__${currentChildId}`,
    review: `dl_review_v2__${currentChildId}`,
    cleared:`dl_cleared_v2__${currentChildId}`,
    history:`dl_history_v2__${currentChildId}`,
    daily:  `dl_daily_v2__${currentChildId}`,
    muted:  "dl_muted_v2",
  };
  function loadJSON(k, fb) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; }
    catch (_) { return fb; }
  }
  function saveJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  // legacy migration (from old verb-based app)
  const legacyPower = Number(localStorage.getItem("vtk_power") || 0);
  const legacyZeni  = Number(localStorage.getItem("vtk_zeni")  || 0);
  const legacyBalls = Number(localStorage.getItem("vtk_balls") || 0);

  const savedPos = loadJSON(KEY.pos, null);
  const startIdx = (savedPos && savedPos.ladderVersion === LADDER_VERSION)
    ? Math.min(Math.max(0, savedPos.idx | 0), LADDER_FLAT.length - 1)
    : 0;

  function migrateReviewQueue(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map(x => {
      if (typeof x === "string") return { id: x, box: 1, due: 0, miss: 1 };
      if (x && typeof x === "object" && x.id) {
        return { id: x.id, box: x.box || 1, due: x.due || 0, miss: x.miss || 1 };
      }
      return null;
    }).filter(Boolean);
  }

  const state = {
    idx: startIdx,
    // HP loaded raw; legacy hearts (≤3) and missing values get fixed up
    // after `power` is known so high-rank returners get their tier max,
    // not the Earthling default. Sentinel `null` means "use rank max".
    hp: (() => {
      const raw = localStorage.getItem(KEY.hp);
      if (raw == null) return null;
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) return null;
      if (n <= 3) return null; // legacy heart count
      return n;
    })(),
    power: Number(localStorage.getItem(KEY.power) ?? legacyPower),
    zeni:  Number(localStorage.getItem(KEY.zeni)  ?? legacyZeni),
    balls: Math.min(7, Number(localStorage.getItem(KEY.balls) ?? legacyBalls)),
    reviewQueue: migrateReviewQueue(loadJSON(KEY.review, [])),
    cleared:     loadJSON(KEY.cleared, []),
    history:     loadJSON(KEY.history, []),
    cardsSeen:   Number(localStorage.getItem(`dl_seen_v2__${currentChildId}`) || 0),
    streak: 0,
    flipped: false,
    answered: false,
    activeReviewId: null,
    reviewsInARow: 0,
    senzuMode: false,
    senzuRemaining: 0,
    boss: null,
    read: null,
    match: null,
    tap: null,
    speed: null,
  };
  // Resolve HP now that `power` is loaded:
  //  • null sentinel  → full max for current rank (new player or legacy migration)
  //  • > current max  → clamp down (rank somehow regressed; defensive)
  //  • valid value    → keep as-is (in-progress run)
  {
    const m = maxHpFor(state.power);
    if (state.hp == null || state.hp > m) state.hp = m;
  }

  function persist() {
    saveJSON(KEY.pos, { idx: state.idx, ladderVersion: LADDER_VERSION });
    localStorage.setItem(KEY.hp, state.hp);
    localStorage.setItem(KEY.power, state.power);
    localStorage.setItem(KEY.zeni,  state.zeni);
    localStorage.setItem(KEY.balls, state.balls);
    localStorage.setItem(`dl_seen_v2__${currentChildId}`, state.cardsSeen);
    saveJSON(KEY.review, state.reviewQueue);
    saveJSON(KEY.cleared, state.cleared);
    saveJSON(KEY.history, state.history.slice(-200));
    updateLeaderboard();
  }

  // ===== Leaderboard sync (local + online) =====
  function snapshotRow() {
    const r = rankFor(state.power);
    return {
      id: `${currentChildId}__${deviceId}`,
      childId: currentChildId,
      player: currentPlayer,
      device: deviceId,
      power: state.power | 0,
      zeni:  state.zeni  | 0,
      balls: state.balls | 0,
      rank:  r.name,
      step:  state.idx + 1,
      stepTotal: LADDER_FLAT.length,
      updatedAt: Date.now(),
    };
  }
  function updateLeaderboard() {
    const row = snapshotRow();
    const lb = rdJSON(LOCAL_LB_KEY, {});
    lb[row.id] = row;
    wrJSON(LOCAL_LB_KEY, lb);
    schedulePushOnline(row);
  }
  // Trailing debounce: collapse rapid persist() calls into 1 network write per 2.5 s.
  let _pushTimer = null;
  let _pushPending = null;
  function schedulePushOnline(row) {
    _pushPending = row;
    if (_pushTimer) return;
    _pushTimer = setTimeout(() => {
      _pushTimer = null;
      const r = _pushPending; _pushPending = null;
      if (r && window.OnlineLB && typeof window.OnlineLB.push === "function") {
        try { window.OnlineLB.push(r); } catch (_) {}
      }
    }, 2500);
  }
  // Flush any pending leaderboard write before the tab closes.
  window.addEventListener("pagehide", () => {
    if (_pushTimer) { clearTimeout(_pushTimer); _pushTimer = null; }
    if (_pushPending && window.OnlineLB && typeof window.OnlineLB.push === "function") {
      try { window.OnlineLB.push(_pushPending); } catch (_) {}
      _pushPending = null;
    }
  });

  // ===== Header =====
  // Cached previous values so renderHeader can tween the deltas instead of snapping.
  const _prev = { hp: null, zeni: null, balls: null, power: null };
  function renderHeader() {
    const max = maxHpFor(state.power);
    const pctHp = Math.max(0, Math.min(100, (state.hp / max) * 100));
    if (hpFill) {
      hpFill.style.width = pctHp + "%";
      hpFill.classList.toggle("low", pctHp <= 25);
      hpFill.classList.toggle("mid", pctHp > 25 && pctHp <= 50);
    }
    // HP text: tween down/up smoothly
    if (hpText) {
      const from = _prev.hp == null ? state.hp : _prev.hp;
      tweenNumber(hpText, from, state.hp, 420, (n) => `${Math.round(n)} / ${max}`);
    }
    if (zeniEl) {
      const from = _prev.zeni == null ? state.zeni : _prev.zeni;
      tweenNumber(zeniEl, from, state.zeni, 600);
    }
    if (ballsEl) {
      const before = _prev.balls == null ? state.balls : _prev.balls;
      ballsEl.textContent = `${state.balls}/7`;
      if (state.balls > before) {
        ballsEl.classList.remove("bump"); void ballsEl.offsetWidth; ballsEl.classList.add("bump");
      }
    }
    if (powerLevel) {
      const from = _prev.power == null ? state.power : _prev.power;
      tweenNumber(powerLevel, from, state.power, 700);
      if (_prev.power != null && state.power !== _prev.power) {
        powerLevel.classList.remove("bumped");
        void powerLevel.offsetWidth;
        powerLevel.classList.add("bumped");
        setTimeout(() => powerLevel && powerLevel.classList.remove("bumped"), 320);
      }
    }
    const pct = Math.min(100, (state.power / SUPER_SAIYAN) * 100);
    if (powerFill) {
      powerFill.style.width = pct + "%";
      powerFill.classList.toggle("super-saiyan", state.power >= SUPER_SAIYAN);
      // Sheen pulse whenever power moved up
      if (_prev.power != null && state.power > _prev.power) {
        powerFill.classList.remove("charging"); void powerFill.offsetWidth;
        powerFill.classList.add("charging");
        setTimeout(() => powerFill && powerFill.classList.remove("charging"), 760);
      }
    }
    _prev.hp = state.hp; _prev.zeni = state.zeni;
    _prev.balls = state.balls; _prev.power = state.power;
    if (rankLabel) {
      const r = rankFor(state.power);
      rankLabel.innerHTML = `${r.name}<span class="pa pa-rank" lang="pa"> · ${r.namePa}</span>`;
    }
    if (ladderProgressEl) {
      ladderProgressEl.innerHTML =
        `Step ${state.idx + 1} / ${LADDER_FLAT.length}` +
        ` <span class="pa pa-inline" lang="pa">· ਕਦਮ ${state.idx + 1} / ${LADDER_FLAT.length}</span>`;
    }
    updateAura();
  }

  // ===== FX =====
  // Honor OS reduced-motion: skip non-essential motion + particles when on.
  const _rmq = (typeof matchMedia === "function")
    ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  function motionOK() { return !_rmq.matches; }

  // requestAnimationFrame counter tween for HUD numbers (ease-out cubic).
  function tweenNumber(el, from, to, dur, fmt) {
    if (!el) return;
    fmt = fmt || ((n) => Math.round(n).toLocaleString());
    if (!motionOK() || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const D  = Math.max(120, dur || 600);
    function step(now) {
      const t = Math.min(1, (now - t0) / D);
      const e = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (t < 1) requestAnimationFrame(step);
      else { el.textContent = fmt(to); el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    }
    requestAnimationFrame(step);
  }

  // Click ripple — delegated below; spawns a span at the pointer.
  function addRipple(host, ev) {
    if (!motionOK() || !host) return;
    const r = host.getBoundingClientRect();
    const x = (ev.clientX != null ? ev.clientX : r.left + r.width/2) - r.left;
    const y = (ev.clientY != null ? ev.clientY : r.top  + r.height/2) - r.top;
    const size = Math.max(r.width, r.height);
    const s = document.createElement("span");
    s.className = "ripple";
    s.style.left = (x - size/2) + "px";
    s.style.top  = (y - size/2) + "px";
    s.style.width = s.style.height = size + "px";
    host.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
  document.addEventListener("pointerdown", (e) => {
    const host = e.target.closest(".choice, .mode-btn, .controls button, .hud-btn");
    if (host) addRipple(host, e);
  });

  // Brief radial ki burst from the floating portrait.
  function kiBurst() {
    if (!fpEl || !motionOK()) return;
    const k = document.createElement("div");
    k.className = "fp-ki";
    fpEl.appendChild(k);
    setTimeout(() => k.remove(), 720);
  }

  // Dragon-ball arc: spawn a 🐉 at originEl center, fly to #balls in HUD.
  function dragonBallArc(originEl) {
    if (!motionOK()) return;
    const target = document.getElementById("balls");
    if (!target) return;
    const src = (originEl || document.body).getBoundingClientRect();
    const dst = target.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "ball-fly";
    fly.textContent = "🐉";
    fly.style.left = (src.left + src.width/2 - 22) + "px";
    fly.style.top  = (src.top  + src.height/2 - 22) + "px";
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.left = (dst.left + dst.width/2 - 22) + "px";
      fly.style.top  = (dst.top  + dst.height/2 - 22) + "px";
      fly.classList.add("go");
    });
    setTimeout(() => fly.remove(), 1100);
  }

  // Brief screen shake + golden tint pulse for high-impact moments.
  function screenShake(dur) {
    if (!motionOK()) return;
    document.body.classList.remove("shake-now");
    void document.body.offsetWidth;
    document.body.classList.add("shake-now");
    setTimeout(() => document.body.classList.remove("shake-now"), dur || 450);
  }
  function slowMo() {
    if (!motionOK()) return;
    document.body.classList.remove("slow-mo");
    void document.body.offsetWidth;
    document.body.classList.add("slow-mo");
    setTimeout(() => document.body.classList.remove("slow-mo"), 720);
  }

  // ===== Modern game-feel helpers =====
  // Light vibration on supported phones (iOS Safari ignores; harmless).
  function haptic(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) {}
  }
  // Floating "+200 XP" label that flies up from a screen point.
  function xpPop(text, x, y, variant) {
    if (!motionOK()) return;
    const n = document.createElement("div");
    n.className = "xp-pop" + (variant ? " " + variant : "");
    n.textContent = text;
    n.style.left = x + "px";
    n.style.top  = y + "px";
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1000);
  }
  // Burst N particles outward from a point in random directions.
  function particleBurst(x, y, count, color) {
    if (!motionOK()) return;
    const colors = color ? [color] : ["", "cyan", "green", "pink"];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle " + colors[i % colors.length];
      p.style.left = x + "px";
      p.style.top  = y + "px";
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      p.style.animationDuration = (600 + Math.random() * 400) + "ms";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1100);
    }
  }
  // Persistent combo multiplier badge ("3x COMBO").
  let _comboTimer = null;
  function comboMeter(streak) {
    let el = document.getElementById("combo-meter");
    if (!el) {
      el = document.createElement("div");
      el.id = "combo-meter";
      el.className = "combo-meter";
      document.body.appendChild(el);
    }
    if (streak < 2) { el.classList.remove("show", "bump", "x5", "x10"); return; }
    el.textContent = streak + "× COMBO";
    el.classList.toggle("x5",  streak >= 5  && streak < 10);
    el.classList.toggle("x10", streak >= 10);
    el.classList.add("show");
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    clearTimeout(_comboTimer);
    _comboTimer = setTimeout(() => el.classList.remove("show"), 4500);
  }
  function flashCard(klass) {
    const c = document.querySelector(".card");
    if (!c) return;
    c.classList.remove("flash-correct", "flash-wrong");
    void c.offsetWidth;
    c.classList.add(klass);
    setTimeout(() => c && c.classList.remove(klass), 600);
  }
  // Resolve a screen point: prefer last pointer, fall back to card center.
  let _lastPt = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  document.addEventListener("pointerdown", (e) => {
    _lastPt = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  function pickPoint() {
    return { x: _lastPt.x, y: _lastPt.y };
  }

  // Cinematic boss-name slam overlay; resolves after the show.
  function bossIntroOverlay(card) {
    return new Promise((resolve) => {
      if (!motionOK()) return resolve();
      const o = document.createElement("div");
      o.className = "boss-intro-overlay";
      o.innerHTML = `
        <div style="text-align:center">
          <span class="boss-intro-emoji">${card.emoji || "👹"}</span>
          <div class="boss-intro-name">${card.name || "BOSS"}</div>
          ${card.namePa ? `<div class="boss-intro-name pa" lang="pa">${card.namePa}</div>` : ""}
        </div>`;
      document.body.appendChild(o);
      screenShake(420);
      setTimeout(() => { o.remove(); resolve(); }, 1450);
    });
  }

  function flash() {
    if (!motionOK()) return;
    const f = document.createElement("div");
    f.className = "kame-flash";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
  }
  // toast() accepts a string OR { en, pa }; renders both lines if pa given.
  function toast(textOrObj, cls = "") {
    const t = document.createElement("div");
    t.className = "ball-toast " + cls;
    if (typeof textOrObj === "string") {
      t.innerHTML = textOrObj;
    } else {
      t.innerHTML = `${textOrObj.en}${paLine(textOrObj.pa)}`;
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  // ----- Sound -----
  let muted = localStorage.getItem(KEY.muted) === "1";
  let _ac = null;
  function ac() {
    if (muted) return null;
    try {
      if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
      if (_ac.state === "suspended") _ac.resume();
      return _ac;
    } catch (_) { return null; }
  }
  function beep(freq, dur = 0.12, type = "sine", vol = 0.18, slideTo = null) {
    const a = ac(); if (!a) return;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  }
  const SFX = {
    correct() { beep(880, 0.10, "triangle", 0.18); setTimeout(() => beep(1320, 0.14, "triangle", 0.16), 80); },
    wrong()   { beep(220, 0.18, "sawtooth", 0.14, 110); },
    combo(n)  { beep(660 + n * 30, 0.10, "square", 0.16); setTimeout(() => beep(990 + n * 30, 0.16, "square", 0.14), 80); },
    blockClear() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.18), i * 90)); },
    bossHit() { beep(140, 0.14, "sawtooth", 0.20, 70); },
    bossWin() { [392, 523, 659, 784, 988, 1175].forEach((f, i) => setTimeout(() => beep(f, 0.18, "triangle", 0.20), i * 110)); },
    rankUp()  { [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.18, "square", 0.18), i * 100)); },
    ko()      { [330, 247, 165].forEach((f, i) => setTimeout(() => beep(f, 0.22, "sawtooth", 0.18), i * 120)); },
    ball()    { beep(660, 0.10, "sine", 0.20); setTimeout(() => beep(990, 0.12, "sine", 0.18), 80); setTimeout(() => beep(1320, 0.16, "sine", 0.18), 160); },
  };

  function confetti(count = 24, emojis = ["✨", "⭐", "💥", "🔥", "🌟", "⚡"]) {
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    document.body.appendChild(layer);
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "confetti-piece";
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const x = (Math.random() * 100).toFixed(1);
      const dx = ((Math.random() - 0.5) * 60).toFixed(1);
      const rot = (Math.random() * 720 - 360).toFixed(0);
      const dur = (1.2 + Math.random() * 1.2).toFixed(2);
      const delay = (Math.random() * 0.25).toFixed(2);
      p.style.left = x + "%";
      p.style.setProperty("--dx", dx + "vw");
      p.style.setProperty("--rot", rot + "deg");
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = delay + "s";
      p.style.fontSize = (16 + Math.random() * 18).toFixed(0) + "px";
      layer.appendChild(p);
    }
    setTimeout(() => layer.remove(), 2800);
  }

  function comboBanner(n) {
    const line = COMBO_LINES[n];
    if (!line) return;
    const b = document.createElement("div");
    b.className = "combo-banner";
    b.innerHTML = `${line.en}${paLine(line.pa)}`;
    document.body.appendChild(b);
    SFX.combo(n);
    setTimeout(() => b.remove(), 1500);
  }

  function juiceCard(klass) {
    const c = document.querySelector(".card");
    if (!c) return;
    c.classList.remove("shake", "pop");
    void c.offsetWidth;
    c.classList.add(klass);
  }

  function addPower(n) {
    if (n > 0) fpFlash("correct");
    const beforeIdx = rankIndex(state.power);
    state.power = Math.max(0, state.power + n);
    const afterIdx = rankIndex(state.power);
    if (afterIdx > beforeIdx) {
      const after = RANKS[afterIdx];
      // Rank up = bigger HP bar AND a full heal.
      refillHp();
      slowMo();
      toast({
        en: `RANK UP! ${after.name} · HP ${maxHpFor(state.power)} restored!`,
        pa: `ਦਰਜਾ ਵਧਿਆ! ${after.namePa} · HP ${maxHpFor(state.power)} ਪੂਰੀ!`
      }, "rank rank-up");
      SFX.rankUp(); confetti(40);
      fpShout("RANK UP!", "super");
      haptic([30, 50, 30, 50, 80]);
    }
  }
  function addZeni(n) { state.zeni = Math.max(0, state.zeni + n); }
  function dealDamage(n) {
    state.hp = Math.max(0, state.hp - (n | 0));
    if (n > 0) {
      fpFlash("damage");
      const max = maxHpFor(state.power);
      const pct = max > 0 ? state.hp / max : 1;
      fpShout(pct <= 0.34 ? "DANGER!" : "OUCH!", "danger");
    }
  }
  function heal(n) {
    const max = maxHpFor(state.power);
    state.hp = Math.min(max, state.hp + (n | 0));
  }
  function refillHp() { state.hp = maxHpFor(state.power); }

  // ===== Review queue =====
  function queueReview(id) {
    let item = state.reviewQueue.find(x => x.id === id);
    if (item) {
      item.box = 1;
      item.miss = (item.miss || 0) + 1;
      item.due = state.cardsSeen + BOX_INTERVAL[1];
    } else {
      state.reviewQueue.push({ id, box: 1, miss: 1, due: state.cardsSeen + BOX_INTERVAL[1] });
    }
    if (state.reviewQueue.length > REVIEW_QUEUE_MAX) {
      state.reviewQueue.sort((a, b) => (b.box - a.box) || (b.due - a.due));
      state.reviewQueue.length = REVIEW_QUEUE_MAX;
    }
  }
  function promoteReview(id) {
    const item = state.reviewQueue.find(x => x.id === id);
    if (!item) return;
    item.box = Math.min(5, item.box + 1);
    if (item.box >= 5) {
      state.reviewQueue = state.reviewQueue.filter(x => x.id !== id);
    } else {
      item.due = state.cardsSeen + BOX_INTERVAL[item.box];
    }
  }
  function clearReview(id) {
    state.reviewQueue = state.reviewQueue.filter(x => x.id !== id);
  }
  function dueReviews() {
    return state.reviewQueue.filter(x => x.due <= state.cardsSeen);
  }
  function pickDueReview() {
    const due = dueReviews();
    if (!due.length) return null;
    due.sort((a, b) => (b.miss - a.miss) || (a.due - b.due));
    return due[0];
  }

  // ===== Ladder =====
  function currentEntry() { return LADDER_FLAT[state.idx]; }
  function entryById(id) { return LADDER_FLAT.find(e => e.card.id === id); }
  function blockEndsAt(blockStart) {
    let i = blockStart;
    while (i + 1 < LADDER_FLAT.length && LADDER_FLAT[i + 1].blockStart === blockStart) i++;
    return i;
  }

  function resetCardLocalState() {
    state.flipped = false;
    state.answered = false;
    state.activeReviewId = null;
    state.boss = null;
    state.read = null;
    state.match = null;
    state.tap = null;
    state.speed = null;
  }

  function advance() {
    const entry = currentEntry();
    const isLastInBlock = state.idx === blockEndsAt(entry.blockStart);

    if (isLastInBlock) {
      if (!state.cleared.includes(entry.blockId)) {
        state.cleared.push(entry.blockId);
        if (entry.isBoss) {
          if (state.balls < 7) state.balls += 1;
          addZeni(ZENI_BOSS_CLEAR);
          // Cinematic dragon-ball arc from card center to HUD
          const card = document.querySelector(".card");
          dragonBallArc(card);
          slowMo();
          toast({
            en: `🐉 Dragon Ball! (${state.balls}/7) — +${ZENI_BOSS_CLEAR} 💰`,
            pa: `🐉 ਡ੍ਰੈਗਨ ਬਾਲ! (${state.balls}/7) — +${ZENI_BOSS_CLEAR} 💰`
          });
          SFX.bossWin(); SFX.ball();
          confetti(60, ["🐉", "⭐", "✨", "🏆", "🔥", "💫"]);
          if (state.balls >= 7) {
            toast({ en: "🐉 ALL 7 BALLS! Make a wish!", pa: "🐉 ਸਾਰੇ 7 ਬਾਲ! ਇੱਕ ਇੱਛਾ ਕਰੋ!" }, "rank");
            confetti(80);
          }
        } else {
          toast({
            en: `✅ Block cleared: ${entry.blockTitle}`,
            pa: `✅ ਪੜਾਅ ਪਾਰ: ${entry.blockTitle}`
          });
          SFX.blockClear();
          confetti(28);
        }
      }
      refillHp();
      const due = dueReviews();
      if (due.length && !state.senzuMode) {
        state.senzuMode = true;
        state.senzuRemaining = Math.min(SENZU_REVIEW_MAX, due.length);
        toast({
          en: `🌿 Senzu Review — ${state.senzuRemaining} quick recap${state.senzuRemaining > 1 ? "s" : ""}`,
          pa: `🌿 ਸੈਨਜ਼ੂ ਦੁਹਰਾਈ — ${state.senzuRemaining} ਛੋਟੇ ਸਵਾਲ`
        }, "rank");
        resetCardLocalState();
        persist();
        return renderSenzuIntro();
      }
    }

    if (state.idx + 1 < LADDER_FLAT.length) {
      state.idx += 1;
    } else {
      resetCardLocalState();
      persist();
      return renderVictory();
    }

    resetCardLocalState();
    persist();
    render();
  }

  function renderSenzuIntro() {
    renderHeader();
    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card senzu-card">
          <div class="emoji-big">🌿</div>
          <h2>Senzu Review!${paInline("ਸੈਨਜ਼ੂ ਦੁਹਰਾਈ!")}</h2>
          <p>Quick recap of <b>${state.senzuRemaining}</b> things you missed earlier.<br>Master them and they'll graduate from your review pile!</p>
          ${paLine(`ਪਹਿਲਾਂ ਖੁੰਝੀਆਂ <b>${state.senzuRemaining}</b> ਚੀਜ਼ਾਂ ਦੀ ਛੋਟੀ ਦੁਹਰਾਈ। ਸਹੀ ਕਰੋ ਤੇ ਇਹ ਦੁਹਰਾਈ-ਸੂਚੀ ਵਿੱਚੋਂ ਪਾਸ ਹੋ ਜਾਣਗੀਆਂ!`)}
          <p class="ko-note">+30 ⚡ bonus per correct review.${paInline("ਹਰ ਸਹੀ ਜਵਾਬ ਤੇ +30 ⚡")}</p>
          <div class="controls" style="justify-content:center">
            <button id="senzu-go">${bi("letsGo")} 🌿</button>
          </div>
        </div>
      </div>`;
    document.getElementById("senzu-go").onclick = () => render();
  }

  function knockout() {
    const entry = currentEntry();
    // Cinematic KO: red vignette + portrait drop + screen shake before reset
    if (motionOK()) {
      document.body.classList.add("ko-now");
      if (fpEl) { fpEl.classList.add("fp-ko"); }
      screenShake(420);
      setTimeout(() => {
        document.body.classList.remove("ko-now");
        if (fpEl) fpEl.classList.remove("fp-ko");
      }, 950);
    }
    state.idx = entry.blockStart;
    refillHp();
    state.streak = 0;
    state.senzuMode = false;
    state.senzuRemaining = 0;
    resetCardLocalState();
    persist();
    renderKO(entry);
  }

  // ===== Render dispatch =====
  function render() {
    renderHeader();

    if (state.senzuMode) {
      if (state.senzuRemaining > 0) {
        const item = pickDueReview();
        if (item) {
          const re = entryById(item.id);
          if (re && (re.card.type === "mcq" || re.card.type === "fill" || re.card.type === "flash")) {
            state.activeReviewId = item.id;
            state.flipped = false; state.answered = false;
            return renderCard(re, true);
          } else {
            clearReview(item.id);
            state.senzuRemaining -= 1;
            return render();
          }
        }
      }
      state.senzuMode = false;
      state.senzuRemaining = 0;
      if (state.idx + 1 < LADDER_FLAT.length) {
        state.idx += 1;
        resetCardLocalState();
        persist();
        return render();
      } else {
        resetCardLocalState();
        persist();
        return renderVictory();
      }
    }

    const entry = currentEntry();
    const cardType = entry.card.type;
    const dueItem = pickDueReview();
    const canInterrupt = !state.activeReviewId
      && cardType !== "boss" && cardType !== "intro"
      && state.reviewsInARow < MAX_REVIEWS_IN_A_ROW;

    if (canInterrupt && dueItem) {
      const re = entryById(dueItem.id);
      if (re && re.card.type !== "boss" && re.card.type !== "intro" && re.card.type !== "read") {
        state.activeReviewId = dueItem.id;
        state.reviewsInARow += 1;
        state.flipped = false; state.answered = false;
        return renderCard(re, true);
      }
    }
    if (canInterrupt && !dueItem && state.reviewQueue.length && Math.random() < REVIEW_PROBABILITY) {
      const item = state.reviewQueue[Math.floor(Math.random() * Math.min(5, state.reviewQueue.length))];
      const re = entryById(item.id);
      if (re && re.card.type !== "boss" && re.card.type !== "intro" && re.card.type !== "read") {
        state.activeReviewId = item.id;
        state.reviewsInARow += 1;
        state.flipped = false; state.answered = false;
        return renderCard(re, true);
      }
    }
    state.reviewsInARow = 0;

    // ⚔️ Random Attack hook — fires occasionally between regular cards.
    // Skips on intro/boss/read; never during senzu or active review.
    if (cardType !== "intro" && cardType !== "boss" && cardType !== "read"
        && !state.activeReviewId && !state.senzuMode
        && window.Attacks && typeof Attacks.maybeRun === "function") {
      try { if (Attacks.maybeRun(state)) return; } catch (e) { console.warn("[Attacks]", e); }
    }

    state.cardsSeen += 1;
    renderCard(entry, false);
  }

  function renderCard(entry, isReview) {
    clearIdleNudge();
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(_){}
    const card = entry.card;
    const reviewBadge = isReview
      ? `<span class="review-badge">🔁 ${T.review.en} <span class="pa pa-inline" lang="pa">${T.review.pa}</span></span>`
      : '';
    const wrap = (inner, extra = "") =>
      `<div class="ladder-frame">
         <div class="block-banner">
           <span class="unit-tag">${entry.unitEmoji} ${entry.unitTitle}</span>
           <span class="dot">·</span>
           <span class="block-tag">${entry.blockEmoji} ${entry.blockTitle}</span>
           ${reviewBadge}
         </div>
         <div class="card ${extra}">${inner}</div>
       </div>`;
    switch (card.type) {
      case "intro": renderIntro(card, wrap); break;
      case "flash": renderFlash(card, wrap, isReview); break;
      case "mcq":   renderMCQ(card, wrap, isReview); break;
      case "fill":  renderFill(card, wrap, isReview); break;
      case "read":  renderRead(card, wrap, isReview); break;
      case "boss":  renderBoss(card, wrap); break;
      case "match": renderMatch(card, wrap); break;
      case "tap":   renderTap(card, wrap); break;
      case "speed": renderSpeed(card, wrap); break;
      default:      app.innerHTML = wrap(`<p>Unknown card type: ${card.type}</p>`);
    }
    // Attach 🔊 + 💡 help controls and start inactivity nudge timer.
    try { attachHelpControls(card); armIdleNudge(card); } catch(_){}
  }

  function curOrReview(isReview) {
    return isReview ? entryById(state.activeReviewId) : currentEntry();
  }

  // ===== Learner-aid utilities =====
  // Strip HTML tags so we can speak/show clean text.
  function stripTags(s) {
    return String(s == null ? "" : s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  // Levenshtein distance for near-miss detection on fill answers.
  function levenshtein(a, b) {
    a = String(a); b = String(b);
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0]; dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        dp[j] = a[i-1] === b[j-1] ? prev : 1 + Math.min(prev, dp[j], dp[j-1]);
        prev = tmp;
      }
    }
    return dp[n];
  }

  // Web Speech API read-aloud. Cancels any prior utterance.
  function speak(text, lang) {
    try {
      if (!("speechSynthesis" in window)) return;
      const clean = stripTags(text);
      if (!clean) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang || "en-US";
      u.rate = 0.95;
      u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }
  // Auto-stop speech when leaving page.
  if (!window.__dlSpeechBound) {
    window.addEventListener("beforeunload", () => { try { window.speechSynthesis.cancel(); } catch(_){} });
    window.__dlSpeechBound = true;
  }

  // Build the small "What do I do?" hint text per card type.
  function hintFor(card) {
    switch (card.type) {
      case "mcq":
        return { en: "Tap the answer you think is correct.", pa: "ਸਹੀ ਜਵਾਬ ਤੇ ਟੈਪ ਕਰੋ।" };
      case "fill":
        return { en: "Type your answer in the box and press Enter. Try one of the words shown in parentheses.", pa: "ਡੱਬੇ ਵਿੱਚ ਜਵਾਬ ਲਿਖੋ ਅਤੇ Enter ਦਬਾਓ। ਬ੍ਰੈਕਟ ਵਿੱਚੋਂ ਕੋਈ ਸ਼ਬਦ ਚੁਣੋ।" };
      case "read":
        return { en: "Read the passage above, then tap the answer to each question.", pa: "ਉੱਪਰ ਪੈਰਾ ਪੜ੍ਹੋ, ਫਿਰ ਜਵਾਬ ਤੇ ਟੈਪ ਕਰੋ।" };
      case "flash":
        return { en: "Tap the card to flip it. Try to remember the back side.", pa: "ਕਾਰਡ ਪਲਟਣ ਲਈ ਟੈਪ ਕਰੋ।" };
      case "match":
        return { en: "Tap one tile, then tap its matching tile to pair them.", pa: "ਜੋੜਾ ਬਣਾਉਣ ਲਈ ਦੋ ਟਾਈਲਾਂ ਤੇ ਟੈਪ ਕਰੋ।" };
      case "tap":
        return { en: "Tap ONLY the words that match the rule shown.", pa: "ਸਿਰਫ਼ ਸਹੀ ਸ਼ਬਦਾਂ ਤੇ ਟੈਪ ਕਰੋ।" };
      case "speed":
        return { en: "Answer as many as you can before time runs out!", pa: "ਸਮੇਂ ਤੋਂ ਪਹਿਲਾਂ ਵੱਧ ਤੋਂ ਵੱਧ ਜਵਾਬ ਦਿਓ!" };
      case "boss":
        return { en: "This is the BOSS! Answer each question to win the block.", pa: "ਬੌਸ ਲੜਾਈ! ਹਰ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦਿਓ।" };
      default:
        return { en: "Tap Next to continue.", pa: "ਅੱਗੇ ਜਾਣ ਲਈ Next ਦਬਾਓ।" };
    }
  }

  // Inject 🔊 read-aloud + 💡 hint controls just under the prompt area.
  // Call AFTER app.innerHTML is set. `card` is the current card object.
  function attachHelpControls(card) {
    const q = document.querySelector(".quiz-question, .passage, .flash-text, .intro-body");
    if (!q) return;
    const bar = document.createElement("div");
    bar.className = "help-bar";
    bar.innerHTML = `
      <button type="button" class="help-btn help-speak" title="Read aloud" aria-label="Read aloud">🔊</button>
      <button type="button" class="help-btn help-hint" title="What do I do?" aria-label="What do I do?">💡</button>
      <div class="help-text" id="help-text" hidden></div>
    `;
    q.insertAdjacentElement("afterend", bar);
    const speakBtn = bar.querySelector(".help-speak");
    const hintBtn = bar.querySelector(".help-hint");
    const textEl = bar.querySelector("#help-text");
    speakBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Speak the most relevant text on the current card view.
      const passage = document.querySelector(".passage");
      const prompt = document.querySelector(".quiz-question");
      const flash = document.querySelector(".flash-text");
      const intro = document.querySelector(".intro-body");
      const txt = stripTags((passage && passage.innerText) || (prompt && prompt.innerText) || (flash && flash.innerText) || (intro && intro.innerText) || "");
      speak(txt, "en-US");
    });
    hintBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const h = hintFor(card);
      textEl.innerHTML = `${escHTML(h.en)}<div class="pa-block" lang="pa">${escHTML(h.pa)}</div>`;
      textEl.hidden = false;
    });
  }

  // Inactivity nudge: if no input/click for N seconds on the current card,
  // gently pulse the help buttons and surface a short reminder.
  let _idleTimer = null, _idleHardTimer = null;
  function clearIdleNudge() {
    if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
    if (_idleHardTimer) { clearTimeout(_idleHardTimer); _idleHardTimer = null; }
    document.querySelectorAll(".help-btn.nudging").forEach(b => b.classList.remove("nudging"));
  }
  function armIdleNudge(card) {
    clearIdleNudge();
    const reset = () => {
      clearIdleNudge();
      armIdleNudge(card);
    };
    const stopOnAction = () => {
      ["keydown", "pointerdown", "input"].forEach(ev =>
        document.removeEventListener(ev, stopOnAction, true));
      reset();
    };
    ["keydown", "pointerdown", "input"].forEach(ev =>
      document.addEventListener(ev, stopOnAction, true));
    _idleTimer = setTimeout(() => {
      const hintBtn = document.querySelector(".help-btn.help-hint");
      const speakBtn = document.querySelector(".help-btn.help-speak");
      if (hintBtn) hintBtn.classList.add("nudging");
      if (speakBtn) speakBtn.classList.add("nudging");
    }, 15000);
    _idleHardTimer = setTimeout(() => {
      const textEl = document.getElementById("help-text");
      if (textEl && textEl.hidden) {
        const h = hintFor(card);
        textEl.innerHTML = `${escHTML(h.en)}<div class="pa-block" lang="pa">${escHTML(h.pa)}</div>`;
        textEl.hidden = false;
      }
    }, 30000);
  }

  function streakLine() {
    const queue = state.reviewQueue.length ? `  ·  🔁 ${state.reviewQueue.length}` : "";
    return `⚔️ ${T.streak.en} <span class="pa pa-inline" lang="pa">${T.streak.pa}</span>: ${state.streak}${queue}`;
  }

  // ----- Intro -----
  function renderIntro(card, wrap) {
    app.innerHTML = wrap(`
      <div class="aura"><div class="emoji-big">📜</div></div>
      <h2 class="intro-title">${card.title}</h2>
      ${paLine(card.titlePa)}
      <p class="intro-body">${card.body}</p>
      ${paLine(card.bodyPa)}
      <div class="controls">
        <div class="progress">${T.noHearts.en}<br><span class="pa pa-inline" lang="pa">${T.noHearts.pa}</span></div>
        <button id="next-btn">${bi("gotIt")} ➡️</button>
      </div>
    `, "intro-card");
    document.getElementById("next-btn").onclick = () => advance();
  }

  // ----- Flashcard -----
  function renderFlash(card, wrap, isReview) {
    const face = state.flipped ? card.back : card.front;
    const facePa = state.flipped ? card.backPa : card.frontPa;
    const label = state.flipped ? T.flashAns : T.question;
    const hint = state.flipped ? T.flipBack : T.revealHint;
    app.innerHTML = wrap(`
      <div class="flash-face" id="flash-face">
        <div class="flash-label">${label.en} <span class="pa pa-inline" lang="pa">${label.pa}</span></div>
        <div class="flash-text">${face}</div>
        ${paLine(facePa)}
        <div class="flash-hint">${hint.en}<br><span class="pa pa-inline" lang="pa">${hint.pa}</span></div>
      </div>
      <div class="controls">
        ${state.flipped
          ? `<button id="again-btn" class="ghost-btn">🔁 ${bi("again")}</button>
             <div class="progress">${T.flashcard.en} <span class="pa pa-inline" lang="pa">${T.flashcard.pa}</span></div>
             <button id="got-btn">${bi("iGotIt")} ✅</button>`
          : `<div class="progress" style="flex:1;text-align:center">${T.flipHint.en}<br><span class="pa pa-inline" lang="pa">${T.flipHint.pa}</span></div>`}
      </div>
    `, "flash-card");
    document.getElementById("flash-face").onclick = () => {
      state.flipped = !state.flipped;
      renderCard(curOrReview(isReview), isReview);
    };
    if (state.flipped) {
      document.getElementById("again-btn").onclick = () => {
        state.flipped = false;
        renderCard(curOrReview(isReview), isReview);
      };
      document.getElementById("got-btn").onclick = () => {
        addPower(XP.flash);
        addZeni(ZENI_BASE);
        flash();
        state.history.push({ id: card.id, t: Date.now(), ok: true });
        if (isReview) { clearReview(state.activeReviewId); finishReview(); }
        else advance();
      };
    }
  }

  // ----- MCQ -----
  function renderMCQ(card, wrap, isReview) {
    const longChoices = card.choices.some(c => String(c).length > 24);
    // Optional per-choice Punjabi gloss: card.choicesPa is { "choice text": "ਪੰਜਾਬੀ" }
    const cpa = card.choicesPa || {};
    app.innerHTML = wrap(`
      <div class="quiz-question">${card.prompt}</div>
      ${paLine(card.promptPa)}
      <div class="choices ${longChoices ? "choices-stack" : ""}">
        ${card.choices.map(c => {
          const gloss = cpa[c] ? `<span class="pa-choice" lang="pa">${cpa[c]}</span>` : "";
          return `<button class="choice ${longChoices ? "long-choice" : ""}" data-c="${encodeURIComponent(c)}">${c}${gloss}</button>`;
        }).join("")}
      </div>
      <div class="feedback" id="feedback"></div>
      <div class="controls">
        <div class="progress">${streakLine()}</div>
        <button id="next-btn" disabled>${bi("next")} ➡️</button>
      </div>
    `);
    bindChoiceHandlers(card.id, card.correct, isReview, XP.mcq);
  }

  // ----- Fill -----
  function renderFill(card, wrap, isReview) {
    let choicesHTML = "";
    if (Array.isArray(card.choices) && card.choices.length) {
      const shuffled = card.choices.slice().sort(() => Math.random() - 0.5);
      choicesHTML = `<span class="fill-choices">(${shuffled.map(escHTML).join(" / ")})</span>`;
    }
    app.innerHTML = wrap(`
      <div class="quiz-question">${card.prompt} ${choicesHTML}</div>
      ${paLine(card.promptPa)}
      <div class="fill-row">
        <input id="fill-input" class="fill-input" type="text" autocomplete="off"
               autocapitalize="off" autocorrect="off" spellcheck="false"
               placeholder="${T.typeAnswer.en}  ·  ${T.typeAnswer.pa}" />
        <button id="fill-submit" class="primary-btn">${bi("submit")}</button>
      </div>
      <div class="feedback" id="feedback"></div>
      <div class="controls">
        <div class="progress">${streakLine()}</div>
        <button id="next-btn" disabled>${bi("next")} ➡️</button>
      </div>
    `);
    const input = document.getElementById("fill-input");
    const submit = document.getElementById("fill-submit");
    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");
    setTimeout(() => input.focus(), 50);

    // Track one near-miss "second chance" before counting a wrong answer.
    let nearMissUsed = false;
    function tryAnswer() {
      if (state.answered) return;
      const raw = (input.value || "").trim();
      const v = raw.toLowerCase().replace(/[.!?,;:]+$/g, "").trim();
      if (!v) return;
      const accepts = card.accept.map(s => String(s).toLowerCase().replace(/[.!?,;:]+$/g, "").trim());
      const ok = accepts.includes(v);
      if (ok) {
        state.answered = true;
        input.disabled = true; submit.disabled = true;
        handleCorrect(card.id, isReview, XP.fill, fb);
        next.disabled = false;
        next.onclick = () => isReview ? finishReview() : advance();
        return;
      }
      // Friendly near-miss: typo within edit-distance 2 of any accept value.
      const minDist = Math.min(...accepts.map(a => levenshtein(v, a)));
      const looksLikeTypo = minDist > 0 && minDist <= 2 && v.length >= 2;
      if (!nearMissUsed && looksLikeTypo) {
        nearMissUsed = true;
        fb.innerHTML = `🤏 So close — check the spelling and try again!` +
                       paLine(`🤏 ਨੇੜੇ ਸੀ — ਸਪੈਲਿੰਗ ਚੈੱਕ ਕਰੋ ਅਤੇ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ!`);
        input.select();
        return;
      }
      // Friendly type-mismatch hint.
      const wantsNumber = accepts.every(a => /^[\d.,]+$/.test(a));
      if (!nearMissUsed && wantsNumber && !/^[\d.,]+$/.test(v)) {
        nearMissUsed = true;
        fb.innerHTML = `🔢 This one wants a number — try again with digits!` +
                       paLine(`🔢 ਇੱਥੇ ਨੰਬਰ ਚਾਹੀਦਾ ਹੈ — ਅੰਕਾਂ ਨਾਲ ਫੇਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ!`);
        input.select();
        return;
      }
      state.answered = true;
      input.disabled = true; submit.disabled = true;
      handleWrong(card.id, card.accept[0], fb);
      next.disabled = false;
      next.onclick = () => isReview ? finishReview() : advance();
    }
    submit.onclick = tryAnswer;
    input.addEventListener("keydown", e => { if (e.key === "Enter") tryAnswer(); });
  }

  // ----- Read -----
  function renderRead(card, wrap, isReview) {
    if (!state.read || state.read.cardId !== card.id) {
      state.read = { cardId: card.id, qIdx: 0, answered: false, allCorrect: true };
    }
    const r = state.read;
    const q = card.questions[r.qIdx];
    const longChoices = q.choices.some(c => String(c).length > 24);
    app.innerHTML = wrap(`
      <div class="passage">📖 ${card.passage}</div>
      ${paLine(card.passagePa)}
      <div class="quiz-question">Q${r.qIdx + 1}/${card.questions.length}: ${q.prompt}</div>
      ${paLine(q.promptPa)}
      <div class="choices ${longChoices ? "choices-stack" : ""}">
        ${q.choices.map(c =>
          `<button class="choice ${longChoices ? "long-choice" : ""}" data-c="${encodeURIComponent(c)}">${c}</button>`
        ).join("")}
      </div>
      <div class="feedback" id="feedback"></div>
      <div class="controls">
        <div class="progress">${streakLine()}</div>
        <button id="next-btn" disabled>${bi("next")} ➡️</button>
      </div>
    `, "read-card");
    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");

    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (r.answered) return;
        r.answered = true;
        const pick = decodeURIComponent(btn.dataset.c);
        if (pick === q.correct) {
          btn.classList.add("correct");
          flash();
          state.streak += 1;
          addPower(XP.read + state.streak * STREAK_BONUS);
          addZeni(ZENI_BASE);
          const h = pickHype();
          fb.innerHTML = `${h.en}${paLine(h.pa)}`;
          SFX.correct();
        } else {
          btn.classList.add("wrong");
          state.streak = 0;
          r.allCorrect = false;
          addPower(XP_WRONG);
          dealDamage(DAMAGE.mcq);
          const f = pickFail();
          fb.innerHTML = `${f.en} ${T.answer.en}: "<b>${q.correct}</b>".${paLine(`${f.pa} ${T.answer.pa}: "${q.correct}"`)}`;
          document.querySelectorAll(".choice").forEach(b => {
            if (decodeURIComponent(b.dataset.c) === q.correct) b.classList.add("correct");
          });
          SFX.wrong();
          renderHeader();
          if (state.hp <= 0) {
            persist();
            return setTimeout(knockout, 800);
          }
        }
        renderHeader();
        persist();
        next.disabled = false;
        next.onclick = () => {
          if (r.qIdx + 1 < card.questions.length) {
            r.qIdx += 1; r.answered = false;
            renderCard(curOrReview(isReview), isReview);
          } else {
            state.history.push({ id: card.id, t: Date.now(), ok: r.allCorrect });
            if (!r.allCorrect) queueReview(card.id);
            else if (isReview) clearReview(state.activeReviewId);
            state.read = null;
            if (isReview) finishReview(); else advance();
          }
        };
      });
    });
  }

  // ===== Match =====
  function renderMatch(card, wrap) {
    if (!state.match || state.match.cardId !== card.id) {
      const tiles = [];
      card.pairs.forEach((p, i) => {
        tiles.push({ key: `a${i}`, side: "a", pair: i, label: p.a, status: "open" });
        tiles.push({ key: `b${i}`, side: "b", pair: i, label: p.b, status: "open" });
      });
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      state.match = { cardId: card.id, tiles, sel: null, mistakes: 0, solved: 0, locked: false };
    }
    const m = state.match;
    const total = card.pairs.length;
    app.innerHTML = wrap(`
      <div class="quiz-question">🧩 ${card.title || "Match the pairs"}</div>
      ${paLine(card.titlePa || "ਜੋੜੇ ਮਿਲਾਓ")}
      <div class="match-grid">
        ${m.tiles.map((t, i) => `
          <button class="match-tile ${t.status}" data-i="${i}" ${t.status === "matched" ? "disabled" : ""}>${t.label}</button>
        `).join("")}
      </div>
      <div class="feedback" id="feedback">${m.solved}/${total} ${T.pairs.en} (${T.pairs.pa}) · ❌ ${m.mistakes}</div>
      <div class="controls">
        <div class="progress">${streakLine()}</div>
        <button id="next-btn" disabled>${bi("next")} ➡️</button>
      </div>
    `, "match-card");

    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");

    function refresh() {
      document.querySelectorAll(".match-tile").forEach((el, i) => {
        const t = m.tiles[i];
        el.className = "match-tile " + t.status;
        el.disabled = t.status === "matched";
      });
      fb.textContent = `${m.solved}/${total} ${T.pairs.en} (${T.pairs.pa}) · ❌ ${m.mistakes}`;
    }

    document.querySelectorAll(".match-tile").forEach(btn => {
      btn.addEventListener("click", () => {
        if (m.locked) return;
        const i = Number(btn.dataset.i);
        const t = m.tiles[i];
        if (t.status === "matched") return;
        if (m.sel === i) { t.status = "open"; m.sel = null; refresh(); return; }
        if (m.sel == null) {
          t.status = "selected"; m.sel = i; refresh(); return;
        }
        const a = m.tiles[m.sel];
        const b = t;
        if (a.pair === b.pair && a.side !== b.side) {
          a.status = "matched"; b.status = "matched";
          m.sel = null; m.solved += 1;
          refresh();
          SFX.correct();
          if (m.solved === total) {
            const xp = XP.match + state.streak * STREAK_BONUS - m.mistakes * 10;
            const z = ZENI_BASE + 30;
            state.streak += 1;
            addPower(Math.max(20, xp));
            addZeni(z);
            state.history.push({ id: card.id, t: Date.now(), ok: m.mistakes === 0 });
            if (m.mistakes > 1) queueReview(card.id);
            fb.innerHTML = `🎉 All matched! +${Math.max(20, xp)} ⚡ · +${z} 💰${paLine(`ਸਾਰੇ ਜੋੜੇ ਮਿਲ ਗਏ! +${Math.max(20, xp)} ⚡ · +${z} 💰`)}`;
            confetti(36);
            juiceCard("pop");
            renderHeader();
            persist();
            next.disabled = false;
            next.onclick = () => advance();
          }
        } else {
          b.status = "wrong"; a.status = "wrong"; m.locked = true;
          m.mistakes += 1;
          state.streak = 0;
          dealDamage(DAMAGE.match);
          SFX.wrong();
          juiceCard("shake");
          renderHeader();
          refresh();
          if (state.hp <= 0) {
            persist(); SFX.ko();
            return setTimeout(knockout, 700);
          }
          setTimeout(() => {
            a.status = "open"; b.status = "open"; m.sel = null; m.locked = false;
            refresh();
          }, 600);
        }
      });
    });
  }

  // ===== Tap =====
  function renderTap(card, wrap) {
    if (!state.tap || state.tap.cardId !== card.id) {
      const items = card.items.map((it, i) => ({ ...it, idx: i, picked: false }));
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      state.tap = { cardId: card.id, items, mistakes: 0, finished: false };
    }
    const t = state.tap;
    const correctTotal = t.items.filter(x => x.correct).length;
    const found = t.items.filter(x => x.correct && x.picked).length;

    app.innerHTML = wrap(`
      <div class="quiz-question">👆 ${card.prompt}</div>
      ${paLine(card.promptPa)}
      <div class="tap-grid">
        ${t.items.map((it, i) => `
          <button class="tap-chip ${it.picked ? (it.correct ? "good" : "bad") : ""}" data-i="${i}" ${it.picked && it.correct ? "disabled" : ""}>${it.label}</button>
        `).join("")}
      </div>
      <div class="feedback" id="feedback">${found}/${correctTotal} ${T.found.en} (${T.found.pa}) · ❌ ${t.mistakes}</div>
      <div class="controls">
        <div class="progress">${streakLine()}</div>
        <button id="tap-done" class="ghost-btn">${bi("imDone")} ✅</button>
        <button id="next-btn" disabled>${bi("next")} ➡️</button>
      </div>
    `, "tap-card");

    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");
    const doneBtn = document.getElementById("tap-done");

    function refresh() {
      document.querySelectorAll(".tap-chip").forEach((el, i) => {
        const it = t.items[i];
        el.className = "tap-chip " + (it.picked ? (it.correct ? "good" : "bad") : "");
        el.disabled = it.picked && it.correct;
      });
      const f = t.items.filter(x => x.correct && x.picked).length;
      fb.textContent = `${f}/${correctTotal} ${T.found.en} (${T.found.pa}) · ❌ ${t.mistakes}`;
    }

    function finish() {
      if (t.finished) return;
      t.finished = true;
      const f = t.items.filter(x => x.correct && x.picked).length;
      const ok = f === correctTotal && t.mistakes === 0;
      const xp = XP.tap + state.streak * STREAK_BONUS + f * 10 - t.mistakes * 12;
      const z = ZENI_BASE + 20;
      if (ok) state.streak += 1; else state.streak = 0;
      addPower(Math.max(15, xp));
      addZeni(z);
      state.history.push({ id: card.id, t: Date.now(), ok });
      if (!ok) queueReview(card.id);
      fb.innerHTML = ok
        ? `🎯 PERFECT! +${Math.max(15, xp)} ⚡ · +${z} 💰${paLine(`ਬਿਲਕੁਲ ਸਹੀ! +${Math.max(15, xp)} ⚡ · +${z} 💰`)}`
        : `Found ${f}/${correctTotal}, missed ${correctTotal - f}. +${Math.max(15, xp)} ⚡${paLine(`${f}/${correctTotal} ਲੱਭੇ, ${correctTotal - f} ਖੁੰਝੇ। +${Math.max(15, xp)} ⚡`)}`;
      t.items.forEach(it => { if (it.correct && !it.picked) it.picked = true; });
      refresh();
      if (ok) confetti(28); else juiceCard("shake");
      renderHeader();
      persist();
      next.disabled = false;
      doneBtn.disabled = true;
      next.onclick = () => advance();
    }

    document.querySelectorAll(".tap-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        if (t.finished) return;
        const i = Number(btn.dataset.i);
        const it = t.items[i];
        if (it.picked && it.correct) return;
        if (it.correct) {
          it.picked = true;
          SFX.correct();
          refresh();
          if (t.items.every(x => !x.correct || x.picked)) finish();
        } else {
          // Wrong tap: only the FIRST wrong tap on this card costs HP;
          // subsequent wrongs still count as mistakes (XP penalty + queue review)
          // but don't drain HP — prevents brutal cascading KO on long lists.
          if (!it.picked) {
            it.picked = true;
            t.mistakes += 1;
            if (t.mistakes === 1) dealDamage(DAMAGE.tap);
            SFX.wrong(); juiceCard("shake"); renderHeader(); refresh();
          }
          if (state.hp <= 0) { persist(); SFX.ko(); return setTimeout(knockout, 700); }
        }
        persist();
      });
    });
    doneBtn.onclick = finish;
  }

  // ===== Speed =====
  function renderSpeed(card, wrap) {
    if (!state.speed || state.speed.cardId !== card.id) {
      state.speed = { cardId: card.id, qIdx: 0, score: 0, started: false, finished: false, answered: false };
    }
    const s = state.speed;
    if (s.finished) {
      const total = card.questions.length;
      const xpPerCorrect = XP.speed;
      const bonus = (s.score === total) ? 200 : 0;
      const xp = s.score * xpPerCorrect + bonus + state.streak * STREAK_BONUS;
      const z = ZENI_BASE + s.score * 10;
      app.innerHTML = wrap(`
        <div class="emoji-big">${s.score === total ? "🏁" : "⏱️"}</div>
        <h2 class="intro-title">${s.score === total ? "PERFECT SPRINT!" : "Sprint complete!"}</h2>
        ${paLine(s.score === total ? "ਬਿਲਕੁਲ ਸਹੀ ਦੌੜ!" : "ਦੌੜ ਪੂਰੀ ਹੋਈ!")}
        <p class="intro-body">${T.score.en}: <b>${s.score}/${total}</b><br>+${xp} ⚡ · +${z} 💰${bonus ? ` · 🎁 +${bonus} bonus` : ""}</p>
        ${paLine(`${T.score.pa}: ${s.score}/${total}`)}
        <div class="controls" style="justify-content:center">
          <button id="next-btn">${bi("continue")} ➡️</button>
        </div>
      `, "speed-card");
      if (!s.awarded) {
        s.awarded = true;
        addPower(xp); addZeni(z);
        if (s.score === total) { state.streak += 1; confetti(40); SFX.bossWin(); }
        else state.streak = 0;
        state.history.push({ id: card.id, t: Date.now(), ok: s.score === total });
        if (s.score < total - 1) queueReview(card.id);
        renderHeader();
        persist();
      }
      document.getElementById("next-btn").onclick = () => advance();
      return;
    }
    if (!s.started) {
      app.innerHTML = wrap(`
        <div class="emoji-big">⏱️</div>
        <h2 class="intro-title">${card.title || "Speed Round!"}</h2>
        ${paLine(card.titlePa || "ਤੇਜ਼ ਦੌੜ!")}
        <p class="intro-body">${card.questions.length} quick questions · <b>${card.seconds || 8}s</b> each.<br>Get them all = bonus 💰💰</p>
        ${paLine(`${card.questions.length} ਛੋਟੇ ਸਵਾਲ · ਹਰੇਕ ਲਈ ${card.seconds || 8} ਸਕਿੰਟ। ਸਾਰੇ ਸਹੀ = ਵਾਧੂ 💰💰`)}
        <div class="controls" style="justify-content:center">
          <button id="speed-go">${bi("start")} ⚡</button>
        </div>
      `, "speed-card");
      document.getElementById("speed-go").onclick = () => {
        s.started = true;
        renderCard(currentEntry(), false);
      };
      return;
    }
    const q = card.questions[s.qIdx];
    const total = card.questions.length;
    const seconds = card.seconds || 8;
    const longChoices = q.choices.some(c => String(c).length > 24);
    app.innerHTML = wrap(`
      <div class="speed-bar"><div class="speed-bar-fill" id="speed-bar-fill"></div></div>
      <div class="quiz-question">⚡ Q${s.qIdx + 1}/${total} · ${T.score.en}: ${s.score}<br>${q.prompt}</div>
      ${paLine(q.promptPa)}
      <div class="choices ${longChoices ? "choices-stack" : ""}">
        ${q.choices.map(c =>
          `<button class="choice ${longChoices ? "long-choice" : ""}" data-c="${encodeURIComponent(c)}">${c}</button>`
        ).join("")}
      </div>
      <div class="feedback" id="feedback"></div>
    `, "speed-card");
    const fb = document.getElementById("feedback");
    const fill = document.getElementById("speed-bar-fill");

    let timeLeft = seconds * 1000;
    const tickStart = Date.now();
    let timerId = null;
    s.answered = false;

    function nextQ(wasCorrect) {
      clearInterval(timerId);
      if (wasCorrect) s.score += 1;
      s.qIdx += 1;
      s.answered = false;
      if (s.qIdx >= total) { s.finished = true; }
      renderCard(currentEntry(), false);
    }
    function tick() {
      const elapsed = Date.now() - tickStart;
      timeLeft = Math.max(0, seconds * 1000 - elapsed);
      // width is animated by CSS transition; nothing to do here except detect end
      if (timeLeft <= 0) {
        if (s.answered) return;
        s.answered = true;
        SFX.wrong();
        document.querySelectorAll(".choice").forEach(b => {
          if (decodeURIComponent(b.dataset.c) === q.correct) b.classList.add("correct");
        });
        fb.innerHTML = `⏰ ${T.time.en} ${T.answer.en}: <b>${q.correct}</b>${paLine(`${T.time.pa} ${T.answer.pa}: ${q.correct}`)}`;
        setTimeout(() => nextQ(false), 700);
      }
    }
    // Drive the speed-bar shrink with one CSS transition (smooth + GPU);
    // keep a coarse interval only to detect end-of-time.
    if (fill) {
      fill.style.transition = "none";
      fill.style.width = "100%";
      void fill.offsetWidth;
      fill.style.transition = `width ${seconds}s linear`;
      fill.style.width = "0%";
    }
    timerId = setInterval(tick, 100);

    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (s.answered) return;
        s.answered = true;
        const pick = decodeURIComponent(btn.dataset.c);
        const ok = pick === q.correct;
        if (ok) { btn.classList.add("correct"); SFX.correct(); fb.textContent = "✅"; }
        else {
          btn.classList.add("wrong"); SFX.wrong(); juiceCard("shake");
          document.querySelectorAll(".choice").forEach(b => {
            if (decodeURIComponent(b.dataset.c) === q.correct) b.classList.add("correct");
          });
          fb.innerHTML = `${T.answer.en}: <b>${q.correct}</b>${paLine(`${T.answer.pa}: ${q.correct}`)}`;
        }
        setTimeout(() => nextQ(ok), 500);
      });
    });
  }

  // ----- Boss -----
  function renderBoss(card, wrap) {
    if (!state.boss || state.boss.cardId !== card.id) {
      state.boss = { cardId: card.id, hp: card.hp, qIdx: 0, answered: false, introShown: false };
    }
    // First time we hit this boss, play the cinematic slam intro before drawing.
    if (!state.boss.introShown && motionOK()) {
      state.boss.introShown = true;
      bossIntroOverlay(card).then(() => renderCard(currentEntry(), false));
      return;
    }
    const b = state.boss;
    if (b.qIdx >= card.questions.length || b.hp <= 0) {
      app.innerHTML = wrap(`
        <div class="boss-defeated">
          <div class="emoji-big">🏆</div>
          <h2>${card.name} DEFEATED!</h2>
          ${paLine(`${card.namePa || card.name} ਹਾਰ ਗਿਆ!`)}
          <p>You did it, warrior!<br>+${ZENI_BOSS_CLEAR} 💰 · 🐉 +1 Dragon Ball</p>
          ${paLine(`ਤੁਸੀਂ ਜਿੱਤ ਗਏ, ਯੋਧਾ! +${ZENI_BOSS_CLEAR} 💰 · 🐉 +1 ਡ੍ਰੈਗਨ ਬਾਲ`)}
          <div class="controls" style="justify-content:center">
            <button id="next-btn">${bi("continue")} ➡️</button>
          </div>
        </div>
      `, "boss-card");
      document.getElementById("next-btn").onclick = () => advance();
      return;
    }
    const q = card.questions[b.qIdx];
    const hpPct = Math.max(0, (b.hp / card.hp) * 100);
    const longChoices = q.choices.some(c => String(c).length > 24);
    app.innerHTML = wrap(`
      <div class="boss-arena">
        <div class="boss-portrait">
          <div class="boss-emoji">${card.emoji}</div>
          <div class="boss-name">${card.name}${paInline(card.namePa)}</div>
          <div class="boss-hp"><div class="boss-hp-fill" style="width:${hpPct}%"></div></div>
          <div class="boss-hp-label">HP ${b.hp} / ${card.hp}</div>
        </div>
        <div class="quiz-question">⚔️ Q${b.qIdx + 1}/${card.questions.length}: ${q.prompt}</div>
        ${paLine(q.promptPa)}
        <div class="choices ${longChoices ? "choices-stack" : ""}">
          ${q.choices.map(c =>
            `<button class="choice ${longChoices ? "long-choice" : ""}" data-c="${encodeURIComponent(c)}">${c}</button>`
          ).join("")}
        </div>
        <div class="feedback" id="feedback"></div>
        <div class="controls">
          <div class="progress">${streakLine()}</div>
          <button id="next-btn" disabled>${bi("next")} ➡️</button>
        </div>
      </div>
    `, "boss-card");

    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");
    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (b.answered) return;
        b.answered = true;
        const pick = decodeURIComponent(btn.dataset.c);
        if (pick === q.correct) {
          btn.classList.add("correct");
          flash();
          kiBurst();
          state.streak += 1;
          addPower(XP.boss + state.streak * STREAK_BONUS);
          addZeni(ZENI_BASE + 40);
          b.hp -= 1;
          // Smoothly drain the boss HP bar (CSS transition) + flash impact
          const fillEl = document.querySelector(".boss-hp-fill");
          const barEl  = document.querySelector(".boss-hp");
          if (fillEl) fillEl.style.width = Math.max(0, (b.hp / card.hp) * 100) + "%";
          if (barEl) { barEl.classList.remove("hit"); void barEl.offsetWidth; barEl.classList.add("hit"); }
          screenShake(280);
          const h = pickHype();
          fb.innerHTML = `💥 ${h.en} (boss takes a hit!)${paLine(`${h.pa} (ਬੌਸ ਨੂੰ ਸੱਟ ਲੱਗੀ!)`)}`;
          SFX.bossHit();
        } else {
          btn.classList.add("wrong");
          state.streak = 0;
          addPower(XP_WRONG);
          dealDamage(DAMAGE.boss);
          const f = pickFail();
          fb.innerHTML = `${f.en} ${T.answer.en}: "<b>${q.correct}</b>".${paLine(`${f.pa} ${T.answer.pa}: "${q.correct}"`)}`;
          document.querySelectorAll(".choice").forEach(bb => {
            if (decodeURIComponent(bb.dataset.c) === q.correct) bb.classList.add("correct");
          });
          SFX.wrong();
          renderHeader();
          if (state.hp <= 0) {
            persist();
            return setTimeout(knockout, 800);
          }
        }
        renderHeader();
        persist();
        next.disabled = false;
        next.onclick = () => {
          b.qIdx += 1;
          b.answered = false;
          renderCard(currentEntry(), false);
        };
      });
    });
  }

  // ----- Shared MCQ handlers -----
  function bindChoiceHandlers(cardId, correct, isReview, xp) {
    const fb = document.getElementById("feedback");
    const next = document.getElementById("next-btn");
    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (state.answered) return;
        state.answered = true;
        const pick = decodeURIComponent(btn.dataset.c);
        if (pick === correct) {
          btn.classList.add("correct");
          handleCorrect(cardId, isReview, xp, fb);
        } else {
          btn.classList.add("wrong");
          handleWrong(cardId, correct, fb);
          document.querySelectorAll(".choice").forEach(b => {
            if (decodeURIComponent(b.dataset.c) === correct) b.classList.add("correct");
          });
        }
        next.disabled = false;
        next.onclick = () => isReview ? finishReview() : advance();
      });
    });
  }

  function handleCorrect(cardId, isReview, xpBase, fb) {
    flash();
    kiBurst();
    state.streak += 1;
    const gain = xpBase + state.streak * STREAK_BONUS + (isReview ? 30 : 0);
    addPower(gain);
    const z = ZENI_BASE + (isReview ? ZENI_REVIEW_BONUS : 0) + state.streak * 4;
    addZeni(z);
    if (isReview) heal(HEAL_ON_REVIEW);
    state.history.push({ id: cardId, t: Date.now(), ok: true });
    // Modern game-feel: floating XP popup + particle burst at click point
    const pt = pickPoint();
    xpPop("+" + gain + " ⚡", pt.x, pt.y - 10);
    xpPop("+" + z + " 💰",  pt.x, pt.y + 14, "zeni");
    particleBurst(pt.x, pt.y, 12, state.streak >= 5 ? "cyan" : "green");
    comboMeter(state.streak);
    flashCard("flash-correct");
    haptic(state.streak >= 5 ? [25, 30, 25] : 18);
    let promoteMsg = "";
    let promoteMsgPa = "";
    if (isReview) {
      const item = state.reviewQueue.find(x => x.id === state.activeReviewId);
      const wasBox = item ? item.box : 0;
      promoteReview(state.activeReviewId);
      const stillThere = state.reviewQueue.find(x => x.id === state.activeReviewId);
      if (stillThere) {
        promoteMsg = ` · 📈 box ${wasBox}→${stillThere.box}`;
        promoteMsgPa = ` · 📈 ਡੱਬਾ ${wasBox}→${stillThere.box}`;
      } else {
        promoteMsg = " · 🎓 graduated!";
        promoteMsgPa = " · 🎓 ਪਾਸ!";
      }
    }
    const h = pickHype();
    fb.innerHTML = `${h.en} &nbsp; +${gain} ⚡ · +${z} 💰${promoteMsg}` +
                   paLine(`${h.pa} +${gain} ⚡ · +${z} 💰${promoteMsgPa}`);
    SFX.correct();
    juiceCard("pop");
    if (COMBO_LINES[state.streak]) comboBanner(state.streak);
    renderHeader();
    persist();
  }

  function handleWrong(cardId, correct, fb) {
    state.streak = 0;
    addPower(XP_WRONG);
    dealDamage(DAMAGE.mcq);
    state.history.push({ id: cardId, t: Date.now(), ok: false });
    queueReview(cardId);
    const pt = pickPoint();
    xpPop("-" + DAMAGE.mcq + " HP", pt.x, pt.y, "dmg");
    particleBurst(pt.x, pt.y, 8, "pink");
    comboMeter(0);
    flashCard("flash-wrong");
    haptic([40, 20, 40]);
    const f = pickFail();
    fb.innerHTML = `${f.en} ${T.answer.en}: "<b>${correct}</b>" — added to 🔁 review.` +
                   paLine(`${f.pa} ${T.answer.pa}: "${correct}" — 🔁 ਦੁਹਰਾਈ ਵਿੱਚ ਜੋੜਿਆ।`);
    SFX.wrong();
    juiceCard("shake");
    renderHeader();
    persist();
    if (state.hp <= 0) {
      SFX.ko();
      setTimeout(knockout, 900);
    }
  }

  function finishReview() {
    state.activeReviewId = null;
    state.flipped = false;
    state.answered = false;
    if (state.senzuMode) {
      state.senzuRemaining = Math.max(0, state.senzuRemaining - 1);
    }
    persist();
    render();
  }

  function pickHype() { return HYPES[Math.floor(Math.random() * HYPES.length)]; }
  function pickFail() { return FAILS[Math.floor(Math.random() * FAILS.length)]; }

  // ===== KO =====
  function renderKO(entry) {
    renderHeader();
    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card ko-card">
          <div class="emoji-big">💀</div>
          <h2>KNOCKED OUT!</h2>
          ${paLine("ਤੁਸੀਂ ਹਾਰ ਗਏ!")}
          <p>HP depleted. Restarting block:<br><b>${entry.blockEmoji} ${entry.blockTitle}</b></p>
          ${paLine(`HP ਖ਼ਤਮ। ਪੜਾਅ ਮੁੜ ਸ਼ੁਰੂ: <b>${entry.blockEmoji} ${entry.blockTitle}</b>`)}
          <p class="ko-note">Don't worry — you keep your Power Level, Zeni, and Dragon Balls. A true Saiyan grows stronger after every defeat. 💪</p>
          ${paLine("ਚਿੰਤਾ ਨਾ ਕਰੋ — ਤਾਕਤ, ਜ਼ੈਨੀ ਤੇ ਡ੍ਰੈਗਨ ਬਾਲ ਸੁਰੱਖਿਅਤ ਹਨ। ਸੱਚਾ ਯੋਧਾ ਹਰ ਹਾਰ ਤੋਂ ਮਜ਼ਬੂਤ ਹੁੰਦਾ ਹੈ। 💪")}
          <div class="controls" style="justify-content:center">
            <button id="rise-btn">${bi("riseAgain")} ⚡</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("rise-btn").onclick = () => render();
  }

  // ===== Map =====
  function renderMap() {
    const cur = currentEntry();
    let html = `<div class="ladder-frame"><div class="map-wrap">
      <div class="map-header">
        <h2>🗺️ Training Map${paInline("ਸਿਖਲਾਈ ਨਕਸ਼ਾ")}</h2>
        <button id="map-close" class="ghost-btn">✕ ${bi("close")}</button>
      </div>
      <p class="map-note">Everyone climbs the same ladder. ✅ = cleared, ⭐ = current.${paLine("ਹਰ ਕੋਈ ਇੱਕੋ ਪੌੜੀ ਚੜ੍ਹਦਾ ਹੈ। ✅ = ਪੂਰਾ, ⭐ = ਮੌਜੂਦਾ")}</p>`;
    LADDER.forEach(unit => {
      html += `<div class="map-unit"><h3>${unit.emoji} ${unit.title}${paInline(unit.titlePa)}</h3><ul>`;
      unit.blocks.forEach(block => {
        const cleared = state.cleared.includes(block.id);
        const isCurrent = block.id === cur.blockId;
        const mark = cleared ? "✅" : isCurrent ? "⭐" : "▫️";
        const titlePa = block.titlePa ? paInline(block.titlePa) : "";
        html += `<li class="${isCurrent ? "current" : ""}">${mark} ${block.emoji} ${block.title}${titlePa} <small>(${block.cards.length} cards · <span class="pa" lang="pa">${block.cards.length} ਕਾਰਡ</span>)</small></li>`;
      });
      html += `</ul></div>`;
    });
    html += `</div></div>`;
    app.innerHTML = html;
    document.getElementById("map-close").onclick = () => render();
  }

  // ===== Victory =====
  function renderVictory() {
    renderHeader();
    // Cinematic golden wipe + power-aura on the portrait
    if (motionOK()) {
      document.body.classList.add("win-now");
      if (fpEl) fpEl.classList.add("fp-power");
      fpShout("POWER UP!", "super");
      setTimeout(() => document.body.classList.remove("win-now"), 1200);
      setTimeout(() => { confetti(40, ["🌟","✨","⭐","💛"]); }, 350);
      setTimeout(() => { confetti(40, ["🐉","🔥","⚡","💫"]); }, 750);
      confetti(60, ["🌟","✨","⭐","💛","🏆"]);
      SFX.bossWin();
    }
    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card victory-card">
          <div class="emoji-big">🌟</div>
          <h2>LADDER COMPLETE!</h2>
          ${paLine("ਪੌੜੀ ਪੂਰੀ ਹੋਈ!")}
          <p>You climbed every step. Power Level: <b>${state.power.toLocaleString()}</b></p>
          <p>Dragon Balls: <b>${state.balls}/7</b> · Zeni: <b>${state.zeni.toLocaleString()}</b></p>
          ${paLine(`ਤੁਸੀਂ ਹਰ ਕਦਮ ਪੂਰਾ ਕੀਤਾ। ਤਾਕਤ: <b>${state.power.toLocaleString()}</b><br>ਡ੍ਰੈਗਨ ਬਾਲ: <b>${state.balls}/7</b> · ਜ਼ੈਨੀ: <b>${state.zeni.toLocaleString()}</b>`)}
          <p class="ko-note">More units coming soon. Open the Map to revisit any block.${paInline("ਹੋਰ ਯੂਨਿਟ ਜਲਦੀ ਆਉਣਗੇ। ਨਕਸ਼ੇ ਤੋਂ ਕਿਸੇ ਵੀ ਪੜਾਅ ਨੂੰ ਦੁਹਰਾਓ।")}</p>
          <div class="controls" style="justify-content:center">
            <button id="map-from-victory">🗺️ ${bi("openMap")}</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("map-from-victory").onclick = renderMap;
  }

  // ===== Leaderboard view =====
  function renderBoard(scope) {
    updateLeaderboard(); // make sure our row is fresh
    scope = scope || (window.OnlineLB && window.OnlineLB.ready ? "global" : "device");

    function deviceRows() {
      const lb = rdJSON(LOCAL_LB_KEY, {});
      return Object.values(lb).map(r => ({ ...r, _mine: (r.childId && r.childId === currentChildId) || r.player === currentPlayer }));
    }
    function globalRows() {
      const remote = (window.OnlineLB && window.OnlineLB.getAll) ? window.OnlineLB.getAll() : [];
      const myId = `${currentChildId}__${deviceId}`;
      return remote.map(r => ({ ...r, _mine: r.id === myId }));
    }

    function renderRows(rows) {
      rows = rows.slice().sort((a, b) => (b.power|0) - (a.power|0) || (b.zeni|0) - (a.zeni|0));
      const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`;
      const fmtTime = (t) => {
        if (!t) return "—";
        const d = new Date(t);
        const sameDay = d.toDateString() === new Date().toDateString();
        return sameDay
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString();
      };
      const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
      if (!rows.length) return `<tr><td colspan="8" class="empty">No fighters yet — start training!${paInline("ਅਜੇ ਕੋਈ ਯੋਧਾ ਨਹੀਂ — ਸਿਖਲਾਈ ਸ਼ੁਰੂ ਕਰੋ!")}</td></tr>`;
      return rows.map((r, i) => `
        <tr class="${r._mine ? "me" : ""}">
          <td class="rk">${medal(i)}</td>
          <td class="nm">${esc(r.player || "?")}${r._mine ? ' <span class="me-tag">YOU · <span class="pa" lang="pa">ਤੁਸੀਂ</span></span>' : ""}</td>
          <td class="pw">${(r.power|0).toLocaleString()} ⚡</td>
          <td class="rn">${esc(r.rank || rankFor(r.power|0).name)}</td>
          <td class="zn">${(r.zeni|0).toLocaleString()} 💰</td>
          <td class="db">${(r.balls|0)}/7 🐉</td>
          <td class="ts">${fmtTime(r.updatedAt)}</td>
          <td class="ax">${
            scope === "device"
              ? (r._mine
                  ? '<span class="me-pill">active · <span class="pa" lang="pa">ਚਾਲੂ</span></span>'
                  : `<button class="board-btn switch" data-switch="${encodeURIComponent(r.childId || r.player)}">Switch · <span class="pa" lang="pa">ਬਦਲੋ</span></button>
                     <button class="board-btn del" data-del="${encodeURIComponent(r.childId || r.player)}" title="Delete · ਮਿਟਾਓ">🗑️</button>`)
              : (r._mine ? '<span class="me-pill">you · <span class="pa" lang="pa">ਤੁਸੀਂ</span></span>' : "")
          }</td>
        </tr>`).join("");
    }

    const rows = scope === "global" ? globalRows() : deviceRows();
    const onlineStatus = window.OnlineLB ? window.OnlineLB.status : "not-configured";
    const statusPill =
      onlineStatus === "online"          ? '<span class="lb-status ok">🌐 live <span class="pa pa-inline" lang="pa">· ਲਾਇਵ</span></span>' :
      onlineStatus === "not-configured"  ? '<span class="lb-status warn">⚙️ offline <span class="pa pa-inline" lang="pa">· ਆਫਲਾਈਨ</span></span>' :
                                            `<span class="lb-status warn">⚠️ ${onlineStatus}</span>`;

    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card board-card">
          <div class="board-head">
            <h2 class="board-title">🏆 Leaderboard${paInline("ਲੀਡਰਬੋਰਡ")}</h2>
            <button id="board-close" class="ghost-btn">✕ ${bi("close")}</button>
          </div>
          <div class="board-tabs">
            <button class="board-tab ${scope==="device"?"active":""}" data-scope="device">📱 This device <span class="pa pa-inline" lang="pa">· ਇਹ ਡਿਵਾਈਸ</span></button>
            <button class="board-tab ${scope==="global"?"active":""}" data-scope="global">🌐 Global <span class="pa pa-inline" lang="pa">· ਵਿਸ਼ਵੀ</span> ${statusPill}</button>
          </div>
          <div class="board-actions">
            <button id="board-add" class="board-btn primary">➕ Add fighter <span class="pa pa-inline" lang="pa">· ਨਵਾਂ ਯੋਧਾ</span></button>
            <button id="board-refresh" class="board-btn">🔄 Refresh <span class="pa pa-inline" lang="pa">· ਤਾਜਾ</span></button>
          </div>
          <div class="board-wrap">
            <table class="board-table">
              <thead><tr>
                <th>Rank<br><span class="pa pa-inline" lang="pa">ਦਰਜਾ</span></th>
                <th>Fighter<br><span class="pa pa-inline" lang="pa">ਯੋਧਾ</span></th>
                <th>Power<br><span class="pa pa-inline" lang="pa">ਤਾਕਤ</span></th>
                <th>Title<br><span class="pa pa-inline" lang="pa">ਖਿਤਾਬ</span></th>
                <th>Zeni<br><span class="pa pa-inline" lang="pa">ਜ਼ੈਨੀ</span></th>
                <th>Balls<br><span class="pa pa-inline" lang="pa">ਗੇਂਦ</span></th>
                <th>Last seen<br><span class="pa pa-inline" lang="pa">ਆਖਰੀ ਵਾਰ</span></th>
                <th></th>
              </tr></thead>
              <tbody>${renderRows(rows)}</tbody>
            </table>
          </div>
          <p class="board-foot">You are <b>${escHTML(currentPlayer)}</b> on this device.${paInline("ਤੁਸੀਂ ਇਸ ਡਿਵਾਈਸ ਤੇ ਹੋ")}</p>
        </div>
      </div>
    `;

    document.getElementById("board-close").onclick = () => render();
    document.getElementById("board-refresh").onclick = () => renderBoard(scope);
    document.getElementById("board-add").onclick = async () => {
      if (!canAddChild()) {
        toast({
          en: `This account can have up to ${MAX_CHILDREN_PER_ACCOUNT} fighters.`,
          pa: `ਇਸ ਖਾਤੇ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ${MAX_CHILDREN_PER_ACCOUNT} ਯੋਧੇ ਹੋ ਸਕਦੇ ਹਨ।`
        });
        return;
      }
      const result = await openWelcomeModal({
        mode: "full",
        title: "Add fighter · ਨਵਾਂ ਯੋਧਾ"
      });
      if (!result) return;
      const nm = sanitizeName(result.name);
      if (!nm) return;
      const child = addChild(nm, result.avatar);
      if (!child) {
        toast({
          en: `This account can have up to ${MAX_CHILDREN_PER_ACCOUNT} fighters.`,
          pa: `ਇਸ ਖਾਤੇ ਵਿੱਚ ਵੱਧ ਤੋਂ ਵੱਧ ${MAX_CHILDREN_PER_ACCOUNT} ਯੋਧੇ ਹੋ ਸਕਦੇ ਹਨ।`
        });
        return;
      }
      switchToPlayer(child.id);
    };
    document.querySelectorAll(".board-tab").forEach(b => {
      b.addEventListener("click", () => renderBoard(b.dataset.scope));
    });
    document.querySelectorAll(".board-btn.switch").forEach(b => {
      b.addEventListener("click", () => switchToPlayer(decodeURIComponent(b.dataset.switch)));
    });
    document.querySelectorAll(".board-btn.del").forEach(b => {
      b.addEventListener("click", () => deletePlayer(decodeURIComponent(b.dataset.del)));
    });
  }

  // Auto-refresh the board view if it's open and online cache changes.
  window.addEventListener("online-lb-ready", () => {
    if (window.OnlineLB && window.OnlineLB.onChange) {
      window.OnlineLB.onChange(() => {
        if (document.querySelector(".board-card")) {
          const scope = document.querySelector(".board-tab.active")?.dataset.scope || "global";
          renderBoard(scope);
        }
      });
    }
    // Push our current snapshot once online comes up.
    updateLeaderboard();
  });

  // ===== Header buttons =====
  if (mapBtn) mapBtn.onclick = renderMap;
  const boardBtn = document.getElementById("board-btn");
  if (boardBtn) boardBtn.onclick = () => renderBoard();

  if (soundBtn) {
    const updateSoundIcon = () => { soundBtn.textContent = muted ? "🔇" : "🔊"; };
    updateSoundIcon();
    soundBtn.onclick = () => {
      muted = !muted;
      localStorage.setItem(KEY.muted, muted ? "1" : "0");
      updateSoundIcon();
      if (!muted) SFX.correct();
    };
  }

  if (exportBtn) exportBtn.onclick = () => {
    const payload = {
      ladderVersion: LADDER_VERSION,
      idx: state.idx,
      hp: state.hp,
      maxHp: maxHpFor(state.power),
      power: state.power,
      zeni: state.zeni,
      balls: state.balls,
      cleared: state.cleared,
      reviewQueue: state.reviewQueue,
      historySample: state.history.slice(-50),
      currentBlockId: currentEntry().blockId,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daroach-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ en: "📤 Stats exported", pa: "📤 ਅੰਕੜੇ ਸੇਵ ਹੋ ਗਏ" });
  };

  if (resetBtn) resetBtn.onclick = () => {
    if (!confirm("Reset ALL progress? Power, Zeni, Dragon Balls and ladder position will be wiped.\n\nਸਾਰੀ ਤਰੱਕੀ ਮਿਟਾਉਣੀ ਹੈ?")) return;
    [KEY.pos, KEY.hp, KEY.power, KEY.zeni, KEY.balls, KEY.review, KEY.cleared, KEY.history,
     KEY.daily,
     `dl_seen_v2__${currentChildId}`,
     `${AVATAR_KEY}__${currentChildId}`]
      .forEach(k => localStorage.removeItem(k));
    const lb = rdJSON(LOCAL_LB_KEY, {});
    delete lb[`${currentChildId}__${deviceId}`];
    wrJSON(LOCAL_LB_KEY, lb);
    location.reload();
  };

  // ===== Boot =====
  (function dailyStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const d = loadJSON(KEY.daily, { last: null, count: 0, best: 0 });
    const alreadyToday = d.last === today;
    if (!alreadyToday) {
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      d.count = (d.last === yest) ? d.count + 1 : 1;
      d.best = Math.max(d.best || 0, d.count);
      d.last = today;
      saveJSON(KEY.daily, d);
    }
    setTimeout(() => {
      if (d.count >= 2) toast({
        en: `🔥 ${d.count}-day training streak! Best: ${d.best}`,
        pa: `🔥 ${d.count}-ਦਿਨਾਂ ਦੀ ਲਗਾਤਾਰ ਸਿਖਲਾਈ! ਸਭ ਤੋਂ ਵਧੀਆ: ${d.best}`
      }, "rank");
      else toast({
        en: `👋 Welcome back, warrior! Day 1 of training.`,
        pa: `👋 ਫਿਰ ਮਿਲੇ, ਯੋਧਾ! ਸਿਖਲਾਈ ਦਾ ਪਹਿਲਾ ਦਿਨ।`
      });
    }, 400);
    if (!alreadyToday && d.count > 1 && [3, 7, 14, 30].includes(d.count)) {
      state.zeni += 200 * d.count;
      setTimeout(() => {
        toast({
          en: `🎁 Daily bonus: +${200 * d.count} 💰`,
          pa: `🎁 ਰੋਜ਼ਾਨਾ ਇਨਾਮ: +${200 * d.count} 💰`
        }, "rank");
        confetti(40);
      }, 1200);
    }
  })();

  // ===== Expose GameAPI for attack mini-games (vocab.js / enemies.js / attacks.js) =====
  window.GameAPI = {
    app,
    state,
    SFX,
    paLine, paInline,
    toast, confetti, kiBurst, screenShake, slowMo,
    addPower, addZeni, dealDamage,
    queueReview,
    maxHpFor, rankIndex,
    persist,
    render,
  };

  // ⚔️ HUD toggle for random attacks (default ON).
  (function wireAttackToggle() {
    const btn = document.getElementById("attacks-btn");
    if (!btn) return;
    function paint() {
      const on = window.Attacks ? Attacks.isEnabled() : true;
      btn.classList.toggle("atk-off", !on);
      btn.title = on
        ? "Random attacks: ON · ਹਮਲੇ ਚਾਲੂ"
        : "Random attacks: OFF · ਹਮਲੇ ਬੰਦ";
    }
    btn.addEventListener("click", () => {
      if (!window.Attacks) return;
      Attacks.setEnabled(!Attacks.isEnabled());
      paint();
      toast(Attacks.isEnabled()
        ? { en: "⚔️ Attacks ON",  pa: "⚔️ ਹਮਲੇ ਚਾਲੂ" }
        : { en: "🛡️ Attacks OFF", pa: "🛡️ ਹਮਲੇ ਬੰਦ" });
    });
    paint();
  })();

  persist();
  render();
})();
