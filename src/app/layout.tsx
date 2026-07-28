import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title:       "Fit +58 Caracas — Suplementos y productos gourmet importados",
  description: "Tienda online de suplementos deportivos y productos gourmet importados en Caracas, Venezuela. Envío a domicilio. Paga en Bs., Zelle o Pago Móvil.",
  manifest:    "/manifest.json",
  keywords:    ["suplementos Caracas", "proteína Venezuela", "tienda gourmet Caracas", "Fit 58", "suplementos deportivos Venezuela", "comprar proteína Caracas"],
  robots:      { index: true, follow: true },
  openGraph: {
    type:        "website",
    locale:      "es_VE",
    url:         "https://fit58caracas.vercel.app",
    siteName:    "Fit +58 Caracas",
    title:       "Fit +58 Caracas — Suplementos y productos gourmet importados",
    description: "Tienda online de suplementos deportivos y productos gourmet importados en Caracas. Envío a domicilio.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Fit +58 Caracas" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Fit +58 Caracas — Suplementos y productos gourmet importados",
    description: "Tienda online de suplementos deportivos y productos gourmet importados en Caracas.",
    images:      ["/icons/icon-512.png"],
  },
  appleWebApp: {
    capable:        true,
    statusBarStyle: "default",
    title:          "Fit +58 Caracas",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple:   [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor:   "#111111",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon"             href="/favicon.ico" type="image/x-icon"/>
        <link rel="icon"             href="/icons/icon-192.png" type="image/png"/>
        <link rel="shortcut icon"    href="/favicon.ico"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
        <link rel="manifest"         href="/manifest.json"/>
        <meta name="mobile-web-app-capable"              content="yes"/>
        <meta name="apple-mobile-web-app-capable"        content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title"          content="Fit +58"/>
      </head>
      {/* bg #F5ECE4 = color real de la app — evita flash de color distinto */}
      <body suppressHydrationWarning style={{ background: "#F5ECE4" }}
        className={`${poppins.variable} font-[Inter,sans-serif] antialiased`}>
        {children}
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister()));
            caches.keys().then(k=>k.forEach(x=>caches.delete(x)));
          }
        `}</Script>
      </body>
    </html>
  );
}
