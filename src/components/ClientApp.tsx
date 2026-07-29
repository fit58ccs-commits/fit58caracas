"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const store = useAppStore();

  const showSplash = !mounted || store.loading;

  if (showSplash) {
    return (
      <div style={{
        position:       "fixed",
        inset:          0,
        background:     "#333333",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        <img
          src="/logo-splash.png"
          alt="FIT 58 Caracas"
          fetchPriority="high"
          decoding="sync"
          style={{
            width:     "clamp(160px, 55vw, 280px)",
            height:    "auto",
            display:   "block",
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
