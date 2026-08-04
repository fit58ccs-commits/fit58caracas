"use client";
/**
 * store.ts — Estado global de la app
 * FIX: React Error #418 — Hydration mismatch
 * Los useState initializers NO pueden leer localStorage porque el servidor
 * no tiene window. Solución: iniciar con valores vacíos/default y cargar
 * desde localStorage en un useEffect separado (solo en cliente).
 */
import { useState, useEffect, useCallback } from "react";
import type { Product, Banner, Order, ExchangeRate, DesignConfig, CartItem, Review } from "./types";
import type { Purchase } from "@/components/admin/PurchasesManager";
import { SAMPLE_PRODUCTS, DEFAULT_BANNERS, DEFAULT_DESIGN } from "./data";
import {
  sbGetProducts, sbAddProduct, sbUpdateProduct, sbDeleteProduct,
  sbGetOrders, sbSaveOrder, sbUpdateOrderStatus,
  sbGetBanners, sbUpdateBanner, sbInsertBanner, sbDeleteBanner,
  sbGetRate, sbGetRateBCV, sbSetRate, sbSetRateBCV,
  sbGetDesign, sbSetDesign,
  sbUploadImage,
} from "./supabase";

// ─── Re-export ───────────────────────────────────────────────────────────────
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
export const fmt$   = (n: number) => `€${Number(n).toFixed(2)}`;
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
  // FIX #418: NUNCA leer localStorage en el initializer de useState.
  // Siempre arrancar con valores vacíos/default (igual en server y client).
  // localStorage se carga en useEffect (solo corre en el cliente).
  const [products,  setProductsState]  = useState<Product[]>([]);
  const [orders,    setOrdersState]    = useState<Order[]>([]);
  const [rate,      setRateState]      = useState<ExchangeRate>({ value: 36.5,  mode: "custom" as const });
  const [rateBCV,   setRateBCVState]   = useState<ExchangeRate>({ value: 46.20, mode: "bcv"    as const });
  const [cart,      setCart]           = useState<CartItem[]>([]);
  const [wishlist,  setWishlistState]  = useState<string[]>([]);
  const [design,    setDesignState]    = useState<DesignConfig>(DEFAULT_DESIGN);
  const [banners,   setBannersState]   = useState<Banner[]>(DEFAULT_BANNERS);
  const [reviews,   setReviewsState]   = useState<Review[]>([]);
  const [purchases, setPurchasesState] = useState<Purchase[]>([]);
  const [loading,   setLoading]        = useState(true);

  // ── Paso 1: Cargar localStorage en el cliente (hydration-safe) ────────────
  useEffect(() => {
    const lsProducts  = LS.get<Product[]>("products",  []);
    const lsOrders    = LS.get<Order[]>("orders",    []);
    const lsRate      = LS.get<ExchangeRate>("rate",    { value: 36.5,  mode: "custom" as const });
    const lsRateBCV   = LS.get<ExchangeRate>("rateBCV", { value: 46.20, mode: "bcv"    as const });
    const lsWishlist  = LS.get<string[]>("wishlist", []);
    const lsDesign    = LS.get<DesignConfig>("design",  DEFAULT_DESIGN);
    const lsBanners   = LS.get<Banner[]>("banners",  DEFAULT_BANNERS);
    const lsReviews   = LS.get<Review[]>("reviews",  []);
    const lsPurchases = LS.get<Purchase[]>("purchases", []);

    if (lsProducts.length)  setProductsState(lsProducts);
    if (lsOrders.length)    setOrdersState(lsOrders);
    setRateState(lsRate);
    setRateBCVState(lsRateBCV);
    if (lsWishlist.length)  setWishlistState(lsWishlist);
    setDesignState(lsDesign);
    if (lsBanners.length)   setBannersState(lsBanners);
    if (lsReviews.length)   setReviewsState(lsReviews);
    if (lsPurchases.length) setPurchasesState(lsPurchases);
  }, []);

  // ── Paso 2: Cargar desde Supabase (fuente de verdad) ─────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prods, ords, bans, r, rBCV, des] = await Promise.all([
          sbGetProducts(),
          sbGetOrders(),
          sbGetBanners(),
          sbGetRate(),
          sbGetRateBCV(),
          sbGetDesign(DEFAULT_DESIGN),
        ]);
        if (cancelled) return;

        if (prods.length) { setProductsState(prods); LS.set("products", prods); }
        if (ords.length)  { setOrdersState(ords);    LS.set("orders",   ords);  }
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
  useEffect(() => {
    const lightBanners = banners.map(b => ({ ...b, imgBase64: "" }));
    LS.set("banners", lightBanners);
  }, [banners]);
  useEffect(() => { LS.set("reviews",   reviews);   }, [reviews]);
  useEffect(() => { LS.set("purchases", purchases); }, [purchases]);

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  const setProducts = useCallback((fn: (prev: Product[]) => Product[]) => {
    setProductsState(fn);
  }, []);

  const addProduct = useCallback(async (p: Omit<Product, "id">): Promise<Product> => {
    const localId  = genId();
    const newP     = { ...p, id: localId };
    setProductsState(prev => [...prev, newP]);
    const saved = await sbAddProduct(p);
    if (saved) {
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
    status: Order["status"],
    cancelReason?: string
  ) => {
    setOrdersState(prev => prev.map(o => o.id === id ? { ...o, status, ...(cancelReason ? { cancelReason } : {}) } : o));
    await sbUpdateOrderStatus(id, status, cancelReason);
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrdersState(prev => prev.filter(o => o.id !== id));
  }, []);

  // ── EXPORT PEDIDOS A EXCEL ────────────────────────────────────────────────
  const exportOrdersToExcel = useCallback(async () => {
    const XLSX = await import("xlsx");
    const rows = [
      ["#","Fecha","Cliente","Teléfono","Dirección","Productos","Total (€)","Total Bs.","Método","Estado"],
      ...orders.map(o => [
        o.id,
        new Date(o.date).toLocaleString("es-VE"),
        o.form?.name || "",
        o.form?.phone || "",
        o.form?.address || "",
        (o.cart||[]).map(i=>`${i.name} ×${i.qty}`).join(" | "),
        o.total.toFixed(2),
        (o.total * 36.5).toFixed(2),
        o.form?.method || "",
        o.status === "pending" ? "PENDIENTE" : o.status === "processed" ? "PROCESADO" : "ANULADO",
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{wch:12},{wch:18},{wch:20},{wch:14},{wch:28},{wch:40},{wch:10},{wch:14},{wch:16},{wch:12}];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    XLSX.writeFile(wb, `Pedidos_Fit58_${new Date().toLocaleDateString("es-VE").replace(/\//g,"-")}.xlsx`);
  }, [orders]);

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

  const addPurchase = useCallback((p: Purchase) => {
    setPurchasesState(prev => [p, ...prev]);
  }, []);

  const deletePurchase = useCallback((id: string) => {
    setPurchasesState(prev => prev.filter(p => p.id !== id));
  }, []);

  const addReview = useCallback((r: Omit<Review, "id" | "date" | "approved">) => {
    const newR: Review = { ...r, id: genId(), date: new Date().toISOString(), approved: false };
    setReviewsState(prev => [newR, ...prev]);
  }, []);

  const approveReview = useCallback((id: string) => {
    setReviewsState(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  }, []);

  const rejectReview = useCallback((id: string) => {
    setReviewsState(prev => prev.filter(r => r.id !== id));
  }, []);

  const deleteReview = useCallback((id: string) => {
    setReviewsState(prev => prev.filter(r => r.id !== id));
  }, []);

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
      const addedBanners = next.filter(b => !prev.find(p => p.id === b.id));
      addedBanners.forEach(b => sbInsertBanner(b));
      const deletedIds = prev.filter(b => !next.find(n => n.id === b.id)).map(b => b.id);
      deletedIds.forEach(id => sbDeleteBanner(id));
      return next;
    });
  }, []);

  return {
    products, orders, rate, rateBCV, cart, wishlist, design, banners, reviews, purchases,
    cartTotal, cartCount, loading,
    setProducts, addProduct, updateProduct, deleteProduct,
    addToCart, removeFromCart, updateCartQty, clearCart,
    saveOrder, updateOrderStatus, deleteOrder, exportOrdersToExcel,
    toggleWishlist,
    setRate, setRateBCV,
    setDesign,
    addPurchase, deletePurchase,
    addReview, approveReview, rejectReview, deleteReview,
    setBanners, updateBanner,
  };
}
