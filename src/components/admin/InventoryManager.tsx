"use client";
import { useState } from "react";
import { Plus, Upload, Trash2, Edit3, Save, Download, FileSpreadsheet, AlertCircle, Package } from "lucide-react";
import { fileToBase64, genId, fmt$, fmtBs } from "@/lib/store";
import { SAMPLE_PRODUCTS } from "@/lib/data";
import { Btn, Field, Select, Modal } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { Product, ExchangeRate } from "@/lib/types";

const MAX_IMAGES = 3;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E";

const parseCSV = (text: string): Omit<Product, "id">[] => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(/[,;\t]/);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
    const img = obj.img || obj.imagen || obj.image || "";
    return {
      name:     obj.name     || obj.nombre || "",
      category: obj.category || obj.categoria || "Otros",
      desc:     obj.desc     || obj.descripcion || obj.description || "",
      price:    parseFloat(obj.price || obj.precio || "0") || 0,
      stock:    parseInt(obj.stock || "0")   || 0,
      badge:    obj.badge    || obj.etiqueta || null,
      images:   img ? [img] : [],
      img,
    };
  }).filter(p => p.name);
};

/* ── Multi-image picker ────────────────────────────────────────── */
function ImagePicker({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const remaining = MAX_IMAGES - images.length;

  const addUrl = (url: string) => {
    if (!url.trim()) return;
    if (images.length >= MAX_IMAGES) return;
    onChange([...images, url]);
  };

  const addFiles = async (files: FileList) => {
    const toAdd = Array.from(files).slice(0, remaining);
    const b64s = await Promise.all(toAdd.map(fileToBase64));
    onChange([...images, ...b64s]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">
          Imágenes del Producto
        </label>
        <span className={`text-[10px] font-bold ${images.length >= MAX_IMAGES ? "text-red-500" : "text-neutral-400"}`}>
          {images.length}/{MAX_IMAGES} máx.
        </span>
      </div>

      {/* Thumbs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {images.map((src, i) => (
          <div key={i} className="relative w-16 h-16">
            <img src={src} alt="" onError={e => { e.currentTarget.src = PLACEHOLDER; }}
              className="w-16 h-16 object-contain rounded-xl border bg-neutral-50"
              style={{ border: i === 0 ? "2px solid #111" : "1px solid rgba(220,220,220,0.8)" }} />
            {i === 0 && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-black bg-black text-white px-1.5 rounded whitespace-nowrap">PRINCIPAL</span>}
            <button onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center font-black text-[10px] cursor-pointer">×</button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-neutral-200/80 flex items-center justify-center text-neutral-300">
            <Package size={20} />
          </div>
        )}
      </div>

      {/* Add controls */}
      {remaining > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1.5 flex-1 min-w-[180px]">
            <input type="url" placeholder="https://..." id="img-url-input"
              className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 backdrop-blur-sm rounded-lg font-[inherit] text-xs" />
            <button onClick={() => { const el = document.getElementById("img-url-input") as HTMLInputElement; addUrl(el.value); el.value = ""; }}
              className="bg-white/65 border border-neutral-200/80 text-neutral-500 px-3 text-[10px] font-bold rounded-lg cursor-pointer whitespace-nowrap backdrop-blur-sm">
              + URL
            </button>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white/65 border border-neutral-200/80 rounded-lg cursor-pointer text-[10px] font-bold text-neutral-500 whitespace-nowrap backdrop-blur-sm fluent-hover">
            <Upload size={12} />JPG/PNG
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={e => { if (e.target.files) { addFiles(e.target.files); e.target.value = ""; } }} />
          </label>
        </div>
      )}

      {images.length >= MAX_IMAGES && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1.5">
          <AlertCircle size={11} /> Límite de {MAX_IMAGES} imágenes alcanzado. Elimina una para añadir otra.
        </p>
      )}
    </div>
  );
}

/* ── Product form fields ─────────────────────────────────────── */
const BADGES = ["", "NUEVO", "BESTSELLER", "BAJO STOCK", "PREMIUM", "EDICIÓN LTD"];

