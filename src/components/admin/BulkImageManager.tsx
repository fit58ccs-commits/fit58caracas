"use client";
import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, CheckCircle2, Search, Replace, Plus, Package } from "lucide-react";
import { sbUploadImage } from "@/lib/supabase";
import { useToast } from "../ui/Toast";
import type { Product } from "@/lib/types";

/**
 * BulkImageManager — Ether UI
 * Vista de grid para Admin → Inventario: arrastra imágenes directo sobre
 * cada tarjeta de producto para subirlas o reemplazarlas en lote.
 *
 * Usa las mismas funciones que ya usa InventoryManager (sbUploadImage,
 * onUpdate) — no duplica lógica de Supabase ni de esquema de datos.
 */

const MAX_IMAGES = 3; // mismo límite que ImagePicker en InventoryManager.tsx

type Status = "idle" | "uploading" | "success" | "error";

export function BulkImageManager({
  products, onUpdate,
}: {
  products: Product[];
  onUpdate: (id: string, data: Partial<Product>) => void;
}) {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"add" | "replace">("add");
  const [cardStatus, setCardStatus] = useState<Record<string, Status>>({});
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const setStatus = (id: string, s: Status) => {
    setCardStatus(prev => ({ ...prev, [id]: s }));
    if (s === "success" || s === "error") setTimeout(() => setStatus(id, "idle"), 1800);
  };

  const handleFiles = async (product: Product, files: FileList) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) { toast("Solo se aceptan imágenes", "⚠️"); return; }

    const currentImages = product.images?.length ? product.images : [product.img].filter(Boolean);
    const room = mode === "replace" ? MAX_IMAGES : MAX_IMAGES - currentImages.length;
    if (room <= 0) { toast(`Límite de ${MAX_IMAGES} imágenes alcanzado`, "⚠️"); return; }

    const toUpload = imageFiles.slice(0, room);
    setStatus(product.id, "uploading");

    try {
      const results = await Promise.all(toUpload.map(file => sbUploadImage(file, "products")));
      const uploaded = results.filter((u): u is string => !!u);
      if (uploaded.length === 0) throw new Error("upload failed");

      const newImages = mode === "replace" ? uploaded : [...currentImages, ...uploaded];
      onUpdate(product.id, { images: newImages, img: newImages[0] || "" });
      setStatus(product.id, "success");
      toast(`${uploaded.length} imagen(es) subida(s) — ${product.name}`, "✅");
    } catch {
      setStatus(product.id, "error");
      toast("Error al subir imágenes", "❌");
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const missingCount = products.filter(p => !(p.images?.length) && !p.img).length;

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase m-0 flex items-center gap-1.5">
            <ImagePlus size={13}/> Gestión Masiva de Imágenes
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Arrastra imágenes directo sobre cada tarjeta.{" "}
            {missingCount > 0 && (
              <span className="text-red-500 font-semibold">{missingCount} sin imagen</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/72 border border-neutral-200/80 rounded-lg px-2.5 py-1.5">
            <Search size={12} className="text-neutral-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="bg-transparent outline-none text-[11px] w-32"/>
          </div>
          <div className="flex gap-1 bg-white/50 border border-neutral-200/80 rounded-lg p-1">
            <button onClick={()=>setMode("add")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${mode==="add"?"bg-black text-white":"text-neutral-500"}`}>
              <Plus size={11}/> Agregar
            </button>
            <button onClick={()=>setMode("replace")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${mode==="replace"?"bg-black text-white":"text-neutral-500"}`}>
              <Replace size={11}/> Reemplazar
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-neutral-300">
          <Package size={28} className="mx-auto mb-2"/>
          <p className="text-xs text-neutral-400">No hay productos que coincidan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(p => (
            <ImageDropCard
              key={p.id}
              product={p}
              status={cardStatus[p.id] || "idle"}
              isDragOver={dragOverId === p.id}
              onDragEnter={() => setDragOverId(p.id)}
              onDragLeave={() => setDragOverId(null)}
              onDrop={files => { setDragOverId(null); handleFiles(p, files); }}
              onPick={files => handleFiles(p, files)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageDropCard({
  product, status, isDragOver, onDragEnter, onDragLeave, onDrop, onPick,
}: {
  product: Product;
  status: Status;
  isDragOver: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (files: FileList) => void;
  onPick: (files: FileList) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cover = product.images?.[0] || product.img;
  const extraCount = (product.images?.length || (product.img ? 1 : 0)) - 1;

  return (
    <div
      onDragOver={e => e.preventDefault()}
      onDragEnter={e => { e.preventDefault(); onDragEnter(); }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.length) onDrop(e.dataTransfer.files); }}
      className={`relative rounded-xl overflow-hidden bg-white/70 border transition-all ${
        isDragOver ? "border-black ring-2 ring-black scale-[1.02]" : "border-neutral-200/70"
      }`}
    >
      <div className="relative aspect-square bg-white flex items-center justify-center">
        {cover ? (
          <img src={cover} alt={product.name} className="w-full h-full object-contain"/>
        ) : (
          <div className="flex flex-col items-center gap-1 text-neutral-300">
            <ImagePlus size={22} strokeWidth={1.5}/>
            <span className="text-[9px] font-medium">Arrastra aquí</span>
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">Soltar para subir</span>
          </div>
        )}
        {status === "uploading" && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-black"/>
          </div>
        )}
        {status === "success" && (
          <div className="absolute top-1.5 right-1.5 text-green-600 bg-white rounded-full">
            <CheckCircle2 size={16}/>
          </div>
        )}
        {extraCount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-white/85 text-[9px] font-bold text-neutral-500 rounded-full px-1.5 py-0.5">
            +{extraCount}
          </span>
        )}
      </div>

      <div className="p-2">
        <p className="text-[10px] font-black text-black truncate">{product.name}</p>
        <p className="text-[9px] text-neutral-400 truncate">{product.category || "Sin categoría"}</p>
        <button onClick={() => fileInputRef.current?.click()}
          className="mt-1.5 w-full flex items-center justify-center gap-1 text-[9px] font-bold text-neutral-500 bg-white/70 border border-neutral-200/80 rounded-md py-1 hover:text-black">
          <ImagePlus size={10}/> Subir
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
          onChange={e => { if (e.target.files?.length) onPick(e.target.files); e.target.value = ""; }}/>
      </div>
    </div>
  );
}
