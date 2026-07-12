import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title:       "Fit +58 Caracas — Tu tienda de confianza",
  description: "Tienda de productos gourmet importados.",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:          true,
    statusBarStyle:   "default",
    title:            "Fit +58 Caracas",
  },
  icons: {
    icon:  "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
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
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="Fit +58"/>
        <link rel="apple-touch-icon" href="/icons/icon-192.png"/>
      </head>
      <body className="font-[Inter,sans-serif] bg-[#f0f2f5] antialiased">
        {children}
        {/* Registrar Service Worker */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(reg) { console.log('[PWA] SW registrado:', reg.scope); },
                function(err) { console.warn('[PWA] SW error:', err); }
              );
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
