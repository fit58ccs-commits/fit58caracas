// ─── Data Models ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: number;
  stock: number;
  badge?: string | null;
  images: string[];   // max 3
  img: string;        // = images[0], for backwards compat
  createdAt?: string;
}

export interface Banner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  btnColor: string;
  btnTextColor: string;
  img: string;
  imgBase64?: string;
  order?: number;
}

export interface Order {
  id: string;
  date: string;
  status: "pending" | "processed";
  total: number;
  cart: CartItem[];
  form: OrderForm;
  mapsLink?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export interface OrderForm {
  name: string;
  phone: string;
  time: string;
  address: string;
  method: string;
  receipt?: string | null;
}

/** rate      = tasa de precios (Binance/paralelo) — calcula Bs. en productos, SOLO admin la ve */
/** rateBCV   = tasa BCV/Euro  — solo informativa en catálogo cliente, NO calcula precios       */
export interface ExchangeRate {
  value: number;
  mode: "bcv" | "euro" | "custom";
}

export interface DesignConfig {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
  logoBase64: string;
  bannerUrl: string;
  bannerBase64: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  brandName: string;
  brandSub: string;
  navLinks: NavLink[];
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  active: boolean;
}
