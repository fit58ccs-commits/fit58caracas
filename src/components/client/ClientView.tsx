"use client";
import { useState } from "react";
import { Package, Heart, ShoppingCart, X, ChevronRight, ClipboardList } from "lucide-react";
import { Navbar }                          from "./Navbar";
import { HeroBanner }                      from "./HeroBanner";
import { ProductDetailModal }              from "./ProductCard";
import { CartDrawer }                      from "./CartDrawer";
import { ReviewSection }                   from "./ReviewSection";
import { OrderTracker }                    from "./OrderTracker";
import { DEFAULT_TICKER_ITEMS }            from "@/lib/data";
import { fmt$, fmtBs }                    from "@/lib/store";
import type { Product }                    from "@/lib/types";
import type { useAppStore }               from "@/lib/store";

type Store = ReturnType<typeof useAppStore>;

const CARD_COLORS = ["#FFF0E8", "#FFF3EE", "#FDE8DC", "#FFF7F3", "#FFE4D0"];

function badgeColor(b?: string) {
  if (!b) return "";
  const l = b.toLowerCase();
  if (l.includes("nuevo")) return "bg-[#FC6A0A]";
  if (l.includes("oferta") || l.includes("desc")) return "bg-[#E74504]";
  return "bg-[#292929]";
}

