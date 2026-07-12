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
  specSheet?: string;   // URL imagen ficha técnica
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  author: string;
  rating: number;       // 1-5
  comment: string;
  serviceRating?: number;
  date: string;
  approved: boolean;
}

export interface Banner {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaUrl?: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  btnColor: string;
  btnTextColor: string;
  img: string;
  imgBase64?: string;
  order?: number;
  active: boolean;
  showTag?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showCta?: boolean;
  contentX?: "left" | "center" | "right";
  contentY?: "top" | "center" | "bottom";
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
  status: "pending" | "processed" | "cancelled";
  total: number;
  cart: CartItem[];
  form: OrderForm;
  mapsLink?: string;
  cancelReason?: string;
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
  lat?: number;
  lng?: number;
}

export interface ExchangeRate {
  value: number;
  mode: "bcv" | "euro" | "custom";
}

export interface PaymentMethod {
  id: string;
  name: string;          // "Pago Móvil", "Zelle", etc.
  details: string;       // Datos bancarios / número / usuario
  active: boolean;
  needsReceipt: boolean; // Si requiere comprobante
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
  categories: string[];          // Categorías editables
  paymentMethods: PaymentMethod[]; // Métodos de pago con datos
  whatsappNumber: string;        // Número WhatsApp del negocio
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
