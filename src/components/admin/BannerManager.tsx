"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Edit3, Save, Upload, X } from "lucide-react";
import { fileToBase64 } from "@/lib/store";
import { DEFAULT_BANNERS } from "@/lib/data";
import { Btn, ColorRow, Field, Modal } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { Banner } from "@/lib/types";

export function BannerManager({
  banners,
  onUpdate,
  onReset,
}: {
  banners: Banner[];
  onUpdate: (id: string, data: Partial<Banner>) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const toast = useToast();

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Gestión de Banners</h1>
          <p className="text-xs text-neutral-400 mt-1">Edita individualmente cada banner del hero principal</p>
        </div>
        <Btn variant="ghost" onClick={onReset}>Restaurar demo</Btn>
      </div>

      <div className="flex flex-col gap-4">
        {banners.map((b, idx) => (
          <div key={b.id} className="glass-card rounded-2xl overflow-hidden">
            {/* Live preview strip */}
            <div className="p-5 flex items-center gap-5"
              style={{ background: b.bgColor, borderLeft: `5px solid ${b.accentColor}` }}>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1 text-white text-[8px] font-black tracking-[2px] px-2.5 py-1 mb-2"
                  style={{ background: b.accentColor }}>
                  <Sparkles size={8} />{b.tag}
                </div>
                <h3 className="font-black uppercase leading-[0.9] tracking-tight mb-1.5 whitespace-pre-line"
                  style={{ fontSize: 24, color: b.textColor }}>{b.title}</h3>
                <p className="text-[11px] mb-2.5" style={{ color: b.textColor + "88" }}>{b.subtitle}</p>
                <div className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-wide px-3.5 py-1.5 rounded-lg"
                  style={{ background: b.btnColor, color: b.btnTextColor }}>
                  {b.cta} <ArrowRight size={10} />
                </div>
              </div>
              {(b.imgBase64 || b.img) && (
                <img src={b.imgBase64 || b.img} alt={b.title} onError={e => e.currentTarget.style.display = "none"}
                  className="w-20 h-20 object-contain shrink-0 drop-shadow-xl" />
              )}
            </div>
            {/* Action bar */}
            <div className="px-6 py-3.5 flex items-center justify-between bg-white/55">
              <span className="text-[11px] text-neutral-400 font-semibold">Banner {idx + 1} de {banners.length}</span>
              <Btn variant="primary" onClick={() => setEditing({ ...b })}>
                <Edit3 size={12} /> EDITAR BANNER
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <BannerEditModal
          banner={editing}
          onSave={updated => {
            onUpdate(updated.id, updated);
            setEditing(null);
            toast("Banner actualizado", "🎨");
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function BannerEditModal({ banner, onSave, onClose }: { banner: Banner; onSave: (b: Banner) => void; onClose: () => void }) {
  const [draft, setDraft] = useState({ ...banner });
  const F = <K extends keyof Banner>(k: K, v: Banner[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <Modal
      title="Editar Banner"
      subtitle="Los cambios se aplicarán en el hero de la tienda al guardar"
      onClose={onClose}
      width="min(860px,96vw)"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>CANCELAR</Btn>
          <Btn variant="green" onClick={() => onSave(draft)}><Save size={12} /> GUARDAR BANNER</Btn>
        </>
      }>
      <div className="p-7 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>

        {/* Live preview */}
        <div>
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mb-3">Vista Previa en Vivo</p>
          <div className="rounded-2xl overflow-hidden p-5 relative min-h-[200px]"
            style={{ background: draft.bgColor, borderLeft: `4px solid ${draft.accentColor}` }}>
            <div className="inline-flex items-center gap-1 text-white text-[8px] font-black tracking-[2px] px-2.5 py-1 mb-2"
              style={{ background: draft.accentColor }}>
              <Sparkles size={8} />{draft.tag}
            </div>
            <h3 className="font-black uppercase leading-[0.9] tracking-tight mb-2 whitespace-pre-line"
              style={{ fontSize: 22, color: draft.textColor }}>{draft.title}</h3>
            <p className="text-[11px] mb-3" style={{ color: draft.textColor + "88" }}>{draft.subtitle}</p>
            <div className="inline-flex items-center gap-1.5 text-[9px] font-black tracking-wide px-3.5 py-2 rounded-lg"
              style={{ background: draft.btnColor, color: draft.btnTextColor }}>
              {draft.cta} <ArrowRight size={10} />
            </div>
            {(draft.imgBase64 || draft.img) && (
              <img src={draft.imgBase64 || draft.img} alt="" onError={e => e.currentTarget.style.display = "none"}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 object-contain drop-shadow-xl" />
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase m-0">Textos</p>
          {(["tag","title","subtitle","cta"] as const).map(k => (
            <Field key={k} label={{ tag:"Etiqueta superior", title:"Título (\\n = salto de línea)", subtitle:"Subtítulo", cta:"Texto del botón CTA" }[k]}
              value={draft[k] || ""} onChange={e => F(k, e.target.value)} />
          ))}

          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-1 m-0">Colores</p>
          <div className="grid grid-cols-2 gap-x-4">
            {([
              { k:"bgColor",      label:"Fondo",        hint:"" },
              { k:"accentColor",  label:"Acento/Barra", hint:"" },
              { k:"textColor",    label:"Texto",        hint:"" },
              { k:"btnColor",     label:"Botón fondo",  hint:"" },
              { k:"btnTextColor", label:"Botón texto",  hint:"" },
            ] as const).map(f => (
              <ColorRow key={f.k} label={f.label} hint={f.hint} value={(draft[f.k as keyof Banner] as string) || "#111111"}
                onChange={v => F(f.k as keyof Banner, v as Banner[typeof f.k])} />
            ))}
          </div>

          <p className="text-[9px] font-black text-neutral-300 tracking-[2px] uppercase mt-1 m-0">Imagen del Banner</p>
          <div className="flex gap-2">
            <input type="url" value={draft.img || ""} onChange={e => setDraft(d => ({ ...d, img: e.target.value, imgBase64: "" }))}
              placeholder="https://..." className="field-input flex-1 border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 backdrop-blur-sm rounded-lg font-[inherit]" />
            <label className="flex items-center gap-1.5 px-3 bg-white/65 border border-neutral-200/80 rounded-lg cursor-pointer text-[10px] font-bold text-neutral-500 whitespace-nowrap backdrop-blur-sm fluent-hover">
              <Upload size={12} />JPG/PNG
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                const b64 = await fileToBase64(file);
                setDraft(d => ({ ...d, imgBase64: b64, img: "" }));
                e.target.value = "";
              }} />
            </label>
          </div>
          {(draft.imgBase64 || draft.img) && (
            <div className="flex items-center gap-2">
              <img src={draft.imgBase64 || draft.img} alt="" onError={e => e.currentTarget.style.display = "none"}
                className="w-14 h-14 object-contain rounded-lg border border-neutral-200/70 bg-white" />
              <button onClick={() => setDraft(d => ({ ...d, img: "", imgBase64: "" }))}
                className="text-[10px] text-red-500 bg-none border-none cursor-pointer font-[inherit]">Quitar</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
