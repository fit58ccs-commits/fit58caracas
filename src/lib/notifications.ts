/**
 * notifications.ts
 * ─────────────────────────────────────────────────────────────
 * Sistema de notificaciones para Fit +58 Caracas
 * 
 * CANALES:
 *   1. Push PWA  → notificación en el teléfono del ADMIN (si instaló la PWA)
 *   2. Telegram  → mensaje al bot del admin al recibir un pedido
 * 
 * CONFIGURACIÓN (guardar en Admin → Diseño → Notificaciones):
 *   localStorage: fit58_notif_config = { telegramToken, telegramChatId, pushEnabled }
 * ─────────────────────────────────────────────────────────────
 */

export interface NotifConfig {
  telegramToken:  string;  // Token del bot: "123456:ABCdef..."
  telegramChatId: string;  // Tu chat ID: "123456789"
  pushEnabled:    boolean; // Notificaciones push PWA activadas
}

export function getNotifConfig(): NotifConfig {
  try {
    const raw = localStorage.getItem("fit58_notif_config");
    return raw ? JSON.parse(raw) : { telegramToken: "", telegramChatId: "", pushEnabled: false };
  } catch { return { telegramToken: "", telegramChatId: "", pushEnabled: false }; }
}

export function saveNotifConfig(cfg: NotifConfig) {
  localStorage.setItem("fit58_notif_config", JSON.stringify(cfg));
}

/* ── REGISTRO DEL SERVICE WORKER ─────────────────────────── */
export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("[PWA] Service Worker registrado:", reg.scope);
    return reg;
  } catch (e) {
    console.warn("[PWA] SW registration failed:", e);
    return null;
  }
}

/* ── PEDIR PERMISO PARA NOTIFICACIONES ───────────────────── */
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied")  return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/* ── NOTIFICACIÓN PUSH LOCAL (sin servidor) ──────────────── */
export async function sendLocalPush(title: string, body: string, url = "/admin") {
  if (typeof window === "undefined") return;
  const granted = await requestPushPermission();
  if (!granted) return;

  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (reg) {
    // Mostrar via Service Worker (más confiable, funciona con app en background)
    await reg.showNotification(title, {
      body,
      icon:    "/icons/icon-192.png",
      badge:   "/icons/icon-192.png",
      tag:     "order-" + Date.now(),
      data:    url,
      requireInteraction: true,
    });
  } else {
    // Fallback: Notification API directa
    new Notification(title, { body, icon: "/icons/icon-192.png" });
  }
}

/* ── TELEGRAM ────────────────────────────────────────────── */
export async function sendTelegram(message: string): Promise<boolean> {
  const cfg = getNotifConfig();
  if (!cfg.telegramToken || !cfg.telegramChatId) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${cfg.telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id:    cfg.telegramChatId,
          text:       message,
          parse_mode: "Markdown",
        }),
      }
    );
    const data = await res.json();
    return data.ok === true;
  } catch (e) {
    console.warn("[Telegram] Error:", e);
    return false;
  }
}

/* ── NOTIFICACIÓN COMPLETA DE PEDIDO ────────────────────── */
export async function notifyNewOrder(order: {
  id: string;
  total: number;
  cart: { name: string; qty: number; price: number }[];
  form: { name: string; phone: string; time: string; address: string; method: string };
}) {
  const cfg = getNotifConfig();
  const items = order.cart.map(i => `• ${i.name} ×${i.qty}`).join("\n");
  const total = `$${order.total.toFixed(2)}`;

  // 1. Push PWA (llega al teléfono si instaló la PWA)
  if (cfg.pushEnabled) {
    await sendLocalPush(
      `🛒 Nuevo pedido — ${total}`,
      `${order.form.name} · ${order.cart.length} producto${order.cart.length > 1 ? "s" : ""}`,
      "/admin"
    );
  }

  // 2. Telegram
  if (cfg.telegramToken && cfg.telegramChatId) {
    const msg = [
      `🛒 *NUEVO PEDIDO — Fit +58 Caracas*`,
      `─────────────────────────────`,
      items,
      `─────────────────────────────`,
      `💰 *Total: ${total}*`,
      `─────────────────────────────`,
      `👤 ${order.form.name}`,
      `📱 ${order.form.phone}`,
      `⏰ ${order.form.time}`,
      `📍 ${order.form.address}`,
      `💳 ${order.form.method}`,
      `🆔 Pedido: ${order.id}`,
    ].join("\n");
    await sendTelegram(msg);
  }
}
