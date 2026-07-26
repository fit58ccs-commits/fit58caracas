"use client";
import { useState } from "react";
import {
  Tag, Plus, Trash2, Copy, CheckCircle2,
  ToggleLeft, ToggleRight, Star, Zap, Users,
} from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "../ui/Toast";

type ReferralType = "client" | "influencer" | "promo";

interface Referral {
  id: string;
  code: string;
  owner_name: string;
  owner_phone: string;
  uses: number;
  max_uses: number | null;   // null = ilimitado
  discount: number;          // % descuento al comprador
  reward_pct: number;        // % recompensa al referidor
  type: ReferralType;
  active: boolean;
  created_at: string;
}

const TYPE_META: Record<ReferralType, { label: string; color: string; bg: string; icon: React.ReactNode; hint: string }> = {
  client:     { label: "Cliente",     color: "#22a85a", bg: "rgba(34,168,90,0.10)",   icon: <Users size={11}/>,  hint: "Código generado automático al comprar" },
  influencer: { label: "Influencer",  color: "#7c3aed", bg: "rgba(124,58,237,0.10)",  icon: <Star size={11}/>,   hint: "Para campañas con creadores de contenido" },
  promo:      { label: "Promocional", color: "#ea580c", bg: "rgba(234,88,12,0.10)",   icon: <Zap size={11}/>,    hint: "Código de descuento de uso limitado" },
};

const DEFAULT_FORM = { ownerName: "", ownerPhone: "", discount: 5, rewardPct: 2.5, maxUses: "", type: "client" as ReferralType, customCode: "" };

