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

export interface PaymentEntry {
  method:  string;
  amount:  number;         // monto pagado con este método
  receipt?: string | null; // base64 o nombre del comprobante
}

export interface OrderForm {
  name:     string;
  phone:    string;
  time:     string;
  address:  string;
  method:   string;        // método principal (backwards compat)
  receipt?: string | null;
  lat?:     number;
  lng?:     number;
  payments?: PaymentEntry[]; // pagos combinados
  totalPaid?: number;
  balance?:   number;
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
  copyFields?: string[]; // Qué líneas incluir al copiar (vacío = todas)
  amountCurrency?: "EUR" | "BS"; // Moneda del monto en el texto copiado
}

export interface EditorialConfig {
  taglineMain?: string;       // legacy plain text (backward compat)
  taglineEmphasis?: string;   // legacy
  taglineEnd?: string;        // legacy
  taglineDesc?: string;       // legacy plain text
  taglineHtml?: string;       // HTML enriquecido del titular
  taglineDescHtml?: string;   // HTML enriquecido de la descripcion
  taglineVisible?: boolean;
  taglineFontSize?: number;   // px, clamp base mobile
  taglineColor?: string;
  taglineDescColor?: string;
  taglineFontFamily?: string;
  taglineBg?: string;

  watermarkText?: string;
  watermarkVisible?: boolean;
  watermarkColor?: string;    // rgba completo
  watermarkOpacity?: number;  // 0-100
  watermarkFontSize?: number; // px base mobile
  watermarkBg?: string;
}

export interface CardTypography {
  // Categoría (texto pequeño arriba del nombre)
  categoryFont?:   string;  // fuente
  categorySize?:   number;  // px
  categoryColor?:  string;
  categoryWeight?: string;  // "400"|"600"|"700"|"900"

  // Nombre del producto
  nameFont?:   string;
  nameSize?:   number;
  nameColor?:  string;
  nameWeight?: string;

  // Precio principal (€)
  priceFont?:   string;
  priceSize?:   number;
  priceColor?:  string;
  priceWeight?: string;

  // Precio Bs
  priceBsFont?:   string;
  priceBsSize?:   number;
  priceBsColor?:  string;
  priceBsWeight?: string;

  // Botón agregar
  btnFont?:       string;
  btnSize?:       number;
  btnRadius?:     number;  // px border-radius
  btnBg?:         string;  // color fondo inactivo
  btnColor?:      string;  // color texto inactivo
  btnActiveBg?:   string;  // fondo cuando está en carrito
  btnActiveColor?: string; // texto cuando está en carrito

  // Tarjeta general
  cardRadius?:    number;  // border-radius de la tarjeta
  cardBg?:        string;
  cardBorder?:    string;
  imgHeight?:     number;  // altura zona imagen px
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
  editorial?: EditorialConfig;   // Divisor + watermark editable
  cardTypography?: CardTypography; // Tipografia de tarjetas de producto
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  active: boolean;
}

export interface Referral {
  id: string;
  code: string;          // código único del referidor (ej: "FIT-JUAN58")
  ownerName: string;     // nombre del cliente que refirió
  ownerPhone: string;    // teléfono para identificarlo
  uses: number;          // cuántas veces fue usado
  discount: number;      // % de descuento que genera (ej: 5)
  createdAt: string;
  active: boolean;
}

export interface TrustItem {
  id: string;
  icon: string;
  text: string;
  active: boolean;
}


