"use client";
import { useState } from "react";
import { Heart, Star, AlertCircle, ShoppingCart, Check, ChevronLeft, ChevronRight, X, Shield, Truck } from "lucide-react";
import { fmt$, fmtBs } from "@/lib/store";
import type { Product } from "@/lib/types";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ddd' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='m21 15-5-5L5 21'/%3E%3C/svg%3E";

/* ── ProductCard ────────────────────────────────────────────────── */
export function ProductCard({
  product, rate, onAdd, inCart, wishlisted, onWishlist, onDetail,
}: {
  product: Product; rate: number;
  onAdd: () => void; inCart: number;
  wishlisted: boolean; onWishlist: () => void;
  onDetail: () => void;
}) {
  const [imgIdx,   setImgIdx]   = useState(0);
  const [heartKey, setHeartKey] = useState(0);
  const [addKey,   setAddKey]   = useState(0);
  const images = product.images?.length ? product.images : [product.img].filter(Boolean);
  const lowStock = product.stock > 0 && product.stock <= 8;

  const badgeColor = (b: string) => ({
    "BAJO STOCK":  "bg-red-500/88",
    "BESTSELLER":  "bg-black/85",
    "NUEVO":       "bg-blue-600/88",
    "PREMIUM":     "bg-purple-600/85",
    "EDICIÓN LTD": "bg-neutral-700/85",
  }[b] ?? "bg-neutral-700/85");

  return (
    <div className="prod-card glass-card rounded-2xl flex flex-col relative overflow-hidden">
      {/* Badge */}
      {product.badge && (
        <div className={`${badgeColor(product.badge)} animate-badge-pulse absolute top-3.5 left-3.5 z-[3] text-white text-[8px] font-black tracking-[1.5px] uppercase px-2.5 py-1 rounded-md backdrop-blur-sm`}>
          {product.badge}
        </div>
      )}

      {/* Wishlist */}
      <button
        key={heartKey}
        onClick={e => { e.stopPropagation(); setHeartKey(k => k + 1); onWishlist(); }}
        className={`${heartKey > 0 ? "animate-heart-pop" : ""} absolute top-3 right-3 z-[3] w-8 h-8 rounded-full bg-white/82 backdrop-blur-xl border border-white/70 flex items-center justify-center cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.10)]`}>
        <Heart size={14} color={wishlisted ? "#e53e3e" : "#bbb"} fill={wishlisted ? "#e53e3e" : "none"} />
      </button>

      {/* Image slider */}
      <div
        className="neumorph-inset bg-[#f0f2f5] flex items-center justify-center h-[222px] overflow-hidden relative cursor-pointer"
        onClick={onDetail}>
        <img
          src={images[imgIdx] || PLACEHOLDER} alt={product.name}
          onError={e => { e.currentTarget.src = PLACEHOLDER; }}
          className="w-40 h-40 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-opacity duration-300"
        />
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/85 border border-neutral-200/70 flex items-center justify-center cursor-pointer z-[2]">
              <ChevronLeft size={13} />
            </button>
            <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/85 border border-neutral-200/70 flex items-center justify-center cursor-pointer z-[2]">
              <ChevronRight size={13} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-[2]">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                  className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
                  style={{ width: i === imgIdx ? 18 : 6, height: 6, background: i === imgIdx ? "#111" : "rgba(0,0,0,0.3)" }} />
              ))}
            </div>
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-black/45 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-[2]">
              {imgIdx + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 bg-white/55">
        <p className="text-[10px] font-bold text-neutral-400 tracking-[1.5px] uppercase m-0">{product.category}</p>
        <h3 className="text-[13px] font-black text-black uppercase tracking-wide m-0 leading-snug cursor-pointer" onClick={onDetail}>
          {product.name}
        </h3>
        <p className="text-[11px] text-neutral-400 leading-relaxed min-h-[34px]">{product.desc}</p>

        <div className="flex gap-0.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} color="#f59e0b" fill={i < 4 ? "#f59e0b" : "none"} />
          ))}
          <span className="text-[10px] text-neutral-400 ml-1 font-semibold">4.8</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-xl font-black text-black">{fmt$(product.price)}</span>
          <span className="text-[11px] text-neutral-400">{fmtBs(product.price, rate)}</span>
        </div>

        {lowStock && (
          <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 mb-1">
            <AlertCircle size={10} /> Solo {product.stock} disponibles
          </p>
        )}

        <button
          key={addKey}
          onClick={() => { setAddKey(k => k + 1); onAdd(); }}
          className={`${addKey > 0 ? "animate-cart-pop" : ""} mt-auto flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black tracking-[1.2px] uppercase rounded-lg transition-all duration-200 border cursor-pointer`}
          style={{
            border: `1.5px solid ${inCart > 0 ? "rgba(17,17,17,0.85)" : "rgba(200,200,200,0.7)"}`,
            background: inCart > 0 ? "rgba(17,17,17,0.88)" : "rgba(255,255,255,0.72)",
            color: inCart > 0 ? "#fff" : "#111",
            backdropFilter: "blur(8px)",
            boxShadow: inCart > 0 ? "0 4px 16px rgba(0,0,0,0.22)" : "none",
          }}>
          {inCart > 0
            ? <><Check size={12} />EN CARRITO ({inCart})</>
            : <><ShoppingCart size={12} />AGREGAR</>
          }
        </button>
      </div>
    </div>
  );
}

