"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import type { Banner, Product } from "@/lib/types";

interface Props { banners: Banner[]; products?: Product[]; }

const LERP = (a: number, b: number, t: number) => a + (b - a) * t;

export function HeroBanner({ banners, products = [] }: Props) {
  const [idx, setIdx]      = useState(0);
  const [isMob, setMob]    = useState(false);
  const angleRef           = useRef(0);
  const targetRef          = useRef(0);
  const rafRef             = useRef<number>();
  const cardsRef           = useRef<HTMLDivElement[]>([]);
  const slide              = banners[idx] ?? banners[0];

  /* Detectar mobile */
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Auto-slide del banner */
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  /* Imágenes: heroImages del banner o fallback a productos */
  const heroImgs: string[] = ((slide as any).heroImages ?? []).filter(Boolean);
  const fallback = products
    .filter(p => p.images?.[0] || p.img)
    .map(p => p.images?.[0] || p.img)
    .filter(Boolean) as string[];
  const imgs = heroImgs.length > 0 ? heroImgs : fallback.slice(0, 6);

  const N     = imgs.length || 1;
  const STEP  = 360 / N;
  const R     = isMob ? 140 : 210; // radio del círculo
  const S_MIN = isMob ? 0.55 : 0.68;
  const S_MAX = isMob ? 1.00 : 1.30;
  const SPEED = 0.38;

  /* Loop de animación del carrusel */
  const animate = useCallback(() => {
    targetRef.current -= SPEED; // gira izquierda

    angleRef.current = LERP(angleRef.current, targetRef.current, 0.065);
    const angle = angleRef.current;

    cardsRef.current.forEach((c, i) => {
      if (!c) return;
      const base = i * STEP;
      const eff  = ((angle + base) % 360 + 360) % 360;
      const rad  = eff * Math.PI / 180;
      const cos  = Math.cos(rad);
      const sin  = Math.sin(rad);

      const tx   = sin * R;
      const tz   = cos * R;
      const t    = Math.max(0, (cos + 1) / 2);
      const ts   = t * t * (3 - 2 * t);      // suavizado cúbico
      const scale= S_MIN + (S_MAX - S_MIN) * ts;
      const opacity = Math.pow(Math.max(0, t), 1.6);
      const blur  = Math.max(0, (1 - t) * 7);
      const shY   = Math.round(4 + ts * 20);
      const shB   = Math.round(8 + ts * 44);
      const shA   = (0.04 + ts * 0.22).toFixed(2);

      c.style.transform  = `translateX(${tx.toFixed(1)}px) translateZ(${tz.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      c.style.opacity    = opacity.toFixed(3);
      c.style.filter     = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : "";
      c.style.boxShadow  = `0 ${shY}px ${shB}px rgba(0,0,0,${shA})`;
      c.style.zIndex     = String(Math.round(tz + 300));
      c.style.pointerEvents = cos > 0.5 ? "auto" : "none";
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [N, STEP, R, S_MIN, S_MAX, SPEED]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  /* Banner props */
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
  const posX         = (slide as any).contentX ?? "left";
  const posY         = (slide as any).contentY ?? "center";

  const handleCta = () => {
    const url = (slide as any).ctaUrl;
    if (url) {
      if (url.startsWith("#")) document.getElementById(url.slice(1))?.scrollIntoView({ behavior: "smooth" });
      else window.open(url, "_blank");
    } else {
      document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const cardW = isMob ? 90  : 128;
  const cardH = isMob ? 120 : 172;
  const imgH  = isMob ? 56  : 80;

  /* Modo cinematic: si hay img de fondo y NO hay heroImages → full-bleed Tannus */
  const hasBgImg    = !!slide.img;
  const hasCarousel = imgs.length > 0;
  const cinematicMode = hasBgImg && !hasCarousel;

  /* ── MODO CINEMATIC (imagen full-bleed, texto superpuesto) ── */
  if (cinematicMode) {
    return (
      <section className="relative overflow-hidden select-none"
        style={{ minHeight: isMob ? "clamp(300px,70vw,440px)" : "clamp(440px,58vw,620px)" }}>
        {/* Imagen full-bleed */}
        <img src={slide.img} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.7 }}/>
        {/* Overlay izquierda para legibilidad */}
        <div className="absolute inset-0"
          style={{ background:`linear-gradient(90deg,rgba(0,0,0,.70) 0%,rgba(0,0,0,.35) 55%,transparent 100%)` }}/>
        {/* Fade blanco en la parte inferior para transición suave a la página */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background:`linear-gradient(to top,#fff 0%,transparent 100%)` }}/>

        {/* Barra acento */}
        <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 z-[3]"
          style={{ background: slide.accentColor }}/>

        {/* Contenido */}
        <div className="absolute inset-0 z-[4] flex items-end md:items-center"
          style={{ padding: isMob ? "0 20px 60px" : "0 clamp(28px,5vw,72px)" }}>
          <div className="max-w-[min(560px,90%)]">
            {showTag && slide.tag && (
              <div className="inline-flex items-center gap-2 mb-4"
                style={{ background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)",
                  border:"1px solid rgba(255,255,255,.25)", color:"#fff",
                  fontSize:"clamp(7px,1.2vw,9px)", fontWeight:800, letterSpacing:"3px",
                  padding:"5px 14px", borderRadius:999, textTransform:"uppercase" }}>
                {slide.tag}
              </div>
            )}
            {showTitle && title && (
              <h1 key={`t-${idx}`}
                className="font-black uppercase whitespace-pre-line animate-hero-text"
                style={{
                  fontSize: `clamp(${isMob?32:42}px,${titleSize*0.055}vw+10px,${titleSize}px)`,
                  lineHeight: 0.86, letterSpacing: "-2px",
                  color: "#fff", margin: "0 0 clamp(10px,2vw,18px)",
                  fontFamily: "'DM Sans',sans-serif",
                  textShadow: "0 2px 40px rgba(0,0,0,.3)",
                }}>{title}</h1>
            )}
            {showSubtitle && slide.subtitle && (
              <p style={{
                fontSize: `clamp(10px,${subtitleSize*0.038}vw+8px,${subtitleSize}px)`,
                color: "rgba(255,255,255,.65)", lineHeight: 1.6,
                margin: `0 0 clamp(14px,2.5vw,28px)`, maxWidth: 400,
              }}>{slide.subtitle}</p>
            )}
            {showCta && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleCta}
                  className="font-black uppercase transition-all cursor-pointer border-none"
                  style={{
                    fontSize: `clamp(8px,${btnSize*0.035}vw+7px,${btnSize}px)`,
                    letterSpacing: "2px",
                    padding: `${Math.round(btnPaddingY*0.9)}px ${Math.round(btnPaddingX*0.9)}px`,
                    borderRadius: btnRadius,
                    background: "#fff", color: "#0d0d0d",
                    boxShadow: "0 8px 28px rgba(0,0,0,.25)",
                  }}>
                  {slide.cta} →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-[5]">
            {banners.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)}
                className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
                style={{width:i===idx?20:6,height:6,background:i===idx?"#fff":"rgba(255,255,255,0.4)"}}/>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden select-none"
      style={{ minHeight: isMob ? "clamp(280px,65vw,380px)" : "clamp(360px,54vw,580px)" }}
    >
      {/* Fondo */}
      <div className="absolute inset-0 z-0" style={{ background: slide.bgColor }}/>
      {slide.img && (
        <div className="absolute inset-0 z-[1]"
          style={{ backgroundImage:`url(${slide.img})`, backgroundSize:"cover", backgroundPosition:"center" }}/>
      )}
      {slide.img && (
        <div className="absolute inset-0 z-[2]" style={{
          background: posX === "right"
            ? `linear-gradient(270deg,${slide.bgColor}f0 0%,${slide.bgColor}bb 40%,transparent 100%)`
            : `linear-gradient(90deg,${slide.bgColor}f0 0%,${slide.bgColor}bb 40%,transparent 100%)`,
        }}/>
      )}

      {/* Barra acento */}
      <div className="absolute left-0 top-0 bottom:0 w-1 md:w-1.5 z-[3] bottom-0"
        style={{ background: slide.accentColor }}/>

      {/* Layout: texto | carrusel */}
      <div className="absolute inset-0 z-[4] flex">

        {/* Texto — izquierda */}
        <div
          className="flex flex-col justify-center"
          style={{
            width: isMob ? "55%" : "42%",
            padding: isMob
              ? "clamp(16px,5vw,28px) clamp(16px,4vw,24px) clamp(16px,5vw,28px) clamp(20px,5vw,36px)"
              : "clamp(24px,4vw,56px) clamp(24px,4vw,48px) clamp(24px,4vw,56px) clamp(28px,5vw,72px)",
          }}>

          {showTag && slide.tag && (
            <div className="inline-flex items-center gap-1.5 font-black mb-3 self-start"
              style={{ background:slide.accentColor, color:"#fff",
                fontSize:"clamp(7px,1.3vw,9px)", letterSpacing:"2.5px", padding:"4px 10px" }}>
              <Sparkles size={8}/>{slide.tag}
            </div>
          )}

          {showTitle && title && (
            <h1 key={`t-${idx}`} className="font-black uppercase whitespace-pre-line animate-hero-text"
              style={{
                fontSize:`clamp(18px,${titleSize*0.055}vw+10px,${titleSize}px)`,
                lineHeight:0.88, letterSpacing:"-1px", color:slide.textColor,
                margin:`0 0 clamp(6px,1.5vw,14px)`, fontFamily:"'DM Sans',sans-serif",
              }}>{title}</h1>
          )}

          {showSubtitle && slide.subtitle && (
            <p style={{
              fontSize:`clamp(9px,${subtitleSize*0.038}vw+7px,${subtitleSize}px)`,
              color:slide.textColor+"aa", lineHeight:1.5,
              margin:`0 0 clamp(10px,2vw,22px)`, maxWidth:360,
            }}>{slide.subtitle}</p>
          )}

          {showCta && (
            <button onClick={handleCta}
              className="flex items-center gap-2 font-black uppercase transition-all self-start"
              style={{
                fontSize:`clamp(7px,${btnSize*0.035}vw+6px,${btnSize}px)`,
                letterSpacing:"1.2px",
                padding:`${Math.round(btnPaddingY*(isMob?0.65:0.85))}px ${Math.round(btnPaddingX*(isMob?0.65:0.85))}px`,
                borderRadius:btnRadius, background:slide.btnColor, color:slide.btnTextColor,
                backdropFilter:"blur(8px)", boxShadow:`0 4px 16px ${slide.btnColor}55`,
                cursor:"pointer", border:"none",
              }}>
              {slide.cta} <ArrowRight size={isMob?9:11}/>
            </button>
          )}
        </div>

        {/* Carrusel 3D — derecha */}
        {imgs.length > 0 && (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ perspective: isMob ? 600 : 800, overflow:"hidden" }}
          >
            <div style={{
              position:"relative",
              width:1, height:1,
              transformStyle:"preserve-3d",
              transform:"rotateX(-10deg)",
            }}>
              {imgs.map((url, i) => (
                <div
                  key={i}
                  ref={el => { if (el) cardsRef.current[i] = el; }}
                  style={{
                    position:  "absolute",
                    width:     cardW,
                    height:    cardH,
                    top:       -cardH / 2,
                    left:      -cardW / 2,
                    background:"#fff",
                    borderRadius: 16,
                    padding:   "10px 8px",
                    boxSizing: "border-box",
                    border:    "1px solid rgba(0,0,0,0.055)",
                    display:   "flex",
                    flexDirection:"column",
                    alignItems:"center",
                    justifyContent:"center",
                    backfaceVisibility:"hidden",
                    willChange:"transform,opacity,filter",
                  }}
                >
                  {/* Imagen PNG */}
                  <div style={{
                    width:"100%", height:imgH,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    marginBottom:8, overflow:"hidden",
                  }}>
                    <img src={url} alt={`Producto ${i+1}`}
                      style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }}
                      draggable={false}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[6]">
          {banners.map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)}
              className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
              style={{width:i===idx?20:6,height:6,background:i===idx?"#fff":"rgba(255,255,255,0.4)"}}/>
          ))}
        </div>
      )}

      {/* Flechas solo desktop y solo si hay varios banners */}
      {banners.length > 1 && !isMob && [
        {dir:"left", fn:()=>setIdx(i=>(i-1+banners.length)%banners.length), icon:<ChevronLeft size={16}/>},
        {dir:"right",fn:()=>setIdx(i=>(i+1)%banners.length),                icon:<ChevronRight size={16}/>},
      ].map(({dir,fn,icon})=>(
        <button key={dir} onClick={fn}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center z-[6] cursor-pointer border-none transition-all"
          style={{[dir]:16,background:"rgba(255,255,255,0.75)",backdropFilter:"blur(8px)",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
          {icon}
        </button>
      ))}
    </section>
  );
}
