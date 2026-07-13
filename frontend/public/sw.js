// Service Worker for PWA — cache menu & images for offline use

const CACHE_NAME = "cafegocnho-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// Fetch: Network-first for API, Cache-first for static/assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API calls: Network first (no cache)
  if (url.pathname.startsWith("/api/")) {
    return; // Let browser handle normally — no caching for API
  }

  // Static assets & images: Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline — return cached or fallback
          return caches.match("/index.html");
        });
    })
  );
});
