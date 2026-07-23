/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dbxpgbphtxhejjdkdgza.supabase.co" },
    ],
  },
  compress:        true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que tu sitio se muestre dentro de un iframe (clickjacking)
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          // Activa el filtro XSS en navegadores antiguos
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          // Evita que el navegador adivine el tipo de contenido
          { key: "X-Content-Type-Options",    value: "nosniff" },
          // No enviar la URL completa como referrer a sitios externos
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          // Limitar acceso a APIs del navegador (cámara, micrófono, geoloc solo lo que se usa)
          { key: "Permissions-Policy",        value: "geolocation=(self), camera=(), microphone=()" },
          // Forzar HTTPS por 1 año
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
