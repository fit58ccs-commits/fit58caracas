"use client";
import { useState } from "react";
import { ShoppingCart, Search, Star } from "lucide-react";
import type { DesignConfig, NavLink } from "@/lib/types";

interface NavbarProps {
  design: DesignConfig;
  cartCount: number;
  search: string;
  onSearch: (v: string) => void;
  onCartOpen: () => void;
}

export function Navbar({ design, cartCount, search, onSearch, onCartOpen }: NavbarProps) {
  const [badgeKey, setBadgeKey] = useState(0);
  const [active, setActive] = useState("Tienda");

  const logoSrc  = design.logoBase64 || design.logoUrl;
  const navLinks: NavLink[] = design.navLinks || [];

  return (
    <header className="glass border-b border-white/70 sticky top-0 z-[100] rounded-none">
      <div className="max-w-[1280px] mx-auto px-7 h-16 flex items-center gap-8">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {logoSrc
            ? <img src={logoSrc} alt="logo" className="w-9 h-9 rounded-xl object-cover" onError={e => (e.currentTarget.style.display = "none")} />
            : <div className="neumorph w-9 h-9 rounded-xl flex items-center justify-center">
                <Star size={16} className="text-black fill-black" />
              </div>
          }
          <div className="leading-none">
            <div className="text-sm font-black text-black tracking-wide">{design.brandName || "FIT +58"}</div>
            <div className="text-[8px] font-bold text-neutral-400 tracking-[3px]">{design.brandSub || "GOURMET"}</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex gap-7">
          {navLinks.filter(n => n.active).map(n => (
            <a
              key={n.id}
              href={n.url}
              onClick={e => { if (n.url.startsWith("#")) { e.preventDefault(); setActive(n.label); } }}
              className={`nav-link text-[11px] font-semibold tracking-wide uppercase pb-0.5 no-underline ${active === n.label ? "text-black active" : "text-neutral-500"}`}>
              {n.label}
            </a>
          ))}
        </nav>

        {/* Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 neumorph-inset rounded-full px-4 py-2 bg-[#f0f2f5]">
          <Search size={14} className="text-neutral-400" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="border-none outline-none text-sm bg-transparent text-neutral-700 w-full font-[inherit]"
          />
        </div>

        {/* Cart */}
        <div className="ml-auto">
          <button
            onClick={onCartOpen}
            className="fluent-hover relative bg-white/60 border border-neutral-200/80 p-2 rounded-xl flex items-center justify-center">
            <ShoppingCart size={21} className="text-black" />
            {cartCount > 0 && (
              <span
                key={badgeKey}
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
