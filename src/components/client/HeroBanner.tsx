"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slide = banners[idx] ?? banners[0];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  const title = (slide.title || "").replace(/\\n/g, "\n").replace(/\\\\n/g, "\n");
  const showTag      = slide.showTag      !== false;
  const showTitle    = slide.showTitle    !== false;
  const showSubtitle = slide.showSubtitle !== false;
  const showCta      = slide.showCta      !== false;
  const titleSize    = slide.titleSize    ?? 64;
  const subtitleSize = slide.subtitleSize ?? 14;
  const btnSize      = slide.btnSize      ?? 11;
  const btnPaddingX  = slide.btnPaddingX  ?? 24;
  const btnPaddingY  = slide.btnPaddingY  ?? 12;
  const btnRadius    = slide.btnRadius    ?? 10;

  const handleCta = () => {
    if (slide.ctaUrl) {
      if (slide.ctaUrl.startsWith("#")) {
        document.getElementById(slide.ctaUrl.slice(1))?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.open(slide.ctaUrl, "_blank");
      }
    } else {
      document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden"
      style={{
        /* Móvil: altura fija compacta; tablet+: más alta */
        minHeight: "clamp(200px, 45vw, 500px)",
      }}>

      {/* Fondo color */}
      <div className="absolute inset-0 z-[0] transition-colors duration-700"
        style={{ background: slide.bgColor }}/>

      {/* Imagen full-cover */}
      {slide.img && (
        <div key={`bg-${idx}`} className="absolute inset-0 z-[1]"
          style={{
            backgroundImage:    `url(${slide.img})`,
            backgroundSize:     "cover",
            backgroundPosition: "center",
            backgroundRepeat:   "no-repeat",
          }}/>
      )}

      {/* Overlay degradado */}
      <div className="absolute inset-0 z-[2]"
        style={{
          background: slide.img
            ? `linear-gradient(90deg, ${slide.bgColor}f0 0%, ${slide.bgColor}cc 40%, ${slide.bgColor}55 70%, ${slide.bgColor}11 100%)`
            : slide.bgColor,
        }}/>

      {/* Barra acento */}
      <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 z-[3]"
        style={{ background: slide.accentColor }}/>

      {/* Contenido */}
      <div className="relative z-[3] max-w-[1280px] mx-auto flex items-center"
        style={{
          minHeight: "clamp(200px, 45vw, 500px)",
          padding: "clamp(20px, 4vw, 48px) clamp(20px, 4vw, 40px)",
        }}>

        <div key={`txt-${idx}`} style={{ maxWidth: "min(520px, 90%)" }}>

          {/* Tag */}
          {showTag && slide.tag && (
            <div className="inline-flex items-center gap-1.5 text-white font-black mb-3"
              style={{
                background:    slide.accentColor,
                fontSize:      "clamp(7px, 1.5vw, 9px)",
                letterSpacing: "2.5px",
                padding:       "4px 10px",
              }}>
              <Sparkles size={8}/>{slide.tag}
            </div>
          )}

          {/* Título */}
          {showTitle && (
            <h1 className="font-black uppercase whitespace-pre-line"
              style={{
                fontSize:      `clamp(24px, ${titleSize * 0.06}vw + 16px, ${titleSize}px)`,
                lineHeight:    0.88,
                letterSpacing: "-1px",
                color:         slide.textColor,
                margin:        "0 0 clamp(6px,1.5vw,16px) 0",
              }}>
              {title}
            </h1>
          )}

          {/* Subtítulo */}
          {showSubtitle && slide.subtitle && (
            <p style={{
              fontSize:  `clamp(11px, ${subtitleSize * 0.04}vw + 8px, ${subtitleSize}px)`,
              color:     slide.textColor + "aa",
              lineHeight: 1.5,
              margin:    "0 0 clamp(12px,2.5vw,28px) 0",
              maxWidth:  340,
            }}>
              {slide.subtitle}
            </p>
          )}

          {/* Botones */}
          {showCta && (
            <div className="flex gap-2 flex-wrap"
              style={{ marginBottom: "clamp(8px,2vw,24px)" }}>
              <button onClick={handleCta}
                className="flex items-center gap-2 font-black uppercase border border-white/10 transition-all"
                style={{
                  fontSize:      `clamp(8px, ${btnSize * 0.04}vw + 6px, ${btnSize}px)`,
                  letterSpacing: "1.2px",
                  padding:       `${Math.round(btnPaddingY * 0.75)}px ${Math.round(btnPaddingX * 0.75)}px`,
                  borderRadius:  btnRadius,
                  background:    slide.btnColor,
                  color:         slide.btnTextColor,
                  backdropFilter:"blur(8px)",
                  boxShadow:     `0 4px 16px ${slide.btnColor}55`,
                }}>
                {slide.cta} <ArrowRight size={11}/>
              </button>
              <button
                onClick={() => document.getElementById("tienda")?.scrollIntoView({ behavior:"smooth" })}
                className="glass-card font-bold uppercase cursor-pointer"
                style={{
                  fontSize:      `clamp(8px, ${btnSize * 0.04}vw + 6px, ${btnSize}px)`,
                  letterSpacing: "1px",
                  padding:       `${Math.round(btnPaddingY * 0.75)}px ${Math.round(btnPaddingX * 0.6)}px`,
                  borderRadius:  btnRadius,
                  color:         slide.textColor,
                  border:        "1px solid rgba(255,255,255,0.5)",
                }}>
                VER CATÁLOGO
              </button>
            </div>
          )}

          {/* Trust badges — solo desktop */}
          <div className="hidden md:flex gap-3 flex-wrap">
            {[
              { icon:<Shield size={10}/>,    text:"Certificado"  },
              { icon:<Truck size={10}/>,     text:"Envío rápido" },
              { icon:<RotateCcw size={10}/>, text:"Garantía"     },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 font-semibold rounded-full"
                style={{
                  fontSize:       10,
                  padding:        "5px 12px",
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
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[4]">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
            style={{ width:i===idx?20:6, height:6, background:i===idx?"#fff":"rgba(255,255,255,0.4)" }}/>
        ))}
      </div>

      {/* Flechas — solo desktop */}
      {[
        { dir:"left",  fn:()=>setIdx(i=>(i-1+banners.length)%banners.length), icon:<ChevronLeft size={16}/> },
        { dir:"right", fn:()=>setIdx(i=>(i+1)%banners.length),                icon:<ChevronRight size={16}/> },
      ].map(({ dir, fn, icon }) => (
        <button key={dir} onClick={fn}
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
