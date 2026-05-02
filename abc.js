/* =====================================================================
 * abc.js — ABC Side Game
 * ---------------------------------------------------------------------
 * Self-contained side mini-game launched from the HUD's ABC button.
 * Exposes a single global entry point: window.openAbcGame().
 *
 * Architecture (kept modular so the game can grow):
 *   1. CONFIG      — tunable constants (storage key, ids, classes).
 *   2. STATE       — runtime state for the current overlay session.
 *   3. STORAGE     — load/save helpers for persistent ABC progress.
 *   4. UI / DOM    — overlay scaffold (header, body, close button).
 *   5. SCREENS     — pluggable renderers (menu, play, future results).
 *   6. GAMEPLAY    — placeholder for the actual game logic (TBD).
 *   7. PUBLIC API  — openAbcGame(), closeAbcGame() on window.
 *
 * The host page (app.js) only needs to call window.openAbcGame().
 * Nothing in this file mutates the main ladder game's state.
 * ===================================================================== */
(function () {
  "use strict";

  // -------------------------------------------------------------------
  // 1. CONFIG
  // -------------------------------------------------------------------
  const CONFIG = {
    storageKey: "vtk.abc.v1",
    overlayId:  "abc-overlay",
    rootClass:  "abc-root"
  };

  // -------------------------------------------------------------------
  // 2. STATE
  // -------------------------------------------------------------------
  const state = {
    open: false,
    screen: "menu",   // "menu" | "play" | "results" (future)
    session: null     // populated when a round starts
  };

  // -------------------------------------------------------------------
  // 3. STORAGE
  // -------------------------------------------------------------------
  function loadProgress() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      return raw ? JSON.parse(raw) : { plays: 0, best: 0 };
    } catch (_) {
      return { plays: 0, best: 0 };
    }
  }
  function saveProgress(p) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(p)); }
    catch (_) { /* ignore quota errors */ }
  }

  // -------------------------------------------------------------------
  // 4. UI / DOM scaffold
  // -------------------------------------------------------------------
  function buildOverlay() {
    let el = document.getElementById(CONFIG.overlayId);
    if (el) return el;
    el = document.createElement("div");
    el.id = CONFIG.overlayId;
    el.className = CONFIG.rootClass;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "ABC Game");
    el.innerHTML = `
      <div class="abc-shell">
        <header class="abc-header">
          <h2 class="abc-title">ABC <span class="pa pa-inline" lang="pa">· ABC ਖੇਡ</span></h2>
          <button class="abc-close" id="abc-close" aria-label="Close ABC game" title="Close · ਬੰਦ">✕</button>
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
  // 5. SCREENS
  // -------------------------------------------------------------------
  function renderScreen() {
    const body = document.getElementById("abc-body");
    if (!body) return;
    switch (state.screen) {
      case "menu":  return renderMenu(body);
      case "play":  return renderPlay(body);
      default:      return renderMenu(body);
    }
  }

  function renderMenu(body) {
    const p = loadProgress();
    body.innerHTML = `
      <section class="abc-menu">
        <p class="abc-tagline">
          A new side adventure is on the way.
          <span class="pa pa-block" lang="pa">ਇੱਕ ਨਵੀਂ ਖੇਡ ਜਲਦੀ ਆ ਰਹੀ ਹੈ।</span>
        </p>
        <div class="abc-stats">
          <div>Plays <span class="pa pa-inline" lang="pa">· ਖੇਡਾਂ</span>: <strong>${p.plays}</strong></div>
          <div>Best <span class="pa pa-inline" lang="pa">· ਉੱਚਾ</span>: <strong>${p.best}</strong></div>
        </div>
        <button class="abc-cta" id="abc-start">▶ Start <span class="pa pa-inline" lang="pa">· ਸ਼ੁਰੂ</span></button>
      </section>
    `;
    body.querySelector("#abc-start").addEventListener("click", () => {
      state.screen = "play";
      renderScreen();
    });
  }

  function renderPlay(body) {
    body.innerHTML = `
      <section class="abc-play">
        <p class="abc-placeholder">
          Game coming soon.
          <span class="pa pa-block" lang="pa">ਖੇਡ ਜਲਦੀ ਆ ਰਹੀ ਹੈ।</span>
        </p>
        <button class="abc-cta" id="abc-back">← Back <span class="pa pa-inline" lang="pa">· ਵਾਪਸ</span></button>
      </section>
    `;
    body.querySelector("#abc-back").addEventListener("click", () => {
      state.screen = "menu";
      renderScreen();
    });
  }

  // -------------------------------------------------------------------
  // 6. GAMEPLAY (to be implemented)
  // -------------------------------------------------------------------
  // function startRound() { ... }
  // function endRound(score) { ... }

  // -------------------------------------------------------------------
  // 7. PUBLIC API
  // -------------------------------------------------------------------
  function openAbcGame() {
    const el = buildOverlay();
    state.open = true;
    state.screen = "menu";
    el.classList.add("is-open");
    document.body.classList.add("abc-locked");
    renderScreen();
  }

  function closeAbcGame() {
    const el = document.getElementById(CONFIG.overlayId);
    if (el) el.classList.remove("is-open");
    document.body.classList.remove("abc-locked");
    state.open = false;
  }

  window.openAbcGame  = openAbcGame;
  window.closeAbcGame = closeAbcGame;
  // Internal exports for future modules to use without polluting globals.
  window.__abc = { CONFIG, state, loadProgress, saveProgress };
})();
