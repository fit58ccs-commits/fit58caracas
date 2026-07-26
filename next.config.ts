import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formatos modernos — Next.js convierte automaticamente a WebP/AVIF
    formats: ["image/avif", "image/webp"],

    // Tamanos de pantalla para srcset responsive
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [64, 128, 256, 384],

    // Calidad por defecto (75 es buen balance calidad/peso)
    qualities: [75],

    remotePatterns: [
      // Supabase Storage — imagenes de productos y banners
      { protocol: "https", hostname: "dbxpgbphtxhejjdkdgza.supabase.co" },
      // Unsplash — imagenes de muestra
      { protocol: "https", hostname: "images.unsplash.com" },
      // Sascha Fitness CDN y otros posibles origenes de productos
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      // Imagenes subidas por URL directa (cualquier HTTPS)
      { protocol: "https", hostname: "**" },
    ],

    // Minimizar re-optimizaciones en desarrollo
    minimumCacheTTL: 86400, // 24h cache en Vercel
  },
};

export default nextConfig;
