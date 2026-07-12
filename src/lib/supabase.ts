/**
 * supabase.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Capa de servicio entre la app y Supabase.
 * Todas las operaciones de base de datos pasan por aquí.
 *
 * TABLAS EN SUPABASE (crear con el SQL de SETUP.md):
 *   products  → catálogo de productos
 *   orders    → pedidos de clientes
 *   banners   → banners del hero
 *   settings  → tasas de cambio y configuración de diseño
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@/app/utils/supabase/client";
import type { Product, Banner, Order, ExchangeRate, DesignConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

export async function sbGetProducts(): Promise<Product[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[sbGetProducts]", error.message); return []; }
  return (data ?? []).map(dbToProduct);
}

export async function sbAddProduct(p: Omit<Product, "id">): Promise<Product | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("products")
    .insert([productToDb(p)])
    .select()
    .single();
  if (error) { console.error("[sbAddProduct]", error.message); return null; }
  return dbToProduct(data);
}

export async function sbUpdateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb
    .from("products")
    .update(productToDb(updates as Product))
    .eq("id", id);
  if (error) { console.error("[sbUpdateProduct]", error.message); return false; }
  return true;
}

export async function sbDeleteProduct(id: string): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) { console.error("[sbDeleteProduct]", error.message); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function sbGetOrders(): Promise<Order[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("date", { ascending: false });
  if (error) { console.error("[sbGetOrders]", error.message); return []; }
  return (data ?? []).map(dbToOrder);
}

export async function sbSaveOrder(order: Order): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb.from("orders").insert([orderToDb(order)]);
  if (error) { console.error("[sbSaveOrder]", error.message); return false; }
  return true;
}

export async function sbUpdateOrderStatus(
  id: string,
  status: "pending" | "processed"
): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) { console.error("[sbUpdateOrderStatus]", error.message); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNERS
// ─────────────────────────────────────────────────────────────────────────────

export async function sbGetBanners(): Promise<Banner[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("banners")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) { console.error("[sbGetBanners]", error.message); return []; }
  return (data ?? []).map(dbToBanner);
}

export async function sbUpdateBanner(id: string, updates: Partial<Banner>): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb
    .from("banners")
    .update(bannerToDb(updates as Banner))
    .eq("id", id);
  if (error) { console.error("[sbUpdateBanner]", error.message); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS (tasas + diseño)
// ─────────────────────────────────────────────────────────────────────────────

export async function sbGetSetting<T>(key: string, fallback: T): Promise<T> {
  const sb = createClient();
  const { data, error } = await sb
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  if (error || !data) return fallback;
  try { return JSON.parse(data.value) as T; } catch { return fallback; }
}

export async function sbSetSetting(key: string, value: unknown): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb
    .from("settings")
    .upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });
  if (error) { console.error("[sbSetSetting]", error.message); return false; }
  return true;
}

// Helpers de tasa
export const sbGetRate    = () => sbGetSetting<ExchangeRate>("rate",    { value: 36.5,  mode: "custom" });
export const sbGetRateBCV = () => sbGetSetting<ExchangeRate>("rateBCV", { value: 46.20, mode: "bcv"   });
export const sbSetRate    = (r: ExchangeRate) => sbSetSetting("rate",    r);
export const sbSetRateBCV = (r: ExchangeRate) => sbSetSetting("rateBCV", r);

// Helpers de diseño
export const sbGetDesign  = (fallback: DesignConfig) => sbGetSetting<DesignConfig>("design", fallback);
export const sbSetDesign  = (d: DesignConfig)        => sbSetSetting("design", d);

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE — subir imágenes al bucket de Supabase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube un archivo al bucket "images" de Supabase Storage.
 * Devuelve la URL pública o null si falla.
 *
 * Uso:
 *   const url = await sbUploadImage(file, "products");
 *   // url → "https://xxx.supabase.co/storage/v1/object/public/images/products/uuid.jpg"
 */
