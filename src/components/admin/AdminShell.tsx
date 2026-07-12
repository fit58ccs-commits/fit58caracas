"use client";
import { LayoutDashboard, Package, ClipboardList, TrendingUp, Palette, Image, Search, Menu, X, Star, LogOut } from "lucide-react";
import { useState } from "react";
import type { DesignConfig } from "@/lib/types";

export type AdminSection = "dashboard" | "banners" | "inventory" | "orders" | "rates" | "design";

const NAV: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard",  icon: <LayoutDashboard size={16} /> },
  { id: "banners",   label: "Banners",    icon: <Image size={16} /> },
  { id: "inventory", label: "Inventario", icon: <Package size={16} /> },
  { id: "orders",    label: "Pedidos",    icon: <ClipboardList size={16} /> },
  { id: "rates",     label: "Tasas",      icon: <TrendingUp size={16} /> },
  { id: "design",    label: "Diseño",     icon: <Palette size={16} /> },
];

interface ShellProps {
  section: AdminSection;
  onSection: (s: AdminSection) => void;
  pendingOrders: number;
  search: string;
  onSearch: (v: string) => void;
  design: DesignConfig;
  userEmail: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AdminShell({ section, onSection, pendingOrders, search, onSearch, design, userEmail, onSignOut, children }: ShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const logoSrc = design.logoBase64 || design.logoUrl;
  const brandName = design.brandName || "DÉLICE";
  const brandSub  = design.brandSub  || "GOURMET";

  const Sidebar = ({ overlay = false }: { overlay?: boolean }) => (
    <aside className={`${overlay ? "relative z-[1]" : ""} flex flex-col shrink-0`}
      style={{ width:222, background:"rgba(248,249,250,0.90)", backdropFilter:"blur(24px) saturate(200%)", borderRight:"1px solid rgba(235,235,235,0.7)", boxShadow:"inset -1px 0 0 rgba(255,255,255,0.6)", height:"100vh" }}>

      {/* Brand — usa datos del design */}
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="text-[8px] font-black text-neutral-400 tracking-[3px] mb-2 uppercase">Admin Panel</div>
        <div className="flex items-center gap-2.5">
          {logoSrc
            ? <img src={logoSrc} alt="logo" className="w-8 h-8 rounded-lg object-cover shrink-0"
                onError={e => (e.currentTarget.style.display="none")}/>
            : <div className="neumorph w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                <Star size={14} className="text-black fill-black"/>
              </div>
          }
          <div className="leading-none min-w-0">
            <div className="text-sm font-black text-black tracking-wide truncate">{brandName}</div>
            <div className="text-[8px] font-bold text-neutral-400 tracking-[2px] uppercase">{brandSub}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map(n => {
          const active = section === n.id;
          return (
            <div key={n.id} className="px-0 py-0.5">
              <button onClick={() => { onSection(n.id); setMobileOpen(false); }}
                className="flex items-center gap-2.5 text-[11px] font-bold tracking-wide uppercase cursor-pointer w-full text-left transition-all duration-200 border-none"
                style={{
                  padding:        "11px 22px",
                  background:     active ? "rgba(17,17,17,0.88)" : "transparent",
                  backdropFilter: active ? "blur(8px)" : "none",
                  color:          active ? "#fff" : "#666",
                  borderRadius:   active ? 8 : 0,
                  margin:         active ? "0 10px" : "0",
                  width:          active ? "calc(100% - 20px)" : "100%",
                  boxShadow:      active ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
                }}>
                {n.icon}{n.label}
                {n.id === "orders" && pendingOrders > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg">
                    {pendingOrders}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-neutral-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"
            style={{ animation:"badgePulse 2s infinite", boxShadow:"0 0 6px rgba(34,200,122,0.5)" }}/>
          <span className="text-[10px] text-neutral-400">Supabase activo</span>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen" style={{ background:"linear-gradient(135deg,#f0f2f5 0%,#e8eaed 100%)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[200] flex animate-overlay-in">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={() => setMobileOpen(false)}/>
          <div className="animate-drawer-in flex"><Sidebar overlay/></div>
          <button onClick={() => setMobileOpen(false)}
            className="absolute top-4 left-[230px] w-9 h-9 bg-white/80 rounded-full flex items-center justify-center border border-neutral-200/80 z-10 cursor-pointer">
            <X size={16}/>
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="glass border-b border-neutral-200/60 px-4 md:px-7 h-14 flex items-center gap-3 sticky top-0 z-[50] rounded-none">
          <button className="md:hidden flex items-center border-none bg-none cursor-pointer shrink-0" onClick={() => setMobileOpen(true)}>
            <Menu size={20}/>
          </button>
          <span className="text-[11px] font-black text-black uppercase tracking-widest hidden md:block">
            {NAV.find(n => n.id === section)?.label}
          </span>
          <div className="flex-1"/>

          {/* Buscador */}
          <div className="flex items-center gap-2 neumorph-inset bg-[#f0f2f5] rounded-full px-3 py-1.5 hidden md:flex">
            <Search size={13} className="text-neutral-400"/>
            <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Buscar pedidos..."
              className="border-none outline-none text-xs text-neutral-700 bg-transparent w-32 font-[inherit]"/>
          </div>

          {/* Email */}
          {userEmail && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold glass px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block shrink-0"/>
              <span className="max-w-[140px] truncate">{userEmail}</span>
            </div>
          )}

          {/* ← Tienda */}
          <a href="/"
            className="flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase no-underline glass text-neutral-500 hover:text-neutral-800 transition-all px-3 py-1.5 rounded-full">
            ← Tienda
          </a>

          {/* Salir */}
          <button onClick={onSignOut}
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase border-none cursor-pointer glass text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-all px-3 py-1.5 rounded-full">
            <LogOut size={12}/> Salir
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-7 pb-24">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden glass fixed bottom-0 left-0 right-0 border-t border-neutral-200/60 flex justify-around py-2.5 pb-5 z-[90] rounded-none">
          {NAV.map(n => (
            <button key={n.id} onClick={() => onSection(n.id)}
              className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer relative"
              style={{ color: section===n.id ? "#111" : "#bbb" }}>
              {n.icon}
              {n.id === "orders" && pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
              <span className="text-[9px] font-bold tracking-wide uppercase">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
