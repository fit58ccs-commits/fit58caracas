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
        overflow:       "hidden",
      }}>
        <img
          src="/logo-splash.png"
          alt="FIT 58 Caracas"
          fetchPriority="high"
          decoding="sync"
          style={{
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",
            objectPosition: "center",
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
