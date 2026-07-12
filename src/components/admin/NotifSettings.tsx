"use client";
/**
 * NotifSettings.tsx
 * Panel de configuración de notificaciones en Admin → Diseño
 * Permite activar/desactivar Push PWA y configurar Telegram
 */
import { useState, useEffect } from "react";
import { Bell, Send, CheckCircle, AlertCircle, Smartphone, MessageSquare } from "lucide-react";
import { getNotifConfig, saveNotifConfig, requestPushPermission, sendTelegram, registerSW, type NotifConfig } from "@/lib/notifications";
import { Btn, Field } from "../ui/Primitives";
import { useToast } from "../ui/Toast";

export function NotifSettings() {
  const toast = useToast();
  const [cfg,      setCfg]      = useState<NotifConfig>({ telegramToken:"", telegramChatId:"", pushEnabled:false });
  const [pushPerm, setPushPerm] = useState<"granted"|"denied"|"default"|"unsupported">("default");
  const [testing,  setTesting]  = useState(false);

  useEffect(() => {
    setCfg(getNotifConfig());
    if (typeof window !== "undefined") {
      if (!("Notification" in window)) { setPushPerm("unsupported"); return; }
      setPushPerm(Notification.permission as "granted"|"denied"|"default");
    }
  }, []);

  const save = () => {
    saveNotifConfig(cfg);
    toast("Configuración guardada", "✓");
  };

  const enablePush = async () => {
    await registerSW();
    const granted = await requestPushPermission();
    if (granted) {
      setPushPerm("granted");
      setCfg(c => ({ ...c, pushEnabled: true }));
      saveNotifConfig({ ...cfg, pushEnabled: true });
      toast("Notificaciones push activadas", "🔔");
    } else {
      setPushPerm("denied");
      toast("Permiso denegado — actívalo en la configuración del navegador", "⚠️");
    }
  };

  const testPush = async () => {
    setTesting(true);
    const { sendLocalPush } = await import("@/lib/notifications");
    await sendLocalPush("🛒 Prueba — Délice Gourmet", "Notificación push funcionando correctamente", "/admin");
    toast("Notificación de prueba enviada", "✓");
    setTesting(false);
  };

  const testTelegram = async () => {
    setTesting(true);
    const ok = await sendTelegram("🛒 *Prueba — Délice Gourmet*\n\nConexión de Telegram funcionando correctamente ✅");
    if (ok) toast("Mensaje de Telegram enviado", "✓");
    else     toast("Error — revisa el token y chat ID", "❌");
    setTesting(false);
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-neutral-500"/>
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase m-0">Notificaciones de Pedidos</p>
      </div>

      {/* ── PUSH PWA ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200/60 bg-neutral-50/50">
          <Smartphone size={18} className="text-neutral-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-black text-black mb-0.5">Notificaciones Push (PWA)</p>
            <p className="text-xs text-neutral-400 mb-3">
              Recibe alertas en tu teléfono cuando llegue un pedido — incluso con la app en segundo plano.
              Requiere haber instalado la PWA.
            </p>
            {pushPerm === "unsupported" && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <AlertCircle size={13}/> Tu navegador no soporta notificaciones push
              </div>
            )}
            {pushPerm === "granted" && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                  <CheckCircle size={13}/> Permisos concedidos
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                    <input type="checkbox" checked={cfg.pushEnabled}
                      onChange={e => setCfg(c => ({ ...c, pushEnabled: e.target.checked }))}
                      className="accent-black"/>
                    Activar notificaciones
                  </label>
                  <button onClick={testPush} disabled={testing}
                    className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border-none cursor-pointer">
                    {testing ? "Enviando..." : "Probar"}
                  </button>
                </div>
              </div>
            )}
            {(pushPerm === "default" || pushPerm === "denied") && (
              <div className="flex flex-col gap-2">
                {pushPerm === "denied" && (
                  <p className="text-xs text-red-500 font-semibold">
                    ⚠️ Permiso denegado — ve a Configuración del navegador → Permisos → Notificaciones → Permitir para este sitio
                  </p>
                )}
                <button onClick={enablePush}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase border-none cursor-pointer bg-black text-white w-fit">
                  <Bell size={13}/> Activar notificaciones push
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TELEGRAM ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200/60 bg-neutral-50/50">
          <MessageSquare size={18} className="text-neutral-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="text-sm font-black text-black mb-0.5">Telegram Bot</p>
            <p className="text-xs text-neutral-400 mb-3">
              Recibe cada pedido como mensaje en Telegram — funciona aunque no tengas la PWA instalada.
            </p>

            {/* Instrucciones colapsables */}
            <details className="mb-3">
              <summary className="text-[10px] font-bold text-blue-600 cursor-pointer mb-2">
                📖 Cómo obtener el Token y Chat ID (3 pasos)
              </summary>
              <div className="text-xs text-neutral-500 leading-relaxed mt-2 flex flex-col gap-1.5 pl-2 border-l-2 border-blue-100">
                <p><strong>1.</strong> Abre Telegram y busca <code className="bg-neutral-100 px-1 rounded">@BotFather</code></p>
                <p><strong>2.</strong> Escribe <code className="bg-neutral-100 px-1 rounded">/newbot</code> → ponle nombre → obtendrás el <strong>Token</strong></p>
                <p><strong>3.</strong> Busca <code className="bg-neutral-100 px-1 rounded">@userinfobot</code> → escribe cualquier cosa → te dará tu <strong>Chat ID</strong></p>
                <p className="text-neutral-400">El token tiene este formato: <code className="bg-neutral-100 px-1 rounded">123456789:ABCdef...</code></p>
              </div>
            </details>

            <div className="flex flex-col gap-2">
              <Field label="Token del Bot" value={cfg.telegramToken}
                onChange={e => setCfg(c => ({ ...c, telegramToken: e.target.value }))}
                placeholder="123456789:ABCdefGHIjklMNO..."/>
              <Field label="Tu Chat ID" value={cfg.telegramChatId}
                onChange={e => setCfg(c => ({ ...c, telegramChatId: e.target.value }))}
                placeholder="123456789"/>
              {cfg.telegramToken && cfg.telegramChatId && (
                <button onClick={testTelegram} disabled={testing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase border-none cursor-pointer w-fit"
                  style={{ background:"#0088cc", color:"#fff" }}>
                  <Send size={13}/> {testing ? "Enviando..." : "Enviar mensaje de prueba"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Btn variant="green" onClick={save}>
        <CheckCircle size={13}/> GUARDAR CONFIGURACIÓN
      </Btn>
    </div>
  );
}
