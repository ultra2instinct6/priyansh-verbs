// Daroach Learning — Bilingual VOCAB dataset for Random Attack mini-games.
// Used by attacks.js for both Spelling Strike (encode) and Definition Duel (decode).
// Words are age 7-8 friendly, drawn from words the child meets in LADDER.
// Schema:
//   word        — the English word, lowercase
//   emoji       — visual prompt for spelling strikes
//   pa_gloss    — short Gurmukhi gloss (1-3 words)
//   meaning_en  — kid-simple English definition (≤8 words)
//   meaning_pa  — Gurmukhi definition
//   example_en  — short English sentence using the word
//   example_pa  — Gurmukhi translation of example
//   tags        — for distractor pooling: "verb"|"noun"|"adj"|"adv"
//   phonetic    — optional plain-letter pronunciation hint
//   hint        — optional spelling rule reminder (English)
//   hint_pa     — optional spelling rule reminder (Gurmukhi)
(function () {
  "use strict";

  const VOCAB = [
    // ---- verbs ----
    { word:"run",     emoji:"🏃", pa_gloss:"ਦੌੜਨਾ",     meaning_en:"to move very fast on your feet",
      meaning_pa:"ਪੈਰਾਂ ਨਾਲ ਤੇਜ਼ ਚੱਲਣਾ", example_en:"I run to school.", example_pa:"ਮੈਂ ਸਕੂਲ ਦੌੜਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"running", emoji:"🏃‍♂️", pa_gloss:"ਦੌੜ ਰਿਹਾ", meaning_en:"moving very fast right now",
      meaning_pa:"ਹੁਣੇ ਤੇਜ਼ ਚੱਲ ਰਿਹਾ", example_en:"The dog is running.", example_pa:"ਕੁੱਤਾ ਦੌੜ ਰਿਹਾ ਹੈ।",
      tags:["verb"], hint:"Double the n: run → running.", hint_pa:"n ਦੋ ਵਾਰ ਆਉਂਦਾ: run → running।" },
    { word:"jump",    emoji:"🦘", pa_gloss:"ਟੱਪਣਾ",     meaning_en:"to push off the ground into the air",
      meaning_pa:"ਜ਼ਮੀਨ ਤੋਂ ਉੱਪਰ ਉੱਠਣਾ", example_en:"I can jump high.", example_pa:"ਮੈਂ ਉੱਚਾ ਟੱਪ ਸਕਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"jumped",  emoji:"🤸", pa_gloss:"ਟੱਪਿਆ",    meaning_en:"jumped in the past",
      meaning_pa:"ਪਹਿਲਾਂ ਟੱਪਿਆ", example_en:"She jumped over the puddle.", example_pa:"ਉਹ ਟੋਏ ਤੋਂ ਟੱਪ ਗਈ।",
      tags:["verb"], hint:"Add -ed for past: jump → jumped.", hint_pa:"ਪਿਛਲੇ ਸਮੇਂ ਲਈ -ed ਜੋੜੋ।" },
    { word:"swim",    emoji:"🏊", pa_gloss:"ਤੈਰਨਾ",     meaning_en:"to move through water",
      meaning_pa:"ਪਾਣੀ ਵਿੱਚ ਚੱਲਣਾ", example_en:"Fish swim in the sea.", example_pa:"ਮੱਛੀਆਂ ਸਮੁੰਦਰ ਵਿੱਚ ਤੈਰਦੀਆਂ ਨੇ।",
      tags:["verb"] },
    { word:"sing",    emoji:"🎤", pa_gloss:"ਗਾਉਣਾ",     meaning_en:"to make music with your voice",
      meaning_pa:"ਆਵਾਜ਼ ਨਾਲ ਗੀਤ ਗਾਉਣਾ", example_en:"Birds sing in the morning.", example_pa:"ਪੰਛੀ ਸਵੇਰੇ ਗਾਉਂਦੇ ਨੇ।",
      tags:["verb"] },
    { word:"eat",     emoji:"🍽️", pa_gloss:"ਖਾਣਾ",      meaning_en:"to put food in your mouth",
      meaning_pa:"ਖਾਣਾ ਖਾਣਾ", example_en:"We eat dinner at six.", example_pa:"ਅਸੀਂ ਛੇ ਵਜੇ ਰਾਤ ਦਾ ਖਾਣਾ ਖਾਂਦੇ ਹਾਂ।",
      tags:["verb"] },
    { word:"sleep",   emoji:"😴", pa_gloss:"ਸੌਣਾ",      meaning_en:"to close your eyes and rest at night",
      meaning_pa:"ਅੱਖਾਂ ਬੰਦ ਕਰ ਕੇ ਆਰਾਮ ਕਰਨਾ", example_en:"Babies sleep a lot.", example_pa:"ਬੱਚੇ ਬਹੁਤ ਸੌਂਦੇ ਨੇ।",
      tags:["verb"] },
    { word:"play",    emoji:"⚽", pa_gloss:"ਖੇਡਣਾ",     meaning_en:"to do something fun for fun",
      meaning_pa:"ਮਜ਼ੇ ਲਈ ਕੁਝ ਕਰਨਾ", example_en:"Kids play in the park.", example_pa:"ਬੱਚੇ ਪਾਰਕ ਵਿੱਚ ਖੇਡਦੇ ਨੇ।",
      tags:["verb"] },
    { word:"played",  emoji:"🎮", pa_gloss:"ਖੇਡਿਆ",    meaning_en:"played in the past",
      meaning_pa:"ਪਹਿਲਾਂ ਖੇਡਿਆ", example_en:"We played all day.", example_pa:"ਅਸੀਂ ਦਿਨ ਭਰ ਖੇਡਿਆ।",
      tags:["verb"] },
    { word:"read",    emoji:"📖", pa_gloss:"ਪੜ੍ਹਨਾ",   meaning_en:"to look at words and understand",
      meaning_pa:"ਸ਼ਬਦ ਦੇਖ ਕੇ ਸਮਝਣਾ", example_en:"I read every night.", example_pa:"ਮੈਂ ਹਰ ਰਾਤ ਪੜ੍ਹਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"write",   emoji:"✍️", pa_gloss:"ਲਿਖਣਾ",   meaning_en:"to put words on paper",
      meaning_pa:"ਕਾਗਜ਼ ਉੱਤੇ ਸ਼ਬਦ ਲਿਖਣਾ", example_en:"I write my name.", example_pa:"ਮੈਂ ਆਪਣਾ ਨਾਮ ਲਿਖਦਾ ਹਾਂ।",
      tags:["verb"], hint:"Silent e at the end: w-r-i-t-e.", hint_pa:"ਅਖੀਰ ਵਿੱਚ ਚੁੱਪ e ਆਉਂਦਾ।" },
    { word:"walk",    emoji:"🚶", pa_gloss:"ਤੁਰਨਾ",    meaning_en:"to move on your feet, not fast",
      meaning_pa:"ਪੈਰਾਂ ਨਾਲ ਹੌਲੀ ਚੱਲਣਾ", example_en:"I walk to the bus.", example_pa:"ਮੈਂ ਬੱਸ ਤੱਕ ਤੁਰਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"talk",    emoji:"💬", pa_gloss:"ਗੱਲ ਕਰਨੀ", meaning_en:"to speak with someone",
      meaning_pa:"ਕਿਸੇ ਨਾਲ ਗੱਲ ਕਰਨੀ", example_en:"We talk on the phone.", example_pa:"ਅਸੀਂ ਫ਼ੋਨ ਤੇ ਗੱਲ ਕਰਦੇ ਹਾਂ।",
      tags:["verb"] },
    { word:"laugh",   emoji:"😂", pa_gloss:"ਹੱਸਣਾ",    meaning_en:"to make a happy sound when something is funny",
      meaning_pa:"ਮਜ਼ਾਕੀਆ ਗੱਲ ਤੇ ਖੁਸ਼ ਹੋਣਾ", example_en:"That joke made me laugh.", example_pa:"ਉਸ ਮਜ਼ਾਕ ਨੇ ਮੈਨੂੰ ਹਸਾਇਆ।",
      tags:["verb"], hint:"laugh has a quiet 'gh'.", hint_pa:"laugh ਵਿੱਚ 'gh' ਚੁੱਪ ਹੁੰਦਾ।" },
    { word:"cry",     emoji:"😢", pa_gloss:"ਰੋਣਾ",     meaning_en:"to drop tears when sad",
      meaning_pa:"ਉਦਾਸ ਹੋਣ ਤੇ ਅੱਥਰੂ ਆਉਣੇ", example_en:"The baby will cry.", example_pa:"ਬੱਚਾ ਰੋਏਗਾ।",
      tags:["verb"] },
    { word:"smile",   emoji:"😊", pa_gloss:"ਮੁਸਕਾਨ",    meaning_en:"to make a happy face",
      meaning_pa:"ਖੁਸ਼ ਚਿਹਰਾ ਬਣਾਉਣਾ", example_en:"Please smile for the photo.", example_pa:"ਫ਼ੋਟੋ ਲਈ ਮੁਸਕਰਾਓ।",
      tags:["verb"], hint:"silent e at end: s-m-i-l-e.", hint_pa:"ਅਖੀਰ ਵਿੱਚ ਚੁੱਪ e।" },
    { word:"help",    emoji:"🤝", pa_gloss:"ਮਦਦ ਕਰਨੀ", meaning_en:"to do something for someone",
      meaning_pa:"ਕਿਸੇ ਲਈ ਕੁਝ ਕਰਨਾ", example_en:"I help my mom cook.", example_pa:"ਮੈਂ ਮਾਂ ਦੀ ਖਾਣਾ ਪਕਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"sit",     emoji:"🪑", pa_gloss:"ਬੈਠਣਾ",    meaning_en:"to rest on your bottom",
      meaning_pa:"ਥੱਲੇ ਟਿਕਣਾ", example_en:"Please sit down.", example_pa:"ਕਿਰਪਾ ਕਰਕੇ ਬੈਠੋ।",
      tags:["verb"] },
    { word:"sitting", emoji:"💺", pa_gloss:"ਬੈਠਾ",     meaning_en:"resting on your bottom right now",
      meaning_pa:"ਹੁਣੇ ਬੈਠਾ ਹੈ", example_en:"He is sitting on the chair.", example_pa:"ਉਹ ਕੁਰਸੀ ਤੇ ਬੈਠਾ ਹੈ।",
      tags:["verb"], hint:"Double t: sit → sitting.", hint_pa:"t ਦੋ ਵਾਰ: sit → sitting।" },
    { word:"go",      emoji:"➡️", pa_gloss:"ਜਾਣਾ",     meaning_en:"to move from here to there",
      meaning_pa:"ਇੱਥੋਂ ਉੱਥੇ ਜਾਣਾ", example_en:"Let's go home.", example_pa:"ਚਲੋ ਘਰ ਚੱਲੀਏ।",
      tags:["verb"] },
    { word:"went",    emoji:"🚶‍♂️", pa_gloss:"ਗਿਆ",     meaning_en:"went in the past",
      meaning_pa:"ਪਹਿਲਾਂ ਗਿਆ", example_en:"He went to school.", example_pa:"ਉਹ ਸਕੂਲ ਗਿਆ।",
      tags:["verb"], hint:"go → went (a tricky one — just remember!).", hint_pa:"go → went (ਯਾਦ ਰੱਖੋ)।" },
    { word:"see",     emoji:"👁️", pa_gloss:"ਦੇਖਣਾ",    meaning_en:"to look with your eyes",
      meaning_pa:"ਅੱਖਾਂ ਨਾਲ ਦੇਖਣਾ", example_en:"I see a bird.", example_pa:"ਮੈਂ ਪੰਛੀ ਦੇਖਦਾ ਹਾਂ।",
      tags:["verb"], hint:"Two e's: s-e-e.", hint_pa:"ਦੋ e: s-e-e।" },
    { word:"saw",     emoji:"👀", pa_gloss:"ਦੇਖਿਆ",   meaning_en:"saw in the past",
      meaning_pa:"ਪਹਿਲਾਂ ਦੇਖਿਆ", example_en:"I saw a rainbow.", example_pa:"ਮੈਂ ਇੰਦਰ-ਧਨੁਖ ਦੇਖਿਆ।",
      tags:["verb"] },
    { word:"make",    emoji:"🛠️", pa_gloss:"ਬਣਾਉਣਾ",  meaning_en:"to build or create something",
      meaning_pa:"ਕੁਝ ਨਵਾਂ ਤਿਆਰ ਕਰਨਾ", example_en:"I make my bed.", example_pa:"ਮੈਂ ਆਪਣਾ ਮੰਜਾ ਠੀਕ ਕਰਦਾ ਹਾਂ।",
      tags:["verb"] },
    { word:"made",    emoji:"🎁", pa_gloss:"ਬਣਾਇਆ",   meaning_en:"made in the past",
      meaning_pa:"ਪਹਿਲਾਂ ਬਣਾਇਆ", example_en:"She made a cake.", example_pa:"ਉਸਨੇ ਕੇਕ ਬਣਾਇਆ।",
      tags:["verb"] },
    { word:"give",    emoji:"🎁", pa_gloss:"ਦੇਣਾ",     meaning_en:"to hand something to someone",
      meaning_pa:"ਕਿਸੇ ਨੂੰ ਚੀਜ਼ ਦੇਣੀ", example_en:"Give me the ball.", example_pa:"ਮੈਨੂੰ ਗੇਂਦ ਦਿਓ।",
      tags:["verb"] },
    { word:"take",    emoji:"✋", pa_gloss:"ਲੈਣਾ",     meaning_en:"to pick up or get something",
      meaning_pa:"ਕੁਝ ਚੁੱਕਣਾ", example_en:"Take an apple.", example_pa:"ਇੱਕ ਸੇਬ ਲਓ।",
      tags:["verb"] },

    // ---- nouns ----
    { word:"cat",     emoji:"🐱", pa_gloss:"ਬਿੱਲੀ",    meaning_en:"a small furry pet that says meow",
      meaning_pa:"ਛੋਟਾ ਪਾਲਤੂ ਜੋ ਮਿਆਊਂ ਕਰਦਾ", example_en:"My cat is fluffy.", example_pa:"ਮੇਰੀ ਬਿੱਲੀ ਨਰਮ ਹੈ।",
      tags:["noun"] },
    { word:"dog",     emoji:"🐶", pa_gloss:"ਕੁੱਤਾ",    meaning_en:"a friendly pet that barks",
      meaning_pa:"ਭੌਂਕਣ ਵਾਲਾ ਪਾਲਤੂ", example_en:"The dog wags its tail.", example_pa:"ਕੁੱਤਾ ਪੂਛ ਹਿਲਾਉਂਦਾ ਹੈ।",
      tags:["noun"] },
    { word:"fish",    emoji:"🐟", pa_gloss:"ਮੱਛੀ",     meaning_en:"an animal that lives in water",
      meaning_pa:"ਪਾਣੀ ਵਿੱਚ ਰਹਿਣ ਵਾਲਾ ਜੀਵ", example_en:"A fish swims fast.", example_pa:"ਮੱਛੀ ਤੇਜ਼ ਤੈਰਦੀ ਹੈ।",
      tags:["noun"] },
    { word:"bird",    emoji:"🐦", pa_gloss:"ਪੰਛੀ",     meaning_en:"an animal with wings that flies",
      meaning_pa:"ਖੰਭਾਂ ਵਾਲਾ ਉੱਡਣ ਵਾਲਾ", example_en:"The bird is in the tree.", example_pa:"ਪੰਛੀ ਦਰੱਖਤ ਉੱਤੇ ਹੈ।",
      tags:["noun"] },
    { word:"tree",    emoji:"🌳", pa_gloss:"ਦਰੱਖਤ",   meaning_en:"a tall plant with leaves",
      meaning_pa:"ਪੱਤਿਆਂ ਵਾਲਾ ਉੱਚਾ ਪੌਧਾ", example_en:"The tree gives us shade.", example_pa:"ਦਰੱਖਤ ਛਾਂ ਦਿੰਦਾ ਹੈ।",
      tags:["noun"], hint:"Two e's: t-r-e-e.", hint_pa:"ਦੋ e।" },
    { word:"house",   emoji:"🏠", pa_gloss:"ਘਰ",       meaning_en:"a place where people live",
      meaning_pa:"ਲੋਕਾਂ ਦੇ ਰਹਿਣ ਦੀ ਜਗ੍ਹਾ", example_en:"My house is blue.", example_pa:"ਮੇਰਾ ਘਰ ਨੀਲਾ ਹੈ।",
      tags:["noun"] },
    { word:"school",  emoji:"🏫", pa_gloss:"ਸਕੂਲ",    meaning_en:"a place where kids learn",
      meaning_pa:"ਜਿੱਥੇ ਬੱਚੇ ਸਿੱਖਦੇ ਨੇ", example_en:"I go to school.", example_pa:"ਮੈਂ ਸਕੂਲ ਜਾਂਦਾ ਹਾਂ।",
      tags:["noun"] },
    { word:"book",    emoji:"📚", pa_gloss:"ਕਿਤਾਬ",   meaning_en:"pages with words and pictures",
      meaning_pa:"ਸ਼ਬਦਾਂ ਤੇ ਚਿੱਤਰਾਂ ਵਾਲੇ ਪੰਨੇ", example_en:"This book is fun.", example_pa:"ਇਹ ਕਿਤਾਬ ਮਜ਼ੇਦਾਰ ਹੈ।",
      tags:["noun"], hint:"Two o's: b-o-o-k.", hint_pa:"ਦੋ o: b-o-o-k।" },
    { word:"friend",  emoji:"🫂", pa_gloss:"ਦੋਸਤ",    meaning_en:"someone you like to play with",
      meaning_pa:"ਜਿਸ ਨਾਲ ਤੁਸੀਂ ਖੇਡਦੇ ਹੋ", example_en:"He is my best friend.", example_pa:"ਉਹ ਮੇਰਾ ਸਭ ਤੋਂ ਚੰਗਾ ਦੋਸਤ ਹੈ।",
      tags:["noun"], hint:"i before e: f-r-i-e-n-d.", hint_pa:"e ਤੋਂ ਪਹਿਲਾਂ i।" },
    { word:"family",  emoji:"👨‍👩‍👧", pa_gloss:"ਪਰਿਵਾਰ", meaning_en:"the people you live with",
      meaning_pa:"ਜਿਨ੍ਹਾਂ ਨਾਲ ਤੁਸੀਂ ਰਹਿੰਦੇ ਹੋ", example_en:"I love my family.", example_pa:"ਮੈਂ ਆਪਣੇ ਪਰਿਵਾਰ ਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ।",
      tags:["noun"] },
    { word:"water",   emoji:"💧", pa_gloss:"ਪਾਣੀ",    meaning_en:"a clear drink that fills rivers",
      meaning_pa:"ਨਦੀਆਂ ਵਾਲਾ ਪੀਣ ਯੋਗ", example_en:"Drink lots of water.", example_pa:"ਬਹੁਤ ਪਾਣੀ ਪੀਓ।",
      tags:["noun"] },
    { word:"food",    emoji:"🍎", pa_gloss:"ਖਾਣਾ",    meaning_en:"what we eat",
      meaning_pa:"ਜੋ ਅਸੀਂ ਖਾਂਦੇ ਹਾਂ", example_en:"Food gives us energy.", example_pa:"ਖਾਣਾ ਤਾਕਤ ਦਿੰਦਾ ਹੈ।",
      tags:["noun"] },
    { word:"sun",     emoji:"☀️", pa_gloss:"ਸੂਰਜ",    meaning_en:"the bright star in the day sky",
      meaning_pa:"ਦਿਨ ਵਾਲਾ ਚਮਕਦਾਰ ਤਾਰਾ", example_en:"The sun is hot.", example_pa:"ਸੂਰਜ ਗਰਮ ਹੈ।",
      tags:["noun"] },
    { word:"moon",    emoji:"🌙", pa_gloss:"ਚੰਨ",     meaning_en:"the bright thing in the night sky",
      meaning_pa:"ਰਾਤ ਨੂੰ ਚਮਕਦਾ", example_en:"The moon is round.", example_pa:"ਚੰਨ ਗੋਲ ਹੈ।",
      tags:["noun"] },
    { word:"star",    emoji:"⭐", pa_gloss:"ਤਾਰਾ",    meaning_en:"a tiny bright dot in the sky",
      meaning_pa:"ਅਸਮਾਨ ਵਿੱਚ ਛੋਟੀ ਚਮਕ", example_en:"I see one star.", example_pa:"ਮੈਨੂੰ ਇੱਕ ਤਾਰਾ ਦਿਸਦਾ ਹੈ।",
      tags:["noun"] },
    { word:"car",     emoji:"🚗", pa_gloss:"ਗੱਡੀ",    meaning_en:"a thing with wheels you drive",
      meaning_pa:"ਪਹੀਆਂ ਵਾਲੀ ਚਲਾਉਣ ਵਾਲੀ ਚੀਜ਼", example_en:"Dad drives a car.", example_pa:"ਪਾਪਾ ਗੱਡੀ ਚਲਾਉਂਦੇ ਨੇ।",
      tags:["noun"] },
    { word:"ball",    emoji:"⚽", pa_gloss:"ਗੇਂਦ",    meaning_en:"a round toy you play with",
      meaning_pa:"ਖੇਡਣ ਵਾਲੀ ਗੋਲ ਚੀਜ਼", example_en:"Kick the ball!", example_pa:"ਗੇਂਦ ਨੂੰ ਕਿੱਕ ਮਾਰੋ!",
      tags:["noun"], hint:"Double l: b-a-l-l.", hint_pa:"ਦੋ l।" },

    // ---- adjectives ----
    { word:"big",     emoji:"🐘", pa_gloss:"ਵੱਡਾ",     meaning_en:"large in size",
      meaning_pa:"ਆਕਾਰ ਵਿੱਚ ਵੱਡਾ", example_en:"An elephant is big.", example_pa:"ਹਾਥੀ ਵੱਡਾ ਹੁੰਦਾ ਹੈ।",
      tags:["adj"] },
    { word:"small",   emoji:"🐭", pa_gloss:"ਛੋਟਾ",    meaning_en:"little in size",
      meaning_pa:"ਆਕਾਰ ਵਿੱਚ ਛੋਟਾ", example_en:"A mouse is small.", example_pa:"ਚੂਹਾ ਛੋਟਾ ਹੁੰਦਾ ਹੈ।",
      tags:["adj"] },
    { word:"happy",   emoji:"😄", pa_gloss:"ਖੁਸ਼",    meaning_en:"feeling good and joyful",
      meaning_pa:"ਚੰਗਾ ਅਤੇ ਖੁਸ਼ ਮਹਿਸੂਸ", example_en:"I am happy today.", example_pa:"ਮੈਂ ਅੱਜ ਖੁਸ਼ ਹਾਂ।",
      tags:["adj"], hint:"Double p: ha-pp-y.", hint_pa:"p ਦੋ ਵਾਰ।" },
    { word:"sad",     emoji:"😢", pa_gloss:"ਉਦਾਸ",   meaning_en:"feeling not happy",
      meaning_pa:"ਖੁਸ਼ ਨਾ ਮਹਿਸੂਸ", example_en:"He looks sad.", example_pa:"ਉਹ ਉਦਾਸ ਲੱਗਦਾ।",
      tags:["adj"] },
    { word:"fast",    emoji:"💨", pa_gloss:"ਤੇਜ਼",    meaning_en:"moving quickly",
      meaning_pa:"ਜਲਦੀ ਚੱਲਣਾ", example_en:"The car is fast.", example_pa:"ਗੱਡੀ ਤੇਜ਼ ਹੈ।",
      tags:["adj"] },
    { word:"slow",    emoji:"🐢", pa_gloss:"ਹੌਲੀ",    meaning_en:"not moving quickly",
      meaning_pa:"ਜਲਦੀ ਨਹੀਂ", example_en:"A turtle is slow.", example_pa:"ਕੱਛੂ ਹੌਲੀ ਹੁੰਦਾ ਹੈ।",
      tags:["adj"] },
    { word:"hot",     emoji:"🔥", pa_gloss:"ਗਰਮ",    meaning_en:"high in heat",
      meaning_pa:"ਬਹੁਤ ਗਰਮ", example_en:"The soup is hot.", example_pa:"ਸੂਪ ਗਰਮ ਹੈ।",
      tags:["adj"] },
    { word:"cold",    emoji:"❄️", pa_gloss:"ਠੰਢਾ",   meaning_en:"low in heat",
      meaning_pa:"ਠੰਢਾ", example_en:"Ice is cold.", example_pa:"ਬਰਫ਼ ਠੰਢੀ ਹੈ।",
      tags:["adj"] },
    { word:"good",    emoji:"👍", pa_gloss:"ਚੰਗਾ",    meaning_en:"nice or right",
      meaning_pa:"ਠੀਕ ਜਾਂ ਵਧੀਆ", example_en:"You did a good job.", example_pa:"ਤੁਸੀਂ ਵਧੀਆ ਕੰਮ ਕੀਤਾ।",
      tags:["adj"] },
    { word:"bad",     emoji:"👎", pa_gloss:"ਮਾੜਾ",   meaning_en:"not nice or wrong",
      meaning_pa:"ਠੀਕ ਨਹੀਂ", example_en:"That is a bad idea.", example_pa:"ਇਹ ਮਾੜਾ ਖ਼ਿਆਲ ਹੈ।",
      tags:["adj"] },
    { word:"new",     emoji:"✨", pa_gloss:"ਨਵਾਂ",   meaning_en:"made or got just now",
      meaning_pa:"ਹੁਣੇ ਆਇਆ", example_en:"My shoes are new.", example_pa:"ਮੇਰੇ ਜੁੱਤੇ ਨਵੇਂ ਨੇ।",
      tags:["adj"] },
    { word:"old",     emoji:"🧓", pa_gloss:"ਪੁਰਾਣਾ", meaning_en:"not new — has been around long",
      meaning_pa:"ਬਹੁਤ ਚਿਰ ਤੋਂ", example_en:"This book is old.", example_pa:"ਇਹ ਕਿਤਾਬ ਪੁਰਾਣੀ ਹੈ।",
      tags:["adj"] },
    { word:"strong",  emoji:"💪", pa_gloss:"ਤਾਕਤਵਰ",meaning_en:"having lots of power",
      meaning_pa:"ਬਹੁਤ ਤਾਕਤ ਵਾਲਾ", example_en:"Goku is strong.", example_pa:"ਗੋਕੂ ਤਾਕਤਵਰ ਹੈ।",
      tags:["adj"] },
    { word:"brave",   emoji:"🦁", pa_gloss:"ਬਹਾਦੁਰ", meaning_en:"not afraid",
      meaning_pa:"ਡਰ ਨਾ ਲੱਗਣਾ", example_en:"A brave kid tries hard.", example_pa:"ਬਹਾਦੁਰ ਬੱਚਾ ਕੋਸ਼ਿਸ਼ ਕਰਦਾ।",
      tags:["adj"], hint:"silent e: b-r-a-v-e.", hint_pa:"ਅਖੀਰ ਵਿੱਚ ਚੁੱਪ e।" },
    { word:"bright",  emoji:"💡", pa_gloss:"ਚਮਕਦਾਰ",meaning_en:"shining with a lot of light",
      meaning_pa:"ਬਹੁਤ ਚਮਕ ਵਾਲਾ", example_en:"The sun is bright.", example_pa:"ਸੂਰਜ ਚਮਕਦਾਰ ਹੈ।",
      tags:["adj"], hint:"-ight ending: br-i-g-h-t.", hint_pa:"-ight ਦੇ ਅੱਖਰ।" },
    { word:"gigantic",emoji:"🦕", pa_gloss:"ਬਹੁਤ ਵੱਡਾ", meaning_en:"very big — like a giant",
      meaning_pa:"ਬਹੁਤ ਵੱਡਾ — ਜਾਇੰਟ ਜਿੱਡਾ", example_en:"The dragon was gigantic.", example_pa:"ਡ੍ਰੈਗਨ ਬਹੁਤ ਵੱਡਾ ਸੀ।",
      tags:["adj"], phonetic:"jai-GAN-tik" },
    { word:"tiny",    emoji:"🐜", pa_gloss:"ਬਹੁਤ ਛੋਟਾ", meaning_en:"very small",
      meaning_pa:"ਬਹੁਤ ਛੋਟਾ", example_en:"An ant is tiny.", example_pa:"ਕੀੜੀ ਬਹੁਤ ਛੋਟੀ ਹੈ।",
      tags:["adj"] },
    { word:"loud",    emoji:"📢", pa_gloss:"ਉੱਚੀ ਆਵਾਜ਼", meaning_en:"making a big sound",
      meaning_pa:"ਵੱਡੀ ਆਵਾਜ਼", example_en:"Thunder is loud.", example_pa:"ਗਰਜ ਉੱਚੀ ਹੁੰਦੀ ਹੈ।",
      tags:["adj"] },
    { word:"quiet",   emoji:"🤫", pa_gloss:"ਚੁੱਪ",   meaning_en:"making little or no sound",
      meaning_pa:"ਆਵਾਜ਼ ਨਾ ਕਰਨੀ", example_en:"Please be quiet.", example_pa:"ਕਿਰਪਾ ਕਰਕੇ ਚੁੱਪ ਰਹੋ।",
      tags:["adj"] },
    { word:"funny",   emoji:"🤡", pa_gloss:"ਮਜ਼ਾਕੀਆ",meaning_en:"makes you laugh",
      meaning_pa:"ਹੱਸਣ ਯੋਗ", example_en:"That clown is funny.", example_pa:"ਉਹ ਜੋਕਰ ਮਜ਼ਾਕੀਆ ਹੈ।",
      tags:["adj"], hint:"Double n: fu-nn-y.", hint_pa:"n ਦੋ ਵਾਰ।" },

    // ---- adverbs / function-y ----
    { word:"today",   emoji:"📅", pa_gloss:"ਅੱਜ",     meaning_en:"this very day",
      meaning_pa:"ਇਹ ਦਿਨ", example_en:"We have school today.", example_pa:"ਅੱਜ ਸਕੂਲ ਹੈ।",
      tags:["adv"] },
    { word:"yesterday",emoji:"⏪", pa_gloss:"ਕੱਲ੍ਹ", meaning_en:"the day before today",
      meaning_pa:"ਅੱਜ ਤੋਂ ਪਹਿਲਾਂ ਵਾਲਾ ਦਿਨ", example_en:"I went there yesterday.", example_pa:"ਮੈਂ ਕੱਲ੍ਹ ਉੱਥੇ ਗਿਆ।",
      tags:["adv"] },
    { word:"tomorrow",emoji:"⏩", pa_gloss:"ਭਲਕੇ",  meaning_en:"the day after today",
      meaning_pa:"ਅੱਜ ਤੋਂ ਅਗਲਾ ਦਿਨ", example_en:"We will play tomorrow.", example_pa:"ਅਸੀਂ ਭਲਕੇ ਖੇਡਾਂਗੇ।",
      tags:["adv"], hint:"Double r: tomo-rr-ow.", hint_pa:"r ਦੋ ਵਾਰ।" },

    // ---- DBZ-flavored bonus ----
    { word:"power",   emoji:"💥", pa_gloss:"ਤਾਕਤ",    meaning_en:"how strong something is",
      meaning_pa:"ਕਿੰਨੀ ਤਾਕਤ", example_en:"My power level is rising!", example_pa:"ਮੇਰੀ ਤਾਕਤ ਵਧ ਰਹੀ ਹੈ!",
      tags:["noun"] },
    { word:"warrior", emoji:"🥋", pa_gloss:"ਯੋਧਾ",   meaning_en:"a brave fighter",
      meaning_pa:"ਬਹਾਦੁਰ ਲੜਾਕੂ", example_en:"A young warrior trains hard.", example_pa:"ਨੌਜਵਾਨ ਯੋਧਾ ਮਿਹਨਤ ਕਰਦਾ।",
      tags:["noun"], phonetic:"WOR-ee-er" },
    { word:"dragon",  emoji:"🐉", pa_gloss:"ਡ੍ਰੈਗਨ", meaning_en:"a huge magical lizard",
      meaning_pa:"ਜਾਦੂਈ ਵੱਡਾ ਜੀਵ", example_en:"The dragon flew away.", example_pa:"ਡ੍ਰੈਗਨ ਉੱਡ ਗਿਆ।",
      tags:["noun"] },
  ];

  // ---------- Helpers ----------

  // Pick N random distractors with the same tag (excluding the answer word).
  function pickDistractors(answer, n, key) {
    key = key || "meaning_en";
    const tag = (answer.tags && answer.tags[0]) || "noun";
    const pool = VOCAB.filter(v => v.word !== answer.word && (v.tags || []).includes(tag));
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    const out = [];
    for (const v of shuffled) {
      const val = v[key];
      if (!val) continue;
      if (out.includes(val)) continue;
      out.push(val);
      if (out.length >= n) break;
    }
    // Fallback: pull from any tag if we ran short.
    if (out.length < n) {
      for (const v of VOCAB) {
        if (v.word === answer.word) continue;
        const val = v[key];
        if (!val || out.includes(val)) continue;
        out.push(val);
        if (out.length >= n) break;
      }
    }
    return out.slice(0, n);
  }

  // Generate plausible misspellings for Easy-mode Spelling Strike.
  function makeMisspellings(word, n) {
    const w = String(word || "").toLowerCase();
    const seen = new Set([w]);
    const out = [];
    function add(s) {
      if (!s || s === w || seen.has(s) || s.length < 2) return;
      seen.add(s); out.push(s);
    }
    // 1) Drop one letter
    for (let i = 0; i < w.length && out.length < n + 6; i++) {
      add(w.slice(0, i) + w.slice(i + 1));
    }
    // 2) Drop a doubled consonant (running -> runing)
    const dbl = w.match(/([a-z])\1/);
    if (dbl) add(w.replace(dbl[0], dbl[1]));
    // 3) Add a doubled letter (jumped -> jummped)
    for (let i = 1; i < w.length && out.length < n + 8; i++) {
      add(w.slice(0, i) + w[i] + w[i] + w.slice(i + 1));
    }
    // 4) Swap ie <-> ei
    if (w.includes("ie")) add(w.replace("ie", "ei"));
    if (w.includes("ei")) add(w.replace("ei", "ie"));
    // 5) Drop or add silent-e
    if (w.endsWith("e")) add(w.slice(0, -1));
    else add(w + "e");
    // 6) Common confusions
    const swaps = [["i","y"],["y","i"],["c","k"],["k","c"],["s","z"],["z","s"],["a","e"],["e","a"]];
    for (const [a, b] of swaps) {
      if (out.length >= n + 4) break;
      const idx = w.indexOf(a);
      if (idx >= 0) add(w.slice(0, idx) + b + w.slice(idx + 1));
    }
    // Shuffle and trim
    return out.sort(() => Math.random() - 0.5).slice(0, n);
  }

  // Pick a random word, optionally weighted by review queue (familiar words preferred).
  function pickWord(opts) {
    opts = opts || {};
    const exclude = opts.exclude || [];
    let pool = VOCAB.filter(v => !exclude.includes(v.word));
    if (opts.tag) pool = pool.filter(v => (v.tags || []).includes(opts.tag));
    if (!pool.length) pool = VOCAB.slice();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function findWord(w) {
    const lc = String(w || "").toLowerCase();
    return VOCAB.find(v => v.word === lc) || null;
  }

  window.VOCAB = VOCAB;
  window.VocabAPI = {
    list: VOCAB,
    pick: pickWord,
    find: findWord,
    distractors: pickDistractors,
    misspellings: makeMisspellings,
  };
})();
