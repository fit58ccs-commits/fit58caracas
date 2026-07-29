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
        position:        "fixed",
        inset:           0,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      "rgba(255,255,255,0.18)",
        backdropFilter:  "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width:          36,
          height:         36,
          borderRadius:   "50%",
          border:         "3px solid rgba(255,255,255,0.25)",
          borderTopColor: "rgba(0,0,0,0.55)",
          animation:      "spin 0.7s linear infinite",
        }}/>
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
