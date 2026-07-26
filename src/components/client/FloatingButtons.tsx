"use client";
import { useState, useEffect } from "react";

interface FloatingButtonsProps {
  whatsappNumber?: string;
  instagramHandle?: string;
}

export function FloatingButtons({
  whatsappNumber  = "584141013137",
  instagramHandle = "fit58caracas",
}: FloatingButtonsProps) {
  const [visible, setVisible] = useState(false);

  // Aparece tras 1 segundo para no interferir con la carga inicial
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hola, quiero hacer un pedido en Fit +58 Caracas 🛒")}`;
  const igUrl = `https://www.instagram.com/${instagramHandle}/`;

  return (
    <div
      style={{
        position:   "fixed",
        bottom:     "clamp(80px, 12vw, 100px)", // sobre el nav móvil
        right:      20,
        zIndex:     9000,
        display:    "flex",
        flexDirection: "column",
        gap:        12,
        alignItems: "flex-end",
      }}
    >
      {/* Instagram */}
      <a
        href={igUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Síguenos en Instagram"
        style={{
          width:          52,
          height:         52,
          borderRadius:   "50%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          boxShadow:      "0 4px 20px rgba(220,39,67,0.45)",
          transition:     "transform 0.2s ease, box-shadow 0.2s ease",
          textDecoration: "none",
          flexShrink:     0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.12) translateY(-2px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(220,39,67,0.55)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(220,39,67,0.45)";
        }}
      >
        {/* Instagram SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        style={{
          width:          52,
          height:         52,
          borderRadius:   "50%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          background:     "#25D366",
          boxShadow:      "0 4px 20px rgba(37,211,102,0.50)",
          transition:     "transform 0.2s ease, box-shadow 0.2s ease",
          textDecoration: "none",
          flexShrink:     0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1.12) translateY(-2px)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(37,211,102,0.60)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform  = "scale(1)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.50)";
        }}
      >
        {/* WhatsApp SVG oficial */}
        <svg width="26" height="26" viewBox="0 0 32 32" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.001 3C9.374 3 4 8.373 4 15c0 2.385.668 4.61 1.823 6.502L4 29l7.698-1.796A11.96 11.96 0 0016.001 28c6.627 0 12-5.373 12-12S22.628 3 16.001 3zm0 21.846a9.822 9.822 0 01-5.027-1.38l-.36-.213-3.735.871.901-3.636-.237-.378A9.828 9.828 0 016.156 15c0-5.42 4.41-9.83 9.845-9.83 5.436 0 9.845 4.41 9.845 9.83 0 5.42-4.41 9.846-9.845 9.846zm5.392-7.363c-.295-.148-1.747-.861-2.018-.96-.271-.098-.468-.148-.665.148-.197.296-.762.96-.934 1.157-.172.197-.344.222-.639.074-.295-.148-1.245-.459-2.372-1.463-.876-.78-1.467-1.744-1.64-2.04-.172-.295-.018-.455.13-.602.132-.131.295-.344.443-.516.148-.172.197-.296.295-.493.098-.197.049-.37-.025-.517-.074-.148-.665-1.604-.911-2.197-.24-.576-.484-.497-.665-.507l-.566-.01a1.084 1.084 0 00-.788.37c-.271.295-1.034 1.01-1.034 2.465 0 1.455 1.058 2.86 1.206 3.058.148.197 2.083 3.18 5.047 4.461.706.305 1.257.487 1.686.624.708.226 1.352.194 1.862.117.568-.085 1.747-.714 1.994-1.404.246-.69.246-1.28.172-1.404-.074-.123-.271-.197-.566-.344z"/>
        </svg>
      </a>
    </div>
  );
}
