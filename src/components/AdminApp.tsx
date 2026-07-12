"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { ToastProvider } from "./ui/Toast";
import { AdminView } from "./admin/AdminView";

export default function AdminApp() {
  const store = useAppStore();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/login";
  }, [user, authLoading]);

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
        {store.loading && (
          <div className="fixed inset-0 z-[8000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/>
              <p className="text-xs font-semibold text-neutral-400 tracking-wide uppercase">Cargando datos...</p>
            </div>
          </div>
        )}
        {/* Email, ← Tienda y Salir van dentro del topbar del AdminShell via props */}
        <AdminView store={store} userEmail={user.email ?? ""} onSignOut={signOut}/>
      </div>
    </ToastProvider>
  );
}
