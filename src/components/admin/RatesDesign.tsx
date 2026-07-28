"use client";
import { NotifSettings } from "./NotifSettings";
import { useState, useEffect, useRef } from "react";
import {
  RefreshCw, Save, Plus, Trash2, ExternalLink, Upload,
  Navigation, Star, Globe, DollarSign,
} from "lucide-react";
import { fileToBase64, fmt$, fmtBs } from "@/lib/store";
import { DEFAULT_DESIGN } from "@/lib/data";
import { Btn, Field, Select, ColorRow } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { ExchangeRate, DesignConfig, NavLink, EditorialConfig, CardTypography } from "@/lib/types";

const genId = () => Math.random().toString(36).slice(2, 9);

/* ── RATES ──────────────────────────────────────────────────────────────────
 *
 *  TWO INDEPENDENT RATES:
 *
 *  rateBCV   → BCV / Euro: informative only, shown in client catalog header.
 *              "Tasa de Cambio BCV Euro (€) 1$ = Bs. XX.XX"
 *              Does NOT calculate any product prices.
 *
 *  rate      → Prices rate (Binance / Parallel): calculates Bs. shown on
 *              each product card, cart, and WhatsApp ticket.
 *              NEVER visible to the client — only admins see it here.
 *
 * ──────────────────────────────────────────────────────────────────────── */
