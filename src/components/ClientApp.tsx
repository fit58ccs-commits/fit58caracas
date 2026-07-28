"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  // "mounted" evita el flash: el servidor no tiene localStorage
  // Antes de montar → fondo sólido del mismo color que la app (invisible)
  // Después de montar → app real con datos de localStorage ya disponibles
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const store = useAppStore();

  if (!mounted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img
          src="/logo-splash.png"
          alt="FIT 58"
          style={{ width: 160, height: "auto", opacity: 0.95 }}
        />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        {store.loading && (
          <div className="fixed top-0 left-0 right-0 z-[8000] h-0.5 bg-neutral-100 overflow-hidden">
            <div className="h-full bg-black"
              style={{ width:"40%", animation:"slideRight 1.2s ease-in-out infinite" }}/>
          </div>
        )}
        <ClientView store={store}/>
      </div>
    </ToastProvider>
  );
}
