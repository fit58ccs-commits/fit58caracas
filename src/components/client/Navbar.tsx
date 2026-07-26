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

// Estos enlaces son fijos — no se editan desde el panel admin
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

  return (
    <header className="glass border-b border-white/70 sticky top-0 z-[100] rounded-none">
      <div className="max-w-[1280px] mx-auto px-7 h-16 flex items-center gap-8">

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

        {/* Nav links — fijos, no editables desde admin */}
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

        {/* Social */}
        <div className="flex items-center gap-1.5">
          <a href="https://www.instagram.com/fit58caracas" target="_blank" rel="noopener noreferrer"
            className="fluent-hover w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 cursor-pointer" title="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="https://wa.me/584141013137" target="_blank" rel="noopener noreferrer"
            className="fluent-hover w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 cursor-pointer" title="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.558 4.112 1.528 5.837L.057 23.998l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.359-.213-3.741.981 1-3.645-.234-.374A9.818 9.818 0 1112 21.818z"/>
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
