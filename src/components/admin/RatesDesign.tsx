"use client";
import { useState } from "react";
import {
  RefreshCw, Save, Plus, Trash2, ExternalLink, Upload,
  Navigation, Star, Globe, DollarSign,
} from "lucide-react";
import { fileToBase64, fmt$, fmtBs } from "@/lib/store";
import { DEFAULT_DESIGN } from "@/lib/data";
import { Btn, Field, Select, ColorRow } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { ExchangeRate, DesignConfig, NavLink } from "@/lib/types";

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
                {draft.brandName || "Délice Gourmet"}
              </p>
              <p style={{ fontFamily: draft.fontFamily }} className="text-xs text-neutral-400">
                {draft.heroSubtitle || "Productos importados de calidad premium"}
              </p>
            </div>
          </div>
        </div>

        {/* Texts + Preview */}
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4">Textos Clave & CTA</p>
          <div className="flex flex-col gap-3.5">
            {([
              { k: "heroTitle",    label: "Título Hero" },
              { k: "heroSubtitle", label: "Subtítulo / Tagline" },
              { k: "ctaText",      label: "Texto Botón CTA" },
            ] as const).map(f => (
              <Field
                key={f.k} label={f.label}
                value={(draft[f.k as keyof DesignConfig] as string) || ""}
                onChange={e => F(f.k as keyof DesignConfig, e.target.value as DesignConfig[typeof f.k])}
              />
            ))}
          </div>
          <p className="text-[9px] font-black text-neutral-300 tracking-[1.5px] uppercase mt-4 mb-2">Vista Previa en Vivo</p>
          <div className="neumorph rounded-xl overflow-hidden">
            <div className="p-5" style={{ background: draft.bgColor, borderLeft: `4px solid ${draft.primaryColor}` }}>
              <p className="text-[9px] font-black mb-1.5 tracking-[2px] uppercase" style={{ color: draft.secondaryColor }}>
                NUEVO INGRESO
              </p>
              <h3 className="text-xl font-black uppercase leading-tight mb-1.5"
                style={{ fontFamily: draft.fontFamily, color: draft.textColor }}>
                {draft.heroTitle}
              </h3>
              <p className="text-[11px] mb-3" style={{ fontFamily: draft.fontFamily, color: draft.textColor + "99" }}>
                {draft.heroSubtitle}
              </p>
              <button className="text-[10px] font-black px-5 py-2 rounded-lg text-white border-none cursor-pointer tracking-wide"
                style={{ background: draft.primaryColor, fontFamily: draft.fontFamily }}>
                {draft.ctaText}
              </button>
            </div>
          </div>
          <Btn variant="primary" className="mt-4 w-full" onClick={save}>
            <Save size={13} /> APLICAR Y GUARDAR
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

      </div>
    </div>
  );
}
