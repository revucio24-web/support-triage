/* Vorgangs-Triage – Service Worker (App-Hülle offline) */
const CACHE = "vorgangstriage-v1.0.0";
const HUELLE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./privacy.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(HUELLE.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const anfrage = event.request;
  if (anfrage.method !== "GET") return;
  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;

  if (anfrage.mode === "navigate") {
    event.respondWith(
      fetch(anfrage)
        .then(antwort => {
          const kopie = antwort.clone();
          caches.open(CACHE).then(cache => cache.put(anfrage, kopie));
          return antwort;
        })
        .catch(() => caches.match(anfrage).then(treffer => treffer || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(anfrage).then(treffer => {
      if (treffer) return treffer;
      return fetch(anfrage).then(antwort => {
        const kopie = antwort.clone();
        caches.open(CACHE).then(cache => cache.put(anfrage, kopie));
        return antwort;
      });
    })
  );
});
