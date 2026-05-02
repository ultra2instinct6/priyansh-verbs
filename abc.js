/* =====================================================================
 * abc.js — Sound Ladder (ABC Side Game)
 * ---------------------------------------------------------------------
 * A focused early-reading trainer launched from the HUD's ABC button.
 * Self-contained: nothing here mutates the main ladder game state.
 * Public entry point: window.openAbcGame().
 *
 * Sections:
 *   1. CONFIG     — letters, words, sentences, tunables.
 *   2. STATE      — runtime per-session state.
 *   3. STORAGE    — persistent progress + parent-mode stats.
 *   4. AUDIO      — speech synthesis helper (sounds + words).
 *   5. UI / DOM   — overlay scaffold.
 *   6. SCREENS    — home, level, game, reward, parent, review, rewards.
 *   7. GAMEPLAY   — round generation, answer handling, feedback.
 *   8. PUBLIC API — openAbcGame / closeAbcGame on window.
 * ===================================================================== */
(function () {
  "use strict";

  // -------------------------------------------------------------------
  // 1. CONFIG
  // -------------------------------------------------------------------
  const CONFIG = {
    storageKey: "vtk.abc.v1",
    overlayId:  "abc-overlay",
    rootClass:  "abc-root",
    stepsPerRound: 10,
    soundMatchSteps:    3,  // steps 1..3
    letterToSoundSteps: 3,  // steps 4..6
    blendSteps:         3   // steps 7..9, step 10 = sentence
  };

  // Phoneme map for ALL letters used across levels (extend as you add levels).
  const LETTERS = {
    m: { phoneme: "/m/",  speak: "mmm" },
    s: { phoneme: "/s/",  speak: "sss" },
    t: { phoneme: "/t/",  speak: "tuh" },
    p: { phoneme: "/p/",  speak: "puh" },
    a: { phoneme: "/\u0103/", speak: "ah" },
    n: { phoneme: "/n/",  speak: "nnn" },
    i: { phoneme: "/\u012D/", speak: "ih" },
    d: { phoneme: "/d/",  speak: "duh" },
    o: { phoneme: "/\u014F/", speak: "ah" },
    g: { phoneme: "/g/",  speak: "guh" },
    c: { phoneme: "/k/",  speak: "kuh" },
    h: { phoneme: "/h/",  speak: "huh" },
    f: { phoneme: "/f/",  speak: "fff" },
    e: { phoneme: "/e/",   speak: "eh" },
    r: { phoneme: "/r/",   speak: "rrr" },
    b: { phoneme: "/b/",   speak: "buh" },
    k: { phoneme: "/k/",   speak: "kuh" },
    l: { phoneme: "/l/",   speak: "lll" },
    u: { phoneme: "/u/",   speak: "uh" },
    w: { phoneme: "/w/",   speak: "wuh" },
    j: { phoneme: "/j/",   speak: "juh" },
    sh:{ phoneme: "/sh/",  speak: "shh" },
    ch:{ phoneme: "/ch/",  speak: "chuh" },
    th:{ phoneme: "/th/",  speak: "thh" },
    z: { phoneme: "/z/",   speak: "zzz" }
  };
  const LETTER_KEYS = Object.keys(LETTERS);

  const WORDS = ["am", "Sam", "sat", "mat", "tap", "pat"];

  const SENTENCES = [
    { text: "Sam sat.",        q: "Who sat?",            a: "Sam", choices: ["Sam", "Pat", "mat"] },
    { text: "Pat sat.",        q: "Who sat?",            a: "Pat", choices: ["Sam", "Pat", "tap"] },
    { text: "Sam taps.",       q: "Who taps?",           a: "Sam", choices: ["Sam", "Pat", "mat"] },
    { text: "Pat taps.",       q: "Who taps?",           a: "Pat", choices: ["Sam", "Pat", "sat"] },
    { text: "Sam sat at mat.", q: "Where did Sam sit?",  a: "mat", choices: ["mat", "tap", "Pat"] }
  ];

  // 5 progressive levels. Each adds 1–2 new letters + new decodable words.
  const LEVELS = [
    {
      id: "L1",
      title: "Level 1: First Sounds",
      letters: ["m", "s", "t", "p", "a"],
      words:   WORDS,
      sentences: SENTENCES
    },
    {
      id: "L2",
      title: "Level 2: Add n, i",
      letters: ["m", "s", "t", "p", "a", "n", "i"],
      words:   ["in", "it", "sit", "pin", "tin", "man", "pan", "nap", "sip", "tip"],
      sentences: [
        { text: "Sit, Sam.",       q: "Who must sit?",  a: "Sam", choices: ["Sam", "Pan", "Tin"] },
        { text: "Pat is in.",      q: "Who is in?",     a: "Pat", choices: ["Pat", "Sam", "Tin"] },
        { text: "Tip the pan.",    q: "Tip the what?",  a: "pan", choices: ["pan", "pin", "man"] },
        { text: "A man sat.",      q: "Who sat?",       a: "man", choices: ["man", "Sam", "Pat"] },
        { text: "Sam taps a tin.", q: "What does Sam tap?", a: "tin", choices: ["tin", "pin", "pan"] }
      ]
    },
    {
      id: "L3",
      title: "Level 3: Add d, o",
      letters: ["m", "s", "t", "p", "a", "n", "i", "d", "o"],
      words:   ["dot", "dad", "mad", "sad", "mop", "top", "pot", "pod", "dip", "did"],
      sentences: [
        { text: "Dad is mad.",     q: "Who is mad?",     a: "Dad", choices: ["Dad", "Sam", "Pat"] },
        { text: "Sam dips a mop.", q: "What does Sam dip?", a: "mop", choices: ["mop", "pot", "top"] },
        { text: "A pot sits on top.", q: "What is on top?", a: "pot", choices: ["pot", "pod", "dot"] },
        { text: "Dad did it.",     q: "Who did it?",      a: "Dad", choices: ["Dad", "Sam", "Pat"] },
        { text: "Pat is sad.",     q: "Who is sad?",      a: "Pat", choices: ["Pat", "Sam", "Dad"] }
      ]
    },
    {
      id: "L4",
      title: "Level 4: Add g, c",
      letters: ["m", "s", "t", "p", "a", "n", "i", "d", "o", "g", "c"],
      words:   ["cat", "cap", "cot", "cog", "dog", "gap", "dig", "can", "got", "pig"],
      sentences: [
        { text: "A cat sat.",      q: "Who sat?",         a: "cat", choices: ["cat", "dog", "pig"] },
        { text: "The dog can dig.", q: "What can the dog do?", a: "dig", choices: ["dig", "nap", "sit"] },
        { text: "Sam got a cap.",  q: "What did Sam get?", a: "cap", choices: ["cap", "cot", "cog"] },
        { text: "A pig sat in mud.", q: "Who sat in mud?", a: "pig", choices: ["pig", "cat", "dog"] },
        { text: "Pat can pat a dog.", q: "What can Pat pat?", a: "dog", choices: ["dog", "cat", "pig"] }
      ]
    },
    {
      id: "L5",
      title: "Level 5: Add h, f",
      letters: ["m", "s", "t", "p", "a", "n", "i", "d", "o", "g", "c", "h", "f"],
      words:   ["hat", "ham", "hop", "hit", "fan", "fin", "fit", "fog", "hid", "hip"],
      sentences: [
        { text: "Sam has a hat.",  q: "Who has a hat?",   a: "Sam", choices: ["Sam", "Pat", "Dad"] },
        { text: "The fan is on.",  q: "What is on?",      a: "fan", choices: ["fan", "fog", "hat"] },
        { text: "Pat hid the ham.", q: "What did Pat hide?", a: "ham", choices: ["ham", "hat", "hip"] },
        { text: "A fish has a fin.", q: "What does a fish have?", a: "fin", choices: ["fin", "fog", "fan"] },
        { text: "The cap can fit.", q: "What can fit?",    a: "cap", choices: ["cap", "hat", "ham"] }
      ]
    },
    {
      id: "L6",
      title: "Level 6: Add e, r",
      letters: ["m","s","t","p","a","n","i","d","o","g","c","h","f","e","r"],
      words:   ["red", "hen", "pen", "net", "ten", "ran", "rip", "rat", "rod", "her"],
      sentences: [
        { text: "The hen ran.",       q: "Who ran?",          a: "hen", choices: ["hen","rat","pen"] },
        { text: "Sam has a red pen.", q: "What color is the pen?", a: "red", choices: ["red","hot","big"] },
        { text: "Pat got ten nets.",  q: "How many nets?",     a: "ten", choices: ["ten","two","red"] },
        { text: "The rat hid.",       q: "Who hid?",           a: "rat", choices: ["rat","hen","man"] },
        { text: "Her cap is red.",    q: "What is red?",       a: "cap", choices: ["cap","hat","pen"] }
      ]
    },
    {
      id: "L7",
      title: "Level 7: Add b, k, l",
      letters: ["m","s","t","p","a","n","i","d","o","g","c","h","f","e","r","b","k","l"],
      words:   ["bat", "bed", "big", "bag", "kid", "kit", "lap", "leg", "log", "lid"],
      sentences: [
        { text: "The kid has a bat.", q: "What does the kid have?", a: "bat", choices: ["bat","bag","bed"] },
        { text: "A big log fell.",    q: "What fell?",         a: "log", choices: ["log","leg","lap"] },
        { text: "Pat sat on the bed.", q: "Where did Pat sit?", a: "bed", choices: ["bed","bag","bat"] },
        { text: "Lift the lid.",      q: "Lift the what?",     a: "lid", choices: ["lid","leg","log"] },
        { text: "The kit is in the bag.", q: "Where is the kit?", a: "bag", choices: ["bag","bed","lap"] }
      ]
    },
    {
      id: "L8",
      title: "Level 8: Add u, w, j",
      letters: ["m","s","t","p","a","n","i","d","o","g","c","h","f","e","r","b","k","l","u","w","j"],
      words:   ["cup", "bug", "sun", "run", "jug", "jet", "jog", "web", "wig", "win"],
      sentences: [
        { text: "The bug is on the cup.", q: "Where is the bug?", a: "cup", choices: ["cup","jug","bed"] },
        { text: "Sam can run in the sun.", q: "Where does Sam run?", a: "sun", choices: ["sun","web","log"] },
        { text: "The jet is fast.",   q: "What is fast?",      a: "jet", choices: ["jet","jug","jog"] },
        { text: "Pat got a wig.",     q: "What did Pat get?",  a: "wig", choices: ["wig","web","win"] },
        { text: "We win the cup.",    q: "What did we win?",   a: "cup", choices: ["cup","jug","jet"] }
      ]
    },
    {
      id: "L9",
      title: "Level 9: Blends (st, sp, pl, fl, fr, cl, cr, dr)",
      letters: ["m","s","t","p","a","n","i","d","o","g","c","h","f","e","r","b","k","l","u","w","j"],
      words:   ["stop", "step", "spot", "plan", "plot", "flag", "frog", "clip", "crab", "drum"],
      sentences: [
        { text: "The frog can jump.",  q: "What can jump?",   a: "frog", choices: ["frog","crab","flag"] },
        { text: "Stop at the spot.",   q: "Stop at the what?", a: "spot", choices: ["spot","step","stop"] },
        { text: "The flag is red.",    q: "What is red?",     a: "flag", choices: ["flag","frog","plan"] },
        { text: "Sam has a plan.",     q: "What does Sam have?", a: "plan", choices: ["plan","plot","clip"] },
        { text: "The crab hid in mud.", q: "Who hid?",         a: "crab", choices: ["crab","frog","drum"] }
      ]
    },
    {
      id: "L10",
      title: "Level 10: Digraphs sh, ch, th",
      letters: ["a","e","i","o","u","sh","ch","th","s","t","p","n","r","f","d","h","c"],
      words:   ["ship", "shop", "fish", "dish", "chip", "chop", "chin", "this", "that", "thin"],
      sentences: [
        { text: "The ship is in the shop.", q: "Where is the ship?", a: "shop", choices: ["shop","chip","dish"] },
        { text: "That fish is thin.",   q: "What is thin?",      a: "fish", choices: ["fish","ship","chin"] },
        { text: "Chop the chip.",       q: "Chop the what?",     a: "chip", choices: ["chip","chin","chop"] },
        { text: "This dish is hot.",    q: "What is hot?",       a: "dish", choices: ["dish","fish","ship"] },
        { text: "Pat has a thin chin.", q: "What is thin?",      a: "chin", choices: ["chin","ship","shop"] }
      ]
    },
    {
      id: "L11",
      title: "Level 11: Magic e (CVCe)",
      letters: ["a","e","i","o","u","m","k","t","p","n","l","d","r","b","c","h"],
      words:   ["make", "cake", "lake", "bike", "like", "time", "home", "bone", "cube", "cute"],
      sentences: [
        { text: "I like the cake.",     q: "What do I like?",   a: "cake", choices: ["cake","bike","home"] },
        { text: "The lake is cold.",    q: "What is cold?",     a: "lake", choices: ["lake","home","bone"] },
        { text: "I ride the bike home.", q: "What do I ride?",  a: "bike", choices: ["bike","cake","cube"] },
        { text: "It is time to make a cake.", q: "What do I make?", a: "cake", choices: ["cake","bone","home"] },
        { text: "The cute dog has a bone.", q: "What does the dog have?", a: "bone", choices: ["bone","cube","cake"] }
      ]
    },
    {
      id: "L12",
      title: "Level 12: Reader's Mix",
      letters: ["a","e","i","o","u","sh","ch","th","s","t","p","n","r","l","k","b","d","m","f","h","g","z"],
      words:   ["shape", "chase", "these", "trike", "plate", "snake", "flame", "globe", "prize", "crane"],
      sentences: [
        { text: "The snake is on the plate.", q: "Where is the snake?", a: "plate", choices: ["plate","globe","crane"] },
        { text: "I won the prize.",      q: "What did I win?",   a: "prize", choices: ["prize","trike","flame"] },
        { text: "The crane has a long neck.", q: "What has a long neck?", a: "crane", choices: ["crane","snake","globe"] },
        { text: "Chase the trike home.", q: "Chase the what?",  a: "trike", choices: ["trike","plate","shape"] },
        { text: "These shapes are blue.", q: "What is blue?",   a: "shape", choices: ["shape","globe","flame"] }
      ]
    }
  ];

  const PRAISE = [
    "Nice decoding.",
    "Good sound work.",
    "You blended it.",
    "Correct. Climb up.",
    "Strong reading."
  ];

  // -------------------------------------------------------------------
  // 2. STATE
  // -------------------------------------------------------------------
  const state = {
    open: false,
    screen: "home",   // home | level | game | reward | parent | review | rewards
    level: null,      // current LEVELS entry
    round: null,      // generated questions for the current run
    stepIdx: 0,       // 0..9
    attempts: 0,      // attempts on current step
    sessionStats: null
  };

  function newSessionStats() {
    return { sounds: {}, words: {}, startedAt: Date.now() };
  }

  // -------------------------------------------------------------------
  // 3. STORAGE
  // -------------------------------------------------------------------
  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return {
      plays: 0, best: 0, stars: 0,
      unlockedLevel: 1,
      bestPerLevel: {},
      lastSession: null,
      lifetime: { sounds: {}, words: {} }
    };
  }
  function saveProgress(p) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(p)); }
    catch (_) { /* ignore quota errors */ }
  }
  function recordAnswer(kind, key, ok) {
    if (!state.sessionStats) return;
    const bucket = kind === "word" ? state.sessionStats.words : state.sessionStats.sounds;
    if (!bucket[key]) bucket[key] = { correct: 0, wrong: 0 };
    if (ok) bucket[key].correct++; else bucket[key].wrong++;
  }
  function commitSession(score) {
    const p = loadProgress();
    p.plays = (p.plays || 0) + 1;
    p.best  = Math.max(p.best || 0, score);
    if (score === CONFIG.stepsPerRound) p.stars = (p.stars || 0) + 1;
    p.lastSession = state.sessionStats;
    // Per-level best + unlock: 7/10 unlocks the next level.
    const lvlIdx = LEVELS.findIndex(l => l === state.level);
    if (lvlIdx >= 0) {
      const id = LEVELS[lvlIdx].id;
      p.bestPerLevel = p.bestPerLevel || {};
      p.bestPerLevel[id] = Math.max(p.bestPerLevel[id] || 0, score);
      if (score >= 7 && lvlIdx + 1 < LEVELS.length) {
        p.unlockedLevel = Math.max(p.unlockedLevel || 1, lvlIdx + 2);
      }
    }
    for (const [k, v] of Object.entries(state.sessionStats.sounds)) {
      const t = p.lifetime.sounds[k] || { correct: 0, wrong: 0 };
      t.correct += v.correct; t.wrong += v.wrong;
      p.lifetime.sounds[k] = t;
    }
    for (const [k, v] of Object.entries(state.sessionStats.words)) {
      const t = p.lifetime.words[k] || { correct: 0, wrong: 0 };
      t.correct += v.correct; t.wrong += v.wrong;
      p.lifetime.words[k] = t;
    }
    saveProgress(p);
    return p;
  }

  // -------------------------------------------------------------------
  // 4. AUDIO — SpeechSynthesis helper
  // -------------------------------------------------------------------
  function speak(text, opts) {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang  = "en-US";
      u.rate  = (opts && opts.rate)  != null ? opts.rate  : 0.85;
      u.pitch = (opts && opts.pitch) != null ? opts.pitch : 1.0;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (_) { /* speech not available — silent fallback */ }
  }
  function speakLetter(letterKey) {
    const L = LETTERS[String(letterKey).toLowerCase()];
    if (L) speak(L.speak, { rate: 0.7 });
  }
  function speakWord(word)     { speak(word, { rate: 0.8 });  }
  function speakSentence(text) { speak(text, { rate: 0.85 }); }

  // -------------------------------------------------------------------
  // 5. UI / DOM scaffold
  // -------------------------------------------------------------------
  function buildOverlay() {
    let el = document.getElementById(CONFIG.overlayId);
    if (el) return el;
    el = document.createElement("div");
    el.id = CONFIG.overlayId;
    el.className = CONFIG.rootClass;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Sound Ladder");
    el.innerHTML = `
      <div class="abc-shell">
        <header class="abc-header">
          <h2 class="abc-title">Sound Ladder</h2>
          <button class="abc-close" id="abc-close" aria-label="Close" title="Close">\u2715</button>
        </header>
        <main class="abc-body" id="abc-body"></main>
      </div>
    `;
    document.body.appendChild(el);
    el.querySelector("#abc-close").addEventListener("click", closeAbcGame);
    el.addEventListener("click", (e) => { if (e.target === el) closeAbcGame(); });
    document.addEventListener("keydown", onKeydown);
    return el;
  }
  function onKeydown(e) {
    if (state.open && e.key === "Escape") closeAbcGame();
  }

  // -------------------------------------------------------------------
  // Tiny helpers
  // -------------------------------------------------------------------
  function $(sel)   { return document.querySelector(sel); }
  function bodyEl() { return document.getElementById("abc-body"); }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function pickN(arr, n, exclude) {
    const pool = arr.filter(x => !exclude || !exclude.includes(x));
    return shuffle(pool).slice(0, n);
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  // -------------------------------------------------------------------
  // 6. SCREENS
  // -------------------------------------------------------------------
  function go(screen) { state.screen = screen; render(); }

  function render() {
    const body = bodyEl();
    if (!body) return;
    switch (state.screen) {
      case "home":    return renderHome(body);
      case "level":   return renderLevel(body);
      case "game":    return renderGame(body);
      case "reward":  return renderReward(body);
      case "parent":  return renderParent(body);
      case "review":  return renderReview(body);
      case "rewards": return renderRewards(body);
      default:        return renderHome(body);
    }
  }

  function renderHome(body) {
    const p = loadProgress();
    body.innerHTML = `
      <section class="abc-home">
        <p class="abc-tagline">Reading training. Climb the sound ladder.</p>
        <div class="abc-stats">
          <div>\u2B50 Stars: <strong>${p.stars || 0}</strong></div>
          <div>Best: <strong>${p.best || 0}/${CONFIG.stepsPerRound}</strong></div>
          <div>Plays: <strong>${p.plays || 0}</strong></div>
        </div>
        <div class="abc-menu-grid">
          <button class="abc-cta primary" data-go="level">\u25B6 Start Training</button>
          <button class="abc-cta" data-go="review">\uD83D\uDD0A Review Sounds</button>
          <button class="abc-cta" data-go="rewards">\uD83C\uDFC5 My Rewards</button>
          <button class="abc-cta" data-go="parent">\uD83D\uDC64 Parent Mode</button>
        </div>
      </section>
    `;
    body.querySelectorAll("[data-go]").forEach(b => {
      b.addEventListener("click", () => {
        const t = b.dataset.go;
        if (t === "level")   { state.level = LEVELS[0]; go("level"); }
        if (t === "review")  go("review");
        if (t === "rewards") go("rewards");
        if (t === "parent")  go("parent");
      });
    });
  }

  function renderReview(body) {
    body.innerHTML = `
      <section class="abc-review">
        <h3 class="abc-h3">Review Sounds</h3>
        <p class="abc-sub">Tap a letter to hear its sound.</p>
        <div class="abc-letter-row">
          ${LETTER_KEYS.map(k => `
            <button class="abc-letter-tile" data-letter="${k}">
              <span class="abc-letter-big">${k}</span>
              <span class="abc-letter-phn">${LETTERS[k].phoneme}</span>
            </button>
          `).join("")}
        </div>
        <button class="abc-cta" id="abc-review-back">\u2190 Home</button>
      </section>
    `;
    body.querySelectorAll(".abc-letter-tile").forEach(t => {
      t.addEventListener("click", () => speakLetter(t.dataset.letter));
    });
    body.querySelector("#abc-review-back").addEventListener("click", () => go("home"));
  }

  function renderRewards(body) {
    const p = loadProgress();
    body.innerHTML = `
      <section class="abc-rewards">
        <h3 class="abc-h3">My Rewards</h3>
        <div class="abc-reward-grid">
          <div class="abc-reward-card"><div class="abc-reward-icon">\u2B50</div><div>Sound Stars</div><strong>${p.stars || 0}</strong></div>
          <div class="abc-reward-card"><div class="abc-reward-icon">\uD83D\uDC8E</div><div>Learning Gems</div><strong>${Math.floor((p.plays || 0) / 3)}</strong></div>
          <div class="abc-reward-card"><div class="abc-reward-icon">\uD83D\uDC32</div><div>Dragon Balls</div><strong>${Math.floor((p.stars || 0) / 7)}</strong></div>
        </div>
        <button class="abc-cta" id="abc-rew-back">\u2190 Home</button>
      </section>
    `;
    body.querySelector("#abc-rew-back").addEventListener("click", () => go("home"));
  }

  function renderLevel(body) {
    const lvl = state.level || LEVELS[0];
    body.innerHTML = `
      <section class="abc-level">
        <h3 class="abc-h3">${escHtml(lvl.title)}</h3>
        <p class="abc-sub">Sounds you'll practice (tap to hear):</p>
        <div class="abc-letter-row">
          ${lvl.letters.map(k => `
            <button class="abc-letter-tile" data-letter="${k}">
              <span class="abc-letter-big">${k}</span>
              <span class="abc-letter-phn">${LETTERS[k].phoneme}</span>
            </button>
          `).join("")}
        </div>
        <div class="abc-level-actions">
          <button class="abc-cta primary" id="abc-level-start">\u25B6 Start Level</button>
          <button class="abc-cta" id="abc-level-back">\u2190 Home</button>
        </div>
      </section>
    `;
    body.querySelectorAll(".abc-letter-tile").forEach(t => {
      t.addEventListener("click", () => speakLetter(t.dataset.letter));
    });
    body.querySelector("#abc-level-start").addEventListener("click", () => startRound());
    body.querySelector("#abc-level-back").addEventListener("click", () => go("home"));
  }

  function renderParent(body) {
    const p = loadProgress();
    const last = p.lastSession;
    let inner = "<p class='abc-sub'>No sessions yet. Play a round to see today's report.</p>";
    if (last) {
      const sEntries = Object.entries(last.sounds || {});
      const wEntries = Object.entries(last.words  || {});
      const sPracticed = sEntries.map(([k]) => k);
      const sStrong    = sEntries.filter(([, v]) => v.correct >= 1 && v.wrong === 0).map(([k]) => k);
      const sReview    = sEntries.filter(([, v]) => v.wrong   >= 1).map(([k]) => k);
      const wRead      = wEntries.filter(([, v]) => v.correct >= 1).map(([k]) => k);
      const wMissed    = wEntries.filter(([, v]) => v.wrong   >= 1).map(([k]) => k);
      const tomorrow   = wMissed.length ? wMissed : pickN(WORDS, 3);
      inner = `
        <h4 class="abc-h4">Today's Practice</h4>
        <div class="abc-report">
          <div><b>Sounds practiced:</b> ${sPracticed.join(", ") || "\u2014"}</div>
          <div><b>Strong:</b> ${sStrong.join(", ") || "\u2014"}</div>
          <div><b>Needs review:</b> ${sReview.join(", ") || "\u2014"}</div>
          <div><b>Words read:</b> ${wRead.join(", ") || "\u2014"}</div>
          <div><b>Words missed:</b> ${wMissed.join(", ") || "\u2014"}</div>
          <div><b>Practice tomorrow:</b> ${tomorrow.join(", ")}</div>
        </div>
      `;
    }
    body.innerHTML = `
      <section class="abc-parent">
        <h3 class="abc-h3">Parent Mode</h3>
        ${inner}
        <button class="abc-cta" id="abc-parent-back">\u2190 Home</button>
      </section>
    `;
    body.querySelector("#abc-parent-back").addEventListener("click", () => go("home"));
  }

  // -------------------------------------------------------------------
  // 7. GAMEPLAY
  // -------------------------------------------------------------------
  function startRound() {
    state.sessionStats = newSessionStats();
    state.round    = generateRound(state.level);
    state.stepIdx  = 0;
    state.attempts = 0;
    go("game");
  }

  // Build a 10-step round: 3 sound-match, 3 letter-to-sound, 3 blend, 1 sentence.
  function generateRound(level) {
    const steps = [];
    const letters = level.letters;

    for (let i = 0; i < CONFIG.soundMatchSteps; i++) {
      const target = pick(letters);
      const choices = shuffle([target, ...pickN(letters, 2, [target])]);
      steps.push({
        type: "sound-match",
        prompt: `Tap the letter that says ${LETTERS[target].phoneme}`,
        replay: () => speakLetter(target),
        target, choices,
        statKind: "sound", statKey: target
      });
    }

    for (let i = 0; i < CONFIG.letterToSoundSteps; i++) {
      const target = pick(letters);
      const choices = shuffle([target, ...pickN(letters, 2, [target])]).map(k => LETTERS[k].phoneme);
      steps.push({
        type: "letter-to-sound",
        prompt: "What sound does this letter make?",
        big: target,
        replay: () => speakLetter(target),
        target: LETTERS[target].phoneme,
        choices,
        statKind: "sound", statKey: target
      });
    }

    for (let i = 0; i < CONFIG.blendSteps; i++) {
      const word = pick(level.words);
      const choices = shuffle([word, ...pickN(level.words, 2, [word])]);
      steps.push({
        type: "blend",
        prompt: "What word did you make?",
        word,
        letters: word.split(""),
        replay: () => speakWord(word),
        target: word, choices,
        statKind: "word", statKey: word
      });
    }

    const s = pick(level.sentences);
    steps.push({
      type: "sentence",
      prompt: s.q,
      sentence: s.text,
      replay: () => speakSentence(s.text),
      target: s.a,
      choices: shuffle(s.choices),
      statKind: "word", statKey: s.a
    });

    return steps;
  }

  function renderGame(body) {
    const step = state.round[state.stepIdx];
    if (!step) return finishRound();

    let challenge = "";
    if (step.type === "sound-match") {
      challenge = `<div class="abc-prompt">${escHtml(step.prompt)}</div>`;
    } else if (step.type === "letter-to-sound") {
      challenge = `
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
        <div class="abc-letter-huge">${escHtml(step.big)}</div>
      `;
    } else if (step.type === "blend") {
      challenge = `
        <div class="abc-prompt small">Tap each sound, then say the word.</div>
        <div class="abc-blend-row">
          ${step.letters.map((c, i) => `
            <button class="abc-blend-tile" data-blend="${escHtml(c)}">${escHtml(c)}</button>
            ${i < step.letters.length - 1 ? '<span class="abc-blend-sep">\u2014</span>' : ''}
          `).join("")}
        </div>
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
      `;
    } else if (step.type === "sentence") {
      challenge = `
        <div class="abc-sentence">${escHtml(step.sentence)}</div>
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
      `;
    }

    body.innerHTML = `
      <section class="abc-game">
        <div class="abc-game-top">
          <div class="abc-level-name">${escHtml(state.level.title)}</div>
          <div class="abc-progress">Step ${state.stepIdx + 1}/${CONFIG.stepsPerRound}</div>
        </div>

        <div class="abc-ladder" aria-hidden="true">
          ${renderLadder(state.stepIdx)}
        </div>

        <div class="abc-challenge">
          ${challenge}
          <div class="abc-choices" id="abc-choices">
            ${step.choices.map(c => `
              <button class="abc-choice" data-val="${escHtml(c)}">${escHtml(c)}</button>
            `).join("")}
          </div>
          <div class="abc-actions">
            <button class="abc-mini" id="abc-replay">\uD83D\uDD0A Replay Sound</button>
            <button class="abc-mini" id="abc-hint">\uD83D\uDCA1 Hint</button>
          </div>
          <div class="abc-feedback" id="abc-feedback" aria-live="polite"></div>
        </div>
      </section>
    `;

    if (step.replay) setTimeout(step.replay, 250);

    body.querySelectorAll(".abc-choice").forEach(b => {
      b.addEventListener("click", () => handleAnswer(b.dataset.val, b));
    });
    body.querySelector("#abc-replay").addEventListener("click", step.replay);
    body.querySelector("#abc-hint").addEventListener("click", () => giveHint(step));
    body.querySelectorAll(".abc-blend-tile").forEach(t => {
      t.addEventListener("click", () => speakLetter(t.dataset.blend));
    });
  }

  function renderLadder(stepIdx) {
    const rungs = [];
    for (let i = CONFIG.stepsPerRound; i >= 1; i--) {
      const reached = i <= stepIdx;
      const here    = i === stepIdx + 1;
      rungs.push(`
        <div class="abc-rung ${reached ? "reached" : ""} ${here ? "here" : ""}">
          <span class="abc-rung-n">${i}</span>
          ${here ? '<span class="abc-climber">\uD83E\uDDD7</span>' : ""}
        </div>
      `);
    }
    return `<div class="abc-ladder-inner">${rungs.join("")}</div>`;
  }

  function handleAnswer(val, btnEl) {
    const step = state.round[state.stepIdx];
    if (!step) return;
    const fb = $("#abc-feedback");
    const ok = String(val) === String(step.target);

    if (ok) {
      btnEl.classList.add("correct");
      recordAnswer(step.statKind, step.statKey, true);
      fb.textContent = pick(PRAISE);
      fb.className = "abc-feedback ok";
      bodyEl().querySelectorAll(".abc-choice").forEach(b => b.disabled = true);
      setTimeout(() => {
        state.stepIdx++;
        state.attempts = 0;
        if (state.stepIdx >= CONFIG.stepsPerRound) finishRound();
        else render();
      }, 850);
    } else {
      state.attempts++;
      btnEl.classList.add("wrong");
      btnEl.disabled = true;
      recordAnswer(step.statKind, step.statKey, false);
      if (state.attempts >= 2) {
        if (step.type === "sound-match") {
          fb.innerHTML = `This is <b>${escHtml(step.statKey)}</b>. It says ${LETTERS[step.statKey].phoneme}. Now tap <b>${escHtml(step.target)}</b>.`;
        } else if (step.type === "letter-to-sound") {
          fb.innerHTML = `This is <b>${escHtml(step.big)}</b>. It says ${LETTERS[step.big].phoneme}. Tap ${escHtml(step.target)}.`;
        } else if (step.type === "blend") {
          fb.innerHTML = `The word is <b>${escHtml(step.target)}</b>. Tap <b>${escHtml(step.target)}</b>.`;
        } else {
          fb.innerHTML = `Listen again: "${escHtml(step.sentence)}". The answer is <b>${escHtml(step.target)}</b>.`;
        }
        fb.className = "abc-feedback teach";
        bodyEl().querySelectorAll(".abc-choice").forEach(b => {
          if (b.dataset.val === String(step.target)) b.classList.add("hint");
        });
      } else {
        if (step.type === "sound-match") {
          fb.innerHTML = `Try again. Listen to the sound: ${LETTERS[step.statKey].phoneme}. Find ${LETTERS[step.statKey].phoneme}.`;
        } else if (step.type === "letter-to-sound") {
          fb.textContent = `Try again. What sound does ${step.big} make?`;
        } else if (step.type === "blend") {
          fb.textContent = "Try again. Tap each sound, then blend.";
        } else {
          fb.textContent = "Try again. Read the sentence carefully.";
        }
        fb.className = "abc-feedback retry";
        if (step.replay) step.replay();
      }
    }
  }

  function giveHint(step) {
    const fb = $("#abc-feedback");
    if (!fb) return;
    if (step.type === "sound-match") {
      fb.innerHTML = `${LETTERS[step.statKey].phoneme} is the sound for the letter <b>${escHtml(step.statKey)}</b>.`;
    } else if (step.type === "letter-to-sound") {
      fb.innerHTML = `Letter <b>${escHtml(step.big)}</b> says ${LETTERS[step.big].phoneme}.`;
    } else if (step.type === "blend") {
      const sounded = step.letters.map(c => {
        const L = LETTERS[c.toLowerCase()];
        return L ? L.phoneme : c;
      }).join(" \u2014 ");
      fb.innerHTML = `Sound it out: ${sounded}.`;
    } else {
      fb.innerHTML = `Re-read: "${escHtml(step.sentence)}".`;
    }
    fb.className = "abc-feedback hint";
    if (step.replay) step.replay();
  }

  function finishRound() {
    // Score: count steps where target was answered correctly at least once
    // (a step that needed retries still counts if eventually correct).
    let score = 0;
    for (const step of state.round) {
      const bucket = step.statKind === "word" ? state.sessionStats.words : state.sessionStats.sounds;
      const v = bucket[step.statKey];
      if (v && v.correct > 0) score++;
    }
    score = Math.min(score, CONFIG.stepsPerRound);
    const p = commitSession(score);
    renderReward(bodyEl(), p, score);
    state.screen = "reward";
  }

  function renderReward(body, pIn, scoreIn) {
    const p = pIn || loadProgress();
    const score = scoreIn != null ? scoreIn : 0;
    const lvlIdx = LEVELS.findIndex(l => l === state.level);
    const hasNext = lvlIdx >= 0 && lvlIdx + 1 < LEVELS.length;
    const unlockedNext = hasNext && (p.unlockedLevel || 1) >= lvlIdx + 2;
    const passed = score >= 7;
    const headline = passed
      ? (hasNext
          ? (unlockedNext ? `\u2B50 Level ${lvlIdx + 1} cleared! Level ${lvlIdx + 2} unlocked.`
                          : `\u2B50 Level ${lvlIdx + 1} cleared!`)
          : `\uD83C\uDFC6 You finished all ${LEVELS.length} levels!`)
      : `Good try. Score 7+ to unlock the next level.`;
    body.innerHTML = `
      <section class="abc-reward-screen">
        <h3 class="abc-h3">${escHtml(state.level.title)}</h3>
        <div class="abc-reward-big">${escHtml(headline)}</div>
        <div class="abc-stats">
          <div>Score: <strong>${score}/${CONFIG.stepsPerRound}</strong></div>
          <div>Level: <strong>${lvlIdx + 1}/${LEVELS.length}</strong></div>
          <div>Stars: <strong>${p.stars || 0}</strong></div>
        </div>
        <div class="abc-level-actions">
          ${unlockedNext ? `<button class="abc-cta primary" id="abc-next-level">\u25B6 Next Level (${lvlIdx + 2})</button>` : ""}
          <button class="abc-cta ${unlockedNext ? "" : "primary"}" id="abc-play-again">\uD83D\uDD01 Play Again</button>
          <button class="abc-cta" id="abc-home">\uD83C\uDFE0 Levels</button>
          <button class="abc-cta" id="abc-see-parent">\uD83D\uDC64 Parent Mode</button>
        </div>
      </section>
    `;
    const nextBtn = body.querySelector("#abc-next-level");
    if (nextBtn) nextBtn.addEventListener("click", () => {
      state.level = LEVELS[lvlIdx + 1];
      startRound();
    });
    body.querySelector("#abc-play-again").addEventListener("click", () => startRound());
    body.querySelector("#abc-home").addEventListener("click", () => go("home"));
    body.querySelector("#abc-see-parent").addEventListener("click", () => go("parent"));
  }

  // -------------------------------------------------------------------
  // 8. PUBLIC API
  // -------------------------------------------------------------------
  function openAbcGame() {
    const el = buildOverlay();
    state.open = true;
    state.screen = "home";
    el.classList.add("is-open");
    document.body.classList.add("abc-locked");
    // Some browsers (iOS) require a user gesture before TTS works; opening
    // the overlay is itself a click, so we prime the engine with a silent
    // utterance to unlock subsequent ones.
    try { speak(" ", { rate: 1, pitch: 1 }); } catch (_) {}
    render();
  }
  function closeAbcGame() {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
    const el = document.getElementById(CONFIG.overlayId);
    if (el) el.classList.remove("is-open");
    document.body.classList.remove("abc-locked");
    state.open = false;
  }

  window.openAbcGame  = openAbcGame;
  window.closeAbcGame = closeAbcGame;
  window.__abc = { CONFIG, LETTERS, WORDS, SENTENCES, LEVELS, state, loadProgress };
})();
