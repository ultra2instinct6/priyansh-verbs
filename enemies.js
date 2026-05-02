// Daroach Learning — Enemy roster for Random Attack mini-games.
// 6 enemies across 4 tiers. Spawn weight is tier-based; rarer tiers fire less.
//
// Image specs (all enemies):
//   - 512×512 PNG, transparent background
//   - subject fills ~80% of canvas, centered
//   - file path: images/<id>.png  (drop PNGs into the /images/ folder)
//
// To swap art: drop a PNG at the path below. If file is missing, the emoji
// fallback renders instead — so the game keeps working until art arrives.
(function () {
  "use strict";

  const ENEMIES = [
    // ---- Tier 1: Common (40% of spawns) ----
    {
      id: "saibaman",
      name_en: "Saibaman",
      name_pa: "ਸਾਈਬਾਮਨ",
      emoji: "👹",
      png: "images/saibaman.png",
      tier: 1,
      taunt_en: "You! Spell or fall!",
      taunt_pa: "ਸਪੈੱਲ ਕਰੋ ਜਾਂ ਡਿੱਗੋ!",
    },
    {
      id: "imp",
      name_en: "Sneaky Imp",
      name_pa: "ਚਲਾਕ ਭੂਤ",
      emoji: "👺",
      png: "images/imp.png",
      tier: 1,
      taunt_en: "I'll catch you off guard!",
      taunt_pa: "ਮੈਂ ਤੁਹਾਨੂੰ ਫੜਾਂਗਾ!",
    },

    // ---- Tier 2: Uncommon (35% of spawns) ----
    {
      id: "bandit",
      name_en: "Word Bandit",
      name_pa: "ਸ਼ਬਦ-ਚੋਰ",
      emoji: "🥷",
      png: "images/bandit.png",
      tier: 2,
      taunt_en: "Stealing your zeni!",
      taunt_pa: "ਤੁਹਾਡਾ ਜ਼ੇਨੀ ਚੁਰਾ ਲਵਾਂਗਾ!",
    },
    {
      id: "ghost",
      name_en: "Letter Ghost",
      name_pa: "ਅੱਖਰ ਪਰੇਤ",
      emoji: "👻",
      png: "images/ghost.png",
      tier: 2,
      taunt_en: "Boo! Read me right!",
      taunt_pa: "ਬੂ! ਠੀਕ ਪੜ੍ਹੋ!",
    },

    // ---- Tier 3: Rare (18% of spawns) ----
    {
      id: "shadow",
      name_en: "Shadow Beast",
      name_pa: "ਪਰਛਾਵਾਂ ਜੀਵ",
      emoji: "🦇",
      png: "images/shadow.png",
      tier: 3,
      taunt_en: "Face me, brave one!",
      taunt_pa: "ਮੇਰੇ ਨਾਲ ਲੜੋ, ਬਹਾਦੁਰ!",
    },

    // ---- Tier 4: Elite (7% of spawns) ----
    {
      id: "dragon",
      name_en: "Sky Dragon",
      name_pa: "ਅਸਮਾਨੀ ਡ੍ਰੈਗਨ",
      emoji: "🐲",
      png: "images/dragon.png",
      tier: 4,
      taunt_en: "Prove your power!",
      taunt_pa: "ਆਪਣੀ ਤਾਕਤ ਦਿਖਾਓ!",
    },
  ];

  // Tier weights — sum doesn't matter, picked proportionally.
  const TIER_WEIGHTS = { 1: 40, 2: 35, 3: 18, 4: 7 };

  function pickEnemy(opts) {
    opts = opts || {};
    const exclude = opts.exclude || null;
    // Tier ceiling lets us hide elites for low-rank players.
    const maxTier = Math.max(1, Math.min(4, opts.maxTier || 4));
    // Roll a tier first.
    const eligibleTiers = [1, 2, 3, 4].filter(t => t <= maxTier);
    const total = eligibleTiers.reduce((s, t) => s + (TIER_WEIGHTS[t] || 0), 0);
    let r = Math.random() * total;
    let tier = eligibleTiers[0];
    for (const t of eligibleTiers) {
      r -= (TIER_WEIGHTS[t] || 0);
      if (r <= 0) { tier = t; break; }
    }
    // Pick an enemy from that tier.
    let pool = ENEMIES.filter(e => e.tier === tier && e.id !== exclude);
    if (!pool.length) pool = ENEMIES.filter(e => e.tier === tier);
    if (!pool.length) pool = ENEMIES.slice();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function findEnemy(id) {
    return ENEMIES.find(e => e.id === id) || null;
  }

  window.ENEMIES = ENEMIES;
  window.EnemyAPI = {
    list: ENEMIES,
    pick: pickEnemy,
    find: findEnemy,
  };
})();
