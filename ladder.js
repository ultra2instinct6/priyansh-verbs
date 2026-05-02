// Daroach Learning — LADDER curriculum spine (v2, age 7–8)
// =========================================================
// Pedagogy:
//  - Same order for every student (deterministic ladder).
//  - 5–7 cards per concept block to respect 2nd-grade working memory.
//  - Each block follows: intro → flash → guided practice → fill / application.
//  - Math is properly laddered: facts → place value → 2-digit no-regroup
//    → 2-digit with regroup → skip counting → multiplication intro.
//  - Verbs split: regular -ed first, irregulars second.
//  - Punctuation + capitalization + contractions covered.
//  - Each unit ends with a BOSS that mixes ALL concepts of that unit
//    (within-unit spiral review — research-backed for retention).
//  - Intros are short (<30 words) and visual.
//  - Vocabulary kept to common 7–8yo words; DBZ flavor used as scenery,
//    never as content the child must understand.
//
// To extend without breaking saves: append cards at the END of an
// existing block, or append new blocks/units, then bump LADDER_VERSION.
//
// Card schema (discriminated by `type`):
//   intro:  { title, body }
//   flash:  { front, back }
//   mcq:    { prompt, choices[], correct }
//   fill:   { prompt, accept[] }   // case-insensitive, exact match
//   read:   { passage, questions[ {prompt, choices, correct} ] }
//   boss:   { name, emoji, hp, questions[ {prompt, choices, correct} ] }
//
// IDs: u<unit>.b<block>.c<card>  — never re-use, append only.
// =========================================================

const LADDER_VERSION = 13;

