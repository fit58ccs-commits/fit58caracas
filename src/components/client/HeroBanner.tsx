"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slide = banners[idx] ?? banners[0];
  const imgSrc = slide.imgBase64 || slide.img;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <section
      className="relative overflow-hidden transition-[background] duration-700"
      style={{ background: slide.bgColor, minHeight: "clamp(340px,52vw,520px)" }}>

      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 z-[2] transition-colors duration-700"
        style={{ background: slide.accentColor, boxShadow: `4px 0 24px ${slide.accentColor}55` }}
      />
      {/* Orb glow */}
      <div
        className="absolute -top-1/3 right-[10%] w-[480px] h-[480px] rounded-full pointer-events-none z-[1]"
        style={{ background: `radial-gradient(circle, ${slide.accentColor}22 0%, transparent 70%)` }}
      />

      <div className="max-w-[1280px] mx-auto px-7 h-full flex items-center relative z-[2] gap-6"
        style={{ minHeight: "clamp(340px,52vw,520px)" }}>

        {/* Text */}
        <div key={`txt-${idx}`} className="animate-hero-text flex-none max-w-[440px]">
          <div
            className="inline-flex items-center gap-1.5 text-white text-[9px] font-black tracking-[2.5px] px-3.5 py-1.5 mb-4"
            style={{ background: slide.accentColor }}>
            <Sparkles size={9} />{slide.tag}
          </div>
          <h1
            className="font-black uppercase leading-[0.9] mb-4 whitespace-pre-line"
            style={{
              fontSize: "clamp(40px,7vw,78px)",
              letterSpacing: "-2px",
              color: slide.textColor,
            }}>
            {slide.title}
          </h1>
          <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: slide.textColor + "99" }}>
            {slide.subtitle}
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              className="btn-primary flex items-center gap-2 px-8 py-3.5 text-[11px] font-black tracking-[1.5px] uppercase rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.22)] border border-white/10"
              style={{ background: slide.btnColor, color: slide.btnTextColor, backdropFilter: "blur(8px)" }}>
              {slide.cta} <ArrowRight size={14} />
            </button>
            <button className="glass-card text-black border-white/70 px-6 py-3.5 text-[11px] font-bold tracking-widest uppercase rounded-xl cursor-pointer">
              VER CATÁLOGO
            </button>
          </div>
          <div className="flex gap-5 mt-7 flex-wrap">
            {[
              { icon: <Shield size={11} />, text: "Certificado" },
              { icon: <Truck size={11} />,  text: "Envío rápido" },
              { icon: <RotateCcw size={11} />, text: "Garantía" },
            ].map(({ icon, text }) => (
              <div key={text} className="glass-card flex items-center gap-1.5 text-neutral-600 text-[11px] font-semibold px-3 py-1.5 rounded-full">
                {icon}{text}
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div key={`img-${idx}`} className="animate-hero-img flex-1 flex justify-center items-center">
          {imgSrc
            ? <img src={imgSrc} alt={slide.title}
                className="object-contain drop-shadow-2xl"
                style={{ width: "clamp(200px,38vw,460px)", height: "clamp(200px,38vw,460px)" }}
                onError={e => (e.currentTarget.style.opacity = "0")} />
            : <div className="w-64 h-64 opacity-10 flex items-center justify-center">
                <Shield size={120} />
              </div>
          }
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-[3]">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
            style={{ width: i === idx ? 32 : 8, height: 8, background: i === idx ? "#111" : "rgba(0,0,0,0.25)" }}
          />
        ))}
      </div>

      {/* Arrows */}
      {[
        { dir: "left",  onClick: () => setIdx(i => (i - 1 + banners.length) % banners.length), icon: <ChevronLeft size={18} /> },
        { dir: "right", onClick: () => setIdx(i => (i + 1) % banners.length),                  icon: <ChevronRight size={18} /> },
      ].map(({ dir, onClick, icon }) => (
        <button
          key={dir}
          onClick={onClick}
          className="glass-card fluent-hover absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center z-[3] border-white/65"
          style={{ [dir]: 20 }}>
          {icon}
        </button>
      ))}
    </section>
  );
}
