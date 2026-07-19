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

export async function sbGetOrderById(id: string): Promise<Order | null> {
  const sb = createClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return dbToOrder(data as Record<string, unknown>);
}

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
  status: "pending" | "processed" | "cancelled",
  cancelReason?: string
): Promise<boolean> {
  const sb = createClient();
  const updates: Record<string, unknown> = { status };
  if (cancelReason) updates.cancel_reason = cancelReason;
  const { error } = await sb.from("orders").update(updates).eq("id", id);
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
  // Solo enviar columnas base que siempre existen en la tabla
  const base: Record<string, unknown> = {};
  if (updates.tag          !== undefined) base.tag            = updates.tag;
  if (updates.title        !== undefined) base.title          = updates.title;
  if (updates.subtitle     !== undefined) base.subtitle       = updates.subtitle;
  if (updates.cta          !== undefined) base.cta            = updates.cta;
  if (updates.bgColor      !== undefined) base.bg_color       = updates.bgColor;
  if (updates.accentColor  !== undefined) base.accent_color   = updates.accentColor;
  if (updates.textColor    !== undefined) base.text_color     = updates.textColor;
  if (updates.btnColor     !== undefined) base.btn_color      = updates.btnColor;
  if (updates.btnTextColor !== undefined) base.btn_text_color = updates.btnTextColor;
  if (updates.img          !== undefined) base.img            = updates.img;
  if (updates.order        !== undefined) base.order_index    = updates.order;

  // Columnas extendidas (pueden no existir si no se corrió la migración)
  const extended: Record<string, unknown> = {};
  if (updates.active       !== undefined) extended.active         = updates.active;
  if (updates.showTag      !== undefined) extended.show_tag       = updates.showTag;
  if (updates.showTitle    !== undefined) extended.show_title     = updates.showTitle;
  if (updates.showSubtitle !== undefined) extended.show_subtitle  = updates.showSubtitle;
  if (updates.showCta      !== undefined) extended.show_cta       = updates.showCta;
  if (updates.ctaUrl       !== undefined) extended.cta_url        = updates.ctaUrl;
  if (updates.contentX     !== undefined) extended.content_x      = updates.contentX;
  if (updates.contentY     !== undefined) extended.content_y      = updates.contentY;
  if (updates.titleSize    !== undefined) extended.title_size     = updates.titleSize;
  if (updates.subtitleSize !== undefined) extended.subtitle_size  = updates.subtitleSize;
  if (updates.btnSize      !== undefined) extended.btn_size       = updates.btnSize;
  if (updates.btnPaddingX  !== undefined) extended.btn_padding_x  = updates.btnPaddingX;
  if (updates.btnPaddingY  !== undefined) extended.btn_padding_y  = updates.btnPaddingY;
  if (updates.btnRadius    !== undefined) extended.btn_radius     = updates.btnRadius;

  // Primero actualizar columnas base (siempre funcionan)
  const { error: baseErr } = await sb.from("banners").update(base).eq("id", id);
  if (baseErr) { console.error("[sbUpdateBanner base]", baseErr.message); return false; }

  // Luego intentar columnas extendidas (falla silenciosamente si no existen)
  if (Object.keys(extended).length > 0) {
    const { error: extErr } = await sb.from("banners").update(extended).eq("id", id);
    if (extErr) console.warn("[sbUpdateBanner extended - run banner_migration_v3.sql]", extErr.message);
  }

  return true;
}

export async function sbInsertBanner(banner: Banner): Promise<boolean> {
  const sb = createClient();
  const base = {
    id:            banner.id,
    tag:           banner.tag,
    title:         banner.title,
    subtitle:      banner.subtitle,
    cta:           banner.cta,
    bg_color:      banner.bgColor,
    accent_color:  banner.accentColor,
    text_color:    banner.textColor,
    btn_color:     banner.btnColor,
    btn_text_color:banner.btnTextColor,
    img:           banner.img || "",
    order_index:   banner.order ?? 0,
  };
  const { error } = await sb.from("banners").insert([base]);
  if (error) { console.error("[sbInsertBanner]", error.message); return false; }
  // Update extended columns separately
  await sbUpdateBanner(banner.id, banner);
  return true;
}

export async function sbDeleteBanner(id: string): Promise<boolean> {
  const sb = createClient();
  const { error } = await sb.from("banners").delete().eq("id", id);
  if (error) { console.error("[sbDeleteBanner]", error.message); return false; }
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
/**
 * Redimensiona/comprime una imagen en el navegador antes de subirla.
 * Baja drásticamente el peso (y por tanto el tiempo de subida) sin
 * afectar la calidad visible, incluso con zoom.
 */
async function compressImage(file: File, maxDim = 1800, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale  = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file; // si no mejora, usa el original
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file; // si algo falla, sube el original en vez de romper la subida
  }
}

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
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from("images").upload(path, compressed, {
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
    specSheet: row.spec_sheet != null ? String(row.spec_sheet) : undefined,
  };
}

function productToDb(p: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.name      !== undefined) out.name      = p.name;
  if (p.category  !== undefined) out.category  = p.category;
  if (p.desc      !== undefined) out.desc      = p.desc;
  if (p.price     !== undefined) out.price     = p.price;
  if (p.stock     !== undefined) out.stock     = p.stock;
  if (p.badge     !== undefined) out.badge     = p.badge;
  if (p.images    !== undefined) out.images    = p.images;
  if (p.img       !== undefined) out.img       = p.img;
  if (p.specSheet !== undefined) out.spec_sheet = p.specSheet;
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
    contentX:     (row.content_x as 'left'|'center'|'right') ?? 'left',
    contentY:     (row.content_y as 'top'|'center'|'bottom') ?? 'center',
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
  if (b.contentX    !== undefined) out.content_x      = b.contentX;
  if (b.contentY    !== undefined) out.content_y      = b.contentY;
  if (b.titleSize    !== undefined) out.title_size     = b.titleSize;
  if (b.subtitleSize !== undefined) out.subtitle_size  = b.subtitleSize;
  if (b.btnSize      !== undefined) out.btn_size       = b.btnSize;
  if (b.btnPaddingX  !== undefined) out.btn_padding_x  = b.btnPaddingX;
  if (b.btnPaddingY  !== undefined) out.btn_padding_y  = b.btnPaddingY;
  if (b.btnRadius    !== undefined) out.btn_radius     = b.btnRadius;
  return out;
}
