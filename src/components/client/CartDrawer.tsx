"use client";
import { useState, useRef, useEffect } from "react";
import {
  X, Minus, Plus, ChevronRight, Check, Phone, User, Clock,
  MapPin, Upload, Camera, CreditCard, MessageSquare,
  Navigation, Package, Copy, CheckCircle2, Plus as PlusIcon,
  Trash2, AlertCircle,
} from "lucide-react";
import { fmt$, fmtBs } from "@/lib/store";
import type { CartItem, Order, PaymentMethod, PaymentEntry } from "@/lib/types";
import { DEFAULT_PAYMENT_METHODS } from "@/lib/data";

const STEPS = ["cart", "delivery", "payment", "success"] as const;
type Step = typeof STEPS[number];

interface CartDrawerProps {
  cart:        CartItem[];
  rate:        number;
  cartTotal:   number;
  onRemove:    (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClose:     () => void;
  onSaveOrder: (o: Omit<Order, "id" | "date" | "status">) => void;
  design?: { whatsappNumber?: string; paymentMethods?: PaymentMethod[] };
}

export function CartDrawer({
  cart, rate, cartTotal, onRemove, onUpdateQty, onClose, onSaveOrder, design,
}: CartDrawerProps) {
  const [step,     setStep]     = useState<Step>("cart");
  const [form,     setForm]     = useState({ name:"", phone:"", time:"", address:"", lat:10.4806, lng:-66.9036 });
  const [payments, setPayments] = useState<PaymentEntry[]>([{ method:"", amount:0, receipt:null }]);
  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [locating,   setLocating]   = useState(false);
  const [orderId,    setOrderId]    = useState("");
  const [copied,     setCopied]     = useState(false);
  const mapRef  = useRef<HTMLDivElement>(null);
  const lMap    = useRef<unknown>(null);
  const lMarker = useRef<unknown>(null);

  const pMethods  = (design?.paymentMethods || DEFAULT_PAYMENT_METHODS).filter(m => m.active);
  const waNumber  = design?.whatsappNumber || "584141013137";

  // Calcular totales de pagos
  const totalPaid  = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const balance    = Math.max(0, cartTotal - totalPaid);
  const overpaid   = totalPaid > cartTotal ? totalPaid - cartTotal : 0;

  // Método principal para backwards compat
  const mainMethod = payments[0]?.method || "";

  const F = (k: string, v: string|number) => setForm(f => ({ ...f, [k]: v }));

  // Cargar mapa automáticamente
  useEffect(() => {
    if (step !== "delivery" || mapLoaded || !mapRef.current) return;
    loadMap(form.lat, form.lng);
  }, [step]);

  const loadMap = (lat: number, lng: number) => {
    const init = () => {
      const L = (window as unknown as { L: unknown }).L as {
        map: (...a: unknown[]) => unknown;
        tileLayer: (...a: unknown[]) => { addTo: (...a: unknown[]) => void };
        marker: (...a: unknown[]) => { addTo: (...a: unknown[]) => unknown; on: (...a: unknown[]) => void; setLatLng: (...a: unknown[]) => void };
      };
      if (!L || !mapRef.current) return;
      const m = L.map(mapRef.current!, { center:[lat,lng], zoom:15 } as unknown) as { remove:()=>void; setView:(...a:unknown[])=>void };
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m as unknown);
      const marker = L.marker([lat,lng], { draggable:true } as unknown).addTo(m as unknown);
      (marker as { on:(e:string,cb:(e:unknown)=>void)=>void }).on("dragend", (e:unknown) => {
        const p = (e as { target:{ getLatLng:()=>{ lat:number; lng:number } } }).target.getLatLng();
        setForm(f => ({ ...f, lat:parseFloat(p.lat.toFixed(6)), lng:parseFloat(p.lng.toFixed(6)) }));
      });
      lMap.current    = m;
      lMarker.current = marker;
      setMapLoaded(true);
    };
    const w = window as unknown as { L?: unknown };
    if (w.L) { init(); return; }
    const lk = document.createElement("link"); lk.rel="stylesheet"; lk.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lk);
    const sc = document.createElement("script"); sc.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; sc.onload=init; document.head.appendChild(sc);
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setForm(f => ({ ...f, lat, lng }));
        const m  = lMap.current    as { setView:(...a:unknown[])=>void }|null;
        const mk = lMarker.current as { setLatLng:(...a:unknown[])=>void }|null;
        if (m)  m.setView([lat,lng], 16);
        if (mk) mk.setLatLng([lat,lng]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy:true, timeout:8000 }
    );
  };

  // ── Manejo de comprobante con base64 ──
  const handleReceipt = (file: File, idx: number) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target?.result as string;
      setPayments(prev => prev.map((p, i) => i === idx ? { ...p, receipt: base64, receiptName: file.name } as PaymentEntry & { receiptName?: string } : p));
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const mapsLink = `https://maps.google.com/?q=${form.lat},${form.lng}`;
    const oid = Date.now().toString(36).toUpperCase();
    setOrderId(oid);

    const orderForm = {
      name: form.name, phone: form.phone, time: form.time,
      address: form.address, lat: form.lat, lng: form.lng,
      method:    mainMethod,
      receipt:   payments[0]?.receipt || null,
      payments,
      totalPaid,
      balance,
    };

    onSaveOrder({ cart, total: cartTotal, form: orderForm, mapsLink });

    // Armar mensaje WhatsApp
    const paymentLines = payments.filter(p => p.method).map(p =>
      `💳 ${p.method}: ${fmt$(p.amount)}${p.amount < cartTotal && payments.length > 1 ? "" : ""}`
    );

    const msg = encodeURIComponent([
      `🛒 *NUEVO PEDIDO — Fit +58 Caracas*`,
      `🆔 Pedido #${oid}`,
      "─────────────────────────",
      ...cart.map(i => `• ${i.name} ×${i.qty} → ${fmt$(i.price * i.qty)}`),
      "─────────────────────────",
      `💰 *Total: ${fmt$(cartTotal)} | ${fmtBs(cartTotal, rate)}*`,
      ...paymentLines,
      balance > 0 ? `⚠️ Saldo pendiente: ${fmt$(balance)}` : `✅ Pagado completo`,
      "─────────────────────────",
      `👤 ${form.name}`, `📱 ${form.phone}`, `⏰ ${form.time}`,
      `📍 ${form.address}`, `🗺 ${mapsLink}`,
    ].join("\n"));

    import("@/lib/notifications").then(({ notifyNewOrder }) => {
      notifyNewOrder({ id: oid, total: cartTotal, cart, form: orderForm });
    });
    window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
    setStep("success");
  };

  const copyTicket = () => {
    const payLines = payments.filter(p => p.method && p.amount > 0).map(p =>
      `  ${p.method}: ${fmt$(p.amount)}`
    ).join("\n");
    const text = [
      `🧾 TICKET DE COMPRA — Fit +58 Caracas`,
      `Pedido #${orderId}`,
      `Fecha: ${new Date().toLocaleString("es-VE")}`,
      "─────────────────────────",
      ...cart.map(i => `${i.name} ×${i.qty}  →  ${fmt$(i.price*i.qty)}`),
      "─────────────────────────",
      `TOTAL: ${fmt$(cartTotal)} | ${fmtBs(cartTotal, rate)}`,
      "",
      `PAGO:`,
      payLines,
      balance > 0 ? `⚠️ SALDO PENDIENTE: ${fmt$(balance)}` : `✅ PAGO COMPLETADO`,
      "─────────────────────────",
      `Cliente: ${form.name} · ${form.phone}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false), 2000); });
  };

  const inputCls  = "w-full border border-neutral-200/80 px-4 py-3 text-sm text-black bg-white/72 backdrop-blur-sm rounded-xl font-[inherit] field-input";
  const primaryBtn = "w-full flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer transition-all bg-[rgba(17,17,17,0.90)] text-white border border-white/10";
  const secondBtn  = "flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-bold tracking-widest uppercase rounded-xl cursor-pointer transition-all bg-white/65 text-neutral-600 border border-neutral-200/80";

  return (
    <div className="fixed inset-0 z-[150] flex">
      <div className="animate-overlay-in absolute inset-0 bg-black/45 backdrop-blur-md" onClick={step==="success"?onClose:undefined}/>
      <div className="animate-drawer-in glass absolute right-0 top-0 bottom-0 w-full max-w-[440px] flex flex-col shadow-2xl overflow-y-auto rounded-none">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/40 sticky top-0 bg-white/88 backdrop-blur-2xl z-10">
          <div>
            <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase mb-0.5">
              {step==="cart"?"Carrito":step==="delivery"?"Datos y Ubicación":step==="payment"?"Pago":"Pedido Confirmado"}
            </p>
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              {step==="cart"   ? `${cart.length} PRODUCTO${cart.length!==1?"S":""}`
               :step==="delivery" ? "¿DÓNDE TE LO ENVIAMOS?"
               :step==="payment"  ? "MÉTODO DE PAGO"
               : `PEDIDO #${orderId}`}
            </h2>
          </div>
          <button onClick={onClose} className="fluent-hover w-9 h-9 border border-neutral-200/80 bg-white/65 flex items-center justify-center cursor-pointer rounded-xl">
            <X size={16}/>
          </button>
        </div>

        {/* Progress */}
        {step !== "success" && (
          <>
            <div className="flex h-0.5 bg-neutral-100/80">
              {["cart","delivery","payment"].map((_,i) => {
                const cur = ["cart","delivery","payment"].indexOf(step);
                return <div key={i} className="flex-1 transition-all duration-500"
                  style={{background:i<=cur?"linear-gradient(90deg,#111,#555)":"transparent"}}/>;
              })}
            </div>
            <div className="flex justify-center gap-5 py-3">
              {["cart","delivery","payment"].map((s,i) => {
                const cur = ["cart","delivery","payment"].indexOf(step);
                return (
                  <div key={s} className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                    style={{background:i<=cur?"#111":"#f0f2f5",border:i===cur?"2px solid #111":"2px solid transparent",boxShadow:i<=cur?"0 2px 8px rgba(0,0,0,0.18)":"none"}}>
                    {i<cur ? <Check size={11} color="#fff"/> : <span className="text-[9px] font-black" style={{color:i===cur?"#fff":"#bbb"}}>{i+1}</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="flex-1 px-6 pb-8 flex flex-col gap-3.5">

          {/* ── CART ── */}
          {step === "cart" && (
            <>
              {cart.length === 0 && (
                <div className="text-center py-16 text-neutral-400">
                  <Package size={40} className="mx-auto mb-3"/>
                  <p className="text-sm font-semibold">Tu carrito está vacío</p>
                </div>
              )}
              {cart.map(item => (
                <div key={item.id} className="glass-card p-3.5 rounded-2xl flex gap-3">
                  <img src={item.img} alt={item.name} className="w-14 h-14 object-contain rounded-xl bg-neutral-50" loading="lazy" decoding="async"
                    onError={e=>(e.currentTarget.style.opacity="0")}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-black uppercase leading-snug mb-1">{item.name}</p>
                    <p className="text-[11px] text-neutral-400 mb-2">{fmt$(item.price)} c/u</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>onUpdateQty(item.id,-1)} className="w-7 h-7 border border-neutral-200/80 bg-white/70 flex items-center justify-center rounded-lg cursor-pointer"><Minus size={11}/></button>
                      <span className="text-sm font-black min-w-[22px] text-center">{item.qty}</span>
                      <button onClick={()=>onUpdateQty(item.id,1)}  className="w-7 h-7 border border-neutral-200/80 bg-white/70 flex items-center justify-center rounded-lg cursor-pointer"><Plus size={11}/></button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-black mb-1.5">{fmt$(item.price*item.qty)}</p>
                    <button onClick={()=>onRemove(item.id)} className="text-neutral-300 hover:text-red-500 cursor-pointer bg-none border-none"><X size={14}/></button>
                  </div>
                </div>
              ))}
              {cart.length > 0 && (
                <>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="flex justify-between mb-1.5"><span className="text-xs text-neutral-500">Subtotal</span><span className="text-base font-black text-black">{fmt$(cartTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-[11px] text-neutral-400">En Bolívares</span><span className="text-[11px] text-neutral-400">{fmtBs(cartTotal,rate)}</span></div>
                  </div>
                  <button onClick={()=>setStep("delivery")} className={primaryBtn}>CONTINUAR <ChevronRight size={13}/></button>
                </>
              )}
            </>
          )}

          {/* ── DELIVERY ── */}
          {step === "delivery" && (
            <>
              {[
                { label:"Nombre completo", key:"name",  placeholder:"Juan Pérez",       icon:<User size={13}/> },
                { label:"WhatsApp",        key:"phone", placeholder:"+58 414 000 0000",  icon:<Phone size={13}/> },
                { label:"Hora límite",     key:"time",  placeholder:"Hasta las 6:00 PM", icon:<Clock size={13}/> },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1">{f.icon}{f.label}</label>
                  <input type="text" placeholder={f.placeholder} value={form[f.key as "name"|"phone"|"time"]} onChange={e=>F(f.key,e.target.value)} className={inputCls}/>
                </div>
              ))}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1"><MapPin size={13}/>Dirección</label>
                <textarea placeholder="Urbanización, calle, edificio, apartamento..." value={form.address} onChange={e=>F("address",e.target.value)} rows={2} className={inputCls+" resize-none"}/>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase flex items-center gap-1">
                    <MapPin size={13} className="text-green-600"/> Ubicación GPS
                  </label>
                  <button onClick={goToMyLocation} disabled={locating}
                    className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border-none cursor-pointer">
                    <Navigation size={11}/> {locating?"Buscando...":"Mi ubicación"}
                  </button>
                </div>
                <div ref={mapRef} className="h-[200px] rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-100"/>
                {!mapLoaded && <div className="text-center text-[10px] text-neutral-400 mt-1">Cargando mapa...</div>}
                <div className="glass-card p-2.5 rounded-lg text-[10px] text-neutral-500 mt-1.5 flex items-center gap-1.5">
                  <MapPin size={11} className="text-green-600"/> Lat: {form.lat} · Lng: {form.lng}
                </div>
              </div>
              <div className="flex gap-2.5 mt-1">
                <button onClick={()=>setStep("cart")} className={secondBtn}>← VOLVER</button>
                <button onClick={()=>setStep("payment")} disabled={!form.name||!form.phone||!form.address}
                  className={primaryBtn+" flex-1"} style={{width:"auto"}}>PAGO →</button>
              </div>
            </>
          )}

          {/* ── PAYMENT ── */}
          {step === "payment" && (
            <>
              {/* Resumen rápido */}
              <div className="glass-card p-3.5 rounded-xl">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-black uppercase">Total a pagar</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-black">{fmt$(cartTotal)}</span>
                    <span className="text-[10px] text-neutral-400 ml-1">{fmtBs(cartTotal,rate)}</span>
                  </div>
                </div>
              </div>

              {/* Métodos de pago — puede agregar varios */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase flex items-center gap-1">
                    <CreditCard size={13}/>Método{payments.length>1?"s":""} de Pago
                  </label>
                  {balance > 0 && payments.every(p=>p.method) && (
                    <button onClick={()=>setPayments(p=>[...p,{method:"",amount:balance,receipt:null}])}
                      className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border-none cursor-pointer">
                      <PlusIcon size={11}/> Añadir método
                    </button>
                  )}
                </div>

                {payments.map((pm, idx) => {
                  const selected = pMethods.find(m=>m.name===pm.method);
                  const isLast   = idx === payments.length - 1;
                  const autoAmt  = idx > 0 ? Math.max(0, cartTotal - payments.slice(0,idx).reduce((s,p)=>s+(p.amount||0),0)) : null;

                  return (
                    <div key={idx} className="glass-card rounded-xl p-4 flex flex-col gap-2.5"
                      style={{border: idx===0?"1px solid rgba(255,255,255,0.6)":"1px solid rgba(34,168,90,0.3)"}}>
                      {payments.length > 1 && (
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-wide">
                            Pago {idx+1}
                          </span>
                          {idx > 0 && (
                            <button onClick={()=>setPayments(p=>p.filter((_,i)=>i!==idx))}
                              className="w-6 h-6 flex items-center justify-center text-neutral-300 hover:text-red-500 border-none bg-none cursor-pointer">
                              <Trash2 size={12}/>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Selector método */}
                      <select value={pm.method}
                        onChange={e=>{
                          const method = e.target.value;
                          setPayments(prev => prev.map((p,i) => i===idx ? {
                            ...p, method,
                            amount: autoAmt !== null ? autoAmt : (idx===0 ? cartTotal : p.amount),
                          } : p));
                        }}
                        className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit] appearance-none cursor-pointer">
                        <option value="">Seleccionar método...</option>
                        {pMethods.map(m=><option key={m.id}>{m.name}</option>)}
                      </select>

                      {/* Monto */}
                      <div>
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wide mb-1">
                          Monto a pagar con este método
                        </label>
                        <input type="number" step="0.01" min="0"
                          value={pm.amount || ""}
                          onChange={e=>{
                            const amount = parseFloat(e.target.value)||0;
                            setPayments(prev=>prev.map((p,i)=>i===idx?{...p,amount}:p));
                          }}
                          className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit]"
                          placeholder={`${fmt$(autoAmt ?? cartTotal)}`}/>
                        {idx===0 && payments.length===1 && pm.amount > 0 && pm.amount < cartTotal && (
                          <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1">
                            <AlertCircle size={9}/>Saldo restante: {fmt$(cartTotal-pm.amount)} — añade otro método
                          </p>
                        )}
                      </div>

                      {/* Datos bancarios */}
                      {selected && selected.details && (
                        <div className="bg-neutral-50/80 rounded-lg p-3">
                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-1.5">Datos para {selected.name}</p>
                          <pre className="text-[11px] text-neutral-700 font-[inherit] whitespace-pre-wrap leading-relaxed m-0">{selected.details}</pre>
                        </div>
                      )}

                      {/* Comprobante */}
                      {selected?.needsReceipt && (
                        <div>
                          <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5 flex items-center gap-1">
                            <Camera size={11}/>Comprobante de pago
                          </label>
                          {pm.receipt && pm.receipt.startsWith("data:") ? (
                            <div className="flex items-center gap-2 glass-card p-2 rounded-lg">
                              <img src={pm.receipt} alt="comprobante" className="w-12 h-12 object-cover rounded-lg border border-neutral-200/60"/>
                              <div className="flex-1">
                                <p className="text-[9px] font-bold text-green-600">✓ Comprobante adjunto</p>
                                <button onClick={()=>setPayments(prev=>prev.map((p,i)=>i===idx?{...p,receipt:null}:p))}
                                  className="text-[9px] text-red-400 border-none bg-none cursor-pointer font-[inherit]">Quitar</button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center gap-1.5 py-4 border-2 border-dashed border-neutral-200/80 rounded-xl cursor-pointer hover:border-green-400/60 transition-all">
                              <Upload size={16} className="text-neutral-300"/>
                              <span className="text-[10px] font-bold text-neutral-400">Adjuntar captura de pago</span>
                              <input type="file" accept="image/*" className="hidden"
                                onChange={e=>{const f=e.target.files?.[0];if(f)handleReceipt(f,idx);e.target.value="";}}/>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Balance total */}
              <div className="glass-card p-4 rounded-xl">
                <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mb-3">Resumen del pedido</p>
                {cart.map(i=>(
                  <div key={i.id} className="flex justify-between text-xs text-neutral-500 mb-1.5 font-medium">
                    <span>{i.name} ×{i.qty}</span><span className="font-bold">{fmt$(i.price*i.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-neutral-100 pt-3 mt-2 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm font-black text-black uppercase">Total</span>
                    <span className="text-base font-black text-black">{fmt$(cartTotal)}</span>
                  </div>
                  {payments.filter(p=>p.method&&p.amount>0).map((p,i)=>(
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-neutral-500">{p.method}</span>
                      <span className="font-bold text-green-600">−{fmt$(p.amount)}</span>
                    </div>
                  ))}
                  {totalPaid > 0 && (
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-neutral-100">
                      <span style={{color:balance>0?"#e53e3e":"#22a85a"}}>
                        {balance>0?"Saldo pendiente":"✅ Pago completo"}
                      </span>
                      <span style={{color:balance>0?"#e53e3e":"#22a85a"}}>
                        {balance>0?fmt$(balance):fmt$(0)}
                      </span>
                    </div>
                  )}
                  {overpaid > 0 && (
                    <div className="flex justify-between text-xs text-amber-600">
                      <span>Cambio a devolver</span><span>{fmt$(overpaid)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 mt-1">
                <button onClick={()=>setStep("delivery")} className={secondBtn}>← VOLVER</button>
                <button onClick={handleConfirm} disabled={!mainMethod||totalPaid===0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer transition-all disabled:opacity-40"
                  style={{background:"rgba(34,168,90,0.88)",color:"#fff",border:"1px solid rgba(34,168,90,0.3)"}}>
                  <MessageSquare size={13}/> ENVIAR POR WHATSAPP
                </button>
              </div>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-green-500"/>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black text-black uppercase tracking-tight mb-1">¡Pedido Realizado!</h3>
                <p className="text-xs text-neutral-400">Tu pedido fue enviado por WhatsApp. Te contactaremos pronto para coordinar la entrega.</p>
              </div>

              {/* Ticket completo */}
              <div className="w-full glass-card rounded-2xl p-5 border-2 border-dashed border-neutral-200/60">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase">🧾 Ticket de Compra</p>
                  <span className="text-[10px] font-black text-neutral-500">#{orderId}</span>
                </div>
                <p className="text-[10px] text-neutral-400 mb-3">{new Date().toLocaleString("es-VE")}</p>

                {/* Productos comprados */}
                <div className="flex flex-col gap-1.5 mb-3">
                  {cart.map(i=>(
                    <div key={i.id} className="flex justify-between text-xs">
                      <span className="text-neutral-600 flex-1">{i.name} ×{i.qty}</span>
                      <span className="font-bold text-black ml-2">{fmt$(i.price*i.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="border-t border-dashed border-neutral-200 pt-3 mb-3">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-black text-black uppercase">Total</span>
                    <div className="text-right">
                      <div className="text-lg font-black text-black">{fmt$(cartTotal)}</div>
                      <div className="text-[10px] text-neutral-400">{fmtBs(cartTotal,rate)}</div>
                    </div>
                  </div>

                  {/* Pagos realizados */}
                  {payments.filter(p=>p.method&&p.amount>0).map((p,i)=>(
                    <div key={i} className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">{p.method}</span>
                      <span className="font-bold text-green-600">{fmt$(p.amount)}</span>
                    </div>
                  ))}

                  {/* Balance */}
                  {balance > 0 ? (
                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100 flex justify-between text-xs">
                      <span className="font-black text-red-600">⚠️ Saldo pendiente</span>
                      <span className="font-black text-red-600">{fmt$(balance)}</span>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 rounded-lg bg-green-50 border border-green-100 text-center">
                      <span className="text-[10px] font-black text-green-600">✅ Pago completado</span>
                    </div>
                  )}
                </div>

                {/* Datos cliente */}
                <div className="flex flex-col gap-1 text-[10px] text-neutral-500">
                  <div className="flex items-center gap-1.5"><User size={10}/> {form.name}</div>
                  <div className="flex items-center gap-1.5"><Phone size={10}/> {form.phone}</div>
                  <div className="flex items-center gap-1.5"><MapPin size={10}/> {form.address}</div>
                </div>
              </div>

              <button onClick={copyTicket}
                className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-wide rounded-xl border border-neutral-200/80 bg-white/70 cursor-pointer">
                {copied?<><CheckCircle2 size={13} className="text-green-500"/>COPIADO</>:<><Copy size={13}/>COPIAR TICKET</>}
              </button>

              <button onClick={onClose}
                className="w-full flex items-center justify-center gap-1.5 py-3.5 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer bg-black text-white">
                CONTINUAR COMPRANDO
              </button>

              <p className="text-[10px] text-neutral-400 text-center">
                Número de pedido: <strong>#{orderId}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