/* ── RichEditor — componente estable sin bug de contentEditable+React ── */
function RichEditor({
  label, value, onChange, defaultVal, minSize, maxSize,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  defaultVal: string;
  minSize: number;
  maxSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const midSize = Math.round((minSize + maxSize) / 2);

  // Inicializar contenido UNA SOLA VEZ al montar — nunca más
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || defaultVal;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const setSize = (px: number) => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      // Aplicar tamaño solo a la selección
      document.execCommand("fontSize", false, "7");
      ref.current?.querySelectorAll("font[size='7']").forEach(el => {
        const e = el as HTMLElement;
        e.removeAttribute("size");
        e.style.fontSize = px + "px";
      });
    } else {
      // Sin selección → cambiar todo el contenedor
      if (ref.current) ref.current.style.fontSize = px + "px";
    }
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const adjLineHeight = (delta: number) => {
    if (!ref.current) return;
    const cur = parseFloat(ref.current.style.lineHeight || "1.4");
    ref.current.style.lineHeight = Math.max(1, Math.min(3, +(cur + delta).toFixed(1))).toString();
    onChange(ref.current.innerHTML);
  };

  const TOOL_BTN = "w-7 h-7 flex items-center justify-center rounded border border-neutral-200 bg-white cursor-pointer text-black hover:bg-neutral-50 active:scale-95 transition-all shrink-0";
  const SZ_BTN  = "px-2 h-7 flex items-center justify-center rounded border border-neutral-200 bg-white cursor-pointer text-[10px] font-black text-black hover:bg-neutral-50 active:scale-95 transition-all shrink-0";

  return (
    <div className="flex flex-col gap-0">
      <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">{label}</label>

      {/* Barra herramientas */}
      <div className="flex items-center gap-1 flex-wrap bg-neutral-50 border border-neutral-200 border-b-0 rounded-t-lg px-2 py-1.5">
        <button type="button" className={TOOL_BTN} onMouseDown={e => { e.preventDefault(); exec("bold"); }}>
          <strong style={{ fontSize: 13 }}>B</strong>
        </button>
        <button type="button" className={TOOL_BTN} onMouseDown={e => { e.preventDefault(); exec("italic"); }}>
          <em style={{ fontSize: 13 }}>I</em>
        </button>
        <button type="button" className={TOOL_BTN} onMouseDown={e => { e.preventDefault(); exec("underline"); }}>
          <span className="underline" style={{ fontSize: 12 }}>U</span>
        </button>
        <div className="w-px h-5 bg-neutral-200 mx-0.5"/>
        <button type="button" className={SZ_BTN} onMouseDown={e => { e.preventDefault(); setSize(minSize); }}>{minSize}px</button>
        <button type="button" className={SZ_BTN} onMouseDown={e => { e.preventDefault(); setSize(midSize); }}>{midSize}px</button>
        <button type="button" className={SZ_BTN} onMouseDown={e => { e.preventDefault(); setSize(maxSize); }}>{maxSize}px</button>
        <div className="w-px h-5 bg-neutral-200 mx-0.5"/>
        <button type="button" className={SZ_BTN} title="Reducir interlineado" onMouseDown={e => { e.preventDefault(); adjLineHeight(-0.1); }}>↕−</button>
        <button type="button" className={SZ_BTN} title="Aumentar interlineado" onMouseDown={e => { e.preventDefault(); adjLineHeight(+0.1); }}>↕+</button>
        <div className="w-px h-5 bg-neutral-200 mx-0.5"/>
        <button type="button" className={SZ_BTN} title="Salto de línea" onMouseDown={e => { e.preventDefault(); exec("insertHTML", "<br/>"); }}>↵</button>
        <button type="button" className={SZ_BTN} title="Limpiar formato" onMouseDown={e => { e.preventDefault(); exec("removeFormat"); }}>✕</button>
      </div>

      {/* Área editable */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        className="field-input w-full border border-neutral-200 px-3 py-2.5 bg-white rounded-b-lg outline-none min-h-[56px] text-sm"
        style={{ lineHeight: 1.4 }}
      />
      <p className="text-[9px] text-neutral-400 mt-1">Selecciona texto y aplica formato · ↵ inserta salto de línea</p>
    </div>
  );
}

export function RatesSection({
  rate,    onSaveRate,
  rateBCV, onSaveRateBCV,
  products,
}: {
  rate:          ExchangeRate;
  onSaveRate:    (r: ExchangeRate) => void;
  rateBCV:       ExchangeRate;
  onSaveRateBCV: (r: ExchangeRate) => void;
  products:      { name: string; price: number; img?: string }[];
}) {
  const [draftRate,    setDraftRate]    = useState({ ...rate    });
  const [draftRateBCV, setDraftRateBCV] = useState({ ...rateBCV });
  const toast = useToast();

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Configuración de Tasas</h1>
        <p className="text-xs text-neutral-400 mt-1">Dos tasas independientes con funciones distintas</p>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>

        {/* ── TASA BCV / EURO — solo informativa ────────────────────────── */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-blue-500 to-blue-400" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/12 flex items-center justify-center">
              <Globe size={14} className="text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-blue-500 tracking-[2px] uppercase m-0">Tasa BCV / Euro</p>
          </div>
          <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">
            Solo visible en el catálogo del cliente como referencia.{" "}
            <strong className="text-neutral-500">No afecta los precios de los productos.</strong>
          </p>

          <div className="neumorph text-center py-5 rounded-2xl mb-5">
            <p className="text-[52px] font-black text-black leading-none mb-1" style={{ letterSpacing: "-2px" }}>
              {draftRateBCV.value.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-400 mb-2.5">Bs. por $1 USD</p>
            <span className="text-[9px] font-black px-3.5 py-1.5 bg-blue-500/10 text-blue-500 tracking-[1.5px] uppercase rounded-lg">
              {draftRateBCV.mode === "bcv" ? "BCV OFICIAL" : "EURO / DIVISAS"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <Select
              label="Fuente"
              value={draftRateBCV.mode}
              onChange={e => setDraftRateBCV(r => ({ ...r, mode: e.target.value as ExchangeRate["mode"] }))}>
              <option value="bcv">BCV Oficial</option>
              <option value="euro">Euro / Divisas</option>
            </Select>
            <Field
              label="Valor en Bs."
              type="number"
              value={draftRateBCV.value}
              onChange={e => setDraftRateBCV(r => ({ ...r, value: parseFloat(e.target.value) || 0 }))}
            />
            <button
              onClick={() => { onSaveRateBCV(draftRateBCV); toast("Tasa BCV actualizada", "📊"); }}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer border-none transition-all duration-200 hover:-translate-y-px"
              style={{ background: "rgba(59,130,246,0.88)", color: "#fff" }}>
              <RefreshCw size={13} /> ACTUALIZAR TASA BCV
            </button>
            {/* Info box */}
            <div className="bg-blue-500/6 border border-blue-500/15 rounded-xl p-3">
              <p className="text-[10px] font-bold text-blue-500 mb-1">ℹ️ Dónde aparece esta tasa</p>
              <p className="text-[10px] text-neutral-500 m-0 leading-relaxed">
                Solo en el subtítulo del catálogo del cliente:
                <br />
                <em className="text-neutral-400">
                  "Tasa de Cambio BCV Euro (€) 1$ = Bs.{" "}
                  <strong className="text-blue-500">{draftRateBCV.value.toFixed(2)}</strong>"
                </em>
              </p>
            </div>
          </div>
        </div>

        {/* ── TASA DE PRECIOS — Binance / Paralelo ──────────────────────── */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          {/* Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-amber-400 to-yellow-400" />

          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400/12 flex items-center justify-center">
              <DollarSign size={14} className="text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-amber-500 tracking-[2px] uppercase m-0">Tasa de Precios</p>
          </div>
          <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">
            Calcula los precios en Bs. de cada producto.{" "}
            <strong className="text-neutral-500">Solo visible en Admin. El cliente no la ve.</strong>
          </p>

          <div className="neumorph text-center py-5 rounded-2xl mb-5">
            <p className="text-[52px] font-black text-black leading-none mb-1" style={{ letterSpacing: "-2px" }}>
              {draftRate.value.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-400 mb-2.5">Bs. por $1 USD</p>
            <span className="text-[9px] font-black px-3.5 py-1.5 bg-amber-400/10 text-amber-500 tracking-[1.5px] uppercase rounded-lg">
              {draftRate.mode === "custom" ? "PERSONALIZADA / BINANCE" : draftRate.mode === "bcv" ? "BCV" : "EURO"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <Select
              label="Fuente de Precio"
              value={draftRate.mode}
              onChange={e => setDraftRate(r => ({ ...r, mode: e.target.value as ExchangeRate["mode"] }))}>
              <option value="custom">Binance / Paralelo</option>
              <option value="bcv">BCV Oficial</option>
              <option value="euro">Euro / Divisas</option>
            </Select>
            <Field
              label="Valor en Bs."
              type="number"
              value={draftRate.value}
              onChange={e => setDraftRate(r => ({ ...r, value: parseFloat(e.target.value) || 0 }))}
            />
            <button
              onClick={() => { onSaveRate(draftRate); toast("Tasa de precios actualizada", "💰"); }}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-[10px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer border-none transition-all duration-200 hover:-translate-y-px"
              style={{ background: "rgba(245,158,11,0.90)", color: "#fff" }}>
              <RefreshCw size={13} /> ACTUALIZAR TASA DE PRECIOS
            </button>
            {/* Info box */}
            <div className="bg-amber-400/6 border border-amber-400/15 rounded-xl p-3">
              <p className="text-[10px] font-bold text-amber-500 mb-1">⚙️ Dónde se aplica esta tasa</p>
              <p className="text-[10px] text-neutral-500 m-0 leading-relaxed">
                Precio en Bs. en cada tarjeta, modal de detalle, carrito y ticket WhatsApp.
                El cliente solo ve el resultado final, nunca la tasa.
              </p>
            </div>
          </div>
        </div>

        {/* ── SIMULADOR (usa tasa de precios) ──────────────────────────── */}
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-1">Simulador de precios</p>
          <p className="text-[10px] text-neutral-400 mb-5 leading-relaxed">
            Vista previa con tasa de precios{" "}
            <strong className="text-amber-500">Bs. {draftRate.value.toFixed(2)}</strong>
          </p>
          {products.slice(0, 8).map((p, i) => (
            <div key={i} className="flex items-center gap-3 pb-3 mb-3 border-b border-neutral-50">
              <div className="neumorph w-9 h-9 flex items-center justify-center shrink-0 rounded-lg overflow-hidden">
                {p.img && (
                  <img src={p.img} alt="" className="w-7 h-7 object-contain"
                    onError={e => (e.currentTarget.style.display = "none")} />
                )}
              </div>
              <span className="text-[11px] text-neutral-500 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
                {p.name}
              </span>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-black m-0 mb-0.5">{fmt$(p.price)}</p>
                <p className="text-[10px] text-neutral-400 m-0">{fmtBs(p.price, draftRate.value)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Notificaciones ── */}
        <div style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-3 flex items-center gap-1.5">
            🔔 Notificaciones de Pedidos
          </p>
          <NotifSettings/>
        </div>

      </div>
    </div>
  );
}

/* ── DESIGN CMS ─────────────────────────────────────────────────────────────
 *  (unchanged from previous version)
 * ──────────────────────────────────────────────────────────────────────── */
export function DesignSection({
  design,
  onSave,
}: {
  design: DesignConfig;
  onSave: (d: DesignConfig) => void;
}) {
  const [draft, setDraft] = useState({
    ...design,
    navLinks: [...(design.navLinks || DEFAULT_DESIGN.navLinks)],
  });
  const F = <K extends keyof DesignConfig>(k: K, v: DesignConfig[K]) =>
    setDraft(d => ({ ...d, [k]: v }));
  const toast = useToast();
  const save  = () => { onSave(draft); toast("Diseño guardado", "🎨"); };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Identidad Visual & CMS</h1>
          <p className="text-xs text-neutral-400 mt-1">Control total de la apariencia · Los cambios se aplican al guardar</p>
        </div>
        <Btn variant="green" onClick={save}><Save size={13} /> GUARDAR Y APLICAR</Btn>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>

        {/* Brand & Logo */}
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5 flex items-center gap-1.5">
            <Star size={13} />Identidad de Marca
          </p>
          <div className="flex flex-col gap-4">
            <Field label="Nombre de la Tienda" value={draft.brandName || ""} onChange={e => F("brandName", e.target.value)} />
            <Field label="Subtítulo / Categoría" value={draft.brandSub || ""} onChange={e => F("brandSub", e.target.value)} />
            <div>
              <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">Logo · URL o Archivo</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url" value={draft.logoUrl || ""} placeholder="https://..."
                  onChange={e => setDraft(d => ({ ...d, logoUrl: e.target.value, logoBase64: "" }))}
                  className="field-input flex-1 border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 backdrop-blur-sm rounded-lg font-[inherit]"
                />
                <label className="flex items-center gap-1.5 px-3 bg-white/65 border border-neutral-200/80 rounded-lg cursor-pointer text-[10px] font-bold text-neutral-500 whitespace-nowrap backdrop-blur-sm fluent-hover">
                  <Upload size={12} />JPG
                  <input type="file" accept="image/*" className="hidden" onChange={async e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    F("logoBase64", await fileToBase64(f)); F("logoUrl", "");
                    e.target.value = "";
                  }} />
                </label>
              </div>
              {(draft.logoBase64 || draft.logoUrl) && (
                <div className="flex items-center gap-2">
                  <img src={draft.logoBase64 || draft.logoUrl} alt=""
                    onError={e => (e.currentTarget.style.display = "none")}
                    className="w-12 h-12 object-contain rounded-lg border border-neutral-200/70 bg-white" />
                  <button onClick={() => setDraft(d => ({ ...d, logoUrl: "", logoBase64: "" }))}
                    className="text-[10px] text-red-500 bg-none border-none cursor-pointer">
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colors & Typography */}
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4">Paleta de Colores</p>
            {([
              { k: "primaryColor",   label: "Color Primario",   hint: "Botones principales" },
              { k: "secondaryColor", label: "Color Secundario", hint: "Confirmaciones" },
              { k: "accentColor",    label: "Color de Acento",  hint: "Links" },
              { k: "bgColor",        label: "Fondo General",    hint: "Fondo de la tienda" },
              { k: "textColor",      label: "Color de Texto",   hint: "Textos principales" },
            ] as const).map(f => (
              <ColorRow
                key={f.k} label={f.label} hint={f.hint}
                value={(draft[f.k as keyof DesignConfig] as string) || "#111111"}
                onChange={v => F(f.k as keyof DesignConfig, v as DesignConfig[typeof f.k])}
              />
            ))}
          </div>
          <div>
            <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-3">Tipografía</p>
            <Select value={draft.fontFamily} onChange={e => F("fontFamily", e.target.value)}>
              {["Inter","Georgia","Courier New","Playfair Display","Montserrat","Lato","Poppins","Raleway","Nunito","DM Sans"].map(f => (
                <option key={f}>{f}</option>
              ))}
            </Select>
            <div className="neumorph mt-3 p-3.5 rounded-xl">
              <p style={{ fontFamily: draft.fontFamily }} className="text-base font-bold text-black mb-1">
                {draft.brandName || "Fit +58 Caracas"}
              </p>
              <p style={{ fontFamily: draft.fontFamily }} className="text-xs text-neutral-400">
                {draft.heroSubtitle || "Tu tienda de confianza"}
              </p>
            </div>
          </div>
        </div>



        {/* WhatsApp + Categorías */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4">WhatsApp & Categorías</p>
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))" }}>
            <div>
              <Field label="Número WhatsApp (con código de país)"
                hint="Ej: 584141013137"
                value={(draft.whatsappNumber || "")}
                onChange={e => F("whatsappNumber", e.target.value)}
                placeholder="584141013137"/>
              <p className="text-[9px] text-neutral-400 mt-1">Sin +, sin espacios, sin guiones</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">Categorías del Catálogo</p>
              <div className="flex flex-col gap-2 mb-2">
                {(draft.categories || []).map((cat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={cat}
                      onChange={e => { const a=[...(draft.categories||[])]; a[idx]=e.target.value; setDraft((d:DesignConfig)=>({...d,categories:a})); }}
                      className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"/>
                    <button onClick={() => setDraft((d:DesignConfig)=>({...d,categories:(draft.categories||[]).filter((_:string,i:number)=>i!==idx)}))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 cursor-pointer bg-transparent border border-red-200/80">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
              </div>
              <Btn variant="ghost" onClick={() => setDraft((d:DesignConfig)=>({...d,categories:[...(draft.categories||[]),"Nueva categoría"]}))}>
                <Plus size={13}/> AÑADIR CATEGORÍA
              </Btn>
            </div>
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-1">Métodos de Pago</p>
          <p className="text-[10px] text-neutral-400 mb-4">El cliente verá los datos de pago al seleccionar el método en el checkout</p>
          <div className="flex flex-col gap-3 mb-3">
            {(draft.paymentMethods || []).map((pm: import("@/lib/types").PaymentMethod, idx: number) => (
              <div key={pm.id} className="glass-card rounded-xl p-4 flex flex-col gap-2"
                style={{ opacity: pm.active ? 1 : 0.5 }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <input value={pm.name}
                    onChange={e => { const a=[...(draft.paymentMethods||[])]; a[idx]={...a[idx],name:e.target.value}; setDraft((d:DesignConfig)=>({...d,paymentMethods:a})); }}
                    className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit] font-bold"
                    placeholder="Nombre del método"/>
                  <label className="flex items-center gap-1 text-[9px] font-bold text-neutral-500 uppercase cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={pm.active} className="accent-green-600"
                      onChange={e => { const a=[...(draft.paymentMethods||[])]; a[idx]={...a[idx],active:e.target.checked}; setDraft((d:DesignConfig)=>({...d,paymentMethods:a})); }}/>
                    Activo
                  </label>
                  <label className="flex items-center gap-1 text-[9px] font-bold text-neutral-500 uppercase cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={pm.needsReceipt} className="accent-black"
                      onChange={e => { const a=[...(draft.paymentMethods||[])]; a[idx]={...a[idx],needsReceipt:e.target.checked}; setDraft((d:DesignConfig)=>({...d,paymentMethods:a})); }}/>
                    Requiere comprobante
                  </label>
                  <button onClick={() => setDraft((d:DesignConfig)=>({...d,paymentMethods:(draft.paymentMethods||[]).filter((_:import("@/lib/types").PaymentMethod,i:number)=>i!==idx)}))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 cursor-pointer bg-transparent border border-red-200/80">
                    <Trash2 size={13}/>
                  </button>
                </div>
                <textarea value={pm.details} rows={3}
                  onChange={e => { const a=[...(draft.paymentMethods||[])]; a[idx]={...a[idx],details:e.target.value}; setDraft((d:DesignConfig)=>({...d,paymentMethods:a})); }}
                  className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit] resize-none"
                  placeholder={"Banco: Banesco\nNúmero: 04XX-XXXXXXX\nNombre: Tu Nombre\nCédula: V-XXXXXXXX"}/>

                {/* Campos a copiar */}
                <div className="mt-2">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-1.5">Campos que se copian al cliente</p>
                  <p className="text-[9px] text-neutral-400 mb-2">Deja vacío para copiar todos. Marca solo los que quieres incluir.</p>
                  <div className="flex flex-col gap-1">
                    {pm.details.split("\n").filter(Boolean).map((line: string, li: number) => {
                      const fields = pm.copyFields ?? [];
                      const checked = fields.length === 0 || fields.includes(line);
                      return (
                        <label key={li} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={checked}
                            className="accent-black"
                            onChange={e => {
                              const a = [...(draft.paymentMethods||[])];
                              const allLines = pm.details.split("\n").filter(Boolean);
                              let current = fields.length === 0 ? [...allLines] : [...fields];
                              if (e.target.checked) {
                                if (!current.includes(line)) current.push(line);
                              } else {
                                current = current.filter((f: string) => f !== line);
                              }
                              // Si están todas marcadas, resetear a [] (= todas)
                              const isAll = allLines.every((l: string) => current.includes(l));
                              a[idx] = { ...a[idx], copyFields: isAll ? [] : current };
                              setDraft((d: DesignConfig) => ({ ...d, paymentMethods: a }));
                            }}/>
                          <span className="text-[11px] text-neutral-600 font-medium">{line}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Moneda del monto */}
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wide">Monto a mostrar al copiar:</p>
                  {(["EUR", "BS"] as const).map(cur => (
                    <label key={cur} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name={`cur-${pm.id}`}
                        checked={(pm.amountCurrency ?? "EUR") === cur}
                        className="accent-black"
                        onChange={() => {
                          const a = [...(draft.paymentMethods||[])];
                          a[idx] = { ...a[idx], amountCurrency: cur };
                          setDraft((d: DesignConfig) => ({ ...d, paymentMethods: a }));
                        }}/>
                      <span className="text-[11px] font-bold text-neutral-600">{cur === "EUR" ? "€ Euros" : "Bs. Bolívares"}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="ghost" onClick={() => setDraft((d:DesignConfig)=>({...d,paymentMethods:[...(draft.paymentMethods||[]),{id:genId(),name:"Nuevo método",details:"",active:true,needsReceipt:false}]}))}>
            <Plus size={13}/> AÑADIR MÉTODO DE PAGO
          </Btn>
        </div>

        {/* Nav editor */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn: "1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4 flex items-center gap-1.5">
            <Navigation size={13} />Menú de Navegación · Editar Links
          </p>
          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {(draft.navLinks || []).map((link, idx) => (
              <div key={link.id} className="neumorph p-4 rounded-xl flex items-center gap-2.5">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <input
                    value={link.label}
                    onChange={e => {
                      const nl = [...draft.navLinks];
                      nl[idx] = { ...nl[idx], label: e.target.value };
                      F("navLinks", nl);
                    }}
                    placeholder="Etiqueta"
                    className="text-xs font-bold border border-neutral-200/70 px-2.5 py-1.5 rounded-lg bg-white/70 font-[inherit] text-black outline-none field-input"
                  />
                  <div className="flex items-center gap-1.5">
                    <ExternalLink size={11} className="text-neutral-400 shrink-0" />
                    <input
                      value={link.url}
                      onChange={e => {
                        const nl = [...draft.navLinks];
                        nl[idx] = { ...nl[idx], url: e.target.value };
                        F("navLinks", nl);
                      }}
                      placeholder="URL o #seccion"
                      className="text-[11px] border border-neutral-200/70 px-2.5 py-1.5 rounded-lg bg-white/70 font-[inherit] text-neutral-600 outline-none flex-1 field-input"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-center shrink-0">
                  <label className="flex items-center gap-1 text-[9px] font-bold text-neutral-500 uppercase tracking-wide cursor-pointer">
                    <input
                      type="checkbox" checked={!!link.active} className="accent-green-600"
                      onChange={e => {
                        const nl = [...draft.navLinks];
                        nl[idx] = { ...nl[idx], active: e.target.checked };
                        F("navLinks", nl);
                      }}
                    />
                    Visible
                  </label>
                  <button
                    onClick={() => F("navLinks", draft.navLinks.filter((_, i) => i !== idx))}
                    className="bg-none border-none cursor-pointer text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Btn
            variant="ghost"
            onClick={() => F("navLinks", [
              ...draft.navLinks,
              { id: genId(), label: "Nueva Página", url: "#nueva", active: true },
            ])}>
            <Plus size={13} /> AÑADIR ENLACE
          </Btn>
          <p className="text-[10px] text-neutral-400 mt-3">
            Usa <code className="bg-neutral-100/80 px-1.5 py-0.5 rounded text-[9px]">#seccion</code> para anclas internas
            o URLs completas para páginas externas.
          </p>
        </div>

        {/* Ticker barra negra */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-1">BARRA NEGRA SUPERIOR · TICKER</p>
          <p className="text-[10px] text-neutral-400 mb-4">Los textos se desplazan en bucle. Usa ✦ al inicio para el estilo gourmet.</p>
          <div className="flex flex-col gap-2 mb-3">
            {(draft.tickerItems || []).map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input value={item}
                  onChange={e => { const a=[...(draft.tickerItems||[])]; a[idx]=e.target.value; F("tickerItems",a as string[]); }}
                  className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                  placeholder="✦ Texto del ticker..."/>
                <button onClick={() => F("tickerItems",(draft.tickerItems||[]).filter((_: string,i: number)=>i!==idx))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 cursor-pointer bg-transparent border border-red-200/80">
                  <Trash2 size={13}/>
                </button>
              </div>
            ))}
          </div>
          <Btn variant="ghost" onClick={() => F("tickerItems",[...(draft.tickerItems||[]),"✦ Nuevo texto"])}>
            <Plus size={13}/> AÑADIR TEXTO
          </Btn>
        </div>

        {/* ── Notificaciones ── */}
        <div style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-3 flex items-center gap-1.5">
            🔔 Notificaciones de Pedidos
          </p>
          <NotifSettings/>
        </div>

        {/* ── Divisor editorial & Watermark ── */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-1 flex items-center gap-1.5">
            ✦ Divisor Editorial & Marca de Agua
          </p>
          <p className="text-[10px] text-neutral-400 mb-5">
            Seccion entre el hero y el catalogo. Edita textos, colores, fuente, tamano y visibilidad.
          </p>

          <div className="grid gap-6" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))" }}>

            {/* Tagline / Divisor */}
            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">Divisor Editorial</p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={draft.editorial?.taglineVisible !== false}
                  onChange={e => F("editorial", { ...draft.editorial, taglineVisible: e.target.checked })}
                  className="accent-green-600"/>
                <span className="text-xs font-bold text-neutral-600">Visible</span>
              </label>

              <RichEditor
                label="Titular (texto grande)"
                value={draft.editorial?.taglineHtml ?? ""}
                defaultVal="<strong>Nutre tu cuerpo</strong><br/>con lo <em>mejor</em> del mundo."
                onChange={html => F("editorial", { ...draft.editorial, taglineHtml: html })}
                minSize={14} maxSize={48}
              />

              <RichEditor
                label="Descripcion (columna derecha)"
                value={draft.editorial?.taglineDescHtml ?? ""}
                defaultVal="En Fit +58 Caracas importamos los suplementos y productos gourmet que antes no conseguias. Calidad garantizada, entrega directa a tu puerta."
                onChange={html => F("editorial", { ...draft.editorial, taglineDescHtml: html })}
                minSize={9} maxSize={18}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Color texto</label>
                  <div className="flex items-center gap-2">
                    <input type="color"
                      value={draft.editorial?.taglineColor ?? "#0d0d0d"}
                      onChange={e => F("editorial", { ...draft.editorial, taglineColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                    <span className="text-xs text-neutral-500">{draft.editorial?.taglineColor ?? "#0d0d0d"}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Color descripcion</label>
                  <div className="flex items-center gap-2">
                    <input type="color"
                      value={draft.editorial?.taglineDescColor ?? "#585757"}
                      onChange={e => F("editorial", { ...draft.editorial, taglineDescColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                    <span className="text-xs text-neutral-500">{draft.editorial?.taglineDescColor ?? "#585757"}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Tamano fuente (px base)</label>
                <input type="range" min={12} max={40} step={1}
                  value={draft.editorial?.taglineFontSize ?? 18}
                  onChange={e => F("editorial", { ...draft.editorial, taglineFontSize: Number(e.target.value) })}
                  className="w-full"/>
                <span className="text-[10px] text-neutral-400">{draft.editorial?.taglineFontSize ?? 18}px</span>
              </div>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Fuente</label>
                <select
                  value={draft.editorial?.taglineFontFamily ?? "inherit"}
                  onChange={e => F("editorial", { ...draft.editorial, taglineFontFamily: e.target.value })}
                  className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]">
                  {["inherit","Bebas Neue","Barlow Condensed","DM Sans","Inter","Georgia","Montserrat","Poppins","Raleway"].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Preview divisor */}
              <div className="neumorph rounded-xl p-4 mt-1"
                style={{ background: draft.editorial?.taglineBg ?? "#fff" }}>
                <div className="leading-snug"
                  style={{ color: draft.editorial?.taglineColor ?? "#0d0d0d", fontSize: draft.editorial?.taglineFontSize ?? 22, fontFamily: draft.editorial?.taglineFontFamily ?? "inherit" }}
                  dangerouslySetInnerHTML={{ __html: draft.editorial?.taglineHtml ?? "<strong>Nutre tu cuerpo</strong><br/>con lo <em>mejor</em> del mundo." }}/>
                <div className="mt-2 leading-relaxed"
                  style={{ color: draft.editorial?.taglineDescColor ?? "#585757", fontSize: 11 }}
                  dangerouslySetInnerHTML={{ __html: draft.editorial?.taglineDescHtml ?? "Descripcion del negocio..." }}/>
              </div>
            </div>

            {/* Watermark */}
            <div className="flex flex-col gap-3">
              <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">Marca de Agua</p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={draft.editorial?.watermarkVisible !== false}
                  onChange={e => F("editorial", { ...draft.editorial, watermarkVisible: e.target.checked })}
                  className="accent-green-600"/>
                <span className="text-xs font-bold text-neutral-600">Visible</span>
              </label>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Texto</label>
                <input
                  value={draft.editorial?.watermarkText ?? "SUPLEMENTOS GOURMET"}
                  onChange={e => F("editorial", { ...draft.editorial, watermarkText: e.target.value })}
                  className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                  placeholder="SUPLEMENTOS GOURMET"/>
              </div>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Color base</label>
                <div className="flex items-center gap-2">
                  <input type="color"
                    value={draft.editorial?.watermarkColor ?? "#292929"}
                    onChange={e => F("editorial", { ...draft.editorial, watermarkColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                  <span className="text-xs text-neutral-500">{draft.editorial?.watermarkColor ?? "#292929"}</span>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Opacidad ({draft.editorial?.watermarkOpacity ?? 5}%)</label>
                <input type="range" min={1} max={100} step={1}
                  value={draft.editorial?.watermarkOpacity ?? 5}
                  onChange={e => F("editorial", { ...draft.editorial, watermarkOpacity: Number(e.target.value) })}
                  className="w-full"/>
              </div>

              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Tamano fuente (px base mobile)</label>
                <input type="range" min={16} max={80} step={2}
                  value={draft.editorial?.watermarkFontSize ?? 28}
                  onChange={e => F("editorial", { ...draft.editorial, watermarkFontSize: Number(e.target.value) })}
                  className="w-full"/>
                <span className="text-[10px] text-neutral-400">{draft.editorial?.watermarkFontSize ?? 28}px</span>
              </div>

              {/* Preview watermark */}
              <div className="neumorph rounded-xl overflow-hidden flex items-center justify-center py-4"
                style={{ background: draft.editorial?.watermarkBg ?? "#fff" }}>
                <p className="font-black leading-none m-0 select-none text-center uppercase"
                  style={{
                    fontSize: draft.editorial?.watermarkFontSize ?? 28,
                    color: draft.editorial?.watermarkColor ?? "#292929",
                    opacity: (draft.editorial?.watermarkOpacity ?? 5) / 100,
                    letterSpacing: -2,
                  }}>
                  {draft.editorial?.watermarkText ?? "SUPLEMENTOS GOURMET"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tipografia tarjetas de producto ── */}
        <div className="glass-card p-6 rounded-2xl" style={{ gridColumn:"1 / -1" }}>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-1 flex items-center gap-1.5">
            🃏 Tipografia de Tarjetas de Producto
          </p>
          <p className="text-[10px] text-neutral-400 mb-5">
            Controla fuente, tamaño, peso y colores de cada texto en las tarjetas del catalogo.
          </p>

          {(() => {
            const CT = draft.cardTypography || {};
            const FC = <K extends keyof CardTypography>(k: K, v: CardTypography[K]) =>
              F("cardTypography", { ...CT, [k]: v } as CardTypography);

            const FONTS = ["inherit","Bebas Neue","Barlow Condensed","DM Sans","Inter","Georgia","Montserrat","Poppins","Raleway","Nunito"];
            const WEIGHTS = [["400","Regular"],["600","Semibold"],["700","Bold"],["900","Black"]] as const;

            const TextRow = ({ label, fKey, sKey, cKey, wKey, defFont, defSize, defColor, defWeight }: {
              label: string;
              fKey: keyof CardTypography; sKey: keyof CardTypography;
              cKey: keyof CardTypography; wKey: keyof CardTypography;
              defFont: string; defSize: number; defColor: string; defWeight: string;
            }) => (
              <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase m-0">{label}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {/* Fuente */}
                  <div>
                    <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Fuente</label>
                    <select value={(CT[fKey] as string) ?? defFont}
                      onChange={e => FC(fKey, e.target.value as CardTypography[typeof fKey])}
                      className="field-input w-full border border-neutral-200/80 px-2 py-1.5 text-xs bg-white/72 rounded-lg font-[inherit]">
                      {FONTS.map(f => <option key={f} value={f}>{f === "inherit" ? "Por defecto" : f}</option>)}
                    </select>
                  </div>
                  {/* Tamaño */}
                  <div>
                    <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">
                      Tamaño: {(CT[sKey] as number) ?? defSize}px
                    </label>
                    <input type="range" min={8} max={40} step={1}
                      value={(CT[sKey] as number) ?? defSize}
                      onChange={e => FC(sKey, Number(e.target.value) as CardTypography[typeof sKey])}
                      className="w-full"/>
                  </div>
                  {/* Peso */}
                  <div>
                    <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Peso</label>
                    <select value={(CT[wKey] as string) ?? defWeight}
                      onChange={e => FC(wKey, e.target.value as CardTypography[typeof wKey])}
                      className="field-input w-full border border-neutral-200/80 px-2 py-1.5 text-xs bg-white/72 rounded-lg font-[inherit]">
                      {WEIGHTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  {/* Color */}
                  <div>
                    <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Color</label>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={(CT[cKey] as string) ?? defColor}
                        onChange={e => FC(cKey, e.target.value as CardTypography[typeof cKey])}
                        className="w-8 h-8 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                      <span className="text-[9px] text-neutral-400">{(CT[cKey] as string) ?? defColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <div className="flex flex-col gap-4">
                <TextRow label="Categoria" fKey="categoryFont" sKey="categorySize" cKey="categoryColor" wKey="categoryWeight"
                  defFont="inherit" defSize={9} defColor="#aaaaaa" defWeight="700"/>
                <TextRow label="Nombre del producto" fKey="nameFont" sKey="nameSize" cKey="nameColor" wKey="nameWeight"
                  defFont="inherit" defSize={12} defColor="#111111" defWeight="900"/>
                <TextRow label="Precio €" fKey="priceFont" sKey="priceSize" cKey="priceColor" wKey="priceWeight"
                  defFont="inherit" defSize={20} defColor="#111111" defWeight="900"/>
                <TextRow label="Precio Bs" fKey="priceBsFont" sKey="priceBsSize" cKey="priceBsColor" wKey="priceBsWeight"
                  defFont="inherit" defSize={12} defColor="#111111" defWeight="900"/>

                {/* Boton y tarjeta */}
                <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase m-0">Boton Agregar</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Fuente</label>
                      <select value={CT.btnFont ?? "inherit"}
                        onChange={e => FC("btnFont", e.target.value)}
                        className="field-input w-full border border-neutral-200/80 px-2 py-1.5 text-xs bg-white/72 rounded-lg font-[inherit]">
                        {FONTS.map(f => <option key={f} value={f}>{f === "inherit" ? "Por defecto" : f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">
                        Tamaño: {CT.btnSize ?? 9}px
                      </label>
                      <input type="range" min={8} max={18} step={1}
                        value={CT.btnSize ?? 9}
                        onChange={e => FC("btnSize", Number(e.target.value))}
                        className="w-full"/>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">
                        Radio: {CT.btnRadius ?? 8}px
                      </label>
                      <input type="range" min={0} max={999} step={1}
                        value={CT.btnRadius ?? 8}
                        onChange={e => FC("btnRadius", Number(e.target.value))}
                        className="w-full"/>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Alto imagen: {CT.imgHeight ?? 220}px</label>
                      <input type="range" min={100} max={400} step={10}
                        value={CT.imgHeight ?? 220}
                        onChange={e => FC("imgHeight", Number(e.target.value))}
                        className="w-full"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                    {[
                      { label:"Fondo inactivo",  key:"btnBg",          def:"#ffffff" },
                      { label:"Texto inactivo",  key:"btnColor",       def:"#111111" },
                      { label:"Fondo activo",    key:"btnActiveBg",    def:"#111111" },
                      { label:"Texto activo",    key:"btnActiveColor", def:"#ffffff" },
                    ].map(({ label, key, def }) => (
                      <div key={key}>
                        <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">{label}</label>
                        <div className="flex items-center gap-1.5">
                          <input type="color"
                            value={(CT[key as keyof CardTypography] as string) ?? def}
                            onChange={e => FC(key as keyof CardTypography, e.target.value as CardTypography[keyof CardTypography])}
                            className="w-8 h-8 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                          <span className="text-[9px] text-neutral-400">{(CT[key as keyof CardTypography] as string) ?? def}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tarjeta general */}
                <div className="glass-card rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase m-0">Tarjeta General</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">
                        Radio tarjeta: {CT.cardRadius ?? 12}px
                      </label>
                      <input type="range" min={0} max={32} step={1}
                        value={CT.cardRadius ?? 12}
                        onChange={e => FC("cardRadius", Number(e.target.value))}
                        className="w-full"/>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Fondo tarjeta</label>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={CT.cardBg ?? "#ffffff"}
                          onChange={e => FC("cardBg", e.target.value)}
                          className="w-8 h-8 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                        <span className="text-[9px] text-neutral-400">{CT.cardBg ?? "#ffffff"}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-neutral-400 tracking-wide uppercase mb-1">Borde tarjeta</label>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={CT.cardBorder ?? "#e5e7eb"}
                          onChange={e => FC("cardBorder", e.target.value)}
                          className="w-8 h-8 rounded-lg border border-neutral-200/80 cursor-pointer bg-transparent p-0.5"/>
                        <span className="text-[9px] text-neutral-400">{CT.cardBorder ?? "#e5e7eb"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview tarjeta */}
                <div>
                  <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">Preview</p>
                  <div className="flex justify-center">
                    <div className="flex flex-col overflow-hidden w-48"
                      style={{
                        background: CT.cardBg ?? "#fff",
                        border: `1px solid ${CT.cardBorder ?? "#e5e7eb"}`,
                        borderRadius: CT.cardRadius ?? 12,
                      }}>
                      <div className="flex items-center justify-center bg-neutral-50"
                        style={{ height: Math.min(CT.imgHeight ?? 220, 120) }}>
                        <span className="text-neutral-300 text-xs">[ imagen ]</span>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5">
                        <p className="m-0 uppercase"
                          style={{ fontFamily: CT.categoryFont ?? "inherit", fontSize: CT.categorySize ?? 9, color: CT.categoryColor ?? "#aaa", fontWeight: CT.categoryWeight ?? "700" }}>
                          Categoria
                        </p>
                        <p className="m-0 uppercase leading-snug"
                          style={{ fontFamily: CT.nameFont ?? "inherit", fontSize: CT.nameSize ?? 12, color: CT.nameColor ?? "#111", fontWeight: CT.nameWeight ?? "900" }}>
                          Nombre del Producto
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span style={{ fontFamily: CT.priceFont ?? "inherit", fontSize: CT.priceSize ?? 20, color: CT.priceColor ?? "#111", fontWeight: CT.priceWeight ?? "900" }}>
                            €25.00
                          </span>
                          <span style={{ fontFamily: CT.priceBsFont ?? "inherit", fontSize: CT.priceBsSize ?? 12, color: CT.priceBsColor ?? "#111", fontWeight: CT.priceBsWeight ?? "900" }}>
                            Bs.900
                          </span>
                        </div>
                        <div className="flex items-center justify-center py-2 text-center"
                          style={{
                            fontFamily: CT.btnFont ?? "inherit",
                            fontSize: CT.btnSize ?? 9,
                            borderRadius: CT.btnRadius ?? 8,
                            background: CT.btnBg ?? "#fff",
                            color: CT.btnColor ?? "#111",
                            border: `1.5px solid ${CT.cardBorder ?? "#ddd"}`,
                          }}>
                          AGREGAR
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
}



