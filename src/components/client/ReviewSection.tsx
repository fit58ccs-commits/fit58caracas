"use client";
/**
 * ReviewSection.tsx
 * Sección pública donde el cliente puede:
 * 1. Ver reseñas aprobadas de productos
 * 2. Dejar su propia reseña tras una compra
 */
import { useState, useMemo } from "react";
import { Star, Send, Package, MessageSquare, ThumbsUp } from "lucide-react";
import type { Review, Product } from "@/lib/types";

const genId = () => Math.random().toString(36).slice(2, 9);

interface Props {
  products: Product[];
  reviews:  Review[];
  onSubmitReview: (r: Omit<Review, "id" | "date" | "approved">) => void;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="border-none bg-none cursor-pointer p-0.5 transition-transform hover:scale-110">
          <Star size={22} color="#f59e0b" fill={(hover||value) >= i ? "#f59e0b" : "none"}/>
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ products, reviews, onSubmitReview }: Props) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [form, setForm]   = useState({ author:"", comment:"", rating:0, serviceRating:0 });
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab]     = useState<"reviews"|"write">("reviews");
  const [filterProduct, setFilterProduct] = useState("all");

  const approved = reviews.filter(r => r.approved);

  const displayed = useMemo(() => {
    return filterProduct === "all"
      ? approved
      : approved.filter(r => r.productId === filterProduct);
  }, [approved, filterProduct]);

  const avgByProduct = useMemo(() => {
    const map: Record<string, { avg: number; count: number }> = {};
    approved.forEach(r => {
      if (!map[r.productId]) map[r.productId] = { avg: 0, count: 0 };
      map[r.productId].count++;
      map[r.productId].avg += r.rating;
    });
    Object.keys(map).forEach(k => { map[k].avg = map[k].avg / map[k].count; });
    return map;
  }, [approved]);

  const handleSubmit = () => {
    if (!form.author || !form.comment || !selectedProduct || form.rating === 0) return;
    onSubmitReview({
      productId: selectedProduct,
      author:    form.author,
      rating:    form.rating,
      comment:   form.comment,
      serviceRating: form.serviceRating || undefined,
    });
    setSubmitted(true);
    setForm({ author:"", comment:"", rating:0, serviceRating:0 });
    setSelectedProduct("");
  };

  const inputCls = "w-full border border-neutral-200/80 px-4 py-3 text-sm text-black bg-white/72 rounded-xl font-[inherit] field-input";

  return (
    <section id="resenas" className="max-w-[1280px] mx-auto px-4 md:px-7 py-10">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight m-0">Reseñas</h2>
          <p className="text-xs text-neutral-400 mt-1">
            {approved.length > 0
              ? `${approved.length} reseña${approved.length!==1?"s":""} verificada${approved.length!==1?"s":""}`
              : "Sé el primero en dejar una reseña"}
          </p>
        </div>
        {/* Tab toggle */}
        <div className="flex gap-1 glass rounded-full p-1">
          {(["reviews","write"] as const).map(t => (
            <button key={t} onClick={()=>{setTab(t);setSubmitted(false);}}
              className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border-none cursor-pointer transition-all"
              style={{
                background: tab===t ? "rgba(17,17,17,0.88)" : "transparent",
                color:      tab===t ? "#fff" : "#888",
              }}>
              {t==="reviews"?"Ver Reseñas":"✍ Escribir Reseña"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Ver reseñas */}
      {tab === "reviews" && (
        <div className="flex flex-col gap-5">
          {/* Resumen por producto */}
          {products.filter(p => avgByProduct[p.id]).length > 0 && (
            <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))"}}>
              {[{ id:"all", name:"Todos los productos" }, ...products.filter(p => avgByProduct[p.id])].map(p => {
                const stats = p.id === "all" ? null : avgByProduct[p.id];
                const isActive = filterProduct === p.id;
                return (
                  <button key={p.id} onClick={() => setFilterProduct(p.id)}
                    className="glass-card rounded-xl p-3 text-left cursor-pointer transition-all"
                    style={{ border: isActive ? "2px solid #111" : "1px solid rgba(255,255,255,0.6)" }}>
                    <p className="text-[10px] font-black text-black uppercase leading-snug mb-1 truncate">{p.name}</p>
                    {stats ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i=><Star key={i} size={9} color="#f59e0b" fill={i<=Math.round(stats.avg)?"#f59e0b":"none"}/>)}
                        </div>
                        <span className="text-[9px] text-neutral-400">{stats.avg.toFixed(1)} ({stats.count})</span>
                      </div>
                    ) : (
                      <p className="text-[9px] text-neutral-400">{approved.length} reseñas</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Lista de reseñas */}
          {displayed.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <MessageSquare size={36} className="mx-auto mb-3 text-neutral-200"/>
              <p className="text-sm font-semibold text-neutral-400">
                {approved.length === 0 ? "Aún no hay reseñas" : "Sin reseñas para este producto"}
              </p>
              <button onClick={()=>setTab("write")}
                className="mt-3 px-5 py-2 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer bg-black text-white">
                ✍ Escribir la primera reseña
              </button>
            </div>
          ) : (
            <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
              {displayed.map(r => {
                const prod = products.find(p => p.id === r.productId);
                return (
                  <div key={r.id} className="glass-card rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-black text-black mb-0.5">{r.author}</p>
                        <p className="text-[9px] text-neutral-400">{new Date(r.date).toLocaleDateString("es-VE")}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i=><Star key={i} size={11} color="#f59e0b" fill={i<=r.rating?"#f59e0b":"none"}/>)}
                      </div>
                    </div>
                    {prod && (
                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                        <Package size={9}/>{prod.name}
                      </div>
                    )}
                    <p className="text-xs text-neutral-600 leading-relaxed">{r.comment}</p>
                    {r.serviceRating && (
                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 border-t border-neutral-100/80 pt-2">
                        <ThumbsUp size={9}/>Servicio:
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i=><Star key={i} size={9} color="#f59e0b" fill={i<=r.serviceRating!?"#f59e0b":"none"}/>)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Escribir reseña */}
      {tab === "write" && (
        <div className="max-w-xl mx-auto">
          {submitted ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <ThumbsUp size={28} className="text-green-500"/>
              </div>
              <h3 className="text-lg font-black text-black uppercase mb-2">¡Gracias por tu reseña!</h3>
              <p className="text-sm text-neutral-400">Tu opinión será revisada y publicada pronto. Ayuda a otros clientes a tomar mejores decisiones.</p>
              <button onClick={()=>setSubmitted(false)}
                className="mt-5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer bg-black text-white">
                Escribir otra reseña
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-black text-black uppercase tracking-tight m-0">Cuéntanos tu experiencia</h3>
              <p className="text-xs text-neutral-400 -mt-2">Solo comparte reseñas sobre productos que hayas comprado con nosotros.</p>

              {/* Producto */}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">
                  <Package size={11} className="inline mr-1"/>Producto comprado
                </label>
                <select value={selectedProduct} onChange={e=>setSelectedProduct(e.target.value)} className={inputCls+" appearance-none cursor-pointer"}>
                  <option value="">Seleccionar producto...</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">Tu nombre</label>
                <input value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))}
                  placeholder="Juan Pérez" className={inputCls}/>
              </div>

              {/* Rating producto */}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">
                  Calificación del producto
                </label>
                <StarPicker value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))}/>
              </div>

              {/* Rating servicio */}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">
                  Calificación del servicio (opcional)
                </label>
                <StarPicker value={form.serviceRating} onChange={v=>setForm(f=>({...f,serviceRating:v}))}/>
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">Tu reseña</label>
                <textarea value={form.comment} onChange={e=>setForm(f=>({...f,comment:e.target.value}))}
                  placeholder="Cuéntanos qué te pareció el producto, si cumplió tus expectativas, si lo recomendarías..."
                  rows={4} className={inputCls+" resize-none"}/>
              </div>

              <button onClick={handleSubmit}
                disabled={!form.author||!form.comment||!selectedProduct||form.rating===0}
                className="flex items-center justify-center gap-2 py-3.5 text-[11px] font-black uppercase rounded-xl cursor-pointer border-none transition-all disabled:opacity-40"
                style={{background:"rgba(17,17,17,0.90)",color:"#fff"}}>
                <Send size={13}/> ENVIAR RESEÑA
              </button>
              <p className="text-[9px] text-neutral-400 text-center">
                Tu reseña será revisada antes de publicarse. No compartimos tu información personal.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
