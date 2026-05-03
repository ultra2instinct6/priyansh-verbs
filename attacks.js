// Daroach Learning — Random Attack mini-games (Spelling Strike + Definition Duel).
//
// Hooked into the ladder loop via app.js -> Attacks.maybeRun(state).
// All side effects on game state go through window.GameAPI (exposed by app.js):
//   GameAPI.dealDamage(n), GameAPI.addPower(n), GameAPI.addRupees(n), GameAPI.addGold(coins),
//   GameAPI.queueReview(id), GameAPI.persist(),
//   GameAPI.kiBurst(), GameAPI.confetti(n,emojis), GameAPI.screenShake(ms),
//   GameAPI.SFX, GameAPI.toast({en,pa}, cls), GameAPI.paLine(text),
//   GameAPI.app  (the #app element), GameAPI.maxHpFor(power),
//   GameAPI.rankIndex(power)
//
// Storage (separate keys so we don't disturb existing saves):
//   dl_atk_v1__<childId>  -> { lastAt, spellingStreak, totalShown, totalRight, enabled }
//
// Trigger probability is gated by player skill / health / review-debt so
// attacks lean toward strong players and back off when the kid is struggling.
(function () {
  "use strict";

  const VERSION = 1;

  // ---------- Storage ----------
  function childId() {
    // Mirror app.js logic loosely: prefer dl_active_child_v1, fall back to "default".
    try {
      const v = localStorage.getItem("dl_active_child_v1");
      if (v) return v;
    } catch (_) {}
    return "default";
  }
  function key() { return `dl_atk_v${VERSION}__${childId()}`; }
  function loadMeta() {
    try {
      const raw = localStorage.getItem(key());
      if (!raw) return defaultMeta();
      const obj = JSON.parse(raw);
      return Object.assign(defaultMeta(), obj);
    } catch (_) {
      return defaultMeta();
    }
  }
  function defaultMeta() {
    return {
      lastAt: -999,         // state.cardsSeen at last attack
      spellingStreak: 0,    // consecutive spelling wins (gates Hard mode)
      totalShown: 0,
      totalRight: 0,
      spellShown: 0, spellRight: 0,
      defShown: 0,   defRight: 0,
      missedVocab: {},      // { word: { miss, last } } — separate from LADDER review queue
      enabled: true,
    };
  }
  function saveMeta(m) {
    try { localStorage.setItem(key(), JSON.stringify(m)); } catch (_) {}
  }

  // ---------- Trigger ----------
  // Only callable when state is not in a special mode (caller guards this too).
  function shouldTrigger(state) {
    const meta = loadMeta();
    // Warm-up: no attacks before this many cards seen.
    if ((state.cardsSeen || 0) < 8) return false;
    // Cooldown: at least 4 cards since last attack.
    const since = (state.cardsSeen || 0) - (meta.lastAt || 0);
    if (since < 4) return false;
    // Mercy: never when very low HP.
    const hp = state.hp || 0;
    const max = (window.GameAPI && window.GameAPI.maxHpFor)
      ? window.GameAPI.maxHpFor(state.power || 0) : 30;
    const pct = max > 0 ? hp / max : 1;
    if (pct <= 0.20) return false;

    let p = 0.08;                                          // base chance
    p *= 1 + Math.min(state.streak || 0, 10) * 0.07;       // skill multiplier
    p *= Math.max(0.3, Math.min(1, pct));                  // health multiplier
    const dq = (state.reviewQueue && state.reviewQueue.length) || 0;
    p *= 1 / (1 + 0.15 * dq);                              // review-debt multiplier
    // Cooldown ramp: floor 0.4 right after cooldown ends, ramps to 1.0 over 4 more cards
    const ramp = Math.max(0, Math.min(1, (since - 4) / 4));
    p *= 0.4 + 0.6 * ramp;
    if (p > 0.5) p = 0.5;                                  // hard cap

    return Math.random() < p;
  }

  // Three attack flavors: Spelling Strike, Definition Duel, Sound Strike.
  // Distribution leans by tier (low tiers = more sound/def, high tiers = more spell).
  // Sound Strike is skipped if the device has no Web Speech support.
  function pickAttackKind(state) {
    const tier = (window.GameAPI && window.GameAPI.rankIndex)
      ? window.GameAPI.rankIndex(state.power || 0) : 0;
    const canSound = !!(typeof window !== "undefined" && "speechSynthesis" in window);
    // Base weights: spell, def, sound
    let wSpell = 0.50, wDef = 0.30, wSound = 0.20;
    if (tier <= 1)      { wSpell = 0.30; wDef = 0.35; wSound = 0.35; }
    else if (tier >= 5) { wSpell = 0.60; wDef = 0.25; wSound = 0.15; }
    if (!canSound) { wSpell += wSound * 0.6; wDef += wSound * 0.4; wSound = 0; }
    const r = Math.random() * (wSpell + wDef + wSound);
    if (r < wSpell) return "spell";
    if (r < wSpell + wDef) return "def";
    return "sound";
  }

  // ---------- Public entry ----------
  // Returns true if it took over rendering (caller should bail out of normal flow).
  function maybeRun(state) {
    if (typeof window.VocabAPI === "undefined") return false;
    if (typeof window.EnemyAPI === "undefined") return false;
    if (Attacks._active) return false;
    if (!shouldTrigger(state)) return false;

    Attacks._active = true;
    const meta = loadMeta();
    meta.lastAt = state.cardsSeen || 0;
    saveMeta(meta);

    const kind = pickAttackKind(state);
    const tier = (window.GameAPI && window.GameAPI.rankIndex)
      ? window.GameAPI.rankIndex(state.power || 0) : 0;
    const enemy = window.EnemyAPI.pick({ maxTier: Math.min(4, 1 + Math.floor(tier / 2)) });
    const word  = pickWordForAttack(meta);

    runAttack({ kind, enemy, word, state });
    return true;
  }

  // Word picker: 40% chance to revisit a previously-missed word so attacks have
  // teaching memory across the run. Otherwise random from the full pool.
  function pickWordForAttack(meta) {
    const missedKeys = Object.keys(meta.missedVocab || {});
    if (missedKeys.length && Math.random() < 0.4) {
      // Weight by miss-count.
      const ranked = missedKeys
        .map(k => ({ k, miss: (meta.missedVocab[k] && meta.missedVocab[k].miss) || 1 }))
        .sort((a, b) => b.miss - a.miss);
      const top = ranked.slice(0, 5);
      const pick = top[Math.floor(Math.random() * top.length)];
      const w = window.VocabAPI.find(pick.k);
      if (w) return w;
    }
    return window.VocabAPI.pick();
  }

  // ---------- Slam intro ----------
  function slamIntro(enemy, kind) {
    return new Promise((resolve) => {
      const o = document.createElement("div");
      const kindCls = kind === "spell" ? "atk-spell" : kind === "sound" ? "atk-sound" : "atk-def";
      o.className = "attack-slam " + kindCls;
      const portrait = enemyPortraitHTML(enemy, "slam");
      const labelEn = kind === "spell" ? "INCOMING! Spell it!"
                    : kind === "sound" ? "INCOMING! Hear & pick!"
                    : "INCOMING! What does it mean?";
      const labelPa = kind === "spell" ? "ਸਪੈੱਲ ਕਰੋ!"
                    : kind === "sound" ? "ਸੁਣੋ ਤੇ ਚੁਣੋ!"
                    : "ਮਤਲਬ ਦੱਸੋ!";
      o.innerHTML = `
        <div class="attack-slam-inner">
          ${portrait}
          <div class="attack-slam-name">${esc(enemy.name_en)}<div class="pa-block" lang="pa">${esc(enemy.name_pa)}</div></div>
          <div class="attack-slam-label">${labelEn}<div class="pa-block" lang="pa">${labelPa}</div></div>
        </div>`;
      document.body.appendChild(o);
      try { window.GameAPI && GameAPI.screenShake && GameAPI.screenShake(280); } catch (_) {}
      try { window.GameAPI && GameAPI.kiBurst   && GameAPI.kiBurst();        } catch (_) {}
      try {
        const sfx = window.GameAPI && GameAPI.SFX;
        if (sfx) {
          const tier = (enemy && enemy.tier) | 0;
          const seen = sfx._seenAppear;
          // Tier 4 elite (Sky Dragon) = always boss-appear sting.
          // First-of-kind tier 3+ = boss-appear; otherwise tiered enemy-appear.
          const key = enemy && (enemy.id || enemy.name_en || "?");
          const isFirst = seen && !seen.has(key);
          if (seen) seen.add(key);
          if (tier >= 4 || (tier >= 3 && isFirst)) {
            sfx.bossAppear && sfx.bossAppear();
          } else {
            sfx.enemyAppear && sfx.enemyAppear(tier || 1);
          }
          // Always stamp a hit for the slam impact
          sfx.bossHit && sfx.bossHit(tier);
        }
      } catch (_) {}
      setTimeout(() => { try { o.remove(); } catch(_) {} resolve(); }, 1100);
    });
  }

  // ---------- Render dispatcher ----------
  function runAttack(ctx) {
    // Bail safely if upstream returned no enemy or no word — otherwise the
    // attack screen would render blank and lock the game (Attacks._active=true
    // with no way for the user to advance).
    if (!ctx || !ctx.enemy || !ctx.word) {
      console.warn("[Attacks] missing enemy/word, skipping attack", ctx);
      finish(ctx || {}, false, "missing-data");
      return;
    }
    slamIntro(ctx.enemy, ctx.kind).then(() => {
      try {
        if (ctx.kind === "spell") renderSpelling(ctx);
        else if (ctx.kind === "sound") renderSound(ctx);
        else renderDefinition(ctx);
      } catch (e) {
        // Anything thrown inside the renderer would otherwise leave the screen
        // empty with _active=true. Recover by ending the attack and re-rendering.
        console.warn("[Attacks] render error, recovering", e);
        finish(ctx, false, "render-error");
      }
    }).catch((e) => {
      console.warn("[Attacks] slam error, recovering", e);
      finish(ctx, false, "slam-error");
    });
  }

  // ---------- Spelling Strike ----------
  function renderSpelling(ctx) {
    const meta = loadMeta();
    const word = ctx.word;
    const easy = meta.spellingStreak < 3; // Hard mode unlocks after 3 wins in a row
    const promptStyle = Math.random() < 0.5 ? "emoji" : "sentence";
    const app = (window.GameAPI && window.GameAPI.app) || document.getElementById("app");
    if (!app) { finish(ctx, false, "no-app"); return; }

    const choices = easy ? buildSpellChoices(word) : null;
    const promptHTML = (promptStyle === "sentence" && word.example_en)
      ? `<div class="atk-emoji-big">${esc(word.emoji || "📝")}</div>
         <div class="atk-prompt-en">${blankExample(word)}</div>
         <div class="pa-block" lang="pa">${esc(word.example_pa || "")}</div>`
      : `<div class="atk-emoji-big">${esc(word.emoji || "📝")}</div>
         <div class="atk-prompt-pa pa" lang="pa">${esc(word.pa_gloss || "")}</div>
         <div class="atk-prompt-en">Spell it in English<span class="pa pa-inline" lang="pa">· ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਲਿਖੋ</span></div>`;

    const choicesHTML = easy
      ? `<div class="atk-choices">${choices.map((c, i) =>
            `<button class="atk-choice" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>`
      : `<div class="atk-input-row">
            <input class="atk-input fill-input" id="atk-input" autocomplete="off" autocapitalize="off"
                   spellcheck="false" maxlength="20" inputmode="text" type="text"
                   placeholder="type the word"/>
            <button class="atk-submit" id="atk-submit">Spell ⚡</button>
         </div>`;

    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card attack-card atk-spell">
          <div class="atk-header">
            <div class="atk-enemy">${enemyPortraitHTML(ctx.enemy, "card")}
              <div class="atk-enemy-name">${esc(ctx.enemy.name_en)}
                <div class="pa pa-inline" lang="pa">${esc(ctx.enemy.name_pa)}</div></div>
            </div>
            <div class="atk-timer-bar"><div class="atk-timer-fill"></div></div>
          </div>
          <h2 class="atk-title">Spelling Strike!<div class="pa-block" lang="pa">ਸਪੈੱਲਿੰਗ ਹਮਲਾ!</div></h2>
          ${promptHTML}
          ${choicesHTML}
        </div>
      </div>`;

    const TIMER_MS = 8000;
    const timer = startTimer(TIMER_MS, () => resolveSpell(ctx, word, null, true));

    if (easy) {
      app.querySelectorAll(".atk-choice").forEach(btn => {
        btn.addEventListener("click", () => {
          stopTimer(timer);
          resolveSpell(ctx, word, btn.dataset.c, false);
        });
      });
    } else {
      const input = app.querySelector("#atk-input");
      const submit = app.querySelector("#atk-submit");
      if (input) { try { input.focus(); } catch (_) {} }
      const submitFn = () => {
        stopTimer(timer);
        resolveSpell(ctx, word, (input && input.value) || "", false);
      };
      if (submit) submit.addEventListener("click", submitFn);
      if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitFn(); });
    }
  }

  function buildSpellChoices(word) {
    const correct = word.word;
    const wrong = window.VocabAPI.misspellings(correct, 3);
    while (wrong.length < 3) wrong.push(correct + "x"); // safety net
    const arr = [correct, ...wrong.slice(0, 3)];
    return arr.sort(() => Math.random() - 0.5);
  }
  function blankExample(word) {
    const ex = word.example_en || "";
    const re = new RegExp(`\\b${escapeRegex(word.word)}\\b`, "i");
    if (!re.test(ex)) return `Spell: ${esc(word.meaning_en || word.word)}`;
    return esc(ex).replace(re, "<b class='atk-blank'>____</b>");
  }
  function resolveSpell(ctx, word, answer, timedOut) {
    const correct = String(word.word || "").toLowerCase();
    const given = String(answer || "").trim().toLowerCase();
    const ok = !timedOut && given === correct;
    const meta = loadMeta();
    meta.totalShown += 1; meta.spellShown += 1;
    if (ok) { meta.totalRight += 1; meta.spellRight += 1; }
    meta.spellingStreak = ok ? meta.spellingStreak + 1 : 0;
    if (ok && meta.missedVocab[correct]) {
      // Successful retry: decay miss count so it leaves the priority pool.
      meta.missedVocab[correct].miss = Math.max(0, meta.missedVocab[correct].miss - 1);
      if (meta.missedVocab[correct].miss === 0) delete meta.missedVocab[correct];
    }
    if (!ok) {
      const v = meta.missedVocab[correct] || { miss: 0, last: 0 };
      v.miss += 1; v.last = Date.now();
      meta.missedVocab[correct] = v;
    }
    saveMeta(meta);

    const fbEn = ok
      ? `Nice spell! <b>${esc(correct)}</b> ${word.hint ? "— " + esc(word.hint) : ""}`
      : (timedOut
          ? `Time! It's <b>${spaced(correct)}</b>.`
          : `Almost! It's <b>${spaced(correct)}</b>.${word.hint ? " " + esc(word.hint) : ""}`);
    const fbPa = ok
      ? `ਸ਼ਾਬਾਸ਼! <b>${esc(correct)}</b>${word.hint_pa ? " — " + esc(word.hint_pa) : ""}`
      : (timedOut
          ? `ਸਮਾਂ ਖ਼ਤਮ! ਸਹੀ: <b>${spaced(correct)}</b>।`
          : `ਨੇੜੇ ਸੀ! ਸਹੀ: <b>${spaced(correct)}</b>।${word.hint_pa ? " " + esc(word.hint_pa) : ""}`);

    showFeedback({
      ok, en: fbEn, pa: fbPa,
      meaning: { en: word.meaning_en, pa: word.meaning_pa },
      example: { en: word.example_en, pa: word.example_pa },
    }, () => applyOutcomeAndContinue(ctx, "spell", ok, timedOut, word));
  }

  // ---------- Definition Duel ----------
  function renderDefinition(ctx) {
    const word = ctx.word;
    const app = (window.GameAPI && window.GameAPI.app) || document.getElementById("app");
    if (!app) { finish(ctx, false, "no-app"); return; }

    // Direction: 0 = word→meaning, 1 = meaning→word
    const direction = Math.random() < 0.5 ? 0 : 1;

    let promptHTML, choices, correctVal;
    if (direction === 0) {
      const distractors = window.VocabAPI.distractors(word, 2, "meaning_en");
      const arr = [word.meaning_en, ...distractors];
      const order = arr.map((v, i) => i).sort(() => Math.random() - 0.5);
      choices = order.map(i => arr[i]);
      correctVal = word.meaning_en;
      const phon = word.phonetic ? `<div class="atk-phonetic">(${esc(word.phonetic)})</div>` : "";
      promptHTML = `
        <div class="atk-word-big">${esc(word.word)}</div>
        ${phon}
        <div class="atk-prompt-en">What does it mean?<div class="pa-block" lang="pa">ਇਸ ਦਾ ਕੀ ਮਤਲਬ?</div></div>`;
    } else {
      const distractors = window.VocabAPI.distractors(word, 2, "word");
      const arr = [word.word, ...distractors];
      const order = arr.map((v, i) => i).sort(() => Math.random() - 0.5);
      choices = order.map(i => arr[i]);
      correctVal = word.word;
      promptHTML = `
        <div class="atk-emoji-big">${esc(word.emoji || "📖")}</div>
        <div class="atk-prompt-en"><b>${esc(word.meaning_en)}</b><div class="pa-block" lang="pa">${esc(word.meaning_pa || "")}</div></div>
        <div class="atk-prompt-en">Pick the word<span class="pa pa-inline" lang="pa">· ਸਹੀ ਸ਼ਬਦ ਚੁਣੋ</span></div>`;
    }

    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card attack-card atk-def">
          <div class="atk-header">
            <div class="atk-enemy">${enemyPortraitHTML(ctx.enemy, "card")}
              <div class="atk-enemy-name">${esc(ctx.enemy.name_en)}
                <div class="pa pa-inline" lang="pa">${esc(ctx.enemy.name_pa)}</div></div>
            </div>
            <div class="atk-timer-bar"><div class="atk-timer-fill"></div></div>
          </div>
          <h2 class="atk-title">Definition Duel!<div class="pa-block" lang="pa">ਮਤਲਬ ਦੀ ਲੜਾਈ!</div></h2>
          ${promptHTML}
          <div class="atk-choices atk-choices-col">
            ${choices.map(c => `<button class="atk-choice" data-c="${esc(c)}">${esc(c)}</button>`).join("")}
          </div>
        </div>
      </div>`;

    const TIMER_MS = 10000;
    const timer = startTimer(TIMER_MS, () => resolveDef(ctx, word, null, true, correctVal));
    app.querySelectorAll(".atk-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        stopTimer(timer);
        resolveDef(ctx, word, btn.dataset.c, false, correctVal);
      });
    });
  }

  function resolveDef(ctx, word, answer, timedOut, correctVal) {
    const ok = !timedOut && String(answer || "").trim().toLowerCase() === String(correctVal || "").trim().toLowerCase();
    const meta = loadMeta();
    meta.totalShown += 1; meta.defShown += 1;
    if (ok) { meta.totalRight += 1; meta.defRight += 1; }
    if (ok && meta.missedVocab[word.word]) {
      meta.missedVocab[word.word].miss = Math.max(0, meta.missedVocab[word.word].miss - 1);
      if (meta.missedVocab[word.word].miss === 0) delete meta.missedVocab[word.word];
    }
    if (!ok) {
      const v = meta.missedVocab[word.word] || { miss: 0, last: 0 };
      v.miss += 1; v.last = Date.now();
      meta.missedVocab[word.word] = v;
    }
    saveMeta(meta);

    const fbEn = ok
      ? `Yes! <b>${esc(word.word.toUpperCase())}</b> means <b>${esc(word.meaning_en)}</b>.`
      : (timedOut
          ? `Time! <b>${esc(word.word.toUpperCase())}</b> means <b>${esc(word.meaning_en)}</b>.`
          : `Not quite. <b>${esc(word.word.toUpperCase())}</b> means <b>${esc(word.meaning_en)}</b>.`);
    const fbPa = ok
      ? `ਹਾਂ! <b>${esc(word.word)}</b> ਦਾ ਮਤਲਬ ਹੈ <b>${esc(word.meaning_pa || "")}</b>।`
      : (timedOut
          ? `ਸਮਾਂ ਖ਼ਤਮ! <b>${esc(word.word)}</b> ਦਾ ਮਤਲਬ ਹੈ <b>${esc(word.meaning_pa || "")}</b>।`
          : `ਥੋੜਾ ਗਲਤ। <b>${esc(word.word)}</b> ਦਾ ਮਤਲਬ ਹੈ <b>${esc(word.meaning_pa || "")}</b>।`);

    showFeedback({
      ok, en: fbEn, pa: fbPa,
      meaning: null,
      example: { en: word.example_en, pa: word.example_pa },
    }, () => applyOutcomeAndContinue(ctx, "def", ok, timedOut, word));
  }

  // ---------- Sound Strike ----------
  // Speak the target word, show 4 word choices, learner taps the matching one.
  // Uses GameAPI.speak (Web Speech API). Includes a "🔊 Hear it again" button.
  function renderSound(ctx) {
    const word = ctx.word;
    const app = (window.GameAPI && window.GameAPI.app) || document.getElementById("app");
    if (!app) { finish(ctx, false, "no-app"); return; }

    // 4-choice format: 1 correct + 3 distractor words (same tag where possible).
    const distractors = window.VocabAPI.distractors(word, 3, "word");
    const arr = [word.word, ...distractors];
    const order = arr.map((v, i) => i).sort(() => Math.random() - 0.5);
    const choices = order.map(i => arr[i]);
    const correctVal = word.word;

    app.innerHTML = `
      <div class="ladder-frame">
        <div class="card attack-card atk-sound">
          <div class="atk-header">
            <div class="atk-enemy">${enemyPortraitHTML(ctx.enemy, "card")}
              <div class="atk-enemy-name">${esc(ctx.enemy.name_en)}
                <div class="pa pa-inline" lang="pa">${esc(ctx.enemy.name_pa)}</div></div>
            </div>
            <div class="atk-timer-bar"><div class="atk-timer-fill"></div></div>
          </div>
          <h2 class="atk-title">Sound Strike!<div class="pa-block" lang="pa">ਆਵਾਜ਼ ਹਮਲਾ!</div></h2>
          <div class="atk-emoji-big">${esc(word.emoji || "🔊")}</div>
          <div class="atk-prompt-en">Listen, then tap the word<span class="pa pa-inline" lang="pa">· ਸੁਣੋ ਤੇ ਚੁਣੋ</span></div>
          <button class="atk-hear" id="atk-hear" type="button">🔊 Hear it again<span class="pa pa-inline" lang="pa">· ਫਿਰ ਸੁਣੋ</span></button>
          <div class="atk-choices atk-choices-col">
            ${choices.map(c => `<button class="atk-choice" data-c="${esc(c)}">${esc(c)}</button>`).join("")}
          </div>
        </div>
      </div>`;

    // Speak once after the slam clears, then on every "Hear it again" tap.
    const sayIt = () => {
      try {
        if (window.GameAPI && typeof GameAPI.speak === "function") {
          GameAPI.speak(word.word, "en-US");
        } else if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word.word);
          u.lang = "en-US"; u.rate = 0.9; u.pitch = 1.05;
          window.speechSynthesis.speak(u);
        }
      } catch (_) {}
    };
    setTimeout(sayIt, 200);
    const hearBtn = app.querySelector("#atk-hear");
    if (hearBtn) hearBtn.addEventListener("click", sayIt);

    const TIMER_MS = 10000;
    const timer = startTimer(TIMER_MS, () => resolveSound(ctx, word, null, true, correctVal));
    app.querySelectorAll(".atk-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        stopTimer(timer);
        try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
        resolveSound(ctx, word, btn.dataset.c, false, correctVal);
      });
    });
  }

  function resolveSound(ctx, word, answer, timedOut, correctVal) {
    const ok = !timedOut && String(answer || "").trim().toLowerCase() === String(correctVal || "").trim().toLowerCase();
    const meta = loadMeta();
    meta.totalShown += 1;
    meta.soundShown = (meta.soundShown || 0) + 1;
    if (ok) { meta.totalRight += 1; meta.soundRight = (meta.soundRight || 0) + 1; }
    if (ok && meta.missedVocab[word.word]) {
      meta.missedVocab[word.word].miss = Math.max(0, meta.missedVocab[word.word].miss - 1);
      if (meta.missedVocab[word.word].miss === 0) delete meta.missedVocab[word.word];
    }
    if (!ok) {
      const v = meta.missedVocab[word.word] || { miss: 0, last: 0 };
      v.miss += 1; v.last = Date.now();
      meta.missedVocab[word.word] = v;
    }
    saveMeta(meta);

    const fbEn = ok
      ? `Sharp ears! That was <b>${esc(word.word)}</b>.`
      : (timedOut
          ? `Time! That was <b>${esc(word.word)}</b>.`
          : `Not quite. That was <b>${esc(word.word)}</b>.`);
    const fbPa = ok
      ? `ਤੇਜ਼ ਕੰਨ! ਇਹ ਸੀ <b>${esc(word.word)}</b>।`
      : (timedOut
          ? `ਸਮਾਂ ਖ਼ਤਮ! ਇਹ ਸੀ <b>${esc(word.word)}</b>।`
          : `ਠੀਕ ਨਹੀਂ। ਇਹ ਸੀ <b>${esc(word.word)}</b>।`);

    showFeedback({
      ok, en: fbEn, pa: fbPa,
      meaning: { en: word.meaning_en, pa: word.meaning_pa },
      example: { en: word.example_en, pa: word.example_pa },
    }, () => applyOutcomeAndContinue(ctx, "sound", ok, timedOut, word));
  }

  // ---------- Feedback panel ----------
  function showFeedback(fb, onContinue) {
    const app = (window.GameAPI && window.GameAPI.app) || document.getElementById("app");
    if (!app) { onContinue(); return; }
    const cls = fb.ok ? "atk-fb-ok" : "atk-fb-no";
    const meaningHTML = fb.meaning && fb.meaning.en
      ? `<div class="atk-fb-meaning">Means: <b>${esc(fb.meaning.en)}</b><div class="pa-block" lang="pa">ਮਤਲਬ: ${esc(fb.meaning.pa || "")}</div></div>`
      : "";
    const exampleHTML = fb.example && fb.example.en
      ? `<div class="atk-fb-example"><i>${esc(fb.example.en)}</i><div class="pa-block" lang="pa"><i>${esc(fb.example.pa || "")}</i></div></div>`
      : "";
    const card = app.querySelector(".attack-card") || app;
    const fbBox = document.createElement("div");
    fbBox.className = "atk-feedback " + cls;
    fbBox.innerHTML = `
      <div class="atk-fb-en">${fb.en}</div>
      <div class="pa-block atk-fb-pa" lang="pa">${fb.pa}</div>
      ${meaningHTML}
      ${exampleHTML}
      <button class="atk-continue">Continue<span class="pa pa-inline" lang="pa">· ਜਾਰੀ</span></button>`;
    card.appendChild(fbBox);
    // Disable choices/inputs and freeze the timer bar.
    card.querySelectorAll(".atk-choice, .atk-submit, .atk-input").forEach(el => {
      el.setAttribute("disabled", "true");
      el.classList.add("disabled");
    });
    const timerBar = card.querySelector(".atk-timer-bar");
    if (timerBar) timerBar.classList.add("atk-timer-done");
    try {
      if (fb.ok) GameAPI.SFX.correct(); else GameAPI.SFX.wrong();
    } catch (_) {}
    fbBox.querySelector(".atk-continue").addEventListener("click", onContinue);
  }

  // ---------- Outcome + resume ----------
  // Tier-scaled rewards/penalties keep attacks meaningful as the player ranks up,
  // and elite enemies feel like a real event. Aligns with existing XP table
  // (mcq=80, fill=120, boss=150) so attacks are quick "snack" XP, not grindable.
  const TIER_REWARD = {
    1: { spellPower: 15, spellRupees: 10, defPower: 12, defRupees:  8, soundPower: 12, soundRupees:  8, dmg: 4 },
    2: { spellPower: 25, spellRupees: 18, defPower: 20, defRupees: 14, soundPower: 20, soundRupees: 14, dmg: 6 },
    3: { spellPower: 50, spellRupees: 35, defPower: 40, defRupees: 28, soundPower: 40, soundRupees: 28, dmg: 8 },
    4: { spellPower:100, spellRupees: 75, defPower: 80, defRupees: 60, soundPower: 80, soundRupees: 60, dmg:12 },
  };
  function applyOutcomeAndContinue(ctx, kind, ok, timedOut, word) {
    const tier = (ctx.enemy && ctx.enemy.tier) || 1;
    const r = TIER_REWARD[tier] || TIER_REWARD[1];
    try {
      if (ok) {
        if (kind === "spell") {
          GameAPI.addPower(r.spellPower); GameAPI.addRupees && GameAPI.addRupees(r.spellRupees);
        } else if (kind === "sound") {
          GameAPI.addPower(r.soundPower); GameAPI.addRupees && GameAPI.addRupees(r.soundRupees);
        } else {
          GameAPI.addPower(r.defPower); GameAPI.addRupees && GameAPI.addRupees(r.defRupees);
        }
        // Bonus silver coin for taking down an elite (tier-4) foe.
        // Tier-4 elite drops a silver coin (🥈). 10 silver = 1 gold bar.
        if (tier >= 4) { try { GameAPI.addGold && GameAPI.addGold(1); } catch (_) {} }
        try { GameAPI.kiBurst && GameAPI.kiBurst(); } catch (_) {}
        try { GameAPI.confetti && GameAPI.confetti(tier >= 3 ? 32 : 18, ["✨", "⚡", "💥", "⭐"]); } catch (_) {}
        if (tier >= 3) {
          try { GameAPI.toast && GameAPI.toast({
            en: tier === 4 ? "🥈 ELITE DEFEATED!" : "⭐ RARE FOE DOWN!",
            pa: tier === 4 ? "🟨 ਲਾਜਵਾਬ ਹਾਰਿਆ!" : "⭐ ਦੁਰਲੱਭ ਦੁਸ਼ਮਣ ਹਾਰਿਆ!"
          }, "rank"); } catch (_) {}
        }
      } else {
        const dmg = timedOut ? 0 : r.dmg;
        if (dmg > 0) GameAPI.dealDamage(dmg);
        // Note: missed vocab is tracked inside attacks meta (missedVocab),
        // intentionally NOT pushed into LADDER's review queue — that queue is
        // keyed by LADDER card ids and would be silently cleared on miss.
      }
      GameAPI.persist && GameAPI.persist();
    } catch (e) { console.warn("[Attacks] outcome:", e); }
    finish(ctx, ok, "done");
  }

  function finish(ctx, ok, reason) {
    Attacks._active = false;
    // If the wrong-answer damage caused a KO, the engine already handled it via
    // dealDamage → (eventually) knockout. Calling render() here is still safe
    // because knockout() resets state and renders KO screen synchronously.
    try {
      if (window.GameAPI && typeof GameAPI.render === "function") GameAPI.render();
    } catch (_) {}
  }

  // ---------- Helpers ----------
  function startTimer(durMs, onTimeout) {
    const fill = document.querySelector(".atk-timer-fill");
    const start = performance.now();
    const t = { id: 0, done: false, lastTickSec: -1 };
    const sfx = (window.GameAPI && window.GameAPI.SFX) || null;
    function step(now) {
      if (t.done) return;
      const p = Math.min(1, (now - start) / durMs);
      if (fill) fill.style.width = ((1 - p) * 100).toFixed(1) + "%";
      // Tick beep on each of the last 3 whole seconds before timeout.
      const remainingSec = Math.ceil((durMs - (now - start)) / 1000);
      if (sfx && remainingSec > 0 && remainingSec <= 3 && remainingSec !== t.lastTickSec) {
        t.lastTickSec = remainingSec;
        try { sfx.tick && sfx.tick(); } catch (_) {}
      }
      if (p >= 1) {
        t.done = true;
        try { sfx && sfx.timeout && sfx.timeout(); } catch (_) {}
        onTimeout();
        return;
      }
      t.id = requestAnimationFrame(step);
    }
    t.id = requestAnimationFrame(step);
    return t;
  }
  function stopTimer(t) { if (t) { t.done = true; cancelAnimationFrame(t.id); } }

  function enemyPortraitHTML(enemy, ctx) {
    const cls = ctx === "slam" ? "atk-portrait-slam" : "atk-portrait";
    return `<div class="${cls}">
      <img class="atk-portrait-img" src="${esc(enemy.png)}" alt=""
           onerror="this.style.display='none'"/>
    </div>`;
  }

  function spaced(s) {
    return String(s || "").split("").join("-");
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeRegex(s) {
    return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ---------- Public API ----------
  const Attacks = {
    _active: false,
    maybeRun,
    isActive() { return !!Attacks._active; },
    setEnabled(_v) {
      const m = loadMeta(); m.enabled = true; saveMeta(m);
    },
    isEnabled() { return true; },
    forceTrigger(state, kind) {
      if (Attacks._active) return false;
      Attacks._active = true;
      const meta = loadMeta(); meta.lastAt = state.cardsSeen || 0; saveMeta(meta);
      const tier = (window.GameAPI && window.GameAPI.rankIndex)
        ? window.GameAPI.rankIndex(state.power || 0) : 0;
      const enemy = window.EnemyAPI.pick({ maxTier: Math.min(4, 1 + Math.floor(tier / 2)) });
      const word  = pickWordForAttack(meta);
      runAttack({ kind: (kind === "def" ? "def" : kind === "sound" ? "sound" : "spell"), enemy, word, state });
      return true;
    },
    stats() { return loadMeta(); },
  };
  window.Attacks = Attacks;
})();
