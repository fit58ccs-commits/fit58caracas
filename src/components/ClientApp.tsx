"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

const SPLASH_BG = "#333333";

export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const store = useAppStore();

  const showSplash = !mounted || store.loading;

  if (showSplash) {
    return (
      <div style={{
        minHeight:      "100vh",
        background:     SPLASH_BG,
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
            width:    "clamp(180px, 50vw, 320px)",
            height:   "auto",
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