export function ReferralsManager() {
  const toast = useToast();
  const sb    = createClient();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loaded,    setLoaded]    = useState(false);
  const [form,      setForm]      = useState(DEFAULT_FORM);
  const [adding,    setAdding]    = useState(false);
  const [copied,    setCopied]    = useState("");
  const [tab,       setTab]       = useState<"all" | ReferralType>("all");

  const load = async () => {
    const { data } = await sb.from("referrals").select("*").order("created_at", { ascending: false });
    setReferrals((data || []) as Referral[]);
    setLoaded(true);
  };

  if (!loaded) load();

  const generateCode = (name: string, type: ReferralType) => {
    const clean = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const rand  = Math.random().toString(36).slice(2, 5).toUpperCase();
    const prefix = type === "influencer" ? "INF" : type === "promo" ? "PROMO" : "FIT";
    return `${prefix}-${clean}-${rand}`;
  };

  const add = async () => {
    if (!form.ownerName) { toast("Nombre requerido", "⚠️"); return; }
    if (form.type !== "promo" && !form.ownerPhone) { toast("Teléfono requerido", "⚠️"); return; }
    setAdding(true);

    const code = form.customCode.trim()
      ? form.customCode.trim().toUpperCase().replace(/\s+/g, "-")
      : generateCode(form.ownerName, form.type);

    // Verificar que el código no exista
    const { data: existing } = await sb.from("referrals").select("id").eq("code", code).single();
    if (existing) { toast(`El código ${code} ya existe`, "❌"); setAdding(false); return; }

    const { error } = await sb.from("referrals").insert({
      code,
      owner_name:  form.ownerName,
      owner_phone: form.ownerPhone || "-",
      discount:    form.discount,
      reward_pct:  form.rewardPct,
      max_uses:    form.maxUses ? parseInt(form.maxUses) : null,
      type:        form.type,
      uses:        0,
      active:      true,
    });

    if (error) toast("Error al crear código", "❌");
    else { toast(`Código ${code} creado`, "✅"); setForm(DEFAULT_FORM); load(); }
    setAdding(false);
  };

  const toggle = async (r: Referral) => {
    await sb.from("referrals").update({ active: !r.active }).eq("id", r.id);
    setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, active: !r.active } : x));
    toast(r.active ? "Código desactivado" : "Código activado", r.active ? "🔴" : "🟢");
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este código?")) return;
    await sb.from("referrals").delete().eq("id", id);
    setReferrals(prev => prev.filter(x => x.id !== id));
    toast("Código eliminado", "🗑️");
  };

  const copy = (code: string, withLink = true) => {
    const text = withLink ? `https://fit58caracas.vercel.app/?ref=${code}` : code;
    navigator.clipboard.writeText(text);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
    toast(withLink ? "Link copiado" : "Código copiado", "✅");
  };

  const whatsappShare = (r: Referral) => {
    const url  = `https://fit58caracas.vercel.app/?ref=${r.code}`;
    const text = `¡Hola! Usa mi código *${r.code}* y obtén un ${r.discount}% de descuento en Fit +58 Caracas 💪\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filtered = tab === "all" ? referrals : referrals.filter(r => r.type === tab);
  const counts   = { all: referrals.length, client: 0, influencer: 0, promo: 0 };
  referrals.forEach(r => { counts[r.type as ReferralType]++; });

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Referidos & Promociones</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {referrals.length} código{referrals.length !== 1 ? "s" : ""} ·{" "}
          {referrals.filter(r => r.active).length} activos ·{" "}
          {referrals.reduce((s, r) => s + r.uses, 0)} usos totales
        </p>
      </div>

      {/* Crear código */}
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase flex items-center gap-1.5">
          <Plus size={12}/> Nuevo Código
        </p>

        {/* Tipo */}
        <div className="flex gap-2 flex-wrap">
          {(["client", "influencer", "promo"] as ReferralType[]).map(t => {
            const m = TYPE_META[t];
            return (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase cursor-pointer border transition-all"
                style={{
                  background: form.type === t ? m.bg : "rgba(255,255,255,0.7)",
                  border: `1px solid ${form.type === t ? m.color : "rgba(220,220,220,0.8)"}`,
                  color: form.type === t ? m.color : "#888",
                }}>
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-neutral-400 -mt-2">{TYPE_META[form.type].hint}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
            placeholder={form.type === "promo" ? "Nombre de la promo (ej: VERANO2025)" : "Nombre del referidor"}
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          <input value={form.ownerPhone} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))}
            placeholder={form.type === "promo" ? "Contacto (opcional)" : "Teléfono del referidor"}
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          <input value={form.customCode} onChange={e => setForm(f => ({ ...f, customCode: e.target.value }))}
            placeholder="Código personalizado (opcional, ej: BLACKFRIDAY)"
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit] md:col-span-2"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">% Descuento al comprador</label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={80} value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: parseInt(e.target.value) || 5 }))}
                className="field-input w-20 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-xl font-[inherit]"/>
              <span className="text-sm text-neutral-400 font-semibold">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">% Recompensa al referidor</label>
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={50} step={0.5} value={form.rewardPct}
                onChange={e => setForm(f => ({ ...f, rewardPct: parseFloat(e.target.value) || 0 }))}
                className="field-input w-20 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-xl font-[inherit]"/>
              <span className="text-sm text-neutral-400 font-semibold">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">Máx. usos (vacío = ilimitado)</label>
            <input type="number" min={1} value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              placeholder="∞"
              className="field-input w-24 border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          </div>
        </div>

        <button onClick={add} disabled={adding}
          className="flex items-center justify-center gap-2 py-3 px-8 text-[11px] font-black uppercase tracking-wide rounded-full cursor-pointer border-none disabled:opacity-40 w-full md:w-auto self-start"
          style={{ background: "rgba(17,17,17,0.90)", color: "#fff" }}>
          <Tag size={13}/> {adding ? "Creando..." : "Crear código"}
        </button>
      </div>

      {/* Tabs filtro */}
      <div className="flex gap-2 flex-wrap">
        {([["all", "Todos"], ["client", "Clientes"], ["influencer", "Influencers"], ["promo", "Promos"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-wide uppercase cursor-pointer border transition-all"
            style={{
              background: tab === t ? "rgba(17,17,17,0.90)" : "rgba(255,255,255,0.7)",
              border: `1px solid ${tab === t ? "rgba(17,17,17,0.85)" : "rgba(220,220,220,0.8)"}`,
              color: tab === t ? "#fff" : "#666",
            }}>
            {label} ({counts[t === "all" ? "all" : t]})
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center text-neutral-300">
          <Tag size={32} className="mx-auto mb-3"/>
          <p className="text-sm text-neutral-400">No hay códigos aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(r => {
            const meta     = TYPE_META[r.type as ReferralType] || TYPE_META.client;
            const maxed    = r.max_uses !== null && r.uses >= r.max_uses;
            const earned   = (r.uses * r.reward_pct).toFixed(1);
            return (
              <div key={r.id} className="glass-card p-4 rounded-2xl flex items-start gap-4 flex-wrap"
                style={{ opacity: r.active && !maxed ? 1 : 0.55 }}>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-black tracking-wider">{r.code}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        background: (r.active && !maxed) ? "rgba(34,168,90,0.12)" : "rgba(200,200,200,0.2)",
                        color:      (r.active && !maxed) ? "#22a85a" : "#999",
                      }}>
                      {maxed ? "AGOTADO" : r.active ? "ACTIVO" : "INACTIVO"}
                    </span>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {r.discount}% OFF comprador
                    </span>
                    {r.reward_pct > 0 && (
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        {r.reward_pct}% recompensa
                      </span>
                    )}
                    {r.max_uses !== null && (
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        {r.uses}/{r.max_uses} usos
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">{r.owner_name} · {r.owner_phone}</p>
                  <div className="flex items-center gap-3 flex-wrap mt-0.5">
                    <p className="text-[10px] text-neutral-400">
                      {r.max_uses === null ? `${r.uses} usos` : `${r.uses}/${r.max_uses} usos`} · {new Date(r.created_at).toLocaleDateString("es-VE")}
                    </p>
                    {r.uses > 0 && r.reward_pct > 0 && (
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        {earned}% acumulado para {r.owner_name.split(" ")[0]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button onClick={() => copy(r.code, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-neutral-200/80 bg-white/70 cursor-pointer text-neutral-600">
                    {copied === r.code ? <CheckCircle2 size={12} className="text-green-500"/> : <Copy size={12}/>}
                    Código
                  </button>
                  <button onClick={() => copy(r.code, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-neutral-200/80 bg-white/70 cursor-pointer text-neutral-600">
                    <Copy size={12}/> Link
                  </button>
                  <button onClick={() => whatsappShare(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border border-green-200 bg-green-50 cursor-pointer text-green-700">
                    WhatsApp
                  </button>
                  <button onClick={() => toggle(r)}
                    className="text-neutral-400 cursor-pointer border-none bg-transparent">
                    {r.active ? <ToggleRight size={22} className="text-green-500"/> : <ToggleLeft size={22}/>}
                  </button>
                  <button onClick={() => remove(r.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer text-neutral-300 hover:bg-red-500 hover:text-white transition-all"
                    style={{ background: "rgba(240,242,245,0.8)" }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
