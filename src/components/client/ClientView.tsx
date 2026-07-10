"use client";
import { useState } from "react";
import { LayoutDashboard, Package, Heart, User, ShoppingCart, Award, Globe, Truck, Shield } from "lucide-react";
import { Navbar } from "./Navbar";
import { HeroBanner } from "./HeroBanner";
import { ProductCard, ProductDetailModal } from "./ProductCard";
import { CartDrawer } from "./CartDrawer";
import { CATEGORIES, TICKER_ITEMS } from "@/lib/data";
import type { Product, ExchangeRate } from "@/lib/types";
import type { useAppStore } from "@/lib/store";

type Store = ReturnType<typeof useAppStore>;

export function ClientView({ store }: { store: Store }) {
  const [cartOpen,        setCartOpen]        = useState(false);
  const [search,          setSearch]          = useState("");
  const [category,        setCategory]        = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = store.products.filter(p => {
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Todos" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        design={store.design}
        cartCount={store.cartCount}
        search={search}
        onSearch={setSearch}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Ticker */}
      <div className="bg-[rgba(17,17,17,0.93)] backdrop-blur-sm h-9 overflow-hidden flex items-center">
        <div className="animate-ticker animate-ticker-pause flex gap-20 whitespace-nowrap pl-full">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="text-[11px] font-medium text-white/75 tracking-wide">{t}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <HeroBanner banners={store.banners} />

      {/* Trust bar */}
      <div className="glass border-t border-b border-neutral-200/50 rounded-none">
        <div className="max-w-[1280px] mx-auto px-7 py-4 flex justify-center gap-[clamp(20px,5vw,72px)] flex-wrap">
          {[
            { icon: <Award size={15} />,  text: "Calidad certificada" },
            { icon: <Globe size={15} />,  text: "Importado directamente" },
            { icon: <Truck size={15} />,  text: "Entrega a domicilio" },
            { icon: <Shield size={15} />, text: "Garantía de frescura" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-neutral-600">
              <span className="text-neutral-400">{icon}</span>
              <span className="text-xs font-semibold">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <main className="max-w-[1280px] mx-auto px-7 py-10 pb-36 animate-fade-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight m-0">Catálogo</h2>
            {/*
              rateBCV → Tasa BCV/Euro: SOLO informativa, nunca calcula precios.
              Los precios en Bs. de cada producto usan store.rate (Binance/Paralelo),
              que el cliente nunca ve directamente.
            */}
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              {filtered.length} productos · Tasa de Cambio BCV Euro (€) 1$ = Bs.{" "}
              {store.rateBCV.value.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="cat-pill px-5 py-2 border rounded-full text-[11px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                border:       `1px solid ${category === cat ? "rgba(17,17,17,0.85)" : "rgba(220,220,220,0.8)"}`,
                background:   category === cat ? "rgba(17,17,17,0.90)" : "rgba(255,255,255,0.72)",
                backdropFilter: "blur(12px)",
                color:        category === cat ? "#fff" : "#555",
                boxShadow:    category === cat ? "0 4px 16px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.05)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              rate={store.rate.value}        // ← tasa de PRECIOS (Binance), calcula Bs.
              onAdd={() => store.addToCart(p)}
              inCart={store.cart.find(i => i.id === p.id)?.qty ?? 0}
              wishlisted={store.wishlist.includes(p.id)}
              onWishlist={() => store.toggleWishlist(p.id)}
              onDetail={() => setSelectedProduct(p)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-neutral-300">
              <Package size={48} className="mx-auto mb-4" />
              <p className="text-sm font-semibold text-neutral-400">No hay productos que coincidan</p>
            </div>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden glass fixed bottom-0 left-0 right-0 border-t border-neutral-200/60 flex justify-around py-2.5 pb-5 z-[90] rounded-none shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        {[
          { icon: <LayoutDashboard size={20} />, label: "Inicio" },
          { icon: <Package size={20} />,         label: "Tienda" },
          { icon: (
            <div className="relative">
              <ShoppingCart size={20} />
              {store.cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                  {store.cartCount}
                </span>
              )}
            </div>
          ), label: "Carrito", action: () => setCartOpen(true) },
          { icon: <Heart size={20} />, label: "Favoritos" },
          { icon: <User size={20} />,  label: "Perfil" },
        ].map(({ icon, label, action }, i) => (
          <button
            key={label}
            onClick={action}
            className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer min-w-[44px]"
            style={{ color: i === 1 ? "#111" : "#aaa" }}>
            {icon}
            <span className="text-[9px] font-bold tracking-wide uppercase">{label}</span>
          </button>
        ))}
      </nav>

      {/* Cart FAB (desktop) */}
      {store.cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="hidden md:flex glass-dark btn-primary fixed bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 text-white rounded-full px-8 py-4 text-xs font-black tracking-widest uppercase z-[90] cursor-pointer whitespace-nowrap border border-white/12"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.30)" }}>
          <ShoppingCart size={17} />
          {store.cartCount} {store.cartCount === 1 ? "PRODUCTO" : "PRODUCTOS"}
          <span className="bg-white/15 rounded-full px-3.5 py-0.5 font-black border border-white/10">
            ${store.cartTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          rate={store.rate.value}     // ← tasa de PRECIOS (Binance), calcula Bs.
          onAdd={() => store.addToCart(selectedProduct)}
          inCart={store.cart.find(i => i.id === selectedProduct.id)?.qty ?? 0}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          cart={store.cart}
          rate={store.rate.value}     // ← tasa de PRECIOS (Binance), calcula Bs.
          cartTotal={store.cartTotal}
          onRemove={store.removeFromCart}
          onUpdateQty={store.updateCartQty}
          onClose={() => setCartOpen(false)}
          onSaveOrder={store.saveOrder}
        />
      )}
    </div>
  );
}
