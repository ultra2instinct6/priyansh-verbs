/* ============================================================
 * online.js  —  Global online leaderboard via Firebase Firestore
 * ------------------------------------------------------------
 *  ▸ Loaded as an ES module from index.html (after app.js).
 *  ▸ Exposes window.OnlineLB = { ready, push, getAll, onChange }.
 *  ▸ App.js calls OnlineLB.push(...) whenever local stats change.
 *  ▸ Real-time snapshot keeps a local cache of every fighter on
 *    every device. Doc id is "<slug>__<deviceId>" so the same
 *    name on two devices stays separate.
 *
 *  ╔════════════════════════════════════════════════════════════╗
 *  ║   ONE-TIME SETUP (do this once, ~3 minutes)               ║
 *  ║   1. Go to https://console.firebase.google.com/ and       ║
 *  ║      click "Add project". Any name works.                 ║
 *  ║   2. Inside the project, click </> "Add web app".         ║
 *  ║      Copy the firebaseConfig object it shows you.         ║
 *  ║   3. Paste it into FIREBASE_CONFIG below (replace the     ║
 *  ║      placeholder values).                                 ║
 *  ║   4. In the left sidebar → Build → Firestore Database →   ║
 *  ║      "Create database" → start in **test mode**           ║
 *  ║      (or use the rules block at the bottom of this file). ║
 *  ║   That's it. Reload index.html and the 🏆 Board will      ║
 *  ║   show a 🌐 Global tab with everyone's scores live.       ║
 *  ╚════════════════════════════════════════════════════════════╝
 * ============================================================ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAdMds4bZqD8DRwuAZbA7sp3CNNobt6y0Q",
  authDomain:        "punjabiji.firebaseapp.com",
  projectId:         "punjabiji",
  storageBucket:     "punjabiji.firebasestorage.app",
  messagingSenderId: "1076563013729",
  appId:             "1:1076563013729:web:f1cdc39b17effe1184fa20"
};

const COLLECTION = "scores";

// --- Helpful no-op fallback so app.js never crashes ---
window.OnlineLB = window.OnlineLB || {
  ready: false,
  status: "not-configured",
  push: () => {},
  remove: () => {},
  getAll: () => [],
  onChange: () => {}
};

function isConfigured(cfg) {
  return cfg && typeof cfg.apiKey === "string" && !cfg.apiKey.startsWith("PASTE_");
}

if (!isConfigured(FIREBASE_CONFIG)) {
  console.info(
    "%c[OnlineLB] Firebase not configured yet — leaderboard stays local-only.\n" +
    "Open online.js and follow the setup comment at the top to enable the 🌐 Global board.",
    "color:#ff8a00;font-weight:bold"
  );
} else {
  // Dynamic import so app.js still runs even if the CDN is offline.
  (async () => {
    try {
      const [{ initializeApp }, fs] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]);
      const { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } = fs;

      const app = initializeApp(FIREBASE_CONFIG);
      const db  = getFirestore(app);
      const col = collection(db, COLLECTION);

      const cache = new Map();          // docId -> row
      const listeners = new Set();      // change subscribers

      function notify() {
        const rows = Array.from(cache.values());
        listeners.forEach(fn => { try { fn(rows); } catch (_) {} });
      }

      // Live mirror of the whole board (free tier handles small kid-sized lists easily).
      onSnapshot(col, (snap) => {
        snap.docChanges().forEach((ch) => {
          if (ch.type === "removed") cache.delete(ch.doc.id);
          else                       cache.set(ch.doc.id, { id: ch.doc.id, ...ch.doc.data() });
        });
        notify();
      }, (err) => {
        console.warn("[OnlineLB] snapshot error:", err.message);
      });

      // Tiny debouncer so rapid score updates batch into one write.
      let pending = null, timer = null;
      function flush() {
        timer = null;
        if (!pending) return;
        const { id, data } = pending;
        pending = null;
        setDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
          .catch(err => console.warn("[OnlineLB] push failed:", err.message));
      }

      window.OnlineLB = {
        ready: true,
        status: "online",
        push(row) {
          // row = { id, childId, player, power, rupees, gold, rank, device, step, stepTotal }
          // Defensive: Firestore rules reject empty player/childId, so skip
          // pushes that would be rejected (e.g. early init race).
          if (!row || !row.id) return;
          if (!row.player || !String(row.player).trim()) return;
          if (!row.childId || !String(row.childId).trim()) return;
          pending = { id: row.id, data: row };
          if (!timer) timer = setTimeout(flush, 1500);
        },
        remove(id) {
          if (!id) return;
          // Drop from local cache immediately so UI updates without waiting
          // for the snapshot round-trip.
          cache.delete(id);
          notify();
          deleteDoc(doc(db, COLLECTION, id))
            .catch(err => console.warn("[OnlineLB] delete failed:", err.message));
        },
        getAll() { return Array.from(cache.values()); },
        onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
      };

      window.dispatchEvent(new CustomEvent("online-lb-ready"));
      console.info("%c[OnlineLB] Connected to Firestore ✅", "color:#4caf50;font-weight:bold");
    } catch (err) {
      console.warn("[OnlineLB] init failed, staying local-only:", err.message);
      window.OnlineLB.status = "error";
    }
  })();
}

/* ------------------------------------------------------------
 * Recommended Firestore rules (paste in Firebase console →
 * Firestore Database → Rules) — open read+write to the scores
 * collection only, no auth required (matches "trust the kids"):
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{database}/documents {
 *       match /scores/{docId} {
 *         allow read: if true;
 *         allow write: if request.resource.data.keys().hasOnly(
 *             ['player','power','rupees','gold','rank','device','updatedAt','childId','step','stepTotal'])
 *           && request.resource.data.player is string
 *           && request.resource.data.player.size() <= 20
 *           && request.resource.data.power is number
 *           && request.resource.data.power < 100000000;
 *       }
 *     }
 *   }
 * ------------------------------------------------------------ */