const LADDER = [

  // ============================================================
  // UNIT 1 — EARTHLING BASICS  (foundations, ~Grade 1.5–2.0)
  // ============================================================
  {
    id: "u1", title: "Earthling Basics", emoji: "🌍",
    blocks: [

      // ---- Block A1: Alphabet & letter sounds ----
      {
        id: "u1.a1", title: "Alphabet & letter sounds", emoji: "🔤",
        cards: [
          { id:"u1.a1.c1", type:"intro",
            title:"Welcome, yodha!",
            body:"Each card you clear grows your <b>Power Level</b>. Wrong answers cost a ❤️. Lose all 3 hearts and you restart the block. Let's start with the <b>26 letters</b> of the alphabet." },
          { id:"u1.a1.c2", type:"flash",
            front:"How many letters are in the English alphabet?",
            back:"<b>26</b> letters: A B C D … X Y Z." },
          { id:"u1.a1.c3", type:"mcq",
            prompt:"Which letter comes RIGHT after <b>D</b>?",
            choices:["C","E","F","G"], correct:"E" },
          { id:"u1.a1.c4", type:"mcq",
            prompt:"Which letter comes RIGHT before <b>M</b>?",
            choices:["K","L","N","O"], correct:"L" },
          { id:"u1.a1.c5", type:"mcq",
            prompt:"Which is a <b>VOWEL</b>?",
            choices:["B","C","E","D"], correct:"E" },
          { id:"u1.a1.c6", type:"mcq",
            prompt:"How many vowels are there?",
            choices:["3","5","7","10"], correct:"5" },
          { id:"u1.a1.c7", type:"mcq",
            prompt:"<b>cat</b> starts with which sound?",
            choices:["/k/","/s/","/t/","/m/"], correct:"/k/" },
          { id:"u1.a1.c8", type:"fill",
            prompt:"Lowercase of <b>B</b> is ___ .", accept:["b"], choices:["b","d","p"] },
        ]
      },

      // ---- Block A2: Numbers 1-20 ----
      {
        id: "u1.a2", title: "Numbers 1–20", emoji: "🔢",
        cards: [
          { id:"u1.a2.c1", type:"intro",
            title:"Counting up",
            body:"Numbers help us count. Try counting out loud: 1, 2, 3, 4, 5… all the way to 20!" },
          { id:"u1.a2.c2", type:"flash",
            front:"What number comes after <b>nine</b>?",
            back:"<b>10</b> (ten)" },
          { id:"u1.a2.c3", type:"mcq",
            prompt:"What number comes after <b>15</b>?",
            choices:["14","16","17","20"], correct:"16" },
          { id:"u1.a2.c4", type:"mcq",
            prompt:"What number comes BEFORE <b>12</b>?",
            choices:["10","11","13","14"], correct:"11" },
          { id:"u1.a2.c5", type:"mcq",
            prompt:"Which number is the WORD <b>seven</b>?",
            choices:["5","6","7","8"], correct:"7" },
          { id:"u1.a2.c6", type:"mcq",
            prompt:"Which number is the WORD <b>fourteen</b>?",
            choices:["4","14","40","44"], correct:"14" },
          { id:"u1.a2.c7", type:"fill",
            prompt:"Count: 1, 2, 3, 4, ___ .", accept:["5","five"], choices:["5","4","6"] },
          { id:"u1.a2.c8", type:"fill",
            prompt:"Skip-count by 2s: 2, 4, 6, ___ .", accept:["8","eight"], choices:["8","7","10"] },
        ]
      },

      // ---- Block A3: More, less, before, after ----
      {
        id: "u1.a3", title: "More, less, before, after", emoji: "⚖️",
        cards: [
          { id:"u1.a3.c1", type:"intro",
            title:"Compare numbers",
            body:"<b>More</b> = a bigger number. <b>Less (or fewer)</b> = a smaller number. On a number line, numbers grow as you move RIGHT." },
          { id:"u1.a3.c2", type:"mcq", prompt:"Which is MORE: <b>3</b> or <b>7</b>?", choices:["3","7","both equal","none"], correct:"7" },
          { id:"u1.a3.c3", type:"mcq", prompt:"Which is LESS?", choices:["12","9","15","20"], correct:"9" },
          { id:"u1.a3.c4", type:"mcq", prompt:"What number is between <b>5</b> and <b>7</b>?", choices:["4","6","8","9"], correct:"6" },
          { id:"u1.a3.c5", type:"mcq", prompt:"What is <b>1 more than 9</b>?", choices:["8","9","10","11"], correct:"10" },
          { id:"u1.a3.c6", type:"mcq", prompt:"What is <b>1 less than 6</b>?", choices:["4","5","6","7"], correct:"5" },
          { id:"u1.a3.c7", type:"fill", prompt:"What comes after 10? ___ .", accept:["11","eleven"], choices:["11","10","12"] },
        ]
      },

      // ---- Block A4: Colors & basic shapes ----
      {
        id: "u1.a4", title: "Colors & basic shapes", emoji: "🎨",
        cards: [
          { id:"u1.a4.c1", type:"intro",
            title:"Look around!",
            body:"The world is full of <b>colors</b> (red, blue, yellow, green…) and <b>shapes</b> (circle, square, triangle, rectangle)." },
          { id:"u1.a4.c2", type:"mcq", prompt:"The sky on a clear day is mostly…", choices:["red","blue","green","purple"], correct:"blue" },
          { id:"u1.a4.c3", type:"mcq", prompt:"Grass is usually…", choices:["red","blue","green","orange"], correct:"green" },
          { id:"u1.a4.c4", type:"mcq", prompt:"How many sides does a <b>triangle</b> have?", choices:["2","3","4","5"], correct:"3" },
          { id:"u1.a4.c5", type:"mcq", prompt:"How many sides does a <b>square</b> have?", choices:["3","4","5","6"], correct:"4" },
          { id:"u1.a4.c6", type:"mcq", prompt:"A shape with NO corners is a…", choices:["square","triangle","circle","rectangle"], correct:"circle" },
          { id:"u1.a4.c7", type:"mcq", prompt:"Mixing red and yellow makes…", choices:["green","orange","purple","pink"], correct:"orange" },
        ]
      },

      // ---- Block A5: Sight words ----
      {
        id: "u1.a5", title: "Sight words (read on sight)", emoji: "👀",
        cards: [
          { id:"u1.a5.c1", type:"intro",
            title:"Tiny words, big help",
            body:"<b>Sight words</b> are little words you see EVERYWHERE: <i>the, and, is, you, a, to, in, it, my, see, go, can</i>. Learn them so you don't have to sound them out." },
          { id:"u1.a5.c2", type:"mcq", prompt:"Which word means YES you are ABLE to do something?", choices:["the","can","and","go"], correct:"can" },
          { id:"u1.a5.c3", type:"mcq", prompt:"Pick the missing word: <i>I ___ a dog.</i>", choices:["see","the","go","is"], correct:"see" },
          { id:"u1.a5.c4", type:"mcq", prompt:"Pick the missing word: <i>The cat ___ big.</i>", choices:["go","is","in","my"], correct:"is" },
          { id:"u1.a5.c5", type:"mcq", prompt:"Pick the missing word: <i>Ben ___ Mia ran.</i>", choices:["the","is","and","go"], correct:"and" },
          { id:"u1.a5.c6", type:"mcq", prompt:"Pick the missing word: <i>Let's ___ to the park.</i>", choices:["go","is","in","and"], correct:"go" },
          { id:"u1.a5.c7", type:"fill", prompt:"Fill in: <i>This is ___ book.</i> (one short word)", accept:["my"], choices:["my","I","me"] },
          { id:"u1.a5.c8", type:"fill", prompt:"Fill in: <i>I am ___ school right now.</i> (one short word)", accept:["at"], choices:["at","on","of"] },
        ]
      },

      // ---- Block A6: Simple read-and-answer ----
      {
        id: "u1.a6", title: "First reading", emoji: "📖",
        cards: [
          { id:"u1.a6.c1", type:"intro",
            title:"Read carefully",
            body:"Read the short story slowly. Then answer the questions. The answers are HIDDEN in the words you just read." },
          { id:"u1.a6.c2", type:"read",
            title:"My Dog Max",
            passage:"I have a dog. His name is Max. Max is brown and white. He likes to run in the yard. He loves to eat his food. At night, Max sleeps next to my bed.",
            questions:[
              { prompt:"What is the dog's name?", choices:["Sam","Max","Rex","Buddy"], correct:"Max" },
              { prompt:"What COLORS is Max?", choices:["black and white","brown and white","gray","red"], correct:"brown and white" },
              { prompt:"Where does Max sleep at night?", choices:["in the yard","next to the bed","on the roof","in a tree"], correct:"next to the bed" },
              { prompt:"What does Max LOVE to do?", choices:["fly","read","eat his food","drive a car"], correct:"eat his food" },
            ] },
        ]
      },

      // ---- Block 1: Nouns ----
      {
        id: "u1.b1", title: "Nouns: people, places, things", emoji: "🧱",
        cards: [
          { id:"u1.b1.c1", type:"intro",
            title:"Welcome, yodha!",
            body:"You can read words. Now learn what KIND of word each one is. First up: <b>nouns</b>.<br>Each card you clear grows your <b>Power Level</b>. Wrong answers cost a ❤️." },
          { id:"u1.b1.c2", type:"flash",
            front:"What is a <b>NOUN</b>?",
            back:"A noun is a <b>person, place, or thing</b>.<br>Examples: <b>boy, school, pencil, dog</b>." },
          { id:"u1.b1.c3", type:"mcq",
            prompt:"Which one is a <b>noun</b>?",
            choices:["jump","dog","quickly","blue"], correct:"dog" },
          { id:"u1.b1.c4", type:"mcq",
            prompt:"Which one is a <b>noun</b>?",
            choices:["happy","run","park","very"], correct:"park" },
          { id:"u1.b1.c5", type:"mcq",
            prompt:"Which one names a <b>person</b>?",
            choices:["table","teacher","quickly","red"], correct:"teacher" },
          { id:"u1.b1.c6", type:"mcq",
            prompt:"Pick the <b>noun</b>: <i>The cat sat on the mat.</i>",
            choices:["sat","cat","on","the"], correct:"cat" },
        ]
      },

      // ---- Block 2: Verbs ----
      {
        id: "u1.b2", title: "Verbs: action words", emoji: "🏃",
        cards: [
          { id:"u1.b2.c1", type:"flash",
            front:"What is a <b>VERB</b>?",
            back:"A verb is an <b>action word</b>.<br>Examples: <b>run, eat, jump, sing</b>." },
          { id:"u1.b2.c2", type:"mcq",
            prompt:"Which one is a <b>verb</b>?",
            choices:["table","jump","blue","fast"], correct:"jump" },
          { id:"u1.b2.c3", type:"mcq",
            prompt:"Which one is a <b>verb</b>?",
            choices:["happy","window","sing","tree"], correct:"sing" },
          { id:"u1.b2.c4", type:"mcq",
            prompt:"Pick the <b>verb</b>: <i>The boy kicks the ball.</i>",
            choices:["boy","kicks","ball","the"], correct:"kicks" },
          { id:"u1.b2.c5", type:"mcq",
            prompt:"Pick the <b>verb</b>: <i>Birds fly south.</i>",
            choices:["Birds","fly","south","s"], correct:"fly" },
          { id:"u1.b2.c6", type:"fill",
            prompt:"Type any one verb (action word) you can do at recess. (Many answers are correct.)",
            accept:["run","jump","play","skip","hop","kick","throw","catch","climb","sing","dance","read","walk","laugh","swing"],
            choices:["run","jump","play"] },
        ]
      },

      // ---- Block 3: Add within 20 ----
      {
        id: "u1.b3", title: "Add within 20", emoji: "➕",
        cards: [
          { id:"u1.b3.c1", type:"intro",
            title:"Adding to 20",
            body:"When you <b>add</b>, you put two groups together. 6 + 5 = 11.<br>Tip: when adding, the BIGGER number first is faster: 3 + 8 → think 8 + 3." },
          { id:"u1.b3.c2", type:"mcq", prompt:"🧮 3 + 4 = ?", choices:["6","7","8","9"], correct:"7" },
          { id:"u1.b3.c3", type:"mcq", prompt:"🧮 5 + 5 = ?", choices:["8","9","10","11"], correct:"10" },
          { id:"u1.b3.c4", type:"mcq", prompt:"🧮 6 + 7 = ?", choices:["12","13","14","15"], correct:"13" },
          { id:"u1.b3.c5", type:"mcq", prompt:"🧮 8 + 5 = ?", choices:["12","13","14","15"], correct:"13" },
          { id:"u1.b3.c6", type:"mcq", prompt:"🧮 4 + 9 = ?", choices:["11","12","13","14"], correct:"13" },
          { id:"u1.b3.c7", type:"fill", prompt:"🧮 9 + 6 = ?", accept:["15","fifteen"], choices:["15","14","16"] },
          { id:"u1.b3.c8", type:"fill", prompt:"🧮 7 + 8 = ?", accept:["15","fifteen"], choices:["15","14","16"] },
          { id:"u1.b3.c9", type:"fill", prompt:"🧮 11 + 6 = ?", accept:["17","seventeen"], choices:["17","16","18"] },
          { id:"u1.b3.c10", type:"mcq",
            prompt:"🧮 Goku has 8 senzu beans. Krillin gives him 6 more. How many now?",
            choices:["12","13","14","15"], correct:"14" },
        ]
      },

      // ---- Block 4: Subtract within 20 ----
      {
        id: "u1.b4", title: "Subtract within 20", emoji: "➖",
        cards: [
          { id:"u1.b4.c1", type:"intro",
            title:"Subtracting",
            body:"When you <b>subtract</b>, you take some away. 12 − 4 = 8.<br>Tip: subtraction <b>undoes</b> addition. If 6 + 4 = 10, then 10 − 4 = 6." },
          { id:"u1.b4.c2", type:"mcq", prompt:"🧮 10 − 3 = ?", choices:["6","7","8","9"], correct:"7" },
          { id:"u1.b4.c3", type:"mcq", prompt:"🧮 12 − 4 = ?", choices:["6","7","8","9"], correct:"8" },
          { id:"u1.b4.c4", type:"mcq", prompt:"🧮 13 − 5 = ?", choices:["7","8","9","10"], correct:"8" },
          { id:"u1.b4.c5", type:"mcq", prompt:"🧮 16 − 9 = ?", choices:["6","7","8","9"], correct:"7" },
          { id:"u1.b4.c6", type:"mcq", prompt:"🧮 20 − 8 = ?", choices:["10","11","12","13"], correct:"12" },
          { id:"u1.b4.c7", type:"fill", prompt:"🧮 15 − 7 = ?", accept:["8","eight"], choices:["8","7","9"] },
          { id:"u1.b4.c8", type:"fill", prompt:"🧮 18 − 9 = ?", accept:["9","nine"], choices:["9","8","10"] },
          { id:"u1.b4.c9", type:"fill", prompt:"🧮 14 − 6 = ?", accept:["8","eight"], choices:["8","7","9"] },
          { id:"u1.b4.c10", type:"mcq",
            prompt:"🧮 Mia had 14 stickers. She gave 6 away. How many left?",
            choices:["6","7","8","9"], correct:"8" },
        ]
      },

      // ---- Block 5: Capitals & Periods ----
      {
        id: "u1.b5", title: "Capitals & Periods", emoji: "🔠",
        cards: [
          { id:"u1.b5.c1", type:"flash",
            front:"Two big rules.",
            back:"1) Start every <b>sentence</b> with a CAPITAL letter.<br>2) End it with a <b>period (.)</b> or other mark." },
          { id:"u1.b5.c2", type:"mcq",
            prompt:"Which sentence is correct?",
            choices:[
              "the dog runs fast.",
              "The dog runs fast",
              "The dog runs fast.",
              "the Dog Runs Fast."
            ], correct:"The dog runs fast." },
          { id:"u1.b5.c3", type:"mcq",
            prompt:"Names of people start with…",
            choices:["a small letter","a CAPITAL letter","a number","nothing"], correct:"a CAPITAL letter" },
          { id:"u1.b5.c4", type:"mcq",
            prompt:"Which is written correctly?",
            choices:["i like pizza.","I like Pizza.","I like pizza.","I Like pizza"], correct:"I like pizza." },
          { id:"u1.b5.c5", type:"mcq",
            prompt:"Which mark ends a normal sentence?",
            choices:["?","!",".",","], correct:"." },
        ]
      },

      // ---- Block 6: Weather ----
      {
        id: "u1.b6", title: "Weather Words", emoji: "☀️",
        cards: [
          { id:"u1.b6.c1", type:"intro",
            title:"Weather",
            body:"Weather is what the sky and air are doing right now: <b>sunny ☀️, cloudy ☁️, rainy 🌧️, snowy ❄️, windy 🌬️</b>." },
          { id:"u1.b6.c2", type:"mcq",
            prompt:"It is dropping water from the sky. The weather is…",
            choices:["sunny","rainy","snowy","windy"], correct:"rainy" },
          { id:"u1.b6.c3", type:"mcq",
            prompt:"White flakes are falling. The weather is…",
            choices:["rainy","sunny","snowy","foggy"], correct:"snowy" },
          { id:"u1.b6.c4", type:"mcq",
            prompt:"What should you wear on a <b>cold snowy</b> day?",
            choices:["shorts and a t-shirt","a swimsuit","a warm coat and gloves","sandals"], correct:"a warm coat and gloves" },
          { id:"u1.b6.c5", type:"mcq",
            prompt:"What do you bring on a <b>rainy</b> day?",
            choices:["sunglasses","an umbrella","a snow shovel","a fan"], correct:"an umbrella" },
          { id:"u1.b6.c6", type:"fill",
            prompt:"Type the weather word: it is very hot and bright outside. ☀️",
            accept:["sunny"],
            choices:["sunny","cloudy","rainy"] },
        ]
      },

      // ---- Block 7: Calendar (days, months, seasons) ----
      {
        id: "u1.b7", title: "Calendar: Days, Months, Seasons", emoji: "📅",
        cards: [
          { id:"u1.b7.c1", type:"intro",
            title:"Calendar Basics",
            body:"There are <b>7 days</b> in a week and <b>12 months</b> in a year. The 4 seasons are <b>spring, summer, fall, winter</b>." },
          { id:"u1.b7.c2", type:"mcq",
            prompt:"How many days are in one week?",
            choices:["5","6","7","10"], correct:"7" },
          { id:"u1.b7.c3", type:"mcq",
            prompt:"Which day comes <b>after</b> Wednesday?",
            choices:["Monday","Tuesday","Thursday","Saturday"], correct:"Thursday" },
          { id:"u1.b7.c4", type:"mcq",
            prompt:"Which is the <b>first</b> month of the year?",
            choices:["March","December","January","July"], correct:"January" },
          { id:"u1.b7.c5", type:"mcq",
            prompt:"Snow usually falls in which season?",
            choices:["spring","summer","fall","winter"], correct:"winter" },
          { id:"u1.b7.c6", type:"fill",
            prompt:"How many months are in a year? (number)",
            accept:["12","twelve"],
            choices:["12","10","7"] },
        ]
      },

      // ---- Block 8: Plurals (s / es) ----
      {
        id: "u1.b8", title: "Plurals: one or many?", emoji: "🔢",
        cards: [
          { id:"u1.b8.c1", type:"flash",
            front:"What is a <b>plural</b>?",
            back:"More than one. Add <b>-s</b> to most nouns: <b>cat → cats</b>. If the word ends in <b>s, x, ch, sh</b>, add <b>-es</b>: <b>box → boxes</b>." },
          { id:"u1.b8.c2", type:"mcq", prompt:"Plural of <b>dog</b>?",
            choices:["dog","dogs","doges","dogies"], correct:"dogs" },
          { id:"u1.b8.c3", type:"mcq", prompt:"Plural of <b>box</b>?",
            choices:["boxs","boxies","boxes","box"], correct:"boxes" },
          { id:"u1.b8.c4", type:"mcq", prompt:"Plural of <b>bus</b>?",
            choices:["bus","buss","buses","busies"], correct:"buses" },
          { id:"u1.b8.c5", type:"fill", prompt:"Plural of <b>book</b>? (one word)",
            accept:["books"], choices:["books","bookes","bookies"] },
          { id:"u1.b8.c6", type:"fill", prompt:"Plural of <b>brush</b>? (one word)",
            accept:["brushes"], choices:["brushes","brushs","brushies"] },
        ]
      },

      // ---- Block 9: My Body & Hygiene ----
      {
        id: "u1.b9", title: "My Body & Healthy Habits", emoji: "🦻",
        cards: [
          { id:"u1.b9.c1", type:"intro",
            title:"Take care of your body",
            body:"Your body needs <b>healthy food</b>, <b>water</b>, <b>sleep</b>, and <b>exercise</b>. Wash your hands to stop germs." },
          { id:"u1.b9.c2", type:"mcq",
            prompt:"Which part of your body do you use to <b>smell</b>?",
            choices:["eyes","ears","nose","hands"], correct:"nose" },
          { id:"u1.b9.c3", type:"mcq",
            prompt:"When should you <b>wash your hands</b>?",
            choices:["Only at night","Before eating and after the bathroom","Once a week","Never"], correct:"Before eating and after the bathroom" },
          { id:"u1.b9.c4", type:"mcq",
            prompt:"How many hours of sleep does a 7–8 year old need?",
            choices:["3–4","5–6","9–11","15–16"], correct:"9–11" },
          { id:"u1.b9.c5", type:"mcq",
            prompt:"Which is the <b>healthiest</b> snack?",
            choices:["candy bar","soda","an apple","chips"], correct:"an apple" },
          { id:"u1.b9.c6", type:"mcq",
            prompt:"You should brush your teeth…",
            choices:["once a week","only when sick","twice a day","only after candy"], correct:"twice a day" },
        ]
      },

      // ---- Block 10: Vocabulary Builder (easy) ----
      {
        id: "u1.b10", title: "Word Power: Easy Words", emoji: "📖",
        cards: [
          { id:"u1.b10.c1", type:"intro",
            title:"What is a <b>definition</b>?",
            body:"A <b>definition</b> tells you what a word means. Learning new words is like leveling up your brain. Let's add 5 words to your power." },
          { id:"u1.b10.c2", type:"flash",
            front:"<b>brave</b> (adjective)",
            back:"Not afraid to do something hard or scary.<br><i>The brave girl helped the lost puppy.</i>" },
          { id:"u1.b10.c3", type:"mcq",
            prompt:"<b>Tiny</b> means…",
            choices:["very loud","very small","very fast","very hot"], correct:"very small" },
          { id:"u1.b10.c4", type:"mcq",
            prompt:"<b>Giggle</b> means…",
            choices:["to cry softly","to sleep","to laugh in a small way","to shout"], correct:"to laugh in a small way" },
          { id:"u1.b10.c5", type:"mcq",
            prompt:"<b>Chilly</b> means…",
            choices:["a little cold","very hungry","very warm","very tired"], correct:"a little cold" },
          { id:"u1.b10.c6", type:"mcq",
            prompt:"<b>Gigantic</b> means…",
            choices:["very small","very huge","very fast","very quiet"], correct:"very huge" },
          { id:"u1.b10.c7", type:"fill",
            prompt:"A word that means <b>not afraid</b> (5 letters):",
            accept:["brave"], choices:["brave","scared","afraid"] },
        ]
      },

      // ---- Block 11: 🔡 Spelling: short vowels (CVC) ----
      {
        id: "u1.b11", title: "Spelling: short vowels", emoji: "🔡",
        cards: [
          { id:"u1.b11.c1", type:"intro",
            title:"Short vowels: a, e, i, o, u",
            body:"Three-letter words like <b>cat</b>, <b>bed</b>, <b>pig</b>, <b>dog</b>, <b>cup</b> have <b>short vowel</b> sounds. Listen to the middle letter — that's the vowel." },
          { id:"u1.b11.c2", type:"flash",
            front:"What is a <b>vowel</b>?",
            back:"The letters <b>a, e, i, o, u</b> (and sometimes y) are vowels. All other letters are consonants." },
          { id:"u1.b11.c3", type:"mcq",
            prompt:"Which word has the <b>short a</b> sound (like in <i>cat</i>)?",
            choices:["bed","pan","cup","dog"], correct:"pan" },
          { id:"u1.b11.c4", type:"mcq",
            prompt:"Which word has the <b>short e</b> sound (like in <i>bed</i>)?",
            choices:["sit","top","pen","mud"], correct:"pen" },
          { id:"u1.b11.c5", type:"mcq",
            prompt:"Which word has the <b>short i</b> sound (like in <i>pig</i>)?",
            choices:["bag","hot","fix","run"], correct:"fix" },
          { id:"u1.b11.c6", type:"mcq",
            prompt:"Which word has the <b>short o</b> sound (like in <i>dog</i>)?",
            choices:["mop","sun","red","bat"], correct:"mop" },
          { id:"u1.b11.c7", type:"fill",
            prompt:"Spell the 3-letter word: a young child is a k_d (fill in the missing vowel — type the whole word)",
            accept:["kid"], choices:["kid","kad","kud"] },
          { id:"u1.b11.c8", type:"fill",
            prompt:"Spell the 3-letter word that rhymes with <b>fun</b> and means a star in the sky:",
            accept:["sun"], choices:["sun","run","bun"] },
        ]
      },

      // ---- Block 12: 🎮 Fun Arena (mini-games) ----
      {
        id: "u1.fun", title: "Fun Arena 🎮", emoji: "🎮",
        cards: [
          { id:"u1.fun.c1", type:"intro",
            title:"🎮 Fun Arena!",
            body:"Mini-games time! Match pairs, tap the right ones, and a speed round. Same hearts, more fun." },
          { id:"u1.fun.c2", type:"tap",
            prompt:"Tap all the <b>NOUNS</b>",
            items:[
              { label:"dog", correct:true },
              { label:"run", correct:false },
              { label:"happy", correct:false },
              { label:"school", correct:true },
              { label:"jump", correct:false },
              { label:"book", correct:true },
              { label:"quickly", correct:false },
              { label:"teacher", correct:true },
            ] },
          { id:"u1.fun.c3", type:"match",
            title:"Match the singular & plural",
            pairs:[
              { a:"dog", b:"dogs" },
              { a:"box", b:"boxes" },
              { a:"baby", b:"babies" },
              { a:"foot", b:"feet" },
            ] },
          { id:"u1.fun.c4", type:"tap",
            prompt:"Tap all the <b>VERBS</b>",
            items:[
              { label:"sing", correct:true },
              { label:"red", correct:false },
              { label:"eat", correct:true },
              { label:"chair", correct:false },
              { label:"swim", correct:true },
              { label:"banana", correct:false },
              { label:"jump", correct:true },
            ] },
          { id:"u1.fun.c5", type:"speed",
            title:"Math Sprint: +/− to 20",
            seconds:8,
            questions:[
              { prompt:"7 + 5", choices:["10","11","12","13"], correct:"12" },
              { prompt:"15 − 6", choices:["7","8","9","10"], correct:"9" },
              { prompt:"9 + 8", choices:["15","16","17","18"], correct:"17" },
              { prompt:"13 − 7", choices:["5","6","7","8"], correct:"6" },
              { prompt:"11 + 4", choices:["13","14","15","16"], correct:"15" },
            ] },
          { id:"u1.fun.c6", type:"match",
            title:"Match capital with country",
            pairs:[
              { a:"India", b:"New Delhi" },
              { a:"USA", b:"Washington D.C." },
              { a:"Japan", b:"Tokyo" },
              { a:"France", b:"Paris" },
            ] },
          { id:"u1.fun.c7", type:"tap",
            prompt:"Tap all the <b>PLURALS</b> (more than one)",
            items:[
              { label:"cats", correct:true },
              { label:"dog", correct:false },
              { label:"boxes", correct:true },
              { label:"cup", correct:false },
              { label:"babies", correct:true },
              { label:"book", correct:false },
              { label:"feet", correct:true },
              { label:"man", correct:false },
            ] },
        ]
      },

      // ---- BOSS ----
      {
        id: "u1.boss", title: "BOSS: Saibaman", emoji: "👹",
        cards: [
          { id:"u1.boss.c1", type:"boss",
            name:"Saibaman", namePa:"ਸਾਈਬਾਮਨ", emoji:"👹", hp:6,
            questions:[
              { prompt:"Pick the noun: <i>The pencil broke.</i>", choices:["The","pencil","broke","."], correct:"pencil" },
              { prompt:"Pick the verb: <i>She sings a song.</i>", choices:["She","sings","a","song"], correct:"sings" },
              { prompt:"🧮 7 + 6 = ?", choices:["12","13","14","15"], correct:"13" },
              { prompt:"🧮 14 − 5 = ?", choices:["8","9","10","11"], correct:"9" },
              { prompt:"Which sentence is correct?", choices:["my dog is brown","My dog is brown.","My Dog Is Brown","my dog is brown."], correct:"My dog is brown." },
              { prompt:"🧮 9 + 9 = ?", choices:["16","17","18","19"], correct:"18" },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 2 — Z FIGHTER  (build, ~Grade 2.0–2.5)
  // ============================================================
  {
    id: "u2", title: "Z Fighter Drills", emoji: "🥋",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 1) ----
      {
        id: "u2.recap", title: "Chai Recap: Unit 1", emoji: "☕",
        cards: [
          { id:"u2.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Quick refresh of Unit 1 before we level up. <b>Nouns, verbs, plurals, place value, +/− to 20.</b> Power through!" },
          { id:"u2.recap.c2", type:"mcq",
            prompt:"Pick the noun: <i>The bird sang loudly.</i>",
            choices:["The","bird","sang","loudly"], correct:"bird" },
          { id:"u2.recap.c3", type:"mcq",
            prompt:"Pick the verb: <i>She runs every day.</i>",
            choices:["She","runs","every","day"], correct:"runs" },
          { id:"u2.recap.c4", type:"mcq",
            prompt:"Plural of <b>baby</b>?",
            choices:["babys","babies","babyes","baby"], correct:"babies" },
          { id:"u2.recap.c5", type:"mcq",
            prompt:"In <b>46</b>, the 4 stands for…",
            choices:["4 ones","4 tens","4 hundreds","4 thousand"], correct:"4 tens" },
          { id:"u2.recap.c6", type:"fill",
            prompt:"🧮 8 + 7 = ?",
            accept:["15","fifteen"], choices:["15","14","16"] },
        ]
      },

      // ---- Block 1: Past tense — regular -ed ----
      {
        id: "u2.b1", title: "Past tense (regular -ed)", emoji: "⏪",
        cards: [
          { id:"u2.b1.c1", type:"intro",
            title:"Past Tense — the easy way",
            body:"For most verbs, add <b>-ed</b> to talk about the past. <i>walk → walked. play → played.</i>" },
          { id:"u2.b1.c2", type:"mcq", prompt:"Past of <b>walk</b>?",
            choices:["walking","walks","walked","will walk"], correct:"walked" },
          { id:"u2.b1.c3", type:"mcq", prompt:"Past of <b>jump</b>?",
            choices:["jumping","jumped","jumps","jumpt"], correct:"jumped" },
          { id:"u2.b1.c4", type:"fill", prompt:"Past of <b>play</b>? (one word)",
            accept:["played"], choices:["played","playd","playing"] },
          { id:"u2.b1.c5", type:"fill", prompt:"Past of <b>help</b>? (one word)",
            accept:["helped"], choices:["helped","helpd","helping"] },
          { id:"u2.b1.c6", type:"mcq",
            prompt:"Pick the past-tense sentence:",
            choices:["I will jump.","I jump.","I jumped.","I am jumping."], correct:"I jumped." },
        ]
      },

      // ---- Block 2: Past tense — irregulars ----
      {
        id: "u2.b2", title: "Past tense (tricky verbs)", emoji: "🌀",
        cards: [
          { id:"u2.b2.c1", type:"flash",
            front:"Some verbs are <b>tricky</b>.",
            back:"They change shape in the past:<br><b>go → went</b>, <b>eat → ate</b>, <b>run → ran</b>, <b>see → saw</b>." },
          { id:"u2.b2.c2", type:"mcq", prompt:"Past of <b>go</b>?", choices:["goed","gone","went","going"], correct:"went" },
          { id:"u2.b2.c3", type:"mcq", prompt:"Past of <b>see</b>?", choices:["seen","saw","sawed","sees"], correct:"saw" },
          { id:"u2.b2.c4", type:"fill", prompt:"Past of <b>eat</b>? (one word)", accept:["ate"], choices:["ate","eated","eat"] },
          { id:"u2.b2.c5", type:"fill", prompt:"Past of <b>run</b>? (one word)", accept:["ran"], choices:["ran","runned","runs"] },
          { id:"u2.b2.c6", type:"fill", prompt:"Past of <b>think</b>? (one word)", accept:["thought"], choices:["thought","thinked","thunk"] },
        ]
      },

      // ---- Block 3: Place value — tens & ones ----
      {
        id: "u2.b3", title: "Tens & Ones", emoji: "🔟",
        cards: [
          { id:"u2.b3.c1", type:"intro",
            title:"Place Value",
            body:"In <b>47</b>, the 4 means <b>4 tens (40)</b> and the 7 means <b>7 ones</b>. Together: 47." },
          { id:"u2.b3.c2", type:"mcq",
            prompt:"In <b>52</b>, the <b>5</b> means…",
            choices:["5 ones","5 tens (50)","5 hundreds","5 fives"], correct:"5 tens (50)" },
          { id:"u2.b3.c3", type:"mcq",
            prompt:"In <b>83</b>, the <b>3</b> means…",
            choices:["3 ones","3 tens","3 hundreds","3 thousand"], correct:"3 ones" },
          { id:"u2.b3.c4", type:"fill",
            prompt:"What number is <b>3 tens + 6 ones</b>?",
            accept:["36"], choices:["36","63","306"] },
          { id:"u2.b3.c5", type:"fill",
            prompt:"What number is <b>7 tens + 2 ones</b>?",
            accept:["72"], choices:["72","27","702"] },
          { id:"u2.b3.c6", type:"mcq",
            prompt:"Which number has <b>9 tens</b>?",
            choices:["19","49","91","109"], correct:"91" },
        ]
      },

      // ---- Block 4: 2-digit add (no regroup) ----
      {
        id: "u2.b4", title: "Add 2-digit numbers", emoji: "🧮",
        cards: [
          { id:"u2.b4.c1", type:"intro",
            title:"Adding 2-digit numbers",
            body:"Add the <b>ones</b>, then add the <b>tens</b>. 23 + 14: ones 3+4=7, tens 2+1=3 → <b>37</b>." },
          { id:"u2.b4.c2", type:"mcq", prompt:"🧮 20 + 30 = ?", choices:["40","50","60","70"], correct:"50" },
          { id:"u2.b4.c3", type:"mcq", prompt:"🧮 23 + 14 = ?", choices:["27","37","47","57"], correct:"37" },
          { id:"u2.b4.c4", type:"fill", prompt:"🧮 41 + 25 = ?", accept:["66"], choices:["66","65","67"] },
          { id:"u2.b4.c5", type:"fill", prompt:"🧮 52 + 36 = ?", accept:["88"], choices:["88","78","98"] },
          { id:"u2.b4.c6", type:"mcq",
            prompt:"🧮 Goku trained 30 hours. He trained 25 more. Total?",
            choices:["45","50","55","65"], correct:"55" },
        ]
      },

      // ---- Block 5: Sight words & contractions ----
      {
        id: "u2.b5", title: "Common Words & Contractions", emoji: "✏️",
        cards: [
          { id:"u2.b5.c1", type:"flash",
            front:"A <b>contraction</b> squishes two words.",
            back:"<b>do not → don't</b><br><b>I am → I'm</b><br><b>can not → can't</b><br>The apostrophe (') replaces the missing letters." },
          { id:"u2.b5.c2", type:"mcq", prompt:"<b>do not</b> = ?",
            choices:["dont","don't","do'nt","do.nt"], correct:"don't" },
          { id:"u2.b5.c3", type:"mcq", prompt:"<b>I am</b> = ?",
            choices:["Im","I'am","I'm","Iam"], correct:"I'm" },
          { id:"u2.b5.c4", type:"mcq", prompt:"<b>can not</b> = ?",
            choices:["can't","cant","ca'nt","cann't"], correct:"can't" },
          { id:"u2.b5.c5", type:"mcq", prompt:"Pick the correct word: <i>They ___ playing.</i>",
            choices:["is","am","are","be"], correct:"are" },
          { id:"u2.b5.c6", type:"mcq", prompt:"Pick the correct word: <i>She ___ a book.</i>",
            choices:["have","has","is","do"], correct:"has" },
        ]
      },

      // ---- Block 6: Reading short passage ----
      {
        id: "u2.b6", title: "Read & Answer (short)", emoji: "📖",
        cards: [
          { id:"u2.b6.c1", type:"intro",
            title:"Read carefully.",
            body:"Read the small story, then answer the questions. You can re-read — there is no timer." },
          { id:"u2.b6.c2", type:"read",
            passage:"Mia found a small turtle in her garden. It had a green shell with yellow spots. She gave it some lettuce. The turtle ate slowly and walked under a big leaf to rest.",
            questions:[
              { prompt:"What did Mia find?", choices:["A frog","A turtle","A snake","A bird"], correct:"A turtle" },
              { prompt:"What color were the spots?", choices:["Red","Blue","Yellow","White"], correct:"Yellow" },
              { prompt:"Where did the turtle rest?", choices:["In a box","Under a leaf","In water","On a rock"], correct:"Under a leaf" },
            ] },
        ]
      },

      // ---- Block 7: Telling Time ----
      {
        id: "u2.b7", title: "Telling Time", emoji: "🕒",
        cards: [
          { id:"u2.b7.c1", type:"intro",
            title:"Reading a Clock",
            body:"The <b>short hand</b> shows the <b>hour</b>. The <b>long hand</b> shows the <b>minutes</b>. When the long hand is on 12, it's <b>o'clock</b>. On 6, it's <b>half past</b>." },
          { id:"u2.b7.c2", type:"mcq",
            prompt:"The short hand points to <b>3</b> and the long hand points to <b>12</b>. The time is…",
            choices:["12:03","3:00","3:12","12:30"], correct:"3:00" },
          { id:"u2.b7.c3", type:"mcq",
            prompt:"The short hand is just past <b>7</b>, the long hand is on <b>6</b>. The time is…",
            choices:["6:07","7:30","7:06","6:30"], correct:"7:30" },
          { id:"u2.b7.c4", type:"mcq",
            prompt:"How many <b>minutes</b> are in 1 hour?",
            choices:["10","30","60","100"], correct:"60" },
          { id:"u2.b7.c5", type:"mcq",
            prompt:"How many <b>hours</b> are in one day?",
            choices:["12","24","60","7"], correct:"24" },
          { id:"u2.b7.c6", type:"fill",
            prompt:"School starts at 9:00. School ends at 3:00. How many hours? (number)",
            accept:["6","six"], choices:["6","5","12"] },
        ]
      },

      // ---- Block 8: Money (USD + Rupees) ----
      {
        id: "u2.b8", title: "Money: Dollars & Rupees", emoji: "💵",
        cards: [
          { id:"u2.b8.c1", type:"intro",
            title:"Money around the world",
            body:"In the USA money is in <b>dollars ($)</b> and <b>cents (¢)</b>. In India it is in <b>rupees (₹)</b> and <b>paise</b>. <b>100 cents = $1</b>. <b>100 paise = ₹1</b>." },
          { id:"u2.b8.c2", type:"mcq",
            prompt:"How many cents make <b>$1</b>?",
            choices:["10","50","100","1000"], correct:"100" },
          { id:"u2.b8.c3", type:"mcq",
            prompt:"How many paise make <b>₹1</b>?",
            choices:["10","50","100","1000"], correct:"100" },
          { id:"u2.b8.c4", type:"mcq",
            prompt:"A quarter is worth…",
            choices:["5¢","10¢","25¢","50¢"], correct:"25¢" },
          { id:"u2.b8.c5", type:"mcq",
            prompt:"💵 A toy costs $3. You pay with a $5 bill. How much change?",
            choices:["$1","$2","$3","$5"], correct:"$2" },
          { id:"u2.b8.c6", type:"fill",
            prompt:"💰 A pencil is ₹15. An eraser is ₹10. Total in rupees? (number only)",
            accept:["25"], choices:["25","15","30"] },
          { id:"u2.b8.c7", type:"mcq",
            prompt:"Which is the <b>most</b> money?",
            choices:["3 quarters (75¢)","5 dimes (50¢)","$1","9 nickels (45¢)"], correct:"$1" },
        ]
      },

      // ---- Block 9: Pronouns ----
      {
        id: "u2.b9", title: "Pronouns (he, she, it, they)", emoji: "👥",
        cards: [
          { id:"u2.b9.c1", type:"flash",
            front:"What is a <b>pronoun</b>?",
            back:"A pronoun takes the place of a noun.<br><b>he</b> = a boy/man, <b>she</b> = a girl/woman,<br><b>it</b> = a thing, <b>they</b> = more than one." },
          { id:"u2.b9.c2", type:"mcq", prompt:"<i>Sam plays soccer. ___ is fast.</i>",
            choices:["He","She","It","They"], correct:"He" },
          { id:"u2.b9.c3", type:"mcq", prompt:"<i>Mia loves cats. ___ has three.</i>",
            choices:["He","She","It","They"], correct:"She" },
          { id:"u2.b9.c4", type:"mcq", prompt:"<i>The ball is red. ___ is round.</i>",
            choices:["He","She","It","They"], correct:"It" },
          { id:"u2.b9.c5", type:"mcq", prompt:"<i>The kids ran. ___ were happy.</i>",
            choices:["He","She","It","They"], correct:"They" },
          { id:"u2.b9.c6", type:"mcq", prompt:"Pick the pronoun: <i>We saw a movie.</i>",
            choices:["saw","a","movie","We"], correct:"We" },
        ]
      },

      // ---- Block 10: Shapes (2D & 3D) ----
      {
        id: "u2.b10", title: "Shapes: 2D & 3D", emoji: "🔷",
        cards: [
          { id:"u2.b10.c1", type:"intro",
            title:"Shapes",
            body:"<b>2D shapes</b> are flat: circle, square, triangle, rectangle. <b>3D shapes</b> are solid: cube, sphere (ball), cylinder (can), cone." },
          { id:"u2.b10.c2", type:"mcq", prompt:"A shape with <b>3 sides</b> is a…",
            choices:["square","triangle","circle","rectangle"], correct:"triangle" },
          { id:"u2.b10.c3", type:"mcq", prompt:"A shape with <b>4 equal sides</b> is a…",
            choices:["rectangle","square","oval","hexagon"], correct:"square" },
          { id:"u2.b10.c4", type:"mcq", prompt:"A <b>ball</b> is shaped like a…",
            choices:["cube","cone","sphere","cylinder"], correct:"sphere" },
          { id:"u2.b10.c5", type:"mcq", prompt:"A <b>soup can</b> is shaped like a…",
            choices:["cube","cone","sphere","cylinder"], correct:"cylinder" },
          { id:"u2.b10.c6", type:"fill",
            prompt:"How many sides does a <b>hexagon</b> have? (number)",
            accept:["6","six"], choices:["6","5","8"] },
        ]
      },

      // ---- Block 11: Fractions (halves & quarters) ----
      {
        id: "u2.b11", title: "Fractions: halves & quarters", emoji: "🍰",
        cards: [
          { id:"u2.b11.c1", type:"intro",
            title:"Equal Parts",
            body:"A <b>half (1/2)</b> means 1 of 2 equal parts. A <b>quarter (1/4)</b> means 1 of 4 equal parts." },
          { id:"u2.b11.c2", type:"mcq",
            prompt:"A pizza is cut into 2 equal slices. One slice is…",
            choices:["1/3","1/2","1/4","2/2"], correct:"1/2" },
          { id:"u2.b11.c3", type:"mcq",
            prompt:"A cake is cut into 4 equal pieces. One piece is…",
            choices:["1/2","1/3","1/4","4/4"], correct:"1/4" },
          { id:"u2.b11.c4", type:"mcq",
            prompt:"Which is <b>more</b>: 1/2 or 1/4 of the same pizza?",
            choices:["1/2","1/4","They are equal","Cannot tell"], correct:"1/2" },
          { id:"u2.b11.c5", type:"fill",
            prompt:"There are 8 cookies. <b>Half</b> of them is how many? (number)",
            accept:["4","four"], choices:["4","2","8"] },
          { id:"u2.b11.c6", type:"fill",
            prompt:"There are 12 grapes. A <b>quarter</b> of them is how many? (number)",
            accept:["3","three"], choices:["3","4","6"] },
        ]
      },

      // ---- Block 12: Community Helpers ----
      {
        id: "u2.b12", title: "Community Helpers", emoji: "🚒",
        cards: [
          { id:"u2.b12.c1", type:"flash",
            front:"<b>Community helpers</b>",
            back:"People who do important jobs to help others: <b>doctor, teacher, firefighter, police officer, farmer, mail carrier</b>." },
          { id:"u2.b12.c2", type:"mcq", prompt:"Who helps you when you are sick?",
            choices:["farmer","doctor","pilot","chef"], correct:"doctor" },
          { id:"u2.b12.c3", type:"mcq", prompt:"Who puts out fires?",
            choices:["teacher","firefighter","librarian","dentist"], correct:"firefighter" },
          { id:"u2.b12.c4", type:"mcq", prompt:"Who grows food?",
            choices:["farmer","chef","plumber","nurse"], correct:"farmer" },
          { id:"u2.b12.c5", type:"mcq", prompt:"In an emergency in the USA, what number do you call?",
            choices:["411","311","911","711"], correct:"911" },
          { id:"u2.b12.c6", type:"mcq", prompt:"Who teaches you at school?",
            choices:["chef","teacher","vet","driver"], correct:"teacher" },
        ]
      },

      // ---- Block 13: Vocabulary Builder (medium) ----
      {
        id: "u2.b13", title: "Word Power: Better Words", emoji: "🎯",
        cards: [
          { id:"u2.b13.c1", type:"intro",
            title:"Stronger words = stronger writing",
            body:"Instead of <b>good</b>, try <b>excellent</b>. Instead of <b>bad</b>, try <b>terrible</b>. Strong words tell better stories." },
          { id:"u2.b13.c2", type:"flash",
            front:"<b>curious</b> (adjective)",
            back:"Wanting to know or learn something.<br><i>The curious cat looked inside the box.</i>" },
          { id:"u2.b13.c3", type:"mcq",
            prompt:"<b>Enormous</b> means…",
            choices:["very small","very huge","very loud","very fast"], correct:"very huge" },
          { id:"u2.b13.c4", type:"mcq",
            prompt:"<b>Whisper</b> means to speak…",
            choices:["very loudly","in a song","very softly","in another language"], correct:"very softly" },
          { id:"u2.b13.c5", type:"mcq",
            prompt:"<b>Delicious</b> means…",
            choices:["very tasty","very ugly","very heavy","very smelly"], correct:"very tasty" },
          { id:"u2.b13.c6", type:"mcq",
            prompt:"<b>Brilliant</b> means…",
            choices:["very dim","very smart or shining","very wet","very angry"], correct:"very smart or shining" },
          { id:"u2.b13.c7", type:"mcq",
            prompt:"<b>Exhausted</b> means…",
            choices:["very excited","very full","very tired","very early"], correct:"very tired" },
          { id:"u2.b13.c8", type:"fill",
            prompt:"A word that means <b>wanting to learn</b> (7 letters):",
            accept:["curious"], choices:["curious","clever","brave"] },
        ]
      },

      // ---- Block 14: ✏️ Apostrophes (possessives & contractions) ----
      {
        id: "u2.b14", title: "Apostrophes: it's vs its, dog's bone", emoji: "✏️",
        cards: [
          { id:"u2.b14.c1", type:"intro",
            title:"What does an apostrophe (') do?",
            body:"Apostrophes do <b>two jobs</b>:<br>1. <b>Show ownership</b>: <i>the dog's bone</i> = the bone that belongs to the dog.<br>2. <b>Make contractions</b>: <i>it is</i> → <i>it's</i> (the ' replaces the missing letter)." },
          { id:"u2.b14.c2", type:"mcq",
            prompt:"Which one means <b>the toy that belongs to the boy</b>?",
            choices:["the boys toy","the boy's toy","the boys' toy","the boy toy"], correct:"the boy's toy" },
          { id:"u2.b14.c3", type:"mcq",
            prompt:"Pick the correct sentence:",
            choices:["The cat licked it's paw.","The cat licked its paw.","The cat licked its' paw.","The cat licked it is paw."], correct:"The cat licked its paw." },
          { id:"u2.b14.c4", type:"mcq",
            prompt:"<b>It's</b> is short for…",
            choices:["it has","it is","it was","it will"], correct:"it is" },
          { id:"u2.b14.c5", type:"mcq",
            prompt:"Pick the correct sentence:",
            choices:["Its raining outside.","It's raining outside.","Its' raining outside.","It is's raining outside."], correct:"It's raining outside." },
          { id:"u2.b14.c6", type:"mcq",
            prompt:"<b>The girls' toys</b> means…",
            choices:["one girl's toys","toys belonging to many girls","toys that are girls","one toy and one girl"], correct:"toys belonging to many girls" },
          { id:"u2.b14.c7", type:"fill",
            prompt:"Write the contraction for <b>do not</b>:",
            accept:["don't","dont"], choices:["don't","dont'","do'nt"] },
        ]
      },

      // ---- Block 15: 🎮 Fun Arena ----
      {
        id: "u2.fun", title: "Fun Arena 🎮", emoji: "🎮",
        cards: [
          { id:"u2.fun.c1", type:"intro",
            title:"🎮 Fun Arena!",
            body:"Earn extra Zeni and a streak boost by acing these mini-games!" },
          { id:"u2.fun.c2", type:"match",
            title:"Match contractions",
            pairs:[
              { a:"do not", b:"don't" },
              { a:"can not", b:"can't" },
              { a:"I am", b:"I'm" },
              { a:"will not", b:"won't" },
              { a:"it is", b:"it's" },
            ] },
          { id:"u2.fun.c3", type:"match",
            title:"Match present → past",
            pairs:[
              { a:"go", b:"went" },
              { a:"eat", b:"ate" },
              { a:"see", b:"saw" },
              { a:"have", b:"had" },
              { a:"run", b:"ran" },
            ] },
          { id:"u2.fun.c4", type:"tap",
            prompt:"Tap all the <b>even</b> numbers",
            items:[
              { label:"4", correct:true },
              { label:"7", correct:false },
              { label:"10", correct:true },
              { label:"13", correct:false },
              { label:"16", correct:true },
              { label:"21", correct:false },
              { label:"8", correct:true },
              { label:"5", correct:false },
            ] },
          { id:"u2.fun.c5", type:"speed",
            title:"Sprint: 2-digit math",
            seconds:9,
            questions:[
              { prompt:"24 + 13", choices:["35","36","37","47"], correct:"37" },
              { prompt:"50 − 22", choices:["18","28","32","38"], correct:"28" },
              { prompt:"45 + 30", choices:["65","75","85","105"], correct:"75" },
              { prompt:"82 − 17", choices:["55","65","75","99"], correct:"65" },
              { prompt:"36 + 19", choices:["45","54","55","65"], correct:"55" },
            ] },
          { id:"u2.fun.c6", type:"match",
            title:"Match shape → sides",
            pairs:[
              { a:"triangle", b:"3 sides" },
              { a:"square", b:"4 sides" },
              { a:"pentagon", b:"5 sides" },
              { a:"hexagon", b:"6 sides" },
            ] },
          { id:"u2.fun.c7", type:"tap",
            prompt:"Tap all the <b>PAST-TENSE</b> verbs",
            items:[
              { label:"played", correct:true },
              { label:"jump", correct:false },
              { label:"ate", correct:true },
              { label:"sing", correct:false },
              { label:"ran", correct:true },
              { label:"walk", correct:false },
              { label:"helped", correct:true },
              { label:"swim", correct:false },
            ] },
        ]
      },

      // ---- BOSS ----
      {
        id: "u2.boss", title: "BOSS: Nappa", emoji: "🟢",
        cards: [
          { id:"u2.boss.c1", type:"boss",
            name:"Nappa", namePa:"ਨੱਪਾ", emoji:"🟢", hp:7,
            questions:[
              { prompt:"Past of <b>play</b>?", choices:["played","plays","playd","playing"], correct:"played" },
              { prompt:"Past of <b>see</b>?", choices:["seen","saw","sawed","sees"], correct:"saw" },
              { prompt:"In <b>74</b>, the 7 means…", choices:["7 ones","7 tens","7 hundreds","7 thousand"], correct:"7 tens" },
              { prompt:"🧮 24 + 13 = ?", choices:["27","37","47","57"], correct:"37" },
              { prompt:"🧮 50 + 40 = ?", choices:["80","90","100","110"], correct:"90" },
              { prompt:"<b>I am</b> = ?", choices:["Im","I'm","I'am","Iam"], correct:"I'm" },
              { prompt:"Which sentence is correct?", choices:["the boy ran","The boy ran.","the Boy Ran.","The boy ran"], correct:"The boy ran." },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 3 — OVER 9000  (extend, ~Grade 2.5–3.0)
  // ============================================================
  {
    id: "u3", title: "Over 9000!", emoji: "💥",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 2) ----
      {
        id: "u3.recap", title: "Chai Recap: Unit 2", emoji: "☕",
        cards: [
          { id:"u3.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Quick refresh from Unit 2: <b>past tense, contractions, capitalization, 2-digit math, shapes.</b>" },
          { id:"u3.recap.c2", type:"mcq",
            prompt:"Past of <b>walk</b>?",
            choices:["walks","walking","walked","will walk"], correct:"walked" },
          { id:"u3.recap.c3", type:"mcq",
            prompt:"<b>do not</b> = ?",
            choices:["don't","dont","do'nt","do'not"], correct:"don't" },
          { id:"u3.recap.c4", type:"mcq",
            prompt:"Pick the correctly capitalized sentence:",
            choices:["my dog ran.","My dog ran.","my Dog Ran.","My Dog ran"], correct:"My dog ran." },
          { id:"u3.recap.c5", type:"mcq",
            prompt:"🧮 36 + 19 = ?",
            choices:["45","54","55","65"], correct:"55" },
          { id:"u3.recap.c6", type:"fill",
            prompt:"A shape with <b>5 sides</b> is a ___.",
            accept:["pentagon"], choices:["pentagon","hexagon","square"] },
        ]
      },

      // ---- Block 1: Future tense ----
      {
        id: "u3.b1", title: "Future tense (will + verb)", emoji: "⏩",
        cards: [
          { id:"u3.b1.c1", type:"intro",
            title:"Future = will + verb",
            body:"To say something <b>hasn't happened yet</b>, use <b>will</b> + the verb. <i>I <b>will go</b>.</i>" },
          { id:"u3.b1.c2", type:"mcq", prompt:"Future of <b>play</b>?",
            choices:["played","plays","will play","playing"], correct:"will play" },
          { id:"u3.b1.c3", type:"mcq", prompt:"Future of <b>help</b>?",
            choices:["helped","helps","will help","helping"], correct:"will help" },
          { id:"u3.b1.c4", type:"fill", prompt:"Make this future: <i>She ___ ___ home.</i> (verb: go)",
            accept:["will go"], choices:["will go","goes","went"] },
          { id:"u3.b1.c5", type:"mcq", prompt:"Pick the future-tense sentence:",
            choices:["We went home.","We will go home.","We go home.","We are going."], correct:"We will go home." },
          { id:"u3.b1.c6", type:"mcq", prompt:"Which is NOT future?",
            choices:["I will run.","She will sing.","They ate lunch.","He will help."], correct:"They ate lunch." },
        ]
      },

      // ---- Block 2: Adjectives ----
      {
        id: "u3.b2", title: "Adjectives (describe nouns)", emoji: "🎨",
        cards: [
          { id:"u3.b2.c1", type:"flash",
            front:"What is an <b>ADJECTIVE</b>?",
            back:"An adjective <b>describes a noun</b>.<br><i>a <b>red</b> car, a <b>tall</b> tree, a <b>happy</b> dog</i>." },
          { id:"u3.b2.c2", type:"mcq", prompt:"Pick the adjective: <i>The fluffy cat slept.</i>",
            choices:["The","fluffy","cat","slept"], correct:"fluffy" },
          { id:"u3.b2.c3", type:"mcq", prompt:"Pick the adjective: <i>I see a yellow flower.</i>",
            choices:["I","see","yellow","flower"], correct:"yellow" },
          { id:"u3.b2.c4", type:"mcq", prompt:"Pick the adjective: <i>A brave warrior fought.</i>",
            choices:["A","brave","warrior","fought"], correct:"brave" },
          { id:"u3.b2.c5", type:"fill",
            prompt:"Add an adjective from this list (one word): <i>big, huge, mighty</i>.",
            accept:["big","huge","mighty"],
            choices:["big","huge","mighty"] },
          { id:"u3.b2.c6", type:"mcq", prompt:"Which sentence has an adjective?",
            choices:["Birds fly.","She runs fast.","I see a small kitten.","He sleeps."], correct:"I see a small kitten." },
        ]
      },

      // ---- Block 3: 2-digit subtract ----
      {
        id: "u3.b3", title: "Subtract 2-digit numbers", emoji: "🧮",
        cards: [
          { id:"u3.b3.c1", type:"intro",
            title:"Subtracting 2-digit numbers",
            body:"Subtract the <b>ones</b>, then the <b>tens</b>. 47 − 23: ones 7−3=4, tens 4−2=2 → <b>24</b>." },
          { id:"u3.b3.c2", type:"mcq", prompt:"🧮 50 − 20 = ?", choices:["20","25","30","40"], correct:"30" },
          { id:"u3.b3.c3", type:"mcq", prompt:"🧮 47 − 23 = ?", choices:["14","24","34","44"], correct:"24" },
          { id:"u3.b3.c4", type:"fill", prompt:"🧮 68 − 35 = ?", accept:["33"], choices:["33","23","43"] },
          { id:"u3.b3.c5", type:"fill", prompt:"🧮 90 − 40 = ?", accept:["50","fifty"], choices:["50","40","60"] },
          { id:"u3.b3.c6", type:"mcq",
            prompt:"🧮 Vegeta had 75 Zeni. He spent 30. How many left?",
            choices:["35","40","45","55"], correct:"45" },
        ]
      },

      // ---- Block 3b: Add 2-digit with regrouping (carrying) ----
      {
        id: "u3.b3b", title: "Add with regrouping (carrying)", emoji: "➕",
        cards: [
          { id:"u3.b3b.c1", type:"intro",
            title:"Carrying the 1",
            body:"When the <b>ones</b> column adds to 10 or more, <b>carry</b> the tens digit to the next column.<br>27 + 35 → ones: 7+5=<b>12</b>, write 2, carry 1 → tens: 1+2+3=<b>6</b> → <b>62</b>." },
          { id:"u3.b3b.c2", type:"mcq", prompt:"🧮 28 + 14 = ?", choices:["32","42","52","34"], correct:"42" },
          { id:"u3.b3b.c3", type:"mcq", prompt:"🧮 36 + 27 = ?", choices:["53","63","73","83"], correct:"63" },
          { id:"u3.b3b.c4", type:"mcq", prompt:"🧮 49 + 26 = ?", choices:["65","75","85","95"], correct:"75" },
          { id:"u3.b3b.c5", type:"fill", prompt:"🧮 58 + 17 = ?", accept:["75"], choices:["75","65","85"] },
          { id:"u3.b3b.c6", type:"fill", prompt:"🧮 39 + 44 = ?", accept:["83"], choices:["83","73","93"] },
          { id:"u3.b3b.c7", type:"mcq",
            prompt:"🧮 Goku trained 26 hours, then 38 more. Total hours?",
            choices:["54","64","74","66"], correct:"64" },
        ]
      },

      // ---- Block 4: Skip counting ----
      {
        id: "u3.b4", title: "Skip Counting", emoji: "🪜",
        cards: [
          { id:"u3.b4.c1", type:"intro",
            title:"Skip Counting",
            body:"Counting by 2s: 2, 4, 6, 8, 10. By 5s: 5, 10, 15, 20. By 10s: 10, 20, 30…" },
          { id:"u3.b4.c2", type:"mcq", prompt:"Counting by 2s: 2, 4, 6, 8, ___?",
            choices:["9","10","11","12"], correct:"10" },
          { id:"u3.b4.c3", type:"mcq", prompt:"Counting by 5s: 5, 10, 15, ___?",
            choices:["18","20","25","30"], correct:"20" },
          { id:"u3.b4.c4", type:"fill", prompt:"Counting by 10s: 10, 20, 30, 40, ___?",
            accept:["50","fifty"], choices:["50","45","60"] },
          { id:"u3.b4.c5", type:"fill", prompt:"Counting by 5s: 20, 25, 30, ___?",
            accept:["35","thirty-five","thirty five"], choices:["35","33","40"] },
          { id:"u3.b4.c6", type:"mcq", prompt:"4 hands have how many fingers? (count by 5s)",
            choices:["15","20","25","30"], correct:"20" },
        ]
      },

      // ---- Block 5: Multiplication intro ----
      {
        id: "u3.b5", title: "Multiplication ×2 and ×5", emoji: "✖️",
        cards: [
          { id:"u3.b5.c1", type:"intro",
            title:"Multiplication = groups",
            body:"<b>3 × 4</b> means <b>3 groups of 4</b> → 4 + 4 + 4 = 12." },
          { id:"u3.b5.c2", type:"mcq", prompt:"🧮 2 × 3 = ?", choices:["5","6","7","8"], correct:"6" },
          { id:"u3.b5.c3", type:"mcq", prompt:"🧮 2 × 5 = ?", choices:["7","10","12","15"], correct:"10" },
          { id:"u3.b5.c4", type:"fill", prompt:"🧮 5 × 2 = ?", accept:["10","ten"], choices:["10","7","12"] },
          { id:"u3.b5.c5", type:"fill", prompt:"🧮 5 × 4 = ?", accept:["20","twenty"], choices:["20","15","25"] },
          { id:"u3.b5.c6", type:"mcq",
            prompt:"🧮 3 boxes have 5 cookies each. Total cookies?",
            choices:["8","12","15","20"], correct:"15" },
          { id:"u3.b5.c7", type:"mcq", prompt:"🧮 5 × 5 = ?",
            choices:["10","20","25","30"], correct:"25" },
        ]
      },

      // ---- Block 5b: ×2 and ×5 word problems & mixed ----
      {
        id: "u3.b5b", title: "×2 and ×5 word problems", emoji: "🧮",
        cards: [
          { id:"u3.b5b.c1", type:"intro",
            title:"Multiplication = repeated adding",
            body:"×2 means \"<b>double</b>\". ×5 grows fast: 5, 10, 15, 20, 25…<br>Look for clue words: <i>each, every, groups of, rows of</i> → multiply." },
          { id:"u3.b5b.c2", type:"mcq",
            prompt:"🧮 Each box has 5 apples. There are 6 boxes. How many apples?",
            choices:["11","25","30","35"], correct:"30" },
          { id:"u3.b5b.c3", type:"mcq",
            prompt:"🧮 A bicycle has 2 wheels. How many wheels are on 7 bicycles?",
            choices:["9","12","14","16"], correct:"14" },
          { id:"u3.b5b.c4", type:"mcq",
            prompt:"🧮 5 plates, 5 cookies on each. How many cookies?",
            choices:["10","15","20","25"], correct:"25" },
          { id:"u3.b5b.c5", type:"mcq", prompt:"🧮 2 × 8 = ?",
            choices:["10","14","16","18"], correct:"16" },
          { id:"u3.b5b.c6", type:"mcq", prompt:"🧮 5 × 6 = ?",
            choices:["25","30","35","40"], correct:"30" },
          { id:"u3.b5b.c7", type:"fill", prompt:"🧮 5 × 8 = ?", accept:["40","forty"], choices:["40","35","45"] },
          { id:"u3.b5b.c8", type:"fill", prompt:"🧮 2 × 9 = ?", accept:["18","eighteen"], choices:["18","16","20"] },
        ]
      },

      // ---- Block 5c: Early two-step thinking ----
      {
        id: "u3.b5c", title: "Two-step thinking (early)", emoji: "🧠",
        cards: [
          { id:"u3.b5c.c1", type:"intro",
            title:"Do one step, then another",
            body:"Some problems need <b>two moves</b>: first solve part A, then use that answer for part B.<br>Watch words like <b>then</b>, <b>after</b>, and <b>left</b>." },
          { id:"u3.b5c.c2", type:"mcq",
            prompt:"There are 4 bags with 3 marbles each. You lose 2 marbles. How many marbles are left?",
            choices:["10","12","14","16"], correct:"10" },
          { id:"u3.b5c.c3", type:"mcq",
            prompt:"A bike has 2 wheels. 6 bikes are parked. Then 3 wheels are removed for repair. How many wheels are still on bikes?",
            choices:["9","10","12","15"], correct:"9" },
          { id:"u3.b5c.c4", type:"mcq",
            prompt:"5 boxes hold 2 crayons each. Mia gives away 4 crayons. How many crayons remain?",
            choices:["6","8","10","12"], correct:"6" },
          { id:"u3.b5c.c5", type:"fill",
            prompt:"3 plates have 5 cookies each. You eat 5 cookies. Cookies left? (number)",
            accept:["10","ten"], choices:["10","12","15"] },
        ]
      },

      // ---- Block 6: Punctuation — ? and ! ----
      {
        id: "u3.b6", title: "Question marks & Excitement!", emoji: "❓",
        cards: [
          { id:"u3.b6.c1", type:"flash",
            front:"Three end-marks.",
            back:"<b>.</b> ends a normal sentence.<br><b>?</b> ends a <b>question</b>.<br><b>!</b> shows strong feeling or excitement." },
          { id:"u3.b6.c2", type:"mcq", prompt:"Which mark ends: <i>How are you</i> ?",
            choices:[".","?","!",","], correct:"?" },
          { id:"u3.b6.c3", type:"mcq", prompt:"Which mark ends: <i>Wow that's amazing</i> ?",
            choices:[".","?","!",","], correct:"!" },
          { id:"u3.b6.c4", type:"mcq", prompt:"Which mark ends: <i>I have a red bike</i> ?",
            choices:[".","?","!",","], correct:"." },
          { id:"u3.b6.c5", type:"mcq", prompt:"Which sentence is a <b>question</b>?",
            choices:["The sky is blue.","Where is my hat?","Watch out!","Run fast."], correct:"Where is my hat?" },
        ]
      },

      // ---- Block 7: Reading (longer) ----
      {
        id: "u3.b7", title: "Read & Answer (longer)", emoji: "📚",
        cards: [
          { id:"u3.b7.c1", type:"read",
            passage:"Sam loves to ride his bike. Every Saturday morning he rides to the park. The path goes past a small pond where ducks swim. Sam likes to stop and feed them bread. After the pond, the path climbs a small hill. At the top, Sam can see the whole town.",
            questions:[
              { prompt:"When does Sam ride to the park?", choices:["Every morning","Saturday morning","Sunday night","After school"], correct:"Saturday morning" },
              { prompt:"What does Sam feed the ducks?", choices:["Corn","Lettuce","Bread","Worms"], correct:"Bread" },
              { prompt:"What can Sam see from the top of the hill?", choices:["The pond","The whole town","His house","A river"], correct:"The whole town" },
              { prompt:"What is the path like after the pond?", choices:["Flat","It goes down","It climbs a hill","It ends"], correct:"It climbs a hill" },
            ] },
        ]
      },

      // ---- Block 7b: Second reading — The Science Fair ----
      {
        id: "u3.b7b", title: "Read & Answer: The Science Fair", emoji: "🔬",
        cards: [
          { id:"u3.b7b.c1", type:"intro",
            title:"More reading practice",
            body:"Read the passage carefully. The answers are inside the words. Look back if you forget!" },
          { id:"u3.b7b.c2", type:"read",
            passage:"Lily wanted to win the school science fair. She decided to build a model volcano. She mixed baking soda and vinegar inside the volcano. Red foam burst out and ran down the sides! Her teacher smiled. Lily did not win first place, but she got second. She felt proud.",
            questions:[
              { prompt:"What did Lily build for the science fair?", choices:["A robot","A volcano","A planet","A car"], correct:"A volcano" },
              { prompt:"What two things did Lily mix?", choices:["sugar and water","baking soda and vinegar","flour and milk","oil and salt"], correct:"baking soda and vinegar" },
              { prompt:"What place did Lily win?", choices:["first","second","third","none"], correct:"second" },
              { prompt:"How did Lily feel at the end?", choices:["sad","angry","proud","sleepy"], correct:"proud" },
            ] },
        ]
      },

      // ---- Block 8: Internet Safety ----
      {
        id: "u3.b8", title: "Internet Safety", emoji: "🛡️",
        cards: [
          { id:"u3.b8.c1", type:"intro",
            title:"Stay Safe Online",
            body:"The internet is fun, but you need rules. <b>Never share</b> your name, address, school, phone, or photos with strangers. If something feels weird, <b>tell a trusted adult</b>." },
          { id:"u3.b8.c2", type:"mcq",
            prompt:"A stranger online asks for your <b>full name and address</b>. You should…",
            choices:["Send it quickly","Tell a trusted adult and don't reply","Send only your address","Make it a guessing game"], correct:"Tell a trusted adult and don't reply" },
          { id:"u3.b8.c3", type:"mcq",
            prompt:"A good <b>password</b> is…",
            choices:["your name","1234","a long secret only you and your parent know","the word password"], correct:"a long secret only you and your parent know" },
          { id:"u3.b8.c4", type:"mcq",
            prompt:"A pop-up says <b>YOU WON A PRIZE! Click here!</b>. You should…",
            choices:["Click it fast","Type your address","Close it and tell an adult","Share it with friends"], correct:"Close it and tell an adult" },
          { id:"u3.b8.c5", type:"mcq",
            prompt:"Someone online is being <b>mean</b> to you. What's the BEST first step?",
            choices:["Be mean back","Tell a trusted adult","Keep it secret","Send your photo"], correct:"Tell a trusted adult" },
          { id:"u3.b8.c6", type:"mcq",
            prompt:"Which is <b>safe</b> to share publicly online?",
            choices:["Your home address","Your school's name","A drawing you made (no name on it)","Your phone number"], correct:"A drawing you made (no name on it)" },
          { id:"u3.b8.c7", type:"mcq",
            prompt:"Before downloading a game, you should…",
            choices:["Just tap install","Ask a parent first","Type your password into any box","Send it to friends"], correct:"Ask a parent first" },
        ]
      },

      // ---- Block 9: Synonyms & Antonyms ----
      {
        id: "u3.b9", title: "Synonyms & Antonyms", emoji: "🔄",
        cards: [
          { id:"u3.b9.c1", type:"flash",
            front:"<b>Synonym</b> vs <b>Antonym</b>",
            back:"<b>Synonym</b> = same meaning (big / large).<br><b>Antonym</b> = opposite meaning (hot / cold)." },
          { id:"u3.b9.c2", type:"mcq", prompt:"A synonym for <b>happy</b> is…",
            choices:["sad","angry","glad","tired"], correct:"glad" },
          { id:"u3.b9.c3", type:"mcq", prompt:"A synonym for <b>big</b> is…",
            choices:["tiny","large","thin","loud"], correct:"large" },
          { id:"u3.b9.c4", type:"mcq", prompt:"An antonym for <b>hot</b> is…",
            choices:["warm","sunny","cold","fast"], correct:"cold" },
          { id:"u3.b9.c5", type:"mcq", prompt:"An antonym for <b>up</b> is…",
            choices:["high","down","left","over"], correct:"down" },
          { id:"u3.b9.c6", type:"fill",
            prompt:"Type one antonym for <b>day</b>.",
            accept:["night","nighttime"], choices:["night","morning","afternoon"] },
        ]
      },

      // ---- Block 10: Measurement (length & weight) ----
      {
        id: "u3.b10", title: "Measurement: length & weight", emoji: "📏",
        cards: [
          { id:"u3.b10.c1", type:"intro",
            title:"Measuring",
            body:"We measure <b>length</b> in <b>inches/feet</b> or <b>centimeters/meters</b>. We measure <b>weight</b> in <b>pounds</b> or <b>kilograms</b>." },
          { id:"u3.b10.c2", type:"mcq",
            prompt:"Which would you use to measure <b>your height</b>?",
            choices:["a clock","a measuring tape","a thermometer","a calendar"], correct:"a measuring tape" },
          { id:"u3.b10.c3", type:"mcq",
            prompt:"Which is <b>longer</b>?",
            choices:["1 inch","1 foot","1 centimeter","1 millimeter"], correct:"1 foot" },
          { id:"u3.b10.c4", type:"mcq",
            prompt:"How many centimeters are in 1 meter?",
            choices:["10","50","100","1000"], correct:"100" },
          { id:"u3.b10.c5", type:"mcq",
            prompt:"Which is <b>heavier</b>?",
            choices:["a feather","a paperclip","a watermelon","a leaf"], correct:"a watermelon" },
          { id:"u3.b10.c6", type:"fill",
            prompt:"How many inches are in 1 foot? (number)",
            accept:["12","twelve"], choices:["12","10","16"] },
        ]
      },

      // ---- Block 11: Maps, Continents & Directions ----
      {
        id: "u3.b11", title: "Maps & Our World", emoji: "🗺️",
        cards: [
          { id:"u3.b11.c1", type:"intro",
            title:"Maps",
            body:"A <b>map</b> shows places. The 4 main directions are <b>North (up), South (down), East (right), West (left)</b>. Earth has <b>7 continents</b> and <b>5 oceans</b>." },
          { id:"u3.b11.c2", type:"mcq",
            prompt:"On a map, <b>North</b> usually points…",
            choices:["down","up","left","right"], correct:"up" },
          { id:"u3.b11.c3", type:"mcq",
            prompt:"How many continents are there?",
            choices:["4","5","7","10"], correct:"7" },
          { id:"u3.b11.c4", type:"mcq",
            prompt:"Which is a continent?",
            choices:["India","Asia","Tokyo","Pacific"], correct:"Asia" },
          { id:"u3.b11.c5", type:"mcq",
            prompt:"The <b>opposite</b> of East is…",
            choices:["North","South","West","Up"], correct:"West" },
          { id:"u3.b11.c6", type:"mcq",
            prompt:"Which is the <b>largest</b> ocean?",
            choices:["Atlantic","Indian","Pacific","Arctic"], correct:"Pacific" },
        ]
      },

      // ---- Block 12: Feelings & Manners (SEL) ----
      {
        id: "u3.b12", title: "Feelings & Manners", emoji: "💛",
        cards: [
          { id:"u3.b12.c1", type:"flash",
            front:"Naming your feelings",
            back:"Words for feelings: <b>happy, sad, angry, scared, excited, nervous, proud, calm</b>. Naming a feeling helps you handle it." },
          { id:"u3.b12.c2", type:"mcq",
            prompt:"You worked hard and finished a tough puzzle. You feel…",
            choices:["scared","proud","angry","sleepy"], correct:"proud" },
          { id:"u3.b12.c3", type:"mcq",
            prompt:"A friend drops their lunch. You should…",
            choices:["laugh at them","ignore them","help them clean up","take their food"], correct:"help them clean up" },
          { id:"u3.b12.c4", type:"mcq",
            prompt:"Someone gives you a gift. The polite thing to say is…",
            choices:["“Finally!”","“Thank you.”","nothing","“Is that all?”"], correct:"“Thank you.”" },
          { id:"u3.b12.c5", type:"mcq",
            prompt:"You feel <b>very angry</b>. The BEST first step is…",
            choices:["Hit something","Take deep breaths and calm down","Yell at a friend","Break a toy"], correct:"Take deep breaths and calm down" },
          { id:"u3.b12.c6", type:"mcq",
            prompt:"You bumped into someone by accident. You say…",
            choices:["“Move!”","nothing","“Excuse me, sorry.”","“Your fault.”"], correct:"“Excuse me, sorry.”" },
        ]
      },

      // ---- Block 13: Vocabulary Builder (advanced) ----
      {
        id: "u3.b13", title: "Word Power: Big Words", emoji: "🚀",
        cards: [
          { id:"u3.b13.c1", type:"intro",
            title:"Big words, simple meanings",
            body:"Long words look scary, but most just mean simple things. Learn the meaning and you've leveled up. Here are 6 power words." },
          { id:"u3.b13.c2", type:"flash",
            front:"<b>ancient</b> (adjective)",
            back:"Very, very old — from a long, long time ago.<br><i>Ancient people built the pyramids.</i>" },
          { id:"u3.b13.c3", type:"mcq",
            prompt:"<b>Fragile</b> means…",
            choices:["very strong","easy to break","very heavy","very loud"], correct:"easy to break" },
          { id:"u3.b13.c4", type:"mcq",
            prompt:"<b>Vanish</b> means…",
            choices:["to appear","to disappear","to grow","to shout"], correct:"to disappear" },
          { id:"u3.b13.c5", type:"mcq",
            prompt:"<b>Generous</b> means…",
            choices:["happy to share","never sharing","very fast","very small"], correct:"happy to share" },
          { id:"u3.b13.c6", type:"mcq",
            prompt:"<b>Furious</b> means…",
            choices:["a little sad","very, very angry","a little tired","very calm"], correct:"very, very angry" },
          { id:"u3.b13.c7", type:"mcq",
            prompt:"<b>Discover</b> means…",
            choices:["to lose something","to find something for the first time","to break something","to forget something"], correct:"to find something for the first time" },
          { id:"u3.b13.c8", type:"mcq",
            prompt:"<b>Predict</b> means…",
            choices:["to remember the past","to guess what will happen","to draw a picture","to repair a broken thing"], correct:"to guess what will happen" },
          { id:"u3.b13.c9", type:"fill",
            prompt:"A word that means <b>very, very old</b> (7 letters):",
            accept:["ancient"], choices:["ancient","modern","recent"] },
        ]
      },

      // ---- Block 14: 📊 Data: tally & bar graphs ----
      {
        id: "u3.b14", title: "Data: tally & bar graphs", emoji: "📊",
        cards: [
          { id:"u3.b14.c1", type:"intro",
            title:"Bar graphs & tally marks",
            body:"A <b>bar graph</b> uses bars to compare amounts. The longer the bar, the more there is.<br>A <b>tally</b> uses single marks. The first 4 are straight lines. The <b>5th line goes ACROSS</b> the first 4 like a fence, so a <b>full group means 5</b>.<br>Example: <b>(group of 5) (group of 5) ||</b> = 5 + 5 + 2 = <b>12</b>.<br>Always read carefully — count or compare!" },
          { id:"u3.b14.c2", type:"mcq",
            prompt:"🍎🍎🍎🍎 Apples<br>🍌🍌 Bananas<br>🍇🍇🍇 Grapes<br>How many <b>apples</b>?",
            choices:["2","3","4","5"], correct:"4" },
          { id:"u3.b14.c3", type:"mcq",
            prompt:"🐶🐶🐶🐶🐶 Dogs<br>🐱🐱🐱 Cats<br>🐰🐰 Rabbits<br>Which animal has the <b>most</b>?",
            choices:["Dogs","Cats","Rabbits","Same"], correct:"Dogs" },
          { id:"u3.b14.c4", type:"mcq",
            prompt:"⭐⭐⭐⭐ Mon<br>⭐⭐ Tue<br>⭐⭐⭐⭐⭐ Wed<br>How many stars in <b>total</b>?",
            choices:["9","10","11","12"], correct:"11" },
          { id:"u3.b14.c5", type:"mcq",
            prompt:"Tally chart of votes (each full group of 5 looks like <b>||||</b> with a slash):<br>Pizza: <b>(group of 5) |||</b><br>Tacos: <b>||||</b><br>Sushi: <b>||</b><br>How many <b>more</b> votes did Pizza get than Tacos?",
            choices:["2","3","4","6"], correct:"4" },
          { id:"u3.b14.c6", type:"mcq",
            prompt:"📕📕📕 Mon<br>📕📕📕📕📕 Tue<br>📕📕📕📕 Wed<br>Which day had the <b>fewest</b> books read?",
            choices:["Mon","Tue","Wed","All same"], correct:"Mon" },
          { id:"u3.b14.c7", type:"fill",
            prompt:"A tally of <b>(group of 5) (group of 5) ||</b> means how many in all? (number)",
            accept:["12","twelve"], choices:["12","10","14"] },
        ]
      },

      // ---- Block 15: 🎮 Fun Arena ----
      {
        id: "u3.fun", title: "Fun Arena 🎮", emoji: "🎮",
        cards: [
          { id:"u3.fun.c1", type:"intro",
            title:"🎮 Fun Arena!",
            body:"Three mini-games to warm up before Vegeta. PERFECT score = bonus zeni!" },
          { id:"u3.fun.c2", type:"match",
            title:"Match synonyms",
            pairs:[
              { a:"big", b:"large" },
              { a:"happy", b:"glad" },
              { a:"fast", b:"quick" },
              { a:"smart", b:"clever" },
              { a:"start", b:"begin" },
            ] },
          { id:"u3.fun.c3", type:"match",
            title:"Match antonyms (opposites)",
            pairs:[
              { a:"hot", b:"cold" },
              { a:"day", b:"night" },
              { a:"happy", b:"sad" },
              { a:"big", b:"small" },
              { a:"fast", b:"slow" },
            ] },
          { id:"u3.fun.c4", type:"tap",
            prompt:"Tap all the <b>ADJECTIVES</b> (describing words)",
            items:[
              { label:"shiny", correct:true },
              { label:"run", correct:false },
              { label:"big", correct:true },
              { label:"jump", correct:false },
              { label:"loud", correct:true },
              { label:"book", correct:false },
              { label:"happy", correct:true },
              { label:"car", correct:false },
            ] },
          { id:"u3.fun.c5", type:"speed",
            title:"Sprint: ×2 and ×5",
            seconds:7,
            questions:[
              { prompt:"2 × 6", choices:["10","11","12","14"], correct:"12" },
              { prompt:"5 × 4", choices:["15","20","25","30"], correct:"20" },
              { prompt:"2 × 9", choices:["16","17","18","20"], correct:"18" },
              { prompt:"5 × 7", choices:["25","30","35","40"], correct:"35" },
              { prompt:"2 × 8", choices:["14","15","16","18"], correct:"16" },
            ] },
          { id:"u3.fun.c6", type:"tap",
            prompt:"Tap the SAFE choices online",
            items:[
              { label:"share my home address", correct:false },
              { label:"tell a parent if a stranger messages", correct:true },
              { label:"share my password with a friend", correct:false },
              { label:"close pop-up ads", correct:true },
              { label:"send my real photo to a stranger", correct:false },
              { label:"use a nickname in games", correct:true },
            ] },
          { id:"u3.fun.c7", type:"speed",
            title:"Sprint: ×10 facts",
            seconds:6,
            questions:[
              { prompt:"10 × 3", choices:["13","30","33","100"], correct:"30" },
              { prompt:"10 × 7", choices:["17","60","70","77"], correct:"70" },
              { prompt:"10 × 5", choices:["15","50","55","500"], correct:"50" },
              { prompt:"10 × 9", choices:["19","90","99","100"], correct:"90" },
              { prompt:"10 × 8", choices:["18","80","88","108"], correct:"80" },
            ] },
        ]
      },

      // ---- BOSS ----
      {
        id: "u3.boss", title: "BOSS: Vegeta", emoji: "🟣",
        cards: [
          { id:"u3.boss.c1", type:"boss",
            name:"Vegeta", namePa:"ਵੈਜੀਟਾ", emoji:"🟣", hp:8,
            questions:[
              { prompt:"Future of <b>win</b>?", choices:["won","wins","will win","winning"], correct:"will win" },
              { prompt:"Pick the adjective: <i>The shiny scouter beeped.</i>", choices:["The","shiny","scouter","beeped"], correct:"shiny" },
              { prompt:"🧮 5 × 4 = ?", choices:["9","16","20","25"], correct:"20" },
              { prompt:"🧮 78 − 35 = ?", choices:["33","43","45","53"], correct:"43" },
              { prompt:"Counting by 5s: 25, 30, ___?", choices:["33","34","35","40"], correct:"35" },
              { prompt:"Which mark ends: <i>Are you ready</i> ?", choices:[".","?","!",","], correct:"?" },
              { prompt:"🧮 2 × 7 = ?", choices:["9","12","14","16"], correct:"14" },
              { prompt:"Which is the future-tense sentence?", choices:["He ran fast.","He runs fast.","He will run fast.","He is running."], correct:"He will run fast." },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 4 — SAIYAN AWAKENING  (~Grade 2.5)
  // ============================================================
  {
    id: "u4", title: "Saiyan Awakening", emoji: "🟡",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 3) ----
      {
        id: "u4.recap", title: "Chai Recap: Unit 3", emoji: "☕",
        cards: [
          { id:"u4.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Refresh from Unit 3: <b>future tense, adjectives, synonyms/antonyms, ×2/×5/×10, punctuation.</b>" },
          { id:"u4.recap.c2", type:"mcq",
            prompt:"Future of <b>help</b>?",
            choices:["helped","helps","will help","helping"], correct:"will help" },
          { id:"u4.recap.c3", type:"mcq",
            prompt:"Pick the adjective: <i>The tall tree swayed.</i>",
            choices:["The","tall","tree","swayed"], correct:"tall" },
          { id:"u4.recap.c4", type:"mcq",
            prompt:"Synonym of <b>big</b>?",
            choices:["small","large","happy","slow"], correct:"large" },
          { id:"u4.recap.c5", type:"mcq",
            prompt:"🧮 5 × 7 = ?",
            choices:["30","35","40","42"], correct:"35" },
          { id:"u4.recap.c6", type:"mcq",
            prompt:"Which mark ends: <i>What a great catch</i> ?",
            choices:[".","?","!",","], correct:"!" },
        ]
      },

      // ---- Block 1: Adverbs ----
      {
        id: "u4.b1", title: "Adverbs: how, when, where", emoji: "💨",
        cards: [
          { id:"u4.b1.c1", type:"intro",
            title:"Adverbs power up your verbs!",
            body:"An <b>adverb</b> tells <b>how</b>, <b>when</b>, or <b>where</b> something happens. Many end in <b>-ly</b>: <b>quickly, loudly, softly</b>." },
          { id:"u4.b1.c2", type:"flash",
            front:"What does an adverb do?",
            back:"It describes a <b>verb</b>.<br><i>She runs <b>quickly</b>.</i> — <b>quickly</b> tells how she runs." },
          { id:"u4.b1.c3", type:"mcq",
            prompt:"Pick the adverb: <i>He spoke <b>softly</b>.</i>",
            choices:["He","spoke","softly","."], correct:"softly" },
          { id:"u4.b1.c4", type:"mcq",
            prompt:"Pick the adverb: <i>The dog ran <b>fast</b>.</i>",
            choices:["The","dog","ran","fast"], correct:"fast" },
          { id:"u4.b1.c5", type:"mcq",
            prompt:"Which is an adverb?",
            choices:["happy","happily","happiness","happen"], correct:"happily" },
          { id:"u4.b1.c6", type:"mcq",
            prompt:"Which adverb tells <b>when</b>?",
            choices:["here","yesterday","loudly","blue"], correct:"yesterday" },
          { id:"u4.b1.c7", type:"mcq",
            prompt:"Which adverb tells <b>where</b>?",
            choices:["soon","outside","slowly","big"], correct:"outside" },
          { id:"u4.b1.c8", type:"fill",
            prompt:"Add <b>-ly</b> to make an adverb: <b>quick</b> → ?",
            accept:["quickly"], choices:["quickly","quick","quickely"] },
        ]
      },

      // ---- Block 2: Prepositions ----
      {
        id: "u4.b2", title: "Prepositions: position words", emoji: "📍",
        cards: [
          { id:"u4.b2.c1", type:"flash",
            front:"What is a <b>preposition</b>?",
            back:"A small word that shows <b>where</b> or <b>when</b>.<br>Examples: <b>in, on, under, over, between, before, after</b>." },
          { id:"u4.b2.c2", type:"mcq",
            prompt:"Pick the preposition: <i>The cat is <b>under</b> the bed.</i>",
            choices:["The","cat","under","bed"], correct:"under" },
          { id:"u4.b2.c3", type:"mcq",
            prompt:"Pick the preposition: <i>He sat <b>on</b> the chair.</i>",
            choices:["He","sat","on","chair"], correct:"on" },
          { id:"u4.b2.c4", type:"mcq",
            prompt:"Best word: <i>The book is ___ the table.</i>",
            choices:["run","on","quickly","happy"], correct:"on" },
          { id:"u4.b2.c5", type:"mcq",
            prompt:"Best word: <i>The library is ___ the gym and the office.</i>",
            choices:["between","quickly","blue","jump"], correct:"between" },
          { id:"u4.b2.c6", type:"mcq",
            prompt:"Best word: <i>Brush your teeth ___ bed.</i>",
            choices:["under","before","loudly","red"], correct:"before" },
        ]
      },

      // ---- Block 3: Place value to 1000 ----
      {
        id: "u4.b3", title: "Place value to 1000", emoji: "🔢",
        cards: [
          { id:"u4.b3.c1", type:"intro",
            title:"Hundreds, tens, ones",
            body:"In <b>352</b>: the <b>3</b> means 3 hundreds (300), the <b>5</b> means 5 tens (50), the <b>2</b> means 2 ones." },
          { id:"u4.b3.c2", type:"mcq",
            prompt:"In <b>426</b>, what does the <b>4</b> mean?",
            choices:["4 ones","4 tens","4 hundreds","4 thousands"], correct:"4 hundreds" },
          { id:"u4.b3.c3", type:"mcq",
            prompt:"In <b>508</b>, what does the <b>0</b> mean?",
            choices:["0 ones","0 tens","0 hundreds","nothing at all"], correct:"0 tens" },
          { id:"u4.b3.c4", type:"mcq",
            prompt:"Which number is <b>three hundred forty</b>?",
            choices:["304","340","430","403"], correct:"340" },
          { id:"u4.b3.c5", type:"mcq",
            prompt:"Which is <b>greater</b>: 472 or 427?",
            choices:["472","427","equal","cannot tell"], correct:"472" },
          { id:"u4.b3.c6", type:"fill",
            prompt:"Write the number: <b>six hundred nine</b>",
            accept:["609"], choices:["609","690","6009"] },
          { id:"u4.b3.c7", type:"mcq",
            prompt:"What comes after 999?",
            choices:["100","1,000","9,990","10,000"], correct:"1,000" },
        ]
      },

      // ---- Block 4: Multiplication ×3 ----
      {
        id: "u4.b4", title: "Multiplication ×3", emoji: "✖️",
        cards: [
          { id:"u4.b4.c1", type:"intro",
            title:"×3 means 3 groups",
            body:"<b>4 × 3</b> means <b>4 groups of 3</b> (or 3 groups of 4). Both = <b>12</b>." },
          { id:"u4.b4.c2", type:"flash", front:"3 × 1 = ?", back:"<b>3</b>" },
          { id:"u4.b4.c3", type:"flash", front:"3 × 2 = ?", back:"<b>6</b>" },
          { id:"u4.b4.c4", type:"flash", front:"3 × 3 = ?", back:"<b>9</b>" },
          { id:"u4.b4.c5", type:"mcq", prompt:"3 × 4 = ?", choices:["7","9","12","15"], correct:"12" },
          { id:"u4.b4.c6", type:"mcq", prompt:"3 × 5 = ?", choices:["8","12","15","18"], correct:"15" },
          { id:"u4.b4.c7", type:"mcq", prompt:"3 × 6 = ?", choices:["12","15","18","21"], correct:"18" },
          { id:"u4.b4.c8", type:"mcq", prompt:"3 × 7 = ?", choices:["18","21","24","27"], correct:"21" },
          { id:"u4.b4.c9", type:"mcq", prompt:"3 × 8 = ?", choices:["21","24","27","30"], correct:"24" },
          { id:"u4.b4.c10", type:"fill", prompt:"3 × 9 = ?", accept:["27"], choices:["27","24","30"] },
          { id:"u4.b4.c11", type:"fill", prompt:"3 × 10 = ?", accept:["30"], choices:["30","27","33"] },
        ]
      },

      // ---- Block 5: Multiplication ×4 ----
      {
        id: "u4.b5", title: "Multiplication ×4", emoji: "✖️",
        cards: [
          { id:"u4.b5.c1", type:"flash", front:"4 × 1 = ?", back:"<b>4</b>" },
          { id:"u4.b5.c2", type:"flash", front:"4 × 2 = ?", back:"<b>8</b>" },
          { id:"u4.b5.c3", type:"mcq", prompt:"4 × 3 = ?", choices:["7","12","14","16"], correct:"12" },
          { id:"u4.b5.c4", type:"mcq", prompt:"4 × 4 = ?", choices:["8","12","16","20"], correct:"16" },
          { id:"u4.b5.c5", type:"mcq", prompt:"4 × 5 = ?", choices:["16","20","24","25"], correct:"20" },
          { id:"u4.b5.c6", type:"mcq", prompt:"4 × 6 = ?", choices:["20","22","24","28"], correct:"24" },
          { id:"u4.b5.c7", type:"mcq", prompt:"4 × 7 = ?", choices:["24","27","28","32"], correct:"28" },
          { id:"u4.b5.c8", type:"mcq", prompt:"4 × 8 = ?", choices:["28","30","32","36"], correct:"32" },
          { id:"u4.b5.c9", type:"fill", prompt:"4 × 9 = ?", accept:["36"], choices:["36","32","40"] },
          { id:"u4.b5.c10", type:"fill", prompt:"4 × 10 = ?", accept:["40"], choices:["40","36","44"] },
        ]
      },

      // ---- Block 6: Multiplication ×10 ----
      {
        id: "u4.b6", title: "Multiplication ×10 (the easy trick)", emoji: "🔟",
        cards: [
          { id:"u4.b6.c1", type:"intro",
            title:"The ×10 trick",
            body:"To multiply any number by <b>10</b>, just put a <b>0</b> at the end!<br><b>7 × 10 = 70</b>. <b>23 × 10 = 230</b>." },
          { id:"u4.b6.c2", type:"mcq", prompt:"6 × 10 = ?", choices:["16","60","66","600"], correct:"60" },
          { id:"u4.b6.c3", type:"mcq", prompt:"9 × 10 = ?", choices:["19","90","99","900"], correct:"90" },
          { id:"u4.b6.c4", type:"mcq", prompt:"12 × 10 = ?", choices:["22","112","120","1200"], correct:"120" },
          { id:"u4.b6.c5", type:"fill", prompt:"15 × 10 = ?", accept:["150"], choices:["150","105","1500"] },
          { id:"u4.b6.c6", type:"fill", prompt:"8 × 10 = ?", accept:["80"], choices:["80","18","800"] },
        ]
      },

      // ---- Block 6b: Compare & order 3-digit numbers ----
      {
        id: "u4.b6b", title: "Compare & order 3-digit numbers", emoji: "⚖️",
        cards: [
          { id:"u4.b6b.c1", type:"intro",
            title:"Which number is bigger?",
            body:"To compare 3-digit numbers, look at the <b>hundreds</b> first. If they're equal, look at <b>tens</b>. If those are equal too, look at <b>ones</b>.<br>Symbols: <b>&gt;</b> means greater, <b>&lt;</b> means less, <b>=</b> means equal." },
          { id:"u4.b6b.c2", type:"mcq",
            prompt:"Which is GREATER?",
            choices:["384","483","equal","can't tell"], correct:"483" },
          { id:"u4.b6b.c3", type:"mcq",
            prompt:"Which is LESS?",
            choices:["617","671","716","761"], correct:"617" },
          { id:"u4.b6b.c4", type:"mcq",
            prompt:"Pick the right symbol: <b>295 ___ 259</b>",
            choices:["&gt;","&lt;","=","+"], correct:"&gt;" },
          { id:"u4.b6b.c5", type:"mcq",
            prompt:"Order from SMALLEST to biggest:",
            choices:["432, 234, 342","234, 342, 432","432, 342, 234","342, 234, 432"], correct:"234, 342, 432" },
          { id:"u4.b6b.c6", type:"mcq",
            prompt:"Which is the BIGGEST?",
            choices:["509","590","519","591"], correct:"591" },
          { id:"u4.b6b.c7", type:"fill",
            prompt:"Type the number that is 1 MORE than 499.", accept:["500"], choices:["500","499","510"] },
        ]
      },

      // ---- Block 7: Division intro ÷2, ÷5 ----
      {
        id: "u4.b7", title: "Division: sharing equally", emoji: "➗",
        cards: [
          { id:"u4.b7.c1", type:"intro",
            title:"Division = sharing",
            body:"<b>10 ÷ 2</b> means: share 10 things into <b>2 equal groups</b>. Each group gets <b>5</b>." },
          { id:"u4.b7.c2", type:"flash", front:"6 ÷ 2 = ?", back:"<b>3</b> (two groups of 3)" },
          { id:"u4.b7.c3", type:"mcq", prompt:"8 ÷ 2 = ?", choices:["2","3","4","6"], correct:"4" },
          { id:"u4.b7.c4", type:"mcq", prompt:"10 ÷ 2 = ?", choices:["3","4","5","8"], correct:"5" },
          { id:"u4.b7.c5", type:"mcq", prompt:"14 ÷ 2 = ?", choices:["6","7","8","12"], correct:"7" },
          { id:"u4.b7.c6", type:"mcq", prompt:"10 ÷ 5 = ?", choices:["1","2","3","5"], correct:"2" },
          { id:"u4.b7.c7", type:"mcq", prompt:"15 ÷ 5 = ?", choices:["2","3","4","5"], correct:"3" },
          { id:"u4.b7.c8", type:"mcq", prompt:"20 ÷ 5 = ?", choices:["3","4","5","10"], correct:"4" },
          { id:"u4.b7.c9", type:"fill", prompt:"25 ÷ 5 = ?", accept:["5"], choices:["5","4","6"] },
          { id:"u4.b7.c10", type:"mcq",
            prompt:"12 cookies shared by 2 friends. Each gets…?",
            choices:["4","5","6","10"], correct:"6" },
        ]
      },

      // ---- Block 8: Word problems ----
      {
        id: "u4.b8", title: "Math word problems", emoji: "📝",
        cards: [
          { id:"u4.b8.c1", type:"intro",
            title:"Read carefully!",
            body:"Look for clue words: <b>in all / total</b> = add. <b>left / fewer</b> = subtract. <b>each / groups</b> = multiply or divide." },
          { id:"u4.b8.c2", type:"mcq",
            prompt:"Goku ate 7 senzu beans. Vegeta ate 5. <b>How many in total?</b>",
            choices:["2","11","12","13"], correct:"12" },
          { id:"u4.b8.c3", type:"mcq",
            prompt:"There were 20 apples. 8 were eaten. <b>How many left?</b>",
            choices:["10","12","14","28"], correct:"12" },
          { id:"u4.b8.c4", type:"mcq",
            prompt:"4 boxes have 5 toys each. <b>How many toys in all?</b>",
            choices:["9","15","20","25"], correct:"20" },
          { id:"u4.b8.c5", type:"mcq",
            prompt:"18 cookies shared by 3 kids. <b>Each kid gets…?</b>",
            choices:["3","5","6","9"], correct:"6" },
          { id:"u4.b8.c6", type:"mcq",
            prompt:"A pencil costs $2. Mia buys 4. <b>Total cost?</b>",
            choices:["$4","$6","$8","$10"], correct:"$8" },
          { id:"u4.b8.c7", type:"mcq",
            prompt:"The bus has 32 seats. 19 are full. <b>How many empty?</b>",
            choices:["11","12","13","23"], correct:"13" },
        ]
      },

      // ---- Block 8b: Error detectives ----
      {
        id: "u4.b8b", title: "Error detectives: spot the mistake", emoji: "🕵️",
        cards: [
          { id:"u4.b8b.c1", type:"intro",
            title:"Smart learners check mistakes",
            body:"Good problem-solvers ask: <b>What went wrong?</b> Spot the error, then fix it." },
          { id:"u4.b8b.c2", type:"mcq",
            prompt:"A student wrote: 23 + 18 = 311. What mistake happened?",
            choices:["Forgot to carry the 1 ten","Subtracted instead of adding","Switched 23 and 18","311 is correct"], correct:"Forgot to carry the 1 ten" },
          { id:"u4.b8b.c3", type:"mcq",
            prompt:"True or false: In 405, the digit 4 means 4 tens.",
            choices:["True","False"], correct:"False" },
          { id:"u4.b8b.c4", type:"mcq",
            prompt:"Which sentence has a verb mistake?",
            choices:["He goes to school every day.","They play outside.","She eat lunch at noon.","I read at night."], correct:"She eat lunch at noon." },
          { id:"u4.b8b.c5", type:"mcq",
            prompt:"Is this correct: 6/8 = 3/4 ?",
            choices:["Yes, both are equal fractions","No, 6/8 is bigger","No, 6/8 is smaller","No, they are unrelated"], correct:"Yes, both are equal fractions" },
          { id:"u4.b8b.c6", type:"fill",
            prompt:"Fix the sentence: <i>He go to school.</i> (one word)",
            accept:["goes"], choices:["goes","go","going"] },
        ]
      },

      // ---- Block 9: Commas in lists ----
      {
        id: "u4.b9", title: "Commas in lists", emoji: "✏️",
        cards: [
          { id:"u4.b9.c1", type:"intro",
            title:"Commas separate items",
            body:"Use a <b>comma</b> between items in a list of three or more.<br><i>I have apples<b>,</b> bananas<b>,</b> and grapes.</i>" },
          { id:"u4.b9.c2", type:"mcq",
            prompt:"Which sentence is correctly punctuated?",
            choices:["I like cats dogs and birds.","I like cats, dogs, and birds.","I like, cats dogs and birds.","I, like cats dogs and birds."],
            correct:"I like cats, dogs, and birds." },
          { id:"u4.b9.c3", type:"mcq",
            prompt:"Pick the right one:",
            choices:["We bought milk eggs and bread.","We bought milk, eggs, and bread.","We bought, milk eggs and bread.","We bought milk, eggs and, bread."],
            correct:"We bought milk, eggs, and bread." },
          { id:"u4.b9.c4", type:"mcq",
            prompt:"Pick the right one:",
            choices:["She is kind, smart, and funny.","She is kind smart and funny.","She, is kind smart and funny.","She is kind smart, and, funny."],
            correct:"She is kind, smart, and funny." },
        ]
      },

      // ---- Block 10: Quotation marks ----
      {
        id: "u4.b10", title: "Quotation marks: who said it?", emoji: "💬",
        cards: [
          { id:"u4.b10.c1", type:"intro",
            title:"Quotes show speech",
            body:"Use <b>\" \"</b> around the exact words a person says.<br><i>Mom said, <b>\"Time for dinner.\"</b></i>" },
          { id:"u4.b10.c2", type:"mcq",
            prompt:"Which sentence uses quotes correctly?",
            choices:["Sam said hello.","Sam said, \"hello.\"","Sam said \"hello.","Sam, said hello."],
            correct:"Sam said, \"hello.\"" },
          { id:"u4.b10.c3", type:"mcq",
            prompt:"Pick the right one:",
            choices:["\"I am hungry,\" said Goku.","I am hungry said Goku.","\"I am hungry said Goku.","I am hungry, \"said Goku.\""],
            correct:"\"I am hungry,\" said Goku." },
          { id:"u4.b10.c4", type:"mcq",
            prompt:"What do quotation marks tell us?",
            choices:["A list","A question","Someone's exact words","The end of a story"],
            correct:"Someone's exact words" },
        ]
      },

      // ---- Block 11: Reading comprehension ----
      {
        id: "u4.b11", title: "Reading: medium passage", emoji: "📖",
        cards: [
          { id:"u4.b11.c1", type:"read",
            passage:"Maya planted a small bean in a paper cup. She put the cup near the window so it could get sunlight. Every morning, she gave it a little water. After one week, a tiny green stem poked up from the soil. Maya smiled — her plant was growing!",
            questions:[
              { prompt:"What did Maya plant?", choices:["a flower","a bean","a tree","an apple"], correct:"a bean" },
              { prompt:"Why did she put it near the window?", choices:["to hide it","for sunlight","to keep warm","to show friends"], correct:"for sunlight" },
              { prompt:"How often did she water it?", choices:["every morning","once a week","never","once a month"], correct:"every morning" },
              { prompt:"How did Maya feel at the end?", choices:["sad","angry","happy","scared"], correct:"happy" },
            ]
          },
        ]
      },

      // ---- Block 12: Spelling — silent e ----
      {
        id: "u4.b12", title: "Silent e (magic e)", emoji: "🔤",
        cards: [
          { id:"u4.b12.c1", type:"intro",
            title:"The magic e!",
            body:"A silent <b>e</b> at the end makes the vowel say its <b>name</b>.<br><b>cap → cape</b>, <b>kit → kite</b>, <b>not → note</b>." },
          { id:"u4.b12.c2", type:"mcq",
            prompt:"Add silent e: <b>tap</b> → ?",
            choices:["tape","tapp","tapy","topp"], correct:"tape" },
          { id:"u4.b12.c3", type:"mcq",
            prompt:"Add silent e: <b>cub</b> → ?",
            choices:["cubb","cube","cuby","cubo"], correct:"cube" },
          { id:"u4.b12.c4", type:"mcq",
            prompt:"Add silent e: <b>hop</b> → ?",
            choices:["hopp","hopy","hope","hopo"], correct:"hope" },
          { id:"u4.b12.c5", type:"fill",
            prompt:"Add silent e: <b>rid</b> → ?",
            accept:["ride"], choices:["ride","rid","ridd"] },
          { id:"u4.b12.c6", type:"fill",
            prompt:"Add silent e: <b>man</b> → ?",
            accept:["mane"], choices:["mane","mans","mann"] },
        ]
      },

      // ---- Block 13: Prefixes ----
      {
        id: "u4.b13", title: "Prefixes: un-, re-, pre-", emoji: "🧩",
        cards: [
          { id:"u4.b13.c1", type:"intro",
            title:"Prefixes change meaning",
            body:"A <b>prefix</b> is added to the start of a word.<br><b>un-</b> = not  •  <b>re-</b> = again  •  <b>pre-</b> = before" },
          { id:"u4.b13.c2", type:"mcq",
            prompt:"<b>unhappy</b> means…",
            choices:["very happy","not happy","happy again","happy before"], correct:"not happy" },
          { id:"u4.b13.c3", type:"mcq",
            prompt:"<b>redo</b> means…",
            choices:["do not","do again","do before","do alone"], correct:"do again" },
          { id:"u4.b13.c4", type:"mcq",
            prompt:"<b>preheat</b> means…",
            choices:["heat again","not heat","heat before","heat very much"], correct:"heat before" },
          { id:"u4.b13.c5", type:"mcq",
            prompt:"<b>unlock</b> means…",
            choices:["lock again","not locked / open","lock before","lock with key"], correct:"not locked / open" },
          { id:"u4.b13.c6", type:"mcq",
            prompt:"Which word means <b>read again</b>?",
            choices:["unread","preread","reread","misread"], correct:"reread" },
        ]
      },

      // ---- Block 14: Suffixes ----
      {
        id: "u4.b14", title: "Suffixes: -ful, -less, -ly", emoji: "🧩",
        cards: [
          { id:"u4.b14.c1", type:"intro",
            title:"Suffixes change meaning too",
            body:"A <b>suffix</b> is added to the end.<br><b>-ful</b> = full of  •  <b>-less</b> = without  •  <b>-ly</b> = in a … way" },
          { id:"u4.b14.c2", type:"mcq",
            prompt:"<b>helpful</b> means…",
            choices:["without help","full of help","help again","help before"], correct:"full of help" },
          { id:"u4.b14.c3", type:"mcq",
            prompt:"<b>fearless</b> means…",
            choices:["full of fear","without fear","afraid again","kind of afraid"], correct:"without fear" },
          { id:"u4.b14.c4", type:"mcq",
            prompt:"<b>quickly</b> means…",
            choices:["not quick","in a quick way","without quick","quick again"], correct:"in a quick way" },
          { id:"u4.b14.c5", type:"mcq",
            prompt:"<b>hopeless</b> means…",
            choices:["full of hope","without hope","hope again","hope before"], correct:"without hope" },
          { id:"u4.b14.c6", type:"fill",
            prompt:"Add <b>-ful</b> to <b>care</b>:",
            accept:["careful"], choices:["careful","careless","carely"] },
        ]
      },

      // ---- Block 15: Science — States of matter ----
      {
        id: "u4.b15", title: "Science: solid, liquid, gas", emoji: "🧪",
        cards: [
          { id:"u4.b15.c1", type:"intro",
            title:"Three states of matter",
            body:"<b>Solid</b> keeps its shape (rock, ice).<br><b>Liquid</b> flows and takes the shape of its cup (water, juice).<br><b>Gas</b> spreads out everywhere (air, steam)." },
          { id:"u4.b15.c2", type:"mcq",
            prompt:"Ice is a…",
            choices:["solid","liquid","gas","light"], correct:"solid" },
          { id:"u4.b15.c3", type:"mcq",
            prompt:"Water is a…",
            choices:["solid","liquid","gas","light"], correct:"liquid" },
          { id:"u4.b15.c4", type:"mcq",
            prompt:"Steam is a…",
            choices:["solid","liquid","gas","metal"], correct:"gas" },
          { id:"u4.b15.c5", type:"mcq",
            prompt:"What happens when ice gets warm?",
            choices:["becomes a gas","becomes a liquid","stays solid","becomes a rock"], correct:"becomes a liquid" },
          { id:"u4.b15.c6", type:"mcq",
            prompt:"When water boils, it turns into…",
            choices:["ice","steam (gas)","rock","milk"], correct:"steam (gas)" },
        ]
      },

      // ---- Block 16: Science — Plant life cycle ----
      {
        id: "u4.b16", title: "Science: plant life cycle", emoji: "🌱",
        cards: [
          { id:"u4.b16.c1", type:"intro",
            title:"How a plant grows",
            body:"<b>Seed → sprout → plant → flower → new seeds</b>. Plants need <b>sun</b>, <b>water</b>, <b>air</b>, and <b>soil</b>." },
          { id:"u4.b16.c2", type:"mcq",
            prompt:"What does a plant grow from?",
            choices:["a rock","a seed","a leaf","a cloud"], correct:"a seed" },
          { id:"u4.b16.c3", type:"mcq",
            prompt:"Which is NOT something a plant needs?",
            choices:["sunlight","water","candy","air"], correct:"candy" },
          { id:"u4.b16.c4", type:"mcq",
            prompt:"What part of a plant takes in water from the ground?",
            choices:["leaves","roots","flower","stem"], correct:"roots" },
          { id:"u4.b16.c5", type:"mcq",
            prompt:"What part makes food using sunlight?",
            choices:["roots","leaves","seed","soil"], correct:"leaves" },
          { id:"u4.b16.c6", type:"mcq",
            prompt:"Order: seed, sprout, plant, ___?",
            choices:["soil","flower","cloud","rock"], correct:"flower" },
        ]
      },

      // ---- Block 17: Vocabulary II ----
      {
        id: "u4.b17", title: "Vocabulary: power words II", emoji: "📘",
        cards: [
          { id:"u4.b17.c1", type:"intro",
            title:"Bigger words = bigger power",
            body:"Use these words in your reading and writing to level up." },
          { id:"u4.b17.c2", type:"mcq",
            prompt:"<b>Curious</b> means…",
            choices:["wanting to know more","very tired","very angry","quietly"], correct:"wanting to know more" },
          { id:"u4.b17.c3", type:"mcq",
            prompt:"<b>Brave</b> means…",
            choices:["very afraid","not afraid","very small","very fast"], correct:"not afraid" },
          { id:"u4.b17.c4", type:"mcq",
            prompt:"<b>Examine</b> means…",
            choices:["to look at carefully","to throw away","to forget","to shout"], correct:"to look at carefully" },
          { id:"u4.b17.c5", type:"mcq",
            prompt:"<b>Suddenly</b> means…",
            choices:["very slowly","all at once, fast","never","tomorrow"], correct:"all at once, fast" },
          { id:"u4.b17.c6", type:"mcq",
            prompt:"<b>Enormous</b> means…",
            choices:["tiny","very big","quiet","sad"], correct:"very big" },
          { id:"u4.b17.c7", type:"mcq",
            prompt:"<b>Gentle</b> means…",
            choices:["rough and hard","kind and soft","very loud","very fast"], correct:"kind and soft" },
          { id:"u4.b17.c8", type:"fill",
            prompt:"A word for <b>very, very happy</b> (starts with j, 6 letters):",
            accept:["joyful"], choices:["joyful","jolly","jumpy"] },
        ]
      },

      // ---- Block 18: � Fractions II: thirds, eighths, equivalents ----
      {
        id: "u4.b18", title: "Fractions II: thirds, eighths, equivalents", emoji: "🍕",
        cards: [
          { id:"u4.b18.c1", type:"intro",
            title:"More fractions!",
            body:"A pizza cut in <b>3 equal pieces</b> — each piece is <b>1/3</b> (one third). In <b>8 pieces</b> — each is <b>1/8</b> (one eighth). The bigger the bottom number, the <b>smaller</b> each piece. <br>Two halves (2/2), three thirds (3/3), eight eighths (8/8) — all equal <b>one whole</b>." },
          { id:"u4.b18.c2", type:"mcq",
            prompt:"A pizza cut into <b>3 equal slices</b>. One slice is what fraction?",
            choices:["1/2","1/3","1/4","3/1"], correct:"1/3" },
          { id:"u4.b18.c3", type:"mcq",
            prompt:"Which piece is <b>bigger</b>: 1/4 or 1/8?",
            choices:["1/4","1/8","Same","Cannot tell"], correct:"1/4" },
          { id:"u4.b18.c4", type:"mcq",
            prompt:"Which fraction is the <b>same as 1/2</b>?",
            choices:["1/4","2/4","3/4","2/3"], correct:"2/4" },
          { id:"u4.b18.c5", type:"mcq",
            prompt:"There are 8 cookies. <b>3/8</b> are eaten. How many cookies were eaten?",
            choices:["2","3","4","5"], correct:"3" },
          { id:"u4.b18.c6", type:"mcq",
            prompt:"Which is <b>equal to one whole</b>?",
            choices:["2/3","3/4","4/4","5/8"], correct:"4/4" },
          { id:"u4.b18.c7", type:"mcq",
            prompt:"Order from <b>smallest to largest</b>: 1/8, 1/2, 1/4",
            choices:["1/2, 1/4, 1/8","1/8, 1/4, 1/2","1/4, 1/2, 1/8","1/8, 1/2, 1/4"], correct:"1/8, 1/4, 1/2" },
          { id:"u4.b18.c8", type:"fill",
            prompt:"A cake cut in 8 equal pieces. You eat 2 of them. How many pieces are LEFT? (number)",
            accept:["6","six"], choices:["6","2","8"] },
        ]
      },

      // ---- Block 19: �🎮 Fun Arena ----
      {
        id: "u4.fun", title: "Fun Arena 🎮", emoji: "🎮",
        cards: [
          { id:"u4.fun.c1", type:"intro",
            title:"🎮 Fun Arena!",
            body:"Frieza is next. Warm up with these mini-games — strong reps now mean an easier boss." },
          { id:"u4.fun.c2", type:"match",
            title:"Match prefix → meaning",
            pairs:[
              { a:"un-", b:"not" },
              { a:"re-", b:"again" },
              { a:"pre-", b:"before" },
              { a:"-ful", b:"full of" },
              { a:"-less", b:"without" },
            ] },
          { id:"u4.fun.c3", type:"speed",
            title:"Sprint: ×3 facts",
            seconds:7,
            questions:[
              { prompt:"3 × 4", choices:["9","11","12","15"], correct:"12" },
              { prompt:"3 × 7", choices:["18","21","24","27"], correct:"21" },
              { prompt:"3 × 6", choices:["15","18","21","24"], correct:"18" },
              { prompt:"3 × 9", choices:["24","27","30","33"], correct:"27" },
              { prompt:"3 × 8", choices:["21","24","27","30"], correct:"24" },
            ] },
          { id:"u4.fun.c4", type:"speed",
            title:"Sprint: ×4 facts",
            seconds:7,
            questions:[
              { prompt:"4 × 5", choices:["16","18","20","24"], correct:"20" },
              { prompt:"4 × 7", choices:["24","27","28","32"], correct:"28" },
              { prompt:"4 × 8", choices:["28","30","32","36"], correct:"32" },
              { prompt:"4 × 6", choices:["20","22","24","28"], correct:"24" },
              { prompt:"4 × 9", choices:["32","34","36","40"], correct:"36" },
            ] },
          { id:"u4.fun.c5", type:"tap",
            prompt:"Tap all the <b>SOLIDS</b>",
            items:[
              { label:"ice", correct:true },
              { label:"water", correct:false },
              { label:"rock", correct:true },
              { label:"steam", correct:false },
              { label:"book", correct:true },
              { label:"juice", correct:false },
              { label:"wood", correct:true },
              { label:"air", correct:false },
            ] },
          { id:"u4.fun.c6", type:"match",
            title:"Match suffix word → meaning",
            pairs:[
              { a:"helpful", b:"full of help" },
              { a:"fearless", b:"without fear" },
              { a:"quickly", b:"in a quick way" },
              { a:"hopeless", b:"without hope" },
            ] },
          { id:"u4.fun.c7", type:"tap",
            prompt:"Tap all the <b>LIQUIDS</b>",
            items:[
              { label:"water", correct:true },
              { label:"ice", correct:false },
              { label:"juice", correct:true },
              { label:"rock", correct:false },
              { label:"milk", correct:true },
              { label:"steam", correct:false },
              { label:"oil", correct:true },
              { label:"wood", correct:false },
            ] },
        ]
      },

      // ---- BOSS: Frieza ----
      {
        id: "u4.boss", title: "BOSS: Frieza", emoji: "❄️",
        cards: [
          { id:"u4.boss.c1", type:"boss",
            name:"Frieza", namePa:"ਫ੍ਰੀਜ਼ਾ", emoji:"❄️", hp:9,
            questions:[
              { prompt:"Pick the adverb: <i>She sang loudly.</i>", choices:["She","sang","loudly","."], correct:"loudly" },
              { prompt:"3 × 7 = ?", choices:["18","21","24","27"], correct:"21" },
              { prompt:"4 × 8 = ?", choices:["28","32","36","40"], correct:"32" },
              { prompt:"20 ÷ 5 = ?", choices:["3","4","5","10"], correct:"4" },
              { prompt:"In <b>374</b>, what does the <b>7</b> mean?", choices:["7 ones","7 tens","7 hundreds","7 thousands"], correct:"7 tens" },
              { prompt:"<b>unkind</b> means…", choices:["very kind","not kind","kind again","kind before"], correct:"not kind" },
              { prompt:"Which sentence uses commas correctly?", choices:["I see red blue and green.","I see red, blue, and green.","I, see red blue green.","I see, red blue green."], correct:"I see red, blue, and green." },
              { prompt:"Steam is a…", choices:["solid","liquid","gas","rock"], correct:"gas" },
              { prompt:"15 cookies shared by 3 kids. Each gets?", choices:["3","4","5","6"], correct:"5" },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 5 — GALACTIC TOURNAMENT  (~Grade 2.8–3.0)
  // ============================================================
  {
    id: "u5", title: "Galactic Tournament", emoji: "🏆",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 4) ----
      {
        id: "u5.recap", title: "Chai Recap: Unit 4", emoji: "☕",
        cards: [
          { id:"u5.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Refresh from Unit 4: <b>adverbs, prepositions, ×3/×4, division, place value to 100s, prefixes/suffixes.</b>" },
          { id:"u5.recap.c2", type:"mcq",
            prompt:"Pick the adverb: <i>She sang loudly.</i>",
            choices:["She","sang","loudly","."], correct:"loudly" },
          { id:"u5.recap.c3", type:"mcq",
            prompt:"🧮 4 × 8 = ?",
            choices:["24","28","32","36"], correct:"32" },
          { id:"u5.recap.c4", type:"mcq",
            prompt:"🧮 20 ÷ 5 = ?",
            choices:["3","4","5","10"], correct:"4" },
          { id:"u5.recap.c5", type:"mcq",
            prompt:"<b>unkind</b> means…",
            choices:["very kind","not kind","kind again","kind before"], correct:"not kind" },
          { id:"u5.recap.c6", type:"fill",
            prompt:"In <b>374</b>, the 3 stands for ___ hundreds.",
            accept:["3","three"], choices:["3","7","4"] },
        ]
      },

      // ---- Block 1: Multiplication ×6 ----
      {
        id: "u5.b1", title: "Multiplication ×6", emoji: "✖️",
        cards: [
          { id:"u5.b1.c1", type:"intro",
            title:"Stack the facts",
            body:"You already know ×2, ×3, ×4, ×5, ×10. Now we add ×6. Tip: <b>6 × n = (5 × n) + n</b>." },
          { id:"u5.b1.c2", type:"flash", front:"6 × 1 = ?", back:"<b>6</b>" },
          { id:"u5.b1.c3", type:"flash", front:"6 × 2 = ?", back:"<b>12</b>" },
          { id:"u5.b1.c4", type:"mcq", prompt:"6 × 3 = ?", choices:["12","15","18","21"], correct:"18" },
          { id:"u5.b1.c5", type:"mcq", prompt:"6 × 4 = ?", choices:["18","20","24","28"], correct:"24" },
          { id:"u5.b1.c6", type:"mcq", prompt:"6 × 5 = ?", choices:["25","30","35","36"], correct:"30" },
          { id:"u5.b1.c7", type:"mcq", prompt:"6 × 6 = ?", choices:["30","32","36","42"], correct:"36" },
          { id:"u5.b1.c8", type:"mcq", prompt:"6 × 7 = ?", choices:["36","42","48","54"], correct:"42" },
          { id:"u5.b1.c9", type:"fill", prompt:"6 × 8 = ?", accept:["48"], choices:["48","42","54"] },
          { id:"u5.b1.c10", type:"fill", prompt:"6 × 9 = ?", accept:["54"], choices:["54","48","56"] },
        ]
      },

      // ---- Block 2: Multiplication ×9 ----
      {
        id: "u5.b2", title: "Multiplication ×9 (finger trick)", emoji: "✋",
        cards: [
          { id:"u5.b2.c1", type:"intro",
            title:"The 9s pattern",
            body:"Look: 9, 18, 27, 36, 45, 54, 63, 72, 81, 90. The <b>tens digit goes up</b>, the <b>ones digit goes down</b>!" },
          { id:"u5.b2.c2", type:"mcq", prompt:"9 × 2 = ?", choices:["11","18","19","20"], correct:"18" },
          { id:"u5.b2.c3", type:"mcq", prompt:"9 × 3 = ?", choices:["21","24","27","30"], correct:"27" },
          { id:"u5.b2.c4", type:"mcq", prompt:"9 × 4 = ?", choices:["32","36","40","45"], correct:"36" },
          { id:"u5.b2.c5", type:"mcq", prompt:"9 × 5 = ?", choices:["40","45","50","54"], correct:"45" },
          { id:"u5.b2.c6", type:"mcq", prompt:"9 × 6 = ?", choices:["48","54","56","60"], correct:"54" },
          { id:"u5.b2.c7", type:"mcq", prompt:"9 × 7 = ?", choices:["56","63","64","70"], correct:"63" },
          { id:"u5.b2.c8", type:"fill", prompt:"9 × 8 = ?", accept:["72"], choices:["72","64","81"] },
          { id:"u5.b2.c9", type:"fill", prompt:"9 × 9 = ?", accept:["81"], choices:["81","72","90"] },
        ]
      },

      // ---- Block 3: Division ÷3, ÷4 ----
      {
        id: "u5.b3", title: "Division: ÷3 and ÷4", emoji: "➗",
        cards: [
          { id:"u5.b3.c1", type:"flash",
            front:"How does division work?",
            back:"<b>12 ÷ 3</b> asks: how many groups of <b>3</b> are in 12? Answer: <b>4</b>." },
          { id:"u5.b3.c2", type:"mcq", prompt:"9 ÷ 3 = ?", choices:["2","3","4","6"], correct:"3" },
          { id:"u5.b3.c3", type:"mcq", prompt:"12 ÷ 3 = ?", choices:["3","4","5","6"], correct:"4" },
          { id:"u5.b3.c4", type:"mcq", prompt:"18 ÷ 3 = ?", choices:["5","6","7","9"], correct:"6" },
          { id:"u5.b3.c5", type:"mcq", prompt:"27 ÷ 3 = ?", choices:["6","7","8","9"], correct:"9" },
          { id:"u5.b3.c6", type:"mcq", prompt:"8 ÷ 4 = ?", choices:["2","3","4","6"], correct:"2" },
          { id:"u5.b3.c7", type:"mcq", prompt:"16 ÷ 4 = ?", choices:["3","4","5","8"], correct:"4" },
          { id:"u5.b3.c8", type:"mcq", prompt:"24 ÷ 4 = ?", choices:["4","5","6","8"], correct:"6" },
          { id:"u5.b3.c9", type:"fill", prompt:"32 ÷ 4 = ?", accept:["8"], choices:["8","6","9"] },
        ]
      },

      // ---- Block 4: 3-digit addition ----
      {
        id: "u5.b4", title: "Add 3-digit numbers", emoji: "➕",
        cards: [
          { id:"u5.b4.c1", type:"intro",
            title:"Stack and add",
            body:"Line up <b>ones, tens, hundreds</b>. Add ones first. If it's 10 or more, <b>carry</b> a 1 to the next column." },
          { id:"u5.b4.c2", type:"mcq", prompt:"123 + 245 = ?", choices:["358","368","378","468"], correct:"368" },
          { id:"u5.b4.c3", type:"mcq", prompt:"406 + 137 = ?", choices:["533","543","553","643"], correct:"543" },
          { id:"u5.b4.c4", type:"mcq", prompt:"258 + 134 = ?", choices:["382","392","402","482"], correct:"392" },
          { id:"u5.b4.c5", type:"mcq", prompt:"567 + 219 = ?", choices:["776","786","796","886"], correct:"786" },
          { id:"u5.b4.c6", type:"fill", prompt:"305 + 192 = ?", accept:["497"], choices:["497","487","507"] },
        ]
      },

      // ---- Block 5: 3-digit subtraction ----
      {
        id: "u5.b5", title: "Subtract 3-digit numbers", emoji: "➖",
        cards: [
          { id:"u5.b5.c1", type:"intro",
            title:"Stack and subtract",
            body:"Subtract ones first. If the top is smaller, <b>borrow</b> 10 from the tens column." },
          { id:"u5.b5.c2", type:"mcq", prompt:"487 − 132 = ?", choices:["345","355","365","455"], correct:"355" },
          { id:"u5.b5.c3", type:"mcq", prompt:"650 − 230 = ?", choices:["320","420","430","520"], correct:"420" },
          { id:"u5.b5.c4", type:"mcq", prompt:"532 − 218 = ?", choices:["304","314","324","414"], correct:"314" },
          { id:"u5.b5.c5", type:"mcq", prompt:"800 − 256 = ?", choices:["534","544","554","644"], correct:"544" },
          { id:"u5.b5.c6", type:"fill", prompt:"716 − 343 = ?", accept:["373"], choices:["373","363","383"] },
        ]
      },

      // ---- Block 6: Money word problems ----
      {
        id: "u5.b6", title: "Money word problems", emoji: "💵",
        cards: [
          { id:"u5.b6.c1", type:"intro",
            title:"Spend and save",
            body:"Add what you spend. Subtract from your money to find what's <b>left</b>." },
          { id:"u5.b6.c2", type:"mcq",
            prompt:"You have $20. You buy a toy for $7. <b>Change?</b>",
            choices:["$11","$12","$13","$27"], correct:"$13" },
          { id:"u5.b6.c3", type:"mcq",
            prompt:"3 candies cost $2 each. <b>Total?</b>",
            choices:["$5","$6","$8","$9"], correct:"$6" },
          { id:"u5.b6.c4", type:"mcq",
            prompt:"You save $5 every week. After 4 weeks?",
            choices:["$15","$20","$25","$45"], correct:"$20" },
          { id:"u5.b6.c5", type:"mcq",
            prompt:"₹100 − ₹35 = ?",
            choices:["₹55","₹65","₹75","₹135"], correct:"₹65" },
          { id:"u5.b6.c6", type:"mcq",
            prompt:"A book is $12 and a pen is $3. Total cost?",
            choices:["$9","$14","$15","$18"], correct:"$15" },
        ]
      },

      // ---- Block 7: Time word problems ----
      {
        id: "u5.b7", title: "Time word problems (elapsed)", emoji: "⏰",
        cards: [
          { id:"u5.b7.c1", type:"intro",
            title:"How much time passed?",
            body:"Count from start to end. <b>From 3:00 to 5:00 = 2 hours</b>. From 4:30 to 5:00 = 30 minutes." },
          { id:"u5.b7.c2", type:"mcq",
            prompt:"School starts at 8:00 and ends at 2:00. How long?",
            choices:["4 hours","5 hours","6 hours","8 hours"], correct:"6 hours" },
          { id:"u5.b7.c3", type:"mcq",
            prompt:"A movie starts at 5:00 and ends at 6:30. How long?",
            choices:["1 hour","1 hour 30 min","2 hours","2 hours 30 min"], correct:"1 hour 30 min" },
          { id:"u5.b7.c4", type:"mcq",
            prompt:"Recess is 15 min. It starts at 10:45. It ends at?",
            choices:["10:50","11:00","11:15","11:30"], correct:"11:00" },
          { id:"u5.b7.c5", type:"mcq",
            prompt:"You sleep at 9 PM and wake at 7 AM. How many hours?",
            choices:["8","9","10","12"], correct:"10" },
        ]
      },

      // ---- Block 8: Reading comp (long) ----
      {
        id: "u5.b8", title: "Reading: long passage", emoji: "📚",
        cards: [
          { id:"u5.b8.c1", type:"read",
            passage:"Long ago, people did not have clocks. They told time by looking at the sun. When the sun was rising, it was morning. When the sun was high in the sky, it was noon. When the sun went down, it was evening. Some people built sundials — flat circles with a stick in the middle. The stick made a shadow, and the shadow moved as the sun moved. They could read the time from the shadow!",
            questions:[
              { prompt:"Long ago, how did people tell time?", choices:["with a phone","by looking at the sun","by counting birds","by reading books"], correct:"by looking at the sun" },
              { prompt:"When the sun is high, it is…", choices:["morning","noon","evening","night"], correct:"noon" },
              { prompt:"What is a sundial?", choices:["a kind of clock that uses sunlight","a kind of food","a song","a flower"], correct:"a kind of clock that uses sunlight" },
              { prompt:"What part of the sundial moves?", choices:["the circle","the stick","the shadow","the sun"], correct:"the shadow" },
            ]
          },
        ]
      },

      // ---- Block 9: Cause & effect ----
      {
        id: "u5.b9", title: "Cause and effect", emoji: "🔗",
        cards: [
          { id:"u5.b9.c1", type:"intro",
            title:"Why did it happen?",
            body:"<b>Cause</b> = why something happened. <b>Effect</b> = what happened.<br><i>It rained (cause), so the ground got wet (effect).</i>" },
          { id:"u5.b9.c2", type:"mcq",
            prompt:"The ice melted because…",
            choices:["it was cold","it got warm","it was night","it was a rock"], correct:"it got warm" },
          { id:"u5.b9.c3", type:"mcq",
            prompt:"Cause: She forgot her umbrella. Effect: ?",
            choices:["She got wet in the rain.","She ate lunch.","She read a book.","She slept."], correct:"She got wet in the rain." },
          { id:"u5.b9.c4", type:"mcq",
            prompt:"Effect: The plant grew tall. Best cause?",
            choices:["No water","Lots of sun and water","Dark closet","Cold ice"], correct:"Lots of sun and water" },
          { id:"u5.b9.c5", type:"mcq",
            prompt:"Which word signals cause/effect?",
            choices:["because","banana","quickly","blue"], correct:"because" },
        ]
      },

      // ---- Block 9b: Sequencing & order of events ----
      {
        id: "u5.b9b", title: "Sequencing: order of events", emoji: "🔢",
        cards: [
          { id:"u5.b9b.c1", type:"intro",
            title:"What happened FIRST?",
            body:"Stories and how-to steps happen in <b>order</b>. Watch for time words: <b>first, next, then, after, finally</b>." },
          { id:"u5.b9b.c2", type:"mcq",
            prompt:"What word tells you something happens at the START?",
            choices:["finally","first","after","then"], correct:"first" },
          { id:"u5.b9b.c3", type:"mcq",
            prompt:"<i>First, crack the egg. Next, beat it. Then, cook it.</i><br>What do you do RIGHT AFTER cracking?",
            choices:["cook it","beat it","eat it","freeze it"], correct:"beat it" },
          { id:"u5.b9b.c4", type:"mcq",
            prompt:"<i>She woke up. She brushed her teeth. She ate breakfast. She left for school.</i><br>What did she do LAST?",
            choices:["woke up","brushed teeth","ate breakfast","left for school"], correct:"left for school" },
          { id:"u5.b9b.c5", type:"mcq",
            prompt:"Order: 1) plant seed  2) water it  3) it grows  4) ___ ?",
            choices:["give up","flower blooms","seed disappears","nothing"], correct:"flower blooms" },
          { id:"u5.b9b.c6", type:"mcq",
            prompt:"Which signal word tells you something is the END?",
            choices:["first","next","finally","meanwhile"], correct:"finally" },
          { id:"u5.b9b.c7", type:"mcq",
            prompt:"<i>I tied my shoes, then I ran outside, and finally I jumped on my bike.</i><br>What was the SECOND thing?",
            choices:["tied shoes","ran outside","jumped on bike","sat down"], correct:"ran outside" },
        ]
      },

      // ---- Block 9c: Inference variety ----
      {
        id: "u5.b9c", title: "Inference: predict and explain", emoji: "🧩",
        cards: [
          { id:"u5.b9c.c1", type:"intro",
            title:"Read clues, then infer",
            body:"An <b>inference</b> is a smart guess based on clues + what you already know." },
          { id:"u5.b9c.c2", type:"mcq",
            prompt:"Mom said, <i>'I need to sit down for a while.'</i> She is probably…",
            choices:["tired","hungry","lost","angry"], correct:"tired" },
          { id:"u5.b9c.c3", type:"mcq",
            prompt:"The sky turned dark and thunder started. What will probably happen next?",
            choices:["It will snow heavily","It will rain soon","The sun gets hotter","Nothing changes"], correct:"It will rain soon" },
          { id:"u5.b9c.c4", type:"mcq",
            prompt:"Ravi studied every night for a week. On test day, he will probably…",
            choices:["forget his name","do well","miss school","lose his pencil"], correct:"do well" },
          { id:"u5.b9c.c5", type:"mcq",
            prompt:"The plant's leaves are yellow and dry. Best cause?",
            choices:["Too little water","Too much homework","Too many books","Too many shoes"], correct:"Too little water" },
          { id:"u5.b9c.c6", type:"fill",
            prompt:"A boy packed an umbrella and rain boots. Weather is likely ___ .",
            accept:["rainy"], choices:["rainy","sunny","snowy"] },
        ]
      },

      // ---- Block 10: Main idea ----
      {
        id: "u5.b10", title: "Main idea", emoji: "💡",
        cards: [
          { id:"u5.b10.c1", type:"intro",
            title:"What is the story mostly about?",
            body:"The <b>main idea</b> is the BIG point — what most of the sentences are about." },
          { id:"u5.b10.c2", type:"mcq",
            prompt:"<i>Dogs need food, water, walks, and love. Taking care of a dog is a big job.</i> Main idea?",
            choices:["Dogs are scary.","Caring for a dog takes work.","Cats are easy.","Dogs hate water."],
            correct:"Caring for a dog takes work." },
          { id:"u5.b10.c3", type:"mcq",
            prompt:"<i>Bees buzz from flower to flower. They carry pollen. Without bees, many plants could not grow.</i> Main idea?",
            choices:["Bees are loud.","Bees are very important to plants.","Bees live in hives.","Flowers are pretty."],
            correct:"Bees are very important to plants." },
          { id:"u5.b10.c4", type:"mcq",
            prompt:"<i>Brushing your teeth keeps them clean. It also keeps your gums healthy. It stops cavities, too.</i> Main idea?",
            choices:["Toothpaste tastes good.","Brushing teeth is healthy.","Dentists are nice.","Teeth are white."],
            correct:"Brushing teeth is healthy." },
        ]
      },

      // ---- Block 11: Compound words ----
      {
        id: "u5.b11", title: "Compound words", emoji: "🧱",
        cards: [
          { id:"u5.b11.c1", type:"intro",
            title:"Two words → one word",
            body:"A <b>compound word</b> is two small words joined.<br><b>sun + flower = sunflower</b>" },
          { id:"u5.b11.c2", type:"mcq",
            prompt:"<b>rainbow</b> = ?",
            choices:["rain + bow","ran + boy","rain + how","ride + bow"], correct:"rain + bow" },
          { id:"u5.b11.c3", type:"mcq",
            prompt:"<b>football</b> = ?",
            choices:["foo + tball","foot + ball","fool + ball","fort + ball"], correct:"foot + ball" },
          { id:"u5.b11.c4", type:"mcq",
            prompt:"sun + shine = ?",
            choices:["sunshine","sunny","sunset","shine sun"], correct:"sunshine" },
          { id:"u5.b11.c5", type:"mcq",
            prompt:"butter + fly = ?",
            choices:["butterfly","butterfree","buttery","fly butter"], correct:"butterfly" },
          { id:"u5.b11.c6", type:"fill",
            prompt:"book + worm = ?",
            accept:["bookworm"], choices:["bookworm","wormbook","book worm"] },
        ]
      },

      // ---- Block 11b: Fractions in real life ----
      {
        id: "u5.b11b", title: "Fractions in real life: time, money, measure", emoji: "🕒",
        cards: [
          { id:"u5.b11b.c1", type:"intro",
            title:"Fractions are everywhere",
            body:"Fractions appear in clocks, coins, and recipes.<br><b>1/4 hour = 15 minutes</b> and <b>1/4 of $1 = 25 cents</b>." },
          { id:"u5.b11b.c2", type:"mcq",
            prompt:"$1 is 4 quarters. One quarter is…",
            choices:["10 cents","20 cents","25 cents","50 cents"], correct:"25 cents" },
          { id:"u5.b11b.c3", type:"mcq",
            prompt:"From 3:00 to 3:15 is what fraction of an hour?",
            choices:["1/2","1/3","1/4","3/4"], correct:"1/4" },
          { id:"u5.b11b.c4", type:"mcq",
            prompt:"30 minutes is what fraction of an hour?",
            choices:["1/4","1/2","2/3","3/4"], correct:"1/2" },
          { id:"u5.b11b.c5", type:"mcq",
            prompt:"A recipe uses 1/2 cup flour. You make it twice. How much flour total?",
            choices:["1/2 cup","1 cup","1 1/2 cups","2 cups"], correct:"1 cup" },
          { id:"u5.b11b.c6", type:"fill",
            prompt:"45 minutes is ___ of an hour.",
            accept:["3/4","three fourths","three-fourths"], choices:["1/4","1/2","3/4"] },
          { id:"u5.b11b.c7", type:"fill",
            prompt:"25 cents is ___ of one dollar.",
            accept:["1/4","one fourth","one-fourth"], choices:["1/2","1/3","1/4"] },
        ]
      },

      // ---- Block 12: Homophones ----
      {
        id: "u5.b12", title: "Homophones: same sound, different word", emoji: "🎭",
        cards: [
          { id:"u5.b12.c1", type:"intro",
            title:"Sound alike, mean different",
            body:"<b>their</b> = belongs to them &nbsp;•&nbsp; <b>there</b> = a place &nbsp;•&nbsp; <b>they're</b> = they are<br><b>to</b> = direction &nbsp;•&nbsp; <b>two</b> = 2 &nbsp;•&nbsp; <b>too</b> = also / very" },
          { id:"u5.b12.c2", type:"mcq",
            prompt:"Pick the right one: <i>The dogs wagged ___ tails.</i>",
            choices:["their","there","they're","theyre"], correct:"their" },
          { id:"u5.b12.c3", type:"mcq",
            prompt:"Pick the right one: <i>Look over ___!</i>",
            choices:["their","there","they're","thair"], correct:"there" },
          { id:"u5.b12.c4", type:"mcq",
            prompt:"Pick the right one: <i>I have ___ apples.</i>",
            choices:["to","two","too","tow"], correct:"two" },
          { id:"u5.b12.c5", type:"mcq",
            prompt:"Pick the right one: <i>I'm going ___ school.</i>",
            choices:["to","two","too","toe"], correct:"to" },
          { id:"u5.b12.c6", type:"mcq",
            prompt:"Pick the right one: <i>I want ice cream ___!</i>",
            choices:["to","two","too","tow"], correct:"too" },
          { id:"u5.b12.c7", type:"mcq",
            prompt:"<b>your</b> vs <b>you're</b>: <i>___ a great kid!</i>",
            choices:["Your","You're","Youre","Yore"], correct:"You're" },
        ]
      },

      // ---- Block 13: Animals & habitats ----
      {
        id: "u5.b13", title: "Science: animals & habitats", emoji: "🐾",
        cards: [
          { id:"u5.b13.c1", type:"intro",
            title:"Where animals live",
            body:"A <b>habitat</b> is where an animal lives. Each habitat has the food, water, and shelter the animal needs." },
          { id:"u5.b13.c2", type:"mcq",
            prompt:"A fish's habitat is…",
            choices:["the desert","water","a tree","the sky"], correct:"water" },
          { id:"u5.b13.c3", type:"mcq",
            prompt:"A camel's habitat is…",
            choices:["the ocean","a forest","the desert","the snow"], correct:"the desert" },
          { id:"u5.b13.c4", type:"mcq",
            prompt:"A polar bear lives in…",
            choices:["the desert","the jungle","the cold Arctic","the ocean only"], correct:"the cold Arctic" },
          { id:"u5.b13.c5", type:"mcq",
            prompt:"Animals that eat ONLY plants are called…",
            choices:["carnivores","herbivores","omnivores","robots"], correct:"herbivores" },
          { id:"u5.b13.c6", type:"mcq",
            prompt:"Animals that eat ONLY meat are called…",
            choices:["herbivores","carnivores","omnivores","insectivores"], correct:"carnivores" },
          { id:"u5.b13.c7", type:"mcq",
            prompt:"Humans, who eat both plants and meat, are…",
            choices:["herbivores","carnivores","omnivores","none"], correct:"omnivores" },
        ]
      },

      // ---- Block 14: Solar system ----
      {
        id: "u5.b14", title: "Science: the solar system", emoji: "🪐",
        cards: [
          { id:"u5.b14.c1", type:"intro",
            title:"8 planets, 1 sun",
            body:"Order from the Sun: <b>Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune</b>. The Sun is a <b>star</b>, not a planet." },
          { id:"u5.b14.c2", type:"mcq",
            prompt:"Which planet do we live on?",
            choices:["Mars","Earth","Saturn","Venus"], correct:"Earth" },
          { id:"u5.b14.c3", type:"mcq",
            prompt:"Which is the closest planet to the Sun?",
            choices:["Earth","Venus","Mercury","Mars"], correct:"Mercury" },
          { id:"u5.b14.c4", type:"mcq",
            prompt:"Which is the biggest planet?",
            choices:["Earth","Saturn","Jupiter","Neptune"], correct:"Jupiter" },
          { id:"u5.b14.c5", type:"mcq",
            prompt:"Which planet is famous for its rings?",
            choices:["Mars","Saturn","Mercury","Earth"], correct:"Saturn" },
          { id:"u5.b14.c6", type:"mcq",
            prompt:"The Sun is a…",
            choices:["planet","moon","star","comet"], correct:"star" },
          { id:"u5.b14.c7", type:"mcq",
            prompt:"What goes around Earth?",
            choices:["the Sun","the Moon","Mars","Jupiter"], correct:"the Moon" },
        ]
      },

      // ---- Block 15: Continents & oceans ----
      {
        id: "u5.b15", title: "Geography: continents & oceans", emoji: "🌏",
        cards: [
          { id:"u5.b15.c1", type:"intro",
            title:"Earth has 7 continents and 5 oceans",
            body:"<b>Continents:</b> Africa, Antarctica, Asia, Australia, Europe, North America, South America.<br><b>Oceans:</b> Pacific, Atlantic, Indian, Arctic, Southern." },
          { id:"u5.b15.c2", type:"mcq",
            prompt:"How many continents are there?",
            choices:["5","6","7","8"], correct:"7" },
          { id:"u5.b15.c3", type:"mcq",
            prompt:"Which is the largest continent?",
            choices:["Africa","Asia","Europe","Australia"], correct:"Asia" },
          { id:"u5.b15.c4", type:"mcq",
            prompt:"Which is the largest ocean?",
            choices:["Atlantic","Pacific","Indian","Arctic"], correct:"Pacific" },
          { id:"u5.b15.c5", type:"mcq",
            prompt:"India is on which continent?",
            choices:["Africa","Asia","Europe","South America"], correct:"Asia" },
          { id:"u5.b15.c6", type:"mcq",
            prompt:"USA is on which continent?",
            choices:["South America","Europe","North America","Africa"], correct:"North America" },
          { id:"u5.b15.c7", type:"mcq",
            prompt:"Which continent is at the South Pole, very cold and icy?",
            choices:["Australia","Antarctica","Africa","Asia"], correct:"Antarctica" },
        ]
      },

      // ---- Block 16: Nutrition / food groups ----
      {
        id: "u5.b16", title: "Health: food groups", emoji: "🥗",
        cards: [
          { id:"u5.b16.c1", type:"intro",
            title:"Eat the rainbow",
            body:"Healthy meals include: <b>fruits, vegetables, grains, protein, dairy</b>. Drink lots of water!" },
          { id:"u5.b16.c2", type:"mcq",
            prompt:"Which is a fruit?",
            choices:["carrot","apple","cheese","bread"], correct:"apple" },
          { id:"u5.b16.c3", type:"mcq",
            prompt:"Which is a vegetable?",
            choices:["banana","broccoli","milk","rice"], correct:"broccoli" },
          { id:"u5.b16.c4", type:"mcq",
            prompt:"Which is a grain?",
            choices:["egg","milk","rice","carrot"], correct:"rice" },
          { id:"u5.b16.c5", type:"mcq",
            prompt:"Which gives the most <b>protein</b> for muscles?",
            choices:["candy","chicken","soda","chips"], correct:"chicken" },
          { id:"u5.b16.c6", type:"mcq",
            prompt:"Which is the best drink to have a lot of?",
            choices:["soda","juice every meal","water","energy drink"], correct:"water" },
          { id:"u5.b16.c7", type:"mcq",
            prompt:"Which should you eat only sometimes (a treat)?",
            choices:["fruit","candy","vegetables","whole grain bread"], correct:"candy" },
        ]
      },

      // ---- Block 17: Patterns & critical thinking ----
      {
        id: "u5.b17", title: "Patterns & thinking", emoji: "🧠",
        cards: [
          { id:"u5.b17.c1", type:"intro",
            title:"Look for the rule",
            body:"In a pattern, find what's <b>repeating</b> or <b>changing each time</b>." },
          { id:"u5.b17.c2", type:"mcq",
            prompt:"What comes next? 2, 4, 6, 8, ___",
            choices:["9","10","11","12"], correct:"10" },
          { id:"u5.b17.c3", type:"mcq",
            prompt:"What comes next? 5, 10, 15, 20, ___",
            choices:["22","24","25","30"], correct:"25" },
          { id:"u5.b17.c4", type:"mcq",
            prompt:"What comes next? 100, 90, 80, 70, ___",
            choices:["50","60","65","75"], correct:"60" },
          { id:"u5.b17.c5", type:"mcq",
            prompt:"What comes next? A, B, A, B, A, ___",
            choices:["A","B","C","D"], correct:"B" },
          { id:"u5.b17.c6", type:"mcq",
            prompt:"What comes next? 🔴🔵🔴🔵🔴___",
            choices:["🔴","🔵","🟢","🟡"], correct:"🔵" },
          { id:"u5.b17.c7", type:"mcq",
            prompt:"Which does NOT belong? <b>apple, banana, carrot, grape</b>",
            choices:["apple","banana","carrot","grape"], correct:"carrot" },
        ]
      },

      // ---- Block 18: Vocabulary mastery ----
      {
        id: "u5.b18", title: "Vocabulary: mastery", emoji: "📕",
        cards: [
          { id:"u5.b18.c1", type:"intro",
            title:"Top-tier word power",
            body:"Master these and your speaking + writing will sound much older." },
          { id:"u5.b18.c2", type:"mcq",
            prompt:"<b>Astonish</b> means…",
            choices:["to bore","to surprise greatly","to scare","to lose"], correct:"to surprise greatly" },
          { id:"u5.b18.c3", type:"mcq",
            prompt:"<b>Cooperate</b> means…",
            choices:["to fight","to ignore","to work together","to run away"], correct:"to work together" },
          { id:"u5.b18.c4", type:"mcq",
            prompt:"<b>Exhausted</b> means…",
            choices:["very full of energy","very tired","very angry","very happy"], correct:"very tired" },
          { id:"u5.b18.c5", type:"mcq",
            prompt:"<b>Reveal</b> means…",
            choices:["to hide","to show what was hidden","to break","to forget"], correct:"to show what was hidden" },
          { id:"u5.b18.c6", type:"mcq",
            prompt:"<b>Decide</b> means…",
            choices:["to ask a friend","to choose","to forget","to wait"], correct:"to choose" },
          { id:"u5.b18.c7", type:"mcq",
            prompt:"<b>Explain</b> means…",
            choices:["to make clear","to hide","to shout","to draw"], correct:"to make clear" },
          { id:"u5.b18.c8", type:"mcq",
            prompt:"<b>Imagine</b> means…",
            choices:["to forget","to picture in your mind","to break","to count"], correct:"to picture in your mind" },
          { id:"u5.b18.c9", type:"fill",
            prompt:"A word that means <b>many kinds; not all the same</b> (7 letters):",
            accept:["diverse","various"], choices:["diverse","various","similar"] },
        ]
      },

      // ---- Block 19: 🧮 Multi-step word problems ----
      {
        id: "u5.b19", title: "Multi-step word problems", emoji: "🧮",
        cards: [
          { id:"u5.b19.c1", type:"intro",
            title:"Two-step thinking",
            body:"Some problems need <b>two steps</b>. Read carefully:<br>1. What is the question really asking?<br>2. Do the first step. <i>Write the answer.</i><br>3. Use that answer in the next step.<br>Example: <i>Sara had 8 stickers. She gave 3 away, then got 5 more.</i> → 8 − 3 = 5; 5 + 5 = <b>10</b>." },
          { id:"u5.b19.c2", type:"mcq",
            prompt:"Goku has 12 senzu beans. He eats 4, then Krillin gives him 6 more. How many does he have now?",
            choices:["10","12","14","18"], correct:"14" },
          { id:"u5.b19.c3", type:"mcq",
            prompt:"There are 6 boxes with 4 cookies each. You eat 5 cookies. How many cookies are LEFT?",
            choices:["19","20","24","29"], correct:"19" },
          { id:"u5.b19.c4", type:"mcq",
            prompt:"A pencil costs $2. You buy 5 pencils and pay with a $20 bill. How much CHANGE do you get?",
            choices:["$5","$8","$10","$15"], correct:"$10" },
          { id:"u5.b19.c5", type:"mcq",
            prompt:"A movie starts at 4:00 PM and lasts 2 hours. You arrive 30 minutes late. How long is left when you arrive?",
            choices:["1 hour","1 hour 30 min","2 hours","30 min"], correct:"1 hour 30 min" },
          { id:"u5.b19.c6", type:"mcq",
            prompt:"Mom baked 24 cookies. She gave 8 to neighbors and shared the rest equally with 2 kids. How many did each kid get?",
            choices:["6","8","12","16"], correct:"8" },
          { id:"u5.b19.c7", type:"fill",
            prompt:"There are 3 shelves with 5 books each. You read 4 of them. How many books are left UNREAD? (number)",
            accept:["11","eleven"], choices:["11","12","15"] },
        ]
      },

      // ---- Block 20: ⚛️ Science: 5 senses & simple machines ----
      {
        id: "u5.b20", title: "Science: 5 senses & simple machines", emoji: "⚛️",
        cards: [
          { id:"u5.b20.c1", type:"intro",
            title:"Your 5 senses + tools that help us",
            body:"Your <b>5 senses</b> are: <b>sight</b> (eyes), <b>hearing</b> (ears), <b>smell</b> (nose), <b>taste</b> (tongue), <b>touch</b> (skin).<br>A <b>simple machine</b> makes work easier. Examples: <b>lever</b> (seesaw), <b>wheel & axle</b> (car wheels), <b>pulley</b> (flag rope), <b>inclined plane</b> (ramp), <b>screw</b>, <b>wedge</b> (axe)." },
          { id:"u5.b20.c2", type:"mcq",
            prompt:"Which body part do you use for the sense of <b>smell</b>?",
            choices:["eyes","ears","nose","tongue"], correct:"nose" },
          { id:"u5.b20.c3", type:"mcq",
            prompt:"You touch a hot stove and feel pain. Which sense gave you the warning?",
            choices:["sight","hearing","touch","taste"], correct:"touch" },
          { id:"u5.b20.c4", type:"mcq",
            prompt:"A seesaw at the playground is an example of a…",
            choices:["pulley","wheel","lever","screw"], correct:"lever" },
          { id:"u5.b20.c5", type:"mcq",
            prompt:"A ramp used to push a heavy box up to a truck is an…",
            choices:["inclined plane","wheel and axle","pulley","wedge"], correct:"inclined plane" },
          { id:"u5.b20.c6", type:"mcq",
            prompt:"The rope-and-wheel system used to raise a flag up a flagpole is a…",
            choices:["lever","pulley","wedge","screw"], correct:"pulley" },
          { id:"u5.b20.c7", type:"mcq",
            prompt:"An axe has a sharp edge that splits wood. It is a…",
            choices:["wheel","wedge","pulley","lever"], correct:"wedge" },
          { id:"u5.b20.c8", type:"fill",
            prompt:"Which sense do you use to enjoy music? (one word)",
            accept:["hearing"], choices:["hearing","sight","taste"] },
        ]
      },

      // ---- Block 21: 🎮 Champion's Arena (final mini-games) ----
      {
        id: "u5.fun", title: "Champion's Arena 🎮", emoji: "🏟️",
        cards: [
          { id:"u5.fun.c1", type:"intro",
            title:"🏟️ Champion's Arena!",
            body:"This is your final tune-up before Cell. Mini-games across everything you've learned. Show what you got!" },
          { id:"u5.fun.c2", type:"match",
            title:"Match planet → fact",
            pairs:[
              { a:"Mercury", b:"closest to Sun" },
              { a:"Earth", b:"we live here" },
              { a:"Jupiter", b:"biggest planet" },
              { a:"Saturn", b:"famous rings" },
              { a:"Sun", b:"a star" },
            ] },
          { id:"u5.fun.c3", type:"match",
            title:"Match continent → fact",
            pairs:[
              { a:"Asia", b:"largest continent" },
              { a:"Antarctica", b:"icy and cold" },
              { a:"Africa", b:"home of the Sahara" },
              { a:"Australia", b:"island continent" },
            ] },
          { id:"u5.fun.c4", type:"tap",
            prompt:"Tap all the <b>HERBIVORES</b>",
            items:[
              { label:"cow", correct:true },
              { label:"lion", correct:false },
              { label:"rabbit", correct:true },
              { label:"shark", correct:false },
              { label:"elephant", correct:true },
              { label:"tiger", correct:false },
              { label:"deer", correct:true },
              { label:"wolf", correct:false },
            ] },
          { id:"u5.fun.c5", type:"speed",
            title:"Sprint: ×6 facts",
            seconds:7,
            questions:[
              { prompt:"6 × 4", choices:["18","22","24","28"], correct:"24" },
              { prompt:"6 × 7", choices:["36","42","48","54"], correct:"42" },
              { prompt:"6 × 9", choices:["48","54","56","63"], correct:"54" },
              { prompt:"6 × 6", choices:["30","32","36","40"], correct:"36" },
              { prompt:"6 × 8", choices:["42","46","48","56"], correct:"48" },
            ] },
          { id:"u5.fun.c6", type:"speed",
            title:"Sprint: ÷ facts",
            seconds:8,
            questions:[
              { prompt:"24 ÷ 4", choices:["4","5","6","8"], correct:"6" },
              { prompt:"30 ÷ 5", choices:["5","6","7","10"], correct:"6" },
              { prompt:"27 ÷ 3", choices:["6","7","8","9"], correct:"9" },
              { prompt:"32 ÷ 4", choices:["6","7","8","9"], correct:"8" },
              { prompt:"40 ÷ 5", choices:["6","7","8","10"], correct:"8" },
            ] },
          { id:"u5.fun.c7", type:"tap",
            prompt:"Tap the right homophone for: <i>I have ___ apples (number).</i>",
            items:[
              { label:"two", correct:true },
              { label:"to", correct:false },
              { label:"too", correct:false },
              { label:"tow", correct:false },
            ] },
          { id:"u5.fun.c8", type:"match",
            title:"Match compound words",
            pairs:[
              { a:"sun + flower", b:"sunflower" },
              { a:"foot + ball", b:"football" },
              { a:"book + worm", b:"bookworm" },
              { a:"butter + fly", b:"butterfly" },
              { a:"rain + bow", b:"rainbow" },
            ] },
          { id:"u5.fun.c9", type:"tap",
            prompt:"Tap all the <b>CARNIVORES</b> (meat-eaters)",
            items:[
              { label:"lion", correct:true },
              { label:"cow", correct:false },
              { label:"shark", correct:true },
              { label:"rabbit", correct:false },
              { label:"tiger", correct:true },
              { label:"elephant", correct:false },
              { label:"wolf", correct:true },
              { label:"deer", correct:false },
            ] },
        ]
      },

      // ---- BOSS: Cell ----
      {
        id: "u5.boss", title: "BOSS: Cell", emoji: "🟢",
        cards: [
          { id:"u5.boss.c1", type:"boss",
            name:"Cell", namePa:"ਸੈੱਲ", emoji:"🟢", hp:10,
            questions:[
              { prompt:"6 × 7 = ?", choices:["36","42","48","54"], correct:"42" },
              { prompt:"9 × 6 = ?", choices:["48","54","56","63"], correct:"54" },
              { prompt:"24 ÷ 4 = ?", choices:["4","5","6","8"], correct:"6" },
              { prompt:"258 + 134 = ?", choices:["382","392","402","482"], correct:"392" },
              { prompt:"800 − 256 = ?", choices:["534","544","554","644"], correct:"544" },
              { prompt:"Pick the right one: <i>The kids ate ___ lunch.</i>", choices:["their","there","they're","thair"], correct:"their" },
              { prompt:"<b>cooperate</b> means…", choices:["to fight","to ignore","to work together","to run away"], correct:"to work together" },
              { prompt:"Which planet is biggest?", choices:["Earth","Mars","Jupiter","Saturn"], correct:"Jupiter" },
              { prompt:"Largest ocean?", choices:["Atlantic","Pacific","Indian","Arctic"], correct:"Pacific" },
              { prompt:"Pattern: 5, 10, 15, 20, ___", choices:["22","24","25","30"], correct:"25" },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 6 — SUPER SAIYAN SAGA  (~Grade 3.0–3.5)
  // ============================================================
  {
    id: "u6", title: "Super Saiyan Saga", emoji: "🌟",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 5) ----
      {
        id: "u6.recap", title: "Chai Recap: Unit 5", emoji: "☕",
        cards: [
          { id:"u6.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Refresh from Unit 5: <b>×6, ×9, division, place value to 1000s, fractions, planets, continents.</b>" },
          { id:"u6.recap.c2", type:"mcq", prompt:"6 × 7 = ?", choices:["36","42","48","54"], correct:"42" },
          { id:"u6.recap.c3", type:"mcq", prompt:"9 × 8 = ?", choices:["63","72","81","90"], correct:"72" },
          { id:"u6.recap.c4", type:"mcq", prompt:"24 ÷ 4 = ?", choices:["4","5","6","8"], correct:"6" },
          { id:"u6.recap.c5", type:"mcq", prompt:"In <b>3,476</b>, the 4 means…", choices:["4 ones","4 tens","4 hundreds","4 thousands"], correct:"4 hundreds" },
          { id:"u6.recap.c6", type:"fill", prompt:"Half of 10 is ___ .", accept:["5","five"], choices:["5","2","10"] },
        ]
      },

      // ---- Block 1: Multiplication ×7 ----
      {
        id: "u6.b1", title: "Multiplication ×7", emoji: "✖️",
        cards: [
          { id:"u6.b1.c1", type:"intro",
            title:"The ×7 facts",
            body:"You already know ×7 from the other side: <i>7×3 = 3×7 = 21</i>. Lock these in: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70." },
          { id:"u6.b1.c2", type:"flash", front:"7 × 3 = ?", back:"<b>21</b>" },
          { id:"u6.b1.c3", type:"mcq", prompt:"7 × 4 = ?", choices:["21","24","28","32"], correct:"28" },
          { id:"u6.b1.c4", type:"mcq", prompt:"7 × 6 = ?", choices:["36","42","48","54"], correct:"42" },
          { id:"u6.b1.c5", type:"mcq", prompt:"7 × 7 = ?", choices:["42","49","56","63"], correct:"49" },
          { id:"u6.b1.c6", type:"mcq", prompt:"7 × 8 = ?", choices:["48","54","56","64"], correct:"56" },
          { id:"u6.b1.c7", type:"fill", prompt:"7 × 9 = ?", accept:["63"], choices:["63","56","72"] },
          { id:"u6.b1.c8", type:"fill", prompt:"7 × 5 = ?", accept:["35"], choices:["35","30","40"] },
        ]
      },

      // ---- Block 2: Multiplication ×8 ----
      {
        id: "u6.b2", title: "Multiplication ×8", emoji: "✖️",
        cards: [
          { id:"u6.b2.c1", type:"intro",
            title:"The ×8 facts",
            body:"Tip: <b>×8 is double of ×4</b>. So 8×6 = (4×6)+(4×6) = 24+24 = 48." },
          { id:"u6.b2.c2", type:"mcq", prompt:"8 × 3 = ?", choices:["18","21","24","27"], correct:"24" },
          { id:"u6.b2.c3", type:"mcq", prompt:"8 × 4 = ?", choices:["28","30","32","36"], correct:"32" },
          { id:"u6.b2.c4", type:"mcq", prompt:"8 × 6 = ?", choices:["42","46","48","54"], correct:"48" },
          { id:"u6.b2.c5", type:"mcq", prompt:"8 × 7 = ?", choices:["48","54","56","64"], correct:"56" },
          { id:"u6.b2.c6", type:"mcq", prompt:"8 × 8 = ?", choices:["56","60","64","72"], correct:"64" },
          { id:"u6.b2.c7", type:"fill", prompt:"8 × 9 = ?", accept:["72"], choices:["72","64","81"] },
          { id:"u6.b2.c8", type:"fill", prompt:"8 × 5 = ?", accept:["40"], choices:["40","35","45"] },
        ]
      },

      // ---- Block 3: Division ÷6 and ÷7 ----
      {
        id: "u6.b3", title: "Division ÷6 and ÷7", emoji: "➗",
        cards: [
          { id:"u6.b3.c1", type:"intro",
            title:"Division undoes multiplication",
            body:"If <b>6 × 7 = 42</b>, then <b>42 ÷ 6 = 7</b> and <b>42 ÷ 7 = 6</b>. Use the times tables backwards." },
          { id:"u6.b3.c2", type:"mcq", prompt:"24 ÷ 6 = ?", choices:["3","4","5","6"], correct:"4" },
          { id:"u6.b3.c3", type:"mcq", prompt:"36 ÷ 6 = ?", choices:["4","5","6","7"], correct:"6" },
          { id:"u6.b3.c4", type:"mcq", prompt:"54 ÷ 6 = ?", choices:["7","8","9","10"], correct:"9" },
          { id:"u6.b3.c5", type:"mcq", prompt:"28 ÷ 7 = ?", choices:["3","4","5","6"], correct:"4" },
          { id:"u6.b3.c6", type:"mcq", prompt:"49 ÷ 7 = ?", choices:["6","7","8","9"], correct:"7" },
          { id:"u6.b3.c7", type:"fill", prompt:"63 ÷ 7 = ?", accept:["9"], choices:["9","8","7"] },
        ]
      },

      // ---- Block 4: Division ÷8 and ÷9 ----
      {
        id: "u6.b4", title: "Division ÷8 and ÷9", emoji: "➗",
        cards: [
          { id:"u6.b4.c1", type:"intro",
            title:"More division facts",
            body:"Same trick: ask <i>“what times 8 (or 9) gives this?”</i> 32 ÷ 8 → think 8 × ? = 32. Answer: 4." },
          { id:"u6.b4.c2", type:"mcq", prompt:"32 ÷ 8 = ?", choices:["3","4","5","6"], correct:"4" },
          { id:"u6.b4.c3", type:"mcq", prompt:"56 ÷ 8 = ?", choices:["6","7","8","9"], correct:"7" },
          { id:"u6.b4.c4", type:"mcq", prompt:"72 ÷ 8 = ?", choices:["7","8","9","10"], correct:"9" },
          { id:"u6.b4.c5", type:"mcq", prompt:"54 ÷ 9 = ?", choices:["5","6","7","8"], correct:"6" },
          { id:"u6.b4.c6", type:"mcq", prompt:"81 ÷ 9 = ?", choices:["7","8","9","10"], correct:"9" },
          { id:"u6.b4.c7", type:"fill", prompt:"45 ÷ 9 = ?", accept:["5"], choices:["5","4","6"] },
        ]
      },

      // ---- Block 5: Place value to 10,000 + rounding ----
      {
        id: "u6.b5", title: "Place value to 10,000 + rounding", emoji: "🔢",
        cards: [
          { id:"u6.b5.c1", type:"intro",
            title:"Bigger numbers, same idea",
            body:"<b>4,375</b> = 4 thousands + 3 hundreds + 7 tens + 5 ones.<br>To <b>round</b>, look at the digit just to the right. <b>5 or more → round up</b>; <b>less than 5 → round down</b>." },
          { id:"u6.b5.c2", type:"mcq", prompt:"In <b>4,375</b>, the 4 stands for…", choices:["4 hundreds","4 thousands","4 tens","4 ones"], correct:"4 thousands" },
          { id:"u6.b5.c3", type:"mcq", prompt:"In <b>9,208</b>, the 2 stands for…", choices:["2 ones","2 tens","2 hundreds","2 thousands"], correct:"2 hundreds" },
          { id:"u6.b5.c4", type:"mcq", prompt:"Round <b>47</b> to the nearest 10:", choices:["40","45","50","60"], correct:"50" },
          { id:"u6.b5.c5", type:"mcq", prompt:"Round <b>342</b> to the nearest 100:", choices:["200","300","340","400"], correct:"300" },
          { id:"u6.b5.c6", type:"mcq", prompt:"Round <b>2,650</b> to the nearest 1000:", choices:["2,000","2,500","3,000","3,500"], correct:"3,000" },
          { id:"u6.b5.c7", type:"mcq", prompt:"Which is the BIGGEST?", choices:["4,099","4,909","4,919","4,199"], correct:"4,919" },
          { id:"u6.b5.c8", type:"fill", prompt:"Write the value of the 7 in <b>7,431</b> (number).", accept:["7000","7,000"], choices:["7000","700","7"] },
        ]
      },

      // ---- Block 6: Fractions III — equivalents & compare ----
      {
        id: "u6.b6", title: "Fractions III: equivalents & compare", emoji: "🍕",
        cards: [
          { id:"u6.b6.c1", type:"intro",
            title:"Same slice, different name",
            body:"<b>Equivalent fractions</b> are the same amount written different ways: <b>1/2 = 2/4 = 4/8</b>.<br>To compare, give them the same denominator OR think pizza slices: <b>1/3 &gt; 1/4</b> (fewer slices = bigger pieces)." },
          { id:"u6.b6.c2", type:"mcq", prompt:"Which is equal to <b>1/2</b>?", choices:["1/3","2/4","2/3","3/8"], correct:"2/4" },
          { id:"u6.b6.c3", type:"mcq", prompt:"Which is equal to <b>2/3</b>?", choices:["3/4","4/6","2/4","6/9"], correct:"4/6" },
          { id:"u6.b6.c4", type:"mcq", prompt:"Which is bigger?", choices:["1/4","1/3","both equal","can't tell"], correct:"1/3" },
          { id:"u6.b6.c5", type:"mcq", prompt:"Which is bigger?", choices:["3/4","2/4","both equal","can't tell"], correct:"3/4" },
          { id:"u6.b6.c6", type:"mcq", prompt:"Order from SMALLEST to biggest:", choices:["1/2, 1/4, 1/3","1/4, 1/3, 1/2","1/3, 1/2, 1/4","1/2, 1/3, 1/4"], correct:"1/4, 1/3, 1/2" },
          { id:"u6.b6.c7", type:"fill", prompt:"3/6 simplifies to 1/___ .", accept:["2"], choices:["2","3","6"] },
        ]
      },

      // ---- Block 7: Geometry — perimeter & area ----
      {
        id: "u6.b7", title: "Geometry: perimeter & area", emoji: "📐",
        cards: [
          { id:"u6.b7.c1", type:"intro",
            title:"Around vs inside",
            body:"<b>Perimeter</b> = the distance <i>around</i> a shape (add all the sides).<br><b>Area</b> = the space <i>inside</i> a shape. For a rectangle: <b>area = length × width</b>." },
          { id:"u6.b7.c2", type:"mcq", prompt:"Perimeter of a square with side 4?", choices:["8","12","16","20"], correct:"16" },
          { id:"u6.b7.c3", type:"mcq", prompt:"Perimeter of a rectangle 5 × 3?", choices:["8","13","15","16"], correct:"16" },
          { id:"u6.b7.c4", type:"mcq", prompt:"Area of a rectangle 5 × 3?", choices:["8","15","16","20"], correct:"15" },
          { id:"u6.b7.c5", type:"mcq", prompt:"Area of a square with side 6?", choices:["12","24","30","36"], correct:"36" },
          { id:"u6.b7.c6", type:"mcq", prompt:"Which unit measures area?", choices:["cm","cm²","kg","mL"], correct:"cm²" },
          { id:"u6.b7.c7", type:"fill", prompt:"A rectangle is 7 long and 4 wide. AREA = ___ .", accept:["28"], choices:["28","11","32"] },
        ]
      },

      // ---- Block 8: Writing — complete sentences ----
      {
        id: "u6.b8", title: "Writing: complete sentences", emoji: "✍️",
        cards: [
          { id:"u6.b8.c1", type:"intro",
            title:"What makes a sentence?",
            body:"A complete sentence has a <b>subject</b> (who/what) and a <b>verb</b> (action), and tells a complete idea.<br>It starts with a <b>capital letter</b> and ends with <b>. ? !</b>" },
          { id:"u6.b8.c2", type:"mcq", prompt:"Which is a COMPLETE sentence?", choices:["Ran very fast.","The dog.","The dog ran fast.","Fast dog the."], correct:"The dog ran fast." },
          { id:"u6.b8.c3", type:"mcq", prompt:"Which is a FRAGMENT (not complete)?", choices:["Birds sing.","Under the tree.","She sleeps.","I see a cat."], correct:"Under the tree." },
          { id:"u6.b8.c4", type:"mcq", prompt:"What is the <b>subject</b> of: <i>The little boy laughed.</i>", choices:["The","little","The little boy","laughed"], correct:"The little boy" },
          { id:"u6.b8.c5", type:"mcq", prompt:"What punctuation ends a QUESTION?", choices:[".","?","!",","], correct:"?" },
          { id:"u6.b8.c6", type:"mcq", prompt:"Which sentence is written correctly?", choices:["the cat sleeps","The cat sleeps.","the Cat sleeps.","The cat sleeps"], correct:"The cat sleeps." },
          { id:"u6.b8.c7", type:"fill", prompt:"Add a present-tense verb to make a sentence: <i>The bird ___ .</i> (one word)",
            accept:["sings","flies","sleeps","eats","chirps"],
            choices:["sings","flies","sleeps"] },
        ]
      },

      // ---- Block 9: Reading — inference ----
      {
        id: "u6.b9", title: "Reading: inference (read between the lines)", emoji: "📖",
        cards: [
          { id:"u6.b9.c1", type:"intro",
            title:"Inference = clue + your brain",
            body:"Sometimes the story doesn't TELL you the answer. You use <b>clues</b> from the text + what you already know to figure it out." },
          { id:"u6.b9.c2", type:"read",
            title:"The Wet Coat",
            passage:"Maya came inside and shook her coat. Drops of water fell on the floor. She kicked off her boots and grabbed a towel for her hair.",
            questions:[
              { prompt:"What was the WEATHER outside?", choices:["sunny","raining","snowing dry snow","very hot"], correct:"raining" },
              { prompt:"How do you KNOW it was raining?", choices:["The story says 'rain'.","Her coat dripped water and her hair was wet.","She was eating.","She wore a hat."], correct:"Her coat dripped water and her hair was wet." },
              { prompt:"How does Maya MOST LIKELY feel?", choices:["dry and warm","cold and wet","sleepy","hungry"], correct:"cold and wet" },
            ] },
          { id:"u6.b9.c3", type:"read",
            title:"The Empty Bowl",
            passage:"When Sam came home, Buddy ran to the door wagging his tail. Sam looked in the kitchen. The food bowl was empty and turned over on the floor. Crumbs were everywhere.",
            questions:[
              { prompt:"Who is Buddy MOST LIKELY?", choices:["a baby","a dog","a fish","a teacher"], correct:"a dog" },
              { prompt:"What probably happened to the food?", choices:["It vanished","Buddy ate it","Sam ate it","It was never there"], correct:"Buddy ate it" },
            ] },
        ]
      },

      // ---- Block 10: Compare & contrast ----
      {
        id: "u6.b10", title: "Compare & contrast", emoji: "🔍",
        cards: [
          { id:"u6.b10.c1", type:"intro",
            title:"Same vs different",
            body:"<b>Compare</b> = how things are the <b>same</b>.<br><b>Contrast</b> = how things are <b>different</b>.<br>Words that signal compare: <i>both, also, alike, similar</i>. Signal contrast: <i>but, however, unlike, on the other hand</i>." },
          { id:"u6.b10.c2", type:"mcq", prompt:"Which word signals CONTRAST?", choices:["also","both","but","alike"], correct:"but" },
          { id:"u6.b10.c3", type:"mcq", prompt:"Cats and dogs are alike because they are…", choices:["both fish","both pets","both cars","both colors"], correct:"both pets" },
          { id:"u6.b10.c4", type:"mcq", prompt:"Cats and dogs are different because…", choices:["dogs bark, cats meow","both have fur","both have tails","both are pets"], correct:"dogs bark, cats meow" },
          { id:"u6.b10.c5", type:"mcq", prompt:"Apples and bananas are alike: both are…", choices:["red","fruits","vegetables","drinks"], correct:"fruits" },
          { id:"u6.b10.c6", type:"mcq", prompt:"Which sentence COMPARES (shows same)?", choices:["A car is fast, but a bike is slow.","Both cars and bikes have wheels.","Cars use gas, bikes don't.","A car is bigger than a bike."], correct:"Both cars and bikes have wheels." },
        ]
      },

      // ---- Block 11: Geography II — oceans, mountains, deserts ----
      {
        id: "u6.b11", title: "Geography II: oceans, mountains, deserts", emoji: "🌍",
        cards: [
          { id:"u6.b11.c1", type:"intro",
            title:"Earth's big features",
            body:"Earth has <b>5 oceans</b> (Pacific, Atlantic, Indian, Arctic, Southern), tall <b>mountains</b> (highest: Mount Everest), and dry <b>deserts</b> (largest hot desert: the Sahara)." },
          { id:"u6.b11.c2", type:"mcq", prompt:"Largest ocean?", choices:["Atlantic","Pacific","Indian","Arctic"], correct:"Pacific" },
          { id:"u6.b11.c3", type:"mcq", prompt:"Highest mountain on Earth?", choices:["K2","Mount Everest","Kilimanjaro","Mount Fuji"], correct:"Mount Everest" },
          { id:"u6.b11.c4", type:"mcq", prompt:"The Sahara is a famous…", choices:["ocean","river","desert","mountain"], correct:"desert" },
          { id:"u6.b11.c5", type:"mcq", prompt:"Longest river in the world (most accept)?", choices:["Amazon","Mississippi","Nile","Ganges"], correct:"Nile" },
          { id:"u6.b11.c6", type:"mcq", prompt:"Which ocean is between Africa and Australia?", choices:["Pacific","Atlantic","Indian","Arctic"], correct:"Indian" },
          { id:"u6.b11.c7", type:"fill", prompt:"How many oceans on Earth? (number)", accept:["5","five"], choices:["5","4","7"] },
        ]
      },

      // ---- Block 12: Civics — rights, rules, community ----
      {
        id: "u6.b12", title: "Civics: rights, rules, community", emoji: "🏛️",
        cards: [
          { id:"u6.b12.c1", type:"intro",
            title:"Living together",
            body:"A <b>community</b> is a group that lives, works, or plays together. <b>Rules and laws</b> keep us safe and fair. A <b>right</b> is something you are free to have or do." },
          { id:"u6.b12.c2", type:"mcq", prompt:"A LAW is…", choices:["a fun game","a rule everyone must follow","a kind of food","a school subject"], correct:"a rule everyone must follow" },
          { id:"u6.b12.c3", type:"mcq", prompt:"Why do we have rules at school?", choices:["to make us bored","to keep us safe and learning","to slow us down","because teachers like rules"], correct:"to keep us safe and learning" },
          { id:"u6.b12.c4", type:"mcq", prompt:"Which is a RIGHT in many countries?", choices:["the right to lie","the right to learn","the right to break rules","the right to take others' things"], correct:"the right to learn" },
          { id:"u6.b12.c5", type:"mcq", prompt:"A person who helps the community as a job is a…", choices:["customer","community helper","tourist","stranger"], correct:"community helper" },
          { id:"u6.b12.c6", type:"mcq", prompt:"Which is a community helper?", choices:["a movie character","a firefighter","a cartoon","a robot toy"], correct:"a firefighter" },
        ]
      },

      // ---- Block 13: Science — water cycle & weather ----
      {
        id: "u6.b13", title: "Science: water cycle & weather", emoji: "🌧️",
        cards: [
          { id:"u6.b13.c1", type:"intro",
            title:"Water goes around",
            body:"The <b>water cycle</b>: the sun heats water (<b>evaporation</b>) → water vapor cools into clouds (<b>condensation</b>) → drops fall as rain or snow (<b>precipitation</b>) → water flows back to lakes/oceans (<b>collection</b>). Repeat forever!" },
          { id:"u6.b13.c2", type:"mcq", prompt:"When the sun heats water and it turns to vapor, that's…", choices:["condensation","evaporation","precipitation","collection"], correct:"evaporation" },
          { id:"u6.b13.c3", type:"mcq", prompt:"Water vapor cooling to form clouds is…", choices:["evaporation","condensation","precipitation","melting"], correct:"condensation" },
          { id:"u6.b13.c4", type:"mcq", prompt:"Rain, snow, sleet, and hail are all…", choices:["clouds","evaporation","precipitation","wind"], correct:"precipitation" },
          { id:"u6.b13.c5", type:"mcq", prompt:"A tool that measures temperature is a…", choices:["ruler","thermometer","scale","compass"], correct:"thermometer" },
          { id:"u6.b13.c6", type:"mcq", prompt:"A long time without rain is a…", choices:["flood","drought","blizzard","hurricane"], correct:"drought" },
          { id:"u6.b13.c7", type:"fill", prompt:"The big star that powers the water cycle is the ___ .", accept:["sun","Sun"], choices:["sun","moon","cloud"] },
        ]
      },

      // ---- Block 14: Body systems ----
      {
        id: "u6.b14", title: "Science: body systems", emoji: "🫀",
        cards: [
          { id:"u6.b14.c1", type:"intro",
            title:"Your amazing body",
            body:"Your body has systems that work together: the <b>skeletal</b> system (bones), <b>muscular</b> (muscles), <b>circulatory</b> (heart + blood), <b>respiratory</b> (lungs + breathing), <b>digestive</b> (stomach + food), and <b>nervous</b> (brain + nerves)." },
          { id:"u6.b14.c2", type:"mcq", prompt:"Which organ pumps your blood?", choices:["lungs","heart","brain","liver"], correct:"heart" },
          { id:"u6.b14.c3", type:"mcq", prompt:"Which organs help you BREATHE?", choices:["lungs","stomach","kidneys","muscles"], correct:"lungs" },
          { id:"u6.b14.c4", type:"mcq", prompt:"Which body system gives your body its SHAPE and protects organs?", choices:["digestive","skeletal","nervous","muscular"], correct:"skeletal" },
          { id:"u6.b14.c5", type:"mcq", prompt:"Your BRAIN is the boss of which system?", choices:["digestive","circulatory","nervous","respiratory"], correct:"nervous" },
          { id:"u6.b14.c6", type:"mcq", prompt:"Which organ breaks down the food you eat?", choices:["heart","lungs","stomach","brain"], correct:"stomach" },
          { id:"u6.b14.c7", type:"fill", prompt:"The system that lets you move using bones + ___ is the muscular system.", accept:["muscles"], choices:["muscles","skin","bones"] },
        ]
      },

      // ---- Block 15: Academic vocabulary ----
      {
        id: "u6.b15", title: "Academic vocabulary", emoji: "📚",
        cards: [
          { id:"u6.b15.c1", type:"intro",
            title:"Big-kid words",
            body:"These words show up in books, tests, and everywhere. Learn them once and they help you everywhere: <b>describe, explain, predict, summarize, identify, compare, evidence</b>." },
          { id:"u6.b15.c2", type:"mcq", prompt:"To <b>predict</b> means to…", choices:["repeat what happened","guess what will happen next","describe colors","add numbers"], correct:"guess what will happen next" },
          { id:"u6.b15.c3", type:"mcq", prompt:"To <b>summarize</b> means to…", choices:["copy every word","tell the main idea in a few words","draw a picture","ask a question"], correct:"tell the main idea in a few words" },
          { id:"u6.b15.c4", type:"mcq", prompt:"<b>Evidence</b> is…", choices:["a guess","facts or proof that show something","a feeling","a story character"], correct:"facts or proof that show something" },
          { id:"u6.b15.c5", type:"mcq", prompt:"To <b>identify</b> means to…", choices:["change","name or point out","forget","argue"], correct:"name or point out" },
          { id:"u6.b15.c6", type:"mcq", prompt:"To <b>describe</b> a thing means to…", choices:["count it","tell what it is like","throw it away","draw it tiny"], correct:"tell what it is like" },
        ]
      },

      // ---- Block 16: 🏟️ Champion's Arena II (mini-games) ----
      {
        id: "u6.fun", title: "Champion's Arena II 🎮", emoji: "🏟️",
        cards: [
          { id:"u6.fun.c1", type:"intro",
            title:"🏟️ Champion's Arena II!",
            body:"Last warm-up before Buu. Mini-games across this whole unit. Show no mercy!" },
          { id:"u6.fun.c2", type:"speed",
            title:"Sprint: ×7 facts",
            seconds:7,
            questions:[
              { prompt:"7 × 4", choices:["21","24","28","32"], correct:"28" },
              { prompt:"7 × 6", choices:["36","42","48","54"], correct:"42" },
              { prompt:"7 × 8", choices:["48","54","56","64"], correct:"56" },
              { prompt:"7 × 9", choices:["56","63","70","72"], correct:"63" },
              { prompt:"7 × 7", choices:["42","49","56","63"], correct:"49" },
            ] },
          { id:"u6.fun.c3", type:"speed",
            title:"Sprint: ×8 facts",
            seconds:7,
            questions:[
              { prompt:"8 × 3", choices:["18","24","27","32"], correct:"24" },
              { prompt:"8 × 6", choices:["42","46","48","54"], correct:"48" },
              { prompt:"8 × 7", choices:["48","54","56","64"], correct:"56" },
              { prompt:"8 × 8", choices:["56","60","64","72"], correct:"64" },
              { prompt:"8 × 9", choices:["63","70","72","80"], correct:"72" },
            ] },
          { id:"u6.fun.c4", type:"match",
            title:"Match equivalent fractions",
            pairs:[
              { a:"1/2", b:"2/4" },
              { a:"1/3", b:"2/6" },
              { a:"2/3", b:"4/6" },
              { a:"3/4", b:"6/8" },
              { a:"1/4", b:"2/8" },
            ] },
          { id:"u6.fun.c5", type:"tap",
            prompt:"Tap all the <b>complete sentences</b>",
            items:[
              { label:"The sun is bright.", correct:true },
              { label:"Under the tall tree.", correct:false },
              { label:"My dog barks loudly.", correct:true },
              { label:"Running very fast.", correct:false },
              { label:"Birds sing in spring.", correct:true },
              { label:"With my friend.", correct:false },
            ] },
          { id:"u6.fun.c6", type:"match",
            title:"Match body system → organ",
            pairs:[
              { a:"circulatory", b:"heart" },
              { a:"respiratory", b:"lungs" },
              { a:"nervous", b:"brain" },
              { a:"digestive", b:"stomach" },
              { a:"skeletal", b:"bones" },
            ] },
          { id:"u6.fun.c7", type:"tap",
            prompt:"Tap all the OCEANS",
            items:[
              { label:"Pacific", correct:true },
              { label:"Sahara", correct:false },
              { label:"Atlantic", correct:true },
              { label:"Everest", correct:false },
              { label:"Indian", correct:true },
              { label:"Nile", correct:false },
              { label:"Arctic", correct:true },
              { label:"Asia", correct:false },
            ] },
          { id:"u6.fun.c8", type:"speed",
            title:"Sprint: ÷6, ÷7, ÷8, ÷9",
            seconds:9,
            questions:[
              { prompt:"36 ÷ 6", choices:["5","6","7","8"], correct:"6" },
              { prompt:"49 ÷ 7", choices:["6","7","8","9"], correct:"7" },
              { prompt:"64 ÷ 8", choices:["6","7","8","9"], correct:"8" },
              { prompt:"81 ÷ 9", choices:["7","8","9","10"], correct:"9" },
              { prompt:"54 ÷ 6", choices:["7","8","9","10"], correct:"9" },
            ] },
        ]
      },

      // ---- BOSS: Buu ----
      {
        id: "u6.boss", title: "BOSS: Majin Buu", emoji: "👹",
        cards: [
          { id:"u6.boss.c1", type:"boss",
            name:"Majin Buu", namePa:"ਮਾਜਿਨ ਬੂ", emoji:"👹", hp:12,
            questions:[
              { prompt:"7 × 8 = ?", choices:["48","54","56","64"], correct:"56" },
              { prompt:"8 × 9 = ?", choices:["63","70","72","80"], correct:"72" },
              { prompt:"56 ÷ 7 = ?", choices:["6","7","8","9"], correct:"8" },
              { prompt:"72 ÷ 8 = ?", choices:["7","8","9","10"], correct:"9" },
              { prompt:"In <b>5,628</b>, the 5 means…", choices:["5 hundreds","5 thousands","5 tens","5 ones"], correct:"5 thousands" },
              { prompt:"Round <b>362</b> to the nearest 100:", choices:["300","350","360","400"], correct:"400" },
              { prompt:"Which is bigger?", choices:["1/3","1/4","1/5","all equal"], correct:"1/3" },
              { prompt:"Area of a 6×4 rectangle?", choices:["10","20","24","28"], correct:"24" },
              { prompt:"Which is a COMPLETE sentence?", choices:["Under the bridge.","The boy ran home.","Running fast.","After lunch yesterday."], correct:"The boy ran home." },
              { prompt:"To <b>predict</b> means to…", choices:["repeat","guess what comes next","forget","draw"], correct:"guess what comes next" },
              { prompt:"Which organ pumps blood?", choices:["lungs","heart","brain","stomach"], correct:"heart" },
              { prompt:"Largest ocean on Earth?", choices:["Atlantic","Pacific","Indian","Arctic"], correct:"Pacific" },
            ] }
        ]
      }
    ]
  },

  // ============================================================
  // UNIT 7 — TOURNAMENT OF POWER  (~Grade 3.5)
  // ============================================================
  {
    id: "u7", title: "Tournament of Power", emoji: "🏆",
    blocks: [

      // ---- Block 0: ☕ Chai Recap (from Unit 6) ----
      {
        id: "u7.recap", title: "Chai Recap: Unit 6", emoji: "☕",
        cards: [
          { id:"u7.recap.c1", type:"intro",
            title:"☕ Chai Recap",
            body:"Quick refresh from Unit 6: <b>×7, ×8, division, place value to 10,000, equivalent fractions, area, body systems, water cycle.</b>" },
          { id:"u7.recap.c2", type:"mcq", prompt:"7 × 8 = ?", choices:["48","54","56","64"], correct:"56" },
          { id:"u7.recap.c3", type:"mcq", prompt:"72 ÷ 8 = ?", choices:["7","8","9","10"], correct:"9" },
          { id:"u7.recap.c4", type:"mcq", prompt:"Which equals <b>1/2</b>?", choices:["1/3","2/4","2/3","3/8"], correct:"2/4" },
          { id:"u7.recap.c5", type:"mcq", prompt:"Area of a 6×3 rectangle?", choices:["9","12","15","18"], correct:"18" },
          { id:"u7.recap.c6", type:"mcq", prompt:"Round <b>473</b> to the nearest 100:", choices:["400","450","470","500"], correct:"500" },
        ]
      },

      // ---- Block 1: ×11 and ×12 ----
      {
        id: "u7.b1", title: "Multiplication ×11 and ×12", emoji: "✖️",
        cards: [
          { id:"u7.b1.c1", type:"intro",
            title:"Two more times tables",
            body:"<b>×11 trick</b> (single digits): just <i>repeat</i> the digit. 11×3 = 33, 11×7 = 77.<br><b>×12 trick</b>: ×10 + ×2. So 12×4 = 40+8 = 48." },
          { id:"u7.b1.c2", type:"mcq", prompt:"11 × 4 = ?", choices:["33","44","48","55"], correct:"44" },
          { id:"u7.b1.c3", type:"mcq", prompt:"11 × 7 = ?", choices:["66","77","81","88"], correct:"77" },
          { id:"u7.b1.c4", type:"mcq", prompt:"12 × 3 = ?", choices:["24","32","36","48"], correct:"36" },
          { id:"u7.b1.c5", type:"mcq", prompt:"12 × 5 = ?", choices:["50","55","60","65"], correct:"60" },
          { id:"u7.b1.c6", type:"mcq", prompt:"12 × 8 = ?", choices:["86","88","96","108"], correct:"96" },
          { id:"u7.b1.c7", type:"fill", prompt:"12 × 12 = ?", accept:["144"], choices:["144","124","154"] },
          { id:"u7.b1.c8", type:"fill", prompt:"11 × 11 = ?", accept:["121"], choices:["121","111","131"] },
        ]
      },

      // ---- Block 2: Multi-step word problems ----
      {
        id: "u7.b2", title: "Word problems (multi-step)", emoji: "🧩",
        cards: [
          { id:"u7.b2.c1", type:"intro",
            title:"Read it. Plan it. Solve it.",
            body:"Word problems test reading + math. Steps:<br>1) <b>Read</b> twice. 2) Find the <b>numbers</b> and the <b>question</b>. 3) Decide <b>+ − × ÷</b>. 4) Solve. 5) Check it <i>makes sense</i>." },
          { id:"u7.b2.c2", type:"mcq", prompt:"There are 4 boxes with 6 apples each. How many apples in all?", choices:["10","18","24","30"], correct:"24" },
          { id:"u7.b2.c3", type:"mcq", prompt:"You have 20 stickers. You give 8 away and your friend gives you 5 more. How many now?", choices:["13","17","23","25"], correct:"17" },
          { id:"u7.b2.c4", type:"mcq", prompt:"A book has 96 pages. Sam reads 12 pages a day. How many DAYS to finish?", choices:["6","7","8","9"], correct:"8" },
          { id:"u7.b2.c5", type:"mcq", prompt:"A class of 28 kids splits into 4 equal teams. How many on each team?", choices:["6","7","8","9"], correct:"7" },
          { id:"u7.b2.c6", type:"mcq", prompt:"A pencil costs 25¢. How many pencils can you buy with $1.00?", choices:["2","3","4","5"], correct:"4" },
          { id:"u7.b2.c7", type:"mcq", prompt:"School starts at 8:30. Recess is 2 hours 15 minutes later. What time is recess?", choices:["10:15","10:30","10:45","11:00"], correct:"10:45" },
          { id:"u7.b2.c8", type:"fill", prompt:"6 packs of 8 cookies = ___ cookies (number).", accept:["48"], choices:["48","42","56"] },
        ]
      },

      // ---- Block 3: Decimals intro (tenths) ----
      {
        id: "u7.b3", title: "Decimals: tenths", emoji: "🔢",
        cards: [
          { id:"u7.b3.c1", type:"intro",
            title:"What is a decimal?",
            body:"A <b>decimal</b> shows part of a whole using a dot.<br><b>0.1</b> = 1 tenth = <b>1/10</b>. <b>0.5</b> = 5 tenths = <b>1/2</b>.<br>The dot is the <b>decimal point</b>. The first digit after it is the <b>tenths place</b>." },
          { id:"u7.b3.c2", type:"mcq", prompt:"<b>0.1</b> is the same as…", choices:["1/100","1/10","1","10"], correct:"1/10" },
          { id:"u7.b3.c3", type:"mcq", prompt:"<b>0.5</b> is the same as…", choices:["1/2","1/5","5","50"], correct:"1/2" },
          { id:"u7.b3.c4", type:"mcq", prompt:"Which is BIGGER?", choices:["0.3","0.7","both equal","can't tell"], correct:"0.7" },
          { id:"u7.b3.c5", type:"mcq", prompt:"Write 7/10 as a decimal:", choices:["0.07","0.7","7.0","70"], correct:"0.7" },
          { id:"u7.b3.c6", type:"mcq", prompt:"Order from SMALLEST to biggest:", choices:["0.2, 0.6, 0.4","0.6, 0.4, 0.2","0.2, 0.4, 0.6","0.4, 0.2, 0.6"], correct:"0.2, 0.4, 0.6" },
          { id:"u7.b3.c7", type:"fill", prompt:"Write 3/10 as a decimal:", accept:["0.3",".3"], choices:["0.3","3.0","0.03"] },
        ]
      },

      // ---- Block 4: Data — bar graphs & pictographs ----
      {
        id: "u7.b4", title: "Data: bar graphs & pictographs", emoji: "📊",
        cards: [
          { id:"u7.b4.c1", type:"intro",
            title:"Reading the picture",
            body:"A <b>bar graph</b> uses bars; longer bar = more.<br>A <b>pictograph</b> uses pictures; each picture stands for a number (the <b>key</b>).<br>Always read the <b>title</b>, <b>labels</b>, and <b>key</b> first." },
          { id:"u7.b4.c2", type:"mcq",
            prompt:"🍎=4 apples. If a row has 🍎🍎🍎, how many apples?",
            choices:["3","7","12","14"], correct:"12" },
          { id:"u7.b4.c3", type:"mcq",
            prompt:"In a bar graph, a TALLER bar means…",
            choices:["fewer","more","same","none"], correct:"more" },
          { id:"u7.b4.c4", type:"mcq",
            prompt:"Cats:8 Dogs:5 Birds:3. How many pets in total?",
            choices:["13","15","16","18"], correct:"16" },
          { id:"u7.b4.c5", type:"mcq",
            prompt:"Cats:8 Dogs:5 Birds:3. How many MORE cats than birds?",
            choices:["3","4","5","6"], correct:"5" },
          { id:"u7.b4.c6", type:"mcq",
            prompt:"⭐=2 votes. Mia got ⭐⭐⭐⭐. How many votes?",
            choices:["4","6","8","10"], correct:"8" },
          { id:"u7.b4.c7", type:"mcq",
            prompt:"What part of a graph TELLS you what 1 picture is worth?",
            choices:["title","key","bar","label"], correct:"key" },
        ]
      },

      // ---- Block 5: 3D shapes ----
      {
        id: "u7.b5", title: "3D shapes (solids)", emoji: "🧊",
        cards: [
          { id:"u7.b5.c1", type:"intro",
            title:"Shapes you can hold",
            body:"<b>3D shapes</b> have <i>length, width, AND height</i>. Common ones:<br>• <b>Cube</b> (dice)<br>• <b>Sphere</b> (ball)<br>• <b>Cone</b> (party hat / ice-cream cone)<br>• <b>Cylinder</b> (soup can)<br>• <b>Pyramid</b> (Egyptian pyramid)" },
          { id:"u7.b5.c2", type:"mcq", prompt:"A soccer ball is most like a…", choices:["cube","sphere","cone","cylinder"], correct:"sphere" },
          { id:"u7.b5.c3", type:"mcq", prompt:"A soup can is most like a…", choices:["cube","sphere","cone","cylinder"], correct:"cylinder" },
          { id:"u7.b5.c4", type:"mcq", prompt:"A dice (number cube) is a…", choices:["cube","sphere","pyramid","cone"], correct:"cube" },
          { id:"u7.b5.c5", type:"mcq", prompt:"How many <b>faces</b> does a cube have?", choices:["4","6","8","12"], correct:"6" },
          { id:"u7.b5.c6", type:"mcq", prompt:"An ice-cream cone shape is a…", choices:["cube","sphere","cone","cylinder"], correct:"cone" },
        ]
      },

      // ---- Block 6: Symmetry ----
      {
        id: "u7.b6", title: "Symmetry", emoji: "🪞",
        cards: [
          { id:"u7.b6.c1", type:"intro",
            title:"Mirror, mirror",
            body:"A shape has <b>line symmetry</b> if you can fold it in half and both sides match exactly. The fold line is the <b>line of symmetry</b>." },
          { id:"u7.b6.c2", type:"mcq", prompt:"Which letter has a vertical line of symmetry?", choices:["F","G","A","R"], correct:"A" },
          { id:"u7.b6.c3", type:"mcq", prompt:"Which letter has a HORIZONTAL line of symmetry?", choices:["A","B","P","M"], correct:"B" },
          { id:"u7.b6.c4", type:"mcq", prompt:"How many lines of symmetry does a SQUARE have?", choices:["1","2","4","8"], correct:"4" },
          { id:"u7.b6.c5", type:"mcq", prompt:"A circle has how many lines of symmetry?", choices:["1","4","8","infinitely many"], correct:"infinitely many" },
        ]
      },

      // ---- Block 7: Synonyms & antonyms ----
      {
        id: "u7.b7", title: "Synonyms & antonyms", emoji: "🔁",
        cards: [
          { id:"u7.b7.c1", type:"intro",
            title:"Same vs opposite",
            body:"<b>Synonyms</b> = words that mean the <b>same</b> (big & large).<br><b>Antonyms</b> = words that mean the <b>opposite</b> (big & small).<br>Tip: <i>SYN</i> = Same, <i>ANT</i> = Against." },
          { id:"u7.b7.c2", type:"mcq", prompt:"Which is a SYNONYM of <b>happy</b>?", choices:["sad","glad","angry","tired"], correct:"glad" },
          { id:"u7.b7.c3", type:"mcq", prompt:"Which is an ANTONYM of <b>fast</b>?", choices:["quick","speedy","slow","rapid"], correct:"slow" },
          { id:"u7.b7.c4", type:"mcq", prompt:"Which is a SYNONYM of <b>small</b>?", choices:["large","tiny","huge","tall"], correct:"tiny" },
          { id:"u7.b7.c5", type:"mcq", prompt:"Which is an ANTONYM of <b>begin</b>?", choices:["start","open","end","go"], correct:"end" },
          { id:"u7.b7.c6", type:"mcq", prompt:"Pick the SYNONYM of <b>shout</b>:", choices:["whisper","yell","sing","cry"], correct:"yell" },
          { id:"u7.b7.c7", type:"fill", prompt:"Antonym of <b>hot</b> is ___ .", accept:["cold","cool","chilly"], choices:["cold","warm","wet"] },
        ]
      },

      // ---- Block 8: Homophones ----
      {
        id: "u7.b8", title: "Homophones (sound-alikes)", emoji: "👯",
        cards: [
          { id:"u7.b8.c1", type:"intro",
            title:"Same sound, different word",
            body:"<b>Homophones</b> sound the same but are spelled differently and mean different things.<br>• <b>their</b> (belongs to them) / <b>there</b> (a place) / <b>they're</b> (they are)<br>• <b>to</b> / <b>too</b> (also / very) / <b>two</b> (2)<br>• <b>your</b> (belongs to you) / <b>you're</b> (you are)" },
          { id:"u7.b8.c2", type:"mcq", prompt:"Pick the right word: <i>I have ___ apples.</i>", choices:["to","too","two","tu"], correct:"two" },
          { id:"u7.b8.c3", type:"mcq", prompt:"<i>That book is ___, not mine.</i>", choices:["there","their","they're","theyre"], correct:"their" },
          { id:"u7.b8.c4", type:"mcq", prompt:"<i>It is too cold over ___ .</i>", choices:["their","they're","there","thare"], correct:"there" },
          { id:"u7.b8.c5", type:"mcq", prompt:"<i>___ going to love this!</i>", choices:["Their","There","They're","Theyre"], correct:"They're" },
          { id:"u7.b8.c6", type:"mcq", prompt:"<i>Is this ___ pencil?</i>", choices:["your","you're","yore","you"], correct:"your" },
          { id:"u7.b8.c7", type:"mcq", prompt:"<i>I want ice cream ___ !</i>", choices:["to","too","two","tu"], correct:"too" },
        ]
      },

      // ---- Block 9: Punctuation — commas, apostrophes, contractions ----
      {
        id: "u7.b9", title: "Punctuation: commas & contractions", emoji: "✂️",
        cards: [
          { id:"u7.b9.c1", type:"intro",
            title:"Tiny marks, big help",
            body:"<b>Comma (,)</b> in a list: I bought apples<b>,</b> bread<b>,</b> and milk.<br><b>Apostrophe (')</b> shows missing letters: do not → <b>don't</b> ; I am → <b>I'm</b>.<br><b>Contractions</b>: it is → it's ; can not → can't ; we are → we're." },
          { id:"u7.b9.c2", type:"mcq", prompt:"<b>can't</b> is short for…", choices:["can it","cannot","can to","can't"], correct:"cannot" },
          { id:"u7.b9.c3", type:"mcq", prompt:"<b>I'm</b> is short for…", choices:["I am","I will","I had","I would"], correct:"I am" },
          { id:"u7.b9.c4", type:"mcq", prompt:"Which sentence uses commas correctly in a list?", choices:["I like apples bananas grapes.","I like apples, bananas, and grapes.","I like, apples bananas grapes.","I, like apples bananas, grapes."], correct:"I like apples, bananas, and grapes." },
          { id:"u7.b9.c5", type:"mcq", prompt:"<b>we're</b> is short for…", choices:["we will","we are","were","where"], correct:"we are" },
          { id:"u7.b9.c6", type:"mcq", prompt:"<b>didn't</b> is short for…", choices:["did it","do not","did not","does not"], correct:"did not" },
          { id:"u7.b9.c7", type:"fill", prompt:"Make a contraction: <b>they are</b> → ___ .", accept:["they're","theyre"], choices:["they're","theyr'e","theyre'"] },
        ]
      },

      // ---- Block 10: Story elements + main idea ----
      {
        id: "u7.b10", title: "Story elements + main idea", emoji: "📚",
        cards: [
          { id:"u7.b10.c1", type:"intro",
            title:"Inside every story",
            body:"Every story has:<br>• <b>Characters</b> – who is in it<br>• <b>Setting</b> – where & when<br>• <b>Plot</b> – what happens (beginning, middle, end)<br>• <b>Main idea</b> – what the story is MOSTLY about<br>• <b>Detail</b> – a small fact that supports the main idea" },
          { id:"u7.b10.c2", type:"mcq", prompt:"The PEOPLE or animals in a story are called…", choices:["setting","plot","characters","details"], correct:"characters" },
          { id:"u7.b10.c3", type:"mcq", prompt:"WHERE and WHEN a story happens is the…", choices:["plot","setting","character","theme"], correct:"setting" },
          { id:"u7.b10.c4", type:"mcq", prompt:"The order of events in a story is the…", choices:["setting","plot","title","author"], correct:"plot" },
          { id:"u7.b10.c5", type:"mcq", prompt:"<i>Story: A girl learns to ride a bike. She falls, tries again, and finally rides!</i><br>What is the MAIN IDEA?", choices:["Bikes are red.","She learns to ride a bike with practice.","She fell once.","Helmets are safe."], correct:"She learns to ride a bike with practice." },
          { id:"u7.b10.c6", type:"mcq", prompt:"<i>Same story.</i> Which sentence is a DETAIL (not main idea)?", choices:["She learned to ride a bike.","She fell at first.","Riding takes practice.","She succeeded."], correct:"She fell at first." },
          { id:"u7.b10.c7", type:"mcq", prompt:"What part comes LAST in a plot?", choices:["beginning","middle","end","setting"], correct:"end" },
        ]
      },

      // ---- Block 11: Author's purpose (PIE) ----
      {
        id: "u7.b11", title: "Author's purpose (P.I.E.)", emoji: "🥧",
        cards: [
          { id:"u7.b11.c1", type:"intro",
            title:"Why did the author write it?",
            body:"Three big reasons — remember <b>P.I.E.</b>:<br>• <b>P</b>ersuade – tries to convince you<br>• <b>I</b>nform – teaches you facts<br>• <b>E</b>ntertain – tells a fun story or poem" },
          { id:"u7.b11.c2", type:"mcq", prompt:"A funny story about a flying dog is mostly written to…", choices:["persuade","inform","entertain","scare"], correct:"entertain" },
          { id:"u7.b11.c3", type:"mcq", prompt:"A book chapter titled <i>“How Volcanoes Work”</i> is mostly written to…", choices:["persuade","inform","entertain","sell"], correct:"inform" },
          { id:"u7.b11.c4", type:"mcq", prompt:"A poster that says <i>“Vote YES on more recess time!”</i> is written to…", choices:["persuade","inform","entertain","calm"], correct:"persuade" },
          { id:"u7.b11.c5", type:"mcq", prompt:"What does the <b>I</b> in P.I.E. stand for?", choices:["Imagine","Inform","Invent","Insist"], correct:"Inform" },
        ]
      },

      // ---- Block 12: States of matter ----
      {
        id: "u7.b12", title: "Science: states of matter", emoji: "💧",
        cards: [
          { id:"u7.b12.c1", type:"intro",
            title:"Solid, liquid, gas",
            body:"All things are made of <b>matter</b>. Matter has 3 main states:<br>• <b>Solid</b> – holds its shape (ice, rock)<br>• <b>Liquid</b> – takes the shape of its container (water, milk)<br>• <b>Gas</b> – fills any space (air, steam)<br>Heat can change them: ice → water → steam." },
          { id:"u7.b12.c2", type:"mcq", prompt:"A rock is a…", choices:["solid","liquid","gas","plasma"], correct:"solid" },
          { id:"u7.b12.c3", type:"mcq", prompt:"Air is a…", choices:["solid","liquid","gas","mix"], correct:"gas" },
          { id:"u7.b12.c4", type:"mcq", prompt:"When ice melts, it becomes a…", choices:["solid","liquid","gas","powder"], correct:"liquid" },
          { id:"u7.b12.c5", type:"mcq", prompt:"When water boils, it turns into…", choices:["ice","liquid","steam (gas)","oil"], correct:"steam (gas)" },
          { id:"u7.b12.c6", type:"mcq", prompt:"Which one TAKES the shape of its container?", choices:["solid","liquid","none","both solid and gas"], correct:"liquid" },
          { id:"u7.b12.c7", type:"fill", prompt:"Ice is the ___ form of water.", accept:["solid"], choices:["solid","liquid","gas"] },
        ]
      },

      // ---- Block 13: Life cycles ----
      {
        id: "u7.b13", title: "Science: life cycles", emoji: "🐛",
        cards: [
          { id:"u7.b13.c1", type:"intro",
            title:"From start to grown-up",
            body:"Living things go through a <b>life cycle</b> – the stages they grow through.<br>• <b>Butterfly</b>: egg → caterpillar → chrysalis → butterfly<br>• <b>Frog</b>: egg → tadpole → froglet → frog<br>• <b>Plant</b>: seed → sprout → plant → flower → seeds again" },
          { id:"u7.b13.c2", type:"mcq", prompt:"A baby butterfly is called a…", choices:["pup","tadpole","caterpillar","kit"], correct:"caterpillar" },
          { id:"u7.b13.c3", type:"mcq", prompt:"A baby frog is called a…", choices:["chick","tadpole","fawn","cub"], correct:"tadpole" },
          { id:"u7.b13.c4", type:"mcq", prompt:"What stage comes BETWEEN caterpillar and butterfly?", choices:["egg","chrysalis","cocoon worm","seed"], correct:"chrysalis" },
          { id:"u7.b13.c5", type:"mcq", prompt:"A plant's life cycle starts with a…", choices:["leaf","root","seed","flower"], correct:"seed" },
          { id:"u7.b13.c6", type:"mcq", prompt:"What do FLOWERS make so the cycle can start again?", choices:["leaves","roots","seeds","stems"], correct:"seeds" },
        ]
      },

      // ---- Block 14: Habitats & food chains ----
      {
        id: "u7.b14", title: "Habitats & food chains", emoji: "☕",
        cards: [
          { id:"u7.b14.c1", type:"intro",
            title:"Who eats what",
            body:"A <b>habitat</b> is the home where a plant or animal lives.<br>A <b>food chain</b> shows who eats whom: <b>sun → plant → plant-eater → meat-eater</b>.<br>• <b>Producer</b> = plant (makes its own food)<br>• <b>Consumer</b> = animal (eats other living things)<br>• <b>Herbivore</b> eats plants. <b>Carnivore</b> eats meat. <b>Omnivore</b> eats both." },
          { id:"u7.b14.c2", type:"mcq", prompt:"A camel's habitat is…", choices:["ocean","desert","rainforest","arctic"], correct:"desert" },
          { id:"u7.b14.c3", type:"mcq", prompt:"A polar bear's habitat is…", choices:["desert","jungle","arctic","river"], correct:"arctic" },
          { id:"u7.b14.c4", type:"mcq", prompt:"In a food chain, plants are the…", choices:["consumers","producers","decomposers","predators"], correct:"producers" },
          { id:"u7.b14.c5", type:"mcq", prompt:"An animal that eats ONLY plants is called…", choices:["carnivore","herbivore","omnivore","predator"], correct:"herbivore" },
          { id:"u7.b14.c6", type:"mcq", prompt:"An animal that eats both plants and meat is…", choices:["herbivore","carnivore","omnivore","producer"], correct:"omnivore" },
          { id:"u7.b14.c7", type:"mcq", prompt:"In <i>grass → rabbit → fox</i>, the FOX is a…", choices:["producer","plant","carnivore","sun"], correct:"carnivore" },
        ]
      },

      // ---- Block 15: Maps & directions ----
      {
        id: "u7.b15", title: "Maps & directions", emoji: "🧭",
        cards: [
          { id:"u7.b15.c1", type:"intro",
            title:"Find your way",
            body:"A <b>map</b> is a flat picture of a place. The <b>compass rose</b> shows directions:<br><b>N</b>orth (up), <b>S</b>outh (down), <b>E</b>ast (right), <b>W</b>est (left).<br>Tip to remember: <b>N</b>ever <b>E</b>at <b>S</b>oggy <b>W</b>affles (clockwise from top: N–E–S–W)." },
          { id:"u7.b15.c2", type:"mcq", prompt:"On a map, which direction is usually UP?", choices:["North","South","East","West"], correct:"North" },
          { id:"u7.b15.c3", type:"mcq", prompt:"The OPPOSITE of North is…", choices:["East","West","South","Up"], correct:"South" },
          { id:"u7.b15.c4", type:"mcq", prompt:"The sun rises in the…", choices:["North","South","East","West"], correct:"East" },
          { id:"u7.b15.c5", type:"mcq", prompt:"The picture on a map that shows directions is the…", choices:["key","title","compass rose","scale"], correct:"compass rose" },
          { id:"u7.b15.c6", type:"mcq", prompt:"The part of a map that explains the symbols is the…", choices:["key (legend)","title","compass","border"], correct:"key (legend)" },
        ]
      },

      // ---- Block 16: 🏟️ Champion's Arena III ----
      {
        id: "u7.fun", title: "Champion's Arena III 🎮", emoji: "🏟️",
        cards: [
          { id:"u7.fun.c1", type:"intro",
            title:"🏟️ Champion's Arena III!",
            body:"The biggest warm-up before Jiren. Show what you've got across <b>everything</b>." },
          { id:"u7.fun.c2", type:"speed",
            title:"Sprint: ×11 and ×12",
            seconds:8,
            questions:[
              { prompt:"11 × 6", choices:["55","60","66","72"], correct:"66" },
              { prompt:"12 × 4", choices:["36","40","44","48"], correct:"48" },
              { prompt:"12 × 7", choices:["72","77","84","91"], correct:"84" },
              { prompt:"11 × 9", choices:["88","99","108","110"], correct:"99" },
              { prompt:"12 × 6", choices:["60","66","72","78"], correct:"72" },
            ] },
          { id:"u7.fun.c3", type:"match",
            title:"Match contraction → meaning",
            pairs:[
              { a:"can't", b:"cannot" },
              { a:"I'm", b:"I am" },
              { a:"they're", b:"they are" },
              { a:"didn't", b:"did not" },
              { a:"we're", b:"we are" },
            ] },
          { id:"u7.fun.c4", type:"match",
            title:"Match 3D shape → object",
            pairs:[
              { a:"cube", b:"dice" },
              { a:"sphere", b:"ball" },
              { a:"cylinder", b:"can" },
              { a:"cone", b:"party hat" },
              { a:"pyramid", b:"Egyptian tomb" },
            ] },
          { id:"u7.fun.c5", type:"tap",
            prompt:"Tap all the SYNONYMS of <b>big</b>",
            items:[
              { label:"large", correct:true },
              { label:"tiny", correct:false },
              { label:"huge", correct:true },
              { label:"small", correct:false },
              { label:"giant", correct:true },
              { label:"mini", correct:false },
              { label:"enormous", correct:true },
            ] },
          { id:"u7.fun.c6", type:"tap",
            prompt:"Tap every LIQUID",
            items:[
              { label:"water", correct:true },
              { label:"rock", correct:false },
              { label:"milk", correct:true },
              { label:"air", correct:false },
              { label:"juice", correct:true },
              { label:"ice", correct:false },
              { label:"oil", correct:true },
            ] },
          { id:"u7.fun.c7", type:"match",
            title:"Match animal → habitat",
            pairs:[
              { a:"polar bear", b:"arctic" },
              { a:"camel", b:"desert" },
              { a:"shark", b:"ocean" },
              { a:"monkey", b:"rainforest" },
              { a:"frog", b:"pond" },
            ] },
          { id:"u7.fun.c8", type:"speed",
            title:"Sprint: decimals & data",
            seconds:9,
            questions:[
              { prompt:"0.5 = ?", choices:["1/5","1/2","5/1","5"], correct:"1/2" },
              { prompt:"Which is bigger: 0.4 or 0.7?", choices:["0.4","0.7","equal","none"], correct:"0.7" },
              { prompt:"7/10 as decimal", choices:["0.07","0.7","7.0","70"], correct:"0.7" },
              { prompt:"Cats:8 Dogs:5. Total?", choices:["12","13","14","15"], correct:"13" },
              { prompt:"⭐=2 votes. ⭐⭐⭐ = ?", choices:["3","5","6","8"], correct:"6" },
            ] },
        ]
      },

      // ---- BOSS: Jiren ----
      {
        id: "u7.boss", title: "BOSS: Jiren", emoji: "🦾",
        cards: [
          { id:"u7.boss.c1", type:"boss",
            name:"Jiren", namePa:"ਜਿਰੇਨ", emoji:"🦾", hp:14,
            questions:[
              { prompt:"12 × 7 = ?", choices:["72","77","84","91"], correct:"84" },
              { prompt:"11 × 9 = ?", choices:["88","99","108","110"], correct:"99" },
              { prompt:"144 ÷ 12 = ?", choices:["10","11","12","13"], correct:"12" },
              { prompt:"A box has 8 pencils. How many pencils in 6 boxes?", choices:["42","48","52","56"], correct:"48" },
              { prompt:"Write 7/10 as a decimal:", choices:["0.07","0.7","7.0","70"], correct:"0.7" },
              { prompt:"How many faces does a cube have?", choices:["4","6","8","12"], correct:"6" },
              { prompt:"A circle has how many lines of symmetry?", choices:["1","4","8","infinitely many"], correct:"infinitely many" },
              { prompt:"Antonym of <b>begin</b>?", choices:["start","open","end","go"], correct:"end" },
              { prompt:"Pick the right word: <i>That is ___ ball.</i>", choices:["there","their","they're","theyre"], correct:"their" },
              { prompt:"<b>can't</b> is short for…", choices:["can it","cannot","can to","can't"], correct:"cannot" },
              { prompt:"Air is a…", choices:["solid","liquid","gas","mix"], correct:"gas" },
              { prompt:"A baby frog is a…", choices:["chick","tadpole","fawn","cub"], correct:"tadpole" },
              { prompt:"In <i>grass → rabbit → fox</i>, fox is a…", choices:["producer","plant","carnivore","sun"], correct:"carnivore" },
              { prompt:"On a map, the sun rises in the…", choices:["North","South","East","West"], correct:"East" },
            ] }
        ]
      }
    ]
  },

];

// =========================================================
// FLATTENED INDEX (engine consumes this)
// =========================================================
const LADDER_FLAT = (() => {
  const flat = [];
  LADDER.forEach((unit, ui) => {
    unit.blocks.forEach((block, bi) => {
      const blockStart = flat.length;
      block.cards.forEach((card, ci) => {
        flat.push({
          card,
          unitId: unit.id, unitTitle: unit.title, unitEmoji: unit.emoji,
          blockId: block.id, blockTitle: block.title, blockEmoji: block.emoji,
          isBoss: card.type === "boss",
          unitIndex: ui, blockIndex: bi, cardIndex: ci,
          blockStart
        });
      });
      for (let i = blockStart; i < flat.length; i++) flat[i].blockStart = blockStart;
    });
  });
  return flat;
})();

window.LADDER = LADDER;
window.LADDER_FLAT = LADDER_FLAT;
window.LADDER_VERSION = LADDER_VERSION;
