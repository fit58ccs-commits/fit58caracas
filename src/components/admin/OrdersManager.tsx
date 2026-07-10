"use client";
import { MapPin, Phone } from "lucide-react";
import { fmt$ } from "@/lib/store";
import { useToast } from "../ui/Toast";
import type { Order } from "@/lib/types";

export function OrdersManager({
  orders, search,
  onToggleStatus,
}: { orders: Order[]; search: string; onToggleStatus: (id: string) => void }) {
  const toast = useToast();
  const filtered = orders.filter(o =>
    !search ||
    o.form?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.form?.phone?.includes(search)
  );

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Pedidos</h1>
        <p className="text-xs text-neutral-400 mt-1">{filtered.length} pedido{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-20 text-center rounded-2xl">
          <p className="text-sm font-bold text-neutral-300 uppercase tracking-wide">{search ? "Sin coincidencias" : "Sin pedidos aún"}</p>
        </div>
      )}

      {filtered.map(o => (
        <div key={o.id} className="glass-card p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]">
          <div className="flex justify-between mb-4 flex-wrap gap-2.5">
            <div>
              <p className="text-base font-black text-black uppercase m-0 mb-1">{o.form?.name || "Cliente"}</p>
              <p className="text-[11px] text-neutral-400 m-0 flex items-center gap-1"><Phone size={10} />{o.form?.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-green-600 m-0 mb-0.5">{fmt$(o.total)}</p>
              <p className="text-[10px] text-neutral-400 m-0">{new Date(o.date).toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-neutral-50 pt-3.5 mb-3.5">
            {(o.cart || []).map((i, idx) => (
              <div key={idx} className="flex justify-between text-xs text-neutral-500 mb-1 font-medium">
                <span>{i.name} ×{i.qty}</span>
                <span className="font-bold">{fmt$(i.price * i.qty)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2.5 border-t border-neutral-50 pt-3.5">
            {o.form?.address && (
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <MapPin size={10} />{o.form.address.slice(0, 40)}...
              </span>
            )}
            <div className="flex gap-2 ml-auto items-center">
              {o.mapsLink && (
                <a href={o.mapsLink} target="_blank" rel="noreferrer"
                  className="text-[10px] font-bold text-blue-500 border border-blue-200/90 px-3 py-1.5 rounded-lg no-underline flex items-center gap-1 bg-blue-50/80 backdrop-blur-sm transition-colors hover:bg-blue-100/80">
                  <MapPin size={11} />GPS
                </a>
              )}
              <button
                onClick={() => {
                  onToggleStatus(o.id);
                  toast(o.status === "pending" ? "Pedido procesado" : "Pedido reabierto", "✓");
                }}
                className="text-[8px] font-black px-3.5 py-1.5 rounded-lg border-none cursor-pointer transition-all tracking-wide uppercase backdrop-blur-sm hover:opacity-75"
                style={{
                  background: o.status === "pending" ? "rgba(254,243,199,0.9)" : "rgba(209,250,229,0.9)",
                  color: o.status === "pending" ? "#92400e" : "#065f46",
                }}>
                {o.status === "pending" ? "PENDIENTE ▶ PROCESAR" : "✓ PROCESADO"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
