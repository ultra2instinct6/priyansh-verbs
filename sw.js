/* ============================================================
 * sw.js — Punjabi Ji service worker
 *  ▸ Strategy: cache-first for our app shell (instant repeat loads,
 *    works offline). Network-first (with cache fallback) for the
 *    HTML so deploys are picked up quickly.
 *  ▸ Firestore + Google Fonts requests bypass the cache so the
 *    leaderboard always hits the network when online.
 *  ▸ Bump CACHE_VERSION on every release to invalidate old caches.
 * ============================================================ */

const CACHE_VERSION = "punjabiji-v20260502-r30-splashfix";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/ladder.js",
  "/online.js",
  "/abc.js",
  "/attacks.js",
  "/vocab.js",
  "/manifest.json",
  "/images/logo.png",
  "/images/og-image.png",
  "/images/boystart.png",
  "/images/girlstart.png",
  "/images/bandit.png",
  "/images/dragon.png",
  "/images/ghost.png",
  "/images/imp.png",
  "/images/saibaman.png",
  "/images/shadow.png",
  "/404.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // Cache what we can; missing files shouldn't kill the install.
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn("[SW] skip", url, err.message))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Always go to network for Firestore + analytics + auth.
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") && url.pathname.includes("firebase")
  ) {
    return; // default browser handling
  }

  // HTML → network-first so new deploys appear quickly.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/index.html")))
    );
    return;
  }

  // Everything else → cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Only cache successful, basic/cors responses.
        if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
