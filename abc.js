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

  // Level 1 letter set with phoneme + speakable form for SpeechSynthesis.
  // `speak` is what we send to the TTS engine to approximate the phoneme.
  const LETTERS = {
    m: { phoneme: "/m/", speak: "mmm" },
    s: { phoneme: "/s/", speak: "sss" },
    t: { phoneme: "/t/", speak: "tuh" },
    p: { phoneme: "/p/", speak: "puh" },
    a: { phoneme: "/\u0103/", speak: "ah" }   // short a as in apple
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

  const LEVELS = [
    {
      id: "L1",
      title: "Level 1: First Sounds",
      letters: ["m", "s", "t", "p", "a"],
      words: WORDS,
      sentences: SENTENCES
    }
    // To extend: add { id:"L2", letters:[...,"n","i"], words:[...], sentences:[...] }
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
    body.innerHTML = `
      <section class="abc-reward-screen">
        <h3 class="abc-h3">You completed today's ladder.</h3>
        <div class="abc-reward-big">\u2B50 +1 Sound Star</div>
        <div class="abc-stats">
          <div>Score: <strong>${score}/${CONFIG.stepsPerRound}</strong></div>
          <div>Total stars: <strong>${p.stars || 0}</strong></div>
        </div>
        <div class="abc-level-actions">
          <button class="abc-cta primary" id="abc-play-again">\u25B6 Play Again</button>
          <button class="abc-cta" id="abc-home">\uD83C\uDFE0 Home</button>
          <button class="abc-cta" id="abc-see-parent">\uD83D\uDC64 Parent Mode</button>
        </div>
      </section>
    `;
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
