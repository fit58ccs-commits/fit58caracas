import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title:       "Fit +58 Caracas — Suplementos Originales de la tia @saschafitness",
  description: "E-commerce de Suplementos Importados en Caracas. Envío a Domicilio Gratis.",
  manifest:    "/manifest.json",
  keywords:    ["suplementos Caracas", "proteína Venezuela", "tienda gourmet Caracas", "Fit 58", "suplementos deportivos Venezuela", "comprar proteína Caracas"],
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      "es_VE",
    url:         "https://fit58caracas.vercel.app",
    siteName:    "Fit +58 Caracas",
    title:       "Fit +58 Caracas — Suplementos Originales de la tia @saschafitness",
    description: "E-commerce de Suplementos Importados en Caracas. Envío a Domicilio Gratis.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Fit +58 Caracas" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Fit +58 Caracas — Suplementos Originales de la tia @saschafitness",
    description: "E-commerce de Suplementos Importados en Caracas. Envío a Domicilio Gratis.",
    images:      ["/icons/icon-512.png"],
  },
  appleWebApp: {
    capable:          true,
    statusBarStyle:   "default",
    title:            "Fit +58 Caracas",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor:         "#111111",
  width:              "device-width",
  initialScale:       1,
  maximumScale:       1,
  userScalable:       false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "Store"],
        "@id": "https://fit58caracas.vercel.app/#business",
        "name": "Fit +58 Caracas",
        "description": "E-commerce de Suplementos Importados en Caracas. Envío a Domicilio Gratis.",
        "url": "https://fit58caracas.vercel.app",
        "logo": "https://fit58caracas.vercel.app/icons/icon-512.png",
        "image": "https://fit58caracas.vercel.app/icons/icon-512.png",
        "telephone": "+58-414-1013137",
        "priceRange": "€€",
        "currenciesAccepted": "USD, VES",
        "paymentAccepted": "Zelle, Pago Móvil, Binance Pay, Efectivo",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Caracas",
          "addressRegion": "Distrito Capital",
          "addressCountry": "VE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "10.4806",
          "longitude": "-66.9036"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "08:00",
          "closes": "20:00"
        },
        "sameAs": [
          "https://wa.me/584141013137"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Suplementos y Gourmet",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Suplementos deportivos importados" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Proteínas y vitaminas" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Productos gourmet importados" } }
          ]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://fit58caracas.vercel.app/#website",
        "url": "https://fit58caracas.vercel.app",
        "name": "Fit +58 Caracas",
        "description": "E-commerce de Suplementos Importados en Caracas. Envío a Domicilio Gratis.",
        "publisher": { "@id": "https://fit58caracas.vercel.app/#business" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://fit58caracas.vercel.app/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body suppressHydrationWarning className="font-[Inter,sans-serif] bg-[#f0f2f5] antialiased">
        {children}
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister();});});
            caches.keys().then(function(k){k.forEach(function(x){caches.delete(x);});});
          }
        `}</Script>
      </body>
    </html>
  );
}


