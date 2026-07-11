import type { Product, Banner, DesignConfig } from "./types";

export const CATEGORIES      = ["Todos","Aceites","Bebidas","Dulces","Frutos","Pastas"];
export const PAYMENT_METHODS = ["Efectivo (USD)","Pago Móvil","Zelle","PayPal","Efectivo (Bs.)"];

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
    images:["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90","https://images.unsplash.com/photo-1601170714861-72b8118d5d6c?w=600&q=90","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=90" },
  { id:"p2", name:"Café Gourmet Molido", category:"Bebidas",
    desc:"250g · Tueste artesanal · Origen único · Aroma intenso",
    price:6.00, stock:30, badge:"NUEVO",
    images:["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=90" },
  { id:"p3", name:"Miel Pura de Abeja", category:"Dulces",
    desc:"350g · Recolección natural · Sin conservantes · Cruda",
    price:7.25, stock:5, badge:"BAJO STOCK",
    images:["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=90" },
  { id:"p4", name:"Almendras Premium", category:"Frutos",
    desc:"200g · Tostadas lentamente · Sin sal · Importadas de España",
    price:9.00, stock:15, badge:"PREMIUM",
    images:["https://images.unsplash.com/photo-1541558869434-2840d308329a?w=600&q=90","https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1541558869434-2840d308329a?w=600&q=90" },
  { id:"p5", name:"Pasta Artesanal Italiana", category:"Pastas",
    desc:"500g · Sémola de trigo duro · Secado lento · Bronce",
    price:4.50, stock:60, badge:null,
    images:["https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=90" },
  { id:"p6", name:"Chocolate Belga 70%", category:"Dulces",
    desc:"100g · Cacao fino · Edición limitada · Sin azúcar añadida",
    price:5.75, stock:35, badge:"EDICIÓN LTD",
    images:["https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=90","https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=90","https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=90"],
    img:"https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=90" },
];

export const DEFAULT_BANNERS: Banner[] = [
  { id:"b1", active:true, tag:"NUEVO INGRESO", title:"Aceite\nde Oliva",
    subtitle:"Extra Virgen · Prensado en frío · Cosecha selecta", cta:"COMPRAR AHORA",
    bgColor:"#f0f4e8", accentColor:"#5a8a00", textColor:"#111111", btnColor:"#111111", btnTextColor:"#ffffff",
    img:"https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=700&q=90",
    titleSize:72, subtitleSize:14, btnSize:11, btnPaddingX:28, btnPaddingY:12, btnRadius:10 },
  { id:"b2", active:true, tag:"CAFÉ PREMIUM", title:"Gourmet\nMolido",
    subtitle:"Tostado artesanal · Origen único · 250g", cta:"VER PRODUCTO",
    bgColor:"#f5ede6", accentColor:"#7a3a00", textColor:"#111111", btnColor:"#7a3a00", btnTextColor:"#ffffff",
    img:"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=700&q=90",
    titleSize:72, subtitleSize:14, btnSize:11, btnPaddingX:28, btnPaddingY:12, btnRadius:10 },
  { id:"b3", active:true, tag:"100% NATURAL", title:"Miel\nde Abeja",
    subtitle:"Recolección directa · Sin conservantes · Cruda", cta:"DESCUBRIR",
    bgColor:"#fdf5e0", accentColor:"#a07000", textColor:"#111111", btnColor:"#a07000", btnTextColor:"#ffffff",
    img:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=700&q=90",
    titleSize:72, subtitleSize:14, btnSize:11, btnPaddingX:28, btnPaddingY:12, btnRadius:10 },
];

export const DEFAULT_DESIGN: DesignConfig = {
  primaryColor:"#111111", secondaryColor:"#22a85a", bgColor:"#f5f5f5",
  textColor:"#111111", accentColor:"#3b82f6", fontFamily:"Inter",
  logoUrl:"", logoBase64:"", bannerUrl:"", bannerBase64:"",
  heroTitle:"Délice Gourmet", heroSubtitle:"Productos importados de calidad premium",
  ctaText:"COMPRAR AHORA", brandName:"DÉLICE", brandSub:"GOURMET",
  navLinks:[
    { id:"n1", label:"Inicio",   url:"#inicio",   active:true },
    { id:"n2", label:"Tienda",   url:"#tienda",   active:true },
    { id:"n3", label:"Recetas",  url:"#recetas",  active:true },
    { id:"n4", label:"Nosotros", url:"#nosotros", active:true },
  ],
  tickerItems: [...DEFAULT_TICKER_ITEMS],
  trustItems:  [...DEFAULT_TRUST_ITEMS],
};
