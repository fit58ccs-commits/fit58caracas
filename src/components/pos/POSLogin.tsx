"use client";
import { useState } from "react";
import type { POSCashier } from "./POSApp";

const CASHIERS: (POSCashier & { pin: string })[] = [
  { id: "1", name: "Admin",    role: "admin",   pin: "1234" },
  { id: "2", name: "Cajero 1", role: "cashier", pin: "0000" },
];

export default function POSLogin({ onLogin }: { onLogin: (c: POSCashier) => void }) {
  const [selected, setSelected] = useState<typeof CASHIERS[0] | null>(null);
  const [pin,      setPin]      = useState("");
  const [error,    setError]    = useState(false);
  const [shake,    setShake]    = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) verify(next);
  };

  const verify = (code: string) => {
    if (!selected) return;
    if (code === selected.pin) {
      const { pin: _, ...cashier } = selected;
      onLogin(cashier);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => { setPin(""); setShake(false); }, 600);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#111",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "24px",
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-8px)}
          40%,80%{transform:translateX(8px)}
        }
        .shake { animation: shake 0.5s ease; }
        .cashier-btn:hover { background: rgba(255,255,255,0.15) !important; }
        .digit-btn:hover { background: rgba(255,255,255,0.2) !important; }
        .digit-btn:active { transform: scale(0.94); }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>FIT 58</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 4, textTransform: "uppercase", marginTop: 4 }}>Punto de Venta</div>
      </div>

      {!selected ? (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 20 }}>
            Selecciona cajero
          </p>
          {CASHIERS.map(c => (
            <button key={c.id} className="cashier-btn"
              onClick={() => setSelected(c)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 16,
                padding: "16px 20px", marginBottom: 12, cursor: "pointer",
                transition: "background 0.15s",
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 900, color: "#fff",
              }}>{c.name[0]}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{c.role === "admin" ? "Administrador" : "Cajero"}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: 300, textAlign: "center" }}>
          <button onClick={() => { setSelected(null); setPin(""); setError(false); }}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24 }}>
            ← {selected.name}
          </button>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>
            Ingresa tu PIN
          </p>

          {/* Dots */}
          <div className={shake ? "shake" : ""} style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 40 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: "50%",
                background: error ? "#ef4444" : pin.length > i ? "#fff" : "rgba(255,255,255,0.2)",
                border: `2px solid ${error ? "#ef4444" : pin.length > i ? "#fff" : "rgba(255,255,255,0.3)"}`,
                transition: "all 0.15s",
              }}/>
            ))}
          </div>

          {/* Numpad */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
              <button key={i} className={d !== "" ? "digit-btn" : ""}
                onClick={() => d === "⌫" ? setPin(p => p.slice(0,-1)) : d !== "" ? handleDigit(d) : undefined}
                style={{
                  aspectRatio: "1.4",
                  background: d === "" ? "transparent" : "rgba(255,255,255,0.1)",
                  border: "none", borderRadius: 14,
                  color: "#fff", fontSize: 22, fontWeight: 600,
                  cursor: d !== "" ? "pointer" : "default",
                  transition: "all 0.1s",
                }}>
                {d}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: 20 }}>PIN incorrecto</p>
          )}
        </div>
      )}
    </div>
  );
}
