"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slide  = banners[idx] ?? banners[0];
  const imgSrc = slide.imgBase64 || slide.img;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <section
      className="relative overflow-hidden transition-[background] duration-700"
      style={{ minHeight: "clamp(400px,55vw,560px)" }}>

      {/* ── Imagen de fondo full-cover ── */}
      {imgSrc && (
        <div
          key={`bg-${idx}`}
          className="absolute inset-0 z-[0] animate-hero-img"
          style={{
            backgroundImage:    `url(${imgSrc})`,
            backgroundSize:     "cover",
            backgroundPosition: "center",
            backgroundRepeat:   "no-repeat",
          }}
        />
      )}

      {/* Overlay degradado sobre la imagen para legibilidad del texto */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: imgSrc
            ? `linear-gradient(90deg, ${slide.bgColor}f0 0%, ${slide.bgColor}cc 40%, ${slide.bgColor}44 70%, transparent 100%)`
            : slide.bgColor,
        }}
      />

      {/* Barra de acento izquierda */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 z-[2] transition-colors duration-700"
        style={{ background: slide.accentColor, boxShadow: `4px 0 24px ${slide.accentColor}55` }}
      />

      {/* Orb decorativo */}
      <div
        className="absolute -top-1/3 right-[5%] w-[480px] h-[480px] rounded-full pointer-events-none z-[1]"
        style={{ background: `radial-gradient(circle, ${slide.accentColor}18 0%, transparent 70%)` }}
      />

      {/* Contenido */}
      <div
        className="relative z-[2] max-w-[1280px] mx-auto px-7 h-full flex items-center"
        style={{ minHeight: "clamp(400px,55vw,560px)" }}>

        <div key={`txt-${idx}`} className="animate-hero-text max-w-[520px]">
          {/* Tag */}
          <div
            className="inline-flex items-center gap-1.5 text-white text-[9px] font-black tracking-[2.5px] px-3.5 py-1.5 mb-5"
            style={{ background: slide.accentColor }}>
            <Sparkles size={9} />{slide.tag}
          </div>

          {/* Título */}
          <h1
            className="font-black uppercase leading-[0.88] mb-5 whitespace-pre-line"
            style={{
              fontSize:      "clamp(44px,7vw,82px)",
              letterSpacing: "-2px",
              color:         slide.textColor,
              textShadow:    imgSrc ? "0 2px 20px rgba(0,0,0,0.15)" : "none",
            }}>
            {slide.title}
          </h1>

          {/* Subtítulo */}
          <p
            className="text-sm leading-relaxed mb-8 max-w-sm"
            style={{ color: slide.textColor + "bb" }}>
            {slide.subtitle}
          </p>

          {/* Botones */}
          <div className="flex gap-3 flex-wrap mb-8">
            <button
              className="btn-primary flex items-center gap-2 px-8 py-3.5 text-[11px] font-black tracking-[1.5px] uppercase rounded-xl border border-white/10"
              style={{
                background:    slide.btnColor,
                color:         slide.btnTextColor,
                backdropFilter:"blur(8px)",
                boxShadow:     `0 6px 24px ${slide.btnColor}66`,
              }}>
              {slide.cta} <ArrowRight size={14} />
            </button>
            <button
              className="glass-card px-6 py-3.5 text-[11px] font-bold tracking-widest uppercase rounded-xl cursor-pointer border-white/50"
              style={{ color: slide.textColor }}>
              VER CATÁLOGO
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 flex-wrap">
            {[
              { icon: <Shield size={11} />,    text: "Certificado" },
              { icon: <Truck size={11} />,     text: "Envío rápido" },
              { icon: <RotateCcw size={11} />, text: "Garantía" },
            ].map(({ icon, text }) => (
              <div key={text}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  color: slide.textColor,
                }}>
                {icon}{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
            style={{ width: i === idx ? 32 : 8, height: 8, background: i === idx ? "#fff" : "rgba(255,255,255,0.45)" }}
          />
        ))}
      </div>

      {/* Flechas */}
      {[
        { dir: "left",  onClick: () => setIdx(i => (i - 1 + banners.length) % banners.length), icon: <ChevronLeft size={18} /> },
        { dir: "right", onClick: () => setIdx(i => (i + 1) % banners.length),                  icon: <ChevronRight size={18} /> },
      ].map(({ dir, onClick, icon }) => (
        <button
          key={dir}
          onClick={onClick}
          className="absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center z-[3] cursor-pointer border-none transition-all duration-200"
          style={{
            [dir]: 20,
            background:    "rgba(255,255,255,0.75)",
            backdropFilter:"blur(8px)",
            boxShadow:     "0 4px 16px rgba(0,0,0,0.12)",
          }}>
          {icon}
        </button>
      ))}
    </section>
  );
}
