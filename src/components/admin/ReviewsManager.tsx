"use client";
import { CheckCircle, XCircle, Star, Package, Trash2 } from "lucide-react";
import { useToast } from "../ui/Toast";
import type { Review, Product } from "@/lib/types";

interface Props {
  reviews:  Review[];
  products: Product[];
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
  onDelete:  (id: string) => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i=><Star key={i} size={11} color="#f59e0b" fill={i<=rating?"#f59e0b":"none"}/>)}
    </div>
  );
}

export function ReviewsManager({ reviews, products, onApprove, onReject, onDelete }: Props) {
  const toast = useToast();
  const pending  = reviews.filter(r => !r.approved);
  const approved = reviews.filter(r => r.approved);

  const getProduct = (id: string) => products.find(p => p.id === id);

  const Section = ({ title, items, showActions }: { title:string; items:Review[]; showActions:boolean }) => (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase">{title} ({items.length})</p>
      {items.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <p className="text-sm text-neutral-400">{showActions ? "No hay reseñas pendientes de revisión" : "No hay reseñas aprobadas aún"}</p>
        </div>
      )}
      {items.map(r => {
        const prod = getProduct(r.productId);
        return (
          <div key={r.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="text-sm font-black text-black mb-0.5">{r.author}</p>
                <p className="text-[9px] text-neutral-400">{new Date(r.date).toLocaleString("es-VE")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Stars rating={r.rating}/>
                <span className="text-[10px] text-neutral-400">{r.rating}/5</span>
              </div>
            </div>
            {prod && (
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-2">
                <Package size={10}/><strong>{prod.name}</strong>
              </div>
            )}
            <p className="text-xs text-neutral-600 leading-relaxed mb-3">{r.comment}</p>
            {r.serviceRating && (
              <p className="text-[9px] text-neutral-400 mb-3 flex items-center gap-1">
                Servicio: <Stars rating={r.serviceRating}/>
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              {showActions && (
                <>
                  <button onClick={()=>{onApprove(r.id);toast("Reseña aprobada y publicada","✅");}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border-none cursor-pointer"
                    style={{background:"rgba(34,168,90,0.12)",color:"#22a85a"}}>
                    <CheckCircle size={12}/> APROBAR
                  </button>
                  <button onClick={()=>{onReject(r.id);toast("Reseña rechazada","🚫");}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border-none cursor-pointer"
                    style={{background:"rgba(229,62,62,0.10)",color:"#e53e3e"}}>
                    <XCircle size={12}/> RECHAZAR
                  </button>
                </>
              )}
              <button onClick={()=>{if(confirm("¿Eliminar esta reseña?")){onDelete(r.id);toast("Reseña eliminada","🗑️");}}}
                className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer text-neutral-300 hover:bg-red-500 hover:text-white transition-all"
                style={{background:"rgba(240,242,245,0.8)"}}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Reseñas de Clientes</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {pending.length} pendiente{pending.length!==1?"s":""} · {approved.length} publicada{approved.length!==1?"s":""}
        </p>
      </div>
      <Section title="Pendientes de Revisión" items={pending}  showActions={true}/>
      <Section title="Publicadas"              items={approved} showActions={false}/>
    </div>
  );
}
