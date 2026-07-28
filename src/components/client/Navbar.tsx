"use client";
import { useState } from "react";
import { ShoppingCart, Search, Star, ClipboardList } from "lucide-react";
import type { DesignConfig } from "@/lib/types";

interface NavbarProps {
  design:     DesignConfig;
  cartCount:  number;
  search:     string;
  onSearch:   (v: string) => void;
  onCartOpen: () => void;
  onTrack:    () => void;
}

const FIXED_NAV = [
  { id:"n2", label:"Tienda",  href:"#tienda"  },
  { id:"n4", label:"Reseñas", href:"#resenas" },
];

export function Navbar({ design, cartCount, search, onSearch, onCartOpen, onTrack }: NavbarProps) {
  const [badgeKey, setBadgeKey] = useState(0);
  const [active,   setActive]   = useState("Tienda");

  const logoSrc = design.logoBase64 || design.logoUrl;

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string, label: string) => {
    e.preventDefault();
    setActive(label);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const waNumber = design.whatsappNumber || "584141013137";

  return (
    <header className="glass border-b border-white/70 sticky top-0 z-[100] rounded-none">
      <div className="max-w-[1280px] mx-auto px-4 md:px-7 h-14 md:h-16 flex items-center gap-3 md:gap-8">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {logoSrc
            ? <img src={logoSrc} alt="logo" className="w-9 h-9 rounded-xl object-cover" onError={e=>(e.currentTarget.style.display="none")}/>
            : <div className="neumorph w-9 h-9 rounded-xl flex items-center justify-center">
                <Star size={16} className="text-black fill-black"/>
              </div>
          }
          <div className="leading-none">
            <div className="text-sm font-black text-black tracking-wide">{design.brandName||"FIT +58"}</div>
            <div className="text-[8px] font-bold text-neutral-400 tracking-[3px]">{design.brandSub||"CARACAS"}</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex gap-7">
          {FIXED_NAV.map(n => (
            <a key={n.id} href={n.href}
              onClick={e=>handleNav(e,n.href,n.label)}
              className={`nav-link text-[11px] font-semibold tracking-wide uppercase pb-0.5 no-underline ${active===n.label?"text-black active":"text-neutral-500"}`}>
              {n.label}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 neumorph-inset rounded-full px-4 py-2 bg-[#f0f2f5]">
          <Search size={14} className="text-neutral-400 shrink-0"/>
          <input value={search} onChange={e=>onSearch(e.target.value)}
            placeholder="Buscar por nombre, categoría..."
            className="border-none outline-none text-sm bg-transparent text-neutral-700 w-full font-[inherit]"/>
          {search && (
            <button onClick={()=>onSearch("")}
              className="shrink-0 w-4 h-4 rounded-full bg-neutral-300 flex items-center justify-center cursor-pointer border-none text-white font-black text-[10px] hover:bg-neutral-500 transition-colors">
              ×
            </button>
          )}
        </div>

        {/* Social — Instagram + WhatsApp con colores de marca */}
        <div className="hidden md:flex items-center gap-2">
          {/* Instagram */}
          <a href="https://www.instagram.com/fit58caracas" target="_blank" rel="noopener noreferrer"
            title="Síguenos en Instagram"
            style={{ transition: "transform 0.18s ease, box-shadow 0.18s ease" }}
            className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.1)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
            {/* Ícono Instagram oficial con gradiente */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="ig-g1" cx="30%" cy="107%" r="130%">
                  <stop offset="0%" stopColor="#fdf497"/>
                  <stop offset="5%" stopColor="#fdf497"/>
                  <stop offset="45%" stopColor="#fd5949"/>
                  <stop offset="60%" stopColor="#d6249f"/>
                  <stop offset="90%" stopColor="#285AEB"/>
                </radialGradient>
              </defs>
              <rect x="1" y="1" width="26" height="26" rx="7" fill="url(#ig-g1)"/>
              <circle cx="14" cy="14" r="5.2" stroke="white" strokeWidth="1.8" fill="none"/>
              <circle cx="20.2" cy="7.8" r="1.3" fill="white"/>
            </svg>
          </a>

          {/* WhatsApp */}
          <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hola, quiero hacer un pedido en Fit +58 Caracas 🛒")}`}
            target="_blank" rel="noopener noreferrer"
            title="Contáctanos por WhatsApp"
            style={{ transition: "transform 0.18s ease" }}
            className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1.1)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform="scale(1)";}}>
            {/* Ícono WhatsApp oficial verde */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="7" fill="#25D366"/>
              <path d="M19.9 8.1A8.16 8.16 0 0014 5.8C9.47 5.8 5.8 9.47 5.8 14c0 1.44.38 2.84 1.1 4.08L5.7 22.3l4.32-1.14A8.19 8.19 0 0014 22.2c4.53 0 8.2-3.67 8.2-8.2 0-2.19-.85-4.25-2.3-5.9zm-5.9 12.62a6.8 6.8 0 01-3.47-.95l-.25-.15-2.58.68.69-2.52-.16-.26a6.8 6.8 0 01-1.04-3.62c0-3.76 3.06-6.82 6.82-6.82 1.82 0 3.53.71 4.82 2a6.79 6.79 0 012 4.83c0 3.76-3.06 6.81-6.83 6.81zm3.74-5.1c-.2-.1-1.21-.6-1.4-.67-.19-.07-.33-.1-.46.1-.14.2-.53.67-.65.81-.12.13-.24.15-.44.05-.2-.1-.87-.32-1.65-1.02-.61-.54-1.02-1.21-1.14-1.42-.12-.2-.01-.32.09-.42.09-.09.2-.24.3-.36.1-.12.14-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.46-1.11-.63-1.52-.17-.4-.34-.34-.46-.35h-.4c-.13 0-.35.05-.54.26-.18.2-.72.7-.72 1.71s.74 1.98.84 2.12c.1.13 1.45 2.2 3.5 3.09.49.21.87.34 1.17.43.49.16.94.14 1.29.08.39-.06 1.21-.5 1.38-.97.17-.48.17-.89.12-.97-.05-.09-.19-.14-.4-.24z" fill="white"/>
            </svg>
          </a>
        </div>

        {/* Cart + Track */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onTrack}
            className="hidden md:flex fluent-hover items-center gap-1.5 bg-white/60 border border-neutral-200/80 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide text-neutral-600 cursor-pointer">
            <ClipboardList size={15}/> Mi Pedido
          </button>
          <button onClick={()=>{setBadgeKey(k=>k+1);onCartOpen();}}
            className="fluent-hover relative bg-white/60 border border-neutral-200/80 p-2 rounded-xl flex items-center justify-center">
            <ShoppingCart size={21} className="text-black"/>
            {cartCount>0 && (
              <span key={badgeKey}
                className="animate-badge-bounce absolute -top-2 -right-2 w-[18px] h-[18px] rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
