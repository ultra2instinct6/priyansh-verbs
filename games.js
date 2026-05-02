/* ============================================================
 * games.js — Punjabi Ji Fun Games Hub
 *  ▸ Standalone overlay launched from the 🎮 HUD button.
 *  ▸ Hosts six bonus mini-games. NEVER touches main ladder
 *    state, HP, streak, or review queue. Bonus rewards only.
 *  ▸ Reuses the proven overlay pattern from the old abc.js.
 *  ▸ Reward bridge: window.VTK.reward({rupees, power, confetti, message})
 *  ▸ Per-child best-scores in localStorage: vtk.games.v1__<childId>
 * ============================================================ */
(function () {
  "use strict";

  // ===== CONFIG =====
  const CONFIG = {
    overlayId: "games-overlay",
    rootClass: "games-root",
    storagePrefix: "vtk.games.v1__",
  };

  // ===== STATE =====
  const state = {
    open: false,
    screen: "home",       // home | tap | match | speed | rain | reaction | asteroids
    childId: "default",
  };

  // Per-game runtime state lives on this object so back-button cleanly resets.
  let live = null;

  // RAF / interval handles we must clear on screen changes.
  let _raf = 0, _intervals = [], _timeouts = [];
  function clearTimers() {
    if (_raf) { cancelAnimationFrame(_raf); _raf = 0; }
    _intervals.forEach(clearInterval); _intervals = [];
    _timeouts.forEach(clearTimeout); _timeouts = [];
  }
  function setI(fn, ms) { const id = setInterval(fn, ms); _intervals.push(id); return id; }
  function setT(fn, ms) { const id = setTimeout(fn, ms); _timeouts.push(id); return id; }

  // ===== STORAGE =====
  function storeKey() { return CONFIG.storagePrefix + (state.childId || "default"); }
  function loadStore() {
    try {
      const raw = localStorage.getItem(storeKey());
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (_) { return {}; }
  }
  function saveStore(s) {
    try { localStorage.setItem(storeKey(), JSON.stringify(s)); } catch (_) {}
  }
  function bestFor(gameKey) {
    const s = loadStore();
    return (s[gameKey] && s[gameKey].best) || 0;
  }
  function recordPlay(gameKey, score) {
    const s = loadStore();
    const cur = s[gameKey] || { best: 0, plays: 0 };
    cur.plays = (cur.plays | 0) + 1;
    const isNewBest = score > cur.best;
    if (isNewBest) cur.best = score;
    s[gameKey] = cur;
    saveStore(s);
    return { isNewBest, best: cur.best, plays: cur.plays };
  }

  // ===== HELPERS =====
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function randi(lo, hi) { return Math.floor(rand(lo, hi + 1)); }

  function sfx(name) {
    try { if (window.SFX && typeof window.SFX[name] === "function") window.SFX[name](); } catch (_) {}
  }

  function reward(opts) {
    try {
      if (window.VTK && typeof window.VTK.reward === "function") {
        return window.VTK.reward(opts);
      }
    } catch (_) {}
    return null;
  }

  function getChildId() {
    try {
      if (window.VTK && typeof window.VTK.getProfile === "function") {
        const p = window.VTK.getProfile();
        if (p && p.childId) return String(p.childId);
      }
    } catch (_) {}
    return "default";
  }

  // ===== OVERLAY SHELL =====
  function buildOverlay() {
    let el = document.getElementById(CONFIG.overlayId);
    if (el) return el;
    el = document.createElement("div");
    el.id = CONFIG.overlayId;
    el.className = CONFIG.rootClass;
    el.innerHTML = `
      <div class="games-shell">
        <div class="games-header">
          <button class="games-back" id="games-back" aria-label="Back / Close">⬅</button>
          <div class="games-title" id="games-title">🎮 Fun Games</div>
          <button class="games-close" id="games-close" aria-label="Close">✕</button>
        </div>
        <div class="games-body" id="games-body"></div>
      </div>
    `;
    document.body.appendChild(el);
    el.querySelector("#games-close").addEventListener("click", closeGamesHub);
    el.querySelector("#games-back").addEventListener("click", () => {
      if (state.screen === "home") return closeGamesHub();
      go("home");
    });
    document.addEventListener("keydown", onKey);
    return el;
  }
  function onKey(e) {
    if (!state.open) return;
    if (e.key === "Escape") {
      if (state.screen === "home") closeGamesHub();
      else go("home");
    }
  }
  function setTitle(t) {
    const el = document.querySelector("#games-title");
    if (el) el.textContent = t;
  }
  function body() { return document.getElementById("games-body"); }

  // ===== ROUTER =====
  function go(screen) {
    state.screen = screen;
    clearTimers();
    live = null;
    render();
  }
  function render() {
    switch (state.screen) {
      case "home":      return renderHome();
      case "tap":       return runTap();
      case "match":     return runMatch();
      case "speed":     return runSpeed();
      case "rain":      return runRain();
      case "reaction":  return runReaction();
      case "asteroids": return runAsteroids();
      default:          return renderHome();
    }
  }

  // ===== HOME =====
  const GAMES = [
    { key: "tap",       icon: "👆", titleEn: "Tap Trainer",   titlePa: "ਟੈਪ ਟ੍ਰੇਨਰ",   blurb: "Tap only the words that match the rule." },
    { key: "match",     icon: "🧩", titleEn: "Memory Match",  titlePa: "ਜੋੜੇ ਮਿਲਾਓ",  blurb: "Flip tiles, find the pairs." },
    { key: "speed",     icon: "⚡", titleEn: "Speed Sprint",  titlePa: "ਤੇਜ਼ ਦੌੜ",     blurb: "Quick MCQ blasts. Beat the clock." },
    { key: "rain",      icon: "☔", titleEn: "Word Rain",     titlePa: "ਸ਼ਬਦ ਮੀਂਹ",   blurb: "Catch the right words as they fall." },
    { key: "reaction",  icon: "🎯", titleEn: "Reaction Grid", titlePa: "ਪ੍ਰਤੀਕਿਰਿਆ",  blurb: "Tap the glowing tile before it fades." },
    { key: "asteroids", icon: "☄️", titleEn: "Math Asteroids",titlePa: "ਗਣਿਤ ਉਲਕਾਪਿੰਡ",blurb: "Tap math rocks that match the target." },
  ];

  function renderHome() {
    setTitle("🎮 Fun Games  ·  ਮਜ਼ੇਦਾਰ ਖੇਡਾਂ");
    const cards = GAMES.map(g => {
      const best = bestFor(g.key);
      return `
        <button class="games-card" data-game="${g.key}">
          <div class="games-card-icon">${g.icon}</div>
          <div class="games-card-title">${esc(g.titleEn)}</div>
          <div class="games-card-pa" lang="pa">${esc(g.titlePa)}</div>
          <div class="games-card-blurb">${esc(g.blurb)}</div>
          <div class="games-card-best">🏅 Best: <b>${best}</b></div>
          <div class="games-card-play">▶ PLAY</div>
        </button>
      `;
    }).join("");
    body().innerHTML = `
      <div class="games-hero">
        <div class="games-hero-text">Bonus arcade — earn ₹ &amp; ⚡ for the main game.</div>
        <div class="games-hero-pa" lang="pa">ਮੁੱਖ ਖੇਡ ਲਈ ₹ ਅਤੇ ⚡ ਕਮਾਓ।</div>
      </div>
      <div class="games-grid">${cards}</div>
    `;
    body().querySelectorAll(".games-card").forEach(btn => {
      btn.addEventListener("click", () => { sfx("click"); go(btn.dataset.game); });
    });
  }

  // ===== END-OF-GAME RESULTS SCREEN =====
  function renderResults(opts) {
    // opts: { gameKey, title, score, breakdown[], rupees, power, perfect }
    const r = recordPlay(opts.gameKey, opts.score | 0);
    const rupees = Math.max(0, opts.rupees | 0);
    const power  = Math.max(0, opts.power  | 0);
    const confettiN = opts.perfect ? 40 : (opts.score > 0 ? 18 : 0);
    if (rupees || power) {
      reward({
        rupees, power,
        confetti: confettiN,
        message: {
          en: `🎮 ${opts.title}: +${rupees} ₹ · +${power} ⚡${r.isNewBest ? " · NEW BEST!" : ""}`,
          pa: `🎮 ${opts.title}: +${rupees} ₹ · +${power} ⚡${r.isNewBest ? " · ਨਵਾਂ ਰਿਕਾਰਡ!" : ""}`
        }
      });
    }
    sfx(opts.perfect ? "bossWin" : (opts.score > 0 ? "correct" : "wrong"));

    const lines = (opts.breakdown || []).map(b => `<li>${esc(b)}</li>`).join("");
    setTitle("🏁 Round Complete");
    body().innerHTML = `
      <div class="games-results">
        <div class="games-results-emoji">${opts.perfect ? "🏆" : (opts.score > 0 ? "🎉" : "😺")}</div>
        <h2 class="games-results-title">${esc(opts.title)}</h2>
        <div class="games-results-score">Score: <b>${opts.score | 0}</b></div>
        <div class="games-results-best">🏅 Best: <b>${r.best}</b>${r.isNewBest ? ' <span class="games-newbest">NEW!</span>' : ''}</div>
        ${lines ? `<ul class="games-results-list">${lines}</ul>` : ""}
        <div class="games-results-payout">+${rupees} ₹ &nbsp; +${power} ⚡</div>
        <div class="games-actions">
          <button class="games-btn-primary" id="games-again">🔁 Play Again</button>
          <button class="games-btn-ghost" id="games-home">🏠 Hub</button>
        </div>
      </div>
    `;
    body().querySelector("#games-again").addEventListener("click", () => { sfx("click"); go(opts.gameKey); });
    body().querySelector("#games-home").addEventListener("click", () => { sfx("click"); go("home"); });
  }

  // ============================================================
  // GAME 1 — TAP TRAINER
  // ============================================================
  const TAP_RULES = [
    { rule: "Tap all NOUNS",            ok: ["dog","book","school","teacher","river","apple","car","city","queen","tiger"], no: ["run","quickly","happy","loudly","big","under","jumping","slowly","eat","blue"] },
    { rule: "Tap all VERBS",            ok: ["run","jump","eat","write","sing","read","throw","sleep","dance","drink"], no: ["dog","apple","blue","quickly","big","happy","river","school","under","tiger"] },
    { rule: "Tap all ADJECTIVES",       ok: ["happy","blue","tiny","loud","brave","sweet","sharp","cold","kind","funny"], no: ["run","dog","quickly","under","apple","sing","river","jump","city","write"] },
    { rule: "Tap all EVEN NUMBERS",     ok: ["2","4","6","8","10","12","14","16","18","20"], no: ["1","3","5","7","9","11","13","15","17","19"] },
    { rule: "Tap all MULTIPLES OF 3",   ok: ["3","6","9","12","15","18","21","24","27","30"], no: ["4","5","7","8","10","11","13","14","16","17"] },
    { rule: "Tap all MULTIPLES OF 5",   ok: ["5","10","15","20","25","30","35","40","45","50"], no: ["3","7","12","18","22","27","33","41","46","49"] },
    { rule: "Tap all VOWELS",           ok: ["a","e","i","o","u","A","E","I","O","U"], no: ["b","c","d","f","g","h","j","k","l","m"] },
    { rule: "Tap all PAST-TENSE verbs", ok: ["went","ate","ran","sang","wrote","slept","drank","threw","swam","drove"], no: ["go","eat","run","sing","write","sleep","drink","throw","swim","drive"] },
    { rule: "Tap all PUNJABI WORDS",    ok: ["ਘਰ","ਕੁੱਤਾ","ਪਾਣੀ","ਸਕੂਲ","ਦੋਸਤ","ਮਾਂ","ਪਿਤਾ","ਰੋਟੀ","ਬੱਚਾ","ਚਾਹ"], no: ["house","dog","water","school","friend","mom","dad","bread","child","tea"] },
    { rule: "Tap all PRIMES (under 30)",ok: ["2","3","5","7","11","13","17","19","23","29"], no: ["4","6","9","10","12","15","18","20","21","25"] },
  ];
  function makeTapRound() {
    const r = pick(TAP_RULES);
    const numOk  = randi(4, 6);
    const numNo  = randi(4, 6);
    const items = [
      ...shuffle(r.ok).slice(0, numOk).map(w => ({ label: w, correct: true })),
      ...shuffle(r.no).slice(0, numNo).map(w => ({ label: w, correct: false })),
    ];
    return { rule: r.rule, items: shuffle(items) };
  }
  function runTap() {
    if (!live) live = { round: 1, totalScore: 0, lives: 3, current: makeTapRound(), picked: 0, mistakes: 0, finished: false };
    setTitle(`👆 Tap Trainer · Round ${live.round}`);
    const c = live.current;
    const correctTotal = c.items.filter(x => x.correct).length;
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill">❤️ ${"🟧".repeat(live.lives)}${"⬛".repeat(3 - live.lives)}</div>
        <div class="games-hud-pill">⭐ ${live.totalScore}</div>
        <div class="games-hud-pill">🔢 R${live.round}</div>
      </div>
      <div class="games-rule">${esc(c.rule)}</div>
      <div class="games-tap-grid" id="tap-grid">
        ${c.items.map((it, i) =>
          `<button class="games-chip" data-i="${i}">${esc(it.label)}</button>`
        ).join("")}
      </div>
      <div class="games-status" id="tap-status">${live.picked}/${correctTotal} found · ❌ ${live.mistakes}</div>
      <div class="games-actions">
        <button class="games-btn-primary" id="tap-done">✅ Done</button>
        <button class="games-btn-ghost" id="tap-quit">🏁 End</button>
      </div>
    `;
    function refresh() {
      body().querySelector("#tap-status").textContent = `${live.picked}/${correctTotal} found · ❌ ${live.mistakes} · ❤️ ${live.lives}`;
    }
    body().querySelectorAll(".games-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        if (live.finished) return;
        const i = +btn.dataset.i;
        const it = c.items[i];
        if (btn.disabled) return;
        if (it.correct) {
          live.picked += 1;
          live.totalScore += 10;
          btn.classList.add("good"); btn.disabled = true;
          sfx("correct");
          if (live.picked === correctTotal) finishRound(true);
          else refresh();
        } else {
          live.mistakes += 1;
          live.lives -= 1;
          live.totalScore = Math.max(0, live.totalScore - 4);
          btn.classList.add("bad"); btn.disabled = true;
          sfx("wrong");
          refresh();
          if (live.lives <= 0) finishRound(false);
        }
      });
    });
    body().querySelector("#tap-done").addEventListener("click", () => {
      if (live.finished) return;
      // Penalize unfound correct items, then advance.
      const remaining = correctTotal - live.picked;
      live.totalScore = Math.max(0, live.totalScore - remaining * 2);
      finishRound(remaining === 0 && live.mistakes === 0);
    });
    body().querySelector("#tap-quit").addEventListener("click", endTap);
    function finishRound(perfect) {
      if (live.finished) return;
      live.finished = true;
      if (perfect) live.totalScore += 25;
      sfx(perfect ? "bossWin" : "click");
      // Quick mid-round flash, then load next round.
      setT(() => {
        if (live.lives <= 0 || live.round >= 5) return endTap();
        live.round += 1;
        live.current = makeTapRound();
        live.picked = 0;
        live.mistakes = 0;
        live.finished = false;
        runTap();
      }, 750);
    }
    function endTap() {
      const score = live.totalScore | 0;
      const perfect = live.lives === 3 && live.round >= 5;
      renderResults({
        gameKey: "tap",
        title: "Tap Trainer",
        score,
        perfect,
        rupees: 30 + score * 1,
        power:  20 + score * 2,
        breakdown: [`Rounds: ${live.round}`, `Lives left: ${live.lives}`],
      });
    }
  }

  // ============================================================
  // GAME 2 — MEMORY MATCH
  // ============================================================
  const MATCH_DECKS = [
    { title: "English ↔ Punjabi", pairs: [
      ["water","ਪਾਣੀ"],["dog","ਕੁੱਤਾ"],["house","ਘਰ"],["mother","ਮਾਂ"],
      ["bread","ਰੋਟੀ"],["friend","ਦੋਸਤ"],["school","ਸਕੂਲ"],["father","ਪਿਤਾ"],
    ]},
    { title: "Present → Past", pairs: [
      ["go","went"],["eat","ate"],["run","ran"],["sing","sang"],
      ["write","wrote"],["sleep","slept"],["drink","drank"],["see","saw"],
    ]},
    { title: "Capital ↔ Country", pairs: [
      ["Delhi","India"],["Tokyo","Japan"],["Paris","France"],["Cairo","Egypt"],
      ["Ottawa","Canada"],["Rome","Italy"],["Madrid","Spain"],["Lima","Peru"],
    ]},
    { title: "Singular → Plural", pairs: [
      ["child","children"],["foot","feet"],["mouse","mice"],["tooth","teeth"],
      ["man","men"],["woman","women"],["goose","geese"],["leaf","leaves"],
    ]},
    { title: "Math Pairs", pairs: [
      ["6×7","42"],["8×9","72"],["12÷4","3"],["100−37","63"],
      ["9+16","25"],["½ of 80","40"],["7²","49"],["√81","9"],
    ]},
    { title: "Contractions", pairs: [
      ["do not","don't"],["I am","I'm"],["you are","you're"],["he is","he's"],
      ["we will","we'll"],["they have","they've"],["cannot","can't"],["will not","won't"],
    ]},
  ];
  function makeMatchRound(level) {
    const deck = pick(MATCH_DECKS);
    const n = level <= 1 ? 4 : level === 2 ? 6 : 8;
    const chosen = shuffle(deck.pairs).slice(0, n);
    const tiles = [];
    chosen.forEach((p, i) => {
      tiles.push({ key: `a${i}`, side: "a", pair: i, label: p[0], status: "open" });
      tiles.push({ key: `b${i}`, side: "b", pair: i, label: p[1], status: "open" });
    });
    return { title: deck.title, n, tiles: shuffle(tiles), sel: null, mistakes: 0, solved: 0, locked: false };
  }
  function runMatch() {
    if (!live) live = { level: 1, totalScore: 0, m: makeMatchRound(1), startTs: Date.now(), finished: false };
    setTitle(`🧩 Memory Match · Level ${live.level}`);
    const m = live.m;
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill">⭐ ${live.totalScore}</div>
        <div class="games-hud-pill">🧩 ${live.level}</div>
        <div class="games-hud-pill">❌ ${m.mistakes}</div>
      </div>
      <div class="games-rule">${esc(m.title)}</div>
      <div class="games-match-grid" data-n="${m.n}">
        ${m.tiles.map((t, i) =>
          `<button class="games-tile ${t.status}" data-i="${i}" ${t.status === "matched" ? "disabled" : ""}>${esc(t.label)}</button>`
        ).join("")}
      </div>
      <div class="games-status" id="match-status">${m.solved}/${m.n} pairs · ❌ ${m.mistakes}</div>
      <div class="games-actions">
        <button class="games-btn-ghost" id="match-quit">🏁 End</button>
      </div>
    `;
    function refresh() {
      body().querySelectorAll(".games-tile").forEach((el, i) => {
        const t = m.tiles[i];
        el.className = "games-tile " + t.status;
        el.disabled = t.status === "matched";
      });
      body().querySelector("#match-status").textContent = `${m.solved}/${m.n} pairs · ❌ ${m.mistakes}`;
    }
    body().querySelectorAll(".games-tile").forEach(btn => {
      btn.addEventListener("click", () => {
        if (m.locked || live.finished) return;
        const i = +btn.dataset.i;
        const t = m.tiles[i];
        if (t.status === "matched") return;
        if (m.sel === i) { t.status = "open"; m.sel = null; refresh(); return; }
        if (m.sel == null) { t.status = "selected"; m.sel = i; refresh(); return; }
        const a = m.tiles[m.sel];
        const b = t;
        if (a.pair === b.pair && a.side !== b.side) {
          a.status = "matched"; b.status = "matched";
          m.sel = null; m.solved += 1;
          live.totalScore += 15;
          sfx("correct");
          refresh();
          if (m.solved === m.n) {
            const perfect = m.mistakes === 0;
            if (perfect) live.totalScore += 30;
            setT(() => {
              if (live.level >= 3) return endMatch();
              live.level += 1;
              live.m = makeMatchRound(live.level);
              runMatch();
            }, 600);
          }
        } else {
          b.status = "wrong"; a.status = "wrong"; m.locked = true;
          m.mistakes += 1;
          live.totalScore = Math.max(0, live.totalScore - 3);
          sfx("wrong");
          refresh();
          setT(() => {
            a.status = "open"; b.status = "open"; m.sel = null; m.locked = false;
            refresh();
          }, 650);
        }
      });
    });
    body().querySelector("#match-quit").addEventListener("click", endMatch);
    function endMatch() {
      if (live.finished) return;
      live.finished = true;
      const score = live.totalScore | 0;
      renderResults({
        gameKey: "match",
        title: "Memory Match",
        score,
        perfect: live.level >= 3 && m.mistakes === 0,
        rupees: 30 + score,
        power:  20 + score * 2,
        breakdown: [`Levels cleared: ${live.level - (live.finished ? 1 : 0) + (m.solved === m.n ? 1 : 0)}`],
      });
    }
  }

  // ============================================================
  // GAME 3 — SPEED SPRINT
  // ============================================================
  const SPEED_BANKS = [
    { title: "Math Facts", seconds: 7, qs: [
      { p: "7 × 8 = ?",   c: ["56","54","58","49"], a: "56" },
      { p: "9 × 6 = ?",   c: ["54","56","48","45"], a: "54" },
      { p: "12 + 19 = ?", c: ["31","29","32","30"], a: "31" },
      { p: "45 − 17 = ?", c: ["28","27","29","30"], a: "28" },
      { p: "72 ÷ 8 = ?",  c: ["9","8","7","6"], a: "9" },
      { p: "11 × 11 = ?", c: ["121","111","112","132"], a: "121" },
      { p: "100 − 37 = ?",c: ["63","73","57","67"], a: "63" },
      { p: "½ of 60 = ?", c: ["30","20","40","25"], a: "30" },
      { p: "√64 = ?",     c: ["8","7","9","6"], a: "8" },
      { p: "13 + 28 = ?", c: ["41","39","42","40"], a: "41" },
    ]},
    { title: "Opposites", seconds: 6, qs: [
      { p: "Opposite of HOT?",   c: ["cold","warm","cool","ice"], a: "cold" },
      { p: "Opposite of HAPPY?", c: ["sad","glad","angry","tired"], a: "sad" },
      { p: "Opposite of FAST?",  c: ["slow","quick","late","stop"], a: "slow" },
      { p: "Opposite of BIG?",   c: ["small","tall","huge","long"], a: "small" },
      { p: "Opposite of UP?",    c: ["down","over","near","off"], a: "down" },
      { p: "Opposite of FULL?",  c: ["empty","half","none","light"], a: "empty" },
      { p: "Opposite of LIGHT?", c: ["dark","bright","heavy","soft"], a: "dark" },
      { p: "Opposite of EARLY?", c: ["late","soon","quick","slow"], a: "late" },
      { p: "Opposite of YES?",   c: ["no","ok","sure","maybe"], a: "no" },
      { p: "Opposite of WET?",   c: ["dry","damp","cold","clean"], a: "dry" },
    ]},
    { title: "Punjabi Words", seconds: 8, qs: [
      { p: "ਘਰ means?",   c: ["house","dog","water","food"], a: "house" },
      { p: "ਪਾਣੀ means?", c: ["water","milk","fire","tea"], a: "water" },
      { p: "ਮਾਂ means?",  c: ["mother","father","sister","brother"], a: "mother" },
      { p: "ਕੁੱਤਾ means?", c: ["dog","cat","cow","bird"], a: "dog" },
      { p: "ਰੋਟੀ means?",  c: ["bread","rice","sweet","fish"], a: "bread" },
      { p: "ਸਕੂਲ means?", c: ["school","park","shop","temple"], a: "school" },
      { p: "ਦੋਸਤ means?", c: ["friend","family","teacher","stranger"], a: "friend" },
      { p: "ਚਾਹ means?",  c: ["tea","milk","water","juice"], a: "tea" },
      { p: "ਪਿਤਾ means?", c: ["father","uncle","brother","grandpa"], a: "father" },
      { p: "ਬੱਚਾ means?",  c: ["child","baby","boy","girl"], a: "child" },
    ]},
    { title: "Number Sense", seconds: 7, qs: [
      { p: "Which is PRIME?",     c: ["13","15","21","9"], a: "13" },
      { p: "Which is EVEN?",      c: ["18","17","21","9"], a: "18" },
      { p: "Largest of these?",   c: ["456","465","564","546"], a: "564" },
      { p: "Smallest of these?",  c: ["812","821","182","218"], a: "182" },
      { p: "Tens digit of 5,238?",c: ["3","2","5","8"], a: "3" },
      { p: "Round 47 to nearest 10?", c: ["50","40","45","60"], a: "50" },
      { p: "Half of 90?",         c: ["45","40","50","30"], a: "45" },
      { p: "Double 35?",          c: ["70","75","65","60"], a: "70" },
      { p: "1/4 of 80?",          c: ["20","25","16","30"], a: "20" },
      { p: "Which is a multiple of 7?", c: ["63","58","52","69"], a: "63" },
    ]},
  ];
  function runSpeed() {
    if (!live) {
      const bank = pick(SPEED_BANKS);
      live = {
        bank, qIdx: 0, score: 0, started: false, finished: false,
        answered: false, qs: shuffle(bank.qs).slice(0, 8),
      };
    }
    if (live.finished) return endSpeed();
    setTitle(`⚡ Speed Sprint · ${live.bank.title}`);
    if (!live.started) {
      body().innerHTML = `
        <div class="games-results">
          <div class="games-results-emoji">⚡</div>
          <h2 class="games-results-title">${esc(live.bank.title)}</h2>
          <div class="games-results-score">${live.qs.length} questions · <b>${live.bank.seconds}s each</b></div>
          <p class="games-blurb">Answer fast. Wrong or no answer = no points.</p>
          <div class="games-actions">
            <button class="games-btn-primary" id="speed-go">⚡ START</button>
            <button class="games-btn-ghost" id="speed-cancel">⬅ Back</button>
          </div>
        </div>`;
      body().querySelector("#speed-go").addEventListener("click", () => {
        sfx("click");
        live.started = true;
        runSpeed();
      });
      body().querySelector("#speed-cancel").addEventListener("click", () => go("home"));
      return;
    }
    const q = live.qs[live.qIdx];
    const total = live.qs.length;
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill">Q ${live.qIdx + 1}/${total}</div>
        <div class="games-hud-pill">⭐ ${live.score}</div>
      </div>
      <div class="games-speed-bar"><div class="games-speed-fill" id="speed-fill"></div></div>
      <div class="games-rule">${esc(q.p)}</div>
      <div class="games-choices">
        ${shuffle(q.c).map(ch => `<button class="games-choice" data-c="${esc(ch)}">${esc(ch)}</button>`).join("")}
      </div>
      <div class="games-status" id="speed-status">&nbsp;</div>
    `;
    const fill = body().querySelector("#speed-fill");
    if (fill) {
      fill.style.transition = "none";
      fill.style.width = "100%";
      // Force reflow then start the animation.
      void fill.offsetWidth;
      fill.style.transition = `width ${live.bank.seconds}s linear`;
      fill.style.width = "0%";
    }
    let answered = false;
    const startTs = Date.now();
    function nextQ(wasCorrect) {
      if (live.finished) return;
      if (wasCorrect) live.score += 1;
      live.qIdx += 1;
      if (live.qIdx >= total) { live.finished = true; return endSpeed(); }
      runSpeed();
    }
    body().querySelectorAll(".games-choice").forEach(b => {
      b.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const correct = b.dataset.c === q.a;
        if (correct) { b.classList.add("good"); sfx("correct"); }
        else {
          b.classList.add("bad"); sfx("wrong");
          body().querySelectorAll(".games-choice").forEach(x => {
            if (x.dataset.c === q.a) x.classList.add("good");
          });
        }
        setT(() => nextQ(correct), 450);
      });
    });
    setT(() => {
      if (answered || live.finished) return;
      answered = true;
      body().querySelectorAll(".games-choice").forEach(x => {
        if (x.dataset.c === q.a) x.classList.add("good");
      });
      const st = body().querySelector("#speed-status");
      if (st) st.textContent = `⏰ Time! Answer was ${q.a}`;
      sfx("wrong");
      setT(() => nextQ(false), 600);
    }, live.bank.seconds * 1000);
  }
  function endSpeed() {
    const score = live.score | 0;
    const total = live.qs.length;
    const perfect = score === total;
    renderResults({
      gameKey: "speed",
      title: "Speed Sprint",
      score,
      perfect,
      rupees: 25 + score * 12,
      power:  20 + score * 18 + (perfect ? 100 : 0),
      breakdown: [`${score}/${total} correct`, `Bank: ${live.bank.title}`],
    });
  }

  // ============================================================
  // GAME 4 — WORD RAIN ☔
  // Words fall from top; tap matching ones; miss a target = life lost.
  // ============================================================
  function runRain() {
    if (!live) {
      const r = pick(TAP_RULES);
      live = {
        rule: r, lives: 3, score: 0, missed: 0, caught: 0,
        spawnInterval: 1100, startTs: Date.now(), endsAt: Date.now() + 60000,
        sprites: [], nextSpawn: 0, finished: false,
      };
    }
    setTitle(`☔ Word Rain · ${live.rule.rule}`);
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill">❤️ ${"🟧".repeat(Math.max(0,live.lives))}${"⬛".repeat(Math.max(0,3 - live.lives))}</div>
        <div class="games-hud-pill">⭐ ${live.score}</div>
        <div class="games-hud-pill" id="rain-time">⏱ 60</div>
      </div>
      <div class="games-rule">${esc(live.rule.rule)}</div>
      <div class="games-arena" id="rain-arena"></div>
      <div class="games-actions">
        <button class="games-btn-ghost" id="rain-quit">🏁 End</button>
      </div>
    `;
    const arena = body().querySelector("#rain-arena");
    body().querySelector("#rain-quit").addEventListener("click", endRain);

    function spawn() {
      const targetChance = 0.55;
      const wantTarget = Math.random() < targetChance;
      const word = wantTarget ? pick(live.rule.ok) : pick(live.rule.no);
      const isTarget = !!live.rule.ok.includes(word);
      const el = document.createElement("button");
      el.className = "games-rain-word" + (isTarget ? " is-target" : "");
      el.textContent = word;
      el.style.left = (5 + Math.random() * 80) + "%";
      el.style.top = "-40px";
      el.dataset.target = isTarget ? "1" : "0";
      arena.appendChild(el);
      const sprite = {
        el, isTarget,
        y: -40,
        vy: rand(70, 130) + Math.min(80, (Date.now() - live.startTs) / 1000 * 1.5),
        clicked: false,
      };
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sprite.clicked || live.finished) return;
        sprite.clicked = true;
        if (sprite.isTarget) {
          live.score += 12;
          live.caught += 1;
          el.classList.add("good");
          sfx("correct");
        } else {
          live.lives -= 1;
          live.score = Math.max(0, live.score - 5);
          el.classList.add("bad");
          sfx("wrong");
        }
        setT(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 220);
      });
      live.sprites.push(sprite);
    }

    let last = performance.now();
    function loop(now) {
      if (live.finished) return;
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      const ah = arena.clientHeight || 1;
      // Spawn
      live.nextSpawn -= (now - (live._lastNow || now));
      live._lastNow = now;
      if (live.nextSpawn <= 0) {
        spawn();
        // Tighten spawn interval over time (down to 500ms).
        const elapsed = (Date.now() - live.startTs) / 1000;
        live.nextSpawn = Math.max(450, live.spawnInterval - elapsed * 8);
      }
      // Move sprites
      for (const s of live.sprites) {
        if (s.clicked) continue;
        s.y += s.vy * dt;
        s.el.style.transform = `translateY(${s.y}px)`;
        if (s.y > ah) {
          s.clicked = true;
          if (s.isTarget) {
            live.lives -= 1;
            live.missed += 1;
            sfx("wrong");
          }
          if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
        }
      }
      live.sprites = live.sprites.filter(s => !s.clicked || s.el.parentNode);
      // HUD
      const remaining = Math.max(0, Math.ceil((live.endsAt - Date.now()) / 1000));
      const tEl = body().querySelector("#rain-time");
      if (tEl) tEl.textContent = "⏱ " + remaining;
      const heartEl = body().querySelector(".games-hud-row .games-hud-pill");
      if (heartEl) heartEl.textContent = "❤️ " + "🟧".repeat(Math.max(0, live.lives)) + "⬛".repeat(Math.max(0, 3 - live.lives));
      const scoreEl = body().querySelectorAll(".games-hud-row .games-hud-pill")[1];
      if (scoreEl) scoreEl.textContent = "⭐ " + live.score;

      if (live.lives <= 0 || Date.now() >= live.endsAt) return endRain();
      _raf = requestAnimationFrame(loop);
    }
    _raf = requestAnimationFrame(loop);

    function endRain() {
      if (live.finished) return;
      live.finished = true;
      clearTimers();
      // Cleanup remaining DOM sprites.
      const arenaEl = document.getElementById("rain-arena");
      if (arenaEl) arenaEl.innerHTML = "";
      const score = live.score | 0;
      renderResults({
        gameKey: "rain",
        title: "Word Rain",
        score,
        perfect: live.lives === 3 && live.missed === 0 && live.caught >= 8,
        rupees: 30 + score,
        power:  20 + score * 2,
        breakdown: [`Caught: ${live.caught}`, `Missed: ${live.missed}`, `Lives left: ${Math.max(0,live.lives)}`],
      });
    }
  }

  // ============================================================
  // GAME 5 — REACTION GRID 🎯
  // 4×4 grid; one tile lights, tap before it fades.
  // ============================================================
  function runReaction() {
    if (!live) {
      live = {
        score: 0, combo: 0, bestCombo: 0, lives: 3,
        timer: 850, hits: 0, misses: 0, finished: false,
        active: -1, expireAt: 0,
      };
    }
    setTitle(`🎯 Reaction Grid`);
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill" id="rxn-life">❤️ ${"🟧".repeat(live.lives)}${"⬛".repeat(3-live.lives)}</div>
        <div class="games-hud-pill" id="rxn-score">⭐ ${live.score}</div>
        <div class="games-hud-pill" id="rxn-combo">🔥 ${live.combo}x</div>
      </div>
      <div class="games-rule">Tap the glowing tile FAST!</div>
      <div class="games-rxn-grid" id="rxn-grid">
        ${Array.from({length: 16}).map((_,i) => `<button class="games-rxn-tile" data-i="${i}"></button>`).join("")}
      </div>
      <div class="games-actions">
        <button class="games-btn-ghost" id="rxn-quit">🏁 End</button>
      </div>
    `;
    const tiles = body().querySelectorAll(".games-rxn-tile");
    body().querySelector("#rxn-quit").addEventListener("click", endRxn);

    function lightUp() {
      if (live.finished) return;
      const i = randi(0, 15);
      live.active = i;
      live.expireAt = Date.now() + live.timer;
      tiles.forEach(t => t.classList.remove("lit"));
      tiles[i].classList.add("lit");
    }
    function refreshHud() {
      const lifeEl = body().querySelector("#rxn-life");
      if (lifeEl) lifeEl.textContent = "❤️ " + "🟧".repeat(Math.max(0,live.lives)) + "⬛".repeat(Math.max(0,3-live.lives));
      const sEl = body().querySelector("#rxn-score");
      if (sEl) sEl.textContent = "⭐ " + live.score;
      const cEl = body().querySelector("#rxn-combo");
      if (cEl) cEl.textContent = "🔥 " + live.combo + "x";
    }
    tiles.forEach((t, i) => {
      t.addEventListener("click", () => {
        if (live.finished) return;
        if (i === live.active) {
          const elapsed = live.timer - (live.expireAt - Date.now());
          const speedBonus = Math.max(1, Math.round((live.timer - elapsed) / 50));
          live.score += 5 + speedBonus + Math.floor(live.combo / 3);
          live.combo += 1;
          if (live.combo > live.bestCombo) live.bestCombo = live.combo;
          live.hits += 1;
          live.timer = Math.max(280, live.timer - 18);
          tiles[i].classList.remove("lit");
          tiles[i].classList.add("flash-good");
          setT(() => tiles[i].classList.remove("flash-good"), 140);
          sfx("correct");
          refreshHud();
          lightUp();
        } else {
          live.lives -= 1;
          live.combo = 0;
          live.misses += 1;
          live.score = Math.max(0, live.score - 4);
          tiles[i].classList.add("flash-bad");
          setT(() => tiles[i].classList.remove("flash-bad"), 160);
          sfx("wrong");
          refreshHud();
          if (live.lives <= 0) endRxn();
        }
      });
    });
    // Spawn loop checks expiry frequently (30fps is plenty).
    setI(() => {
      if (live.finished) return;
      if (Date.now() >= live.expireAt) {
        // Player let it expire.
        live.lives -= 1;
        live.combo = 0;
        live.misses += 1;
        if (live.active >= 0) tiles[live.active].classList.remove("lit");
        sfx("wrong");
        refreshHud();
        if (live.lives <= 0) return endRxn();
        lightUp();
      }
    }, 60);
    lightUp();

    function endRxn() {
      if (live.finished) return;
      live.finished = true;
      clearTimers();
      tiles.forEach(t => t.classList.remove("lit","flash-good","flash-bad"));
      const score = live.score | 0;
      renderResults({
        gameKey: "reaction",
        title: "Reaction Grid",
        score,
        perfect: live.lives === 3 && live.hits >= 25,
        rupees: 25 + score,
        power:  15 + score * 2,
        breakdown: [`Hits: ${live.hits}`, `Misses: ${live.misses}`, `Best combo: ${live.bestCombo}x`],
      });
    }
  }

  // ============================================================
  // GAME 6 — MATH ASTEROIDS ☄️
  // Target equation fixed; tap floating expressions that match.
  // ============================================================
  function makeExpr(target, isMatch) {
    // Build an expression that evaluates to `target` when isMatch, else not.
    const ops = ["+","−","×"];
    let p, q, op;
    if (isMatch) {
      // Pick a decomposition.
      op = pick(ops);
      if (op === "+") { p = randi(1, target); q = target - p; }
      else if (op === "−") { p = target + randi(1, 12); q = p - target; }
      else { // × — choose factors of target if possible
        const factors = [];
        for (let i = 1; i <= target; i++) if (target % i === 0) factors.push(i);
        if (factors.length >= 2) {
          p = pick(factors); q = target / p;
        } else { // fall back to addition
          op = "+"; p = randi(1, target); q = target - p;
        }
      }
    } else {
      let v;
      do {
        op = pick(ops);
        if (op === "+") { p = randi(1, 20); q = randi(1, 20); v = p + q; }
        else if (op === "−") { p = randi(2, 30); q = randi(1, p); v = p - q; }
        else { p = randi(1, 12); q = randi(1, 12); v = p * q; }
      } while (v === target);
    }
    return `${p}${op}${q}`;
  }
  function runAsteroids() {
    if (!live) {
      const target = randi(8, 36);
      live = {
        target, score: 0, lives: 3, hits: 0, misses: 0, leaks: 0,
        startTs: Date.now(), endsAt: Date.now() + 60000,
        sprites: [], nextSpawn: 0, finished: false,
      };
    }
    setTitle(`☄️ Math Asteroids`);
    body().innerHTML = `
      <div class="games-hud-row">
        <div class="games-hud-pill" id="ast-life">❤️ ${"🟧".repeat(live.lives)}${"⬛".repeat(3-live.lives)}</div>
        <div class="games-hud-pill" id="ast-score">⭐ ${live.score}</div>
        <div class="games-hud-pill" id="ast-time">⏱ 60</div>
      </div>
      <div class="games-rule">🎯 Target = <b>${live.target}</b> · tap matching rocks!</div>
      <div class="games-arena" id="ast-arena"></div>
      <div class="games-actions">
        <button class="games-btn-ghost" id="ast-quit">🏁 End</button>
      </div>
    `;
    const arena = body().querySelector("#ast-arena");
    body().querySelector("#ast-quit").addEventListener("click", endAst);

    function spawn() {
      const isMatch = Math.random() < 0.45;
      const expr = makeExpr(live.target, isMatch);
      const el = document.createElement("button");
      el.className = "games-asteroid" + (isMatch ? " is-match" : "");
      el.textContent = expr;
      el.style.top = (10 + Math.random() * 70) + "%";
      el.style.left = "-90px";
      el.dataset.match = isMatch ? "1" : "0";
      arena.appendChild(el);
      const sprite = {
        el, isMatch,
        x: -90,
        vx: rand(50, 110) + Math.min(70, (Date.now() - live.startTs) / 1000),
        clicked: false,
      };
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sprite.clicked || live.finished) return;
        sprite.clicked = true;
        if (sprite.isMatch) {
          live.score += 15; live.hits += 1;
          el.classList.add("boom");
          sfx("correct");
        } else {
          live.lives -= 1; live.misses += 1;
          live.score = Math.max(0, live.score - 6);
          el.classList.add("bad");
          sfx("wrong");
        }
        setT(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 240);
      });
      live.sprites.push(sprite);
    }

    let last = performance.now();
    function loop(now) {
      if (live.finished) return;
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      const aw = arena.clientWidth || 1;
      live.nextSpawn -= (now - (live._lastNow || now));
      live._lastNow = now;
      if (live.nextSpawn <= 0) {
        spawn();
        const elapsed = (Date.now() - live.startTs) / 1000;
        live.nextSpawn = Math.max(550, 1300 - elapsed * 12);
      }
      for (const s of live.sprites) {
        if (s.clicked) continue;
        s.x += s.vx * dt;
        s.el.style.transform = `translateX(${s.x}px)`;
        if (s.x > aw + 90) {
          s.clicked = true;
          if (s.isMatch) {
            live.lives -= 1; live.leaks += 1;
            sfx("wrong");
          }
          if (s.el.parentNode) s.el.parentNode.removeChild(s.el);
        }
      }
      live.sprites = live.sprites.filter(s => !s.clicked || s.el.parentNode);

      const lifeEl = body().querySelector("#ast-life");
      if (lifeEl) lifeEl.textContent = "❤️ " + "🟧".repeat(Math.max(0,live.lives)) + "⬛".repeat(Math.max(0,3-live.lives));
      const sEl = body().querySelector("#ast-score");
      if (sEl) sEl.textContent = "⭐ " + live.score;
      const tEl = body().querySelector("#ast-time");
      if (tEl) tEl.textContent = "⏱ " + Math.max(0, Math.ceil((live.endsAt - Date.now()) / 1000));

      if (live.lives <= 0 || Date.now() >= live.endsAt) return endAst();
      _raf = requestAnimationFrame(loop);
    }
    _raf = requestAnimationFrame(loop);

    function endAst() {
      if (live.finished) return;
      live.finished = true;
      clearTimers();
      const arenaEl = document.getElementById("ast-arena");
      if (arenaEl) arenaEl.innerHTML = "";
      const score = live.score | 0;
      renderResults({
        gameKey: "asteroids",
        title: "Math Asteroids",
        score,
        perfect: live.lives === 3 && live.leaks === 0 && live.hits >= 8,
        rupees: 30 + score,
        power:  20 + score * 2,
        breakdown: [`Hits: ${live.hits}`, `Wrong taps: ${live.misses}`, `Leaks: ${live.leaks}`],
      });
    }
  }

  // ===== PUBLIC API =====
  function openGamesHub() {
    if (state.open) return;
    state.open = true;
    state.childId = getChildId();
    buildOverlay();
    document.body.classList.add("games-open");
    go("home");
  }
  function closeGamesHub() {
    state.open = false;
    clearTimers();
    document.body.classList.remove("games-open");
    document.removeEventListener("keydown", onKey);
    const el = document.getElementById(CONFIG.overlayId);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    live = null;
    state.screen = "home";
  }

  window.openGamesHub  = openGamesHub;
  window.closeGamesHub = closeGamesHub;
  window.__games = { CONFIG, state, GAMES };
})();
