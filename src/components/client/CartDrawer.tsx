"use client";
import { useState, useRef, useEffect } from "react";
import { X, Minus, Plus, ChevronRight, Check, Phone, User, Clock, MapPin, Upload, Camera, CreditCard, MessageSquare, ChevronDown } from "lucide-react";
import { fmt$, fmtBs } from "@/lib/store";
import type { CartItem, Order } from "@/lib/types";
import { PAYMENT_METHODS } from "@/lib/data";

const STEPS = ["cart", "form", "map", "payment"] as const;
type Step = typeof STEPS[number];

const stepLabel: Record<Step, string> = {
  cart: "Carrito",
  form: "Datos de entrega",
  map: "Ubicación GPS",
  payment: "Confirmar pago",
};

interface CartDrawerProps {
  cart: CartItem[];
  rate: number;
  cartTotal: number;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClose: () => void;
  onSaveOrder: (o: Omit<Order, "id" | "date" | "status">) => void;
}

export function CartDrawer({ cart, rate, cartTotal, onRemove, onUpdateQty, onClose, onSaveOrder }: CartDrawerProps) {
  const [step, setStep] = useState<Step>("cart");
  const [form, setForm] = useState({ name: "", phone: "", time: "", address: "", method: "", receipt: null as string | null });
  const [coords, setCoords] = useState({ lat: 10.4806, lng: -66.9036 });
  const [mapMode, setMapMode] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const lMap = useRef<unknown>(null);

  const F = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const stepIdx = STEPS.indexOf(step);
  const needsReceipt = ["Pago Móvil", "Zelle", "PayPal"].includes(form.method);

  useEffect(() => {
    if (!mapMode || !mapRef.current || lMap.current) return;
    const init = () => {
      const L = (window as unknown as { L: unknown }).L as { map: (...a: unknown[]) => unknown; tileLayer: (...a: unknown[]) => { addTo: (...a: unknown[]) => void }; marker: (...a: unknown[]) => { addTo: (...a: unknown[]) => unknown; on: (...a: unknown[]) => void } };
      if (!L) return;
      const m = L.map(mapRef.current!, { center: [coords.lat, coords.lng], zoom: 13 } as unknown) as { remove: () => void };
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m as unknown);
      const marker = L.marker([coords.lat, coords.lng], { draggable: true } as unknown).addTo(m as unknown);
      (marker as { on: (e: string, cb: (e: unknown) => void) => void }).on("dragend", (e: unknown) => {
        const p = (e as { target: { getLatLng: () => { lat: number; lng: number } } }).target.getLatLng();
        setCoords({ lat: parseFloat(p.lat.toFixed(6)), lng: parseFloat(p.lng.toFixed(6)) });
      });
      lMap.current = m;
    };
    const w = window as unknown as { L?: unknown };
    if (w.L) { init(); }
    else {
      const lk = document.createElement("link"); lk.rel = "stylesheet"; lk.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lk);
      const sc = document.createElement("script"); sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; sc.onload = init; document.head.appendChild(sc);
    }
    return () => { if (lMap.current) { (lMap.current as { remove: () => void }).remove(); lMap.current = null; } };
  }, [mapMode]);

  const handleConfirm = () => {
    const mapsLink = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    const msg = encodeURIComponent([
      `🛒 *NUEVO PEDIDO — Délice Gourmet*`, "─────────────────────────",
      ...cart.map(i => `• ${i.name} ×${i.qty} → ${fmt$(i.price * i.qty)}`),
      "─────────────────────────",
      `💰 *Total: ${fmt$(cartTotal)} | ${fmtBs(cartTotal, rate)}*`, "─────────────────────────",
      `👤 ${form.name}`, `📱 ${form.phone}`, `⏰ ${form.time}`,
      `📍 ${form.address}`, `🗺 ${mapsLink}`, `💳 ${form.method}`,
    ].join("\n"));
    onSaveOrder({ cart, total: cartTotal, form, mapsLink });
    window.open(`https://wa.me/584120000000?text=${msg}`, "_blank");
  };

  const inputCls = "w-full border border-neutral-200/80 px-4 py-3 text-sm text-black bg-white/72 backdrop-blur-sm rounded-xl font-[inherit] field-input";
  const primaryBtn = "w-full flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer transition-all duration-200 bg-[rgba(17,17,17,0.90)] backdrop-blur-sm text-white border border-white/10 hover:shadow-[0_8px_28px_rgba(0,0,0,0.28)] hover:-translate-y-px";
  const secondBtn  = "flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-bold tracking-widest uppercase rounded-xl cursor-pointer transition-all duration-200 bg-white/65 backdrop-blur-sm text-neutral-600 border border-neutral-200/80 hover:bg-white/85";

  return (
    <div className="fixed inset-0 z-[150] flex">
      <div className="animate-overlay-in absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose} />
      <div className="animate-drawer-in glass absolute right-0 top-0 bottom-0 w-full max-w-[440px] flex flex-col shadow-[−16px_0_80px_rgba(0,0,0,0.20)] overflow-y-auto rounded-none">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/40 sticky top-0 bg-white/88 backdrop-blur-2xl z-10">
          <div>
            <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase mb-0.5">{stepLabel[step]}</p>
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              {step === "cart" ? `${cart.length} PRODUCTO${cart.length !== 1 ? "S" : ""}`
                : step === "form" ? "¿DÓNDE TE LO ENVIAMOS?"
                : step === "map" ? "TU UBICACIÓN"
                : "MÉTODO DE PAGO"}
            </h2>
          </div>
          <button onClick={onClose} className="fluent-hover w-9 h-9 border border-neutral-200/80 bg-white/65 backdrop-blur-sm flex items-center justify-center cursor-pointer rounded-xl">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex h-0.5 bg-neutral-100/80">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 transition-all duration-500" style={{ background: i <= stepIdx ? "linear-gradient(90deg,#111,#555)" : "transparent" }} />
          ))}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-5 py-3.5">
          {STEPS.map((s, i) => (
            <div key={s} className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ background: i <= stepIdx ? "#111" : "#f0f2f5", border: i === stepIdx ? "2px solid #111" : "2px solid transparent", boxShadow: i <= stepIdx ? "0 2px 8px rgba(0,0,0,0.18)" : "none" }}>
              {i < stepIdx ? <Check size={11} color="#fff" /> : <span className="text-[9px] font-black" style={{ color: i === stepIdx ? "#fff" : "#bbb" }}>{i + 1}</span>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-8 flex flex-col gap-3.5">

          {/* STEP: CART */}
          {step === "cart" && (
            <>
              {cart.length === 0 && (
                <div className="text-center py-16 text-neutral-400">
                  <p className="text-sm font-semibold">Tu carrito está vacío</p>
                </div>
              )}
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3.5 pb-4 border-b border-neutral-50">
                  <div className="neumorph w-16 h-16 rounded-xl flex items-center justify-center shrink-0">
                    <img src={item.img} alt={item.name} className="w-12 h-12 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-black uppercase leading-snug mb-1">{item.name}</p>
                    <p className="text-[11px] text-neutral-400 mb-2">{fmt$(item.price)} c/u</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 border border-neutral-200/80 bg-white/70 flex items-center justify-center rounded-lg cursor-pointer"><Minus size={11} /></button>
                      <span className="text-sm font-black min-w-[22px] text-center">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)}  className="w-7 h-7 border border-neutral-200/80 bg-white/70 flex items-center justify-center rounded-lg cursor-pointer"><Plus size={11} /></button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-black mb-1.5">{fmt$(item.price * item.qty)}</p>
                    <button onClick={() => onRemove(item.id)} className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer bg-none border-none"><X size={14} /></button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && (
                <>
                  <div className="glass-card p-4 rounded-xl mt-1">
                    <div className="flex justify-between mb-1.5"><span className="text-xs text-neutral-500">Subtotal</span><span className="text-base font-black text-black">{fmt$(cartTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-[11px] text-neutral-400">En Bolívares</span><span className="text-[11px] text-neutral-400">{fmtBs(cartTotal, rate)}</span></div>
                  </div>
                  <button onClick={() => setStep("form")} className={primaryBtn}>
                    CONTINUAR <ChevronRight size={13} />
                  </button>
                </>
              )}
            </>
          )}

          {/* STEP: FORM */}
          {step === "form" && (
            <>
              {[
                { label: "Nombre completo", key: "name",  placeholder: "Juan Pérez",       icon: <User size={13} /> },
                { label: "WhatsApp",        key: "phone", placeholder: "+58 412 000 0000", icon: <Phone size={13} /> },
                { label: "Hora límite",     key: "time",  placeholder: "Hasta las 6:00 PM",icon: <Clock size={13} /> },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1">{f.icon}{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string} onChange={e => F(f.key, e.target.value)} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1"><MapPin size={13} />Dirección</label>
                <textarea placeholder="Urbanización, calle, edificio..." value={form.address} onChange={e => F("address", e.target.value)} rows={3} className={inputCls + " resize-none"} />
              </div>
              <button onClick={() => setStep("map")} className={secondBtn.replace("flex-1", "w-full")}>
                <MapPin size={13} className="text-green-600" /> FIJAR UBICACIÓN GPS (OPCIONAL)
              </button>
              <div className="flex gap-2.5 mt-1">
                <button onClick={() => setStep("cart")} className={secondBtn}>← VOLVER</button>
                <button onClick={() => setStep("payment")} disabled={!form.name || !form.phone} className={primaryBtn + " flex-1"} style={{ width: "auto" }}>
                  PAGO →
                </button>
              </div>
            </>
          )}

          {/* STEP: MAP */}
          {step === "map" && (
            <>
              <p className="text-xs text-neutral-400 text-center leading-relaxed">Arrastra el marcador a tu ubicación exacta</p>
              <button onClick={() => setMapMode(true)} className={secondBtn.replace("flex-1", "w-full")}>
                <MapPin size={13} /> CARGAR MAPA INTERACTIVO
              </button>
              {mapMode && <div ref={mapRef} className="h-[280px] rounded-xl overflow-hidden border border-neutral-200/80" />}
              <div className="glass-card p-3 rounded-xl text-[11px] text-neutral-500 font-medium">
                📍 Lat: {coords.lat} · Lng: {coords.lng}
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setStep("form")} className={secondBtn}>← VOLVER</button>
                <button onClick={() => setStep("payment")} className={primaryBtn + " flex-1"} style={{ width: "auto" }}>
                  <Check size={12} /> CONFIRMAR
                </button>
              </div>
            </>
          )}

          {/* STEP: PAYMENT */}
          {step === "payment" && (
            <>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1"><CreditCard size={13} />Método de pago</label>
                <div className="relative">
                  <select value={form.method} onChange={e => F("method", e.target.value)} className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                    <option value="">Seleccionar...</option>
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
              {needsReceipt && (
                <div>
                  <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1"><Camera size={13} />Comprobante</label>
                  <label className="glass-card border-2 border-dashed border-neutral-200/80 p-7 flex flex-col items-center gap-2.5 cursor-pointer rounded-xl">
                    <Upload size={22} className="text-neutral-300" />
                    <span className="text-[11px] text-neutral-400 font-semibold">{form.receipt ?? "Adjuntar captura de pago"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => F("receipt", e.target.files?.[0]?.name ?? "")} />
                  </label>
                </div>
              )}
              <div className="glass-card p-4 rounded-xl">
                <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mb-3">Resumen del pedido</p>
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between text-xs text-neutral-500 mb-1.5 font-medium">
                    <span>{i.name} ×{i.qty}</span><span className="font-bold">{fmt$(i.price * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-3 border-t border-neutral-100">
                  <span className="text-sm font-black text-black uppercase">Total</span>
                  <div className="text-right">
                    <div className="text-base font-black text-black">{fmt$(cartTotal)}</div>
                    <div className="text-[11px] text-neutral-400">{fmtBs(cartTotal, rate)}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 mt-1">
                <button onClick={() => setStep("form")} className={secondBtn}>← VOLVER</button>
                <button onClick={handleConfirm} disabled={!form.method}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer transition-all duration-200 disabled:opacity-40"
                  style={{ background: "rgba(34,168,90,0.88)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(34,168,90,0.3)" }}>
                  <MessageSquare size={13} /> ENVIAR POR WHATSAPP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
