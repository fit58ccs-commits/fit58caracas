// SW v6 — limpia caches anteriores y no interfiere
const CACHE_VERSION = "fit58-v6";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// No interceptar fetch — dejar que el browser maneje todo
// self.addEventListener("fetch", ...) removido intencionalmente
// para eliminar interferencia con React hydration

self.addEventListener("push", (e) => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || "Fit +58 Caracas", {
      body:  data.body  || "Tienes un nuevo pedido",
      icon:  data.icon  || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag:   data.tag   || "order",
      data:  data.url   || "/admin",
      requireInteraction: true,
    })
  );
});

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
