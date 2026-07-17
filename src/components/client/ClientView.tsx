"use client";
import { useState } from "react";
import { Package, Heart, ShoppingCart, X, ChevronRight, Award, Globe, Truck, Shield } from "lucide-react";
import { Navbar }                          from "./Navbar";
import { HeroBanner }                      from "./HeroBanner";
import { ProductCard, ProductDetailModal } from "./ProductCard";
import { CartDrawer }                      from "./CartDrawer";
import { ReviewSection }                   from "./ReviewSection";
import { DEFAULT_TICKER_ITEMS, DEFAULT_TRUST_ITEMS } from "@/lib/data";
import { fmt$, fmtBs }                    from "@/lib/store";
import type { Product }                    from "@/lib/types";
import type { useAppStore }               from "@/lib/store";

type Store = ReturnType<typeof useAppStore>;

const TRUST_ICONS: Record<string, React.ReactNode> = {
  award:  <Award size={15}/>,
  globe:  <Globe size={15}/>,
  truck:  <Truck size={15}/>,
  shield: <Shield size={15}/>,
};

export function ClientView({ store }: { store: Store }) {
  const [cartOpen,        setCartOpen]        = useState(false);
  const [wishlistOpen,    setWishlistOpen]    = useState(false);
  const [search,          setSearch]          = useState("");
  const [category,        setCategory]        = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeNav,       setActiveNav]       = useState("Tienda");

  const filtered = store.products.filter(p => {
    if (p.stock <= 0) return false; // ocultar sin stock
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || p.category.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (category === "Todos" || p.category === category);
  });

  const wishlistProducts = store.products.filter(p => store.wishlist.includes(p.id));

  // Textos editables desde admin
  const tickerItems = store.design.tickerItems?.length ? store.design.tickerItems : DEFAULT_TICKER_ITEMS;
  const trustItems  = (store.design.trustItems?.length ? store.design.trustItems : DEFAULT_TRUST_ITEMS).filter(t => t.active);

  // Banners activos únicamente
  const activeBanners = store.banners.filter(b => b.active !== false);

  const scrollToTop = () => window.scrollTo({ top:0, behavior:"smooth" });

  return (
    <div className="min-h-screen bg-white" id="inicio">
      <Navbar design={store.design} cartCount={store.cartCount}
        search={search} onSearch={setSearch} onCartOpen={() => setCartOpen(true)}/>

      {/* ── Ticker barra negra (editable) ── */}
      <div className="bg-[rgba(17,17,17,0.93)] backdrop-blur-sm h-9 overflow-hidden flex items-center">
        <div className="animate-ticker animate-ticker-pause flex whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="text-[11px] font-medium text-white/75 tracking-wide px-10">{t}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div id="tienda">
        {activeBanners.length > 0
          ? <HeroBanner banners={activeBanners}/>
          : <div className="h-32 bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">
              Sin banners activos
            </div>
        }
      </div>

      {/* Catalog */}
      <main className="max-w-[1280px] mx-auto px-4 md:px-7 py-8 pb-36 animate-fade-up">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight m-0">Catálogo</h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">
              {filtered.length} productos · Tasa de Cambio BCV Euro (€) 1$ = Bs. {store.rateBCV.value.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {["Todos", ...(store.design.categories || ["Aceites","Bebidas","Dulces","Frutos","Pastas"])].map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="cat-pill px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold tracking-wide uppercase whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                border:`1px solid ${category===cat?"rgba(17,17,17,0.85)":"rgba(220,220,220,0.8)"}`,
                background:category===cat?"rgba(17,17,17,0.90)":"rgba(255,255,255,0.72)",
                backdropFilter:"blur(12px)", color:category===cat?"#fff":"#555",
                boxShadow:category===cat?"0 4px 16px rgba(0,0,0,0.18)":"0 2px 8px rgba(0,0,0,0.05)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid — 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid gap-3 md:gap-5"
          style={{ gridTemplateColumns:"repeat(auto-fill, minmax(min(100%/2 - 8px, 280px), 1fr))" }}>
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} rate={store.rate.value}
              onAdd={() => store.addToCart(p)}
              inCart={store.cart.find(i => i.id === p.id)?.qty ?? 0}
              wishlisted={store.wishlist.includes(p.id)}
              onWishlist={() => store.toggleWishlist(p.id)}
              onDetail={() => setSelectedProduct(p)}
              reviews={store.reviews}/>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-neutral-300">
              <Package size={40} className="mx-auto mb-3"/>
              <p className="text-sm font-semibold text-neutral-400">No hay productos que coincidan</p>
            </div>
          )}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV — siempre visible ── */}
      <nav className="md:hidden glass fixed bottom-0 left-0 right-0 border-t border-neutral-200/60 flex justify-around py-2.5 pb-5 z-[200] rounded-none shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        {/* Inicio */}
        <button onClick={() => { scrollToTop(); setActiveNav("Inicio"); }}
          className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer min-w-[44px]"
          style={{ color: activeNav==="Inicio" ? "#111" : "#aaa" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="text-[9px] font-bold tracking-wide uppercase">Inicio</span>
        </button>

        {/* Tienda */}
        <button onClick={() => { document.getElementById("tienda")?.scrollIntoView({behavior:"smooth"}); setActiveNav("Tienda"); }}
          className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer min-w-[44px]"
          style={{ color: activeNav==="Tienda" ? "#111" : "#aaa" }}>
          <Package size={20}/>
          <span className="text-[9px] font-bold tracking-wide uppercase">Tienda</span>
        </button>

        {/* Carrito */}
        <button onClick={() => { setCartOpen(true); setActiveNav("Carrito"); }}
          className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer min-w-[44px]"
          style={{ color: activeNav==="Carrito" ? "#111" : "#aaa" }}>
          <div className="relative">
            <ShoppingCart size={20}/>
            {store.cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {store.cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wide uppercase">Carrito</span>
        </button>

        {/* Favoritos */}
        <button onClick={() => { setWishlistOpen(true); setActiveNav("Favoritos"); }}
          className="flex flex-col items-center gap-0.5 bg-none border-none cursor-pointer min-w-[44px]"
          style={{ color: activeNav==="Favoritos" ? "#111" : "#aaa" }}>
          <div className="relative">
            <Heart size={20}/>
            {wishlistProducts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {wishlistProducts.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wide uppercase">Favoritos</span>
        </button>
      </nav>

      {/* Cart FAB desktop */}
      {store.cartCount > 0 && (
        <button onClick={() => setCartOpen(true)}
          className="hidden md:flex glass-dark btn-primary fixed bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 text-white rounded-full px-8 py-4 text-xs font-black tracking-widest uppercase z-[90] cursor-pointer whitespace-nowrap border border-white/12"
          style={{ boxShadow:"0 12px 40px rgba(0,0,0,0.30)" }}>
          <ShoppingCart size={17}/>
          {store.cartCount} {store.cartCount===1?"PRODUCTO":"PRODUCTOS"}
          <span className="bg-white/15 rounded-full px-3.5 py-0.5 font-black border border-white/10">
            €{store.cartTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* ── Wishlist drawer ── */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[300] flex">
          <div className="animate-overlay-in absolute inset-0 bg-black/45 backdrop-blur-md" onClick={() => setWishlistOpen(false)}/>
          <div className="animate-drawer-in glass absolute right-0 top-0 bottom-0 w-full max-w-[420px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/40 bg-white/88 backdrop-blur-2xl sticky top-0">
              <div>
                <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase mb-0.5">Lista de deseos</p>
                <h2 className="text-lg font-black text-black uppercase tracking-tight">FAVORITOS ({wishlistProducts.length})</h2>
              </div>
              <button onClick={() => setWishlistOpen(false)}
                className="fluent-hover w-9 h-9 border border-neutral-200/80 bg-white/65 flex items-center justify-center rounded-xl cursor-pointer">
                <X size={16}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {wishlistProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-neutral-300">
                  <Heart size={48} className="mb-4"/>
                  <p className="text-sm font-semibold text-neutral-400">No tienes favoritos aún</p>
                  <p className="text-xs text-neutral-300 mt-1">Toca el ❤ en cualquier producto</p>
                </div>
              ) : wishlistProducts.map(p => (
                <div key={p.id} className="glass-card rounded-2xl flex items-center gap-3 p-3">
                  <div className="neumorph w-16 h-16 flex items-center justify-center shrink-0 rounded-xl overflow-hidden">
                    <img src={p.images?.[0]||p.img} alt={p.name} className="w-12 h-12 object-contain"
                      onError={e=>(e.currentTarget.style.opacity="0")}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-black uppercase leading-snug mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</p>
                    <p className="text-[10px] text-neutral-400 mb-1">{p.category}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-black">{fmt$(p.price)}</span>
                      <span className="text-[10px] text-neutral-400">{fmtBs(p.price, store.rate.value)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => { store.addToCart(p); setWishlistOpen(false); setCartOpen(true); }}
                      className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center cursor-pointer border-none">
                      <ShoppingCart size={13}/>
                    </button>
                    <button onClick={() => store.toggleWishlist(p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none bg-red-50">
                      <Heart size={13} fill="#e53e3e" color="#e53e3e"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {wishlistProducts.length > 0 && (
              <div className="px-6 py-4 border-t border-white/40 bg-white/70">
                <button onClick={() => { wishlistProducts.forEach(p=>store.addToCart(p)); setWishlistOpen(false); setCartOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-[11px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer border-none"
                  style={{ background:"rgba(17,17,17,0.90)", color:"#fff" }}>
                  <ShoppingCart size={14}/> AGREGAR TODO AL CARRITO <ChevronRight size={13}/>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} rate={store.rate.value}
          onAdd={() => store.addToCart(selectedProduct)}
          inCart={store.cart.find(i=>i.id===selectedProduct.id)?.qty??0}
          onClose={() => setSelectedProduct(null)}
          wishlisted={store.wishlist.includes(selectedProduct.id)}
          onWishlist={() => store.toggleWishlist(selectedProduct.id)}
          reviews={store.reviews}/>
      )}

      {/* Sección de Reseñas */}
      <ReviewSection
        products={store.products}
        reviews={store.reviews}
        onSubmitReview={store.addReview}/>

      {cartOpen && (
        <CartDrawer cart={store.cart} rate={store.rate.value} cartTotal={store.cartTotal}
          onRemove={store.removeFromCart} onUpdateQty={store.updateCartQty}
          onClose={() => setCartOpen(false)} onSaveOrder={store.saveOrder}
          design={{ whatsappNumber: store.design.whatsappNumber, paymentMethods: store.design.paymentMethods }}/>
      )}
    </div>
  );
}
