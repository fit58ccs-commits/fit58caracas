"use client";
import { useState } from "react";
import { Search, Package, CheckCircle2, Clock, XCircle, ChevronRight, X } from "lucide-react";
import { sbGetOrderById } from "@/lib/supabase";
import { fmt$, fmtBs } from "@/lib/store";
import type { Order } from "@/lib/types";

const STATUS = {
  pending:   { label: "Pendiente",  color: "#f59e0b", bg: "rgba(254,243,199,0.9)", icon: <Clock size={16}/> },
  processed: { label: "Procesado",  color: "#22a85a", bg: "rgba(209,250,229,0.9)", icon: <CheckCircle2 size={16}/> },
  cancelled: { label: "Anulado",    color: "#e53e3e", bg: "rgba(254,226,226,0.9)", icon: <XCircle size={16}/> },
};

export function OrderTracker({ rate, onClose }: { rate: number; onClose: () => void }) {
  const [query,   setQuery]   = useState("");
  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const search = async () => {
    const id = query.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setError("");
    setOrder(null);
    const found = await sbGetOrderById(id);
    if (!found) setError("No encontramos un pedido con ese número. Verifica que lo hayas copiado correctamente.");
    else setOrder(found);
    setLoading(false);
  };

  const st = order ? (STATUS[order.status] || STATUS.pending) : null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}/>
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <p className="text-[9px] font-black text-neutral-400 tracking-[2px] uppercase">Consulta tu pedido</p>
            <h2 className="text-lg font-black text-black uppercase tracking-tight">Seguimiento</h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center cursor-pointer border-none">
            <X size={16}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Buscador */}
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Número de pedido (ej: LB2K4X)"
              maxLength={20}
              className="flex-1 border border-neutral-200/80 px-4 py-3 text-sm rounded-xl font-[inherit] outline-none bg-neutral-50/50 tracking-wider font-bold"
            />
            <button onClick={search} disabled={loading || !query.trim()}
              className="px-4 py-3 rounded-xl text-white text-sm font-black border-none cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              style={{background:"rgba(17,17,17,0.90)"}}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Search size={15}/>}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-500 font-semibold">
              {error}
            </div>
          )}

          {/* Resultado */}
          {order && st && (
            <div className="flex flex-col gap-3">
              {/* Estado */}
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{background:st.bg}}>
                <span style={{color:st.color}}>{st.icon}</span>
                <div>
                  <p className="text-[9px] font-black tracking-[1.5px] uppercase" style={{color:st.color}}>Estado del pedido</p>
                  <p className="text-base font-black" style={{color:st.color}}>{st.label}</p>
                </div>
                <span className="ml-auto text-[10px] font-black text-neutral-400">#{order.id}</span>
              </div>

              {/* Fecha */}
              <p className="text-[10px] text-neutral-400 text-center">
                Realizado el {new Date(order.date).toLocaleString("es-VE", {dateStyle:"long", timeStyle:"short"})}
              </p>

              {/* Productos */}
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1 flex items-center gap-1.5">
                  <Package size={11}/> Productos
                </p>
                {(order.cart || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-neutral-600">{item.name} <span className="text-neutral-400">×{item.qty}</span></span>
                    <span className="font-black text-black">{fmt$(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-neutral-100 pt-2 mt-1 flex justify-between items-baseline">
                  <span className="text-sm font-black text-black uppercase">Total</span>
                  <div className="text-right">
                    <div className="text-base font-black text-black">{fmt$(order.total)}</div>
                    <div className="text-[10px] text-neutral-400">{fmtBs(order.total, rate)}</div>
                  </div>
                </div>
              </div>

              {/* Datos de entrega */}
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-1.5 text-xs text-neutral-500">
                <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1">Datos de entrega</p>
                {order.form?.name    && <p>👤 {order.form.name}</p>}
                {order.form?.phone   && <p>📱 {order.form.phone}</p>}
                {order.form?.address && <p>📍 {order.form.address}</p>}
                {order.form?.time    && <p>⏰ {order.form.time}</p>}
                {order.form?.method  && <p>💳 {order.form.method}</p>}
              </div>

              {/* Cancelado */}
              {order.status === "cancelled" && order.cancelReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-500">
                  <span className="font-black">Motivo: </span>{order.cancelReason}
                </div>
              )}
            </div>
          )}

          {/* Estado vacío inicial */}
          {!order && !error && !loading && (
            <div className="text-center py-8 text-neutral-300">
              <Package size={36} className="mx-auto mb-3"/>
              <p className="text-sm text-neutral-400">Ingresa el número de pedido que recibiste en tu ticket de compra.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
