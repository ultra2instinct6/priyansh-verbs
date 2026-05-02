# �⚡ Daroach Learning

A single-track **Learning Ladder** for ages 7–8 (~Grade 1.5 → 3.0). Climb **68 concept blocks across 5 units**, battle **5 bosses**, and stack up Gold Bars.

**449 cards** of progression — built to be long, deep, and fun.

## How to use
1. Open `index.html` in any web browser, **or** serve the folder:
   ```
   python3 -m http.server 8765
   ```
   then visit http://localhost:8765/
2. Just answer cards. Get 3 wrong in a block → KO → restart that block.
   Power Level, Rupees, and Gold are kept across KOs.

## What it teaches
- **English**: nouns, verbs, adjectives, adverbs, prepositions, plurals,
  past/present/future tense, contractions, pronouns, capitals &
  punctuation, commas in lists, quotation marks, prefixes (un-, re-, pre-),
  suffixes (-ful, -less, -ly), silent e, compound words, homophones
  (their/there/they're, to/two/too, your/you're), synonyms & antonyms,
  vocabulary expansion (3 vocab tiers), reading comprehension (short → long),
  cause & effect, main idea.
- **Math**: add/subtract within 20, 100, and 1000; place value to 1000;
  fractions, shapes, measurement, skip counting; multiplication ×2, ×3,
  ×4, ×5, ×6, ×9, ×10; division ÷2, ÷3, ÷4, ÷5; word problems;
  money word problems ($ & ₹); elapsed-time problems; number patterns.
- **Science**: weather, plant life cycle, states of matter
  (solid/liquid/gas), animals & habitats (herbivore/carnivore/omnivore),
  the solar system & planets.
- **Life & social**: calendar, telling time, money basics, body & hygiene,
  food groups & nutrition, community helpers, internet safety, maps,
  continents & oceans, feelings & manners.

## Units
1. 🌍 **Pind Basics** — foundations (10 blocks + Saibaman boss)
2. 🥋 **Dhol Drills** — building (13 blocks + Nappa boss)
3. 💥 **Over 9000!** — advanced (13 blocks + Vegeta boss)
4. 🟡 **Yodha Awakening** — multiplication, division, prefixes/suffixes,
   states of matter, plants (17 blocks + Frieza boss)
5. 🏆 **Galactic Tournament** — bigger math, homophones, planets, oceans,
   nutrition, critical thinking (18 blocks + Cell boss)

## Files
- `index.html` — page structure (HUD, header, footer)
- `styles.css` — theming, animations, confetti / combo CSS
- `ladder.js` — curriculum spine (`LADDER`, `LADDER_FLAT`, `LADDER_VERSION`)
- `app.js` — engine: rendering, scoring, hearts/KO, sound, juice

No build step. No internet needed. State is in `localStorage` under the
`dl_*_v2` keys; bumping `LADDER_VERSION` resets the ladder position only.

Created by Dr. Daroach.
