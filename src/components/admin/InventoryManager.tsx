"use client";
import { useState } from "react";
import { Plus, Upload, Trash2, Edit3, Save, Download, FileSpreadsheet, AlertCircle, Package, Image } from "lucide-react";
import { genId, fmt$, fmtBs } from "@/lib/store";
import { sbUploadImage } from "@/lib/supabase";
import { Btn, Field, Select, Modal } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { Product, ExchangeRate } from "@/lib/types";

const MAX_IMAGES = 3;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ddd' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3C/svg%3E";
const BADGES = ["", "NUEVO", "BESTSELLER", "BAJO STOCK", "PREMIUM", "EDICIÓN LTD"];

const parseCSV = (text: string): Omit<Product, "id">[] => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const get  = (k: string) => vals[headers.indexOf(k)] ?? "";
    const img  = get("img") || get("imagen") || get("image") || "";
    const desc = get("desc") || get("descripcion") || get("description") || "";
    return {
      name:     get("name") || get("nombre") || "",
      category: get("category") || get("categoria") || "",
      desc,
      price:    parseFloat(get("price") || get("precio") || "0") || 0,
      stock:    parseInt(get("stock") || "0") || 0,
      badge:    get("badge") || get("etiqueta") || null,
      images:   img ? [img] : [],
      img,
    };
  }).filter(p => p.name && p.price > 0);
};

/* ── Image picker ─────────────────────────────────────────── */
function ImagePicker({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) {
  const toast  = useToast();
  const remaining = MAX_IMAGES - images.length;
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx]   = useState<number|null>(null);

  const addUrl = (url: string) => {
    if (!url.trim() || images.length >= MAX_IMAGES) return;
    onChange([...images, url]);
  };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith("image/"));
    const toAdd = list.slice(0, MAX_IMAGES - images.length);
    if (toAdd.length === 0) { toast(`Límite de ${MAX_IMAGES} imágenes alcanzado`, "⚠️"); return; }
    if (list.length > toAdd.length) toast(`Solo se subieron ${toAdd.length} (límite ${MAX_IMAGES})`, "⚠️");

    toast(`Subiendo ${toAdd.length} imagen(es)...`, "⬆️");
    const uploaded: string[] = [];
    for (const file of toAdd) {
      const url = await sbUploadImage(file, "products");
      if (url) uploaded.push(url);
    }
    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]); // una sola actualización, sin cierre obsoleto
      toast(`${uploaded.length} imagen(es) subida(s)`, "✅");
    }
    if (uploaded.length < toAdd.length) toast("Alguna imagen falló al subir", "❌");
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">
          Imágenes del Producto (máx {MAX_IMAGES}) — arrastra para reordenar
        </label>
        <span className={`text-[10px] font-bold ${images.length >= MAX_IMAGES ? "text-red-500" : "text-neutral-400"}`}>
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {/* Zona de arrastre masiva por producto */}
      <div
        onDragOver={e=>{e.preventDefault();setDragOver(true);}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{
          e.preventDefault(); setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className="flex gap-2 flex-wrap mb-3 p-2 rounded-xl transition-colors"
        style={{
          border: dragOver ? "2px dashed #111" : "2px dashed transparent",
          background: dragOver ? "rgba(0,0,0,0.03)" : "transparent",
        }}
      >
        {images.map((src, i) => (
          <div key={i}
            draggable
            onDragStart={()=>setDragIdx(i)}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault(); if(dragIdx!==null) moveImage(dragIdx, i); setDragIdx(null);}}
            onDragEnd={()=>setDragIdx(null)}
            className="relative w-16 h-16 cursor-grab active:cursor-grabbing"
            style={{opacity: dragIdx===i ? 0.4 : 1}}>
            <img src={src} alt="" onError={e=>{e.currentTarget.src=PLACEHOLDER;}}
              className="w-16 h-16 object-contain rounded-xl border bg-neutral-50 pointer-events-none"
              style={{border:i===0?"2px solid #111":"1px solid rgba(220,220,220,0.8)"}}/>
            {i===0 && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-black bg-black text-white px-1 rounded whitespace-nowrap pointer-events-none">PRINCIPAL</span>}
            <button onClick={()=>onChange(images.filter((_,j)=>j!==i))}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white border-2 border-white flex items-center justify-center font-black text-[10px] cursor-pointer">×</button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="w-full min-h-[64px] rounded-xl border-2 border-dashed border-neutral-200/80 flex flex-col items-center justify-center text-neutral-300 py-3 gap-1">
            <Package size={20}/>
            <span className="text-[9px] font-semibold">Arrastra imágenes aquí</span>
          </div>
        )}
      </div>

      {remaining > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1.5 flex-1 min-w-[180px]">
            <input type="url" placeholder="https://..." id="img-url-input"
              className="field-input flex-1 border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit] text-xs"/>
            <button onClick={()=>{const el=document.getElementById("img-url-input") as HTMLInputElement;addUrl(el.value);el.value="";}}
              className="bg-white/65 border border-neutral-200/80 text-neutral-500 px-3 text-[10px] font-bold rounded-lg cursor-pointer whitespace-nowrap">
              + URL
            </button>
          </div>
          <label className="flex items-center gap-1.5 px-3 py-2 bg-white/65 border border-neutral-200/80 rounded-lg cursor-pointer text-[10px] font-bold text-neutral-500 whitespace-nowrap fluent-hover">
            <Upload size={12}/>Subir JPG/PNG
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={e=>{if(e.target.files){addFiles(e.target.files);e.target.value="";}}}/>
          </label>
        </div>
      )}
      {images.length >= MAX_IMAGES && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1.5">
          <AlertCircle size={11}/> Límite de {MAX_IMAGES} imágenes alcanzado
        </p>
      )}
    </div>
  );
}

