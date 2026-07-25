"use client";
import { useState } from "react";
import { ShoppingCart, Search, ClipboardList, X } from "lucide-react";
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
    const el = document.getElementById(href.replace("#",""));
    if (el) el.scrollIntoView({ behavior:"smooth" });
    else window.scrollTo({ top:0, behavior:"smooth" });
  };

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-neutral-100">
      <div className="max-w-[1280px] mx-auto px-5 md:px-7 h-14 flex items-center gap-6 md:gap-10">

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          {logoSrc
            ? <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg object-cover"
                onError={e=>(e.currentTarget.style.display="none")}/>
            : <div className="w-8 h-8 rounded-lg bg-[#0d0d0d] flex items-center justify-center shrink-0">
                <span className="text-white text-[8px] font-black tracking-tight">F58</span>
              </div>
          }
          <div className="leading-none">
            <div className="text-[12px] font-black text-[#0d0d0d] tracking-tight"
              style={{fontFamily:"'DM Sans',sans-serif"}}>{design.brandName||"FIT +58"}</div>
            <div className="text-[7px] font-bold text-neutral-400 tracking-[3px] uppercase">{design.brandSub||"CARACAS"}</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex gap-7">
          {FIXED_NAV.map(n => (
            <a key={n.id} href={n.href} onClick={e=>handleNav(e,n.href,n.label)}
              className="text-[10px] font-bold tracking-[1.5px] uppercase no-underline transition-colors"
              style={{color: active===n.label ? "#0d0d0d" : "#aaa"}}>
              {n.label}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2">
          <Search size={12} className="text-neutral-400 shrink-0"/>
          <input value={search} onChange={e=>onSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="border-none outline-none text-xs bg-transparent text-neutral-700 w-full font-[inherit]"/>
          {search && (
            <button onClick={()=>onSearch("")}
              className="shrink-0 cursor-pointer border-none bg-transparent p-0 text-neutral-400 hover:text-neutral-700">
              <X size={12}/>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onTrack}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-[9px] font-bold uppercase tracking-[1.5px] cursor-pointer border border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 transition-colors">
            <ClipboardList size={13}/> Mi Pedido
          </button>
          <button onClick={()=>{setBadgeKey(k=>k+1);onCartOpen();}}
            className="relative flex items-center justify-center cursor-pointer border-none transition-all"
            style={{
              background: cartCount > 0 ? "#0d0d0d" : "transparent",
              border: `1px solid ${cartCount > 0 ? "#0d0d0d" : "#e5e5e5"}`,
              borderRadius: 999,
              padding: "8px 14px",
              gap: 6,
            }}>
            <ShoppingCart size={15} color={cartCount > 0 ? "#fff" : "#0d0d0d"}/>
            {cartCount > 0 && (
              <span key={badgeKey}
                className="animate-badge-bounce text-[10px] font-black"
                style={{color:"#fff"}}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
