/**
 * Service Worker — Fit +58 Caracas PWA
 * Estrategia: network-first para páginas, cache-first para assets estáticos
 */
const CACHE_NAME   = "fit58-v3";
const STATIC_CACHE = "fit58-static-v3";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const OFFLINE_PAGE = "/";

/* ── Instalación ── */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ── Activación ── */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch ── */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // No interceptar Supabase ni APIs externas
  if (url.hostname.includes("supabase.co")) return;
  if (url.hostname.includes("api.telegram.org")) return;
  if (url.hostname.includes("maps.google.com")) return;
  if (url.protocol === "chrome-extension:") return;

  // Assets estáticos (_next/static) → cache-first
  if (url.pathname.startsWith("/_next/static")) {
    e.respondWith(
      caches.match(e.request).then(
        (cached) => cached || fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Imágenes → cache-first con límite de tiempo
  if (
    e.request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Páginas y todo lo demás → network-first con fallback a cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match(OFFLINE_PAGE))
      )
  );
});

/* ── Push notifications ── */
self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "Fit +58 Caracas", {
      body:    data.body  || "Tienes un nuevo pedido",
      icon:    data.icon  || "/icons/icon-192.png",
      badge:   "/icons/icon-192.png",
      tag:     data.tag   || "order",
      data:    data.url   || "/admin",
      actions: [
        { action: "view",    title: "Ver pedido" },
        { action: "dismiss", title: "Cerrar"     },
      ],
      requireInteraction: true,
    })
  );
});

/* ── Click en notificación ── */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "dismiss") return;
  const url = e.notification.data || "/admin";
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((cs) => {
      const existing = cs.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
