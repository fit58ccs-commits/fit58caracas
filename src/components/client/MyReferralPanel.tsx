"use client";
/**
 * MyReferralPanel — Panel de referidos para el cliente (sin login)
 * El cliente ingresa su código y ve sus métricas + enlace para compartir
 */
import { useState } from "react";
import { Tag, Copy, CheckCircle2, X, TrendingUp, Users, Gift } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

interface Referral {
  id: string;
  code: string;
  owner_name: string;
  discount: number;
  reward_pct: number;
  uses: number;
  max_uses: number | null;
  active: boolean;
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  label: string;
  used: boolean;
  active: boolean;
}

interface Props {
  onClose: () => void;
}

export function MyReferralPanel({ onClose }: Props) {
  const sb = createClient();

  const [step,     setStep]     = useState<"input" | "panel">("input");
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [referral, setReferral] = useState<Referral | null>(null);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [copied,   setCopied]   = useState(false);
  const [mode,     setMode]     = useState<"referral" | "giftcard">("referral");

  const lookup = async () => {
    const code = input.trim().toUpperCase();
    if (!code) { setError("Ingresa tu código"); return; }
    setLoading(true);
    setError("");

    // Buscar como código de referido
    const { data: ref } = await sb.from("referrals").select("*").eq("code", code).single();
    if (ref) {
      setReferral(ref as Referral);
      setMode("referral");
      setStep("panel");
      setLoading(false);
      return;
    }

    // Buscar como tarjeta de regalo
    const { data: gc } = await sb.from("gift_cards").select("*").eq("code", code).single();
    if (gc) {
      setGiftCard(gc as GiftCard);
      setMode("giftcard");
      setStep("panel");
      setLoading(false);
      return;
    }

    setError("Código no encontrado. Verifica que sea correcto.");
    setLoading(false);
  };

  const copyLink = () => {
    if (!referral) return;
    const url = `https://fit58caracas.vercel.app/?ref=${referral.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!referral) return;
    const url  = `https://fit58caracas.vercel.app/?ref=${referral.code}`;
    const text = `¡Usa mi código *${referral.code}* y obtén un ${referral.discount}% de descuento en Fit +58 Caracas 💪\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const earned = referral ? (referral.uses * referral.reward_pct).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose}/>
      <div className="animate-drawer-in relative bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase mb-0.5">Fit +58 Caracas</p>
            <h2 className="text-lg font-black text-black uppercase tracking-tight m-0">
              {step === "input" ? "Mi Código" : mode === "giftcard" ? "Tarjeta de Regalo" : "Mis Referidos"}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 border border-neutral-200/80 bg-neutral-50 flex items-center justify-center rounded-full cursor-pointer">
            <X size={16}/>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ maxHeight: "calc(90vh - 80px)" }}>

          {step === "input" && (
            <>
              <div className="neumorph rounded-2xl p-5 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <Tag size={20} className="text-white"/>
                </div>
                <div>
                  <p className="font-black text-black text-base m-0">Ingresa tu código</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Código de referido (FIT-...) o tarjeta de regalo (GC-...)
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && lookup()}
                  placeholder="FIT-JUAN-ABC · GC-XXXX-YYYY-ZZZZ"
                  className="field-input w-full border border-neutral-200/80 px-4 py-3.5 text-sm bg-white rounded-2xl font-mono font-bold text-center tracking-widest uppercase"
                  autoFocus/>
                {error && (
                  <p className="text-[11px] text-red-500 font-bold text-center">{error}</p>
                )}
              </div>

              <button onClick={lookup} disabled={loading}
                className="w-full py-4 rounded-full font-black text-[12px] uppercase tracking-widest cursor-pointer border-none disabled:opacity-40"
                style={{ background: "rgba(17,17,17,0.92)", color: "#fff" }}>
                {loading ? "Buscando..." : "Ver mi panel →"}
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                Tu código te lo proporcionamos por WhatsApp al realizar tu primera compra,
                o lo encuentras en el mensaje de confirmación de tu pedido.
              </p>
            </>
          )}

          {step === "panel" && mode === "referral" && referral && (
            <>
              {/* Estado del código */}
              <div className="neumorph rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase">Tu código</p>
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                    style={{
                      background: referral.active ? "rgba(34,168,90,0.12)" : "rgba(200,200,200,0.2)",
                      color:      referral.active ? "#22a85a"              : "#999",
                    }}>
                    {referral.active ? "ACTIVO" : "INACTIVO"}
                  </span>
                </div>
                <p className="text-2xl font-black text-black tracking-widest font-mono m-0">{referral.code}</p>
                <p className="text-xs text-neutral-500 m-0">Hola, {referral.owner_name.split(" ")[0]} 👋</p>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Users size={16} className="mx-auto mb-1 text-blue-500"/>
                  <p className="text-xl font-black text-black m-0">{referral.uses}</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Referidos</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <TrendingUp size={16} className="mx-auto mb-1 text-purple-500"/>
                  <p className="text-xl font-black text-black m-0">{earned}%</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Acumulado</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Gift size={16} className="mx-auto mb-1 text-green-500"/>
                  <p className="text-xl font-black text-black m-0">{referral.discount}%</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wide">Descuento</p>
                </div>
              </div>

              {/* Info */}
              <div className="rounded-2xl p-4 flex flex-col gap-2 text-[11px]"
                style={{ background: "rgba(17,17,17,0.04)" }}>
                <p className="font-black text-black m-0 uppercase tracking-wide text-[10px]">¿Cómo funciona?</p>
                <p className="text-neutral-600 m-0">
                  · Comparte tu enlace. Cuando alguien compra usándolo, obtienen <strong>{referral.discount}% de descuento</strong>.
                </p>
                <p className="text-neutral-600 m-0">
                  · Tú acumulas <strong>{referral.reward_pct}% por cada venta</strong> generada.
                  Con {referral.uses} referido{referral.uses !== 1 ? "s" : ""}, llevas <strong>{earned}%</strong> acumulado.
                </p>
                <p className="text-neutral-600 m-0">
                  · Para canjear tu recompensa, escríbenos por WhatsApp mencionando tu código.
                </p>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2">
                <button onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest cursor-pointer border border-neutral-200/80 bg-white/70">
                  {copied ? <CheckCircle2 size={14} className="text-green-500"/> : <Copy size={14}/>}
                  {copied ? "¡Link copiado!" : "Copiar mi link"}
                </button>
                <button onClick={shareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest cursor-pointer border-none"
                  style={{ background: "#25D366", color: "#fff" }}>
                  Compartir por WhatsApp 📲
                </button>
              </div>

              <button onClick={() => { setStep("input"); setReferral(null); setInput(""); }}
                className="text-[10px] text-neutral-400 text-center cursor-pointer border-none bg-transparent underline">
                Ingresar otro código
              </button>
            </>
          )}

          {step === "panel" && mode === "giftcard" && giftCard && (
            <>
              <div className="neumorph rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: giftCard.used ? "rgba(200,200,200,0.3)" : "rgba(17,17,17,0.9)" }}>
                  <Gift size={24} className={giftCard.used ? "text-neutral-400" : "text-white"}/>
                </div>
                <p className="text-2xl font-black text-black font-mono tracking-widest m-0">{giftCard.code}</p>
                <p className="text-3xl font-black m-0" style={{ color: giftCard.used ? "#aaa" : "#111" }}>
                  €{giftCard.amount.toFixed(2)}
                </p>
                <p className="text-xs text-neutral-500 m-0">{giftCard.label}</p>
                <span className="text-[10px] font-black px-3 py-1 rounded-full"
                  style={{
                    background: giftCard.used ? "rgba(234,88,12,0.12)" : giftCard.active ? "rgba(34,168,90,0.12)" : "rgba(200,200,200,0.2)",
                    color:      giftCard.used ? "#ea580c"              : giftCard.active ? "#22a85a"              : "#999",
                  }}>
                  {giftCard.used ? "YA CANJEADA" : giftCard.active ? "VÁLIDA — DISPONIBLE" : "INACTIVA"}
                </span>
              </div>

              {!giftCard.used && giftCard.active && (
                <div className="rounded-2xl p-4 text-[11px] text-neutral-600"
                  style={{ background: "rgba(34,168,90,0.06)", border: "1px solid rgba(34,168,90,0.15)" }}>
                  <p className="font-black text-green-700 m-0 mb-1 uppercase tracking-wide text-[10px]">¿Cómo canjear?</p>
                  <p className="m-0">Muestra este código al momento de hacer tu pedido por WhatsApp o indícalo en el checkout. Se descontará automáticamente de tu total.</p>
                </div>
              )}

              {giftCard.used && (
                <div className="rounded-2xl p-4 text-[11px] text-neutral-600"
                  style={{ background: "rgba(234,88,12,0.06)", border: "1px solid rgba(234,88,12,0.15)" }}>
                  <p className="font-black text-orange-600 m-0 mb-1 uppercase tracking-wide text-[10px]">Tarjeta utilizada</p>
                  <p className="m-0">Esta tarjeta ya fue canjeada y no puede usarse nuevamente.</p>
                </div>
              )}

              <button onClick={() => { setStep("input"); setGiftCard(null); setInput(""); }}
                className="text-[10px] text-neutral-400 text-center cursor-pointer border-none bg-transparent underline">
                Ingresar otro código
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
