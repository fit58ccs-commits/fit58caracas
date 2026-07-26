"use client";
import { useAppStore } from "@/lib/store";
import { ToastProvider } from "./ui/Toast";
import { ClientView } from "./client/ClientView";

export default function ClientApp() {
  const store = useAppStore();
  return (
    <ToastProvider>
      <div className="min-h-screen">
        {store.loading && (
          <div className="fixed top-0 left-0 right-0 z-[8000] h-0.5 bg-neutral-100 overflow-hidden">
            <div className="h-full bg-black"
              style={{ width:"40%", animation:"slideRight 1.2s ease-in-out infinite" }}/>
          </div>
        )}
        <ClientView store={store}/>
      </div>
    </ToastProvider>
  );
}
