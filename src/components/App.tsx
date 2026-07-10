"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";
import { AdminView }  from "./admin/AdminView";
import { LogOut } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"client"|"admin">("client");
  const store  = useAppStore();
  const { user, loading: authLoading, signOut } = useAuth();

  return (
    <ToastProvider>
      <div className="min-h-screen font-[Inter,sans-serif]">

        {/* Logout — solo en admin con sesión activa */}
        <div className="fixed top-3.5 right-3.5 z-[9999] flex items-center gap-2">
          {view === "admin" && user && (
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border-none cursor-pointer bg-white/78 backdrop-blur-2xl text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-all"
              style={{ boxShadow:"0 4px 14px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}>
              <LogOut size={12}/> Salir
            </button>
          )}

          {/* Toggle */}
          <div className="flex gap-1 bg-white/78 backdrop-blur-2xl border border-white/60 rounded-full p-1"
            style={{ boxShadow:"0 8px 32px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            {(["client","admin"] as const).map(v => (
              <button key={v} onClick={() => {
                if (v === "admin" && !user && !authLoading) {
                  window.location.href = "/login";
                  return;
                }
                setView(v);
              }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[1.2px] uppercase transition-all duration-200 border-none cursor-pointer ${
                  view===v ? "bg-[rgba(17,17,17,0.90)] text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)]" : "bg-transparent text-neutral-500 hover:text-neutral-800"
                }`}>
                {v==="client"?"Cliente":"Admin"}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {store.loading && (
          <div className="fixed inset-0 z-[8000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/>
              <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Cargando datos...</p>
            </div>
          </div>
        )}

        {view==="client" ? <ClientView store={store}/> : <AdminView store={store}/>}
      </div>
    </ToastProvider>
  );
}