export async function sbUploadImage(
  file: File,
  folder: "products" | "banners" | "logos" = "products"
): Promise<string | null> {
  const sb  = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from("images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) { console.error("[sbUploadImage]", error.message); return null; }

  const { data } = sb.storage.from("images").getPublicUrl(path);
  return data.publicUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row ↔ Type mappers
// (Supabase usa snake_case; la app usa camelCase)
// ─────────────────────────────────────────────────────────────────────────────

function dbToProduct(row: Record<string, unknown>): Product {
  return {
    id:       String(row.id),
    name:     String(row.name     ?? ""),
    category: String(row.category ?? ""),
    desc:     String(row["desc"]   ?? ""),
    price:    Number(row.price    ?? 0),
    stock:    Number(row.stock    ?? 0),
    badge:    row.badge != null ? String(row.badge) : null,
    images:   Array.isArray(row.images) ? row.images as string[] : [],
    img:      String(row.img      ?? ""),
  };
}

function productToDb(p: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.name      !== undefined) out.name      = p.name;
  if (p.category  !== undefined) out.category  = p.category;
  if (p.desc      !== undefined) out['"desc"']  = p.desc;
  if (p.price     !== undefined) out.price     = p.price;
  if (p.stock     !== undefined) out.stock     = p.stock;
  if (p.badge     !== undefined) out.badge     = p.badge;
  if (p.images    !== undefined) out.images    = p.images;
  if (p.img       !== undefined) out.img       = p.img;
  return out;
}

function dbToOrder(row: Record<string, unknown>): Order {
  return {
    id:       String(row.id),
    date:     String(row.date    ?? ""),
    status:   (row.status as "pending" | "processed") ?? "pending",
    total:    Number(row.total   ?? 0),
    cart:     Array.isArray(row.cart) ? row.cart as Order["cart"] : [],
    form:     (row.form as Order["form"]) ?? { name:"", phone:"", time:"", address:"", method:"" },
    mapsLink: row.maps_link ? String(row.maps_link) : undefined,
  };
}

function orderToDb(o: Order): Record<string, unknown> {
  return {
    id:         o.id,
    date:       o.date,
    status:     o.status,
    total:      o.total,
    cart:       o.cart,
    form:       o.form,
    maps_link:  o.mapsLink ?? null,
  };
}

function dbToBanner(row: Record<string, unknown>): Banner {
  return {
    id:           String(row.id),
    tag:          String(row.tag          ?? ""),
    title:        String(row.title ?? "").replace(/\n/g, "\n"),
    subtitle:     String(row.subtitle     ?? ""),
    cta:          String(row.cta          ?? ""),
    ctaUrl:       row.cta_url ? String(row.cta_url) : "#tienda",
    bgColor:      String(row.bg_color     ?? "#f0f4e8"),
    accentColor:  String(row.accent_color ?? "#5a8a00"),
    textColor:    String(row.text_color   ?? "#111111"),
    btnColor:     String(row.btn_color    ?? "#111111"),
    btnTextColor: String(row.btn_text_color ?? "#ffffff"),
    img:          String(row.img          ?? ""),
    order:        Number(row.order_index  ?? 0),
    active:       row.active !== false,
    showTag:      row.show_tag      !== false,
    showTitle:    row.show_title    !== false,
    showSubtitle: row.show_subtitle !== false,
    showCta:      row.show_cta      !== false,
    titleSize:    Number(row.title_size    ?? 64),
    subtitleSize: Number(row.subtitle_size ?? 14),
    btnSize:      Number(row.btn_size      ?? 11),
    btnPaddingX:  Number(row.btn_padding_x ?? 24),
    btnPaddingY:  Number(row.btn_padding_y ?? 12),
    btnRadius:    Number(row.btn_radius    ?? 10),
  };
}

function bannerToDb(b: Partial<Banner>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (b.tag          !== undefined) out.tag            = b.tag;
  if (b.title        !== undefined) out.title          = b.title;
  if (b.subtitle     !== undefined) out.subtitle       = b.subtitle;
  if (b.cta          !== undefined) out.cta            = b.cta;
  if (b.ctaUrl       !== undefined) out.cta_url        = b.ctaUrl;
  if (b.bgColor      !== undefined) out.bg_color       = b.bgColor;
  if (b.accentColor  !== undefined) out.accent_color   = b.accentColor;
  if (b.textColor    !== undefined) out.text_color     = b.textColor;
  if (b.btnColor     !== undefined) out.btn_color      = b.btnColor;
  if (b.btnTextColor !== undefined) out.btn_text_color = b.btnTextColor;
  if (b.img          !== undefined) out.img            = b.img;
  if (b.imgBase64    !== undefined) out.img_base64     = b.imgBase64;
  if (b.order        !== undefined) out.order_index    = b.order;
  if (b.active       !== undefined) out.active         = b.active;
  if (b.showTag      !== undefined) out.show_tag       = b.showTag;
  if (b.showTitle    !== undefined) out.show_title     = b.showTitle;
  if (b.showSubtitle !== undefined) out.show_subtitle  = b.showSubtitle;
  if (b.showCta      !== undefined) out.show_cta       = b.showCta;
  if (b.titleSize    !== undefined) out.title_size     = b.titleSize;
  if (b.subtitleSize !== undefined) out.subtitle_size  = b.subtitleSize;
  if (b.btnSize      !== undefined) out.btn_size       = b.btnSize;
  if (b.btnPaddingX  !== undefined) out.btn_padding_x  = b.btnPaddingX;
  if (b.btnPaddingY  !== undefined) out.btn_padding_y  = b.btnPaddingY;
  if (b.btnRadius    !== undefined) out.btn_radius     = b.btnRadius;
  return out;
}