/* ── Spec Sheet picker ─────────────────────────────────────── */
function SpecSheetPicker({ value, onChange }: { value?: string; onChange: (url: string) => void }) {
  const toast = useToast();

  const uploadFile = async (file: File) => {
    toast("Subiendo ficha técnica...", "⬆️");
    const url = await sbUploadImage(file, "products");
    if (url) { onChange(url); toast("Ficha técnica subida", "✅"); }
    else       toast("Error al subir ficha técnica", "❌");
  };

  return (
    <div>
      <label className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2 block flex items-center gap-1">
        <Image size={11}/> Ficha Técnica (imagen)
      </label>
      {value ? (
        <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
          <img src={value} alt="Ficha técnica" className="w-20 h-14 object-contain rounded-lg border border-neutral-200/60"/>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-green-600 mb-1">✓ Ficha técnica cargada</p>
            <button onClick={()=>onChange("")} className="text-[10px] text-red-500 border-none bg-none cursor-pointer font-[inherit]">Quitar</button>
          </div>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-neutral-200/80 rounded-xl cursor-pointer hover:border-blue-400/60 hover:bg-blue-50/20 transition-all">
          <Image size={15} className="text-neutral-300"/>
          <span className="text-[11px] font-bold text-neutral-400">Subir imagen de ficha técnica</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f)uploadFile(f);e.target.value="";}}/>
        </label>
      )}
      <p className="text-[9px] text-neutral-400 mt-1">Se muestra en el modal del producto → pestaña "Ficha Técnica"</p>
    </div>
  );
}

