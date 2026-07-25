"use client";
import { useState } from "react";
import { Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

/**
 * ReferralInput — Se monta en el CartDrawer, paso de pago
 * Permite al cliente ingresar un código de referido para obtener descuento
 */
export function ReferralInput({
  cartTotal,
  onApply,
  onRemove,
  appliedCode,
  discount,
}: {
  cartTotal:    number;
  onApply:      (code: string, discount: number, referralId: string) => void;
  onRemove:     () => void;
  appliedCode?: string;
  discount?:    number;
}) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const apply = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError("");
    const sb = createClient();
    const { data, error: err } = await sb
      .from("referrals")
      .select("id, discount, active, uses")
      .eq("code", clean)
      .single();

    if (err || !data) {
      setError("Código no válido o inexistente.");
    } else if (!data.active) {
      setError("Este código ya no está activo.");
    } else {
      onApply(clean, 3, data.id); // siempre 3% para el cliente nuevo
      setCode("");
    }
    setLoading(false);
  };

  const discountAmount = appliedCode && discount ? (cartTotal * discount) / 100 : 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase flex items-center gap-1.5">
        <Tag size={11}/> Código de referido (opcional)
      </p>

      {appliedCode ? (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-green-50 border border-green-200/60">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600"/>
            <div>
              <p className="text-[11px] font-black text-green-700">{appliedCode} — {discount}% OFF</p>
              <p className="text-[10px] text-green-600">Ahorras {discountAmount.toFixed(2)}€</p>
            </div>
          </div>
          <button onClick={onRemove}
            className="text-green-400 hover:text-red-400 cursor-pointer border-none bg-transparent transition-colors">
            <XCircle size={16}/>
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && apply()}
            placeholder="FIT-CODIGO"
            maxLength={20}
            className="flex-1 border border-neutral-200/80 px-3 py-2.5 text-sm bg-white/72 rounded-xl font-[inherit] tracking-wider font-bold outline-none"
          />
          <button onClick={apply} disabled={loading || !code.trim()}
            className="px-4 py-2.5 rounded-xl text-white text-[11px] font-black border-none cursor-pointer disabled:opacity-40 flex items-center gap-1"
            style={{background:"rgba(17,17,17,0.90)"}}>
            {loading ? <Loader2 size={14} className="animate-spin"/> : "Aplicar"}
          </button>
        </div>
      )}
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
    </div>
  );
}
