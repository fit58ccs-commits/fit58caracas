"use client";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const store = useAppStore();

  return (
    <ToastProvider>
      <div className="min-h-screen font-[Inter,sans-serif]">
        {/* Sin botón admin visible — acceder vía /admin directamente */}

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
