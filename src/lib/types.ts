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
  bgColor: string;
  accentColor: string;
  textColor: string;
  btnColor: string;
  btnTextColor: string;
  img: string;
  imgBase64?: string;
  order?: number;
  active: boolean;          // nuevo: ocultar/mostrar
  titleSize?: number;       // nuevo: tamaño fuente título (px)
  subtitleSize?: number;    // nuevo: tamaño fuente subtítulo (px)
  btnSize?: number;         // nuevo: tamaño fuente botón (px)
  btnPaddingX?: number;     // nuevo: padding horizontal botón
  btnPaddingY?: number;     // nuevo: padding vertical botón
  btnRadius?: number;       // nuevo: border-radius botón
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
  tickerItems: string[];    // nuevo: textos barra negra
  trustItems: TrustItem[];  // nuevo: textos barra blanca
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  active: boolean;
}

export interface TrustItem {
  id: string;
  icon: string;   // emoji o nombre de icono
  text: string;
  active: boolean;
}
