"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Edit3, Save, Upload, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
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

const DEFAULT_BANNER_EXTRA = {
  active:true, titleSize:72, subtitleSize:14,
  btnSize:11, btnPaddingX:28, btnPaddingY:12, btnRadius:10,
};

export function BannerManager({
  banners, onUpdate, onAdd, onDelete, onReset,
}: {
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
    ...DEFAULT_BANNER_EXTRA,
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Gestión de Banners</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {banners.filter(b=>b.active).length} activos · {banners.length} total · Imagen recomendada: 1920×600px
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
            style={{ opacity: b.active ? 1 : 0.55 }}>
            {/* Preview */}
            <div className="relative overflow-hidden" style={{ minHeight:110, background:b.bgColor, borderLeft:`5px solid ${b.accentColor}` }}>
              {b.img && (
                <div className="absolute inset-0"
                  style={{ backgroundImage:`url(${b.img})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.2 }}/>
              )}
              <div className="relative z-[1] p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1 text-white text-[8px] font-black tracking-[2px] px-2.5 py-1 mb-2"
                    style={{ background:b.accentColor }}>
                    <Sparkles size={8}/>{b.tag}
                  </div>
                  <h3 className="font-black uppercase leading-[0.9] tracking-tight mb-1.5 whitespace-pre-line"
                    style={{ fontSize:Math.min(b.titleSize??72, 28), color:b.textColor }}>{b.title}</h3>
                  <p className="text-[11px] mb-2" style={{ color:b.textColor+"88" }}>{b.subtitle}</p>
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-wide px-3 py-1.5"
                    style={{ background:b.btnColor, color:b.btnTextColor, borderRadius:b.btnRadius??10 }}>
                    {b.cta} <ArrowRight size={10}/>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {!b.active && <span className="text-[9px] font-black text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg uppercase tracking-wide">OCULTO</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 flex items-center justify-between bg-white/55 flex-wrap gap-2">
              <span className="text-[11px] text-neutral-400 font-semibold">Banner {idx+1} de {banners.length}</span>
              <div className="flex gap-2">
                {/* Toggle visible */}
                <button onClick={() => onUpdate(b.id, { active: !b.active })}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer text-[10px] font-bold transition-all"
                  style={{ background: b.active ? "rgba(34,168,90,0.08)" : "rgba(240,242,245,0.8)", color: b.active ? "#22a85a" : "#888", border: `1px solid ${b.active ? "rgba(34,168,90,0.3)" : "rgba(220,220,220,0.8)"}` }}>
                  {b.active ? <><Eye size={12}/>VISIBLE</> : <><EyeOff size={12}/>OCULTO</>}
                </button>
                {/* Edit */}
                <Btn variant="primary" onClick={() => setEditing({ ...b })}>
                  <Edit3 size={12}/> EDITAR
                </Btn>
                {/* Delete */}
                {banners.length > 1 && (
                  <button onClick={() => { if(confirm("¿Eliminar este banner?")) onDelete(b.id); }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-200/80 text-red-400 cursor-pointer bg-transparent transition-all hover:bg-red-500 hover:text-white"
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
              else       toast("Error al subir imagen", "❌");
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

/* ── Banner Edit Modal ────────────────────────────────────────── */
function BannerEditModal({ banner, isNew, onSave, onClose }: {
  banner: Banner;
  isNew:  boolean;
  onSave: (b: Banner, file?: File) => void;
  onClose: () => void;
}) {
  const [draft,   setDraft]   = useState<Banner>({ ...DEFAULT_BANNER_EXTRA, ...banner });
  const [file,    setFile]    = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(banner.img || "");
  const [saving,  setSaving]  = useState(false);
  const F = <K extends keyof Banner>(k: K, v: Banner[K]) => setDraft(d => ({ ...d, [k]: v }));

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const titleSize    = draft.titleSize    ?? 72;
  const subtitleSize = draft.subtitleSize ?? 14;
  const btnSize      = draft.btnSize      ?? 11;
  const btnPaddingX  = draft.btnPaddingX  ?? 28;
  const btnPaddingY  = draft.btnPaddingY  ?? 12;
  const btnRadius    = draft.btnRadius    ?? 10;

  return (
    <Modal
      title={isNew ? "Nuevo Banner" : "Editar Banner"}
      subtitle="Los cambios se aplican al hero · Imagen recomendada: 1920×600px"
      onClose={onClose}
      width="min(920px,96vw)"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>CANCELAR</Btn>
          <Btn variant="green" onClick={async () => {
            setSaving(true);
            await onSave(draft, file ?? undefined);
            setSaving(false);
          }}>
            <Save size={12}/> {saving ? "GUARDANDO..." : isNew ? "CREAR BANNER" : "GUARDAR"}
          </Btn>
        </>
      }>
      <div className="p-6 grid gap-6" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))" }}>

        {/* ── Vista previa ── */}
        <div className="flex flex-col gap-4">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Vista Previa</p>
          <div className="rounded-2xl overflow-hidden relative" style={{ background:draft.bgColor, borderLeft:`4px solid ${draft.accentColor}`, minHeight:200 }}>
            {preview && (
              <div className="absolute inset-0"
                style={{ backgroundImage:`url(${preview})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.25 }}/>
            )}
            <div className="relative z-[1] p-5">
              <div className="inline-flex items-center gap-1 text-white font-black tracking-[2px] px-2.5 py-1 mb-2"
                style={{ background:draft.accentColor, fontSize:8 }}>
                <Sparkles size={8}/>{draft.tag}
              </div>
              <h3 className="font-black uppercase leading-[0.9] mb-2 whitespace-pre-line"
                style={{ fontSize:`clamp(18px,${titleSize*0.3}px,${titleSize*0.4}px)`, color:draft.textColor }}>
                {draft.title}
              </h3>
              <p className="mb-3" style={{ fontSize:subtitleSize*0.7, color:draft.textColor+"99" }}>{draft.subtitle}</p>
              <div className="inline-flex items-center gap-1.5 font-black tracking-wide"
                style={{ background:draft.btnColor, color:draft.btnTextColor, fontSize:btnSize*0.8,
                  padding:`${btnPaddingY*0.5}px ${btnPaddingX*0.5}px`, borderRadius:btnRadius }}>
                {draft.cta} <ArrowRight size={10}/>
              </div>
            </div>
          </div>

          {/* Imagen */}
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Imagen · 1920×600px</p>
          <input type="url" value={file ? "" : draft.img || ""} disabled={!!file}
            onChange={e => { F("img", e.target.value); setPreview(e.target.value); setFile(null); }}
            placeholder="https://url-de-imagen.com/banner.jpg"
            className="field-input border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit]"/>
          <label className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-neutral-200/80 rounded-xl cursor-pointer hover:border-green-400/60 hover:bg-green-50/20 transition-all"
            onDragOver={e=>{e.preventDefault();}} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}>
            <Upload size={15} className="text-neutral-400"/>
            <span className="text-[11px] font-bold text-neutral-500">{file ? `✓ ${file.name}` : "Subir JPG/PNG · arrastra aquí"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}}/>
          </label>
          {preview && (
            <div className="flex items-center gap-2">
              <img src={preview} alt="" className="w-20 h-12 object-cover rounded-lg border border-neutral-200/70"
                onError={e=>e.currentTarget.style.display="none"}/>
              <button onClick={()=>{setPreview("");setFile(null);F("img","");}}
                className="text-[10px] text-red-500 bg-none border-none cursor-pointer font-[inherit]">Quitar</button>
            </div>
          )}
        </div>

        {/* ── Textos ── */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Textos</p>
          {(["tag","title","subtitle","cta"] as const).map(k => (
            <Field key={k}
              label={{ tag:"Etiqueta superior", title:"Título (\\n = salto de línea)", subtitle:"Subtítulo", cta:"Texto del botón CTA" }[k]}
              value={draft[k] || ""} onChange={e=>F(k,e.target.value)}/>
          ))}

          {/* Tamaño de fuentes */}
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-2 m-0">Tamaño de Fuente</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Título (px)",    key:"titleSize",    val:titleSize    },
              { label:"Subtítulo (px)", key:"subtitleSize", val:subtitleSize },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={24} max={120} step={2} value={f.val}
                    onChange={e=>{const v=parseInt(e.target.value); setDraft(d=>({...d,[f.key]:v}))}}
                    className="flex-1 accent-black"/>
                  <span className="text-xs font-black text-black w-8 text-right">{f.val}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Botón */}
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-2 m-0">Personalizar Botón</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Tamaño fuente", key:"btnSize",     val:btnSize,     min:8,  max:20 },
              { label:"Padding horiz",  key:"btnPaddingX", val:btnPaddingX, min:8,  max:60 },
              { label:"Padding vert",   key:"btnPaddingY", val:btnPaddingY, min:4,  max:32 },
              { label:"Redondeo (px)",  key:"btnRadius",   val:btnRadius,   min:0,  max:40 },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={f.min} max={f.max} step={1} value={f.val}
                    onChange={e=>{const v=parseInt(e.target.value); setDraft(d=>({...d,[f.key]:v}))}}
                    className="flex-1 accent-black"/>
                  <span className="text-xs font-black text-black w-8 text-right">{f.val}</span>
                </div>
              </div>
            ))}
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
              value={(draft[f.k as keyof Banner] as string) || "#111111"}
              onChange={v=>F(f.k as keyof Banner, v as Banner[typeof f.k])}/>
          ))}
        </div>
      </div>
    </Modal>
  );
}
