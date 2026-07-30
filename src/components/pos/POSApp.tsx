"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import POSLogin from "./POSLogin";
import POSMain  from "./POSMain";

export interface POSCashier {
  id: string;
  name: string;
  role: "admin" | "cashier";
}

export default function POSApp() {
  const [mounted,  setMounted]  = useState(false);
  const [cashier,  setCashier]  = useState<POSCashier | null>(null);
  const [shiftStart, setShiftStart] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // Restore session
    const saved = sessionStorage.getItem("pos_cashier");
    if (saved) {
      setCashier(JSON.parse(saved));
      setShiftStart(sessionStorage.getItem("pos_shift") ?? new Date().toISOString());
    }
  }, []);

  const store = useAppStore();

  const handleLogin = (c: POSCashier) => {
    const now = new Date().toISOString();
    setCashier(c);
    setShiftStart(now);
    sessionStorage.setItem("pos_cashier", JSON.stringify(c));
    sessionStorage.setItem("pos_shift",   now);
  };

  const handleLogout = () => {
    setCashier(null);
    sessionStorage.removeItem("pos_cashier");
    sessionStorage.removeItem("pos_shift");
  };

  if (!mounted || store.loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#111",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#fff",
          animation: "spin 0.7s linear infinite",
        }}/>
      </div>
    );
  }

  if (!cashier) return <POSLogin onLogin={handleLogin} />;

  return (
    <POSMain
      store={store}
      cashier={cashier}
      shiftStart={shiftStart}
      onLogout={handleLogout}
    />
  );
}
