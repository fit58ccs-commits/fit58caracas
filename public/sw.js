// SW v7 — cache-first para assets, network-first para HTML
const CACHE = "fit58-v7";
const ASSETS = ["/logo-splash.png", "/manifest.json", "/icons/icon-180.png", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Solo interceptar mismo origen
  if (url.origin !== self.location.origin) return;

  // HTML — siempre network-first (no cachear páginas Next.js)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Assets estáticos — cache-first
  if (ASSETS.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
    return;
  }

  // Todo lo demás — network only (APIs, Supabase, etc.)
});

// Push notifications
self.addEventListener("push", e => {
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

self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "dismiss") return;
  const url = e.notification.data || "/admin";
  e.waitUntil(
    clients.matchAll({ type: "window" }).then(cs => {
      const existing = cs.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
