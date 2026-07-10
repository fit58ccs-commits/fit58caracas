"use client";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const store = useAppStore();

  return (
    <ToastProvider>
      <div className="min-h-screen font-[Inter,sans-serif]">
        {/* Enlace discreto al admin — solo visible para el dueño */}
        <a href="/admin"
          className="fixed top-3.5 right-3.5 z-[9999] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[1.2px] uppercase border-none cursor-pointer bg-white/78 backdrop-blur-2xl text-neutral-400 hover:text-neutral-700 transition-all"
          style={{ boxShadow:"0 4px 14px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}>
          Admin
        </a>

        {store.loading && (
          <div className="fixed inset-0 z-[8000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/>
              <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Cargando...</p>
            </div>
          </div>
        )}

        <ClientView store={store}/>
      </div>
    </ToastProvider>
  );
}
