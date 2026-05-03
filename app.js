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
  const rupeesEl    = document.getElementById("rupees");
  const goldBarsEl    = document.getElementById("gold-bars");
  const silverCoinsEl = document.getElementById("silver-coins");
  const powerFill = document.getElementById("power-fill");
  const powerLevel = document.getElementById("power-level");
  const rankLabel = document.getElementById("rank-label");
  const ladderProgressEl = document.getElementById("ladder-progress");
  const mapBtn = document.getElementById("map-btn");
  const exportBtn = document.getElementById("export-btn");
  const resetBtn = document.getElementById("reset-btn");
  const soundBtn = document.getElementById("sound-btn");

  // ===== Constants =====
  // Power threshold at which the player wears the top-tier rank.
  const MAX_RANK_POWER = 1_000_000;

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
  // Chai Break theme: correct reviews restore a sliver of HP.
  const HEAL_ON_REVIEW = 5;

  const XP = {
    intro: 10, flash: 30, mcq: 80, fill: 120, read: 100, boss: 150,
    match: 140, tap: 130, speed: 40
  };
  const XP_WRONG = 5;
  const STREAK_BONUS = 5;

  // Rupees (₹) replace the old currency.
  const RUPEES_BASE = 80;
  const RUPEES_REVIEW_BONUS = 30;
  // Boss clears now drop a satchel of gold + a fat rupee bonus.
  const RUPEES_BOSS_CLEAR = 2000;
  // Currency model:
  //  - Bosses drop GOLD BARS (🟨): big-haul reward (5 bars = 50 silver coins).
  //  - Enemy attacks (rare elite kills in attacks.js) drop a SILVER COIN (🥈).
  //  - 10 silver coins auto-stack into 1 gold bar in the HUD.
  // state.gold stores the total silver-coin count; bars = floor(gold/10).
  // 10 coins auto-stack into 1 bar in the HUD.
  const GOLD_PER_COIN     = 1;
  const GOLD_PER_BAR      = 10;
  const GOLD_BARS_PER_BOSS = 5;

  // Leitner-style review boxes
  const BOX_INTERVAL = { 1: 2, 2: 5, 3: 12, 4: 30, 5: 70 };
  const REVIEW_QUEUE_MAX = 80;
  const REVIEW_PROBABILITY = 0.20;
  const MAX_REVIEWS_IN_A_ROW = 2;
  const CHAI_REVIEW_MAX = 3;

  // Rank ladder, Punjabi-roti themed (bottom → top).
  // Same XP thresholds as before so existing saves keep their tier.
  const RANKS = [
    { min: 0,         name: "🫓 ROTI",               namePa: "ਰੋਟੀ" },
    { min: 1_000,     name: "🥯 POORI",              namePa: "ਪੂਰੀ" },
    { min: 9_000,     name: "🫓 BHATURA",            namePa: "ਭਟੂਰਾ" },
    { min: 25_000,    name: "🧄 GARLIC NAAN",        namePa: "ਲਸਣ ਨਾਨ" },
    { min: 75_000,    name: "🌶️ MOOLI PARANTHA",     namePa: "ਮੂਲੀ ਪਰਾਂਠਾ" },
    { min: 200_000,   name: "🔥 GARLIC-CHILI NAAN",  namePa: "ਲਸਣ-ਮਿਰਚ ਨਾਨ" },
    { min: 500_000,   name: "🥔 ALOO PARANTHA",      namePa: "ਆਲੂ ਪਰਾਂਠਾ" },
    { min: 1_000_000, name: "🌽 MAKKI KI ROTI",      namePa: "ਮੱਕੀ ਦੀ ਰੋਟੀ" }
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

  // Bilingual hype/fail lines — Punjabi vibes + Punjabi-food themed.
  const HYPES = [
    { en: "BALLE BALLE! 🕺",            pa: "ਬੱਲੇ ਬੱਲੇ!" },
    { en: "SHAVA SHAVA! 🎉",            pa: "ਸ਼ਾਵਾ ਸ਼ਾਵਾ!" },
    { en: "CHAK DE PHATTE! ⚡",         pa: "ਚੱਕ ਦੇ ਫੱਟੇ!" },
    { en: "OYE HOYE! ✨",               pa: "ਓਏ ਹੋਏ!" },
    { en: "WAH JI WAH! 🌟",             pa: "ਵਾਹ ਜੀ ਵਾਹ!" },
    { en: "JEEONDE RAHO! 💛",           pa: "ਜੀਉਂਦੇ ਰਹੋ!" },
    { en: "SAMOSA SMASH! 🥟",           pa: "ਸਮੋਸਾ ਧਮਾਕਾ!" },
    { en: "JALEBI SWIRL! 🍥",           pa: "ਜਲੇਬੀ ਗੇੜਾ!" },
    { en: "BUTTER CHICKEN BOMB! 🍗",    pa: "ਮੱਖਣ ਮੁਰਗ ਧਮਾਕਾ!" },
    { en: "LASSI BLAST! 🥛",            pa: "ਲੱਸੀ ਧਮਾਕਾ!" },
    { en: "MAKKI ROTI SMASH! 🌽",       pa: "ਮੱਕੀ ਰੋਟੀ ਧਮਾਕਾ!" },
    { en: "GULAB JAMUN GO! 🍮",         pa: "ਗੁਲਾਬ ਜਾਮੁਨ ਚੱਲੋ!" },
    { en: "PARATHA POUND! 🫓",          pa: "ਪਰਾਂਠਾ ਠੋਕ!" },
    { en: "NICE! ⭐",                   pa: "ਵਾਹ!" },
    { en: "SMART! 🧠",                  pa: "ਸਿਆਣੇ!" },
    { en: "PIND DA SHER! 🦁",           pa: "ਪਿੰਡ ਦਾ ਸ਼ੇਰ!" },
  ];
  const FAILS = [
    { en: "Oye hoye! Try kar phir!",                pa: "ਓਏ ਹੋਏ! ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ!" },
    { en: "Koi gal nahi — agla sahi karo!",         pa: "ਕੋਈ ਗੱਲ ਨਹੀਂ — ਅਗਲਾ ਸਹੀ ਕਰੋ!" },
    { en: "Lassi peeke aa, fer try kar!",           pa: "ਲੱਸੀ ਪੀ ਕੇ ਆ, ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰ!" },
    { en: "Sardar Saab vi miss karda kade kade!",   pa: "ਸਰਦਾਰ ਸਾਬ੍ਹ ਵੀ ਕਦੇ ਕਦੇ ਖੁੰਝ ਜਾਂਦਾ!" },
    { en: "Chai break, fer chak de!",                pa: "ਚਾਹ ਦੀ ਛੁੱਟੀ, ਫਿਰ ਚੱਕ ਦੇ!" },
    { en: "Hosla rakh — agla tuhada!",              pa: "ਹੌਸਲਾ ਰੱਖ — ਅਗਲਾ ਤੁਹਾਡਾ!" },
  ];
  const COMBO_LINES = {
    3:  { en: "🔥 3x COMBO!",                pa: "🔥 3 ਵਾਰੀ ਲਗਾਤਾਰ!" },
    5:  { en: "⚡ 5x JALEBI STREAK!",         pa: "⚡ 5 ਵਾਰੀ — ਜਲੇਬੀ ਲੜੀ!" },
    7:  { en: "💫 7x SHAVA SHAVA STREAK!",   pa: "💫 7 ਵਾਰੀ — ਸ਼ਾਵਾ ਸ਼ਾਵਾ!" },
    10: { en: "🌟 10x BALLE BALLE STREAK!",  pa: "🌟 10 ਵਾਰੀ — ਬੱਲੇ ਬੱਲੇ!" },
    15: { en: "👑 15x UNSTOPPABLE!",          pa: "👑 15 ਵਾਰੀ — ਨਾ ਰੁਕਣ ਵਾਲੇ!" },
    20: { en: "🌽 20x MAKKI MAHARAJ!",        pa: "🌽 20 ਵਾਰੀ — ਮੱਕੀ ਮਹਾਰਾਜ!" },
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
  const LB_BLOCKLIST_KEY = "dl_lb_blocklist_v1"; // names/childIds the user has deleted; never show on this device
  const MAX_CHILDREN_PER_ACCOUNT = 3;

  function rdJSON(k, fb) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; } catch (_) { return fb; } }
  function wrJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function sanitizeName(s) { return String(s || "").replace(/[^\p{L}\p{N} _\-.']/gu, "").trim().slice(0, 20); }
  function slugify(s)      { return sanitizeName(s).toLowerCase().replace(/\s+/g, "-") || "player"; }
  function uid(prefix) {
    if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  // Leaderboard block-list helpers. When a fighter is deleted, their name
  // (lower-cased) and childId go in here. The 🏆 board filters out matching
  // rows from BOTH the local cache and the live Firestore snapshot, so even
  // if another device re-pushes or a legacy orphan row exists, the deleted
  // fighter no longer "lingers" on this device.
  function getBlocklist() {
    const v = rdJSON(LB_BLOCKLIST_KEY, { names: [], ids: [] });
    return {
      names: new Set((v.names || []).map(s => String(s).toLowerCase())),
      ids:   new Set(v.ids || [])
    };
  }
  function addToBlocklist(name, childId) {
    const v = rdJSON(LB_BLOCKLIST_KEY, { names: [], ids: [] });
    const lcName = String(name || "").toLowerCase();
    if (lcName && !(v.names || []).map(s => String(s).toLowerCase()).includes(lcName)) {
      v.names = [...(v.names || []), lcName];
    }
    if (childId && !(v.ids || []).includes(childId)) {
      v.ids = [...(v.ids || []), childId];
    }
    wrJSON(LB_BLOCKLIST_KEY, v);
  }
  function removeFromBlocklist(name, childId) {
    const v = rdJSON(LB_BLOCKLIST_KEY, { names: [], ids: [] });
    const lcName = String(name || "").toLowerCase();
    v.names = (v.names || []).filter(s => String(s).toLowerCase() !== lcName);
    if (childId) v.ids = (v.ids || []).filter(id => id !== childId);
    wrJSON(LB_BLOCKLIST_KEY, v);
  }
  function isBlocked(row) {
    if (!row) return false;
    const bl = getBlocklist();
    if (row.childId && bl.ids.has(row.childId)) return true;
    const nm = String(row.player || "").toLowerCase();
    if (nm && bl.names.has(nm)) return true;
    return false;
  }
  // Expose for the snapshot listener in online.js so we can also tombstone
  // orphan/cross-device rows server-side.
  window.__lbIsBlocked = isBlocked;

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
  function avatarSrc(av) { return av === "girl" ? "images/girlstart.png" : "images/boystart.png"; }

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
                   autocomplete="off" spellcheck="false" placeholder="e.g. Bittu"
                   value="${safeName}" />
          ` : ""}
          <p class="welcome-label">Choose your fighter <span class="pa pa-inline" lang="pa">· ਯੋਧਾ ਚੁਣੋ</span></p>
          <div class="avatar-row">
            <button type="button" class="avatar-pick" data-av="boy">
              <img src="images/boystart.png" alt="Boy fighter" />
              <span>Boy <span class="pa pa-inline" lang="pa">· ਮੁੰਡਾ</span></span>
            </button>
            <button type="button" class="avatar-pick" data-av="girl">
              <img src="images/girlstart.png" alt="Girl fighter" />
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
          try { SFX.select(); } catch (_) {}
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

  // Profile picker: shown after the splash on every re-open when at least
  // one child profile already exists. Lets the user pick "who is playing",
  // add a new fighter (up to MAX_CHILDREN_PER_ACCOUNT), or delete one.
  // Resolves with { action: "select", childId } once a tile is chosen.
  // When { cancellable: true } and the backdrop is tapped, resolves with null.
  //
  // Default view = ONE big "Continue as <last player>" tile so a returning
  // child taps once to enter and never accidentally creates a new fighter.
  // Tapping "Switch / Add" expands the full grid (other children + ➕).
  function openProfilePicker({ cancellable = false } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "welcome-overlay profile-picker-overlay";
      let expanded = false;

      function getDefaultChild() {
        const kids = getChildren();
        if (!kids.length) return null;
        const activeId = localStorage.getItem(ACTIVE_CHILD_KEY) || "";
        return kids.find(c => c.id === activeId) || kids[0];
      }

      function render() {
        const kids = getChildren();
        const canAdd = kids.length < MAX_CHILDREN_PER_ACCOUNT;
        const def = getDefaultChild();
        // Force expanded view if there's no remembered active child (e.g. first
        // pick after migration) so the user sees every option.
        const showExpanded = expanded || !def;

        let body;
        if (!showExpanded && def) {
          const av = getAvatar(def.id, def.name) || "boy";
          body = `
            <button type="button" class="profile-continue-tile" data-cid="${escHTML(def.id)}">
              <img src="${avatarSrc(av)}" alt="${escHTML(av)}" />
              <span class="profile-continue-text">
                <span class="profile-continue-kicker">Continue as <span class="pa pa-inline" lang="pa">· ਜਾਰੀ ਰੱਖੋ</span></span>
                <span class="profile-continue-name">${escHTML(def.name)}</span>
              </span>
              <span class="profile-continue-arrow" aria-hidden="true">›</span>
            </button>
            <button type="button" class="profile-switch-link" id="profile-switch">
              👥 Switch or add fighter <span class="pa pa-inline" lang="pa">· ਬਦਲੋ ਜਾਂ ਨਵਾਂ</span>
            </button>
            <button type="button" class="profile-remove-link" id="profile-remove" data-cid="${escHTML(def.id)}">
              🗑 Remove ${escHTML(def.name)}
            </button>`;
        } else {
          const tiles = kids.map(c => {
            const av = getAvatar(c.id, c.name) || "boy";
            return `
              <div class="avatar-pick profile-tile" data-cid="${escHTML(c.id)}" role="button" tabindex="0">
                <button type="button" class="profile-tile-x" data-del="${escHTML(c.id)}" aria-label="Delete ${escHTML(c.name)}">✕</button>
                <img src="${avatarSrc(av)}" alt="${escHTML(av)}" />
                <span class="profile-tile-name">${escHTML(c.name)}</span>
              </div>`;
          }).join("");
          const addTile = canAdd ? `
            <button type="button" class="avatar-pick profile-tile-add" data-add="1">
              <span class="profile-tile-plus" aria-hidden="true">＋</span>
              <span class="profile-tile-name">Add fighter <span class="pa pa-inline" lang="pa">· ਨਵਾਂ</span></span>
            </button>` : "";
          body = `
            <div class="avatar-row profile-grid">
              ${tiles}
              ${addTile}
            </div>
            ${def ? '<button type="button" class="profile-switch-link" id="profile-back">← Back <span class="pa pa-inline" lang="pa">· ਵਾਪਸ</span></button>' : ''}`;
        }

        overlay.innerHTML = `
          <div class="welcome-card profile-picker-card" role="dialog" aria-modal="true">
            ${cancellable ? '<button type="button" class="welcome-cancel" id="profile-cancel" aria-label="Close">✕</button>' : ''}
            <p class="welcome-kicker">Punjabi Ji</p>
            <h2 class="welcome-title">Who is playing?</h2>
            <p class="welcome-subtitle pa" lang="pa">ਕੌਣ ਖੇਡ ਰਿਹਾ ਹੈ?</p>
            ${body}
          </div>`;
        bind();
      }

      function bind() {
        const cont = overlay.querySelector(".profile-continue-tile");
        if (cont) {
          cont.addEventListener("click", () => {
            const cid = cont.dataset.cid;
            try { SFX.select(); } catch (_) {}
            cleanup();
            resolve({ action: "select", childId: cid });
          });
        }
        const switchBtn = overlay.querySelector("#profile-switch");
        if (switchBtn) {
          switchBtn.addEventListener("click", () => { expanded = true; render(); });
        }
        const removeBtn = overlay.querySelector("#profile-remove");
        if (removeBtn) {
          removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const cid = removeBtn.dataset.cid;
            // deletePlayer() handles its own confirm + (if active) reload.
            deletePlayer(cid);
            // If we're still here (deleted a non-active child somehow, or user
            // cancelled the confirm), refresh the view.
            if (!getChildren().length) {
              cleanup();
              resolve({ action: "empty" });
              return;
            }
            render();
          });
        }
        const backBtn = overlay.querySelector("#profile-back");
        if (backBtn) {
          backBtn.addEventListener("click", () => { expanded = false; render(); });
        }
        overlay.querySelectorAll(".profile-tile").forEach(tile => {
          tile.addEventListener("click", (e) => {
            if (e.target.closest(".profile-tile-x")) return;
            const cid = tile.dataset.cid;
            try { SFX.select(); } catch (_) {}
            cleanup();
            resolve({ action: "select", childId: cid });
          });
        });
        overlay.querySelectorAll(".profile-tile-x").forEach(x => {
          x.addEventListener("click", (e) => {
            e.stopPropagation();
            const cid = x.dataset.del;
            const child = findChildById(cid);
            if (!child) return;
            deletePlayer(cid);
            if (!getChildren().length) {
              cleanup();
              resolve({ action: "empty" });
              return;
            }
            if (localStorage.getItem(ACTIVE_CHILD_KEY) === cid) {
              localStorage.removeItem(ACTIVE_CHILD_KEY);
            }
            render();
          });
        });
        const addBtn = overlay.querySelector(".profile-tile-add");
        if (addBtn) {
          addBtn.addEventListener("click", () => {
            try { SFX.select(); } catch (_) {}
            cleanup();
            resolve({ action: "add" });
          });
        }
        if (cancellable) {
          const cancelBtn = overlay.querySelector("#profile-cancel");
          if (cancelBtn) cancelBtn.addEventListener("click", close);
          overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        }
      }

      function close() { cleanup(); resolve(null); }
      function cleanup() {
        document.removeEventListener("keydown", onKey, true);
        overlay.remove();
      }
      function onKey(e) {
        if (cancellable && e.key === "Escape") { e.preventDefault(); close(); }
      }

      document.body.appendChild(overlay);
      render();
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

  // Post-splash flow: if at least one profile already exists, always show the
  // "Who is playing?" picker so the right child is selected on every open.
  // First run (no profiles) falls through to the original welcome modal below.
  if (getChildren().length) {
    let picked = null;
    while (!picked) {
      const res = await openProfilePicker({ cancellable: false });
      if (res && res.action === "select") {
        const c = findChildById(res.childId);
        if (c) { picked = c; break; }
      } else if (res && res.action === "add") {
        // Chain into the existing name + avatar modal, cancellable so the
        // user can back out to the picker.
        let name = "";
        let avatar = "boy";
        const wm = await openWelcomeModal({ mode: "full", cancellable: true });
        if (wm) {
          name = sanitizeName(wm.name);
          avatar = wm.avatar || "boy";
        }
        if (name) {
          if (!canAddChild()) {
            try { toast(`This account can have up to ${MAX_CHILDREN_PER_ACCOUNT} fighters.`); } catch (_) {}
            continue;
          }
          let child = findChildByName(name);
          if (!child) {
            child = { id: uid("child"), name };
            const list = getChildren();
            list.push(child);
            setChildren(list);
          }
          setAvatar(child.id, avatar);
          picked = child;
        }
        // If user cancelled the add modal, loop back to the picker.
      } else if (res && res.action === "empty") {
        // All profiles were deleted from the picker; fall through to first-run.
        break;
      }
      // Any other case: re-render picker.
    }
    if (picked) {
      currentChild = picked;
      currentChildId = picked.id;
      localStorage.setItem(ACTIVE_CHILD_KEY, picked.id);
    } else {
      currentChild = null;
      currentChildId = "";
    }
  }

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
     "dl_rupees_v2","dl_gold_v2",
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
   "dl_rupees_v2","dl_gold_v2",
   "dl_review_v2","dl_cleared_v2","dl_history_v2","dl_seen_v2","dl_daily_v2"].forEach(base => {
    const oldKey = `${base}__${currentPlayer}`;
    const newKey = `${base}__${currentChildId}`;
    const oldVal = localStorage.getItem(oldKey);
    if (oldVal != null && localStorage.getItem(newKey) == null) localStorage.setItem(newKey, oldVal);
  });

  if (!getAvatar(currentChildId, currentPlayer)) {
    // Silent default — never pop an avatar picker before the profile picker.
    // Kids can change their avatar later via the player chip.
    setAvatar(currentChildId, "boy");
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
    // Add to blocklist FIRST so any subsequent purge/snapshot recognizes the
    // deleted fighter and tombstones cross-device / legacy orphan rows.
    addToBlocklist(name, child.id);
    ["dl_pos_v2","dl_hp_v2","dl_power_v2","dl_zeni_v2","dl_balls_v2",
     "dl_rupees_v2","dl_gold_v2",
     "dl_review_v2","dl_cleared_v2","dl_history_v2","dl_seen_v2","dl_daily_v2"]
      .forEach(base => {
        localStorage.removeItem(`${base}__${child.id}`);
        localStorage.removeItem(`${base}__${name}`); // legacy cleanup
      });
    localStorage.removeItem(`${AVATAR_KEY}__${child.id}`);
    localStorage.removeItem(`${AVATAR_KEY}__${name}`); // legacy cleanup
    const lb = rdJSON(LOCAL_LB_KEY, {});
    const lcName = String(name).toLowerCase();
    for (const k of Object.keys(lb)) {
      const row = lb[k] || {};
      const rowName = String(row.player || "").toLowerCase();
      if (
        row.childId === child.id ||
        rowName === lcName ||
        row.id === `${child.id}__${deviceId}` ||
        (typeof k === "string" && k.startsWith(`${child.id}__`))
      ) delete lb[k];
    }
    wrJSON(LOCAL_LB_KEY, lb);
    // Purge from the global online board so the row doesn't reappear on
    // the 🌐 Global tab (or on other devices) after the next snapshot.
    // Match by docId, childId, OR player name so legacy/cross-device rows
    // for this fighter all get nuked.
    if (window.OnlineLB && typeof window.OnlineLB.remove === "function") {
      try {
        const targetId = `${child.id}__${deviceId}`;
        const all = (typeof window.OnlineLB.getAll === "function") ? window.OnlineLB.getAll() : [];
        const ids = new Set([targetId]);
        const lcName = String(name).toLowerCase();
        all.forEach(row => {
          if (!row || !row.id) return;
          if (row.childId === child.id) ids.add(row.id);
          else if (String(row.player || "").toLowerCase() === lcName) ids.add(row.id);
          else if (row.id.startsWith(`${child.id}__`)) ids.add(row.id);
        });
        ids.forEach(id => { try { window.OnlineLB.remove(id); } catch (_) {} });
      } catch (_) {}
    }
    const next = getChildren().filter(c => c.id !== child.id);
    setChildren(next);
    wrJSON(PLAYERS_KEY, next.map(c => c.name));
    // If the stored active pointer was the deleted child, clear it so the
    // picker's default falls through to a different remaining child.
    if (localStorage.getItem(ACTIVE_CHILD_KEY) === child.id) {
      localStorage.removeItem(ACTIVE_CHILD_KEY);
    }
    if (localStorage.getItem(PLAYER_KEY) === name) {
      localStorage.removeItem(PLAYER_KEY);
    }
    // Always reload after a delete from the picker (currentChildId may not
    // be set yet during boot). This guarantees a clean state with no stale
    // avatar / chip / progress lingering anywhere.
    if (child.id === currentChildId || !currentChildId) {
      location.reload();
      return;
    }
    if (typeof renderBoard === "function") renderBoard();
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
    // If the parent re-adds a previously-deleted name, lift the block so the
    // new fighter actually shows up on the leaderboard again.
    removeFromBlocklist(name, child.id);
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
      fpImg.src = "images/boystart.png";
      fpImg.alt = "fighter";
    }
    fpEl.style.display = "block";
  }
  function updateAura() {
    if (!fpEl) return;
    const max    = maxHpFor(state.power);
    const lowHp  = max > 0 && state.hp / max <= 0.34;
    const superR = state.power >= 75_000;          // top food tiers (Mooli Parantha+)
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
    pos:     `dl_pos_v2__${currentChildId}`,
    hp:      `dl_hp_v2__${currentChildId}`,
    power:   `dl_power_v2__${currentChildId}`,
    rupees:  `dl_rupees_v2__${currentChildId}`,
    gold:    `dl_gold_v2__${currentChildId}`,
    // Legacy DBZ-named keys (read once for migration, then phased out).
    legacyZeni:  `dl_zeni_v2__${currentChildId}`,
    legacyBalls: `dl_balls_v2__${currentChildId}`,
    review:  `dl_review_v2__${currentChildId}`,
    cleared: `dl_cleared_v2__${currentChildId}`,
    history: `dl_history_v2__${currentChildId}`,
    daily:   `dl_daily_v2__${currentChildId}`,
    muted:   "dl_muted_v2",
    music:   "dl_music_v1",
    orientLock: "dl_orient_lock_v1",
    pomo:    "dl_pomo_v1",
  };
  function loadJSON(k, fb) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fb : v; }
    catch (_) { return fb; }
  }
  function saveJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  // legacy migration (from old verb-based app + old DBZ-themed keys)
  const legacyPower = Number(localStorage.getItem("vtk_power") || 0);
  // Old DBZ-themed values: prefer new key, then per-child legacy, then global legacy.
  const legacyRupees = Number(
    localStorage.getItem(KEY.legacyZeni) ?? localStorage.getItem("vtk_zeni") ?? 0
  );
  // Legacy `balls` field (capped at 7). Convert each ball to one full
  // gold bar (10 coins) so returners feel rewarded by the new system.
  const legacyBallsRaw = Number(
    localStorage.getItem(KEY.legacyBalls) ?? localStorage.getItem("vtk_balls") ?? 0
  );
  const legacyGold = Math.max(0, Math.min(7, legacyBallsRaw)) * GOLD_PER_BAR;

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
    // not the lowest-tier default. Sentinel `null` means "use rank max".
    hp: (() => {
      const raw = localStorage.getItem(KEY.hp);
      if (raw == null) return null;
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) return null;
      if (n <= 3) return null; // legacy heart count
      return n;
    })(),
    power: Number(localStorage.getItem(KEY.power) ?? legacyPower),
    rupees: Number(localStorage.getItem(KEY.rupees) ?? legacyRupees),
    // Gold is uncapped; HUD splits it into bars (×10) + coins (mod 10).
    gold:   Number(localStorage.getItem(KEY.gold)   ?? legacyGold),
    reviewQueue: migrateReviewQueue(loadJSON(KEY.review, [])),
    cleared:     loadJSON(KEY.cleared, []),
    history:     loadJSON(KEY.history, []),
    cardsSeen:   Number(localStorage.getItem(`dl_seen_v2__${currentChildId}`) || 0),
    streak: 0,
    flipped: false,
    answered: false,
    activeReviewId: null,
    reviewsInARow: 0,
    chaiMode: false,
    chaiRemaining: 0,
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
    localStorage.setItem(KEY.rupees, state.rupees);
    localStorage.setItem(KEY.gold,   state.gold);
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
      power:  state.power  | 0,
      rupees: state.rupees | 0,
      gold:   state.gold   | 0,
      rank:   r.name,
      step:   state.idx + 1,
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
  const _prev = { hp: null, rupees: null, gold: null, power: null };
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
    if (rupeesEl) {
      const from = _prev.rupees == null ? state.rupees : _prev.rupees;
      tweenNumber(rupeesEl, from, state.rupees, 600);
    }
    if (goldBarsEl || silverCoinsEl) {
      const before = _prev.gold == null ? state.gold : _prev.gold;
      const bars  = Math.floor(state.gold / GOLD_PER_BAR);
      const coins = state.gold % GOLD_PER_BAR;
      if (goldBarsEl)    goldBarsEl.textContent    = String(bars);
      if (silverCoinsEl) silverCoinsEl.textContent = String(coins);
      if (state.gold > before) {
        const bumped = (Math.floor(before / GOLD_PER_BAR) !== bars) ? goldBarsEl : silverCoinsEl;
        if (bumped) { bumped.classList.remove("bump"); void bumped.offsetWidth; bumped.classList.add("bump"); }
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
    const pct = Math.min(100, (state.power / MAX_RANK_POWER) * 100);
    if (powerFill) {
      powerFill.style.width = pct + "%";
      powerFill.classList.toggle("max-tier", state.power >= MAX_RANK_POWER);
      // Sheen pulse whenever power moved up
      if (_prev.power != null && state.power > _prev.power) {
        powerFill.classList.remove("charging"); void powerFill.offsetWidth;
        powerFill.classList.add("charging");
        setTimeout(() => powerFill && powerFill.classList.remove("charging"), 760);
      }
    }
    _prev.hp = state.hp; _prev.rupees = state.rupees;
    _prev.gold = state.gold; _prev.power = state.power;
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

  // Gold-bar arc: spawn a 🟨 at originEl center, fly to the gold counter in HUD.
  function goldBarArc(originEl) {
    if (!motionOK()) return;
    const target = document.getElementById("gold-bars") || document.getElementById("silver-coins");
    if (!target) return;
    const src = (originEl || document.body).getBoundingClientRect();
    const dst = target.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "gold-fly";
    fly.textContent = "🟨";
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
    t.className = "gold-toast " + cls;
    if (typeof textOrObj === "string") {
      t.innerHTML = textOrObj;
    } else {
      t.innerHTML = `${textOrObj.en}${paLine(textOrObj.pa)}`;
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  // ===== Sound — Heroic Bhangra SoundKit =====
  // Pure Web Audio synthesis (offline-safe, zero assets). Layered voices:
  // dhol (boom+slap), tumbi (twangy pluck), chimta (jingle), clap (taali),
  // plus generic pluck/sweep helpers. All routed through master bus
  // (gain → compressor → reverb send → destination) so layered hits
  // never clip. Mute hard-zeros the master.
  let muted = localStorage.getItem(KEY.muted) === "1";
  let _ac = null, _master = null, _comp = null, _verbSend = null, _verb = null, _noiseBuf = null;
  const _spamGuard = Object.create(null); // per-SFX last-fire timestamps (anti-spam)
  const _seenAppear = new Set();           // for bossAppear once-per-session

  // Internal: build the audio context + master bus on first use.
  // Does NOT check the SFX mute flag — BGM may run while SFX is muted.
  function _initAudio() {
    try {
      if (!_ac) {
        _ac = new (window.AudioContext || window.webkitAudioContext)();
        // Master bus
        _master = _ac.createGain();
        _master.gain.value = 0.85;
        _comp = _ac.createDynamicsCompressor();
        _comp.threshold.value = -16; _comp.knee.value = 26;
        _comp.ratio.value = 4; _comp.attack.value = 0.003; _comp.release.value = 0.20;
        _master.connect(_comp); _comp.connect(_ac.destination);
        // Reverb send (parallel) — short tight impulse for "stage" feel
        _verbSend = _ac.createGain(); _verbSend.gain.value = 0.16;
        _verb = _ac.createConvolver(); _verb.buffer = _makeImpulse(0.32, 3.4);
        const verbOut = _ac.createGain(); verbOut.gain.value = 0.50;
        _verbSend.connect(_verb); _verb.connect(verbOut); verbOut.connect(_comp);
        // Noise buffer (1 s mono) reused for percussive hits
        _noiseBuf = _ac.createBuffer(1, _ac.sampleRate, _ac.sampleRate);
        const nd = _noiseBuf.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      }
      if (_ac.state === "suspended") _ac.resume();
      return _ac;
    } catch (_) { return null; }
  }
  // SFX entry point — short-circuits when muted so SFX voices stay silent.
  function ac() {
    if (muted) return null;
    return _initAudio();
  }
  function _makeImpulse(seconds, decay) {
    // Lazy: needs _ac but only called from within ac() init
    const len = Math.floor(_ac.sampleRate * seconds);
    const buf = _ac.createBuffer(2, len, _ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }
  function _spam(key, minMs) {
    const now = (typeof performance !== "undefined" ? performance.now() : Date.now());
    const last = _spamGuard[key] || 0;
    if (now - last < minMs) return true;
    _spamGuard[key] = now;
    return false;
  }
  // ---------- Voices ----------
  function _route(node, dryGain, wetSend) {
    const dry = _ac.createGain(); dry.gain.value = dryGain;
    node.connect(dry); dry.connect(_master);
    if (wetSend > 0 && _verbSend) {
      const w = _ac.createGain(); w.gain.value = wetSend;
      node.connect(w); w.connect(_verbSend);
    }
  }
  // Tumbi: twangy single-string pluck (sawtooth → lowpass → fast decay)
  function tumbi(freq, dur = 0.28, vol = 0.22, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.92), t + dur);
    const lp = a.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(2400, t); lp.Q.value = 4;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g);
    _route(g, 1, 0.25);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Dhol: low boom (sine + detuned sub for body) + percussive slap (filtered noise burst)
  function dhol(vol = 0.32, when = 0, deep = 1) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    // Boom: two oscillators (fundamental + sub-octave) for fat body
    const f0 = 95 * deep, f1 = 55 * deep;
    const og = a.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    [
      { type: "sine",     mul: 1.0,  amp: 1.0 },
      { type: "triangle", mul: 0.5,  amp: 0.55 }, // sub-octave warmth
    ].forEach(v => {
      const o = a.createOscillator(); o.type = v.type;
      o.frequency.setValueAtTime(f0 * v.mul, t);
      o.frequency.exponentialRampToValueAtTime(f1 * v.mul, t + 0.18);
      const vg = a.createGain(); vg.gain.value = v.amp;
      o.connect(vg); vg.connect(og);
      o.start(t); o.stop(t + 0.28);
    });
    _route(og, 1, 0.30);
    // Slap (noise burst)
    const n = a.createBufferSource(); n.buffer = _noiseBuf;
    const bp = a.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = 1800; bp.Q.value = 0.9;
    const ng = a.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(vol * 0.8, t + 0.002);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    n.connect(bp); bp.connect(ng); _route(ng, 1, 0.15);
    n.start(t); n.stop(t + 0.08);
  }
  // Chimta: bandpass noise burst — metallic jingle
  function chimta(freq = 6000, vol = 0.18, when = 0, dur = 0.10) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const n = a.createBufferSource(); n.buffer = _noiseBuf;
    const bp = a.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = freq; bp.Q.value = 8;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp); bp.connect(g); _route(g, 1, 0.40);
    n.start(t); n.stop(t + dur + 0.02);
  }
  // Clap (taali): two ultra-short noise bursts
  function clap(vol = 0.20, when = 0) {
    const a = ac(); if (!a) return;
    [0, 0.028].forEach((off) => {
      const t = a.currentTime + when + off;
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      n.connect(hp); hp.connect(g); _route(g, 1, 0.20);
      n.start(t); n.stop(t + 0.07);
    });
  }
  // Generic short pluck (square/triangle) — used for UI ticks
  function pluck(freq, dur = 0.08, type = "triangle", vol = 0.12, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(freq, t);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); _route(g, 1, 0.05);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Pitch sweep (used for whoosh/timeout)
  function sweep(f0, f1, dur, type = "sawtooth", vol = 0.18, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); _route(g, 1, 0.20);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // Tabla bol — high-pitched membrane hit (DHIN/NA/TIN), sharper and ringier than dhol
  // bol: "DHIN" (long ring), "NA" (sharp), "TIN" (closed), "TA" (slap)
  function tabla(bol, vol = 0.22, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const cfg = {
      DHIN: { f0: 320, f1: 200, dur: 0.32, ring: 0.18, slap: 0.10 },
      NA:   { f0: 480, f1: 380, dur: 0.16, ring: 0.06, slap: 0.16 },
      TIN:  { f0: 540, f1: 460, dur: 0.10, ring: 0.04, slap: 0.14 },
      TA:   { f0: 380, f1: 280, dur: 0.12, ring: 0.05, slap: 0.18 },
    }[bol] || { f0: 380, f1: 280, dur: 0.18, ring: 0.08, slap: 0.12 };
    // Ring (membrane resonance) — sine pitch-bend
    const o = a.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(cfg.f0, t);
    o.frequency.exponentialRampToValueAtTime(cfg.f1, t + cfg.dur);
    const og = a.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    og.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur + cfg.ring);
    o.connect(og); _route(og, 1, 0.25);
    o.start(t); o.stop(t + cfg.dur + cfg.ring + 0.02);
    // Slap (filtered noise transient)
    const n = a.createBufferSource(); n.buffer = _noiseBuf;
    const bp = a.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = 2400; bp.Q.value = 1.2;
    const ng = a.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(vol * cfg.slap * 4, t + 0.001);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    n.connect(bp); bp.connect(ng); _route(ng, 1, 0.10);
    n.start(t); n.stop(t + 0.06);
  }
  // Vocal formant sting — fakes a Punjabi shout ("AA", "OH", "EH") via 3 bandpass
  // resonators tuned to vowel formants. Crude but unmistakably "voice-like".
  // vowel: "AA" = balle/haa,  "OH" = ho/oye,  "EH" = hey/wah
  function vox(vowel, freq = 220, dur = 0.32, vol = 0.22, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const formants = ({
      AA: [[730, 1.0], [1090, 0.55], [2440, 0.30]], // open "aa"  (balle, haa)
      OH: [[570, 1.0], [840,  0.55], [2410, 0.25]], // rounded "oh" (ho, oye)
      EH: [[530, 0.85], [1840, 0.65], [2480, 0.30]], // bright "eh" (hey, wah)
    })[vowel] || [[600, 1], [1200, 0.5], [2400, 0.3]];
    // Source: sawtooth (rich harmonics) with slight pitch bend up then down — natural shout contour
    const src = a.createOscillator(); src.type = "sawtooth";
    src.frequency.setValueAtTime(freq, t);
    src.frequency.exponentialRampToValueAtTime(freq * 1.18, t + dur * 0.25);
    src.frequency.exponentialRampToValueAtTime(freq * 0.85, t + dur);
    // Vibrato LFO (~6 Hz, ±3% depth) for human-ness
    const lfo = a.createOscillator(); lfo.frequency.value = 6;
    const lfoGain = a.createGain(); lfoGain.gain.value = freq * 0.03;
    lfo.connect(lfoGain); lfoGain.connect(src.frequency);
    // Master envelope on the voice
    const vEnv = a.createGain();
    vEnv.gain.setValueAtTime(0.0001, t);
    vEnv.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    vEnv.gain.setValueAtTime(vol, t + dur * 0.6);
    vEnv.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    // Three parallel formant bandpass filters
    formants.forEach(([f, amp]) => {
      const bp = a.createBiquadFilter(); bp.type = "bandpass";
      bp.frequency.value = f; bp.Q.value = 12;
      const fg = a.createGain(); fg.gain.value = amp;
      src.connect(bp); bp.connect(fg); fg.connect(vEnv);
    });
    _route(vEnv, 1, 0.30);
    src.start(t); src.stop(t + dur + 0.02);
    lfo.start(t); lfo.stop(t + dur + 0.02);
  }
  // Crowd cheer — long filtered noise swell (great for rank-up / boss-win)
  function crowd(dur = 1.4, vol = 0.16, when = 0) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const n = a.createBufferSource(); n.buffer = _noiseBuf; n.loop = true;
    const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 800;
    const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1600; bp.Q.value = 0.8;
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25);
    g.gain.setValueAtTime(vol, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(hp); hp.connect(bp); bp.connect(g); _route(g, 1, 0.45);
    n.start(t); n.stop(t + dur + 0.05);
  }

  // ---------- SFX (bhangra-flavored recipes) ----------
  // Raag Mand (Punjabi folk scale): Sa Re Ga Pa Dha Sa'  = C D E G A C
  //   C5=523, D5=587, E5=659, G5=784, A5=880, C6=1046, D6=1175, E6=1318
  // 8-beat Kaherwa theka (the bhangra heartbeat):
  //   beats:  1   2   3   4   5   6   7   8
  //   bols:  DHA DHIN NA TIN | NA DHIN DHIN NA
  // We map DHA → dhol+DHIN-tabla, others → tabla bols on top.
  const SFX = {
    correct() {
      if (_spam("correct", 60)) return;
      // Sa-Pa pluck + tabla NA + chimta — quick dopamine hit
      tumbi(784, 0.22, 0.22);                  // Pa
      tabla("NA", 0.16, 0.02);
      chimta(6500, 0.14, 0.04, 0.10);
    },
    wrong() {
      if (_spam("wrong", 80)) return;
      // Soft, kid-friendly: muted dhol + downward tumbi bend + brief "oh" (no harsh formant)
      dhol(0.18, 0, 0.85);
      tumbi(330, 0.30, 0.16, 0.04);
      sweep(330, 200, 0.22, "triangle", 0.10, 0.02);
    },
    combo(n) {
      if (_spam("combo:" + (n | 0), 90)) return;
      // Raag Mand ascending: Sa Ga Pa Dha Sa' Re' Ga'
      const notes = [523, 659, 784, 880, 1046, 1175, 1318];
      const k = Math.min(notes.length, Math.max(2, Math.floor(n / 2) + 1));
      for (let i = 0; i < k; i++) tumbi(notes[i], 0.20, 0.20, i * 0.06);
      tabla("NA", 0.18, 0);
      clap(0.16, 0.04);
      if (n >= 5) { clap(0.18, 0.18); tabla("DHIN", 0.18, 0.20); }
      if (n >= 10) { vox("AA", 330, 0.34, 0.20, 0.10); chimta(7000, 0.18, 0.30, 0.20); } // "haaa!"
      if (n >= 15) { dhol(0.26, 0.04, 0.95); vox("EH", 392, 0.28, 0.18, 0.30); }         // "wah!"
    },
    blockClear() {
      if (_spam("blockClear", 200)) return;
      // Mand riff with tabla underneath: Sa Ga Pa Dha Sa'
      [523, 659, 784, 880, 1046].forEach((f, i) => tumbi(f, 0.24, 0.22, i * 0.09));
      tabla("DHIN", 0.20, 0.00);
      tabla("NA",   0.16, 0.18);
      tabla("DHIN", 0.20, 0.36);
      chimta(6500, 0.18, 0.10, 0.12);
      vox("AA", 392, 0.36, 0.20, 0.42); // "shabaash!" feel
      clap(0.20, 0.50);
    },
    bossHit(tier) {
      if (_spam("bossHit", 50)) return;
      // Visceral double-hit + tabla TA accent
      dhol(0.36, 0, 1.0);
      tabla("TA", 0.20, 0.02);
      dhol(0.26, 0.10, 1.0);
      sweep(220, 90, 0.18, "sawtooth", 0.14, 0);
      if ((tier | 0) >= 3) {
        // Tier 3+: brief warrior shout
        vox("EH", 330, 0.22, 0.18, 0.10); // "hai!"
      }
    },
    bossWin() {
      if (_spam("bossWin", 700)) return;
      // ===== Authentic 8-beat Kaherwa theka @ 130 BPM =====
      // Eighth-note step ≈ 115 ms
      // beats:  1     2    3   4    | 5   6     7     8
      // bols:   DHA   DHIN NA  TIN  | NA  DHIN  DHIN  NA
      const E = 0.115;
      const theka = [
        ["DHA",  1.0], ["DHIN", 0.7], ["NA", 0.6], ["TIN", 0.55],
        ["NA",   0.7], ["DHIN", 0.8], ["DHIN", 0.7], ["NA", 0.7],
      ];
      // Play the theka twice for a full cycle
      for (let cycle = 0; cycle < 2; cycle++) {
        theka.forEach(([bol, accent], i) => {
          const t = (cycle * 8 + i) * E;
          if (bol === "DHA") {
            // DHA = dhol boom + tabla DHIN together
            dhol(0.32 * accent, t, 1.0);
            tabla("DHIN", 0.20 * accent, t + 0.005);
          } else {
            tabla(bol, 0.22 * accent, t);
            // Add subtle dhol on beat 5 (sam of second half) for groove
            if (i === 4) dhol(0.18, t, 0.95);
          }
        });
      }
      // Tumbi melody in raag Mand over both cycles — call & response
      const totalDur = 8 * E * 2; // ~1.84 s
      [523, 659, 784, 880, 1046, 880, 1046, 1175, 1318, 1046, 880, 784].forEach((f, i) => {
        tumbi(f, 0.28, 0.22, 0.08 + i * (totalDur / 14));
      });
      // Taali (claps) on beats 2, 4, 6, 8 — bhangra clap pattern
      [1, 3, 5, 7, 9, 11, 13, 15].forEach(step => clap(0.20, step * E + 0.02));
      // Chimta accents at top
      chimta(6500, 0.22, 0.10, 0.18);
      chimta(7500, 0.24, totalDur - 0.20, 0.36);
      // Big "BALLE!" shout at the end + crowd cheer
      vox("AA", 330, 0.50, 0.26, totalDur - 0.30);
      crowd(1.5, 0.14, totalDur - 0.20);
    },
    rankUp() {
      if (_spam("rankUp", 500)) return;
      // Rising raag Mand + tabla DHIN-NA-DHIN + "BALLE BALLE!" double shout
      [523, 659, 784, 880, 1046].forEach((f, i) => tumbi(f, 0.24, 0.22, i * 0.08));
      tabla("DHIN", 0.22, 0.00);
      tabla("NA",   0.18, 0.16);
      tabla("DHIN", 0.22, 0.32);
      dhol(0.30, 0.32, 1.0);
      clap(0.22, 0.10); clap(0.22, 0.26); clap(0.22, 0.42);
      chimta(6500, 0.22, 0.40, 0.22);
      // "Balle... balle!" — two AA shouts, second one higher
      vox("AA", 294, 0.30, 0.22, 0.18);
      vox("AA", 392, 0.40, 0.26, 0.55);
      crowd(1.2, 0.12, 0.40);
    },
    ko() {
      if (_spam("ko", 400)) return;
      // Disappointed sigh: descending tumbi + soft "oh" + low dhol
      tumbi(440, 0.40, 0.20);
      tumbi(330, 0.40, 0.18, 0.18);
      tumbi(220, 0.55, 0.16, 0.36);
      dhol(0.22, 0.04, 0.85);
      vox("OH", 196, 0.55, 0.16, 0.12); // soft "oh nooo"
    },
    ball() {
      if (_spam("ball", 200)) return;
      // Sparkle reward + tiny tabla TIN flourish
      chimta(6500, 0.10, 0.00, 0.08);
      chimta(7500, 0.12, 0.08, 0.10);
      chimta(8500, 0.14, 0.18, 0.12);
      tabla("TIN", 0.16, 0.02);
      tumbi(1046, 0.22, 0.18, 0.06);
    },
    // ---- New SFX ----
    damage() {
      if (_spam("damage", 60)) return;
      dhol(0.28, 0, 0.85);
      tabla("TA", 0.16, 0.01);
      sweep(380, 180, 0.16, "triangle", 0.10, 0.02);
    },
    coin() {
      if (_spam("coin", 40)) return;
      chimta(7000, 0.10, 0.00, 0.06);
      pluck(1320, 0.10, "triangle", 0.14, 0.04);
      pluck(1760, 0.10, "triangle", 0.10, 0.06);
    },
    click() {
      if (_spam("click", 30)) return;
      tabla("TIN", 0.08, 0); // dry tabla tick — way more "Punjabi" than a sine pluck
    },
    select() {
      if (_spam("select", 80)) return;
      tumbi(659, 0.18, 0.18);
      tabla("NA", 0.14, 0.02);
      chimta(6500, 0.10, 0.06, 0.08);
    },
    enemyAppear(tier) {
      if (_spam("enemyAppear", 200)) return;
      const t = (tier | 0) || 1;
      dhol(0.26 + t * 0.03, 0.00, 1.0);
      tabla("TA", 0.16, 0.02);
      if (t >= 2) dhol(0.22, 0.12, 0.95);
      if (t >= 3) {
        sweep(330, 220, 0.30, "sawtooth", 0.16, 0.06);
        vox("OH", 220, 0.28, 0.20, 0.14); // "oye!"
      }
    },
    bossAppear() {
      if (_spam("bossAppear", 500)) return;
      // Crescendo: 4 dhol hits, big tabla DHIN, then a "OYE!" shout
      [0.00, 0.12, 0.22, 0.32].forEach((off, i) => dhol(0.20 + i * 0.05, off, 1.0));
      tabla("DHIN", 0.26, 0.36);
      sweep(220, 110, 0.40, "sawtooth", 0.20, 0.20);
      vox("OH", 196, 0.40, 0.26, 0.30); // dramatic "oye!"
      chimta(7000, 0.24, 0.46, 0.30);
    },
    tick() {
      if (_spam("tick", 200)) return;
      tabla("TIN", 0.12, 0); // ticking tabla — much more characterful than chimta
    },
    timeout() {
      if (_spam("timeout", 300)) return;
      sweep(440, 110, 0.36, "sawtooth", 0.20);
      dhol(0.30, 0.30, 0.85);
      vox("OH", 165, 0.34, 0.18, 0.30); // "ohh nooo"
    },
    hint() {
      if (_spam("hint", 150)) return;
      chimta(6500, 0.08, 0.00, 0.06);
      chimta(7500, 0.08, 0.06, 0.06);
      chimta(8500, 0.10, 0.12, 0.06);
      tabla("TIN", 0.10, 0.04);
    },
    streakBreak() {
      if (_spam("streakBreak", 250)) return;
      tumbi(440, 0.22, 0.16);
      tumbi(330, 0.30, 0.14, 0.10);
      vox("OH", 196, 0.30, 0.14, 0.06);
    },
    welcome() {
      // Splash-tap stinger: short bhangra hello with vocal "WAH!"
      if (_spam("welcome", 600)) return;
      dhol(0.32, 0.00, 1.0);
      tabla("DHIN", 0.20, 0.005);
      [659, 784, 880, 1046].forEach((f, i) => tumbi(f, 0.24, 0.22, 0.06 + i * 0.07));
      tabla("NA", 0.18, 0.14);
      tabla("DHIN", 0.20, 0.28);
      clap(0.20, 0.10); clap(0.20, 0.28);
      vox("EH", 330, 0.32, 0.22, 0.18); // "WAH!" greeting
      chimta(6500, 0.22, 0.34, 0.22);
    },
    // Force AudioContext creation inside a user gesture (iOS Safari requirement).
    unlock() {
      const a = ac();
      return !!(a && a.state !== "suspended");
    },
  };
  // Track first-time enemy appearances for bossAppear vs enemyAppear distinction.
  SFX._seenAppear = _seenAppear;

  // ===== BGM — Modern Punjabi-Trap × Gurbani fusion loop =====
  // 16th-note grid at 108 BPM. Production tricks:
  //   • 808 sub-bass tied to kick (Diljit/AP Dhillon vibe)
  //   • Trap hi-hats with rolls + open-hat off-beats
  //   • Sidechain pump (master ducks on every kick) — that "breathing" feel
  //   • Snare backbeat on 5 & 13
  //   • Vocal chops (sliced alaap stabs)
  //   • Reverse-swell + filter sweep build-ups every 4 bars
  //   • Drop: drums mute for 2 beats every 8 cycles, then BIG return
  // Preserved Gurbani layers: tanpura drone, harmonium reed, sung alaap.
  // Lookahead scheduler (25 ms tick / 100 ms ahead) keeps timing tight
  // even when the tab is throttled.
  const BGM = (function () {
    let on = localStorage.getItem(KEY.music) !== "0";
    let _musicGain = null, _sideChain = null;
    let _running = false;
    let _timer = null;
    let _nextNoteTime = 0;
    let _step = 0;            // 0..15 across one bar (16th notes)
    let _cycle = 0;           // increments every full bar (monotonic, used by phrase rotation)
    let _bar = 0;             // 0..15 — index into FORM_16 (resets every 16 bars)
    const BPM = 108;
    const BEAT = 60 / BPM;            // quarter-note duration
    const STEP = BEAT / 2;            // 8th-note grid... actually 16th-notes (16 per bar)
    const STEPS_PER_BAR = 16;
    const LOOKAHEAD = 0.10;
    const TICK_MS = 25;

    // ---------- Raag Desh frequency table (S R G M P D n N, 2 octaves + S6) ----------
    // Equal-tempered, Sa = C. Komal Ni (n) = Bb, shuddha Ni (N) = B.
    const NOTE = {
      S4: 261.63, R4: 293.66, G4: 329.63, M4: 349.23,
      P4: 392.00, D4: 440.00, n4: 466.16, N4: 493.88,
      S5: 523.25, R5: 587.33, G5: 659.25, M5: 698.46,
      P5: 783.99, D5: 880.00, n5: 932.33, N5: 987.77,
      S6: 1046.50,
    };

    // ---------- 16-bar macro form (Punjabi pop-trap arc) ----------
    const FORM_16 = [
      "INTRO_1", "INTRO_2",
      "A", "A", "A_PLUS", "A_PLUS",
      "A", "A", "A_PLUS", "A_PLUS",
      "B", "B", "B_BUILD",
      "PRE_DROP", "DROP", "OUTRO",
    ];

    // Per-section voice gates. Values: true=play, false=mute, "minimal"/"sparse"/
    // "main"/"answer"/"half"/"roll"/"light"/"active" = variant patterns.
    const SECTIONS = {
      INTRO_1:  { kick:false, sub:false,      snare:false, clap:false, closedHat:false,  openHat:false, dhol:false,   tablaNA:false,    tumbi:"sparse", tanpura:true, pad:true, alaap:false, vocalChop:false, reverseSwell:false, ghostSnare:false },
      INTRO_2:  { kick:false, sub:"minimal",  snare:false, clap:false, closedHat:false,  openHat:false, dhol:true,    tablaNA:false,    tumbi:"sparse", tanpura:true, pad:true, alaap:true,  vocalChop:false, reverseSwell:true,  ghostSnare:false },
      A:        { kick:true,  sub:true,       snare:true,  clap:true,  closedHat:true,   openHat:true,  dhol:true,    tablaNA:true,     tumbi:"main",   tanpura:true, pad:true, alaap:false, vocalChop:false, reverseSwell:false, ghostSnare:true  },
      A_PLUS:   { kick:true,  sub:true,       snare:true,  clap:true,  closedHat:true,   openHat:true,  dhol:true,    tablaNA:true,     tumbi:"main",   tanpura:true, pad:true, alaap:true,  vocalChop:true,  reverseSwell:"alt", ghostSnare:true  },
      B:        { kick:false, sub:"minimal",  snare:false, clap:false, closedHat:"half", openHat:false, dhol:"light", tablaNA:"active", tumbi:"answer", tanpura:true, pad:true, alaap:true,  vocalChop:false, reverseSwell:false, ghostSnare:false },
      B_BUILD:  { kick:false, sub:"minimal",  snare:false, clap:false, closedHat:"half", openHat:false, dhol:"light", tablaNA:"active", tumbi:"answer", tanpura:true, pad:true, alaap:true,  vocalChop:true,  reverseSwell:true,  ghostSnare:false },
      PRE_DROP: { kick:false, sub:false,      snare:false, clap:false, closedHat:"roll", openHat:false, dhol:false,   tablaNA:true,     tumbi:false,    tanpura:true, pad:true, alaap:false, vocalChop:true,  reverseSwell:true,  ghostSnare:false },
      DROP:     { kick:true,  sub:true,       snare:true,  clap:true,  closedHat:true,   openHat:true,  dhol:true,    tablaNA:true,     tumbi:"main",   tanpura:true, pad:true, alaap:true,  vocalChop:true,  reverseSwell:false, ghostSnare:false },
      OUTRO:    { kick:false, sub:"minimal",  snare:false, clap:false, closedHat:false,  openHat:false, dhol:true,    tablaNA:false,    tumbi:"sparse", tanpura:true, pad:true, alaap:false, vocalChop:false, reverseSwell:false, ghostSnare:false },
    };

    // ---------- Bar-level chord progression (I → bVII → IV → V Punjabi loop) ----------
    const ROOT_DEGREES_16 = [
      "I", "V",
      "I", "bVII", "IV", "V",
      "I", "bVII", "IV", "V",
      "vi", "bVII", "IV",
      "V", "I", "I",
    ];
    const BASS_ROOT_HZ = {
      I: 130.81, bVII: 116.54, IV: 174.61, V: 196.00, vi: 220.00,
    };
    // Per-step bass pattern (root/fifth/octave or rest)
    const BASS_PATTERN_16 = [
      "root", null,   null,    "root",
      null,   null,   "fifth", null,
      "root", null,   null,    "octave",
      null,   null,   "fifth", null,
    ];
    const BASS_INTERVAL = { root: 1.0, fifth: Math.pow(2, 7/12), octave: 2.0 };
    function _bassHz(barIdx, stepIdx) {
      const tok = BASS_PATTERN_16[stepIdx]; if (!tok) return 0;
      const root = BASS_ROOT_HZ[ROOT_DEGREES_16[barIdx]] || 130.81;
      return root * BASS_INTERVAL[tok];
    }

    // ---------- Tumbi phrases — A: ascending Desh; B: descending with komal Ni ----------
    const TUMBI_A_16 = [
      "S5", null, "R5", null, "M5", "P5", null, "N5",
      "S6", null, "N5", "P5", "M5", null, "R5", null,
    ];
    const TUMBI_B_16 = [
      "S6", null, "n5", null, "D5", "P5", null, "M5",
      "G5", null, "R5", "G5", "S5", null, null, null,
    ];
    const TUMBI_SPARSE_16 = [
      "S5", null, null, null, null, null, null, null,
      "P5", null, null, null, null, null, null, null,
    ];

    // Alaap glide pairs (Desh grammar): ascending uses N, descending uses n.
    const ALAAP_PAIRS = [
      ["R4","M4"], ["M4","P4"], ["P4","N4"], ["N4","S5"],   // ascending
      ["S5","n4"], ["n4","D4"], ["D4","P4"], ["P4","M4"],   // descending
    ];
    // Vocal-chop pairs — short stabs, mostly descending komal-Ni color.
    const CHOP_PAIRS = [
      ["S5","R5"], ["P5","M5"], ["n5","D5"], ["D5","P5"], ["S6","n5"],
    ];

    // ---------- Closed/open hat humanized velocity arrays ----------
    const CLOSED_HAT_GAIN_16 = [
      0.085, 0.000, 0.055, 0.000, 0.072, 0.000, 0.052, 0.000,
      0.082, 0.000, 0.057, 0.000, 0.070, 0.000, 0.050, 0.000,
    ];
    const OPEN_HAT_GAIN_16 = [
      0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.105,
      0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.000, 0.090,
    ];
    const CLOSED_HAT_HALF_16 = [
      0.000, 0.000, 0.055, 0.000, 0.000, 0.000, 0.052, 0.000,
      0.000, 0.000, 0.057, 0.000, 0.000, 0.000, 0.050, 0.000,
    ];
    const GHOST_SNARE_GAIN_16 = [
      0.000, 0.000, 0.000, 0.028, 0.000, 0.000, 0.000, 0.000,
      0.000, 0.000, 0.022, 0.000, 0.000, 0.000, 0.000, 0.000,
    ];
    const DHOL_LIGHT_16 = [
      0.135, 0.000, 0.045, 0.000, 0.000, 0.055, 0.000, 0.000,
      0.110, 0.000, 0.040, 0.000, 0.000, 0.055, 0.000, 0.000,
    ];
    const TABLA_NA_ACTIVE_16 = [
      0.000, 0.000, 0.000, 0.070, 0.000, 0.000, 0.000, 0.060,
      0.000, 0.000, 0.000, 0.080, 0.000, 0.000, 0.000, 0.065,
    ];

    // Swing (54%) on odd 16ths — apply to hats / tumbi / tabla only.
    const SWING_OFFSET = STEP * ((0.54 - 0.5) * 2); // +11 ms at 108 BPM
    function _swing(off, step, swingable) {
      return (swingable && (step % 2 === 1)) ? off + SWING_OFFSET : off;
    }
    function _hatJitter() { return (Math.random() * 2 - 1) * 0.004; }

    function _initGain() {
      if (_musicGain || !_ac) return;
      // Sidechain stage: _musicGain → _sideChain → _master
      // We duck _sideChain.gain on every kick for the modern "pump" feel.
      _musicGain = _ac.createGain();
      _musicGain.gain.value = on ? 0.55 : 0.0001;
      _sideChain = _ac.createGain();
      _sideChain.gain.value = 1.0;
      _musicGain.connect(_sideChain);
      _sideChain.connect(_master);
    }

    // Sidechain pump: duck the bus briefly on each kick.
    // Classic "EDM/trap breathing" production technique.
    function _pump(when) {
      if (!_sideChain || !_ac) return;
      const t = _ac.currentTime + when;
      _sideChain.gain.cancelScheduledValues(t);
      _sideChain.gain.setValueAtTime(1.0, t);
      _sideChain.gain.linearRampToValueAtTime(0.45, t + 0.01); // duck fast
      _sideChain.gain.exponentialRampToValueAtTime(1.0, t + 0.22); // recover
    }

    // Schedule one 16th-note step.
    function _scheduleStep(step, when) {
      if (!_ac) return;
      const off = when - _ac.currentTime;
      const downbeat = (step % 4) === 0;
      const eighth   = (step % 2) === 0;
      const sec = SECTIONS[FORM_16[_bar]] || SECTIONS.A;
      const barRoot = ROOT_DEGREES_16[_bar];
      const rootHz = BASS_ROOT_HZ[barRoot] || 130.81;

      // ---------- Tanpura drone (Sa-Pa-Sa-Sa per quarter, follows current root) ----------
      if (sec.tanpura && downbeat) {
        const ratio = [1, 1.5, 1, 1][(step / 4) | 0];
        _bgmTanpura(rootHz * ratio, BEAT * 1.4, 0.05, off);
      }

      // ---------- 808 KICK (with sidechain pump) ----------
      if (sec.kick && (step === 0 || step === 6 || step === 8 || step === 14)) {
        _bgm808Kick(0.55, off);
        _pump(off);
      }

      // ---------- 808 SUB BASS (bar-aware roots) ----------
      if (sec.sub) {
        let hz = 0;
        if (sec.sub === "minimal") {
          if (step === 0 || step === 8) hz = rootHz; // half-time pulse
        } else {
          hz = _bassHz(_bar, step);
        }
        if (hz) _bgm808Bass(hz, BEAT * 0.55, 0.40, off);
      }

      // ---------- SNARE / CLAP backbeat ----------
      if (sec.snare && (step === 4 || step === 12)) {
        _bgmSnare(0.35, off);
        if (sec.clap) _bgmClap(0.18, off + 0.005);
      }

      // ---------- GHOST SNARE (humanization) ----------
      if (sec.ghostSnare && GHOST_SNARE_GAIN_16[step] > 0) {
        _bgmGhostSnare(GHOST_SNARE_GAIN_16[step], off);
      }

      // ---------- HI-HATS ----------
      if (sec.closedHat) {
        const tbl = (sec.closedHat === "half") ? CLOSED_HAT_HALF_16 : CLOSED_HAT_GAIN_16;
        const v = tbl[step];
        if (v > 0) _bgmHat(v, _swing(off, step, true) + _hatJitter(), false);
        // Trap roll on PRE_DROP — 4× 32nd notes through the whole bar build
        if (sec.closedHat === "roll") {
          if (step === 12 || step === 14) {
            for (let i = 1; i <= 4; i++) {
              _bgmHat(0.07 + i * 0.012, off + (STEP / 4) * i, false);
            }
          }
        }
      }
      if (sec.openHat) {
        const v = OPEN_HAT_GAIN_16[step];
        if (v > 0) _bgmHat(v, _swing(off + STEP * 0.5, step, true) + _hatJitter(), true);
      }

      // ---------- DHOL ----------
      if (sec.dhol === true && step === 0) {
        _bgmDhol(0.22, off, 1.0);
      } else if (sec.dhol === "light") {
        const v = DHOL_LIGHT_16[step];
        if (v > 0) _bgmDhol(v, off, 1.0);
      }

      // ---------- TABLA NA ----------
      if (sec.tablaNA === true && step === 11) {
        _bgmTabla("NA", 0.10, _swing(off, step, true));
      } else if (sec.tablaNA === "active") {
        const v = TABLA_NA_ACTIVE_16[step];
        if (v > 0) _bgmTabla("NA", v, _swing(off, step, true));
      }

      // ---------- TUMBI melody ----------
      if (sec.tumbi) {
        const tbl = (sec.tumbi === "answer") ? TUMBI_B_16
                  : (sec.tumbi === "sparse") ? TUMBI_SPARSE_16
                  : TUMBI_A_16;
        const noteName = tbl[step];
        if (noteName) {
          _bgmTumbi(NOTE[noteName], BEAT * 0.45, 0.10, _swing(off, step, true));
        }
      }

      // ---------- VOCAL CHOP (sliced alaap stab) ----------
      if (sec.vocalChop && step === 6) {
        const cp = CHOP_PAIRS[_cycle % CHOP_PAIRS.length];
        _bgmVocalChop(NOTE[cp[0]], NOTE[cp[1]], BEAT * 0.6, 0.18, off);
      }

      // ---------- ALAAP (sustained sung line) ----------
      if (sec.alaap && step === 0) {
        const ap = ALAAP_PAIRS[_cycle % ALAAP_PAIRS.length];
        _bgmAlaap(NOTE[ap[0]], NOTE[ap[1]], BEAT * 3, 0.10, off);
      }

      // ---------- REVERSE SWELL build-up ----------
      // "alt" = every other A_PLUS bar (bar 5 vs 6, 9 vs 10) → cleaner mix
      let doSwell = false;
      if (sec.reverseSwell === true && step === 12) doSwell = true;
      else if (sec.reverseSwell === "alt" && step === 12 && (_bar === 5 || _bar === 9)) doSwell = true;
      if (doSwell) _bgmReverseSwell(BEAT * 1.0, 0.16, off);

      // ---------- LONG PAD (warm glue, every 4 bars) ----------
      if (sec.pad && step === 0 && (_bar % 4 === 0)) {
        _bgmPad(rootHz / 2, BEAT * 16, 0.035, off);
      }
    }

    // ----- Modern voices -----
    // 808 KICK: low sine with fast pitch drop + click transient
    function _bgm808Kick(vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const o = a.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.10);
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      o.connect(g); g.connect(_musicGain);
      o.start(t); o.stop(t + 0.36);
      // Click transient (noise burst, 6 ms)
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
      const ng = a.createGain();
      ng.gain.setValueAtTime(vol * 0.5, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
      n.connect(hp); hp.connect(ng); ng.connect(_musicGain);
      n.start(t); n.stop(t + 0.02);
    }
    // 808 SUB BASS: pure sine with subtle saw layer for grit
    function _bgm808Bass(freq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const oSub = a.createOscillator(); oSub.type = "sine"; oSub.frequency.value = freq;
      const oSaw = a.createOscillator(); oSaw.type = "sawtooth"; oSaw.frequency.value = freq;
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 280; lp.Q.value = 3;
      const sawG = a.createGain(); sawG.gain.value = 0.18; // saw layer for harmonics
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.setValueAtTime(vol * 0.85, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      oSub.connect(lp);
      oSaw.connect(sawG); sawG.connect(lp);
      lp.connect(g); g.connect(_musicGain);
      oSub.start(t); oSub.stop(t + dur + 0.02);
      oSaw.start(t); oSaw.stop(t + dur + 0.02);
    }
    // Trap HI-HAT: filtered noise burst
    function _bgmHat(vol, when, open) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7500;
      const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 9000; bp.Q.value = 1.5;
      const g = a.createGain();
      const dur = open ? 0.18 : 0.04;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(hp); hp.connect(bp); bp.connect(g); g.connect(_musicGain);
      n.start(t); n.stop(t + dur + 0.02);
    }
    // SNARE: noise + tonal body for that crack
    function _bgmSnare(vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      // Tonal body
      const o = a.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(200, t);
      o.frequency.exponentialRampToValueAtTime(150, t + 0.05);
      const og = a.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(vol * 0.6, t + 0.002);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.10);
      o.connect(og); og.connect(_musicGain);
      o.start(t); o.stop(t + 0.12);
      // Noise crack
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
      const ng = a.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(vol, t + 0.001);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      n.connect(hp); hp.connect(ng); ng.connect(_musicGain);
      n.start(t); n.stop(t + 0.14);
    }
    // GHOST SNARE: very low-gain noise+body for human swing feel
    function _bgmGhostSnare(vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      // Tiny tonal body
      const o = a.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(190, t);
      o.frequency.exponentialRampToValueAtTime(145, t + 0.045);
      const og = a.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.0015);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      o.connect(og); og.connect(_musicGain);
      o.start(t); o.stop(t + 0.06);
      // Filtered noise
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
      const ng = a.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(vol, t + 0.0015);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      n.connect(hp); hp.connect(ng); ng.connect(_musicGain);
      n.start(t); n.stop(t + 0.07);
    }
    // VOCAL CHOP: short alaap stab — sliced sample feel
    function _bgmVocalChop(fromFreq, toFreq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const o = a.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(fromFreq, t);
      o.frequency.exponentialRampToValueAtTime(toFreq, t + dur * 0.4);
      const bp1 = a.createBiquadFilter(); bp1.type = "bandpass"; bp1.frequency.value = 800; bp1.Q.value = 6;
      const bp2 = a.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 1500; bp2.Q.value = 6;
      const mix = a.createGain();
      o.connect(bp1); bp1.connect(mix);
      o.connect(bp2); bp2.connect(mix);
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.01);     // sharp pluck-style attack
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);    // tight release
      mix.connect(g); g.connect(_musicGain);
      if (_verbSend) { const s = a.createGain(); s.gain.value = 0.45; g.connect(s); s.connect(_verbSend); }
      o.start(t); o.stop(t + dur + 0.02);
    }
    // REVERSE SWELL: noise rising into a hit — classic build-up
    function _bgmReverseSwell(dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const bp = a.createBiquadFilter(); bp.type = "bandpass";
      bp.frequency.setValueAtTime(800, t);
      bp.frequency.exponentialRampToValueAtTime(6000, t + dur);
      bp.Q.value = 2;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.95);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      n.connect(bp); bp.connect(g); g.connect(_musicGain);
      if (_verbSend) { const s = a.createGain(); s.gain.value = 0.50; g.connect(s); s.connect(_verbSend); }
      n.start(t); n.stop(t + dur + 0.02);
    }

    // ----- Lighter BGM voices (lower vol, less reverb than SFX) -----
    function _bgmDhol(vol, when, deep) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const og = a.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);
      [{ type: "sine", mul: 1.0, amp: 1.0 }, { type: "triangle", mul: 0.5, amp: 0.5 }].forEach(v => {
        const o = a.createOscillator(); o.type = v.type;
        o.frequency.setValueAtTime(95 * deep * v.mul, t);
        o.frequency.exponentialRampToValueAtTime(55 * deep * v.mul, t + 0.18);
        const vg = a.createGain(); vg.gain.value = v.amp;
        o.connect(vg); vg.connect(og);
        o.start(t); o.stop(t + 0.24);
      });
      og.connect(_musicGain);
    }
    function _bgmTabla(bol, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const cfg = ({
        DHIN: { f0: 320, f1: 200, dur: 0.28, slap: 0.10 },
        NA:   { f0: 480, f1: 380, dur: 0.14, slap: 0.16 },
        TIN:  { f0: 540, f1: 460, dur: 0.10, slap: 0.14 },
        TA:   { f0: 380, f1: 280, dur: 0.12, slap: 0.18 },
      })[bol] || { f0: 380, f1: 280, dur: 0.16, slap: 0.12 };
      const o = a.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(cfg.f0, t);
      o.frequency.exponentialRampToValueAtTime(cfg.f1, t + cfg.dur);
      const og = a.createGain();
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(vol, t + 0.003);
      og.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur);
      o.connect(og); og.connect(_musicGain);
      o.start(t); o.stop(t + cfg.dur + 0.02);
      // Slap
      const n = a.createBufferSource(); n.buffer = _noiseBuf;
      const bp = a.createBiquadFilter(); bp.type = "bandpass";
      bp.frequency.value = 2400; bp.Q.value = 1.2;
      const ng = a.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(vol * cfg.slap * 4, t + 0.001);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      n.connect(bp); bp.connect(ng); ng.connect(_musicGain);
      n.start(t); n.stop(t + 0.06);
    }
    function _bgmClap(vol, when) {
      const a = _ac; if (!a) return;
      [0, 0.025].forEach(off => {
        const t = a.currentTime + when + off;
        const n = a.createBufferSource(); n.buffer = _noiseBuf;
        const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1200;
        const g = a.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        n.connect(hp); hp.connect(g); g.connect(_musicGain);
        n.start(t); n.stop(t + 0.07);
      });
    }
    // Bass: 8-bit square pluck with quick decay
    function _bgmBass(freq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const o = a.createOscillator(); o.type = "square";
      o.frequency.setValueAtTime(freq, t);
      const lp = a.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.value = 1100; lp.Q.value = 2;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp); lp.connect(g); g.connect(_musicGain);
      o.start(t); o.stop(t + dur + 0.02);
    }
    // Tumbi melody note (lighter than SFX tumbi)
    function _bgmTumbi(freq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const o = a.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.94), t + dur);
      const lp = a.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.value = 2200; lp.Q.value = 3;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp); lp.connect(g); g.connect(_musicGain);
      o.start(t); o.stop(t + dur + 0.02);
    }
    // Soft pad drone
    function _bgmPad(freq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      const o1 = a.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = freq;
      const o2 = a.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = freq * 1.005; // detune for chorus
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600; lp.Q.value = 0.7;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.30);
      g.gain.setValueAtTime(vol, t + dur - 0.30);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(_musicGain);
      o1.start(t); o1.stop(t + dur + 0.02);
      o2.start(t); o2.stop(t + dur + 0.02);
    }

    // Tanpura: long-decay plucked drone string with shimmer overtones.
    // The signature continuous backbone of all Gurbani kirtan.
    function _bgmTanpura(freq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      // Two slightly detuned saws + sine = rich sympathetic-string body
      const o1 = a.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = freq;
      const o2 = a.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = freq * 2.003; // octave shimmer
      const o3 = a.createOscillator(); o3.type = "sine";     o3.frequency.value = freq * 3.01;  // jawari overtone
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800; lp.Q.value = 1.4;
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.025);  // soft pluck attack
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);  // long bell-like tail
      const og2 = a.createGain(); og2.gain.value = 0.35;
      const og3 = a.createGain(); og3.gain.value = 0.18;
      o1.connect(lp);
      o2.connect(og2); og2.connect(lp);
      o3.connect(og3); og3.connect(lp);
      lp.connect(g); g.connect(_musicGain);
      // Light reverb send for "temple hall" depth
      if (_verbSend) { const s = a.createGain(); s.gain.value = 0.20; g.connect(s); s.connect(_verbSend); }
      o1.start(t); o1.stop(t + dur + 0.05);
      o2.start(t); o2.stop(t + dur + 0.05);
      o3.start(t); o3.stop(t + dur + 0.05);
    }

    // Harmonium: reedy sustained chord (Sa + Pa fifth + octave) with
    // gentle bellows tremolo. The foundational kirtan accompaniment.
    function _bgmHarmonium(rootFreq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      // Reed-organ stack: root + fifth + octave, square waves through lowpass
      const partials = [
        { f: rootFreq,         amp: 1.0, type: "square" },
        { f: rootFreq * 1.5,   amp: 0.55, type: "square" }, // Pa
        { f: rootFreq * 2,     amp: 0.40, type: "sawtooth" },// upper Sa
      ];
      const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400; lp.Q.value = 0.9;
      const g = a.createGain();
      // Bellows-style swell and release
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.18);
      g.gain.setValueAtTime(vol, t + dur - 0.4);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      // Tremolo LFO (~5 Hz bellows wobble)
      const lfo = a.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 5;
      const lfoG = a.createGain(); lfoG.gain.value = vol * 0.10;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      const oscs = partials.map(p => {
        const o = a.createOscillator(); o.type = p.type; o.frequency.value = p.f;
        const og = a.createGain(); og.gain.value = p.amp;
        o.connect(og); og.connect(lp);
        return o;
      });
      lp.connect(g); g.connect(_musicGain);
      if (_verbSend) { const s = a.createGain(); s.gain.value = 0.18; g.connect(s); s.connect(_verbSend); }
      lfo.start(t); lfo.stop(t + dur + 0.05);
      oscs.forEach(o => { o.start(t); o.stop(t + dur + 0.05); });
    }

    // Vocal alaap: a sung-style melodic glide (meend) from one note to
    // another, using formant filtering for an "AA" vowel. This is the
    // hallmark of Gurbani kirtan vocals.
    function _bgmAlaap(fromFreq, toFreq, dur, vol, when) {
      const a = _ac; if (!a) return;
      const t = a.currentTime + when;
      // Carrier: triangle wave glides between pitches
      const o = a.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(fromFreq, t);
      o.frequency.exponentialRampToValueAtTime(toFreq, t + dur * 0.7);
      o.frequency.setValueAtTime(toFreq, t + dur * 0.95);
      // "AA" vowel formants (~700 Hz F1, ~1200 Hz F2)
      const bp1 = a.createBiquadFilter(); bp1.type = "bandpass"; bp1.frequency.value = 700;  bp1.Q.value = 5;
      const bp2 = a.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 1200; bp2.Q.value = 5;
      const mix = a.createGain();
      o.connect(bp1); bp1.connect(mix);
      o.connect(bp2); bp2.connect(mix);
      // ADSR with slow attack (sung legato), gentle release
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.18);
      g.gain.setValueAtTime(vol, t + dur - 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      // Vibrato (~6 Hz human voice)
      const vib = a.createOscillator(); vib.type = "sine"; vib.frequency.value = 6;
      const vibG = a.createGain(); vibG.gain.value = 4; // ±4 Hz pitch wobble
      vib.connect(vibG); vibG.connect(o.frequency);
      mix.connect(g); g.connect(_musicGain);
      if (_verbSend) { const s = a.createGain(); s.gain.value = 0.30; g.connect(s); s.connect(_verbSend); }
      vib.start(t); vib.stop(t + dur + 0.05);
      o.start(t); o.stop(t + dur + 0.05);
    }

    function _scheduler() {
      if (!_running || !_ac) return;
      // Schedule any steps within the lookahead window
      while (_nextNoteTime < _ac.currentTime + LOOKAHEAD) {
        _scheduleStep(_step, _nextNoteTime);
        _nextNoteTime += STEP;
        _step++;
        if (_step >= STEPS_PER_BAR) {
          _step = 0;
          _cycle++;
          _bar = (_bar + 1) % 16;
        }
      }
    }

    function start() {
      if (_running || !on) return;
      // Use _initAudio() not ac() so music plays even when SFX is muted.
      const a = _initAudio(); if (!a) return;
      _initGain();
      if (_musicGain) _musicGain.gain.cancelScheduledValues(a.currentTime);
      if (_musicGain) _musicGain.gain.linearRampToValueAtTime(0.55, a.currentTime + 0.5);
      _running = true;
      _step = 0; _cycle = 0; _bar = 0;
      _nextNoteTime = a.currentTime + 0.10;
      _timer = setInterval(_scheduler, TICK_MS);
    }
    function stop(fadeMs = 400) {
      if (!_running) return;
      _running = false;
      if (_timer) { clearInterval(_timer); _timer = null; }
      if (_musicGain && _ac) {
        const t = _ac.currentTime;
        _musicGain.gain.cancelScheduledValues(t);
        _musicGain.gain.setValueAtTime(_musicGain.gain.value, t);
        _musicGain.gain.exponentialRampToValueAtTime(0.0001, t + fadeMs / 1000);
      }
    }
    function toggle() {
      on = !on;
      localStorage.setItem(KEY.music, on ? "1" : "0");
      if (on) start(); else stop();
      return on;
    }
    function isOn() { return on; }
    return { start, stop, toggle, isOn };
  })();

  // Auto-pause music when tab is hidden (saves battery, prevents drift)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) BGM.stop(200);
    else if (BGM.isOn()) BGM.start();
  });

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
  function addRupees(n) {
    state.rupees = Math.max(0, state.rupees + n);
    if (n > 0) { try { SFX.coin(); } catch (_) {} }
  }
  // Reset streak; play "streakBreak" sting only if it was a meaningful streak (≥3).
  function breakStreak() {
    if ((state.streak | 0) >= 3) { try { SFX.streakBreak(); } catch (_) {} }
    state.streak = 0;
  }
  // Add raw silver coins. 10 silver coins auto-stack into 1 gold bar in the HUD.
  function addGold(coins)   {
    const c = coins | 0;
    state.gold = Math.max(0, state.gold + c);
    if (c > 0) { try { SFX.coin(); } catch (_) {} }
  }
  function addGoldBars(bars) { addGold((bars | 0) * GOLD_PER_BAR); }

  // ===== Public bridge API =====
  // Exposed so side games (ABC Sound Ladder, etc.) can deposit rewards into
  // the main player profile. All updates persist + sync to the leaderboard.
  window.VTK = window.VTK || {};
  window.VTK.reward = function (opts) {
    opts = opts || {};
    const power  = Math.max(0, (opts.power  | 0));
    const rupees = Math.max(0, (opts.rupees | 0));
    const gold   = Math.max(0, (opts.gold   | 0));
    if (power)  addPower(power);
    if (rupees) addRupees(rupees);
    if (gold)   addGold(gold);
    if (opts.message) {
      const msg = typeof opts.message === "string"
        ? opts.message
        : { en: opts.message.en || "", pa: opts.message.pa || "" };
      try { toast(msg, "rupee"); } catch (_) {}
    }
    if (opts.confetti) { try { confetti(opts.confetti | 0); } catch (_) {} }
    try { renderHeader(); persist(); } catch (_) {}
    return { power: state.power, rupees: state.rupees, gold: state.gold };
  };
  window.VTK.getProfile = function () {
    return {
      childId: currentChildId,
      player:  currentPlayer,
      power:   state.power,
      rupees:  state.rupees,
      gold:    state.gold,
      rank:    rankFor(state.power).name
    };
  };

  function dealDamage(n) {
    state.hp = Math.max(0, state.hp - (n | 0));
    if (n > 0) {
      fpFlash("damage");
      const max = maxHpFor(state.power);
      const pct = max > 0 ? state.hp / max : 1;
      fpShout(pct <= 0.34 ? "DANGER!" : "OUCH!", "danger");
      try { SFX.damage(); } catch (_) {}
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
          // Generous boss payout: a fat satchel of gold + bonus rupees.
          addGoldBars(GOLD_BARS_PER_BOSS);
          addRupees(RUPEES_BOSS_CLEAR);
          // Cinematic gold-bar arc from card center to HUD
          const card = document.querySelector(".card");
          goldBarArc(card);
          slowMo();
          const bars = Math.floor(state.gold / GOLD_PER_BAR);
          toast({
            en: `🏆 BOSS DOWN! +${GOLD_BARS_PER_BOSS} 🟨 gold bars (= ${GOLD_BARS_PER_BOSS * GOLD_PER_BAR} 🥈 silver) · +${RUPEES_BOSS_CLEAR.toLocaleString()} ₹ · Total bars: ${bars}`,
            pa: `🏆 ਬੌਸ ਹਾਰਿਆ! +${GOLD_BARS_PER_BOSS} 🟨 ਸੋਨੇ ਦੀਆਂ ਇੱਟਾਂ · +${RUPEES_BOSS_CLEAR.toLocaleString()} ₹ · ਕੁਲ ਇੱਟਾਂ: ${bars}`
          }, "rank");
          SFX.bossWin(); SFX.ball();
          confetti(60, ["🟨", "🥈", "⭐", "✨", "🏆", "🔥", "💫"]);
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
      if (due.length && !state.chaiMode) {
        state.chaiMode = true;
        state.chaiRemaining = Math.min(CHAI_REVIEW_MAX, due.length);
        toast({
          en: `☕ Chai Break — ${state.chaiRemaining} quick recap${state.chaiRemaining > 1 ? "s" : ""}`,
          pa: `☕ ਚਾਹ ਦੀ ਛੁੱਟੀ — ${state.chaiRemaining} ਛੋਟੇ ਸਵਾਲ`
        }, "rank");
        resetCardLocalState();
        persist();
        return renderChaiIntro();
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

  function renderChaiIntro() {
    renderHeader();
    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card chai-card">
          <div class="emoji-big">☕</div>
          <h2>Chai Break!${paInline("ਚਾਹ ਦੀ ਛੁੱਟੀ!")}</h2>
          <p>Quick recap of <b>${state.chaiRemaining}</b> things you missed earlier.<br>Master them and they'll graduate from your review pile!</p>
          ${paLine(`ਪਹਿਲਾਂ ਖੁੰਝੀਆਂ <b>${state.chaiRemaining}</b> ਚੀਜ਼ਾਂ ਦੀ ਛੋਟੀ ਦੁਹਰਾਈ। ਸਹੀ ਕਰੋ ਤੇ ਇਹ ਦੁਹਰਾਈ-ਸੂਚੀ ਵਿੱਚੋਂ ਪਾਸ ਹੋ ਜਾਣਗੀਆਂ!`)}
          <p class="ko-note">+30 ⚡ bonus per correct review.${paInline("ਹਰ ਸਹੀ ਜਵਾਬ ਤੇ +30 ⚡")}</p>
          <div class="controls" style="justify-content:center">
            <button id="chai-go">${bi("letsGo")} ☕</button>
          </div>
        </div>
      </div>`;
    document.getElementById("chai-go").onclick = () => render();
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
    state.chaiMode = false;
    state.chaiRemaining = 0;
    resetCardLocalState();
    persist();
    renderKO(entry);
  }

  // ===== Render dispatch =====
  function render() {
    renderHeader();

    if (state.chaiMode) {
      if (state.chaiRemaining > 0) {
        const item = pickDueReview();
        if (item) {
          const re = entryById(item.id);
          if (re && (re.card.type === "mcq" || re.card.type === "fill" || re.card.type === "flash")) {
            state.activeReviewId = item.id;
            state.flipped = false; state.answered = false;
            return renderCard(re, true);
          } else {
            clearReview(item.id);
            state.chaiRemaining -= 1;
            return render();
          }
        }
      }
      state.chaiMode = false;
      state.chaiRemaining = 0;
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
    // Skips on intro/boss/read; never during chai break or active review.
    if (cardType !== "intro" && cardType !== "boss" && cardType !== "read"
        && !state.activeReviewId && !state.chaiMode
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
      case "match": renderMatch(card, wrap, isReview); break;
      case "tap":   renderTap(card, wrap, isReview); break;
      case "speed": renderSpeed(card, wrap, isReview); break;
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
  let _idleStopHandler = null;
  function clearIdleNudge() {
    if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
    if (_idleHardTimer) { clearTimeout(_idleHardTimer); _idleHardTimer = null; }
    if (_idleStopHandler) {
      ["keydown", "pointerdown", "input"].forEach(ev =>
        document.removeEventListener(ev, _idleStopHandler, true));
      _idleStopHandler = null;
    }
    document.querySelectorAll(".help-btn.nudging").forEach(b => b.classList.remove("nudging"));
  }
  function armIdleNudge(card) {
    clearIdleNudge();
    const reset = () => {
      armIdleNudge(card);
    };
    _idleStopHandler = () => { reset(); };
    ["keydown", "pointerdown", "input"].forEach(ev =>
      document.addEventListener(ev, _idleStopHandler, true));
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
        addRupees(RUPEES_BASE);
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
      if (!v) {
        // Don't silently no-op on empty Submit — that LOOKS like a freeze.
        fb.innerHTML = `✏️ Type your answer in the box first!` +
                       paLine(`✏️ ਪਹਿਲਾਂ ਡੱਬੇ ਵਿੱਚ ਜਵਾਬ ਲਿਖੋ!`);
        try { input.focus(); } catch(_){}
        return;
      }
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
          addRupees(RUPEES_BASE);
          const h = pickHype();
          fb.innerHTML = `${h.en}${paLine(h.pa)}`;
          SFX.correct();
        } else {
          btn.classList.add("wrong");
          breakStreak();
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
  function renderMatch(card, wrap, isReview) {
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
            const z = RUPEES_BASE + 30;
            state.streak += 1;
            addPower(Math.max(20, xp));
            addRupees(z);
            state.history.push({ id: card.id, t: Date.now(), ok: m.mistakes === 0 });
            if (m.mistakes > 1) queueReview(card.id);
            fb.innerHTML = `🎉 All matched! +${Math.max(20, xp)} ⚡ · +${z} ₹${paLine(`ਸਾਰੇ ਜੋੜੇ ਮਿਲ ਗਏ! +${Math.max(20, xp)} ⚡ · +${z} ₹`)}`;
            confetti(36);
            juiceCard("pop");
            renderHeader();
            persist();
            next.disabled = false;
            next.onclick = () => {
              if (isReview) {
                if (m.mistakes === 0) clearReview(state.activeReviewId);
                state.match = null;
                finishReview();
              } else {
                advance();
              }
            };
          }
        } else {
          b.status = "wrong"; a.status = "wrong"; m.locked = true;
          m.mistakes += 1;
          breakStreak();
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
  function renderTap(card, wrap, isReview) {
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
      const z = RUPEES_BASE + 20;
      if (ok) state.streak += 1; else breakStreak();
      addPower(Math.max(15, xp));
      addRupees(z);
      state.history.push({ id: card.id, t: Date.now(), ok });
      if (!ok) queueReview(card.id);
      fb.innerHTML = ok
        ? `🎯 PERFECT! +${Math.max(15, xp)} ⚡ · +${z} ₹${paLine(`ਬਿਲਕੁਲ ਸਹੀ! +${Math.max(15, xp)} ⚡ · +${z} ₹`)}`
        : `Found ${f}/${correctTotal}, missed ${correctTotal - f}. +${Math.max(15, xp)} ⚡${paLine(`${f}/${correctTotal} ਲੱਭੇ, ${correctTotal - f} ਖੁੰਝੇ। +${Math.max(15, xp)} ⚡`)}`;
      t.items.forEach(it => { if (it.correct && !it.picked) it.picked = true; });
      refresh();
      if (ok) confetti(28); else juiceCard("shake");
      renderHeader();
      persist();
      next.disabled = false;
      doneBtn.disabled = true;
      next.onclick = () => {
        if (isReview) {
          if (ok) clearReview(state.activeReviewId);
          state.tap = null;
          finishReview();
        } else {
          advance();
        }
      };
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
  function renderSpeed(card, wrap, isReview) {
    if (!state.speed || state.speed.cardId !== card.id) {
      state.speed = { cardId: card.id, qIdx: 0, score: 0, started: false, finished: false, answered: false };
    }
    const s = state.speed;
    if (s.finished) {
      const total = card.questions.length;
      const xpPerCorrect = XP.speed;
      const bonus = (s.score === total) ? 200 : 0;
      const xp = s.score * xpPerCorrect + bonus + state.streak * STREAK_BONUS;
      const z = RUPEES_BASE + s.score * 10;
      app.innerHTML = wrap(`
        <div class="emoji-big">${s.score === total ? "🏁" : "⏱️"}</div>
        <h2 class="intro-title">${s.score === total ? "PERFECT SPRINT!" : "Sprint complete!"}</h2>
        ${paLine(s.score === total ? "ਬਿਲਕੁਲ ਸਹੀ ਦੌੜ!" : "ਦੌੜ ਪੂਰੀ ਹੋਈ!")}
        <p class="intro-body">${T.score.en}: <b>${s.score}/${total}</b><br>+${xp} ⚡ · +${z} ₹${bonus ? ` · 🎁 +${bonus} bonus` : ""}</p>
        ${paLine(`${T.score.pa}: ${s.score}/${total}`)}
        <div class="controls" style="justify-content:center">
          <button id="next-btn">${bi("continue")} ➡️</button>
        </div>
      `, "speed-card");
      if (!s.awarded) {
        s.awarded = true;
        addPower(xp); addRupees(z);
        if (s.score === total) { state.streak += 1; confetti(40); SFX.bossWin(); }
        else breakStreak();
        state.history.push({ id: card.id, t: Date.now(), ok: s.score === total });
        if (s.score < total - 1) queueReview(card.id);
        renderHeader();
        persist();
      }
      document.getElementById("next-btn").onclick = () => {
        if (isReview) {
          if (s.score === card.questions.length) clearReview(state.activeReviewId);
          state.speed = null;
          finishReview();
        } else {
          advance();
        }
      };
      return;
    }
    if (!s.started) {
      app.innerHTML = wrap(`
        <div class="emoji-big">⏱️</div>
        <h2 class="intro-title">${card.title || "Speed Round!"}</h2>
        ${paLine(card.titlePa || "ਤੇਜ਼ ਦੌੜ!")}
        <p class="intro-body">${card.questions.length} quick questions · <b>${card.seconds || 8}s</b> each.<br>Get them all = bonus ₹₹</p>
        ${paLine(`${card.questions.length} ਛੋਟੇ ਸਵਾਲ · ਹਰੇਕ ਲਈ ${card.seconds || 8} ਸਕਿੰਟ। ਸਾਰੇ ਸਹੀ = ਵਾਧੂ ₹₹`)}
        <div class="controls" style="justify-content:center">
          <button id="speed-go">${bi("start")} ⚡</button>
        </div>
      `, "speed-card");
      document.getElementById("speed-go").onclick = () => {
        s.started = true;
        renderCard(curOrReview(isReview), isReview);
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
      renderCard(curOrReview(isReview), isReview);
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
          <p>Chak de phatte, yodha!<br>+${RUPEES_BOSS_CLEAR.toLocaleString()} ₹ · 🟨 +${GOLD_BARS_PER_BOSS} Gold Bars</p>
          ${paLine(`ਚੱਕ ਦੇ ਫੱਟੇ, ਯੋਧਾ! +${RUPEES_BOSS_CLEAR.toLocaleString()} ₹ · 🟨 +${GOLD_BARS_PER_BOSS} ਸੋਨੇ ਦੀਆਂ ਇੱਟਾਂ`)}
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
          addRupees(RUPEES_BASE + 40);
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
          breakStreak();
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
    const z = RUPEES_BASE + (isReview ? RUPEES_REVIEW_BONUS : 0) + state.streak * 4;
    addRupees(z);
    if (isReview) heal(HEAL_ON_REVIEW);
    state.history.push({ id: cardId, t: Date.now(), ok: true });
    // Modern game-feel: floating XP popup + particle burst at click point
    const pt = pickPoint();
    xpPop("+" + gain + " ⚡", pt.x, pt.y - 10);
    xpPop("+" + z + " ₹",  pt.x, pt.y + 14, "rupees");
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
    fb.innerHTML = `${h.en} &nbsp; +${gain} ⚡ · +${z} ₹${promoteMsg}` +
                   paLine(`${h.pa} +${gain} ⚡ · +${z} ₹${promoteMsgPa}`);
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
    if (state.chaiMode) {
      state.chaiRemaining = Math.max(0, state.chaiRemaining - 1);
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
          <p class="ko-note">Don't worry — you keep your Power Level, Rupees, and Gold. Sachcha yodha har haar ton mazboot hunda hai. 💪</p>
          ${paLine("ਚਿੰਤਾ ਨਾ ਕਰੋ — ਤਾਕਤ, ਰੁਪਏ ਤੇ ਸੋਨਾ ਸੁਰੱਖਿਅਤ ਹਨ। ਸੱਚਾ ਯੋਧਾ ਹਰ ਹਾਰ ਤੋਂ ਮਜ਼ਬੂਤ ਹੁੰਦਾ ਹੈ। 💪")}
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
      setTimeout(() => { confetti(40, ["🟨","🥈","✨","🏆"]); }, 750);
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
          <p>Rupees: <b>₹${state.rupees.toLocaleString()}</b> · Treasure: <b>🟨 ${Math.floor(state.gold/GOLD_PER_BAR)} gold bars · 🥈 ${state.gold % GOLD_PER_BAR} silver coins</b></p>
          ${paLine(`ਤੁਸੀਂ ਹਰ ਕਦਮ ਪੂਰਾ ਕੀਤਾ। ਤਾਕਤ: <b>${state.power.toLocaleString()}</b><br>ਰੁਪਏ: <b>₹${state.rupees.toLocaleString()}</b> · ਖਜ਼ਾਨਾ: <b>🟨 ${Math.floor(state.gold/GOLD_PER_BAR)} ਸੋਨੇ ਦੀਆਂ ਇੱਟਾਂ · 🥈 ${state.gold % GOLD_PER_BAR} ਚਾਂਦੀ ਦੇ ਸਿੱਕੇ</b>`)}
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
      return Object.values(lb)
        .filter(r => !isBlocked(r))
        .map(r => ({ ...r, _mine: (r.childId && r.childId === currentChildId) || r.player === currentPlayer }));
    }
    function globalRows() {
      const remote = (window.OnlineLB && window.OnlineLB.getAll) ? window.OnlineLB.getAll() : [];
      const myId = `${currentChildId}__${deviceId}`;
      return remote
        .filter(r => !isBlocked(r))
        .map(r => ({ ...r, _mine: r.id === myId }));
    }

    function renderRows(rows) {
      // Back-compat: older rows use {zeni, balls}; newer rows use {rupees, gold}.
      // Coerce both into the new fields so sorting & display stay consistent.
      rows = rows.map(r => ({
        ...r,
        rupees: (r.rupees != null ? r.rupees : (r.zeni  | 0)) | 0,
        gold:   (r.gold   != null ? r.gold   : (r.balls | 0) * GOLD_PER_BAR) | 0,
      }));
      rows = rows.slice().sort((a, b) => (b.power|0) - (a.power|0) || (b.rupees|0) - (a.rupees|0));
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
      return rows.map((r, i) => {
        const bars  = Math.floor((r.gold|0) / GOLD_PER_BAR);
        const coins = (r.gold|0) % GOLD_PER_BAR;
        return `
        <tr class="${r._mine ? "me" : ""}">
          <td class="rk">${medal(i)}</td>
          <td class="nm">${esc(r.player || "?")}${r._mine ? ' <span class="me-tag">YOU · <span class="pa" lang="pa">ਤੁਸੀਂ</span></span>' : ""}</td>
          <td class="pw">${(r.power|0).toLocaleString()} ⚡</td>
          <td class="rn">${esc(rankFor(r.power|0).name)}</td>
          <td class="rp">₹${(r.rupees|0).toLocaleString()}</td>
          <td class="gd">🟨 ${bars} · 🥈 ${coins}</td>
          <td class="ts">${fmtTime(r.updatedAt)}</td>
          <td class="ax">${
            scope === "device"
              ? (r._mine
                  ? '<span class="me-pill">active · <span class="pa" lang="pa">ਚਾਲੂ</span></span>'
                  : `<button class="board-btn switch" data-switch="${encodeURIComponent(r.childId || r.player)}">Switch · <span class="pa" lang="pa">ਬਦਲੋ</span></button>
                     <button class="board-btn del" data-del="${encodeURIComponent(r.childId || r.player)}" title="Delete · ਮਿਟਾਓ">🗑️</button>`)
              : (r._mine ? '<span class="me-pill">you · <span class="pa" lang="pa">ਤੁਸੀਂ</span></span>' : "")
          }</td>
        </tr>`;
      }).join("");
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
                <th>Rupees<br><span class="pa pa-inline" lang="pa">ਰੁਪਏ</span></th>
                <th>Gold<br><span class="pa pa-inline" lang="pa">ਸੋਨਾ</span></th>
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
  if (mapBtn) mapBtn.onclick = () => { try { SFX.click(); } catch (_) {} renderMap(); };
  const boardBtn = document.getElementById("board-btn");
  if (boardBtn) boardBtn.onclick = () => { try { SFX.click(); } catch (_) {} renderBoard(); };

  // 🔒 Landscape lock toggle — for dual-thumb landscape learning.
  // Persists across sessions; re-engages on next load after first user gesture
  // (browsers require a user gesture to enter fullscreen / lock orientation).
  // Auto-clears if the user exits fullscreen via system gesture (Esc / swipe).
  const orientBtn = document.getElementById("orient-btn");
  let orientLocked = localStorage.getItem(KEY.orientLock) === "1";
  function updateOrientBtnUI() {
    if (!orientBtn) return;
    orientBtn.textContent = orientLocked ? "🔒" : "🔓";
    orientBtn.classList.toggle("locked", orientLocked);
    orientBtn.setAttribute("aria-pressed", orientLocked ? "true" : "false");
    orientBtn.title = orientLocked
      ? "Landscape locked · ਲੈਂਡਸਕੇਪ ਲਾਕ ਚਾਲੂ"
      : "Lock landscape · ਲੈਂਡਸਕੇਪ ਲਾਕ";
    // Focus Mode: hide non-essential UI when locked.
    document.body.classList.toggle("focus-mode", orientLocked);
  }
  async function enterLandscape() {
    let lockedOk = false;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) {}
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
        lockedOk = true;
      }
    } catch (_) {}
    if (!lockedOk) {
      // iOS Safari and other browsers without Orientation Lock API:
      // CSS landscape rules still apply when user rotates manually.
      try { toast({ en: "Rotate device sideways", pa: "ਫੋਨ ਨੂੰ ਪਾਸੇ ਘੁਮਾਓ" }); } catch (_) {}
    }
  }
  async function exitLandscape() {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
    try { if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen(); } catch (_) {}
  }
  if (orientBtn) {
    updateOrientBtnUI();
    orientBtn.onclick = async () => {
      try { SFX.click(); } catch (_) {}
      orientLocked = !orientLocked;
      localStorage.setItem(KEY.orientLock, orientLocked ? "1" : "0");
      updateOrientBtnUI();
      if (orientLocked) await enterLandscape();
      else await exitLandscape();
    };
    // Auto-clear flag if user leaves fullscreen via system gesture.
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && orientLocked) {
        orientLocked = false;
        localStorage.setItem(KEY.orientLock, "0");
        try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
        updateOrientBtnUI();
      }
    });
    // If persisted ON, re-engage on first user gesture (gesture required by browsers).
    if (orientLocked) {
      const reEngage = () => {
        document.removeEventListener("pointerdown", reEngage, true);
        enterLandscape();
      };
      document.addEventListener("pointerdown", reEngage, true);
    }
  }

  // ===== ⏱️ Pomodoro timer =====
  // Lightweight focus timer with 15 / 30 / 60 min presets. State persists in
  // localStorage so reloads / orientation flips don't lose the countdown.
  // Completion: bilingual toast + chime + short vibration.
  (function setupPomodoro() {
    const btn      = document.getElementById("pomo-btn");
    const pop      = document.getElementById("pomo-pop");
    const presets  = document.getElementById("pomo-presets");
    const controls = document.getElementById("pomo-controls");
    const pauseBtn = document.getElementById("pomo-pause");
    const stopBtn  = document.getElementById("pomo-stop");
    if (!btn || !pop) return;

    let tickId = 0;
    const ICON = "⏱️";

    function loadState() {
      try { return JSON.parse(localStorage.getItem(KEY.pomo) || "null"); }
      catch (_) { return null; }
    }
    function saveState(s) {
      if (!s) localStorage.removeItem(KEY.pomo);
      else localStorage.setItem(KEY.pomo, JSON.stringify(s));
    }
    function fmt(ms) {
      const total = Math.max(0, Math.ceil(ms / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    function remaining(s) {
      if (!s) return 0;
      if (s.paused) return Math.max(0, s.remainingMs | 0);
      return Math.max(0, (s.endsAt | 0) - Date.now());
    }
    function setRunningUI(running, paused) {
      btn.classList.toggle("running", !!running);
      btn.classList.toggle("pomo-paused", !!paused);
      if (!running) {
        btn.textContent = ICON;
        btn.title = "Pomodoro · ਪੋਮੋਡੋਰੋ";
      }
    }
    function updateLabel() {
      const s = loadState();
      if (!s) { setRunningUI(false); return; }
      const ms = remaining(s);
      btn.textContent = fmt(ms);
      btn.title = (s.paused ? "Paused · ਰੁਕਿਆ " : "Running · ਚੱਲ ਰਿਹਾ ") + fmt(ms);
      setRunningUI(true, !!s.paused);
    }
    function syncPopoverMode() {
      const s = loadState();
      const running = !!s;
      presets.hidden = running;
      controls.hidden = !running;
      if (running) {
        pauseBtn.textContent = s.paused ? "▶ Resume" : "⏸ Pause";
      }
    }
    function startTick() {
      stopTick();
      updateLabel();
      tickId = setInterval(() => {
        const s = loadState();
        if (!s) { stopTick(); setRunningUI(false); return; }
        if (s.paused) { updateLabel(); return; }
        if (remaining(s) <= 0) { complete(); return; }
        updateLabel();
      }, 1000);
    }
    function stopTick() {
      if (tickId) { clearInterval(tickId); tickId = 0; }
    }
    function complete() {
      stopTick();
      saveState(null);
      setRunningUI(false);
      syncPopoverMode();
      try { SFX.bossWin && SFX.bossWin(); } catch (_) {
        try { SFX.correct && SFX.correct(); } catch (_) {}
      }
      try { navigator.vibrate && navigator.vibrate([200, 80, 200]); } catch (_) {}
      try { toast({ en: "Pomodoro complete! 🎉", pa: "ਪੋਮੋਡੋਰੋ ਪੂਰਾ! 🎉" }, "ok"); } catch (_) {}
    }
    function start(min) {
      const durationMs = min * 60 * 1000;
      saveState({ endsAt: Date.now() + durationMs, durationMs, paused: false, remainingMs: durationMs });
      startTick();
      syncPopoverMode();
      closePop();
      try { toast({ en: `${min}-min focus started`, pa: `${min} ਮਿੰਟ ਫੋਕਸ ਸ਼ੁਰੂ` }); } catch (_) {}
    }
    function pause() {
      const s = loadState();
      if (!s || s.paused) return;
      saveState({ ...s, paused: true, remainingMs: remaining(s) });
      updateLabel();
      syncPopoverMode();
    }
    function resume() {
      const s = loadState();
      if (!s || !s.paused) return;
      saveState({ ...s, paused: false, endsAt: Date.now() + (s.remainingMs | 0) });
      startTick();
      syncPopoverMode();
    }
    function stop() {
      stopTick();
      saveState(null);
      setRunningUI(false);
      syncPopoverMode();
      closePop();
    }
    function openPop() {
      syncPopoverMode();
      pop.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      setTimeout(() => {
        document.addEventListener("pointerdown", outsideClick, true);
        document.addEventListener("keydown", escClose, true);
      }, 0);
    }
    function closePop() {
      pop.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outsideClick, true);
      document.removeEventListener("keydown", escClose, true);
    }
    function outsideClick(e) {
      if (!pop.contains(e.target) && e.target !== btn) closePop();
    }
    function escClose(e) { if (e.key === "Escape") closePop(); }

    btn.addEventListener("click", () => {
      try { SFX.click && SFX.click(); } catch (_) {}
      if (pop.getAttribute("aria-hidden") === "false") closePop();
      else openPop();
    });
    presets.addEventListener("click", (e) => {
      const el = e.target.closest(".pomo-chip");
      if (!el) return;
      const min = parseInt(el.dataset.min, 10);
      if (min > 0) { try { SFX.click && SFX.click(); } catch (_) {} start(min); }
    });
    pauseBtn.addEventListener("click", () => {
      try { SFX.click && SFX.click(); } catch (_) {}
      const s = loadState();
      if (!s) return;
      if (s.paused) resume(); else pause();
    });
    stopBtn.addEventListener("click", () => {
      try { SFX.click && SFX.click(); } catch (_) {}
      stop();
    });

    // Restore on load: if elapsed while away, fire completion immediately.
    const initial = loadState();
    if (initial) {
      if (!initial.paused && remaining(initial) <= 0) complete();
      else if (initial.paused) updateLabel();
      else startTick();
    }
  })();

  // 🎮 Fun Games hub — opens the standalone mini-games overlay (games.js).
  // Supports legacy id ("abc-btn") and new id ("games-btn") so cached HTML
  // still works after a deploy.
  const gamesBtn = document.getElementById("games-btn") || document.getElementById("abc-btn");
  if (gamesBtn) gamesBtn.onclick = () => {
    try { SFX.click(); } catch (_) {}
    if (typeof window.openGamesHub === "function") {
      window.openGamesHub();
      return;
    }
    if (!window.__gamesLoading) {
      window.__gamesLoading = true;
      const s = document.createElement("script");
      s.src = "games.js?v=" + Date.now();
      s.onload = () => {
        if (typeof window.openGamesHub === "function") window.openGamesHub();
        else hardReloadForGames();
      };
      s.onerror = hardReloadForGames;
      document.head.appendChild(s);
    }
  };
  function hardReloadForGames() {
    try {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          Promise.all(regs.map((r) => r.unregister())).then(() => {
            if ("caches" in window) {
              caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
                .finally(() => location.reload(true));
            } else { location.reload(true); }
          });
        });
      } else { location.reload(true); }
    } catch (_) { location.reload(true); }
  }

  if (soundBtn) {
    const updateSoundIcon = () => { soundBtn.textContent = muted ? "🔇" : "🔊"; };
    updateSoundIcon();
    soundBtn.onclick = () => {
      muted = !muted;
      localStorage.setItem(KEY.muted, muted ? "1" : "0");
      updateSoundIcon();
      // SFX toggle is INDEPENDENT of music — do not touch BGM here.
      if (!muted) SFX.correct();
    };
  }

  // 🎵 Music toggle (independent of SFX mute)
  const musicBtn = document.getElementById("music-btn");
  if (musicBtn) {
    const updateMusicIcon = () => {
      musicBtn.textContent = BGM.isOn() ? "🎵" : "🔕";
      musicBtn.classList.toggle("muted-btn", !BGM.isOn());
      musicBtn.title = BGM.isOn() ? "Music ON · ਸੰਗੀਤ ਚਾਲੂ" : "Music OFF · ਸੰਗੀਤ ਬੰਦ";
    };
    updateMusicIcon();
    musicBtn.onclick = () => {
      // Music toggle implies a user gesture — safe to init AudioContext
      try { _initAudio(); } catch (_) {}
      const nowOn = BGM.toggle();
      updateMusicIcon();
    };
  }

  if (exportBtn) exportBtn.onclick = () => {
    const payload = {
      ladderVersion: LADDER_VERSION,
      idx: state.idx,
      hp: state.hp,
      maxHp: maxHpFor(state.power),
      power: state.power,
      rupees: state.rupees,
      gold: state.gold,
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
    if (!confirm("Reset ALL progress? Power, Rupees, Gold and ladder position will be wiped.\n\nਸਾਰੀ ਤਰੱਕੀ ਮਿਟਾਉਣੀ ਹੈ?")) return;
    [KEY.pos, KEY.hp, KEY.power, KEY.rupees, KEY.gold, KEY.review, KEY.cleared, KEY.history,
     KEY.daily,
     `dl_seen_v2__${currentChildId}`,
     `${AVATAR_KEY}__${currentChildId}`,
     `dl_atk_v1__${currentChildId}`]
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
        en: `👋 Welcome back, yodha! Day 1 of training.`,
        pa: `👋 ਫਿਰ ਮਿਲੇ, ਯੋਧਾ! ਸਿਖਲਾਈ ਦਾ ਪਹਿਲਾ ਦਿਨ।`
      });
    }, 400);
    if (!alreadyToday && d.count > 1 && [3, 7, 14, 30].includes(d.count)) {
      state.rupees += 200 * d.count;
      setTimeout(() => {
        toast({
          en: `🎁 Daily bonus: +${200 * d.count} ₹`,
          pa: `🎁 ਰੋਜ਼ਾਨਾ ਇਨਾਮ: +${200 * d.count} ₹`
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
    BGM,
    paLine, paInline,
    toast, confetti, kiBurst, screenShake, slowMo,
    addPower, addRupees, addGold, addGoldBars, dealDamage,
    queueReview,
    maxHpFor, rankIndex,
    persist,
    render,
    speak,
  };

  // ⚔️ Random attacks are always ON (toggle removed).
  if (window.Attacks && typeof Attacks.setEnabled === "function") {
    try { Attacks.setEnabled(true); } catch (_) {}
  }

  persist();
  render();
})();