/* ── ProductDetailModal ─────────────────────────────────────────── */
export function ProductDetailModal({
  product, rate, onAdd, inCart, onClose,
}: {
  product: Product; rate: number;
  onAdd: () => void; inCart: number;
  onClose: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images?.length ? product.images : [product.img].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[300] flex">
      <div className="animate-overlay-in absolute inset-0 bg-black/55 backdrop-blur-xl" onClick={onClose} />
      <div className="glass animate-drawer-in relative m-auto rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.30)] flex flex-col max-h-[90vh]" style={{ width: "min(900px,96vw)" }}>

        <button onClick={onClose}
          className="fluent-hover absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/82 backdrop-blur-xl border border-white/70 flex items-center justify-center cursor-pointer">
          <X size={16} />
        </button>

        <div className="flex flex-wrap overflow-auto">
          {/* Gallery */}
          <div className="flex-none w-full md:w-[420px] bg-[#f0f2f5] flex flex-col items-center justify-center p-8 gap-4 min-h-[380px]">
            <div className="relative w-full flex items-center justify-center min-h-[300px]">
              <img
                src={images[imgIdx] || PLACEHOLDER} alt={product.name}
                onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                className="max-w-full max-h-[300px] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.15)] transition-opacity duration-200"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center cursor-pointer z-[2]">
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center cursor-pointer z-[2]">
                    <ChevronRight size={15} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 justify-center">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer p-0 transition-all duration-200"
                    style={{ border: `2px solid ${i === imgIdx ? "#111" : "rgba(220,220,220,0.7)"}`, background: "#fff" }}>
                    <img src={src || PLACEHOLDER} alt="" onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                      className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-1.5">
              {images.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all duration-200"
                  style={{ width: i === imgIdx ? 20 : 6, background: i === imgIdx ? "#111" : "rgba(0,0,0,0.2)" }} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-[260px] p-9 flex flex-col gap-3.5 overflow-y-auto">
            <div>
              <p className="text-[10px] font-bold text-neutral-400 tracking-[2px] uppercase mb-1.5">{product.category}</p>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight leading-tight mb-2">{product.name}</h2>
              {product.badge && (
                <span className="text-[9px] font-black bg-black/8 text-neutral-600 px-3 py-1 rounded-md tracking-wide uppercase">
                  {product.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 leading-7">{product.desc}</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} color="#f59e0b" fill={i < 4 ? "#f59e0b" : "none"} />
              ))}
              <span className="text-[11px] text-neutral-400 ml-1.5 font-semibold">4.8 · 124 reseñas</span>
            </div>
            <div className="neumorph p-5 rounded-2xl">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-black">{fmt$(product.price)}</span>
                <span className="text-sm text-neutral-400">{fmtBs(product.price, rate)}</span>
              </div>
              {product.stock <= 8 && product.stock > 0 && (
                <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle size={10} /> Solo {product.stock} unidades disponibles
                </p>
              )}
            </div>
            <button onClick={onAdd}
              className="flex items-center justify-center gap-1.5 py-3.5 text-[11px] font-black tracking-[1.2px] uppercase rounded-xl transition-all duration-200 cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.22)]"
              style={{ background: "rgba(17,17,17,0.90)", color: "#fff", border: "none" }}>
              {inCart > 0 ? <><Check size={14} />EN CARRITO ({inCart})</> : <><ShoppingCart size={14} />AGREGAR AL CARRITO</>}
            </button>
            <div className="flex gap-6 mt-1">
              {[{ icon: <Shield size={13} />, text: "Garantía" }, { icon: <Truck size={13} />, text: "Envío a domicilio" }].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-semibold">{icon}{text}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
