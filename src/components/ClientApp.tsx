"use client";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const store = useAppStore();

  return (
    <ToastProvider>
      <div className="min-h-screen font-[Inter,sans-serif]">

        {/* Botón admin — pequeño, esquina superior derecha, sin tapar nada */}
        <a href="/admin"
          style={{
            position:"fixed", bottom:24, right:16, zIndex:9999,
            padding:"5px 10px", borderRadius:20,
            fontSize:9, fontWeight:700, letterSpacing:"1px",
            textTransform:"uppercase", textDecoration:"none",
            background:"rgba(255,255,255,0.70)",
            backdropFilter:"blur(12px)",
            border:"1px solid rgba(200,200,200,0.5)",
            color:"#aaa",
            boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>(e.currentTarget.style.color="#555")}
          onMouseLeave={e=>(e.currentTarget.style.color="#aaa")}>
          admin
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