/* ── Product form fields ─────────────────────────────────────── */
function ProductFields({
  value, onChange, categories,
}: {
  value: Partial<Product>;
  onChange: (p: Partial<Product>) => void;
  categories?: string[];
}) {
  const F = (k: keyof Product, v: unknown) => onChange({ ...value, [k]: v });
  const cats = categories?.length ? categories : ["Aceites","Bebidas","Dulces","Frutos","Pastas","Pastillas","Suplementos"];

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))" }}>
      <Field label="Nombre del Producto" value={value.name||""} onChange={e=>F("name",e.target.value)} className="col-span-2"/>
      <div className="col-span-2">
        <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">Descripción</label>
        <textarea value={value.desc||""} onChange={e=>F("desc",e.target.value)} rows={3}
          className="field-input w-full border border-neutral-200/80 px-3.5 py-2.5 text-sm text-neutral-800 bg-white/72 rounded-lg font-[inherit] resize-none"
          placeholder="Descripción detallada del producto..."/>
      </div>
      <Field label="Precio ($)" type="number" value={value.price??""} onChange={e=>F("price",parseFloat(e.target.value)||0)}/>
      <Field label="Stock (uds)" type="number" value={value.stock??""} onChange={e=>F("stock",parseInt(e.target.value)||0)}/>
      <Select label="Categoría" value={value.category||""} onChange={e=>F("category",e.target.value)}>
        <option value="">Sin categoría</option>
        {cats.map(c=><option key={c}>{c}</option>)}
      </Select>
      <Select label="Etiqueta" value={value.badge||""} onChange={e=>F("badge",e.target.value||null)}>
        {BADGES.map(b=><option key={b} value={b}>{b||(b===""?"(Sin etiqueta)":b)}</option>)}
      </Select>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export function InventoryManager({
  products, rate, categories,
  onAdd, onUpdate, onDelete, onReset,
}: {
  products:   Product[];
  rate:       ExchangeRate;
  categories?: string[];
  onAdd:      (p: Omit<Product,"id">) => void;
  onUpdate:   (id: string, data: Partial<Product>) => void;
  onDelete:   (id: string) => void;
  onReset:    () => void;
}) {
  const toast = useToast();
  const [newP,    setNewP]    = useState<Partial<Product>>({ name:"", desc:"", price:0, stock:0, images:[], category:"", badge:null });
  const [editing, setEditing] = useState<Product|null>(null);
  const [search,  setSearch]  = useState("");

  const filteredProducts = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newP.name || !newP.price) { toast("Nombre y precio son obligatorios","⚠️"); return; }
    const imgs = (newP.images && newP.images.length>0) ? newP.images : [];
    onAdd({ ...newP as Omit<Product,"id">, images:imgs, img:imgs[0]||"" });
    setNewP({ name:"", desc:"", price:0, stock:0, images:[], category:"", badge:null });
    toast("Producto añadido","📦");
  };

  // Descargar plantilla Excel con formato profesional
  const downloadTemplate = () => {
    // Genera un CSV con BOM para que Excel lo abra correctamente
    const bom  = "\uFEFF";
    const rows = [
      ["name","category","desc","price","stock","badge","img"],
      ["Aceite de Oliva Extra Virgen","Aceites","500ml · Prensado en frío · Cosecha selecta","8.50","48","BESTSELLER","https://url-imagen.com/img.jpg"],
      ["Café Gourmet Molido","Bebidas","250g · Tueste artesanal · Origen único","6.00","30","NUEVO",""],
      ["Miel Pura de Abeja","Dulces","350g · Sin conservantes · Cruda","7.25","5","BAJO STOCK",""],
      ["","","","","","",""],
      ["","","","","","",""],
      ["","","","","","",""],
    ];
    const csv  = bom + rows.map(r => r.map(v => `"${v}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "Plantilla_Fit58_Productos.csv";
    a.click();
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Control de Inventario</h1>
          <p className="text-xs text-neutral-400 mt-1">{products.length} productos · Stock total: {products.reduce((s,p)=>s+p.stock,0)} uds</p>
        </div>
        <Btn variant="ghost" onClick={downloadTemplate}><Download size={13}/> PLANTILLA EXCEL/CSV</Btn>
      </div>

      {/* CSV Bulk import */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-3 flex items-center gap-1.5">
          <FileSpreadsheet size={13}/>Importación Masiva · Arrastra tu archivo CSV/Excel
        </p>
        <label className="flex flex-col items-center justify-center gap-2 py-6 px-6 border-2 border-dashed border-neutral-200/60 rounded-xl cursor-pointer bg-neutral-50/50 transition-colors hover:border-green-400/60 hover:bg-green-50/30"
          onDragOver={e=>{e.preventDefault();}}
          onDrop={async e=>{
            e.preventDefault();
            const file=e.dataTransfer.files[0]; if(!file) return;
            const text=await file.text();
            const parsed=parseCSV(text);
            if(!parsed.length){toast("Sin productos válidos — revisa el formato","⚠️");return;}
            parsed.forEach(p=>onAdd(p));
            toast(`${parsed.length} productos importados`,"📦");
          }}>
          <FileSpreadsheet size={28} className="text-neutral-300"/>
          <p className="text-sm font-bold text-neutral-500">Arrastra el CSV aquí o haz clic para seleccionar</p>
          <p className="text-[10px] text-neutral-400">Usa la plantilla de arriba como referencia</p>
          <input type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={async e=>{
            const file=e.target.files?.[0]; if(!file) return;
            const text=await file.text();
            const parsed=parseCSV(text);
            if(!parsed.length){toast("Sin productos válidos","⚠️");return;}
            parsed.forEach(p=>onAdd(p));
            toast(`${parsed.length} productos importados`,"📦");
            e.target.value="";
          }}/>
        </label>
        <p className="text-[10px] text-neutral-400 mt-2 text-center">
          Columnas: <code className="bg-neutral-100/80 px-1.5 py-0.5 rounded text-[9px]">name, price, stock</code> · Opcionales: category, desc, badge, img
        </p>
      </div>

      {/* Manual add */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-4 flex items-center gap-1.5">
          <Plus size={13}/>Agregar Producto Manual
        </p>
        <ProductFields value={newP} onChange={setNewP} categories={categories}/>
        <div className="mt-4">
          <ImagePicker images={newP.images||[]} onChange={imgs=>setNewP(p=>({...p,images:imgs}))}/>
        </div>
        <Btn variant="primary" className="mt-4" onClick={handleAdd}>
          <Plus size={13}/> AGREGAR PRODUCTO
        </Btn>
      </div>

      {/* Product list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100/80 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase m-0">
            Catálogo ({filteredProducts.length}/{products.length})
          </p>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="field-input flex-1 border border-neutral-200/80 px-3 py-1.5 text-xs bg-white/72 rounded-lg font-[inherit]"/>
          </div>
          <button onClick={()=>{if(confirm("¿Restaurar productos de demo?")){onReset();toast("Catálogo restaurado","🔄");}}}
            className="text-[9px] text-neutral-400 bg-none border-none cursor-pointer font-semibold hover:text-neutral-600 whitespace-nowrap">
            Restaurar demo
          </button>
        </div>
        {filteredProducts.map(p => {
          const thumb = p.images?.[0] || p.img;
          return (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3 border-b border-neutral-50 transition-colors hover:bg-white/55">
              <div className="neumorph w-11 h-11 flex items-center justify-center shrink-0 rounded-xl overflow-hidden">
                <img src={thumb} alt={p.name} onError={e=>{e.currentTarget.src=PLACEHOLDER;}} className="w-9 h-9 object-contain"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-black uppercase overflow-hidden text-ellipsis whitespace-nowrap m-0 mb-0.5">{p.name}</p>
                <p className="text-[10px] text-neutral-400 m-0">{p.category} · {p.images?.length??1} img {p.specSheet?"· 📋 ficha":""}</p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <p className="text-sm font-black text-black m-0">{fmt$(p.price)}</p>
                <p className="text-[9px] text-neutral-400 m-0">{fmtBs(p.price,rate.value)}</p>
              </div>
              <div className="text-center w-10 shrink-0">
                <p className="text-sm font-black m-0" style={{color:p.stock<=8?"#e53e3e":p.stock<=20?"#f59e0b":"#111"}}>{p.stock}</p>
                <p className="text-[8px] text-neutral-300 m-0 uppercase">stock</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={()=>setEditing({...p,images:p.images?.length?[...p.images]:[p.img].filter(Boolean)})}
                  className="w-8 h-8 border border-blue-200/80 text-blue-500 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-blue-500/88 hover:text-white"
                  style={{background:"transparent"}}>
                  <Edit3 size={13}/>
                </button>
                <button onClick={()=>{onDelete(p.id);toast("Producto eliminado","🗑️");}}
                  className="w-8 h-8 border border-red-200/80 text-red-500 flex items-center justify-center rounded-lg cursor-pointer transition-all hover:bg-red-500/88 hover:text-white"
                  style={{background:"transparent"}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="py-14 text-center text-neutral-300">
            <Package size={36} className="mx-auto mb-3"/>
            <p className="text-sm font-semibold text-neutral-400">
              {search ? "Sin coincidencias" : "Sin productos. Agrega uno arriba."}
            </p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <ProductEditModal product={editing} categories={categories}
          onSave={updated=>{onUpdate(updated.id,updated);setEditing(null);toast("Producto actualizado","📦");}}
          onClose={()=>setEditing(null)}/>
      )}
    </div>
  );
}

function ProductEditModal({ product, categories, onSave, onClose }: {
  product:    Product;
  categories?: string[];
  onSave:     (p: Product) => void;
  onClose:    () => void;
}) {
  const [draft, setDraft] = useState<Product>({
    ...product,
    images: product.images?.length ? [...product.images] : [product.img].filter(Boolean),
  });

  return (
    <Modal title="Editar Producto" subtitle={draft.name} onClose={onClose} width="min(820px,96vw)"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>CANCELAR</Btn>
          <Btn variant="green" onClick={()=>{
            const imgs = draft.images.length>0 ? draft.images : [draft.img||""].filter(Boolean);
            onSave({...draft,images:imgs,img:imgs[0]||""});
          }}><Save size={12}/> GUARDAR CAMBIOS</Btn>
        </>
      }>
      <div className="p-6 flex flex-col gap-5">
        <ProductFields value={draft} onChange={p=>setDraft(d=>({...d,...p}))} categories={categories}/>
        <ImagePicker images={draft.images} onChange={imgs=>setDraft(d=>({...d,images:imgs}))}/>
        <SpecSheetPicker value={draft.specSheet} onChange={url=>setDraft(d=>({...d,specSheet:url}))}/>
      </div>
    </Modal>
  );
}
