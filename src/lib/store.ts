"use client";
/**
 * store.ts — Estado global de la app
 * ─────────────────────────────────────────────────────────────────────────────
 * ESTRATEGIA DE DATOS:
 *   1. Al arrancar → carga desde Supabase (fuente de verdad)
 *   2. Mientras carga → muestra datos de localStorage como caché instantáneo
 *   3. Cada acción → actualiza React state + localStorage + Supabase en paralelo
 *   4. Si Supabase falla → la app sigue funcionando con localStorage
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useEffect, useCallback } from "react";
import type { Product, Banner, Order, ExchangeRate, DesignConfig, CartItem } from "./types";
import { SAMPLE_PRODUCTS, DEFAULT_BANNERS, DEFAULT_DESIGN } from "./data";
import {
  sbGetProducts, sbAddProduct, sbUpdateProduct, sbDeleteProduct,
  sbGetOrders, sbSaveOrder, sbUpdateOrderStatus,
  sbGetBanners, sbUpdateBanner, sbInsertBanner, sbDeleteBanner,
  sbGetRate, sbGetRateBCV, sbSetRate, sbSetRateBCV,
  sbGetDesign, sbSetDesign,
  sbUploadImage,
} from "./supabase";

// ─── Re-export para que los componentes no importen desde supabase.ts ────────
export { sbUploadImage };

// ─── Helpers ────────────────────────────────────────────────────────────────
const LS = {
  get: <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch { return fallback; }
  },
  set: <T,>(key: string, value: T): void => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { console.warn("LS full:", e); }
  },
};

export const genId  = () => Math.random().toString(36).slice(2, 9);
export const fmt$   = (n: number) => `$${Number(n).toFixed(2)}`;
export const fmtBs  = (n: number, rate: number) => `Bs. ${(Number(n) * rate).toFixed(2)}`;

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─── App Store hook ──────────────────────────────────────────────────────────
export function useAppStore() {
  // Arranca vacío — Supabase es la fuente de verdad
  // localStorage solo como caché de velocidad si ya existe
  const [products,  setProductsState]  = useState<Product[]>(() => LS.get("products", []));
  const [orders,    setOrdersState]    = useState<Order[]>(() => LS.get("orders", []));
  const [rate,      setRateState]      = useState<ExchangeRate>(() => LS.get("rate",    { value: 36.5,  mode: "custom" as const }));
  const [rateBCV,   setRateBCVState]   = useState<ExchangeRate>(() => LS.get("rateBCV", { value: 46.20, mode: "bcv"    as const }));
  const [cart,      setCart]           = useState<CartItem[]>([]);
  const [wishlist,  setWishlistState]  = useState<string[]>(() => LS.get("wishlist", []));
  const [design,    setDesignState]    = useState<DesignConfig>(() => LS.get("design", DEFAULT_DESIGN));
  const [banners,   setBannersState]   = useState<Banner[]>(() => LS.get("banners", DEFAULT_BANNERS));
  const [loading,   setLoading]        = useState(true);

  // ── Carga inicial desde Supabase ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Cargar todo en paralelo para máxima velocidad
        const [prods, ords, bans, r, rBCV, des] = await Promise.all([
          sbGetProducts(),
          sbGetOrders(),
          sbGetBanners(),
          sbGetRate(),
          sbGetRateBCV(),
          sbGetDesign(DEFAULT_DESIGN),
        ]);
        if (cancelled) return;

        // Siempre usar los datos de Supabase (fuente de verdad)
        // Si Supabase devuelve vacío, no sobrescribir con datos demo
        if (prods.length) { setProductsState(prods); LS.set("products", prods); }
        if (ords.length)  { setOrdersState(ords);    LS.set("orders",   ords);  }
        // Banners: siempre usar los de Supabase si existen
        if (bans.length) {
          const lightBans = bans.map(b => ({ ...b, imgBase64: "" }));
          setBannersState(bans);
          LS.set("banners", lightBans);
        }
        setRateState(r);       LS.set("rate",    r);
        setRateBCVState(rBCV); LS.set("rateBCV", rBCV);
        setDesignState(des);   LS.set("design",  des);
      } catch (e) {
        console.warn("[store] Supabase load failed, using localStorage cache:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Sync localStorage en cada cambio ─────────────────────────────────────
  useEffect(() => { LS.set("products", products); }, [products]);
  useEffect(() => { LS.set("orders",   orders);   }, [orders]);
  useEffect(() => { LS.set("rate",     rate);     }, [rate]);
  useEffect(() => { LS.set("rateBCV",  rateBCV);  }, [rateBCV]);
  useEffect(() => { LS.set("wishlist", wishlist); }, [wishlist]);
  useEffect(() => { LS.set("design",   design);   }, [design]);
  // Sync localStorage — banners sin base64 (demasiado pesado para LS)
  useEffect(() => {
    const lightBanners = banners.map(b => ({ ...b, imgBase64: "" }));
    LS.set("banners", lightBanners);
  }, [banners]);

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  const setProducts = useCallback((fn: (prev: Product[]) => Product[]) => {
    setProductsState(fn);
  }, []);

  const addProduct = useCallback(async (p: Omit<Product, "id">): Promise<Product> => {
    const localId  = genId();
    const newP     = { ...p, id: localId };
    setProductsState(prev => [...prev, newP]);       // optimistic update
    const saved = await sbAddProduct(p);
    if (saved) {
      // reemplaza el id local por el de Supabase
      setProductsState(prev => prev.map(x => x.id === localId ? saved : x));
      return saved;
    }
    return newP;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    await sbUpdateProduct(id, updates);
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProductsState(prev => prev.filter(p => p.id !== id));
    await sbDeleteProduct(id);
  }, []);

  // ── CART ─────────────────────────────────────────────────────────────────
  const addToCart = useCallback((p: Product) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      return ex
        ? c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...c, { id: p.id, name: p.name, price: p.price, qty: 1, img: p.img }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(c => c.filter(i => i.id !== id));
  }, []);

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCart(c =>
      c.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── ORDERS ────────────────────────────────────────────────────────────────
  const saveOrder = useCallback(async (
    orderData: Omit<Order, "id" | "date" | "status">
  ): Promise<Order> => {
    const o: Order = {
      ...orderData,
      id:     genId(),
      date:   new Date().toISOString(),
      status: "pending",
    };
    setOrdersState(prev => [o, ...prev]);
    setCart([]);
    await sbSaveOrder(o);
    return o;
  }, []);

  const updateOrderStatus = useCallback(async (
    id: string,
    status: Order["status"]
  ) => {
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    await sbUpdateOrderStatus(id, status);
  }, []);

  // ── WISHLIST ──────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback((id: string) => {
    setWishlistState(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  }, []);

  // ── RATES ─────────────────────────────────────────────────────────────────
  const setRate = useCallback(async (r: ExchangeRate) => {
    setRateState(r);
    await sbSetRate(r);
  }, []);

  const setRateBCV = useCallback(async (r: ExchangeRate) => {
    setRateBCVState(r);
    await sbSetRateBCV(r);
  }, []);

  // ── DESIGN ────────────────────────────────────────────────────────────────
  const setDesign = useCallback(async (d: DesignConfig) => {
    setDesignState(d);
    await sbSetDesign(d);
  }, []);

  // ── BANNERS ───────────────────────────────────────────────────────────────
  const updateBanner = useCallback(async (id: string, updates: Partial<Banner>) => {
    if (updates.imgBase64 && updates.imgBase64.startsWith("data:")) {
      try {
        const res  = await fetch(updates.imgBase64);
        const blob = await res.blob();
        const file = new File([blob], `banner-${id}-${Date.now()}.jpg`, { type: blob.type });
        const url  = await sbUploadImage(file, "banners");
        if (url) updates = { ...updates, img: url, imgBase64: "" };
      } catch (e) { console.warn("Error uploading banner image:", e); }
    }
    setBannersState(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    await sbUpdateBanner(id, updates);
  }, []);

  const setBanners = useCallback((fn: (prev: Banner[]) => Banner[]) => {
    setBannersState(prev => {
      const next = fn(prev);
      // Detectar banners añadidos
      const addedBanners = next.filter(b => !prev.find(p => p.id === b.id));
      addedBanners.forEach(b => sbInsertBanner(b));
      // Detectar banners eliminados
      const deletedIds = prev.filter(b => !next.find(n => n.id === b.id)).map(b => b.id);
      deletedIds.forEach(id => sbDeleteBanner(id));
      return next;
    });
  }, []);

  return {
    // estado
    products, orders, rate, rateBCV, cart, wishlist, design, banners,
    cartTotal, cartCount, loading,
    // productos
    setProducts, addProduct, updateProduct, deleteProduct,
    // carrito
    addToCart, removeFromCart, updateCartQty, clearCart,
    // pedidos
    saveOrder, updateOrderStatus,
    // wishlist
    toggleWishlist,
    // tasas
    setRate, setRateBCV,
    // diseño
    setDesign,
    // banners
    setBanners, updateBanner,
  };
}
