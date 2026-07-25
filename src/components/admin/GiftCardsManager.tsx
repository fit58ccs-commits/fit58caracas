"use client";
import { useState } from "react";
import { Gift, Plus, Trash2, Copy, CheckCircle2, ToggleLeft, ToggleRight, Download } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "../ui/Toast";

interface GiftCard {
  id: string;
  code: string;
  amount: number;         // valor en euros
  label: string;          // descripcion/ocasion (ej: "Navidad 2025")
  used: boolean;
  used_by: string | null; // nombre del que canjeo
  used_at: string | null;
  active: boolean;
  created_at: string;
}

const DEFAULT_FORM = { amount: 20, qty: 1, label: "", customCode: "" };

const randCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0,O,I,1 para evitar confusion
  return Array.from({ length: 12 }, (_, i) =>
    (i > 0 && i % 4 === 0 ? "-" : "") + chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export function GiftCardsManager() {
  const toast = useToast();
  const sb    = createClient();

  const [cards,   setCards]   = useState<GiftCard[]>([]);
  const [loaded,  setLoaded]  = useState(false);
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [adding,  setAdding]  = useState(false);
  const [copied,  setCopied]  = useState("");
  const [tab,     setTab]     = useState<"all" | "active" | "used">("all");

  const load = async () => {
    const { data } = await sb.from("gift_cards").select("*").order("created_at", { ascending: false });
    setCards((data || []) as GiftCard[]);
    setLoaded(true);
  };

  if (!loaded) load();

  const add = async () => {
    if (form.amount <= 0) { toast("Monto inválido", "⚠️"); return; }
    setAdding(true);

    const qty = Math.min(Math.max(1, form.qty), 50); // max 50 a la vez
    const inserts = Array.from({ length: qty }, () => ({
      code:    form.customCode.trim()
               ? form.customCode.trim().toUpperCase().replace(/\s+/g, "-")
               : `GC-${randCode()}`,
      amount:  form.amount,
      label:   form.label || `Tarjeta regalo €${form.amount}`,
      used:    false,
      used_by: null,
      used_at: null,
      active:  true,
    }));

    // Si es custom code y qty > 1, hacer único cada uno
    if (form.customCode && qty > 1) {
      inserts.forEach((ins, i) => { ins.code = `${ins.code}-${i + 1}`; });
    }

    const { error } = await sb.from("gift_cards").insert(inserts);
    if (error) toast("Error al crear tarjetas", "❌");
    else {
      toast(`${qty} tarjeta${qty > 1 ? "s" : ""} creada${qty > 1 ? "s" : ""}`, "🎁");
      setForm(DEFAULT_FORM);
      load();
    }
    setAdding(false);
  };

  const toggle = async (c: GiftCard) => {
    if (c.used) { toast("No se puede reactivar una tarjeta ya usada", "⚠️"); return; }
    await sb.from("gift_cards").update({ active: !c.active }).eq("id", c.id);
    setCards(prev => prev.map(x => x.id === c.id ? { ...x, active: !c.active } : x));
    toast(c.active ? "Tarjeta desactivada" : "Tarjeta activada", c.active ? "🔴" : "🟢");
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta tarjeta de regalo?")) return;
    await sb.from("gift_cards").delete().eq("id", id);
    setCards(prev => prev.filter(x => x.id !== id));
    toast("Tarjeta eliminada", "🗑️");
  };

  // Marcar como usada manualmente desde admin
  const markUsed = async (c: GiftCard) => {
    const by = prompt(`¿Por quién fue canjeada? (nombre del cliente)`);
    if (by === null) return;
    await sb.from("gift_cards").update({
      used: true, active: false,
      used_by: by || "Cliente",
      used_at: new Date().toISOString(),
    }).eq("id", c.id);
    setCards(prev => prev.map(x => x.id === c.id
      ? { ...x, used: true, active: false, used_by: by || "Cliente", used_at: new Date().toISOString() }
      : x));
    toast("Tarjeta marcada como usada", "✅");
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
    toast("Código copiado", "✅");
  };

  // Exportar códigos activos como texto
  const exportCodes = () => {
    const active = cards.filter(c => c.active && !c.used);
    const text = active.map(c => `${c.code}\t€${c.amount}\t${c.label}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "gift_cards_fit58.txt"; a.click();
    URL.revokeObjectURL(url);
    toast(`${active.length} códigos exportados`, "📄");
  };

  const filtered = cards.filter(c => {
    if (tab === "active") return c.active && !c.used;
    if (tab === "used")   return c.used;
    return true;
  });

  const stats = {
    total:  cards.length,
    active: cards.filter(c => c.active && !c.used).length,
    used:   cards.filter(c => c.used).length,
    value:  cards.filter(c => c.active && !c.used).reduce((s, c) => s + c.amount, 0),
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Tarjetas de Regalo</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {stats.total} tarjetas · {stats.active} activas · {stats.used} canjeadas · €{stats.value.toFixed(2)} en circulación
          </p>
        </div>
        {stats.active > 0 && (
          <button onClick={exportCodes}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wide cursor-pointer border border-neutral-200/80 bg-white/70 text-neutral-600">
            <Download size={12}/> Exportar activas
          </button>
        )}
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: stats.total,           sub: "generadas",  color: "#292929" },
          { label: "Activas",   value: stats.active,          sub: "disponibles",color: "#22a85a" },
          { label: "Canjeadas", value: stats.used,            sub: "invalidadas", color: "#ea580c" },
          { label: "Valor",     value: `€${stats.value}`,     sub: "en circulación", color: "#7c3aed" },
        ].map(k => (
          <div key={k.label} className="glass-card p-4 rounded-2xl text-center">
            <p className="text-2xl font-black m-0" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wide m-0">{k.label}</p>
            <p className="text-[9px] text-neutral-300 m-0">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Crear tarjetas */}
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase flex items-center gap-1.5">
          <Plus size={12}/> Generar Tarjetas
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">Monto (€)</label>
            <input type="number" min={1} max={500} value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
              className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">Cantidad a generar</label>
            <input type="number" min={1} max={50} value={form.qty}
              onChange={e => setForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))}
              className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          </div>
          <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder='Etiqueta / Ocasión (ej: "Navidad 2025", "Premio sorteo")'
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit] md:col-span-2"/>
          <input value={form.customCode} onChange={e => setForm(f => ({ ...f, customCode: e.target.value }))}
            placeholder='Código personalizado (opcional, ej: "NAVIDAD25" — solo si qty=1)'
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit] md:col-span-2"/>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={add} disabled={adding}
            className="flex items-center gap-2 py-3 px-8 text-[11px] font-black uppercase tracking-wide rounded-full cursor-pointer border-none disabled:opacity-40"
            style={{ background: "rgba(17,17,17,0.90)", color: "#fff" }}>
            <Gift size={13}/> {adding ? "Generando..." : `Generar ${form.qty > 1 ? form.qty + " tarjetas" : "tarjeta"}`}
          </button>
          <p className="text-[10px] text-neutral-400">
            Valor total: <strong>€{(form.amount * (form.qty || 1)).toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Tabs filtro */}
      <div className="flex gap-2">
        {([["all", "Todas"], ["active", "Activas"], ["used", "Canjeadas"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase cursor-pointer border transition-all"
            style={{
              background: tab === t ? "rgba(17,17,17,0.90)" : "rgba(255,255,255,0.7)",
              border: `1px solid ${tab === t ? "rgba(17,17,17,0.85)" : "rgba(220,220,220,0.8)"}`,
              color: tab === t ? "#fff" : "#666",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center text-neutral-300">
          <Gift size={32} className="mx-auto mb-3"/>
          <p className="text-sm text-neutral-400">No hay tarjetas en esta categoría</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <div key={c.id} className="glass-card p-4 rounded-2xl flex items-start gap-4 flex-wrap"
              style={{ opacity: c.used ? 0.55 : 1 }}>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-black tracking-widest font-mono">{c.code}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: c.used ? "rgba(234,88,12,0.12)" : c.active ? "rgba(34,168,90,0.12)" : "rgba(200,200,200,0.2)",
                      color:      c.used ? "#ea580c"              : c.active ? "#22a85a"              : "#999",
                    }}>
                    {c.used ? "CANJEADA" : c.active ? "ACTIVA" : "INACTIVA"}
                  </span>
                  <span className="text-sm font-black text-black bg-neutral-100 px-2.5 py-0.5 rounded-full">
                    €{c.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">{c.label}</p>
                {c.used && (
                  <p className="text-[10px] text-orange-500 font-bold">
                    Canjeada por {c.used_by} · {c.used_at ? new Date(c.used_at).toLocaleDateString("es-VE") : ""}
                  </p>
                )}
                <p className="text-[10px] text-neutral-400">
                  Creada {new Date(c.created_at).toLocaleDateString("es-VE")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {!c.used && (
                  <button onClick={() => copy(c.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-neutral-200/80 bg-white/70 cursor-pointer text-neutral-600">
                    {copied === c.code ? <CheckCircle2 size={12} className="text-green-500"/> : <Copy size={12}/>}
                    {copied === c.code ? "Copiado" : "Código"}
                  </button>
                )}
                {!c.used && (
                  <button onClick={() => markUsed(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-orange-200 bg-orange-50 cursor-pointer text-orange-700">
                    Marcar usada
                  </button>
                )}
                {!c.used && (
                  <button onClick={() => toggle(c)}
                    className="text-neutral-400 cursor-pointer border-none bg-transparent">
                    {c.active ? <ToggleRight size={22} className="text-green-500"/> : <ToggleLeft size={22}/>}
                  </button>
                )}
                <button onClick={() => remove(c.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer text-neutral-300 hover:bg-red-500 hover:text-white transition-all"
                  style={{ background: "rgba(240,242,245,0.8)" }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
