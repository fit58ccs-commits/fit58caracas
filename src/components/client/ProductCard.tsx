"use client";
import { useState, useRef } from "react";
import { Heart, AlertCircle, ShoppingCart, Check, ChevronLeft, ChevronRight, X, Shield, Truck, Star, MessageSquare, ZoomIn } from "lucide-react";
import { fmt$, fmtBs } from "@/lib/store";
import type { Product, Review } from "@/lib/types";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ddd' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";

/* ── Stars component ─────────────────────────────────────────── */
function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} color="#f59e0b" fill={i < Math.round(rating) ? "#f59e0b" : "none"}/>
      ))}
    </div>
  );
}

/* ── ProductCard ────────────────────────────────────────────────── */
export function ProductCard({
  product, rate, onAdd, inCart, wishlisted, onWishlist, onDetail, reviews = [],
}: {
  product: Product; rate: number;
  onAdd: () => void; inCart: number;
  wishlisted: boolean; onWishlist: () => void;
  onDetail: () => void;
  reviews?: Review[];
}) {
  const [imgIdx,   setImgIdx]   = useState(0);
  const [heartKey, setHeartKey] = useState(0);
  const [addKey,   setAddKey]   = useState(0);
  const images   = product.images?.length ? product.images : [product.img].filter(Boolean);
  const lowStock = product.stock > 0 && product.stock <= 8;
  const approved = reviews.filter(r => r.productId === product.id && r.approved);
  const avgRating = approved.length > 0 ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0;

  const badgeColor = (b: string) => ({
    "BAJO STOCK":  "bg-red-500/88",
    "BESTSELLER":  "bg-black/85",
    "NUEVO":       "bg-blue-600/88",
    "PREMIUM":     "bg-purple-600/85",
    "EDICIÓN LTD": "bg-neutral-700/85",
  }[b] ?? "bg-neutral-700/85");

  return (
    <div className="prod-card glass-card rounded-2xl flex flex-col relative overflow-hidden">
      {product.badge && (
        <div className={`${badgeColor(product.badge)} animate-badge-pulse absolute top-3.5 left-3.5 z-[3] text-white text-[8px] font-black tracking-[1.5px] uppercase px-2.5 py-1 rounded-md backdrop-blur-sm`}>
          {product.badge}
        </div>
      )}
      <button key={heartKey}
        onClick={e => { e.stopPropagation(); setHeartKey(k => k+1); onWishlist(); }}
        className={`${heartKey>0?"animate-heart-pop":""} absolute top-3 right-3 z-[3] w-8 h-8 rounded-full bg-white/82 backdrop-blur-xl border border-white/70 flex items-center justify-center cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.10)]`}>
        <Heart size={14} color={wishlisted?"#e53e3e":"#bbb"} fill={wishlisted?"#e53e3e":"none"}/>
      </button>

      {/* Image */}
      <div className="relative overflow-hidden cursor-pointer" style={{height:220}} onClick={onDetail}>
        <img src={images[imgIdx]||PLACEHOLDER} alt={product.name}
          onError={e=>{e.currentTarget.src=PLACEHOLDER;}}
          className="w-full h-full object-cover"/>
        {images.length > 1 && (
          <>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i-1+images.length)%images.length);}}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/85 border border-neutral-200/70 flex items-center justify-center cursor-pointer z-[2]">
              <ChevronLeft size={12}/>
            </button>
            <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i+1)%images.length);}}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/85 border border-neutral-200/70 flex items-center justify-center cursor-pointer z-[2]">
              <ChevronRight size={12}/>
            </button>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/45 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-[2]">
              {imgIdx+1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3 md:p-4 flex flex-col gap-1 flex-1 bg-white/55">
        <p className="text-[9px] font-bold text-neutral-400 tracking-[1.5px] uppercase m-0">{product.category}</p>
        <h3 className="text-[12px] md:text-[13px] font-black text-black uppercase tracking-wide m-0 leading-snug cursor-pointer" onClick={onDetail}>
          {product.name}
        </h3>

        {/* Descripción — máx 2 líneas + Leer más */}
        <div className="text-[10px] md:text-[11px] text-neutral-400 leading-relaxed">
          <span className="line-clamp-2">{product.desc}</span>
          {product.desc && product.desc.length > 60 && (
            <button onClick={onDetail} className="text-[10px] font-bold text-black border-none bg-none cursor-pointer p-0 ml-1">
              Leer más
            </button>
          )}
        </div>

        {/* Reseñas — solo si hay aprobadas */}
        {approved.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Stars rating={avgRating} size={10}/>
            <span className="text-[9px] text-neutral-400 font-semibold">{avgRating.toFixed(1)} ({approved.length})</span>
          </div>
        )}

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-lg md:text-xl font-black text-black">{fmt$(product.price)}</span>
          <span className="text-[10px] text-neutral-400">{fmtBs(product.price, rate)}</span>
        </div>

        {/* No mostrar stock al cliente */}

        <button key={addKey} onClick={()=>{setAddKey(k=>k+1);onAdd();}}
          className={`${addKey>0?"animate-cart-pop":""} mt-auto flex items-center justify-center gap-1.5 py-2.5 text-[9px] md:text-[10px] font-black tracking-[1.2px] uppercase rounded-lg transition-all duration-200 border cursor-pointer`}
          style={{
            border:`1.5px solid ${inCart>0?"rgba(17,17,17,0.85)":"rgba(200,200,200,0.7)"}`,
            background:inCart>0?"rgba(17,17,17,0.88)":"rgba(255,255,255,0.72)",
            color:inCart>0?"#fff":"#111",
            backdropFilter:"blur(8px)",
            boxShadow:inCart>0?"0 4px 16px rgba(0,0,0,0.22)":"none",
          }}>
          {inCart>0 ? <><Check size={11}/>EN CARRITO ({inCart})</> : <><ShoppingCart size={11}/>AGREGAR</>}
        </button>
      </div>
    </div>
  );
}