export function ClientView({ store }: { store: Store }) {
  const [cartOpen,        setCartOpen]        = useState(false);
  const [wishlistOpen,    setWishlistOpen]    = useState(false);
  const [trackOpen,       setTrackOpen]       = useState(false);
  const [search,          setSearch]          = useState("");
  const [category,        setCategory]        = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeNav,       setActiveNav]       = useState("Tienda");

  const filtered = store.products.filter(p => {
    if (p.stock <= 0) return false;
    if (!search) return category === "Todos" || p.category === category;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.desc?.toLowerCase().includes(q) ?? false) ||
      (p.badge?.toLowerCase().includes(q) ?? false)
    ) && (category === "Todos" || p.category === category);
  });

  const wishlistProducts = store.products.filter(p => store.wishlist.includes(p.id));
  const tickerItems      = store.design.tickerItems?.length ? store.design.tickerItems : DEFAULT_TICKER_ITEMS;
  const activeBanners    = store.banners.filter(b => b.active !== false);
  const categories       = ["Todos", ...(store.design.categories ?? [])];
  const scrollToTop      = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen" style={{ background: "#F5ECE4", fontFamily: "'DM Sans', system-ui, sans-serif" }} id="inicio">

      <Navbar design={store.design} cartCount={store.cartCount} search={search}
        onSearch={setSearch} onCartOpen={() => setCartOpen(true)} onTrack={() => setTrackOpen(true)} />

      {/* Ticker */}
      <div style={{ background: "#0d0d0d", height: 36, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div className="animate-ticker animate-ticker-pause" style={{ display: "flex", whiteSpace: "nowrap" }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: "2px", textTransform: "uppercase" as const, padding: "0 32px" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div id="tienda">
        {activeBanners.length > 0
          ? <HeroBanner banners={activeBanners} />
          : <div style={{ height: 120, background: "#FFF0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#9a8880", fontSize: 13 }}>Sin banners activos</p>
            </div>
        }
      </div>

      {/* Divisor editorial */}
      <div style={{ background: "#fff", padding: "48px 28px 0", display: "flex", alignItems: "flex-start", gap: 20 }}>
        <div style={{ flexShrink: 0, width: 40, height: 1, background: "#0d0d0d", marginTop: 16 }} />
        <div style={{ display: "flex", gap: 32, alignItems: "baseline", flexWrap: "wrap" as const }}>
          <p style={{ fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 900, color: "#0d0d0d", margin: 0, lineHeight: 1.2 }}>
            Nutre tu cuerpo<br />con lo <em style={{ fontStyle: "italic", fontWeight: 400 }}>mejor</em> del mundo.
          </p>
          <p style={{ fontSize: 11, color: "#585757", maxWidth: 300, lineHeight: 1.7, margin: 0 }}>
            En Fit +58 Caracas importamos los suplementos y productos gourmet que antes no conseguías. Calidad garantizada, entrega directa a tu puerta.
          </p>
        </div>
      </div>

      {/* Watermark */}
      <div style={{ overflow: "hidden", padding: "20px 0 8px" }}>
        <p style={{ fontSize: "clamp(56px,10vw,100px)", fontWeight: 900, color: "rgba(41,41,41,0.04)", whiteSpace: "nowrap" as const, letterSpacing: -4, textTransform: "uppercase" as const, lineHeight: 1, paddingLeft: 28, margin: 0 }}>
          SUPLEMENTOS GOURMET
        </p>
      </div>

      {/* Catalogo */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px 80px" }}>

        {/* Header + pills */}
        <div style={{ background: "#fff", padding: "0 0 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap" as const, gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9a8880", letterSpacing: "2.5px", textTransform: "uppercase" as const, margin: "0 0 4px" }}>Catálogo</p>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#292929", margin: 0, letterSpacing: -1, textTransform: "uppercase" as const, lineHeight: 0.9 }}>
                NUESTROS<br />PRODUCTOS
              </h2>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className="cat-pill"
                  style={{ padding: "7px 16px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${category === cat ? "#FC6A0A" : "rgba(41,41,41,0.15)"}`,
                    background: category === cat ? "#FC6A0A" : "transparent",
                    color: category === cat ? "#fff" : "#585757" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <p style={{ fontSize: 10, color: "#9a8880", margin: 0 }}>
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
            {search ? ` para "${search}"` : ""} · 1€ = Bs. {store.rateBCV.value.toFixed(2)}
          </p>
        </div>

        {/* Bento Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9a8880" }}>
            <Package size={40} style={{ margin: "0 auto 12px", display: "block" }} />
            {search ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#585757", marginBottom: 8 }}>
                  Sin resultados para <strong style={{ color: "#292929" }}>"{search}"</strong>
                </p>
                <button onClick={() => setSearch("")}
                  style={{ fontSize: 11, fontWeight: 700, color: "#292929", textDecoration: "underline", cursor: "pointer", background: "none", border: "none" }}>
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <p style={{ fontSize: 14, fontWeight: 600, color: "#585757" }}>No hay productos en esta categoría</p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {featured && (
              <div className="prod-card" style={{ gridColumn: "span 2", gridRow: "span 2", background: "#FFF0E8", borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative" }}
                onClick={() => setSelectedProduct(featured)}>
                {featured.badge && <div className={`${badgeColor(featured.badge)} absolute top-3 left-3 z-[3] text-white text-[8px] font-black tracking-[1.5px] uppercase px-2 py-1 rounded-md`}>{featured.badge}</div>}
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 32px 0" }}>
                  <img src={featured.images?.[0] || featured.img} alt={featured.name}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18))", transition: "transform 0.5s ease" }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                </div>
                <div style={{ padding: "16px 24px 24px" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#9a8880", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "0 0 4px" }}>{featured.category}</p>
                  <h3 style={{ fontSize: "clamp(14px,1.6vw,20px)", fontWeight: 900, color: "#292929", textTransform: "uppercase" as const, letterSpacing: -0.5, margin: "0 0 14px" }}>{featured.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: "clamp(18px,2vw,24px)", fontWeight: 900, color: "#292929" }}>{fmt$(featured.price)}</span>
                      <span style={{ fontSize: 11, color: "#9a8880", marginLeft: 8 }}>{fmtBs(featured.price, store.rate.value)}</span>
                    </div>
                    <button onClick={e => { e.stopPropagation(); store.addToCart(featured); }}
                      style={{ background: "#FC6A0A", color: "#fff", border: "none", padding: "10px 20px", fontSize: 9, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase" as const, borderRadius: 4, cursor: "pointer", boxShadow: "0 4px 16px rgba(252,106,10,0.35)", fontFamily: "inherit" }}>
                      AGREGAR +
                    </button>
                  </div>
                </div>
              </div>
            )}
            {rest.map((p, i) => {
              const isWide = (i + 1) % 5 === 0;
              const bg = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <div key={p.id} className="prod-card" onClick={() => setSelectedProduct(p)}
                  style={{ gridColumn: isWide ? "span 2" : "span 1", background: bg, borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                  {p.badge && <div className={`${badgeColor(p.badge)} absolute top-3 left-3 z-[3] text-white text-[8px] font-black tracking-[1.5px] uppercase px-2 py-1 rounded-md`}>{p.badge}</div>}
                  {isWide ? (
                    <div style={{ display: "flex", alignItems: "center", padding: 20, gap: 20 }}>
                      <div style={{ width: 110, height: 110, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={p.images?.[0] || p.img} alt={p.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.15))" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: "#9a8880", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "0 0 4px" }}>{p.category}</p>
                        <h3 style={{ fontSize: 14, fontWeight: 900, color: "#292929", textTransform: "uppercase" as const, letterSpacing: -0.3, margin: "0 0 8px" }}>{p.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: "#292929" }}>{fmt$(p.price)}</span>
                          <button onClick={e => { e.stopPropagation(); store.addToCart(p); }}
                            style={{ background: "#FC6A0A", color: "#fff", border: "none", padding: "8px 16px", fontSize: 8, fontWeight: 900, letterSpacing: "1.5px", textTransform: "uppercase" as const, borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>
                            AGREGAR
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 20px 0" }}>
                        <img src={p.images?.[0] || p.img} alt={p.name}
                          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.14))" }}
                          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                      </div>
                      <div style={{ padding: "12px 16px 16px" }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: "#9a8880", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "0 0 3px" }}>{p.category}</p>
                        <h3 style={{ fontSize: 12, fontWeight: 900, color: "#292929", textTransform: "uppercase" as const, letterSpacing: -0.3, margin: "0 0 8px", lineHeight: 1.2 }}>{p.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: "#292929" }}>{fmt$(p.price)}</span>
                          <button onClick={e => { e.stopPropagation(); store.addToCart(p); }}
                            style={{ background: "#FC6A0A", color: "#fff", border: "none", padding: "7px 12px", fontSize: 9, fontWeight: 900, borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
                            +
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA final oscuro */}
        {filtered.length > 0 && (
          <div style={{ marginTop: 48, background: "#292929", borderRadius: 20, padding: "clamp(32px,5vw,56px) clamp(28px,5vw,52px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -20, top: -20, fontSize: "clamp(80px,15vw,140px)", fontWeight: 900, color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: -6, userSelect: "none" as const, pointerEvents: "none" as const }}>F58</div>
            <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: "3px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, display: "block", margin: "0 0 12px" }}>Empieza hoy</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: -1.5, textTransform: "uppercase" as const, lineHeight: 0.9 }}>ALCANZA TUS<br />METAS.</h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 24px", lineHeight: 1.6, maxWidth: 320 }}>Importados directamente para ti. Calidad sin compromiso.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
              <button onClick={scrollToTop}
                style={{ background: "#FC6A0A", color: "#fff", border: "none", padding: "13px 28px", fontSize: 10, fontWeight: 900, letterSpacing: "2px", textTransform: "uppercase" as const, borderRadius: 4, cursor: "pointer", boxShadow: "0 4px 20px rgba(252,106,10,0.4)", fontFamily: "inherit" }}>
                VER CATÁLOGO COMPLETO →
              </button>
              <button onClick={() => setTrackOpen(true)}
                style={{ background: "transparent", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" as const, borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>
                RASTREAR MI PEDIDO
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Nav movil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200]"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(41,41,41,0.08)", boxShadow: "0 -4px 24px rgba(41,41,41,0.08)", display: "flex", justifyContent: "space-around", paddingTop: 10, paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}>
        {([
          { label: "Inicio",    action: () => { scrollToTop(); setActiveNav("Inicio"); },
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { label: "Tienda",    action: () => { document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" }); setActiveNav("Tienda"); }, icon: <Package size={20} /> },
          { label: "Carrito",   action: () => { setCartOpen(true); setActiveNav("Carrito"); },
            icon: <div style={{ position: "relative" }}><ShoppingCart size={20} />{store.cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#FC6A0A", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{store.cartCount}</span>}</div> },
          { label: "Favoritos", action: () => { setWishlistOpen(true); setActiveNav("Favoritos"); },
            icon: <div style={{ position: "relative" }}><Heart size={20} />{wishlistProducts.length > 0 && <span style={{ position: "absolute", top: -6, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#e53e3e", color: "#fff", fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{wishlistProducts.length}</span>}</div> },
          { label: "Pedido",    action: () => { setTrackOpen(true); setActiveNav("Pedido"); }, icon: <ClipboardList size={20} /> },
        ] as const).map(({ label, icon, action }) => (
          <button key={label} onClick={action}
            className="flex flex-col items-center gap-0.5 border-none cursor-pointer min-w-[44px]"
            style={{ background: "none", color: activeNav === label ? "#FC6A0A" : "#9a8880" }}>
            {icon}
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" as const }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Cart FAB desktop */}
      {store.cartCount > 0 && (
        <button onClick={() => setCartOpen(true)}
          className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 items-center gap-3 rounded-full px-8 py-4 text-xs font-black tracking-widest uppercase z-[90] cursor-pointer whitespace-nowrap btn-primary"
          style={{ background: "#292929", color: "#fff", boxShadow: "0 12px 40px rgba(41,41,41,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ShoppingCart size={17} />
          {store.cartCount} {store.cartCount === 1 ? "PRODUCTO" : "PRODUCTOS"}
          <span style={{ background: "rgba(252,106,10,0.25)", color: "#FC6A0A", border: "1px solid rgba(252,106,10,0.3)", borderRadius: 999, padding: "2px 14px", fontWeight: 900 }}>
            €{store.cartTotal.toFixed(2)}
          </span>
        </button>
      )}

      {/* Wishlist drawer */}
      {wishlistOpen && (
        <div className="fixed inset-0 z-[300] flex">
          <div className="animate-overlay-in absolute inset-0 bg-black/45 backdrop-blur-md" onClick={() => setWishlistOpen(false)} />
          <div className="animate-drawer-in glass absolute right-0 top-0 bottom-0 w-full max-w-[420px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0"
              style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", borderColor: "rgba(41,41,41,0.08)" }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 900, color: "#9a8880", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "0 0 2px" }}>Lista de deseos</p>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#292929", textTransform: "uppercase" as const, letterSpacing: -0.5, margin: 0 }}>FAVORITOS ({wishlistProducts.length})</h2>
              </div>
              <button onClick={() => setWishlistOpen(false)}
                className="fluent-hover w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
                style={{ border: "1px solid rgba(41,41,41,0.12)", background: "#F5ECE4" }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {wishlistProducts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <Heart size={48} style={{ color: "#9a8880", marginBottom: 16 }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#585757" }}>No tienes favoritos aún</p>
                  <p style={{ fontSize: 12, color: "#9a8880", marginTop: 4 }}>Toca el ❤ en cualquier producto</p>
                </div>
              ) : wishlistProducts.map(p => (
                <div key={p.id} className="glass-card rounded-2xl flex items-center gap-3 p-3">
                  <div className="neumorph w-16 h-16 flex items-center justify-center shrink-0 rounded-xl overflow-hidden">
                    <img src={p.images?.[0] || p.img} alt={p.name} className="w-12 h-12 object-contain"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase leading-snug mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: "#292929" }}>{p.name}</p>
                    <p className="text-[10px] mb-1" style={{ color: "#9a8880" }}>{p.category}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black" style={{ color: "#292929" }}>{fmt$(p.price)}</span>
                      <span className="text-[10px]" style={{ color: "#9a8880" }}>{fmtBs(p.price, store.rate.value)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => { store.addToCart(p); setWishlistOpen(false); setCartOpen(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
                      style={{ background: "#FC6A0A", color: "#fff" }}>
                      <ShoppingCart size={13} />
                    </button>
                    <button onClick={() => store.toggleWishlist(p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none bg-red-50">
                      <Heart size={13} fill="#e53e3e" color="#e53e3e" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {wishlistProducts.length > 0 && (
              <div className="px-6 py-4 border-t" style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(41,41,41,0.08)" }}>
                <button onClick={() => { wishlistProducts.forEach(p => store.addToCart(p)); setWishlistOpen(false); setCartOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-[11px] font-black tracking-[1.5px] uppercase rounded-xl cursor-pointer border-none"
                  style={{ background: "#FC6A0A", color: "#fff" }}>
                  <ShoppingCart size={14} /> AGREGAR TODO AL CARRITO <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {trackOpen && <OrderTracker rate={store.rate.value} onClose={() => setTrackOpen(false)} />}

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} rate={store.rate.value}
          onAdd={() => store.addToCart(selectedProduct)}
          inCart={store.cart.find(i => i.id === selectedProduct.id)?.qty ?? 0}
          onClose={() => setSelectedProduct(null)}
          wishlisted={store.wishlist.includes(selectedProduct.id)}
          onWishlist={() => store.toggleWishlist(selectedProduct.id)}
          onSubmitReview={store.addReview}
          reviews={store.reviews} />
      )}

      <ReviewSection products={store.products} reviews={store.reviews} onSubmitReview={store.addReview} />

      {cartOpen && (
        <CartDrawer cart={store.cart} rate={store.rate.value} cartTotal={store.cartTotal}
          onRemove={store.removeFromCart} onUpdateQty={store.updateCartQty}
          onClose={() => setCartOpen(false)} onSaveOrder={store.saveOrder}
          design={{ whatsappNumber: store.design.whatsappNumber, paymentMethods: store.design.paymentMethods }} />
      )}
    </div>
  );
}
