(() => {
  const app = document.getElementById("app");
  const starsEl = document.getElementById("stars");
  const powerFill = document.getElementById("power-fill");
  const powerLevel = document.getElementById("power-level");
  const modeBtns = document.querySelectorAll(".mode-btn");

  const HYPES = [
    "OVER 9000! 💥",
    "KAMEHAMEHA! 🌊⚡",
    "SUPER SAIYAN! 💛",
    "POWER UP! 🔥",
    "FINAL FLASH! ✨",
    "GALICK GUN! 💜",
    "SPIRIT BOMB! 🌟",
    "INSTANT TRANSMISSION! ⚡"
  ];

  const FAILS = [
    "Almost! Train harder, young warrior!",
    "Not quite — power up and try again!",
    "Senzu bean time! Keep going!",
    "A true Saiyan never gives up!"
  ];

  const state = {
    mode: "learn",
    learnIndex: 0,
    stars: Number(localStorage.getItem("vtk_stars") || 0),
    power: Number(localStorage.getItem("vtk_power") || 0),
    quiz: null,
  };

  starsEl.textContent = state.stars;
  updatePower();

  function updatePower() {
    powerLevel.textContent = state.power.toLocaleString();
    // Bar caps visually at 9000 then keeps "OVER 9000" full
    const pct = Math.min(100, (state.power / 9000) * 100);
    powerFill.style.width = pct + "%";
  }

  function addPower(n) {
    state.power += n;
    localStorage.setItem("vtk_power", state.power);
    updatePower();
  }

  function setStars(n) {
    state.stars = n;
    starsEl.textContent = n;
    localStorage.setItem("vtk_stars", n);
  }

  function flash() {
    const f = document.createElement("div");
    f.className = "kame-flash";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 700);
  }

  function setMode(mode) {
    state.mode = mode;
    modeBtns.forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    render();
  }
  modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // ---------- LEARN (Training) ----------
  function renderLearn() {
    const v = VERBS[state.learnIndex];
    app.innerHTML = `
      <div class="card">
        <div class="aura"><div class="emoji-big">${v.emoji}</div></div>
        <div class="verb-base">${v.base}</div>
        <div class="tense-row">
          <div class="tense past">
            <h3>⏪ PAST</h3>
            <p>${v.past}</p>
          </div>
          <div class="tense present">
            <h3>▶️ NOW</h3>
            <p>${v.base}</p>
          </div>
          <div class="tense future">
            <h3>⏩ FUTURE</h3>
            <p>${v.future}</p>
          </div>
        </div>
        <div class="example">
          <div>⏪ <i>${v.ex.past}</i></div>
          <div>▶️ <i>${v.ex.present}</i></div>
          <div>⏩ <i>${v.ex.future}</i></div>
        </div>
        <div class="controls">
          <button id="prev">⬅️ Back</button>
          <div class="progress">Verb ${state.learnIndex + 1} / ${VERBS.length}</div>
          <button id="next">Next ➡️</button>
        </div>
      </div>
    `;
    document.getElementById("prev").onclick = () => {
      state.learnIndex = (state.learnIndex - 1 + VERBS.length) % VERBS.length;
      renderLearn();
    };
    document.getElementById("next").onclick = () => {
      state.learnIndex = (state.learnIndex + 1) % VERBS.length;
      renderLearn();
    };
  }

  // ---------- QUIZ (Battle) ----------
  function pickRandom(arr, n, exclude) {
    const pool = arr.filter(x => x !== exclude);
    const out = [];
    while (out.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  function newQuizQuestion() {
    const v = VERBS[Math.floor(Math.random() * VERBS.length)];
    const tenses = ["past", "present", "future"];
    const askTense = tenses[Math.floor(Math.random() * tenses.length)];
    const correct = askTense === "present" ? v.base : v[askTense];

    const distractorVerbs = pickRandom(VERBS, 6, v);
    const distractors = [];
    for (const dv of distractorVerbs) {
      const form = askTense === "present" ? dv.base : dv[askTense];
      if (form !== correct && !distractors.includes(form)) distractors.push(form);
      if (distractors.length === 3) break;
    }

    const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
    state.quiz = { verb: v, askTense, correct, choices, answered: false };
    renderQuiz();
  }

  function renderQuiz() {
    const q = state.quiz;
    if (!q) { newQuizQuestion(); return; }
    const tenseLabel = { past: "⏪ PAST", present: "▶️ PRESENT", future: "⏩ FUTURE" }[q.askTense];

    app.innerHTML = `
      <div class="card">
        <div class="aura"><div class="emoji-big">${q.verb.emoji}</div></div>
        <div class="quiz-question">
          What is the <b>${tenseLabel}</b> form of <b>${q.verb.base}</b>?
        </div>
        <div class="choices">
          ${q.choices.map(c => `<button class="choice" data-c="${c}">${c}</button>`).join("")}
        </div>
        <div class="feedback" id="feedback"></div>
        <div class="controls">
          <div class="progress">⚔️ Choose your attack!</div>
          <button id="next-q">Next ➡️</button>
        </div>
      </div>
    `;

    const fb = document.getElementById("feedback");
    document.querySelectorAll(".choice").forEach(btn => {
      btn.addEventListener("click", () => {
        if (q.answered) return;
        q.answered = true;
        const pick = btn.dataset.c;
        if (pick === q.correct) {
          btn.classList.add("correct");
          flash();
          fb.textContent = HYPES[Math.floor(Math.random() * HYPES.length)];
          setStars(state.stars + 1);
          addPower(500 + Math.floor(Math.random() * 500));
        } else {
          btn.classList.add("wrong");
          fb.textContent = `${FAILS[Math.floor(Math.random()*FAILS.length)]} The answer is "${q.correct}".`;
          document.querySelectorAll(".choice").forEach(b => {
            if (b.dataset.c === q.correct) b.classList.add("correct");
          });
          addPower(50);
        }
      });
    });
    document.getElementById("next-q").onclick = newQuizQuestion;
  }

  // ---------- LIST (Scroll) ----------
  function renderList() {
    app.innerHTML = `
      <div class="list-grid">
        ${VERBS.map((v) => `
          <div class="list-item">
            <div>${v.emoji} <span class="b">${v.base}</span></div>
            <small>⏪ ${v.past} &nbsp;•&nbsp; ⏩ ${v.future}</small>
          </div>
        `).join("")}
      </div>
    `;
  }

  function render() {
    if (state.mode === "learn") renderLearn();
    else if (state.mode === "quiz") { state.quiz = null; renderQuiz(); }
    else if (state.mode === "list") renderList();
  }

  render();
})();
