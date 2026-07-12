export interface Product {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: number;
  stock: number;
  badge?: string | null;
  images: string[];
  img: string;
  createdAt?: string;
}

export interface Banner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaUrl?: string;          // URL/ancla a la que lleva el botón CTA
  bgColor: string;
  accentColor: string;
  textColor: string;
  btnColor: string;
  btnTextColor: string;
  img: string;
  imgBase64?: string;
  order?: number;
  active: boolean;
  // Visibilidad de campos
  showTag?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showCta?: boolean;
  // Tamaños
  titleSize?: number;
  subtitleSize?: number;
  btnSize?: number;
  btnPaddingX?: number;
  btnPaddingY?: number;
  btnRadius?: number;
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
  tickerItems: string[];
  trustItems: TrustItem[];
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  active: boolean;
}

export interface TrustItem {
  id: string;
  icon: string;
  text: string;
  active: boolean;
}
