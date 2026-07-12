"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Edit3, Save, Upload, Plus, Eye, EyeOff, Trash2, Link } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { DEFAULT_BANNERS } from "@/lib/data";
import { Btn, ColorRow, Field, Modal } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { Banner } from "@/lib/types";

const genId = () => Math.random().toString(36).slice(2, 9);

async function uploadToStorage(file: File, bannerId: string): Promise<string | null> {
  const sb   = createClient();
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `banners/banner-${bannerId}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("images").upload(path, file, { cacheControl:"3600", upsert:true });
  if (error) { console.error("[uploadToStorage]", error.message); return null; }
  const { data } = sb.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

const BANNER_DEFAULTS: Partial<Banner> = {
  active:true, showTag:true, showTitle:true, showSubtitle:true, showCta:true,
  titleSize:64, subtitleSize:14, btnSize:11, btnPaddingX:24, btnPaddingY:12, btnRadius:10,
  ctaUrl:"#tienda",
};

export function BannerManager({ banners, onUpdate, onAdd, onDelete, onReset }: {
  banners:  Banner[];
  onUpdate: (id: string, data: Partial<Banner>) => void;
  onAdd:    (b: Banner) => void;
  onDelete: (id: string) => void;
  onReset:  () => void;
}) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const toast = useToast();

  const newBlank = (): Banner => ({
    id: genId(), tag:"NUEVO BANNER", title:"Título\ndel Banner",
    subtitle:"Descripción del producto destacado", cta:"VER MÁS",
    bgColor:"#f0f4f8", accentColor:"#3b82f6", textColor:"#111111",
    btnColor:"#111111", btnTextColor:"#ffffff", img:"",
    ...BANNER_DEFAULTS,
  } as Banner);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Gestión de Banners</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {banners.filter(b=>b.active).length} activos · {banners.length} total · Imagen: 1920×600px
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onReset}>Restaurar demo</Btn>
          <Btn variant="primary" onClick={() => setEditing(newBlank())}>
            <Plus size={13}/> NUEVO BANNER
          </Btn>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {banners.map((b, idx) => (
          <div key={b.id} className="glass-card rounded-2xl overflow-hidden"
            style={{ opacity: b.active ? 1 : 0.5 }}>
            <div className="relative overflow-hidden"
              style={{ minHeight:100, background:b.bgColor, borderLeft:`5px solid ${b.accentColor}` }}>
              {b.img && (
                <div className="absolute inset-0"
                  style={{ backgroundImage:`url(${b.img})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.2 }}/>
              )}
              <div className="relative z-[1] p-5">
                {b.showTag !== false && b.tag && (
                  <div className="inline-flex items-center gap-1 text-white text-[8px] font-black tracking-[2px] px-2 py-1 mb-2"
                    style={{ background:b.accentColor }}>
                    <Sparkles size={8}/>{b.tag}
                  </div>
                )}
                {b.showTitle !== false && (
                  <h3 className="font-black uppercase leading-[0.9] mb-1.5 whitespace-pre-line"
                    style={{ fontSize:Math.min(b.titleSize??64,26), color:b.textColor }}>
                    {(b.title||"").replace(/\\n/g,"\n")}
                  </h3>
                )}
                {b.showSubtitle !== false && (
                  <p className="text-[11px] mb-2" style={{ color:b.textColor+"88" }}>{b.subtitle}</p>
                )}
                {b.showCta !== false && (
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5"
                    style={{ background:b.btnColor, color:b.btnTextColor, borderRadius:b.btnRadius??10 }}>
                    {b.cta} <ArrowRight size={10}/>
                  </div>
                )}
              </div>
              {!b.active && (
                <div className="absolute top-3 right-3 bg-neutral-800/70 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-wide">
                  OCULTO
                </div>
              )}
            </div>
            <div className="px-5 py-3 flex items-center justify-between bg-white/55 flex-wrap gap-2">
              <span className="text-[11px] text-neutral-400 font-semibold">Banner {idx+1} de {banners.length}</span>
              <div className="flex gap-2">
                <button onClick={() => onUpdate(b.id, { active: !b.active })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  style={{
                    background: b.active ? "rgba(34,168,90,0.08)" : "rgba(240,242,245,0.8)",
                    color:      b.active ? "#22a85a" : "#888",
                    border:    `1px solid ${b.active ? "rgba(34,168,90,0.3)" : "rgba(220,220,220,0.8)"}`,
                  }}>
                  {b.active ? <><Eye size={12}/>VISIBLE</> : <><EyeOff size={12}/>OCULTO</>}
                </button>
                <Btn variant="primary" onClick={() => setEditing({ ...BANNER_DEFAULTS, ...b } as Banner)}>
                  <Edit3 size={12}/> EDITAR
                </Btn>
                {banners.length > 1 && (
                  <button onClick={() => { if(confirm("¿Eliminar este banner?")) onDelete(b.id); }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 cursor-pointer bg-transparent transition-all hover:bg-red-500 hover:text-white"
                    style={{ border:"1px solid rgba(254,202,202,0.8)" }}>
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <BannerEditModal
          banner={editing}
          isNew={!banners.find(b => b.id === editing.id)}
          onSave={async (updated, file) => {
            let finalImg = updated.img;
            if (file) {
              toast("Subiendo imagen...", "⬆️");
              const url = await uploadToStorage(file, updated.id);
              if (url) { finalImg = url; toast("Imagen subida", "✅"); }
              else      toast("Error al subir imagen", "❌");
            }
            const final = { ...updated, img: finalImg ?? "", imgBase64:"" };
            if (!banners.find(b => b.id === final.id)) {
              onAdd(final);
              toast("Banner creado", "🎨");
            } else {
              onUpdate(final.id, final);
              toast("Banner actualizado", "🎨");
            }
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label:string; checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-100/80 last:border-0">
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
      <button onClick={() => onChange(!checked)}
        className="flex items-center gap-1.5 text-[10px] font-bold rounded-lg px-2.5 py-1.5 cursor-pointer border-none transition-all"
        style={{
          background: checked ? "rgba(34,168,90,0.10)" : "rgba(240,242,245,0.9)",
          color:      checked ? "#22a85a" : "#888",
        }}>
        {checked ? <><Eye size={11}/>Visible</> : <><EyeOff size={11}/>Oculto</>}
      </button>
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label:string; value:number; min:number; max:number; onChange:(v:number)=>void }) {
  return (
    <div>
      <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="range" min={min} max={max} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className="flex-1 accent-black h-1"/>
        <span className="text-xs font-black text-black w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

function BannerEditModal({ banner, isNew, onSave, onClose }: {
  banner:  Banner;
  isNew:   boolean;
  onSave:  (b: Banner, file?: File) => void;
  onClose: () => void;
}) {
  const [draft,   setDraft]   = useState<Banner>({ ...BANNER_DEFAULTS, ...banner } as Banner);
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(banner.img || "");
  const [saving,  setSaving]  = useState(false);
  const F = <K extends keyof Banner>(k:K, v:Banner[K]) => setDraft(d=>({...d,[k]:v}));

  const handleFile = (f:File) => { setFile(f); setPreview(URL.createObjectURL(f)); };

  return (
    <Modal title={isNew?"Nuevo Banner":"Editar Banner"}
      subtitle="Los cambios se aplican al hero · Imagen recomendada: 1920×600px"
      onClose={onClose} width="min(960px,96vw)"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>CANCELAR</Btn>
          <Btn variant="green" onClick={async()=>{ setSaving(true); await onSave(draft,file??undefined); setSaving(false); }}>
            <Save size={12}/>{saving?"GUARDANDO...":isNew?"CREAR BANNER":"GUARDAR"}
          </Btn>
        </>
      }>
      <div className="p-6 grid gap-6" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))" }}>

        {/* ── Vista previa ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Vista Previa</p>
          <div className="rounded-2xl overflow-hidden relative"
            style={{ background:draft.bgColor, borderLeft:`4px solid ${draft.accentColor}`, minHeight:180 }}>
            {preview && (
              <div className="absolute inset-0"
                style={{ backgroundImage:`url(${preview})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.25 }}/>
            )}
            <div className="relative z-[1] p-4">
              {draft.showTag!==false && draft.tag && (
                <div className="inline-flex items-center gap-1 text-white font-black tracking-[2px] px-2.5 py-1 mb-2"
                  style={{ background:draft.accentColor, fontSize:8 }}>
                  <Sparkles size={8}/>{draft.tag}
                </div>
              )}
              {draft.showTitle!==false && (
                <h3 className="font-black uppercase leading-[0.9] mb-2 whitespace-pre-line"
                  style={{ fontSize:Math.min((draft.titleSize??64)*0.35, 28), color:draft.textColor }}>
                  {(draft.title||"").replace(/\\n/g,"\n")}
                </h3>
              )}
              {draft.showSubtitle!==false && draft.subtitle && (
                <p className="mb-3" style={{ fontSize:Math.min((draft.subtitleSize??14)*0.8,13), color:draft.textColor+"99" }}>{draft.subtitle}</p>
              )}
              {draft.showCta!==false && (
                <div className="inline-flex items-center gap-1.5 font-black tracking-wide"
                  style={{
                    background:draft.btnColor, color:draft.btnTextColor,
                    fontSize:Math.min((draft.btnSize??11)*0.8,11),
                    padding:`${Math.round((draft.btnPaddingY??12)*0.5)}px ${Math.round((draft.btnPaddingX??24)*0.5)}px`,
                    borderRadius:draft.btnRadius??10,
                  }}>
                  {draft.cta} <ArrowRight size={10}/>
                </div>
              )}
            </div>
          </div>

          {/* Imagen */}
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Imagen · 1920×600px</p>
          <input type="url" value={file?"":draft.img||""} disabled={!!file}
            onChange={e=>{F("img",e.target.value);setPreview(e.target.value);setFile(null);}}
            placeholder="https://url-de-imagen.jpg"
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit]"/>
          <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200/80 rounded-xl cursor-pointer hover:border-green-400/60 transition-all"
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}>
            <Upload size={14} className="text-neutral-400"/>
            <span className="text-[11px] font-bold text-neutral-500">{file?`✓ ${file.name}`:"Subir JPG/PNG · arrastra aquí"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}}/>
          </label>
          {preview && (
            <div className="flex items-center gap-2">
              <img src={preview} alt="" className="w-20 h-12 object-cover rounded-lg border border-neutral-200/70"
                onError={e=>e.currentTarget.style.display="none"}/>
              <button onClick={()=>{setPreview("");setFile(null);F("img","");}}
                className="text-[10px] text-red-500 border-none bg-none cursor-pointer font-[inherit]">Quitar</button>
            </div>
          )}
        </div>

        {/* ── Textos y visibilidad ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Textos y Visibilidad</p>

          {/* Etiqueta */}
          <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
            <ToggleRow label="Etiqueta superior" checked={draft.showTag!==false} onChange={v=>F("showTag",v)}/>
            {draft.showTag!==false && (
              <input value={draft.tag||""} onChange={e=>F("tag",e.target.value)}
                className="field-input border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                placeholder="NUEVO INGRESO"/>
            )}
          </div>

          {/* Título */}
          <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
            <ToggleRow label="Título" checked={draft.showTitle!==false} onChange={v=>F("showTitle",v)}/>
            {draft.showTitle!==false && (
              <input value={draft.title||""} onChange={e=>F("title",e.target.value)}
                className="field-input border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                placeholder="Título (\\n = salto de línea)"/>
            )}
          </div>

          {/* Subtítulo */}
          <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
            <ToggleRow label="Subtítulo" checked={draft.showSubtitle!==false} onChange={v=>F("showSubtitle",v)}/>
            {draft.showSubtitle!==false && (
              <input value={draft.subtitle||""} onChange={e=>F("subtitle",e.target.value)}
                className="field-input border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                placeholder="Descripción del producto"/>
            )}
          </div>

          {/* Botón CTA */}
          <div className="glass-card rounded-xl p-3 flex flex-col gap-2">
            <ToggleRow label="Botón CTA" checked={draft.showCta!==false} onChange={v=>F("showCta",v)}/>
            {draft.showCta!==false && (
              <>
                <input value={draft.cta||""} onChange={e=>F("cta",e.target.value)}
                  className="field-input border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                  placeholder="COMPRAR AHORA"/>
                <div className="flex items-center gap-2 mt-1">
                  <Link size={13} className="text-neutral-400 shrink-0"/>
                  <input value={draft.ctaUrl||""} onChange={e=>F("ctaUrl",e.target.value)}
                    className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"
                    placeholder="#tienda o https://... (URL del producto)"/>
                </div>
                <p className="text-[9px] text-neutral-400 m-0">
                  Usa <code className="bg-neutral-100 px-1 rounded">#tienda</code> para ir al catálogo,
                  o pega la URL de WhatsApp / producto específico
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Colores ── */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Colores</p>
          {([
            { k:"bgColor",      label:"Fondo"        },
            { k:"accentColor",  label:"Acento/Barra" },
            { k:"textColor",    label:"Texto"        },
            { k:"btnColor",     label:"Botón fondo"  },
            { k:"btnTextColor", label:"Botón texto"  },
          ] as const).map(f => (
            <ColorRow key={f.k} label={f.label}
              value={(draft[f.k as keyof Banner] as string)||"#111111"}
              onChange={v=>F(f.k as keyof Banner, v as Banner[typeof f.k])}/>
          ))}

          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-3 m-0">Tamaños de Fuente</p>
          <Slider label="Título (px)"    value={draft.titleSize??64}    min={20} max={120} onChange={v=>F("titleSize",v)}/>
          <Slider label="Subtítulo (px)" value={draft.subtitleSize??14} min={10} max={28}  onChange={v=>F("subtitleSize",v)}/>

          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-3 m-0">Personalizar Botón</p>
          <Slider label="Fuente botón"  value={draft.btnSize??11}     min={8}  max={20} onChange={v=>F("btnSize",v)}/>
          <Slider label="Padding horiz" value={draft.btnPaddingX??24} min={8}  max={60} onChange={v=>F("btnPaddingX",v)}/>
          <Slider label="Padding vert"  value={draft.btnPaddingY??12} min={4}  max={32} onChange={v=>F("btnPaddingY",v)}/>
          <Slider label="Redondeo (px)" value={draft.btnRadius??10}   min={0}  max={40} onChange={v=>F("btnRadius",v)}/>

          {/* Posición del contenido */}
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-3 m-0">Posición del Contenido</p>
          <div className="glass-card rounded-xl p-3">
            <p className="text-[9px] text-neutral-400 mb-2">Mueve el texto y botones dentro del banner para cubrir el espacio que prefieras</p>

            {/* Grid visual 3×3 */}
            <div className="grid gap-1 mb-3" style={{ gridTemplateColumns:"repeat(3,1fr)", gridTemplateRows:"repeat(3,1fr)" }}>
              {(["top","center","bottom"] as const).map(y =>
                (["left","center","right"] as const).map(x => {
                  const active = (draft.contentX??"left")===x && (draft.contentY??"center")===y;
                  return (
                    <button key={`${y}-${x}`}
                      onClick={()=>{ setDraft(d=>({...d, contentX:x, contentY:y})); }}
                      className="h-10 rounded-lg border-none cursor-pointer transition-all flex items-center justify-center"
                      style={{ background:active?"rgba(17,17,17,0.88)":"rgba(240,242,245,0.8)", color:active?"#fff":"#bbb" }}
                      title={`${y} ${x}`}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"currentColor" }}/>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-[9px] text-neutral-400">
              Posición actual: <strong className="text-neutral-600">{draft.contentY??"center"} · {draft.contentX??"left"}</strong>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
