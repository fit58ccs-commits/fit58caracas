"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slide  = banners[idx] ?? banners[0];
  const imgSrc = slide.img || "";

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "clamp(280px,50vw,520px)" }}>

      {/* Fondo de color base */}
      <div className="absolute inset-0 z-[0] transition-colors duration-700"
        style={{ background: slide.bgColor }}/>

      {/* Imagen full-cover */}
      {imgSrc && (
        <div key={`bg-${idx}`} className="absolute inset-0 z-[1]"
          style={{
            backgroundImage:    `url(${imgSrc})`,
            backgroundSize:     "cover",
            backgroundPosition: "center top",
            backgroundRepeat:   "no-repeat",
          }}/>
      )}

      {/* Overlay — más opaco en móvil para legibilidad */}
      <div className="absolute inset-0 z-[2]"
        style={{
          background: imgSrc
            ? `linear-gradient(90deg, ${slide.bgColor}ee 0%, ${slide.bgColor}cc 45%, ${slide.bgColor}66 70%, ${slide.bgColor}11 100%)`
            : slide.bgColor,
        }}/>

      {/* Barra acento */}
      <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 z-[3]"
        style={{ background: slide.accentColor, boxShadow: `4px 0 20px ${slide.accentColor}44` }}/>

      {/* Contenido */}
      <div className="relative z-[3] max-w-[1280px] mx-auto px-5 md:px-7 flex items-center"
        style={{ minHeight: "clamp(280px,50vw,520px)" }}>

        <div key={`txt-${idx}`} className="w-full md:max-w-[520px]" style={{ paddingTop:32, paddingBottom:48 }}>

          {/* Tag */}
          <div className="inline-flex items-center gap-1.5 text-white font-black tracking-[2px] px-3 py-1 mb-4 text-[8px] md:text-[9px]"
            style={{ background: slide.accentColor }}>
            <Sparkles size={8}/>{slide.tag}
          </div>

          {/* Título */}
          <h1 className="font-black uppercase whitespace-pre-line mb-3 md:mb-5"
            style={{
              fontSize:      `clamp(28px, ${slide.titleSize ?? 72}px, ${slide.titleSize ?? 72}px)`,
              lineHeight:    0.9,
              letterSpacing: "-1.5px",
              color:         slide.textColor,
            }}>
            {(slide.title || "")}
          </h1>

          {/* Subtítulo */}
          <p className="leading-relaxed mb-5 md:mb-8 max-w-xs md:max-w-sm"
            style={{ fontSize: slide.subtitleSize ?? 14, color: slide.textColor + "aa" }}>
            {slide.subtitle}
          </p>

          {/* Botones */}
          <div className="flex gap-2 md:gap-3 flex-wrap mb-5 md:mb-8">
            <button
              className="flex items-center gap-2 font-black uppercase border border-white/10 transition-all"
              style={{
                fontSize:      slide.btnSize ?? 11,
                letterSpacing: "1.5px",
                padding:       `${slide.btnPaddingY ?? 12}px ${slide.btnPaddingX ?? 28}px`,
                borderRadius:  slide.btnRadius ?? 10,
                background:    slide.btnColor,
                color:         slide.btnTextColor,
                backdropFilter:"blur(8px)",
                boxShadow:     `0 4px 20px ${slide.btnColor}55`,
              }}>
              {slide.cta} <ArrowRight size={13}/>
            </button>
            <button
              className="glass-card font-bold uppercase cursor-pointer"
              style={{
                fontSize:      slide.btnSize ?? 11,
                letterSpacing: "1px",
                padding:       `${slide.btnPaddingY ?? 12}px ${Math.round((slide.btnPaddingX ?? 28) * 0.7)}px`,
                borderRadius:  slide.btnRadius ?? 10,
                color:         slide.textColor,
                border:        "1px solid rgba(255,255,255,0.5)",
              }}>
              VER CATÁLOGO
            </button>
          </div>

          {/* Trust badges — solo desktop */}
          <div className="hidden md:flex gap-4 flex-wrap">
            {[
              { icon:<Shield size={11}/>,    text:"Certificado"  },
              { icon:<Truck size={11}/>,     text:"Envío rápido" },
              { icon:<RotateCcw size={11}/>, text:"Garantía"     },
            ].map(({ icon, text }) => (
              <div key={text}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background:     "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(8px)",
                  border:         "1px solid rgba(255,255,255,0.5)",
                  color:          slide.textColor,
                }}>
                {icon}{text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-[4]">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
            style={{ width: i===idx ? 24 : 6, height: 6, background: i===idx ? "#fff" : "rgba(255,255,255,0.4)" }}/>
        ))}
      </div>

      {/* Flechas — solo desktop */}
      {[
        { dir:"left",  onClick:()=>setIdx(i=>(i-1+banners.length)%banners.length), icon:<ChevronLeft size={16}/> },
        { dir:"right", onClick:()=>setIdx(i=>(i+1)%banners.length),                icon:<ChevronRight size={16}/> },
      ].map(({ dir, onClick, icon }) => (
        <button key={dir} onClick={onClick}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-[4] cursor-pointer border-none transition-all"
          style={{
            [dir]:         16,
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
