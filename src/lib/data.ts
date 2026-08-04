import type { Product, Banner, DesignConfig, PaymentMethod } from "./types";

export const DEFAULT_CATEGORIES = ["Aceites","Bebidas","Dulces","Frutos","Pastas","Pastillas","Suplementos"];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id:"pm1", name:"Pago Móvil",    details:"Banco: Banesco\nNúmero: 0414-1013137\nCédula: V-12345678\nNombre: Anthony Rivera", active:true, needsReceipt:true  },
  { id:"pm2", name:"Zelle",         details:"Email: pagos@fit58.com\nNombre: Fit +58 Caracas",                                  active:true, needsReceipt:true  },
  { id:"pm3", name:"Binance",       details:"UID: 123456789\nMoneda: USDT (TRC20)",                                             active:true, needsReceipt:true  },
  { id:"pm4", name:"Efectivo (USD)",details:"Coordinar entrega con pago en mano",                                              active:true, needsReceipt:false },
  { id:"pm5", name:"Efectivo (Bs)", details:"Coordinar entrega con pago en mano",                                              active:true, needsReceipt:false },
];

export const DEFAULT_TICKER_ITEMS = [
  "✦ Envío gratis en pedidos mayores a $30",
  "✦ Productos 100% importados y certificados",
  "✦ Atención vía WhatsApp · Lun–Sáb 8am–6pm",
  "✦ Nuevos productos cada semana",
  "✦ Garantía de frescura en cada entrega",
];

export const DEFAULT_TRUST_ITEMS = [
  { id:"t1", icon:"award",  text:"Calidad certificada",    active:true },
  { id:"t2", icon:"globe",  text:"Importado directamente", active:true },
  { id:"t3", icon:"truck",  text:"Entrega a domicilio",    active:true },
  { id:"t4", icon:"shield", text:"Garantía de frescura",   active:true },
];

export const SAMPLE_PRODUCTS: Product[] = [
  { id:"p1", name:"Aceite de Oliva Extra Virgen", category:"Aceites",
    desc:"500ml · Prensado en frío · Cosecha selecta · DO Jaén",
    price:8.50, stock:48, badge:"BESTSELLER",
    images:["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90" },
  { id:"p2", name:"Café Gourmet Molido", category:"Bebidas",
    desc:"250g · Tueste artesanal · Origen único · Aroma intenso",
    price:6.00, stock:30, badge:"NUEVO",
    images:["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90" },
];

export const DEFAULT_BANNERS: Banner[] = [
  { id:"b1", active:true, tag:"NUEVO INGRESO", title:"Fit +58\nCaracas",
    subtitle:"Suplementos y productos importados de calidad", cta:"VER CATÁLOGO",
    bgColor:"#f0f4e8", accentColor:"#5a8a00", textColor:"#111111", btnColor:"#111111", btnTextColor:"#ffffff",
    img:"", titleSize:64, subtitleSize:14, btnSize:11, btnPaddingX:24, btnPaddingY:12, btnRadius:10,
    contentX:"left", contentY:"center", ctaUrl:"#tienda",
    showTag:true, showTitle:true, showSubtitle:true, showCta:true },
];

export const DEFAULT_DESIGN: DesignConfig = {
  primaryColor:"#111111", secondaryColor:"#22a85a", bgColor:"#f5f5f5",
  textColor:"#111111", accentColor:"#3b82f6", fontFamily:"Inter",
  logoUrl:"", logoBase64:"", bannerUrl:"", bannerBase64:"",
  heroTitle:"Fit +58 Caracas", heroSubtitle:"Tu tienda de confianza",
  ctaText:"VER CATÁLOGO", brandName:"FIT +58", brandSub:"CARACAS",
  navLinks:[
    { id:"n1", label:"Inicio",         url:"#inicio",         active:true },
    { id:"n2", label:"Tienda",         url:"#tienda",         active:true },
    { id:"n3", label:"Especificaciones",url:"#especificaciones",active:true },
    { id:"n4", label:"Reseñas",        url:"#resenas",        active:true },
  ],
  tickerItems: [...DEFAULT_TICKER_ITEMS],
  trustItems:  [...DEFAULT_TRUST_ITEMS],
  categories:  [...DEFAULT_CATEGORIES],
  paymentMethods: [...DEFAULT_PAYMENT_METHODS],
  whatsappNumber: "584141013137",
};
