(() => {
  const app = document.getElementById("app");
  const starsEl = document.getElementById("stars");
  const zeniEl = document.getElementById("zeni");
  const powerFill = document.getElementById("power-fill");
  const powerLevel = document.getElementById("power-level");
  const rankLabel = document.getElementById("rank-label");
  const modeBtns = document.querySelectorAll(".mode-btn");

  // ===== Constants =====
  const SUPER_SAIYAN = 1_000_000;
  const POWER_PER_CORRECT_BASE = 80;
  const POWER_PER_WRONG = 5;
  const POWER_STREAK_BONUS = 5;
  const REVIEW_PROBABILITY = 0.45;     // when queue is non-empty, ~45% chance the next question is a review
  const REVIEW_QUEUE_MAX = 60;
  const REVIEW_KEY = "vtk_review_v1";

  const RANKS = [
    { min: 0,         name: "🌍 EARTHLING" },
    { min: 1_000,     name: "🥋 Z FIGHTER" },
    { min: 9_000,     name: "💥 OVER 9000!" },
    { min: 25_000,    name: "🔥 ELITE FIGHTER" },
    { min: 75_000,    name: "🟠 SAIYAN" },
    { min: 200_000,   name: "✨ SUPER SAIYAN TRAINEE" },
    { min: 500_000,   name: "💛 ASCENDED WARRIOR" },
    { min: 1_000_000, name: "🌟 SUPER SAIYAN" }
  ];
  function rankFor(power) {
    let r = RANKS[0];
    for (const cur of RANKS) if (power >= cur.min) r = cur;
    return r;
  }

  const HYPES = [
    "OVER 9000! 💥","KAMEHAMEHA! 🌊⚡","SUPER SAIYAN! 💛","POWER UP! 🔥",
    "FINAL FLASH! ✨","GALICK GUN! 💜","SPIRIT BOMB! 🌟","INSTANT TRANSMISSION! ⚡"
  ];
  const FAILS = [
    "Almost! Train harder, young warrior!",
    "Not quite — power up and try again!",
    "Senzu bean time! Keep going!",
    "A true Saiyan never gives up!"
  ];

  // ===== Persistent state =====
  const legacyStars = Number(localStorage.getItem("vtk_stars") || 0);
  const savedBalls = localStorage.getItem("vtk_balls");
  const startingBalls = savedBalls !== null
    ? Math.min(7, Number(savedBalls))
    : Math.min(7, legacyStars);

  let savedReview = [];
  try { savedReview = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]"); } catch (_) {}

  const state = {
    mode: "learn",
    learnIndex: Number(localStorage.getItem("vtk_learn_idx") || 0),
    learnFilter: localStorage.getItem("vtk_learn_filter") || "all", // all|verb|grammar|noun|vocab
    quizFilter: localStorage.getItem("vtk_quiz_filter") || "all",   // all|verb|noun|grammar|vocab|sentence|math
    learnDeck: [],
    balls: startingBalls,
    zeni: Number(localStorage.getItem("vtk_zeni") || 0),
    power: Number(localStorage.getItem("vtk_power") || 0),
    streak: 0,
    quiz: null,
    reviewQueue: Array.isArray(savedReview) ? savedReview : [],
    // session-only stats (reset on reload)
    sessCorrect: 0,
    sessWrong: 0,
    sessBest: 0
  };

  // ===== UI helpers =====
  starsEl.textContent = state.balls;
  zeniEl.textContent = state.zeni.toLocaleString();
  updatePower();
  updateSessionStats();

  function updateSessionStats() {
    const c = document.getElementById("stat-correct");
    const w = document.getElementById("stat-wrong");
    const b = document.getElementById("stat-best");
    if (c) c.textContent = state.sessCorrect;
    if (w) w.textContent = state.sessWrong;
    if (b) b.textContent = state.sessBest;
  }

  function updatePower() {
    powerLevel.textContent = state.power.toLocaleString();
    const pct = Math.min(100, (state.power / SUPER_SAIYAN) * 100);
    powerFill.style.width = pct + "%";
    rankLabel.textContent = rankFor(state.power).name;
    powerFill.classList.toggle("super-saiyan", state.power >= SUPER_SAIYAN);
  }
  function addPower(n) {
    const before = rankFor(state.power).name;
    state.power += n;
    localStorage.setItem("vtk_power", state.power);
    updatePower();
    const after = rankFor(state.power).name;
    if (after !== before) rankToast(`RANK UP! ${after}`);
  }
  function setZeni(n) {
    state.zeni = Math.max(0, n);
    zeniEl.textContent = state.zeni.toLocaleString();
    localStorage.setItem("vtk_zeni", state.zeni);
  }
  function setBalls(n) {
    state.balls = Math.min(7, Math.max(0, n));
    starsEl.textContent = state.balls;
    localStorage.setItem("vtk_balls", state.balls);
  }
  function persistReview() {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(state.reviewQueue));
  }
  function maybeAwardDragonBall() {
    if (state.balls >= 7) return false;
    const streakBoost = Math.min(0.01, state.streak * 0.0005);
    if (Math.random() < 0.0167 + streakBoost) {
      setBalls(state.balls + 1);
      return true;
    }
    return false;
  }
  function flash() {
    const f = document.createElement("div");
    f.className = "kame-flash";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
  }
  function dragonBallToast() {
    const t = document.createElement("div");
    t.className = "ball-toast";
    t.innerHTML = state.balls >= 7
      ? "🐉 ALL 7 DRAGON BALLS! Make a wish! ⭐"
      : `🐉 RARE! You found a Dragon Ball! (${state.balls}/7)`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }
  function rankToast(text) {
    const t = document.createElement("div");
    t.className = "ball-toast rank";
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  function setMode(mode) {
    state.mode = mode;
    modeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    render();
  }
  modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // ===== Generic helpers =====
  function pickRandom(arr, n, exclude) {
    const pool = arr.filter(x => x !== exclude);
    const out = [];
    while (out.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function stripPunctuation(s) { return s.replace(/[.,!?;:"']/g, ""); }

  // ===== TRAIN (Learn) =====
  // Build deck based on filter
  function buildLearnDeck() {
    const f = state.learnFilter;
    const verbCards    = VERBS.map(v => ({ kind: "verb", data: v }));
    const grammarCards = GRAMMAR.map(g => ({ kind: "grammar", data: g }));
    const nounCards    = NOUNS.map(n => ({ kind: "noun", data: n }));
    const vocabCards   = (typeof VOCAB !== "undefined" ? VOCAB : []).map(w => ({ kind: "vocab", data: w }));
    if (f === "verb")    state.learnDeck = verbCards;
    else if (f === "grammar") state.learnDeck = grammarCards;
    else if (f === "noun")    state.learnDeck = nounCards;
    else if (f === "vocab")   state.learnDeck = vocabCards;
    else state.learnDeck = verbCards.concat(grammarCards, nounCards, vocabCards);

    if (state.learnIndex >= state.learnDeck.length) state.learnIndex = 0;
  }

  function persistLearnPos() {
    localStorage.setItem("vtk_learn_idx", state.learnIndex);
    localStorage.setItem("vtk_learn_filter", state.learnFilter);
  }

  function setLearnFilter(f) {
    state.learnFilter = f;
    state.learnIndex = 0;
    buildLearnDeck();
    persistLearnPos();
    renderLearn();
  }

  function jumpRandom() {
    if (!state.learnDeck.length) return;
    state.learnIndex = Math.floor(Math.random() * state.learnDeck.length);
    persistLearnPos();
    renderLearn();
  }

  function renderLearn() {
    if (!state.learnDeck.length) buildLearnDeck();
    const card = state.learnDeck[state.learnIndex] || state.learnDeck[0];

    let body = "";
    if (card.kind === "verb") {
      const v = card.data;
      body = `
        <div class="aura"><div class="emoji-big">${v.emoji}</div></div>
        <div class="verb-base">${v.base}</div>
        <div class="def-row">
          <div class="def-pill">📖 <b>Meaning:</b> ${v.def}</div>
          <div class="def-pill pa">ਪੰਜਾਬੀ: <b>${v.pa}</b></div>
        </div>
        <div class="tense-row">
          <div class="tense past"><h3>⏪ PAST</h3><p>${v.past}</p></div>
          <div class="tense present"><h3>▶️ NOW</h3><p>${v.base}</p></div>
          <div class="tense future"><h3>⏩ FUTURE</h3><p>${v.future}</p></div>
        </div>
        <div class="example">
          <div>⏪ <i>${v.ex.past}</i></div>
          <div>▶️ <i>${v.ex.present}</i></div>
          <div>⏩ <i>${v.ex.future}</i></div>
        </div>`;
    } else if (card.kind === "grammar") {
      const g = card.data;
      body = `
        <div class="aura"><div class="emoji-big">📘</div></div>
        <div class="verb-base">${g.term}</div>
        <div class="def-row">
          <div class="def-pill">📖 <b>Meaning:</b> ${g.def}</div>
          <div class="def-pill pa">ਪੰਜਾਬੀ: <b>${g.pa}</b></div>
        </div>
        <div class="example">
          <div><b>Examples:</b></div>
          ${g.examples.map(e => `<div>• <i>${e}</i></div>`).join("")}
        </div>`;
    } else if (card.kind === "noun") {
      const n = card.data;
      body = `
        <div class="aura"><div class="emoji-big">${n.emoji}</div></div>
        <div class="verb-base">${n.word}</div>
        <div class="def-row">
          <div class="def-pill">📖 <b>Meaning:</b> ${n.def}</div>
          <div class="def-pill pa">ਪੰਜਾਬੀ: <b>${n.pa}</b></div>
        </div>
        <div class="example"><div>This word is a <b>noun</b> — a person, place, or thing.</div></div>`;
    } else { // vocab
      const w = card.data;
      body = `
        <div class="aura"><div class="emoji-big">${w.emoji}</div></div>
        <div class="verb-base">${w.word}</div>
        <div class="def-row">
          <div class="def-pill">📖 <b>Meaning:</b> ${w.def}</div>
          <div class="def-pill pa">ਪੰਜਾਬੀ: <b>${w.pa}</b></div>
        </div>
        <div class="example"><div>Type: <b>${w.type}</b></div></div>`;
    }

    const filter = state.learnFilter;
    const total = state.learnDeck.length;
    const reviewBadge = state.reviewQueue.length
      ? `<div class="review-pill" title="Words flagged for review">🔁 Review queue: ${state.reviewQueue.length}</div>` : "";

    app.innerHTML = `
      <div class="learn-nav">
        <div class="filter-row">
          ${["all","verb","grammar","noun","vocab"].map(k => `
            <button class="filter-btn ${filter === k ? "active" : ""}" data-f="${k}">${
              k === "all" ? "🌐 All" :
              k === "verb" ? "🏃 Verbs" :
              k === "grammar" ? "📘 Grammar" :
              k === "noun" ? "🧱 Nouns" : "💬 Words"
            }</button>
          `).join("")}
        </div>
        <div class="jump-row">
          <button id="rand-btn" class="jump-btn">🎲 Random</button>
          <label class="jump-label">Jump to
            <select id="jump-sel">
              ${state.learnDeck.map((c, i) => {
                const t = c.kind === "verb" ? c.data.base
                        : c.kind === "grammar" ? c.data.term
                        : c.kind === "noun" ? c.data.word
                        : c.data.word;
                return `<option value="${i}" ${i === state.learnIndex ? "selected" : ""}>${i+1}. ${t}</option>`;
              }).join("")}
            </select>
          </label>
        </div>
        ${reviewBadge}
      </div>

      <div class="card ${card.kind === "grammar" ? "grammar-card" : ""}">
        ${body}
        <div class="controls">
          <button id="prev">⬅️ Back</button>
          <div class="progress">${categoryLabel(card.kind)} · Card ${state.learnIndex + 1} / ${total}</div>
          <button id="next">Next ➡️</button>
        </div>
      </div>
    `;

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => setLearnFilter(btn.dataset.f));
    });
    document.getElementById("rand-btn").onclick = jumpRandom;
    document.getElementById("jump-sel").addEventListener("change", (e) => {
      state.learnIndex = Number(e.target.value);
      persistLearnPos();
      renderLearn();
    });
    document.getElementById("prev").onclick = () => {
      state.learnIndex = (state.learnIndex - 1 + total) % total;
      persistLearnPos();
      renderLearn();
    };
    document.getElementById("next").onclick = () => {
      state.learnIndex = (state.learnIndex + 1) % total;
      persistLearnPos();
      renderLearn();
    };
  }

  function categoryLabel(kind) {
    return kind === "verb" ? "🏃 Verb" :
           kind === "grammar" ? "📘 Grammar" :
           kind === "noun" ? "🧱 Noun" : "💬 Word";
  }

  // ===== BATTLE (Quiz) =====
  // Each builder returns { id, prompt, correct, choices, paChoice?, longChoices?, isReview? }
  // The `id` is a stable identifier used for the spaced-repetition queue.

  // Builders, indexed by type name, that can rebuild a question for review.
  const BUILDERS = {
    verbTense: (id) => {
      // id: "verbTense:<base>:<tense>"
      const [, base, tense] = id ? id.split(":") : [];
      const v = base ? VERBS.find(x => x.base === base) || randomVerb() : randomVerb();
      const askTense = tense || pickOne(["past","present","future"]);
      const correct = askTense === "present" ? v.base : v[askTense];
      const tenseLabel = { past: "⏪ PAST", present: "▶️ PRESENT", future: "⏩ FUTURE" }[askTense];
      const distractors = [];
      for (const dv of pickRandom(VERBS, 6, v)) {
        const form = askTense === "present" ? dv.base : dv[askTense];
        if (form !== correct && !distractors.includes(form)) distractors.push(form);
        if (distractors.length === 3) break;
      }
      return {
        id: `verbTense:${v.base}:${askTense}`,
        prompt: `${v.emoji} What is the <b>${tenseLabel}</b> form of <b>${v.base}</b>?`,
        correct, choices: shuffle([correct, ...distractors])
      };
    },

    verbDef: (id) => {
      const v = id ? (VERBS.find(x => x.base === id.split(":")[1]) || randomVerb()) : randomVerb();
      const correct = v.base;
      const distractors = pickRandom(VERBS, 5, v).map(dv => dv.base).filter(b => b !== correct).slice(0,3);
      return { id:`verbDef:${v.base}`, prompt:`📖 Which word means: <i>"${v.def}"</i>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    verbPaToEn: (id) => {
      const v = id ? (VERBS.find(x => x.base === id.split(":")[1]) || randomVerb()) : randomVerb();
      const correct = v.base;
      const distractors = pickRandom(VERBS, 5, v).map(dv => dv.base).filter(b => b !== correct).slice(0,3);
      return { id:`verbPaToEn:${v.base}`, prompt:`ਪੰਜਾਬੀ → English. Which English word means <b class="pa-big">${v.pa}</b>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    verbEnToPa: (id) => {
      const v = id ? (VERBS.find(x => x.base === id.split(":")[1]) || randomVerb()) : randomVerb();
      const correct = v.pa;
      const seen = new Set([correct]);
      const distractors = [];
      for (const dv of pickRandom(VERBS, 6, v)) {
        if (!seen.has(dv.pa)) { distractors.push(dv.pa); seen.add(dv.pa); }
        if (distractors.length === 3) break;
      }
      return { id:`verbEnToPa:${v.base}`, prompt:`English → ਪੰਜਾਬੀ. Which Gurmukhi word means <b>${v.base}</b>?`, correct, choices: shuffle([correct, ...distractors]), paChoice:true };
    },

    nounDef: (id) => {
      const n = id ? (NOUNS.find(x => x.word === id.split(":")[1]) || randomNoun()) : randomNoun();
      const correct = n.word;
      const distractors = pickRandom(NOUNS, 5, n).map(d => d.word).filter(w => w !== correct).slice(0,3);
      return { id:`nounDef:${n.word}`, prompt:`📚 Which noun means: <i>"${n.def}"</i>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    nounPa: (id) => {
      const n = id ? (NOUNS.find(x => x.word === id.split(":")[1]) || randomNoun()) : randomNoun();
      const correct = n.word;
      const distractors = pickRandom(NOUNS, 5, n).map(d => d.word).filter(w => w !== correct).slice(0,3);
      return { id:`nounPa:${n.word}`, prompt:`ਪੰਜਾਬੀ → English. Which word means <b class="pa-big">${n.pa}</b>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    grammarDef: (id) => {
      const g = id ? (GRAMMAR.find(x => x.term === id.split(":")[1]) || randomGrammar()) : randomGrammar();
      const correct = g.def;
      const distractors = pickRandom(GRAMMAR, 5, g).map(x => x.def).filter(d => d !== correct).slice(0,3);
      return { id:`grammarDef:${g.term}`, prompt:`🧠 What is a <b>${g.term}</b>?`, correct, choices: shuffle([correct, ...distractors]), longChoices:true };
    },

    grammarTerm: (id) => {
      const g = id ? (GRAMMAR.find(x => x.term === id.split(":")[1]) || randomGrammar()) : randomGrammar();
      const correct = g.term;
      const distractors = pickRandom(GRAMMAR, 5, g).map(x => x.term).filter(t => t !== correct).slice(0,3);
      return { id:`grammarTerm:${g.term}`, prompt:`📖 Which grammar word means: <i>"${g.def}"</i>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    sentenceVerb: (id) => {
      const s = id ? (SENTENCES.find(x => x.text === decodeURIComponent(id.split(":")[1])) || randomSentence()) : randomSentence();
      const words = stripPunctuation(s.text).split(/\s+/);
      return { id:`sentenceVerb:${encodeURIComponent(s.text)}`, prompt:`🔎 Which word is the <b>verb</b> in:<br><i>"${s.text}"</i>`, correct: words[s.verbIdx], choices: shuffle(words) };
    },

    sentenceNoun: (id) => {
      const s = id ? (SENTENCES.find(x => x.text === decodeURIComponent(id.split(":")[1])) || randomSentence()) : randomSentence();
      const words = stripPunctuation(s.text).split(/\s+/);
      return { id:`sentenceNoun:${encodeURIComponent(s.text)}`, prompt:`🔎 Which word is the <b>noun</b> in:<br><i>"${s.text}"</i>`, correct: words[s.nounIdx], choices: shuffle(words) };
    },

    vocabDef: (id) => {
      const list = (typeof VOCAB !== "undefined") ? VOCAB : [];
      if (!list.length) return BUILDERS.verbDef();
      const w = id ? (list.find(x => x.word === id.split(":")[1]) || pickOne(list)) : pickOne(list);
      const correct = w.word;
      const distractors = pickRandom(list, 5, w).map(d => d.word).filter(x => x !== correct).slice(0,3);
      return { id:`vocabDef:${w.word}`, prompt:`💬 Which word means: <i>"${w.def}"</i>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    vocabPa: (id) => {
      const list = (typeof VOCAB !== "undefined") ? VOCAB : [];
      if (!list.length) return BUILDERS.verbPaToEn();
      const w = id ? (list.find(x => x.word === id.split(":")[1]) || pickOne(list)) : pickOne(list);
      const correct = w.word;
      const distractors = pickRandom(list, 5, w).map(d => d.word).filter(x => x !== correct).slice(0,3);
      return { id:`vocabPa:${w.word}`, prompt:`ਪੰਜਾਬੀ → English. Which word means <b class="pa-big">${w.pa}</b>?`, correct, choices: shuffle([correct, ...distractors]) };
    },

    math: (id) => {
      // id: "math:<a>:<op>:<b>"
      let a, b, op;
      if (id) {
        const [, ax, opx, bx] = id.split(":");
        a = Number(ax); b = Number(bx); op = opx;
      } else {
        op = pickOne(["+","+","+","-","-","×"]);
        if (op === "+")      { a = randInt(1,20); b = randInt(1,20); }
        else if (op === "-") { a = randInt(2,20); b = randInt(1,a); }
        else                 { a = randInt(1,10); b = randInt(1,10); }
      }
      const correct = op === "+" ? a+b : op === "-" ? a-b : a*b;
      // Distractors close to correct
      const candidates = new Set();
      while (candidates.size < 6) candidates.add(correct + randInt(-5,5));
      candidates.delete(correct);
      const distractors = Array.from(candidates).filter(n => n >= 0).slice(0,3);
      while (distractors.length < 3) distractors.push(correct + distractors.length + 1);
      return {
        id: `math:${a}:${op}:${b}`,
        prompt: `🧮 What is <b>${a} ${op} ${b}</b>?`,
        correct: String(correct),
        choices: shuffle([String(correct), ...distractors.map(String)])
      };
    },

    mathWord: (id) => {
      // simple word problems with addition/subtraction
      let a, b, op;
      if (id) {
        const [, ax, opx, bx] = id.split(":");
        a = Number(ax); b = Number(bx); op = opx;
      } else {
        op = pickOne(["+","-"]);
        if (op === "+") { a = randInt(2, 12); b = randInt(2, 10); }
        else            { a = randInt(5, 15); b = randInt(1, a-1); }
      }
      const correct = op === "+" ? a+b : a-b;
      const items = pickOne([
        ["apples","🍎"], ["cookies","🍪"], ["balloons","🎈"],
        ["dragon balls","🐉"], ["coins","💰"], ["stickers","✨"]
      ]);
      const text = op === "+"
        ? `Tom has ${a} ${items[0]} ${items[1]}. He gets ${b} more. How many now?`
        : `Mia had ${a} ${items[0]} ${items[1]}. She gave away ${b}. How many left?`;
      const candidates = new Set();
      while (candidates.size < 6) candidates.add(correct + randInt(-4,4));
      candidates.delete(correct);
      const distractors = Array.from(candidates).filter(n => n >= 0).slice(0,3);
      while (distractors.length < 3) distractors.push(correct + distractors.length + 1);
      return {
        id: `mathWord:${a}:${op}:${b}`,
        prompt: `🧮 ${text}`,
        correct: String(correct),
        choices: shuffle([String(correct), ...distractors.map(String)])
      };
    }
  };

  // Helpers used by builders
  function randomVerb()   { return VERBS[Math.floor(Math.random() * VERBS.length)]; }
  function randomNoun()   { return NOUNS[Math.floor(Math.random() * NOUNS.length)]; }
  function randomGrammar(){ return GRAMMAR[Math.floor(Math.random() * GRAMMAR.length)]; }
  function randomSentence(){ return SENTENCES[Math.floor(Math.random() * SENTENCES.length)]; }
  function pickOne(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  // Random pool of builder names — control variety/weighting here.
  const BUILDER_POOL_ALL = [
    "verbTense","verbTense","verbTense",
    "verbDef","verbDef",
    "verbPaToEn","verbEnToPa",
    "nounDef","nounPa",
    "grammarDef","grammarTerm",
    "sentenceVerb","sentenceNoun",
    "vocabDef","vocabDef","vocabPa",
    "math","math","mathWord"
  ];
  const BUILDER_POOLS = {
    all:      BUILDER_POOL_ALL,
    verb:     ["verbTense","verbTense","verbTense","verbDef","verbDef","verbPaToEn","verbEnToPa"],
    noun:     ["nounDef","nounDef","nounPa"],
    grammar:  ["grammarDef","grammarTerm"],
    vocab:    ["vocabDef","vocabDef","vocabPa"],
    sentence: ["sentenceVerb","sentenceNoun"],
    math:     ["math","math","mathWord","mathWord"]
  };
  const QUIZ_FILTERS = [
    ["all","🌐 All"],
    ["verb","🏃 Verbs"],
    ["noun","🧱 Nouns"],
    ["grammar","📘 Grammar"],
    ["vocab","💬 Words"],
    ["sentence","🔎 Sentences"],
    ["math","🧮 Math"]
  ];

  // ----- Spaced repetition queue -----
  function builderNameFromId(id) {
    return id.split(":")[0];
  }
  function queueWrong(id) {
    // de-duplicate, keep most-recent-missed at the front
    state.reviewQueue = state.reviewQueue.filter(x => x !== id);
    state.reviewQueue.unshift(id);
    if (state.reviewQueue.length > REVIEW_QUEUE_MAX) {
      state.reviewQueue.length = REVIEW_QUEUE_MAX;
    }
    persistReview();
  }
  function dequeueCorrect(id) {
    const before = state.reviewQueue.length;
    state.reviewQueue = state.reviewQueue.filter(x => x !== id);
    if (state.reviewQueue.length !== before) persistReview();
  }

  function pool() { return BUILDER_POOLS[state.quizFilter] || BUILDER_POOL_ALL; }
  function inFilter(builderName) {
    return pool().includes(builderName);
  }

  function newQuizQuestion() {
    let q;
    let isReview = false;
    if (state.reviewQueue.length && Math.random() < REVIEW_PROBABILITY) {
      // Pull a review item that matches current filter (if any)
      const matching = state.reviewQueue.filter(id => inFilter(builderNameFromId(id)));
      if (matching.length) {
        const id = matching[Math.floor(Math.random() * Math.min(5, matching.length))];
        const builderName = builderNameFromId(id);
        const builder = BUILDERS[builderName];
        if (builder) {
          q = builder(id);
          isReview = true;
        }
      }
    }
    if (!q) {
      const name = pickOne(pool());
      q = BUILDERS[name]();
    }
    state.quiz = { ...q, answered: false, isReview };
    renderQuiz();
  }

  function setQuizFilter(f) {
    state.quizFilter = f;
    localStorage.setItem("vtk_quiz_filter", f);
    state.quiz = null;
    newQuizQuestion();
  }

  function renderQuiz() {
    const q = state.quiz;
    if (!q) { newQuizQuestion(); return; }
    const choiceCls = ["choice", q.paChoice ? "pa-choice" : "", q.longChoices ? "long-choice" : ""].filter(Boolean).join(" ");
    const reviewBadge = q.isReview ? `<div class="review-badge">🔁 REVIEW</div>` : "";
    const queueLine = state.reviewQueue.length
      ? `<span class="qmeta">🔁 ${state.reviewQueue.length} to review</span>` : "";
    const filterRow = `
      <div class="learn-nav">
        <div class="filter-row">
          ${QUIZ_FILTERS.map(([k,label]) =>
            `<button class="filter-btn ${state.quizFilter===k?"active":""}" data-qf="${k}">${label}</button>`
          ).join("")}
        </div>
      </div>`;

    app.innerHTML = `
      ${filterRow}
      <div class="card">
        ${reviewBadge}
        <div class="quiz-question">${q.prompt}</div>
        <div class="choices${q.longChoices ? " choices-stack" : ""}">
          ${q.choices.map(c => `<button class="${choiceCls}" data-c="${encodeURIComponent(c)}">${c}</button>`).join("")}
        </div>
        <div class="feedback" id="feedback"></div>
        <div class="controls">
          <div class="progress">⚔️ Streak: ${state.streak} ${queueLine}</div>
          <button id="next-q">Next ➡️</button>
        </div>
      </div>
    `;

    document.querySelectorAll(".filter-btn[data-qf]").forEach(btn => {
      btn.addEventListener("click", () => setQuizFilter(btn.dataset.qf));
    });

    const fb = document.getElementById("feedback");
    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (q.answered) return;
        q.answered = true;
        const pick = decodeURIComponent(btn.dataset.c);
        if (pick === q.correct) {
          btn.classList.add("correct");
          flash();
          state.streak += 1;
          state.sessCorrect += 1;
          if (state.streak > state.sessBest) state.sessBest = state.streak;
          updateSessionStats();
          // Reviewed-correctly items get cleared from the queue.
          if (q.isReview) dequeueCorrect(q.id);

          const reward = 100 + Math.floor(Math.random() * 100) + state.streak * 10 + (q.isReview ? 25 : 0);
          setZeni(state.zeni + reward);
          const powerGain = POWER_PER_CORRECT_BASE + state.streak * POWER_STREAK_BONUS;
          addPower(powerGain);

          let msg = `${HYPES[Math.floor(Math.random() * HYPES.length)]}  +${reward} 💰  +${powerGain} ⚡`;
          if (q.isReview) msg = "✅ Mastered! " + msg;
          if (maybeAwardDragonBall()) { dragonBallToast(); msg += "  🐉 RARE!"; }
          fb.textContent = msg;
        } else {
          btn.classList.add("wrong");
          state.streak = 0;
          state.sessWrong += 1;
          updateSessionStats();
          // Add to review queue for spaced repetition
          queueWrong(q.id);
          fb.textContent = `${FAILS[Math.floor(Math.random()*FAILS.length)]} The answer is "${q.correct}". (Added to 🔁 review)`;
          document.querySelectorAll(".choice").forEach(b => {
            if (decodeURIComponent(b.dataset.c) === q.correct) b.classList.add("correct");
          });
          addPower(POWER_PER_WRONG);
        }
        const queueLine2 = state.reviewQueue.length ? `<span class="qmeta">🔁 ${state.reviewQueue.length} to review</span>` : "";
        document.querySelector(".progress").innerHTML = `⚔️ Streak: ${state.streak} ${queueLine2}`;
      });
    });
    document.getElementById("next-q").onclick = newQuizQuestion;
  }

  // ===== LIST (Scroll) =====
  function renderList() {
    const vocabBlock = (typeof VOCAB !== "undefined") ? `
      <h2 class="list-heading" id="sec-vocab">💬 Words (${VOCAB.length})</h2>
      <div class="list-grid">
        ${VOCAB.map((w) => `
          <div class="list-item">
            <div>${w.emoji} <span class="b">${w.word}</span> <span class="pa-inline">${w.pa}</span></div>
            <small>📖 ${w.def}</small>
            <small>type: ${w.type}</small>
          </div>
        `).join("")}
      </div>` : "";

    const navTabs = `
      <div class="learn-nav scroll-nav">
        <div class="filter-row">
          <button class="filter-btn" data-jump="sec-verbs">🏃 Verbs (${VERBS.length})</button>
          <button class="filter-btn" data-jump="sec-nouns">🧱 Nouns (${NOUNS.length})</button>
          ${typeof VOCAB !== "undefined" ? `<button class="filter-btn" data-jump="sec-vocab">💬 Words (${VOCAB.length})</button>` : ""}
          <button class="filter-btn" data-jump="sec-grammar">📘 Grammar (${GRAMMAR.length})</button>
        </div>
      </div>`;

    app.innerHTML = `
      ${navTabs}
      <h2 class="list-heading" id="sec-verbs">🏃 Verbs (${VERBS.length})</h2>
      <div class="list-grid">
        ${VERBS.map((v) => `
          <div class="list-item">
            <div>${v.emoji} <span class="b">${v.base}</span> <span class="pa-inline">${v.pa}</span></div>
            <small>📖 ${v.def}</small>
            <small>⏪ ${v.past} &nbsp;•&nbsp; ⏩ ${v.future}</small>
          </div>
        `).join("")}
      </div>

      <h2 class="list-heading" id="sec-nouns">🧱 Nouns (${NOUNS.length})</h2>
      <div class="list-grid">
        ${NOUNS.map((n) => `
          <div class="list-item">
            <div>${n.emoji} <span class="b">${n.word}</span> <span class="pa-inline">${n.pa}</span></div>
            <small>📖 ${n.def}</small>
          </div>
        `).join("")}
      </div>

      ${vocabBlock}

      <h2 class="list-heading" id="sec-grammar">📘 Grammar (${GRAMMAR.length})</h2>
      <div class="list-grid">
        ${GRAMMAR.map((g) => `
          <div class="list-item">
            <div>📘 <span class="b">${g.term}</span> <span class="pa-inline">${g.pa}</span></div>
            <small>📖 ${g.def}</small>
            <small>e.g. ${g.examples.slice(0,3).join(", ")}</small>
          </div>
        `).join("")}
      </div>
    `;

    document.querySelectorAll(".filter-btn[data-jump]").forEach(btn => {
      btn.addEventListener("click", () => {
        const el = document.getElementById(btn.dataset.jump);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function render() {
    if (state.mode === "learn") renderLearn();
    else if (state.mode === "quiz") { state.quiz = null; newQuizQuestion(); }
    else if (state.mode === "list") renderList();
  }

  render();
})();
