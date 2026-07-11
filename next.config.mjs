/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dbxpgbphtxhejjdkdgza.supabase.co" },
    ],
  },
  // Optimización de performance
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
