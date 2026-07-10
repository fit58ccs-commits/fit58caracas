import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Délice Gourmet — Productos importados de calidad premium",
  description: "Tienda de productos gourmet importados.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-[Inter,sans-serif] bg-[#f0f2f5] antialiased">{children}</body>
    </html>
  );
}
