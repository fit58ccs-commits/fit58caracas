"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const store = useAppStore();

  // Mostrar splash mientras:
  // 1. No ha montado aún (SSR/hydration)
  // 2. Está cargando desde Supabase
  // Así el cliente nunca ve la página a medio construir
  const showSplash = !mounted || store.loading;

  if (showSplash) {
    return (
      <div style={{
        minHeight:       "100vh",
        background:      "#F5ECE4",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
      }}>
        <img
          src="/logo-splash.png"
          alt="FIT 58"
          style={{
            width:     "clamp(120px, 35vw, 200px)",
            height:    "auto",
            opacity:   0.95,
          }}
        />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <ClientView store={store}/>
      </div>
    </ToastProvider>
  );
}