function ProductFields({ value, onChange }: { value: Partial<Product>; onChange: (p: Partial<Product>) => void }) {
  const F = (k: keyof Product, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
      <Field label="Nombre del Producto" value={value.name || ""} onChange={e => F("name", e.target.value)} className="col-span-2" />
      <Field label="Descripción" value={value.desc || ""} onChange={e => F("desc", e.target.value)} className="col-span-2" />
      <Field label="Precio ($)" type="number" value={value.price ?? ""} onChange={e => F("price", parseFloat(e.target.value) || 0)} />
      <Field label="Stock (uds)" type="number" value={value.stock ?? ""} onChange={e => F("stock", parseInt(e.target.value) || 0)} />
      <Field label="Categoría" value={value.category || ""} onChange={e => F("category", e.target.value)} />
      <Select label="Etiqueta" value={value.badge || ""} onChange={e => F("badge", e.target.value || null)}>
        {BADGES.map(b => <option key={b} value={b}>{b || "(Sin etiqueta)"}</option>)}
      </Select>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export function InventoryManager({
  products, rate,
  onAdd, onUpdate, onDelete, onReset,
}: {
  products: Product[];
  rate: ExchangeRate;
  onAdd: (p: Omit<Product, "id">) => void;
  onUpdate: (id: string, data: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}) {
  const toast = useToast();
  const [newP,    setNewP]    = useState<Partial<Product>>({ name:"", desc:"", price:0, stock:0, images:[], category:"", badge:null });
  const [editing, setEditing] = useState<Product | null>(null);

  const handleAdd = () => {
    if (!newP.name || !newP.price) { toast("Nombre y precio son obligatorios","⚠️"); return; }
    const imgs = (newP.images && newP.images.length > 0) ? newP.images : ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"];
    onAdd({ ...newP as Omit<Product,"id">, images: imgs, img: imgs[0] });
    setNewP({ name:"", desc:"", price:0, stock:0, images:[], category:"", badge:null });
    toast("Producto añadido", "📦");
  };

  const downloadTemplate = () => {
    const csv = "name,category,desc,price,stock,badge,img\nEjemplo Producto,Aceites,Descripción del producto,9.99,25,NUEVO,https://url-imagen.com/img.jpg";
    const b = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "plantilla_productos.csv"; a.click();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Control de Inventario</h1>
          <p className="text-xs text-neutral-400 mt-1">{products.length} productos registrados</p>
        </div>
        <Btn variant="ghost" onClick={downloadTemplate}><Download size={13} /> PLANTILLA CSV</Btn>
      </div>

      {/* CSV Bulk import */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4 flex items-center gap-1.5">
          <FileSpreadsheet size={13} />Importación Masiva · CSV / Excel
        </p>
        <label
          className="flex flex-col items-center justify-center gap-2.5 py-8 px-6 border-2 border-dashed border-neutral-200/60 rounded-xl cursor-pointer bg-neutral-50/50 transition-colors hover:border-green-400/60 hover:bg-green-50/30"
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-green-400/60"); }}
          onDragLeave={e => e.currentTarget.classList.remove("border-green-400/60")}
          onDrop={async e => {
            e.preventDefault(); e.currentTarget.classList.remove("border-green-400/60");
            const file = e.dataTransfer.files[0]; if (!file) return;
            const text = await file.text();
            const parsed = parseCSV(text);
            if (!parsed.length) { toast("Sin productos válidos", "⚠️"); return; }
            parsed.forEach(p => onAdd(p));
            toast(`${parsed.length} productos importados`, "📦");
          }}>
          <FileSpreadsheet size={32} className="text-neutral-300" />
          <div className="text-center">
            <p className="text-sm font-bold text-neutral-500 mb-1">Arrastra tu archivo CSV aquí</p>
            <p className="text-[11px] text-neutral-400">o haz clic para seleccionar</p>
          </div>
          <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return;
            const text = await file.text();
            const parsed = parseCSV(text);
            if (!parsed.length) { toast("Sin productos válidos", "⚠️"); return; }
            parsed.forEach(p => onAdd(p));
            toast(`${parsed.length} productos importados`, "📦");
            e.target.value = "";
          }} />
        </label>
        <p className="text-[10px] text-neutral-400 mt-2.5 text-center">
          Columnas: <code className="bg-neutral-100/80 px-1.5 py-0.5 rounded text-[9px]">name, price, stock</code> · Opcionales: category, desc, badge, img
        </p>
      </div>

      {/* Manual add */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4 flex items-center gap-1.5">
          <Plus size={13} />Agregar Producto Manual
        </p>
        <ProductFields value={newP} onChange={setNewP} />
        <div className="mt-4">
          <ImagePicker
            images={newP.images || []}
            onChange={imgs => setNewP(p => ({ ...p, images: imgs }))} />
        </div>
        <Btn variant="primary" className="mt-4" onClick={handleAdd}>
          <Plus size={13} /> AGREGAR PRODUCTO
        </Btn>
      </div>

      {/* Product list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100/80 flex items-center justify-between">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase m-0">
            Catálogo ({products.length} productos)
          </p>
          <button onClick={() => { if (confirm("¿Restaurar productos de demo?")) { onReset(); toast("Catálogo restaurado", "🔄"); } }}
            className="text-[9px] text-neutral-400 bg-none border-none cursor-pointer font-semibold hover:text-neutral-600">
            Restaurar demo
          </button>
        </div>
        {products.map(p => {
          const thumb = p.images?.[0] || p.img;
          return (
            <div key={p.id}
              className="flex items-center gap-4 px-6 py-3.5 border-b border-neutral-50 transition-colors hover:bg-white/55">
              <div className="neumorph w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden">
                <img src={thumb} alt={p.name} onError={e => { e.currentTarget.src = PLACEHOLDER; }} className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-black uppercase overflow-hidden text-ellipsis whitespace-nowrap m-0 mb-0.5">{p.name}</p>
                <p className="text-[10px] text-neutral-400 m-0">{p.category} · {p.images?.length ?? 1} img</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-black m-0 mb-0.5">{fmt$(p.price)}</p>
                <p className="text-[10px] text-neutral-400 m-0">{fmtBs(p.price, rate.value)}</p>
              </div>
              <div className="text-center w-12 shrink-0">
                <p className="text-base font-black m-0" style={{ color: p.stock <= 8 ? "#e53e3e" : p.stock <= 20 ? "#f59e0b" : "#111" }}>{p.stock}</p>
                <p className="text-[9px] text-neutral-300 m-0 uppercase tracking-wide">stock</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setEditing({ ...p, images: p.images?.length ? p.images : [p.img].filter(Boolean) })}
                  className="w-8 h-8 border border-blue-200/80 text-blue-500 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-blue-500/88 hover:text-white"
                  style={{ background: "transparent" }}>
                  <Edit3 size={13} />
                </button>
                <button onClick={() => { onDelete(p.id); toast("Producto eliminado", "🗑️"); }}
                  className="w-8 h-8 border border-red-200/80 text-red-500 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-red-500/88 hover:text-white"
                  style={{ background: "transparent" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="py-16 text-center text-neutral-300">
            <Package size={40} className="mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Sin productos. Agrega uno arriba o importa CSV.</p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <ProductEditModal
          product={editing}
          onSave={updated => { onUpdate(updated.id, updated); setEditing(null); toast("Producto actualizado", "📦"); }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProductEditModal({ product, onSave, onClose }: { product: Product; onSave: (p: Product) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Product>({ ...product, images: product.images?.length ? [...product.images] : [product.img].filter(Boolean) });

  return (
    <Modal
      title="Editar Producto"
      subtitle={draft.name}
      onClose={onClose}
      width="min(780px,96vw)"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>CANCELAR</Btn>
          <Btn variant="green" onClick={() => {
            const imgs = draft.images.length > 0 ? draft.images : [draft.img || ""].filter(Boolean);
            onSave({ ...draft, images: imgs, img: imgs[0] || "" });
          }}><Save size={12} /> GUARDAR CAMBIOS</Btn>
        </>
      }>
      <div className="p-7 grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        <ProductFields value={draft} onChange={p => setDraft(d => ({ ...d, ...p }))} />
        <ImagePicker images={draft.images} onChange={imgs => setDraft(d => ({ ...d, images: imgs }))} />
      </div>
    </Modal>
  );
}
