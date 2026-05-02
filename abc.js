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
  // Phoneme map. `speak` is what TTS says for the letter sound. We avoid
  // adding a schwa to stops (no "buh", "duh", "guh"), and pair every letter
  // with an `example` word the engine plays after the bare sound to make the
  // phoneme unambiguous: "/p/ — as in pat".
  const LETTERS = {
    m: { phoneme: "/m/",  speak: "mmm",  example: "mat" },
    s: { phoneme: "/s/",  speak: "sss",  example: "sat" },
    t: { phoneme: "/t/",  speak: "t",    example: "top",  stop: true },
    p: { phoneme: "/p/",  speak: "p",    example: "pan",  stop: true },
    a: { phoneme: "/a/",  speak: "a",    example: "apple" },
    n: { phoneme: "/n/",  speak: "nnn",  example: "net" },
    i: { phoneme: "/i/",  speak: "i",    example: "igloo" },
    d: { phoneme: "/d/",  speak: "d",    example: "dog",  stop: true },
    o: { phoneme: "/o/",  speak: "o",    example: "octopus" },
    g: { phoneme: "/g/",  speak: "g",    example: "go",   stop: true },
    c: { phoneme: "/k/",  speak: "k",    example: "cat",  stop: true },
    h: { phoneme: "/h/",  speak: "h",    example: "hat" },
    f: { phoneme: "/f/",  speak: "fff",  example: "fan" },
    e: { phoneme: "/e/",  speak: "e",    example: "egg" },
    r: { phoneme: "/r/",  speak: "rrr",  example: "run" },
    b: { phoneme: "/b/",  speak: "b",    example: "ball", stop: true },
    k: { phoneme: "/k/",  speak: "k",    example: "kite", stop: true },
    l: { phoneme: "/l/",  speak: "lll",  example: "log" },
    u: { phoneme: "/u/",  speak: "u",    example: "up" },
    w: { phoneme: "/w/",  speak: "w",    example: "win" },
    j: { phoneme: "/j/",  speak: "j",    example: "jet",  stop: true },
    sh:{ phoneme: "/sh/", speak: "shh",  example: "ship" },
    ch:{ phoneme: "/ch/", speak: "ch",   example: "chip", stop: true },
    th:{ phoneme: "/th/", speak: "th",   example: "thin" },
    z: { phoneme: "/z/",  speak: "zzz",  example: "zip" },
    ee:{ phoneme: "/\u0113/", speak: "ee" },
    ea:{ phoneme: "/\u0113/", speak: "ee" },
    oa:{ phoneme: "/\u014D/", speak: "oh" },
    ai:{ phoneme: "/\u0101/", speak: "ay" },
    ay:{ phoneme: "/\u0101/", speak: "ay" },
    ar:{ phoneme: "/ar/", speak: "ar" },
    or:{ phoneme: "/or/", speak: "or" },
    er:{ phoneme: "/\u025D/", speak: "er" },
    ir:{ phoneme: "/\u025D/", speak: "er" },
    ur:{ phoneme: "/\u025D/", speak: "er" },
    ow:{ phoneme: "/ow/", speak: "ow" },
    ou:{ phoneme: "/ow/", speak: "ow" },
    oi:{ phoneme: "/oi/", speak: "oy" },
    oy:{ phoneme: "/oi/", speak: "oy" },
    ing:{ phoneme: "/ing/", speak: "ing" }
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

  // Word glosses: emoji + Punjabi (Gurmukhi) translation. Used by the engine
  // to tag target words on blend / sentence steps so bilingual learners get
  // immediate meaning support. Kept small and high-frequency; words missing
  // from the map render without a gloss.
  const WORD_GLOSSES = {
    // L1\u2013L8 CVC core
    Sam:  { emoji: "\uD83D\uDC66" }, Pat: { emoji: "\uD83D\uDC67" }, Dad: { emoji: "\uD83D\uDC68" }, Mom: { emoji: "\uD83D\uDC69" },
    cat:  { emoji: "\uD83D\uDC31", pa: "\u0A2C\u0A3F\u0A71\u0A32\u0A40" },
    dog:  { emoji: "\uD83D\uDC36", pa: "\u0A15\u0A41\u0A71\u0A24\u0A3E" },
    pig:  { emoji: "\uD83D\uDC37", pa: "\u0A38\u0A42\u0A30" },
    hen:  { emoji: "\uD83D\uDC14", pa: "\u0A2E\u0A41\u0A30\u0A17\u0A40" },
    rat:  { emoji: "\uD83D\uDC00", pa: "\u0A1A\u0A42\u0A39\u0A3E" },
    bug:  { emoji: "\uD83D\uDC1B", pa: "\u0A15\u0A40\u0A5C\u0A3E" },
    sun:  { emoji: "\u2600\uFE0F", pa: "\u0A38\u0A42\u0A30\u0A1C" },
    cup:  { emoji: "\u2615", pa: "\u0A15\u0A71\u0A2A" },
    hat:  { emoji: "\uD83C\uDFA9", pa: "\u0A1F\u0A4B\u0A2A\u0A40" },
    cap:  { emoji: "\uD83E\uDDE2", pa: "\u0A1F\u0A4B\u0A2A\u0A40" },
    bed:  { emoji: "\uD83D\uDECF\uFE0F", pa: "\u0A2C\u0A3F\u0A38\u0A24\u0A30\u0A3E" },
    bag:  { emoji: "\uD83D\uDC5C", pa: "\u0A2C\u0A48\u0A17" },
    pen:  { emoji: "\uD83D\uDD8A\uFE0F", pa: "\u0A15\u0A32\u0A2E" },
    pan:  { emoji: "\uD83C\uDF73", pa: "\u0A15\u0A5C\u0A3E\u0A39\u0A40" },
    pot:  { emoji: "\uD83C\uDFFA", pa: "\u0A2D\u0A3E\u0A02\u0A21\u0A3E" },
    fan:  { emoji: "\uD83C\uDF00", pa: "\u0A2A\u0A71\u0A16\u0A3E" },
    fish: { emoji: "\uD83D\uDC1F", pa: "\u0A2E\u0A71\u0A1B\u0A40" },
    ham:  { emoji: "\uD83C\uDF56" },
    jet:  { emoji: "\u2708\uFE0F" },
    web:  { emoji: "\uD83D\uDD78\uFE0F" },
    // L9\u2013L12
    frog: { emoji: "\uD83D\uDC38", pa: "\u0A21\u0A71\u0A21\u0A42" },
    crab: { emoji: "\uD83E\uDD80" },
    flag: { emoji: "\uD83C\uDFC1" },
    drum: { emoji: "\uD83E\uDD41" },
    ship: { emoji: "\uD83D\uDEA2" },
    chip: { emoji: "\uD83C\uDF5F" },
    cake: { emoji: "\uD83C\uDF82", pa: "\u0A15\u0A47\u0A15" },
    bike: { emoji: "\uD83D\uDEB2" },
    snake:{ emoji: "\uD83D\uDC0D", pa: "\u0A38\u0A71\u0A2A" },
    flame:{ emoji: "\uD83D\uDD25" },
    plate:{ emoji: "\uD83C\uDF7D\uFE0F" },
    globe:{ emoji: "\uD83C\uDF0D" },
    // L13\u2013L20
    tree: { emoji: "\uD83C\uDF33", pa: "\u0A30\u0A41\u0A71\u0A16" },
    leaf: { emoji: "\uD83C\uDF43", pa: "\u0A2A\u0A71\u0A24\u0A3E" },
    beach:{ emoji: "\uD83C\uDFD6\uFE0F" },
    seat: { emoji: "\uD83D\uDC8E" },
    boat: { emoji: "\u26F5", pa: "\u0A15\u0A3F\u0A36\u0A24\u0A40" },
    rain: { emoji: "\uD83C\uDF27\uFE0F", pa: "\u0A2E\u0A40\u0A02\u0A39" },
    train:{ emoji: "\uD83D\uDE82" },
    coat: { emoji: "\uD83E\uDDE5" },
    car:  { emoji: "\uD83D\uDE97", pa: "\u0A17\u0A71\u0A21\u0A40" },
    star: { emoji: "\u2B50" },
    fork: { emoji: "\uD83C\uDF74" },
    bird: { emoji: "\uD83D\uDC26", pa: "\u0A2A\u0A70\u0A1B\u0A40" },
    girl: { emoji: "\uD83D\uDC67", pa: "\u0A15\u0A41\u0A5C\u0A40" },
    boy:  { emoji: "\uD83D\uDC66", pa: "\u0A2E\u0A41\u0A70\u0A21\u0A3E" },
    cow:  { emoji: "\uD83D\uDC04", pa: "\u0A17\u0A3E\u0A02" },
    coin: { emoji: "\uD83E\uDE99" },
    rabbit:{ emoji: "\uD83D\uDC07", pa: "\u0A16\u0A30\u0A17\u0A4B\u0A36" },
    kitten:{ emoji: "\uD83D\uDC08" },
    sunset:{ emoji: "\uD83C\uDF06" },
    picnic:{ emoji: "\uD83E\uDDFA" },
    basket:{ emoji: "\uD83E\uDDFA" },
    muffin:{ emoji: "\uD83E\uDDC1" }
  };

  // 5 progressive levels. Each adds 1–2 new letters + new decodable words.
  const LEVELS = [
    {
      id: "L1",
      title: "Level 1: First Sounds",
      lesson: "Letters make sounds. Tap a letter to hear its sound.",
      objective: "I can hear and tap the first sound in a word.",
      letters: ["m", "s", "t", "p", "a"],
      words:   WORDS,
      sentences: SENTENCES
    },
    {
      id: "L2",
      title: "Level 2: Add n, i",
      lesson: "Each new letter adds new words you can read.",
      objective: "I can read CVC words with i and n.",
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
      objective: "I can read CVC words with d and o.",
      story: ["Dad sat on a mat.", "A pot is on top.", "Sam tips it. Dad is sad."],
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
      objective: "I can read words with c and g, like cat and dog.",
      story: ["A cat sat on a mat.", "The dog can dig a pit.", "Pat got a pig in a pen."],
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
      objective: "I can read words with h and f.",
      story: ["Sam has a hat.", "The fan is on. The fog is gone.", "Pat hid the ham in a pan."],
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
      objective: "I can read words with e and r.",
      story: ["The hen ran to her pen.", "Sam has a red pen.", "Pat got ten nets for the rat."],
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
      objective: "I can read words with b, k, l.",
      story: ["The kid has a big bag.", "A log fell on the lap.", "Pat sat on the bed and lift the lid."],
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
      objective: "I can read words with u, w, j.",
      story: ["The bug is on the cup.", "Sam can run in the sun.", "The jet is fast. We win!"],
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
      lesson: "A blend is two letters that keep BOTH sounds: s-t \u2192 \u201cst\u201d.",
      objective: "I can read consonant blends like st, pl, fr.",
      story: ["The frog jumps to the spot.", "Sam has a plan to clip the flag.", "Stop! The crab is in the mud."],
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
      lesson: "A digraph is two letters that make ONE new sound: s+h \u2192 /sh/.",
      objective: "I can read digraphs sh, ch, th.",
      story: ["The ship is at the shop.", "Chop a chip for the dish.", "This thin fish is for that chin."],
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
      lesson: "Magic e at the end makes the vowel say its name: cap \u2192 cape.",
      objective: "I can read magic-e words like cake, bike, home.",
      story: ["I like to bake a cake.", "The bike rides home by the lake.", "It is time. The cute pup has a bone."],
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
      objective: "I can mix what I have learned to read longer words.",
      story: ["The snake is on a plate.", "I won the prize and a trike.", "Chase the crane to the globe."],
      letters: ["a","e","i","o","u","sh","ch","th","s","t","p","n","r","l","k","b","d","m","f","h","g","z"],
      words:   ["shape", "chase", "these", "trike", "plate", "snake", "flame", "globe", "prize", "crane"],
      sentences: [
        { text: "The snake is on the plate.", q: "Where is the snake?", a: "plate", choices: ["plate","globe","crane"] },
        { text: "I won the prize.",      q: "What did I win?",   a: "prize", choices: ["prize","trike","flame"] },
        { text: "The crane has a long neck.", q: "What has a long neck?", a: "crane", choices: ["crane","snake","globe"] },
        { text: "Chase the trike home.", q: "Chase the what?",  a: "trike", choices: ["trike","plate","shape"] },
        { text: "These shapes are blue.", q: "What is blue?",   a: "shape", choices: ["shape","globe","flame"] }
      ]
    },
    {
      id: "L13",
      title: "Level 13: Vowel Teams ee, ea",
      lesson: "Vowel teams ee and ea both say the long e sound: /\u0113/.",
      objective: "I can read vowel teams ee and ea.",
      story: ["I see a tree by the beach.", "Feed the team some meat.", "The leaf fell on the seat."],
      letters: ["a","e","i","o","u","ee","ea","s","t","p","n","r","l","f","b","d","m","h","ch"],
      words:   ["see", "feet", "tree", "feed", "leaf", "read", "team", "seat", "beach", "meat"],
      sentences: [
        { text: "I see a tree.",       q: "What do I see?",     a: "tree", choices: ["tree","leaf","feet"] },
        { text: "Feed the team.",      q: "Feed the what?",     a: "team", choices: ["team","tree","seat"] },
        { text: "The leaf fell.",      q: "What fell?",          a: "leaf", choices: ["leaf","beach","seat"] },
        { text: "I read at the beach.", q: "Where do I read?",   a: "beach", choices: ["beach","seat","tree"] },
        { text: "Take a seat.",        q: "Take a what?",        a: "seat", choices: ["seat","feet","meat"] }
      ]
    },
    {
      id: "L14",
      title: "Level 14: Vowel Teams oa, ai, ay",
      lesson: "Vowel teams oa, ai, ay say long o (\u014D) and long a (\u0101).",
      objective: "I can read vowel teams oa, ai, ay.",
      story: ["The boat is on the road.", "It will rain on the train today.", "We may play in the day."],
      letters: ["a","e","i","o","u","oa","ai","ay","s","t","p","n","r","l","b","d","m","c"],
      words:   ["boat", "coat", "road", "soap", "rain", "train", "pain", "day", "play", "may"],
      sentences: [
        { text: "The boat is on the road.", q: "Where is the boat?", a: "road", choices: ["road","rain","play"] },
        { text: "It will rain today.",   q: "What will happen?",  a: "rain", choices: ["rain","play","train"] },
        { text: "I play in the day.",    q: "When do I play?",    a: "day", choices: ["day","may","pain"] },
        { text: "The train is fast.",    q: "What is fast?",      a: "train", choices: ["train","boat","coat"] },
        { text: "Pat has a red coat.",   q: "What does Pat have?", a: "coat", choices: ["coat","soap","road"] }
      ]
    },
    {
      id: "L15",
      title: "Level 15: Bossy R (ar, or, er, ir, ur)",
      lesson: "Bossy R changes the vowel: ar, or, er, ir, ur.",
      objective: "I can read bossy-r words like car, bird, fork.",
      story: ["The car has a star.", "The bird can turn at the fork.", "The girl can stir the pot."],
      letters: ["a","e","i","o","u","ar","or","er","ir","ur","c","s","t","p","n","f","b","d","h","g","l","k"],
      words:   ["car", "star", "fork", "born", "fern", "bird", "stir", "hurt", "turn", "girl"],
      sentences: [
        { text: "The car has a star.",  q: "What has a star?",   a: "car", choices: ["car","fork","bird"] },
        { text: "The bird can turn.",   q: "Who can turn?",      a: "bird", choices: ["bird","fern","star"] },
        { text: "Her fork is hot.",     q: "What is hot?",       a: "fork", choices: ["fork","fern","car"] },
        { text: "Stir the pot.",        q: "Stir the what?",     a: "pot", choices: ["pot","fork","bird"] },
        { text: "The girl can run.",    q: "Who can run?",       a: "girl", choices: ["girl","bird","fern"] }
      ]
    },
    {
      id: "L16",
      title: "Level 16: Diphthongs (ow, ou, oi, oy)",
      lesson: "Diphthongs slide two sounds: ow/ou (cow) and oi/oy (boy).",
      objective: "I can read diphthongs ow, ou, oi, oy.",
      story: ["The cow is loud now.", "I found a coin out by the boat.", "The boy has joy. Do not shout!"],
      letters: ["a","e","i","o","u","ow","ou","oi","oy","c","t","n","l","b","d","f","j","s","p","h"],
      words:   ["cow", "now", "down", "out", "loud", "shout", "coin", "boil", "boy", "joy"],
      sentences: [
        { text: "The cow is loud.",     q: "What is loud?",      a: "cow", choices: ["cow","boy","coin"] },
        { text: "Sit down now.",        q: "Sit down when?",     a: "now", choices: ["now","out","joy"] },
        { text: "I found a coin.",      q: "What did I find?",   a: "coin", choices: ["coin","cow","boy"] },
        { text: "The boy has joy.",     q: "Who has joy?",       a: "boy", choices: ["boy","cow","coin"] },
        { text: "Do not shout.",        q: "Do not what?",       a: "shout", choices: ["shout","boil","down"] }
      ]
    },
    {
      id: "L17",
      title: "Level 17: Add -ing Suffix",
      lesson: "Add -ing to a verb to show it is happening now: jump \u2192 jumping.",
      objective: "I can read -ing verbs like jumping and running.",
      story: ["Sam is jumping in the sun.", "The dog is running and the bird is singing.", "Pat is helping Mom with the dish."],
      letters: ["a","e","i","o","u","ing","s","t","p","n","r","l","k","b","d","m","f","h","g","j","c","w","y"],
      words:   ["jumping", "running", "singing", "ringing", "helping", "hopping", "fishing", "talking", "playing", "yelling"],
      sentences: [
        { text: "Sam is jumping.",      q: "Who is jumping?",    a: "Sam", choices: ["Sam","Pat","Dad"] },
        { text: "The dog is running.",  q: "Who is running?",    a: "dog", choices: ["dog","cat","bird"] },
        { text: "Pat is singing a song.", q: "What is Pat doing?", a: "singing", choices: ["singing","playing","talking"] },
        { text: "The bell is ringing.", q: "What is ringing?",   a: "bell", choices: ["bell","dog","cat"] },
        { text: "She is helping Mom.",  q: "Who is she helping?", a: "Mom", choices: ["Mom","Dad","Sam"] }
      ]
    },
    {
      id: "L18",
      title: "Level 18: Sight Words",
      lesson: "Sight words don\u2019t play by the rules \u2014 we just learn them by sight!",
      objective: "I can read tricky sight words by sight.",
      story: ["The cat is here.", "She said hi to my friend.", "He was at home. They are happy."],
      letters: ["the","a","is","of","was","said","you","are","to","my","he","she","we","they","it"],
      sightOnly: true,
      words:   ["the", "is", "was", "said", "you", "are", "my", "he", "she", "they"],
      sentences: [
        { text: "The cat is here.",      q: "Which word means \"only one\"?", a: "the", choices: ["the","you","my"] },
        { text: "She said hi.",          q: "Which word tells what she did?", a: "said", choices: ["said","is","are"] },
        { text: "You are my friend.",    q: "Which word means \"belongs to me\"?", a: "my", choices: ["my","you","he"] },
        { text: "He was here.",          q: "Which word is the boy?",          a: "he", choices: ["he","she","they"] },
        { text: "They are happy.",       q: "Which word means more than one person?", a: "they", choices: ["they","he","she"] }
      ]
    },
    {
      id: "L19",
      title: "Level 19: Two-Syllable Readers",
      lesson: "Big words split into syllables. Clap once for each beat: rab\u00b7bit.",
      objective: "I can clap and read two-syllable words.",
      story: ["The rab·bit hid in a bas·ket.", "We had a pic·nic at sun·set.", "The kit·ten ate a muf·fin."],
      letters: ["a","e","i","o","u","s","t","p","n","r","l","k","b","d","m","f","h","g","c"],
      words:   ["sunset", "picnic", "magnet", "rabbit", "basket", "kitten", "muffin", "napkin", "puppet", "tablet"],
      twoSyllable: {
        sunset:  ["sun","set"],
        picnic:  ["pic","nic"],
        magnet:  ["mag","net"],
        rabbit:  ["rab","bit"],
        basket:  ["bas","ket"],
        kitten:  ["kit","ten"],
        muffin:  ["muf","fin"],
        napkin:  ["nap","kin"],
        puppet:  ["pup","pet"],
        tablet:  ["tab","let"]
      },
      sentences: [
        { text: "The rabbit hid.",      q: "Who hid?",           a: "rabbit", choices: ["rabbit","kitten","puppet"] },
        { text: "We had a picnic.",     q: "What did we have?",  a: "picnic", choices: ["picnic","sunset","muffin"] },
        { text: "The kitten is small.", q: "What is small?",     a: "kitten", choices: ["kitten","rabbit","tablet"] },
        { text: "I see the sunset.",    q: "What do I see?",     a: "sunset", choices: ["sunset","magnet","basket"] },
        { text: "Put it in the basket.", q: "Put it in the what?", a: "basket", choices: ["basket","napkin","muffin"] }
      ]
    },
    {
      id: "L20",
      title: "Level 20: Boss \u2014 Story Read",
      lesson: "Boss round! Read the story, then answer each question carefully.",
      objective: "I can read a short story and answer questions.",
      letters: ["a","e","i","o","u","sh","ch","th","s","t","p","n","r","l","k","b","d","m","f","h","g","w","ee","ai","oa"],
      bossMode: true,
      story: [
        "Sam took the boat to the lake.",
        "He saw a big green frog.",
        "The frog hopped on a leaf.",
        "Sam said, that is so neat!"
      ],
      words:   ["boat", "lake", "green", "frog", "leaf", "took", "saw", "neat", "said", "hop"],
      sentences: [
        { text: "Sam took the boat to the lake.", q: "Where did Sam go?", a: "lake", choices: ["lake","park","river"] },
        { text: "The frog hopped on a leaf.",     q: "Where did the frog hop?", a: "leaf", choices: ["leaf","rock","boat"] },
        { text: "Sam saw a big green frog.",      q: "What color was the frog?", a: "green", choices: ["green","red","blue"] },
        { text: "Sam said it was neat.",          q: "What did Sam say?", a: "neat", choices: ["neat","loud","old"] },
        { text: "He took the boat.",              q: "Who took the boat?", a: "Sam", choices: ["Sam","Pat","Dad"] }
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
    const earned = score >= 10 ? 3 : score >= 9 ? 2 : score >= 7 ? 1 : 0;
    p.starsPerLevel = p.starsPerLevel || {};
    const _lvlIdNow = (state.level && state.level.id) || "";
    const _prev = p.starsPerLevel[_lvlIdNow] || 0;
    let starsDelta = 0;
    if (earned > _prev) {
      starsDelta = earned - _prev;
      p.starsPerLevel[_lvlIdNow] = earned;
      p.stars = (p.stars || 0) + starsDelta;
    }

    // -----------------------------------------------------------------
    // Bridge: pay improvement into the main game economy (rupees + power
    // + gold). Awards only on stars *gained* this session, never twice.
    //   1 star  =>  60 rupees + 250 power
    //   2 stars => 150 rupees + 600 power
    //   3 stars => 320 rupees + 1300 power + 1 gold bar (10 coins)
    // -----------------------------------------------------------------
    if (starsDelta > 0 && window.VTK && typeof window.VTK.reward === "function") {
      const TIER = {
        1: { rupees:  60, power:  250, gold:  0 },
        2: { rupees: 150, power:  600, gold:  0 },
        3: { rupees: 320, power: 1300, gold: 10 }
      };
      // Sum tiers for each newly-earned star step.
      let rupees = 0, power = 0, gold = 0;
      for (let s = _prev + 1; s <= earned; s++) {
        rupees += TIER[s].rupees;
        power  += TIER[s].power;
        gold   += TIER[s].gold;
      }
      const lvlNum = (LEVELS.findIndex(l => l === state.level) + 1) || 1;
      const starGlyph = "\u2B50".repeat(starsDelta);
      try {
        window.VTK.reward({
          rupees, power, gold,
          confetti: starsDelta * 12,
          message: {
            en: `${starGlyph} ABC L${lvlNum} +\u20B9${rupees} +${power}\u26A1${gold ? ` +${gold}\uD83E\uDE99` : ""}`,
            pa: `${starGlyph} ABC L${lvlNum} +\u20B9${rupees} +${power}\u26A1${gold ? ` +${gold}\uD83E\uDE99` : ""}`
          }
        });
        // Remember last bridge payout for the reward screen UI.
        p.lastBridge = { rupees, power, gold, stars: starsDelta, lvl: lvlNum };
      } catch (_) {}
    }

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
    if (!L) return;
    // Stops (b, d, g, k, p, t, c, j, ch) need a clipped sound + example word
    // because TTS swallows a bare consonant. Continuants (m, s, f, n, l, r,
    // sh, th, z, vowels) can stand alone.
    if (L.stop && L.example) {
      try {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const u1 = new SpeechSynthesisUtterance(L.speak);
        u1.lang = "en-US"; u1.rate = 0.55; u1.pitch = 1.0; u1.volume = 1;
        const u2 = new SpeechSynthesisUtterance(L.example);
        u2.lang = "en-US"; u2.rate = 0.75; u2.pitch = 1.0; u2.volume = 1;
        window.speechSynthesis.speak(u1);
        window.speechSynthesis.speak(u2);
      } catch (_) {}
    } else {
      speak(L.speak, { rate: 0.6 });
    }
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
  // Spaced-review weighted pick. Uses lifetime stats: items where the child has
  // missed more than they got right are 3x more likely to be selected. New
  // (unseen) items get a moderate 1.5x boost so the engine introduces them.
  function pickWeighted(arr, kind) {
    if (!arr || !arr.length) return null;
    let stats = null;
    try {
      const p = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
      stats = (p.lifetime && p.lifetime[kind]) || {};
    } catch (_) { stats = {}; }
    const weights = arr.map(item => {
      const t = stats[item];
      if (!t) return 1.5;                       // unseen → moderate boost
      const tot = t.correct + t.wrong;
      if (tot === 0) return 1.5;
      const accuracy = t.correct / tot;
      if (accuracy < 0.5) return 3.0;            // weak → strong boost
      if (accuracy < 0.8) return 2.0;            // shaky → medium boost
      return 1.0;                                // mastered → baseline
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
      r -= weights[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
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
          <div class="abc-reward-card"><div class="abc-reward-icon">\uD83D\uDFE8</div><div>Gold Bars</div><strong>${Math.floor((p.stars || 0) / 7)}</strong></div>
        </div>
        <button class="abc-cta" id="abc-rew-back">\u2190 Home</button>
      </section>
    `;
    body.querySelector("#abc-rew-back").addEventListener("click", () => go("home"));
  }

  function renderLevel(body) {
    const p = loadProgress();
    if (!state.level) state.level = LEVELS[0];
    const lvl = state.level;
    const cards = LEVELS.map((L, idx) => {
      const stars = (p.starsPerLevel && p.starsPerLevel[L.id]) || 0;
      // Unlock rule: L1 always open; later levels open once previous level has ≥1 star
      const prevStars = idx === 0 ? 99 : ((p.starsPerLevel && p.starsPerLevel[LEVELS[idx-1].id]) || 0);
      const locked = false; // TEMP: all levels unlocked for testing
      const isSel  = L.id === lvl.id;
      const starHtml = [0,1,2].map(k => k < stars ? "\u2605" : "\u2606").join("");
      const lockTag = locked ? '<span class="abc-lvl-lock">\uD83D\uDD12</span>' : "";
      return `
        <button class="abc-lvl-card ${isSel ? "sel" : ""} ${locked ? "locked" : ""}" data-lvl="${L.id}" ${locked ? "disabled" : ""}>
          <div class="abc-lvl-card-id">${L.id} ${lockTag}</div>
          <div class="abc-lvl-card-title">${escHtml(L.title.replace(/^Level \d+:\s*/, ""))}</div>
          <div class="abc-lvl-card-stars">${starHtml}</div>
        </button>`;
    }).join("");
    body.innerHTML = `
      <section class="abc-level">
        <h3 class="abc-h3">Pick a Level</h3>
        <div class="abc-lvl-grid">${cards}</div>
        <div class="abc-lvl-detail">
          <h4 class="abc-h4">${escHtml(lvl.title)}</h4>
          ${lvl.lesson ? `<div class="abc-lesson"><span class="abc-lesson-icon">\uD83D\uDCD6</span><span class="abc-lesson-text">${escHtml(lvl.lesson)}${lvl.objective ? `<div class="abc-objective"><b>I can:</b> ${escHtml(lvl.objective)}</div>` : ""}</span></div>` : ""}
          <p class="abc-sub">Sounds you'll practice (tap to hear):</p>
          <div class="abc-letter-row">
            ${lvl.letters.map(k => LETTERS[k] ? `
              <button class="abc-letter-tile" data-letter="${k}">
                <span class="abc-letter-big">${k}</span>
                <span class="abc-letter-phn">${LETTERS[k].phoneme}</span>
              </button>
            ` : `<button class="abc-letter-tile sight" data-sight="${k}"><span class="abc-letter-big">${k}</span></button>`).join("")}
          </div>
        </div>
        <div class="abc-level-actions">
          <button class="abc-cta primary" id="abc-level-start">\u25B6 Start Level</button>
          <button class="abc-cta" id="abc-level-back">\u2190 Home</button>
        </div>
      </section>
    `;
    body.querySelectorAll(".abc-lvl-card").forEach(c => {
      c.addEventListener("click", () => {
        const id = c.dataset.lvl;
        const next = LEVELS.find(x => x.id === id);
        if (next) { state.level = next; render(); }
      });
    });
    body.querySelectorAll(".abc-letter-tile").forEach(t => {
      t.addEventListener("click", () => {
        if (t.dataset.letter) speakLetter(t.dataset.letter);
        else if (t.dataset.sight) speakWord(t.dataset.sight);
      });
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

  // Build a ~10-step round: phonemic awareness (rhyme) when possible,
  // sound-match, letter-to-sound, blend, encoding (spell), sentence.
  function generateRound(level) {
    const steps = [];
    const letters = level.letters;

    // ---- Phonemic awareness: rhyme step (only when level has ≥2 same-suffix words)
    function buildRhymeStep() {
      if (level.sightOnly || level.bossMode) return null;
      const groups = {};
      (level.words || []).forEach(w => {
        const k = String(w).toLowerCase().slice(-2);
        (groups[k] = groups[k] || []).push(w);
      });
      const rhymeKeys = Object.keys(groups).filter(k => groups[k].length >= 2);
      if (!rhymeKeys.length) return null;
      const k = rhymeKeys[(Math.random() * rhymeKeys.length) | 0];
      const pair = shuffle(groups[k]).slice(0, 2);
      const target = pair[0];
      const rhyme  = pair[1];
      const distractorPool = (level.words || []).filter(w =>
        String(w).toLowerCase().slice(-2) !== k);
      const distractors = pickN(distractorPool, 2, []);
      if (distractors.length < 2) return null;
      const choices = shuffle([rhyme, ...distractors]);
      return {
        type: "rhyme",
        prompt: `Which word rhymes with "${target}"?`,
        target: rhyme,
        targetWord: target,
        choices,
        replay: () => speakWord(target),
        statKind: "word", statKey: target
      };
    }

    // ---- Encoding (spell) step: child rebuilds word from sound tiles.
    function buildSpellStep() {
      if (level.sightOnly || level.bossMode) return null;
      const word = pickWeighted(level.words, "words") || pick(level.words);
      let tiles;
      if (level.twoSyllable && level.twoSyllable[word]) tiles = level.twoSyllable[word];
      else tiles = tokenizeWord(word, level.letters);
      if (!tiles || tiles.length < 2) return null;
      const scrambled = shuffle(tiles.slice());
      // Avoid the unlikely case the scramble equals the answer.
      if (scrambled.join("|") === tiles.join("|") && tiles.length > 1) {
        [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
      }
      return {
        type: "spell",
        prompt: `Spell the word: tap the tiles in order.`,
        target: tiles.join("|"),
        word,
        tiles,
        scrambled,
        replay: () => speakWord(word),
        statKind: "word", statKey: word
      };
    }


    // Identify which optional steps fit this level so we can budget away from
    // the fixed loops to keep total step count near CONFIG.stepsPerRound.
    const _earlyLvlIdx = LEVELS.findIndex(l => l === level);
    const _isEarly = _earlyLvlIdx >= 0 && _earlyLvlIdx <= 5; // L1–L6
    const _wantRhyme = _isEarly && !level.bossMode && !level.sightOnly;
    const _wantSpell = !level.bossMode && !level.sightOnly;
    const soundN  = level.bossMode ? 2 : (CONFIG.soundMatchSteps - (_wantRhyme ? 1 : 0));
    const letterN = level.bossMode ? 2 : CONFIG.letterToSoundSteps;
    const phonicPool = letters.filter(k => LETTERS[k]);
    // Group letters by phoneme so sound-match never has 2 correct answers.
    // For sound-match we keep one representative per phoneme; the prompt uses
    // an example word ("Tap the letter that starts `cat`") to disambiguate.
    const byPhoneme = {};
    phonicPool.forEach(k => {
      const ph = LETTERS[k].phoneme;
      (byPhoneme[ph] = byPhoneme[ph] || []).push(k);
    });
    const uniquePhonemePool = phonicPool.filter(k => byPhoneme[LETTERS[k].phoneme][0] === k);
    for (let i = 0; i < soundN; i++) {
      const target = pickWeighted(uniquePhonemePool, "sounds") || pick(uniquePhonemePool);
      // Distractors: only letters whose phoneme is different from target's,
      // so all 3 buttons map to distinct sounds.
      const targetPh = LETTERS[target].phoneme;
      const distractorPool = phonicPool.filter(k => LETTERS[k].phoneme !== targetPh);
      const choices = shuffle([target, ...pickN(distractorPool, 2, [target])]);
      const ex = LETTERS[target].example;
      const promptText = ex
        ? `Tap the letter that starts the word "${ex}" (${LETTERS[target].phoneme})`
        : `Tap the letter that says ${LETTERS[target].phoneme}`;
      steps.push({
        type: "sound-match",
        prompt: promptText,
        replay: () => speakLetter(target),
        target, choices,
        statKind: "sound", statKey: target
      });
    }

    for (let i = 0; i < letterN; i++) {
      const target = pickWeighted(uniquePhonemePool, "sounds") || pick(uniquePhonemePool);
      const targetPh = LETTERS[target].phoneme;
      const distractorPool = phonicPool.filter(k => LETTERS[k].phoneme !== targetPh);
      const choices = shuffle([target, ...pickN(distractorPool, 2, [target])]).map(k => LETTERS[k].phoneme);
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

    const blendStepsN = level.bossMode ? 2 : (CONFIG.blendSteps - (_wantSpell ? 1 : 0));
    for (let i = 0; i < blendStepsN; i++) {
      const word = pickWeighted(level.words, "words") || pick(level.words);
      const choices = shuffle([word, ...pickN(level.words, 2, [word])]);
      let tiles;
      if (level.sightOnly) tiles = [word];
      else if (level.twoSyllable && level.twoSyllable[word]) tiles = level.twoSyllable[word];
      else tiles = tokenizeWord(word, level.letters);
      steps.push({
        type: "blend",
        prompt: "What word did you make?",
        word,
        letters: tiles,
        replay: () => speakWord(word),
        target: word, choices,
        statKind: "word", statKey: word
      });
    }

    if (_wantSpell) {
      const sp = buildSpellStep();
      if (sp) steps.push(sp);
    }
    const sentenceCount = level.bossMode ? 2 : 1;
    const used = [];
    for (let i = 0; i < sentenceCount; i++) {
      const pool = level.sentences.filter(x => !used.includes(x));
      const s = pick(pool.length ? pool : level.sentences);
      used.push(s);
      steps.push({
        type: "sentence",
        prompt: s.q,
        sentence: s.text,
        story: i === 0 ? level.story || null : null,
        replay: () => speakSentence(s.text),
        target: s.a,
        choices: shuffle(s.choices),
        statKind: "word", statKey: s.a
      });
    }

    if (_wantRhyme) {
      const rh = buildRhymeStep();
      if (rh) steps.unshift(rh);
    }
    return steps;
  }

  // Greedy left-to-right tokenizer: prefers longer multi-char letter tiles
  // (e.g. "ai", "sh", "ing") when they appear in the level letter inventory.
  function tokenizeWord(word, levelLetters) {
    const allowed = new Set((levelLetters || []).map(s => s.toLowerCase()));
    const w = word.toLowerCase();
    const out = [];
    let i = 0;
    while (i < w.length) {
      let matched = null;
      for (const len of [3, 2]) {
        const slice = w.slice(i, i + len);
        if (slice.length === len && allowed.has(slice)) { matched = slice; break; }
      }
      if (!matched) matched = w[i];
      out.push(matched);
      i += matched.length;
    }
    return out;
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
      const g = WORD_GLOSSES[step.word] || WORD_GLOSSES[String(step.word).toLowerCase()];
      const glossHtml = g
        ? `<div class="abc-gloss"><span class="abc-gloss-emoji">${g.emoji || ""}</span>${g.pa ? `<span class="abc-gloss-pa pa" lang="pa">${escHtml(g.pa)}</span>` : ""}</div>`
        : "";
      challenge = `
        <div class="abc-prompt small">Tap each sound, then say the word.</div>
        <div class="abc-blend-row">
          ${step.letters.map((c, i) => `
            <button class="abc-blend-tile" data-blend="${escHtml(c)}">${escHtml(c)}</button>
            ${i < step.letters.length - 1 ? '<span class="abc-blend-sep">\u2014</span>' : ''}
          `).join("")}
        </div>
        ${glossHtml}
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
      `;
    } else if (step.type === "rhyme") {
      challenge = `
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
        <div class="abc-rhyme-hero">
          <span class="abc-rhyme-word">${escHtml(step.targetWord)}</span>
          <button class="abc-mini" id="abc-rhyme-replay">\uD83D\uDD0A</button>
        </div>
        <div class="abc-prompt small">Listen for the ending sound.</div>
      `;
    } else if (step.type === "spell") {
      const g = WORD_GLOSSES[step.word] || WORD_GLOSSES[String(step.word).toLowerCase()];
      const glossHtml = g
        ? `<div class="abc-gloss"><span class="abc-gloss-emoji">${g.emoji || ""}</span>${g.pa ? `<span class="abc-gloss-pa pa" lang="pa">${escHtml(g.pa)}</span>` : ""}</div>`
        : "";
      challenge = `
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
        ${glossHtml}
        <div class="abc-spell-slots" id="abc-spell-slots" data-target="${escHtml(step.target)}" data-len="${step.tiles.length}">
          ${step.tiles.map((_, i) => `<div class="abc-spell-slot" data-i="${i}"></div>`).join("")}
        </div>
        <div class="abc-spell-bank" id="abc-spell-bank">
          ${step.scrambled.map((t, i) => `<button class="abc-spell-tile" data-tile="${escHtml(t)}" data-bi="${i}">${escHtml(t)}</button>`).join("")}
        </div>
        <button class="abc-mini" id="abc-spell-undo">\u21A9 Undo</button>
      `;
    } else if (step.type === "sentence") {
      const storyHtml = step.story
        ? `<div class="abc-story">${step.story.map(line => `<div>${escHtml(line)}</div>`).join("")}</div>`
        : "";
      // Optional bilingual gloss for the answer word (helps EAL/Punjabi kids).
      const g = WORD_GLOSSES[step.target] || WORD_GLOSSES[String(step.target).toLowerCase()];
      const glossHtml = g
        ? `<div class="abc-gloss"><span class="abc-gloss-emoji">${g.emoji || ""}</span>${g.pa ? `<span class="abc-gloss-pa pa" lang="pa">${escHtml(g.pa)}</span>` : ""}</div>`
        : "";
      challenge = `
        ${storyHtml}
        <div class="abc-sentence">${escHtml(step.sentence)}</div>
        <div class="abc-prompt">${escHtml(step.prompt)}</div>
        ${glossHtml}
      `;
    }

    const lessonBanner = (state.level.lesson && state.stepIdx === 0)
      ? `<div class="abc-lesson"><span class="abc-lesson-icon">\uD83D\uDCD6</span><span class="abc-lesson-text">${escHtml(state.level.lesson)}${state.level.objective ? `<div class="abc-objective"><b>Today I can:</b> ${escHtml(state.level.objective)}</div>` : ""}</span></div>`
      : "";
    body.innerHTML = `
      <section class="abc-game">
        <div class="abc-game-top">
          <div class="abc-level-name">${escHtml(state.level.title)}</div>
          <div class="abc-progress">Step ${state.stepIdx + 1}/${state.round.length}</div>
        </div>
        ${lessonBanner}

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

    // Rhyme replay button
    const rhymeReplay = body.querySelector("#abc-rhyme-replay");
    if (rhymeReplay) rhymeReplay.addEventListener("click", () => step.replay && step.replay());

    // Spell (encoding) tile interactions
    const slots = body.querySelector("#abc-spell-slots");
    const bank  = body.querySelector("#abc-spell-bank");
    if (slots && bank) {
      const targetParts = String(slots.dataset.target).split("|");
      const slotEls = Array.from(slots.querySelectorAll(".abc-spell-slot"));
      let cursor = 0;
      function checkComplete() {
        if (cursor < slotEls.length) return;
        const built = slotEls.map(el => el.dataset.value || "").join("|");
        const ok = built === slots.dataset.target;
        const fb = body.querySelector("#abc-feedback");
        if (ok) {
          fb.textContent = pick(PRAISE);
          fb.className = "abc-feedback ok";
          recordAnswer(step.statKind, step.statKey, true);
          try { window.GameAPI && GameAPI.SFX && GameAPI.SFX.correct && GameAPI.SFX.correct(); } catch (_) {}
          setTimeout(() => { state.stepIdx++; state.attempts = 0;
            if (state.stepIdx >= state.round.length) finishRound();
            else render();
          }, 850);
        } else {
          fb.textContent = "Not quite. Tap Undo and try again.";
          fb.className = "abc-feedback bad";
          state.attempts++;
          recordAnswer(step.statKind, step.statKey, false);
          if (state.attempts >= 2) {
            // Reveal correct order then advance.
            slotEls.forEach((el, i) => { el.textContent = targetParts[i]; el.classList.add("revealed"); });
            speakWord(step.word);
            setTimeout(() => { state.stepIdx++; state.attempts = 0;
              if (state.stepIdx >= state.round.length) finishRound();
              else render();
            }, 1400);
          }
        }
      }
      bank.querySelectorAll(".abc-spell-tile").forEach(btn => {
        btn.addEventListener("click", () => {
          if (btn.disabled || cursor >= slotEls.length) return;
          const slot = slotEls[cursor];
          slot.textContent = btn.textContent;
          slot.dataset.value = btn.dataset.tile;
          slot.dataset.fromBi = btn.dataset.bi;
          slot.classList.add("filled");
          btn.disabled = true;
          btn.classList.add("used");
          speakLetter(btn.dataset.tile);
          cursor++;
          if (cursor === slotEls.length) checkComplete();
        });
      });
      const undo = body.querySelector("#abc-spell-undo");
      if (undo) undo.addEventListener("click", () => {
        if (cursor === 0) return;
        cursor--;
        const slot = slotEls[cursor];
        const bi = slot.dataset.fromBi;
        slot.textContent = ""; slot.dataset.value = ""; slot.dataset.fromBi = "";
        slot.classList.remove("filled");
        const btn = bank.querySelector(`.abc-spell-tile[data-bi="${bi}"]`);
        if (btn) { btn.disabled = false; btn.classList.remove("used"); }
      });
    }
  }

  function renderLadder(stepIdx) {
    const rungs = [];
    for (let i = state.round.length; i >= 1; i--) {
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
      try { window.GameAPI && GameAPI.SFX && GameAPI.SFX.correct && GameAPI.SFX.correct(); } catch (_) {}
      fb.textContent = pick(PRAISE);
      fb.className = "abc-feedback ok";
      bodyEl().querySelectorAll(".abc-choice").forEach(b => b.disabled = true);
      setTimeout(() => {
        state.stepIdx++;
        state.attempts = 0;
        if (state.stepIdx >= state.round.length) finishRound();
        else render();
      }, 850);
    } else {
      state.attempts++;
      btnEl.classList.add("wrong");
      btnEl.disabled = true;
      recordAnswer(step.statKind, step.statKey, false);
      try { window.GameAPI && GameAPI.SFX && GameAPI.SFX.wrong && GameAPI.SFX.wrong(); } catch (_) {}
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
        ${p.lastBridge && p.lastBridge.lvl === (lvlIdx + 1) ? `
          <div class="abc-bridge-payout">
            <div class="abc-bridge-title">\uD83C\uDF81 Earned in main game</div>
            <div class="abc-bridge-row">
              <span class="abc-bridge-pill">+\u20B9${p.lastBridge.rupees}</span>
              <span class="abc-bridge-pill">+${p.lastBridge.power}\u26A1</span>
              ${p.lastBridge.gold ? `<span class="abc-bridge-pill">+${p.lastBridge.gold}\uD83E\uDE99</span>` : ""}
            </div>
          </div>` : ""}
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
