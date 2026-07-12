/**
 * Service Worker — Délice Gourmet PWA
 * Maneja: cache offline + notificaciones push
 */
const CACHE_NAME = "delice-v1";
const STATIC_ASSETS = ["/", "/manifest.json"];

/* ── Instalación: pre-cachear assets básicos ── */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ── Activación: limpiar caches viejos ── */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: network-first con fallback a cache ── */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("supabase.co")) return; // no cachear Supabase
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

/* ── Push notifications ── */
self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "Délice Gourmet", {
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
