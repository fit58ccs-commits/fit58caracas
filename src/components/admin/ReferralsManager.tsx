"use client";
import { useState } from "react";
import { Tag, Plus, Trash2, Copy, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { useToast } from "../ui/Toast";

interface Referral {
  id: string;
  code: string;
  owner_name: string;
  owner_phone: string;
  uses: number;
  discount: number;
  created_at: string;
  active: boolean;
}

export function ReferralsManager() {
  const toast = useToast();
  const sb = createClient();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loaded,    setLoaded]    = useState(false);
  const [form,      setForm]      = useState({ ownerName:"", ownerPhone:"", discount: 5 });
  const [adding,    setAdding]    = useState(false);
  const [copied,    setCopied]    = useState("");

  const load = async () => {
    const { data } = await sb.from("referrals").select("*").order("created_at", { ascending: false });
    setReferrals(data || []);
    setLoaded(true);
  };

  if (!loaded) { load(); }

  const generateCode = (name: string) => {
    const clean = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const rand  = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `FIT-${clean}-${rand}`;
  };

  const add = async () => {
    if (!form.ownerName || !form.ownerPhone) { toast("Nombre y teléfono son requeridos", "⚠️"); return; }
    setAdding(true);
    const code = generateCode(form.ownerName);
    const { error } = await sb.from("referrals").insert({
      code,
      owner_name:  form.ownerName,
      owner_phone: form.ownerPhone,
      discount:    form.discount,
      uses:        0,
      active:      true,
    });
    if (error) { toast("Error al crear código", "❌"); }
    else       { toast(`Código ${code} creado`, "✅"); setForm({ ownerName:"", ownerPhone:"", discount:5 }); load(); }
    setAdding(false);
  };

  const toggle = async (r: Referral) => {
    await sb.from("referrals").update({ active: !r.active }).eq("id", r.id);
    setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, active: !r.active } : x));
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este código de referido?")) return;
    await sb.from("referrals").delete().eq("id", id);
    setReferrals(prev => prev.filter(x => x.id !== id));
    toast("Código eliminado", "🗑️");
  };

  const copy = (code: string) => {
    const url = `https://fit58caracas.vercel.app/?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
    toast("Link copiado", "✅");
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Referidos</h1>
        <p className="text-xs text-neutral-400 mt-1">{referrals.length} código{referrals.length!==1?"s":""} · {referrals.filter(r=>r.active).length} activos</p>
      </div>

      {/* Crear código */}
      <div className="glass-card p-5 rounded-2xl flex flex-col gap-3">
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase flex items-center gap-1.5">
          <Plus size={12}/> Nuevo código de referido
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.ownerName} onChange={e=>setForm(f=>({...f,ownerName:e.target.value}))}
            placeholder="Nombre del cliente"
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          <input value={form.ownerPhone} onChange={e=>setForm(f=>({...f,ownerPhone:e.target.value}))}
            placeholder="Teléfono"
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
          <div className="flex gap-2 items-center">
            <input type="number" min={1} max={50} value={form.discount}
              onChange={e=>setForm(f=>({...f,discount:parseInt(e.target.value)||5}))}
              className="field-input w-24 border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit]"/>
            <span className="text-sm text-neutral-400 font-semibold">% descuento</span>
          </div>
        </div>
        <button onClick={add} disabled={adding}
          className="flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-wide rounded-xl cursor-pointer border-none disabled:opacity-40 w-full md:w-auto md:px-8"
          style={{background:"rgba(17,17,17,0.90)",color:"#fff"}}>
          <Tag size={13}/> {adding ? "Creando..." : "Crear código"}
        </button>
      </div>

      {/* Lista de códigos */}
      {referrals.length === 0 ? (
        <div className="glass-card p-10 rounded-2xl text-center text-neutral-300">
          <Tag size={32} className="mx-auto mb-3"/>
          <p className="text-sm text-neutral-400">No hay códigos de referido aún</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {referrals.map(r => (
            <div key={r.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 flex-wrap"
              style={{opacity: r.active ? 1 : 0.55}}>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-black tracking-wider">{r.code}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{background:r.active?"rgba(34,168,90,0.12)":"rgba(200,200,200,0.2)",color:r.active?"#22a85a":"#999"}}>
                    {r.active ? "ACTIVO" : "INACTIVO"}
                  </span>
                  <span className="text-[10px] font-bold text-[#2d3a4a] bg-blue-50 px-2 py-0.5 rounded-full">3% OFF nuevo cliente</span>
                </div>
                <p className="text-xs text-neutral-500">{r.owner_name} · {r.owner_phone}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[10px] text-neutral-400">{r.uses} uso{r.uses!==1?"s":""} · creado {new Date(r.created_at).toLocaleDateString("es-VE")}</p>
                  {r.uses > 0 && (
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {(r.uses * 2.5).toFixed(1)}% acumulado para {r.owner_name.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => copy(r.code)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-neutral-200/80 bg-white/70 cursor-pointer text-neutral-600 hover:text-black transition-colors">
                  {copied===r.code ? <CheckCircle2 size={12} className="text-green-500"/> : <Copy size={12}/>}
                  {copied===r.code ? "Copiado" : "Copiar link"}
                </button>
                <button onClick={() => toggle(r)}
                  className="text-neutral-400 hover:text-black cursor-pointer border-none bg-transparent transition-colors">
                  {r.active ? <ToggleRight size={22} className="text-green-500"/> : <ToggleLeft size={22}/>}
                </button>
                <button onClick={() => remove(r.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer text-neutral-300 hover:bg-red-500 hover:text-white transition-all"
                  style={{background:"rgba(240,242,245,0.8)"}}>
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
