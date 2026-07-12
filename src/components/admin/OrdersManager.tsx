"use client";
import { useState } from "react";
import { MapPin, Phone, Trash2, XCircle, RotateCcw, Check } from "lucide-react";
import { fmt$, fmtBs } from "@/lib/store";
import { useToast } from "../ui/Toast";
import type { Order } from "@/lib/types";

interface Props {
  orders:         Order[];
  search:         string;
  rate?:          number;
  onToggleStatus: (id: string) => void;
  onCancel?:      (id: string, reason: string) => void;
  onDelete?:      (id: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg:"rgba(254,243,199,0.9)", color:"#92400e", label:"PENDIENTE"  },
  processed: { bg:"rgba(209,250,229,0.9)", color:"#065f46", label:"PROCESADO"  },
  cancelled: { bg:"rgba(254,226,226,0.9)", color:"#991b1b", label:"ANULADO"    },
};

export function OrdersManager({ orders, search, rate = 36.5, onToggleStatus, onCancel, onDelete }: Props) {
  const toast = useToast();
  const [cancelId,     setCancelId]     = useState<string|null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [filter,       setFilter]       = useState<"all"|"pending"|"processed"|"cancelled">("all");

  const filtered = orders.filter(o => {
    const matchSearch = !search
      || o.form?.name?.toLowerCase().includes(search.toLowerCase())
      || o.form?.phone?.includes(search)
      || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o=>o.status==="pending").length,
    processed: orders.filter(o=>o.status==="processed").length,
    cancelled: orders.filter(o=>o.status==="cancelled").length,
  };

  const handleCancel = (id: string) => {
    if (!cancelReason.trim()) { toast("Escribe el motivo de anulación", "⚠️"); return; }
    onCancel?.(id, cancelReason);
    toast("Pedido anulado", "🚫");
    setCancelId(null);
    setCancelReason("");
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Pedidos</h1>
          <p className="text-xs text-neutral-400 mt-1">{filtered.length} pedido{filtered.length!==1?"s":""} · Total: {fmt$(orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+o.total,0))}</p>
        </div>
        {/* Filtros */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all","pending","processed","cancelled"] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border-none cursor-pointer transition-all"
              style={{ background:filter===f?"rgba(17,17,17,0.88)":"rgba(240,242,245,0.8)", color:filter===f?"#fff":"#888" }}>
              {f==="all"?"Todos":f==="pending"?"Pendientes":f==="processed"?"Procesados":"Anulados"}
              <span className="ml-1 opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center rounded-2xl">
          <p className="text-sm font-bold text-neutral-300 uppercase tracking-wide">{search?"Sin coincidencias":"Sin pedidos"}</p>
        </div>
      )}

      {filtered.map(o => {
        const st = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
        const isCancelled = o.status === "cancelled";
        return (
          <div key={o.id} className="glass-card p-5 rounded-2xl transition-all hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)]"
            style={{ opacity: isCancelled ? 0.7 : 1 }}>

            {/* Header */}
            <div className="flex justify-between mb-3 flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-base font-black text-black uppercase m-0">{o.form?.name||"Cliente"}</p>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{background:st.bg,color:st.color}}>{st.label}</span>
                </div>
                <p className="text-[11px] text-neutral-400 m-0 flex items-center gap-1"><Phone size={10}/>{o.form?.phone}</p>
                <p className="text-[9px] text-neutral-300 m-0 mt-0.5">#{o.id} · {new Date(o.date).toLocaleString("es-VE")}</p>
                {isCancelled && o.cancelReason && (
                  <p className="text-[10px] text-red-400 mt-1">Motivo: {o.cancelReason}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-black m-0 mb-0.5" style={{color:isCancelled?"#aaa":"#22a85a"}}>{fmt$(o.total)}</p>
                {rate > 0 && <p className="text-[10px] text-neutral-400 m-0">{fmtBs(o.total, rate)}</p>}
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-neutral-100/80 pt-3 mb-3">
              {(o.cart||[]).map((i,idx) => (
                <div key={idx} className="flex justify-between text-xs text-neutral-500 mb-1 font-medium">
                  <span>{i.name} ×{i.qty}</span>
                  <span className="font-bold">{fmt$(i.price*i.qty)}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center flex-wrap gap-2 border-t border-neutral-100/80 pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                {o.form?.address && (
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <MapPin size={10}/>{o.form.address.slice(0,35)}{o.form.address.length>35?"...":""}
                  </span>
                )}
                {o.form?.method && (
                  <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-semibold">
                    {o.form.method}
                  </span>
                )}
              </div>

              <div className="flex gap-2 ml-auto items-center flex-wrap">
                {o.mapsLink && (
                  <a href={o.mapsLink} target="_blank" rel="noreferrer"
                    className="text-[10px] font-bold text-blue-500 border border-blue-200/90 px-3 py-1.5 rounded-lg no-underline flex items-center gap-1 bg-blue-50/80 transition-colors hover:bg-blue-100/80">
                    <MapPin size={11}/>GPS
                  </a>
                )}

                {/* Toggle estado */}
                {!isCancelled && (
                  <button onClick={() => { onToggleStatus(o.id); toast(o.status==="pending"?"Pedido procesado ✓":"Pedido reabierto","✓"); }}
                    className="text-[9px] font-black px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all tracking-wide uppercase"
                    style={{background:st.bg, color:st.color}}>
                    {o.status==="pending" ? <><Check size={10}/> PROCESAR</> : <><RotateCcw size={10}/> REABRIR</>}
                  </button>
                )}

                {/* Anular */}
                {!isCancelled && (
                  <button onClick={()=>setCancelId(o.id)}
                    className="text-[9px] font-black px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all tracking-wide uppercase flex items-center gap-1"
                    style={{background:"rgba(254,226,226,0.9)",color:"#991b1b"}}>
                    <XCircle size={10}/> ANULAR
                  </button>
                )}

                {/* Eliminar */}
                <button onClick={() => {
                  if (confirm(`¿Eliminar pedido #${o.id}? Esta acción no se puede deshacer.`)) {
                    onDelete?.(o.id);
                    toast("Pedido eliminado","🗑️");
                  }
                }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all text-neutral-300 hover:bg-red-500 hover:text-white"
                  style={{background:"rgba(240,242,245,0.8)"}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>

            {/* Modal anulación inline */}
            {cancelId === o.id && (
              <div className="mt-3 pt-3 border-t border-red-100 flex flex-col gap-2">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-wide">Motivo de anulación</p>
                <p className="text-[10px] text-neutral-400">El pedido se marcará como ANULADO. No afectará el inventario.</p>
                <input value={cancelReason} onChange={e=>setCancelReason(e.target.value)}
                  placeholder="Ej: Cliente canceló, pedido duplicado, prueba..."
                  className="field-input border border-red-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"/>
                <div className="flex gap-2">
                  <button onClick={()=>{setCancelId(null);setCancelReason("");}}
                    className="flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border border-neutral-200/80 bg-white/70 cursor-pointer">
                    CANCELAR
                  </button>
                  <button onClick={()=>handleCancel(o.id)}
                    className="flex-1 py-2 text-[10px] font-black uppercase rounded-lg border-none cursor-pointer text-white"
                    style={{background:"rgba(153,27,27,0.88)"}}>
                    CONFIRMAR ANULACIÓN
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
