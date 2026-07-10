"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { ToastProvider } from "./ui/Toast";
import { AdminView } from "./admin/AdminView";
import { LogOut } from "lucide-react";

export default function AdminApp() {
  const store = useAppStore();
  const { user, loading: authLoading, signOut } = useAuth();

  // Si no hay sesión después de verificar → redirigir a login
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  // Mientras verifica sesión
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/>
          <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen font-[Inter,sans-serif]">
        {/* Barra superior con info de sesión */}
        <div className="fixed top-3.5 right-3.5 z-[9999] flex items-center gap-2">
          {/* Email del admin */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/78 backdrop-blur-2xl text-[10px] text-neutral-500 font-semibold"
            style={{ boxShadow:"0 4px 14px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>
            {user.email}
          </div>

          {/* Ir a la tienda */}
          <a href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase no-underline bg-white/78 backdrop-blur-2xl text-neutral-500 hover:text-neutral-800 transition-all"
            style={{ boxShadow:"0 4px 14px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}>
            ← Tienda
          </a>

          {/* Cerrar sesión */}
          <button onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide uppercase border-none cursor-pointer bg-white/78 backdrop-blur-2xl text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-all"
            style={{ boxShadow:"0 4px 14px rgba(0,0,0,0.08)", border:"1px solid rgba(255,255,255,0.6)" }}>
            <LogOut size={12}/> Salir
          </button>
        </div>

        {store.loading && (
          <div className="fixed inset-0 z-[8000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/>
              <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Cargando datos...</p>
            </div>
          </div>
        )}

        <AdminView store={store}/>
      </div>
    </ToastProvider>
  );
}