/* ── ProductDetailModal ─────────────────────────────────────────── */
export function ProductDetailModal({
  product, rate, onAdd, inCart, onClose, reviews = [],
}: {
  product: Product; rate: number;
  onAdd: () => void; inCart: number;
  onClose: () => void;
  reviews?: Review[];
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState<"info"|"spec"|"reviews">("info");
  const [isHovering, setIsHovering] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement | null>(null);
  const images   = product.images?.length ? product.images : [product.img].filter(Boolean);
  const approved = reviews.filter(r => r.productId === product.id && r.approved);
  const avgRating = approved.length > 0 ? approved.reduce((s,r) => s+r.rating, 0) / approved.length : 0;

  return (
    <div className="fixed inset-0 z-[300] flex">
      <div className="animate-overlay-in absolute inset-0 bg-black/55 backdrop-blur-xl" onClick={onClose}/>
      <div className="glass animate-drawer-in relative m-auto rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.30)] flex flex-col max-h-[92vh]" style={{width:"min(900px,96vw)"}}>
        <button onClick={onClose}
          className="fluent-hover absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/82 backdrop-blur-xl border border-white/70 flex items-center justify-center cursor-pointer">
          <X size={16}/>
        </button>

        <div className="flex flex-wrap overflow-auto">
          {/* Gallery */}
          <div className="flex-none w-full md:w-[380px] bg-white flex flex-col items-center justify-center p-6 gap-4 min-h-[280px]">
            <div
              ref={imgWrapRef}
              className="relative w-full flex items-center justify-center min-h-[240px] cursor-zoom-in overflow-hidden rounded-xl group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={e => {
                const rect = imgWrapRef.current?.getBoundingClientRect();
                if (!rect) return;
                setLensPos({
                  x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
                  y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
                });
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <img src={images[imgIdx]||PLACEHOLDER} alt={product.name}
                onError={e=>{e.currentTarget.src=PLACEHOLDER;}}
                className="max-w-full max-h-[240px] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.15)] select-none"
                draggable={false}/>

              {/* Lupa de zoom en hover */}
              {isHovering && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${images[imgIdx]||PLACEHOLDER})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "220%",
                    backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                  }}/>
              )}

              {/* Indicador de zoom */}
              <div className="absolute bottom-2 right-2 z-[2] flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur border border-neutral-200/70 text-[9px] font-bold text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={10}/> Clic para ampliar
              </div>

              {images.length > 1 && (
                <>
                  <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i-1+images.length)%images.length);}}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center cursor-pointer z-[2]">
                    <ChevronLeft size={15}/>
                  </button>
                  <button onClick={e=>{e.stopPropagation();setImgIdx(i=>(i+1)%images.length);}}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center cursor-pointer z-[2]">
                    <ChevronRight size={15}/>
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 justify-center flex-wrap">
                {images.map((src,i) => (
                  <button key={i} onClick={()=>setImgIdx(i)}
                    className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer p-0 transition-all"
                    style={{border:`2px solid ${i===imgIdx?"#111":"rgba(220,220,220,0.7)"}`,background:"#fff"}}>
                    <img src={src||PLACEHOLDER} alt="" onError={e=>{e.currentTarget.src=PLACEHOLDER;}} className="w-full h-full object-contain"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-[260px] p-6 md:p-8 flex flex-col gap-3 overflow-y-auto">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-[2px] uppercase mb-1">{product.category}</p>
              <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight leading-tight mb-2">{product.name}</h2>
              {product.badge && (
                <span className="text-[9px] font-black bg-black/8 text-neutral-600 px-3 py-1 rounded-md tracking-wide uppercase">{product.badge}</span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-neutral-100">
              {(["info","spec","reviews"] as const).map(t => (
                <button key={t} onClick={()=>setTab(t)}
                  className="px-3 py-2 text-[10px] font-black uppercase tracking-wide border-none cursor-pointer transition-all"
                  style={{
                    color: tab===t?"#111":"#aaa",
                    borderBottom: tab===t?"2px solid #111":"2px solid transparent",
                    background:"transparent",
                  }}>
                  {t==="info"?"Info":t==="spec"?"Ficha Técnica":`Reseñas${approved.length>0?` (${approved.length})`:""}`}
                </button>
              ))}
            </div>

            {/* Tab: Info */}
            {tab === "info" && (
              <>
                <p className="text-sm text-neutral-500 leading-7">{product.desc}</p>
                {approved.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Stars rating={avgRating} size={13}/>
                    <span className="text-xs text-neutral-400 font-semibold">{avgRating.toFixed(1)} · {approved.length} reseña{approved.length!==1?"s":""}</span>
                  </div>
                )}
                <div className="neumorph p-4 rounded-2xl">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-black text-black">{fmt$(product.price)}</span>
                    <span className="text-sm text-neutral-400">{fmtBs(product.price, rate)}</span>
                  </div>
                  {product.stock <= 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle size={10}/> Agotado
                    </p>
                  )}
                </div>
                <button onClick={onAdd}
                  className="flex items-center justify-center gap-1.5 py-3.5 text-[11px] font-black tracking-[1.2px] uppercase rounded-xl transition-all cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
                  style={{background:"rgba(17,17,17,0.90)",color:"#fff",border:"none"}}>
                  {inCart>0 ? <><Check size={14}/>EN CARRITO ({inCart})</> : <><ShoppingCart size={14}/>AGREGAR AL CARRITO</>}
                </button>
                <div className="flex gap-6">
                  {[{icon:<Shield size={13}/>,text:"Garantía"},{icon:<Truck size={13}/>,text:"Envío a domicilio"}].map(({icon,text}) => (
                    <div key={text} className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold">{icon}{text}</div>
                  ))}
                </div>
              </>
            )}

            {/* Tab: Ficha Técnica */}
            {tab === "spec" && (
              <div className="flex flex-col gap-3">
                {product.specSheet ? (
                  <img src={product.specSheet} alt="Ficha técnica" className="w-full rounded-xl border border-neutral-200/60 object-contain"/>
                ) : (
                  <div className="text-center py-10 text-neutral-300">
                    <AlertCircle size={32} className="mx-auto mb-3"/>
                    <p className="text-sm text-neutral-400">Ficha técnica no disponible aún</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reseñas */}
            {tab === "reviews" && (
              <div className="flex flex-col gap-3">
                {approved.length === 0 ? (
                  <div className="text-center py-10 text-neutral-300">
                    <MessageSquare size={32} className="mx-auto mb-3"/>
                    <p className="text-sm text-neutral-400">Aún no hay reseñas para este producto</p>
                    <p className="text-xs text-neutral-300 mt-1">¡Sé el primero en opinar!</p>
                  </div>
                ) : (
                  approved.map(r => (
                    <div key={r.id} className="glass-card rounded-xl p-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-black">{r.author}</span>
                        <span className="text-[9px] text-neutral-400">{new Date(r.date).toLocaleDateString("es-VE")}</span>
                      </div>
                      <Stars rating={r.rating} size={11}/>
                      <p className="text-xs text-neutral-500 leading-relaxed">{r.comment}</p>
                      {r.serviceRating && (
                        <p className="text-[9px] text-neutral-400 flex items-center gap-1">
                          Servicio: <Stars rating={r.serviceRating} size={9}/>
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox de pantalla completa */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-white/95 backdrop-blur-sm p-6 cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/85 backdrop-blur border border-neutral-200/80 flex items-center justify-center cursor-pointer">
            <X size={20}/>
          </button>
          <img src={images[imgIdx]||PLACEHOLDER} alt={product.name}
            className="max-w-full max-h-full object-contain select-none" draggable={false}
            onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
}
