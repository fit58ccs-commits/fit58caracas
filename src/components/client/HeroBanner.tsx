"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slide = banners[idx] ?? banners[0];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  const title        = (slide.title || "").replace(/\\n/g, "\n");
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

  // Posición del contenido: por defecto izquierda-centro
  const posX = (slide as Banner & { contentX?: string }).contentX ?? "left";
  const posY = (slide as Banner & { contentY?: string }).contentY ?? "center";

  const alignMap: Record<string, string> = {
    left: "flex-start", center: "center", right: "flex-end"
  };
  const justifyMap: Record<string, string> = {
    top: "flex-start", center: "center", bottom: "flex-end"
  };

  const handleCta = () => {
    const url = (slide as Banner & { ctaUrl?: string }).ctaUrl;
    if (url) {
      if (url.startsWith("#")) {
        document.getElementById(url.slice(1))?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.open(url, "_blank");
      }
    } else {
      document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden"
      style={{ minHeight: "clamp(200px, 44vw, 500px)" }}>

      {/* Fondo color */}
      <div className="absolute inset-0 z-[0]" style={{ background: slide.bgColor }}/>

      {/* Imagen full-cover */}
      {slide.img && (
        <div key={`bg-${idx}-${slide.img}`} className="absolute inset-0 z-[1]"
          style={{
            backgroundImage:    `url(${slide.img})`,
            backgroundSize:     "cover",
            backgroundPosition: "center",
            backgroundRepeat:   "no-repeat",
          }}/>
      )}

      {/* Overlay degradado — solo si hay imagen */}
      {slide.img && (
        <div className="absolute inset-0 z-[2]"
          style={{
            background: posX === "right"
              ? `linear-gradient(270deg, ${slide.bgColor}f0 0%, ${slide.bgColor}bb 40%, ${slide.bgColor}44 70%, transparent 100%)`
              : `linear-gradient(90deg, ${slide.bgColor}f0 0%, ${slide.bgColor}bb 40%, ${slide.bgColor}44 70%, transparent 100%)`,
          }}/>
      )}

      {/* Barra acento izquierda */}
      <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 z-[3]"
        style={{ background: slide.accentColor }}/>

      {/* Contenido — posicionable */}
      <div className="absolute inset-0 z-[3] flex"
        style={{
          alignItems:     justifyMap[posY] || "center",
          justifyContent: alignMap[posX]  || "flex-start",
          padding:        "clamp(20px, 4vw, 56px) clamp(24px, 5vw, 72px)",
        }}>

        <div key={`txt-${idx}`}
          style={{
            maxWidth:  "min(520px, 88%)",
            textAlign: posX === "center" ? "center" : "left",
          }}>

          {/* Tag */}
          {showTag && slide.tag && (
            <div className="inline-flex items-center gap-1.5 text-white font-black mb-3"
              style={{
                background:    slide.accentColor,
                fontSize:      "clamp(7px, 1.4vw, 9px)",
                letterSpacing: "2.5px",
                padding:       "4px 10px",
              }}>
              <Sparkles size={8}/>{slide.tag}
            </div>
          )}

          {/* Título */}
          {showTitle && title && (
            <h1 className="font-black uppercase whitespace-pre-line"
              style={{
                fontSize:      `clamp(22px, ${titleSize * 0.055}vw + 14px, ${titleSize}px)`,
                lineHeight:    0.9,
                letterSpacing: "-1px",
                color:         slide.textColor,
                margin:        "0 0 clamp(6px, 1.5vw, 14px)",
              }}>
              {title}
            </h1>
          )}

          {/* Subtítulo */}
          {showSubtitle && slide.subtitle && (
            <p style={{
              fontSize:   `clamp(10px, ${subtitleSize * 0.038}vw + 8px, ${subtitleSize}px)`,
              color:      slide.textColor + "aa",
              lineHeight: 1.5,
              margin:     "0 0 clamp(10px, 2.5vw, 24px)",
              maxWidth:   posX === "center" ? "100%" : 360,
            }}>
              {slide.subtitle}
            </p>
          )}

          {/* Botones CTA */}
          {showCta && (
            <div className="flex gap-2 flex-wrap"
              style={{ justifyContent: posX === "center" ? "center" : "flex-start" }}>
              <button onClick={handleCta}
                className="flex items-center gap-2 font-black uppercase border border-white/10 transition-all"
                style={{
                  fontSize:      `clamp(8px, ${btnSize * 0.035}vw + 7px, ${btnSize}px)`,
                  letterSpacing: "1.2px",
                  padding:       `${Math.round(btnPaddingY * 0.8)}px ${Math.round(btnPaddingX * 0.8)}px`,
                  borderRadius:  btnRadius,
                  background:    slide.btnColor,
                  color:         slide.btnTextColor,
                  backdropFilter:"blur(8px)",
                  boxShadow:     `0 4px 16px ${slide.btnColor}55`,
                }}>
                {slide.cta} <ArrowRight size={11}/>
              </button>

            </div>
          )}
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

      {/* Flechas desktop */}
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
