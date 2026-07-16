"use client";
/**
 * PurchasesManager.tsx — Módulo de Compras y Gastos
 * Registra entradas de inventario y gastos operativos.
 * Si el item tiene un producto asociado, suma el stock automáticamente.
 */
import { useState, useMemo } from "react";
import {
  Plus, Trash2, ShoppingBag, TrendingDown, Package,
  DollarSign, FileText, ChevronDown, Download,
} from "lucide-react";
import { genId, fmt$ } from "@/lib/store";
import { Btn, Field, Select, Modal } from "../ui/Primitives";
import { useToast } from "../ui/Toast";
import type { Product } from "@/lib/types";

/* ── Types ─────────────────────────────────────────────────── */
export interface Purchase {
  id:          string;
  date:        string;
  type:        "inventory" | "expense";  // compra de inventario o gasto
  category:    string;                   // "Productos", "Envío", "Publicidad", etc.
  description: string;
  supplier?:   string;
  productId?:  string;                   // si aplica a un producto del inventario
  qty?:        number;                   // unidades compradas
  unitCost?:   number;                   // costo por unidad
  total:       number;                   // total pagado
  method:      string;                   // método de pago usado
  receipt?:    string;                   // nombre del comprobante
  notes?:      string;
}

const EXPENSE_CATEGORIES = [
  "Productos / Inventario",
  "Envío y Logística",
  "Publicidad y Marketing",
  "Servicios (internet, hosting, etc.)",
  "Empaque y Materiales",
  "Equipos y Herramientas",
  "Comisiones y Honorarios",
  "Impuestos y Aranceles",
  "Otros Gastos",
];

const PAYMENT_METHODS = ["Efectivo (USD)","Efectivo (Bs.)","Pago Móvil","Zelle","Binance","Transferencia","Tarjeta"];

/* ── Empty form ─────────────────────────────────────────────── */
const emptyForm = (): Omit<Purchase,"id"|"date"> => ({
  type:        "inventory",
  category:    "Productos / Inventario",
  description: "",
  supplier:    "",
  productId:   "",
  qty:         1,
  unitCost:    0,
  total:       0,
  method:      "Efectivo (USD)",
  notes:       "",
});

/* ── Main component ─────────────────────────────────────────── */
interface Props {
  purchases:  Purchase[];
  products:   Product[];
  onAdd:      (p: Purchase) => void;
  onDelete:   (id: string) => void;
  onAddStock: (productId: string, qty: number) => void;
}

export function PurchasesManager({ purchases, products, onAdd, onDelete, onAddStock }: Props) {
  const toast   = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm());
  const [filter, setFilter]     = useState<"all"|"inventory"|"expense">("all");
  const [filterMonth, setFilterMonth] = useState("");

  const F = (k: keyof typeof form, v: unknown) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      // Auto-calcular total si cambia qty o unitCost
      if (k === "qty" || k === "unitCost") {
        updated.total = (updated.qty || 0) * (updated.unitCost || 0);
      }
      return updated;
    });
  };

  const handleAdd = () => {
    if (!form.description || form.total <= 0) {
      toast("Descripción y total son obligatorios", "⚠️");
      return;
    }
    const p: Purchase = { ...form, id: genId(), date: new Date().toISOString() };
    onAdd(p);

    // Si es inventario con producto asociado y cantidad → sumar stock
    if (form.type === "inventory" && form.productId && form.qty && form.qty > 0) {
      onAddStock(form.productId, form.qty);
      toast(`+${form.qty} unidades añadidas al stock de ${products.find(p=>p.id===form.productId)?.name}`, "📦");
    } else {
      toast("Compra/gasto registrado", "✅");
    }

    setForm(emptyForm());
    setShowForm(false);
  };

  // Filtrar
  const filtered = useMemo(() => {
    return purchases.filter(p => {
      const matchType  = filter === "all" || p.type === filter;
      const matchMonth = !filterMonth || p.date.startsWith(filterMonth);
      return matchType && matchMonth;
    });
  }, [purchases, filter, filterMonth]);

  // Totales
  const totalInventory = filtered.filter(p=>p.type==="inventory").reduce((s,p)=>s+p.total, 0);
  const totalExpenses  = filtered.filter(p=>p.type==="expense").reduce((s,p)=>s+p.total, 0);
  const totalAll       = totalInventory + totalExpenses;

  // Exportar CSV
  const exportCSV = () => {
    const bom  = "\uFEFF";
    const rows = [
      ["Fecha","Tipo","Categoría","Descripción","Proveedor","Producto","Cant.","Costo Unit.","Total","Método","Notas"],
      ...filtered.map(p => [
        new Date(p.date).toLocaleDateString("es-VE"),
        p.type === "inventory" ? "Inventario" : "Gasto",
        p.category,
        p.description,
        p.supplier||"",
        products.find(pr=>pr.id===p.productId)?.name||"",
        p.qty?.toString()||"",
        p.unitCost?.toFixed(2)||"",
        p.total.toFixed(2),
        p.method,
        p.notes||"",
      ])
    ];
    const csv  = bom + rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `compras_gastos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const selectedProduct = products.find(p => p.id === form.productId);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Compras & Gastos</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {purchases.length} registros · Inventario: {fmt$(totalInventory)} · Gastos: {fmt$(totalExpenses)}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={exportCSV}><Download size={13}/> EXPORTAR</Btn>
          <Btn variant="primary" onClick={()=>setShowForm(true)}><Plus size={13}/> REGISTRAR</Btn>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
        {[
          { label:"Total Invertido",  value:fmt$(totalAll),       color:"#111",     icon:<DollarSign size={18}/> },
          { label:"En Inventario",    value:fmt$(totalInventory), color:"#3b82f6",  icon:<Package size={18}/> },
          { label:"Gastos Operativos",value:fmt$(totalExpenses),  color:"#f59e0b",  icon:<TrendingDown size={18}/> },
          { label:"Registros",        value:filtered.length.toString(), color:"#22a85a", icon:<FileText size={18}/> },
        ].map(k => (
          <div key={k.label} className="glass-card rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{background:k.color}}/>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase m-0">{k.label}</p>
              <span style={{color:k.color}}>{k.icon}</span>
            </div>
            <p className="text-xl font-black text-black m-0">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {(["all","inventory","expense"] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide border-none cursor-pointer transition-all"
            style={{background:filter===f?"rgba(17,17,17,0.88)":"rgba(240,242,245,0.8)",color:filter===f?"#fff":"#888"}}>
            {f==="all"?"Todos":f==="inventory"?"Inventario":"Gastos"}
          </button>
        ))}
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
          className="field-input border border-neutral-200/80 px-3 py-1.5 text-sm bg-white/72 rounded-xl font-[inherit] ml-auto"/>
        {filterMonth && (
          <button onClick={()=>setFilterMonth("")}
            className="text-[10px] text-neutral-400 border-none bg-none cursor-pointer">Limpiar</button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100/80">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase m-0">
            {filtered.length} registro{filtered.length!==1?"s":""} · Total: {fmt$(totalAll)}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingBag size={36} className="mx-auto mb-3 text-neutral-200"/>
            <p className="text-sm font-semibold text-neutral-400">Sin registros aún</p>
            <button onClick={()=>setShowForm(true)}
              className="mt-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer bg-black text-white">
              + Registrar primera compra
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-50/80">
                  {["Fecha","Tipo","Descripción","Categoría","Proveedor","Producto","Cant.","Total","Método",""].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p,i) => {
                  const prod = products.find(pr => pr.id === p.productId);
                  return (
                    <tr key={p.id} className="border-t border-neutral-50 hover:bg-white/55 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString("es-VE")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            background:p.type==="inventory"?"rgba(59,130,246,0.10)":"rgba(245,158,11,0.10)",
                            color:p.type==="inventory"?"#3b82f6":"#f59e0b",
                          }}>
                          {p.type==="inventory"?"📦 Inventario":"💸 Gasto"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-black text-xs max-w-[180px] truncate">{p.description}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{p.category}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{p.supplier||"—"}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{prod?.name||"—"}</td>
                      <td className="px-4 py-3 text-xs text-center font-bold">{p.qty||"—"}</td>
                      <td className="px-4 py-3 font-black text-black whitespace-nowrap">{fmt$(p.total)}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{p.method}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>{if(confirm("¿Eliminar este registro?"))onDelete(p.id);}}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-300 hover:bg-red-500 hover:text-white cursor-pointer border-none transition-all"
                          style={{background:"rgba(240,242,245,0.8)"}}>
                          <Trash2 size={12}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-200/60 bg-neutral-50/80">
                  <td colSpan={7} className="px-4 py-3 text-[10px] font-black text-neutral-500 uppercase tracking-wide">TOTAL</td>
                  <td className="px-4 py-3 font-black text-lg text-black">{fmt$(totalAll)}</td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <Modal title="Registrar Compra / Gasto"
          subtitle="Si asocias un producto de inventario y cantidad, se suma al stock automáticamente"
          onClose={()=>{setShowForm(false);setForm(emptyForm());}}
          width="min(760px,96vw)"
          footer={
            <>
              <Btn variant="ghost" onClick={()=>{setShowForm(false);setForm(emptyForm());}}>CANCELAR</Btn>
              <Btn variant="green" onClick={handleAdd}><Plus size={13}/> GUARDAR REGISTRO</Btn>
            </>
          }>
          <div className="p-6 grid gap-4" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>

            {/* Tipo */}
            <div className="col-span-full">
              <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">Tipo de registro</p>
              <div className="flex gap-2">
                {[
                  { val:"inventory", label:"📦 Compra de Inventario", hint:"Suma stock al producto" },
                  { val:"expense",   label:"💸 Gasto Operativo",       hint:"No afecta inventario"  },
                ].map(t => (
                  <button key={t.val} onClick={()=>{F("type",t.val);F("category",t.val==="inventory"?"Productos / Inventario":"Envío y Logística");}}
                    className="flex-1 flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all text-left"
                    style={{
                      background: form.type===t.val?"rgba(17,17,17,0.06)":"rgba(240,242,245,0.8)",
                      borderColor: form.type===t.val?"#111":"rgba(220,220,220,0.8)",
                    }}>
                    <span className="text-xs font-black text-black">{t.label}</span>
                    <span className="text-[9px] text-neutral-400">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Descripción *" value={form.description} onChange={e=>F("description",e.target.value)}
              placeholder="Ej: Compra de Collagen 10 unidades" className="col-span-full"/>

            <Select label="Categoría" value={form.category} onChange={e=>F("category",e.target.value)}>
              {EXPENSE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </Select>

            <Field label="Proveedor / Tienda" value={form.supplier||""} onChange={e=>F("supplier",e.target.value)}
              placeholder="Ej: Sascha Fitness, Amazon..."/>

            {/* Producto del inventario */}
            <div className="col-span-full">
              <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">
                Producto del inventario {form.type==="inventory"?"(suma stock automático)":"(opcional)"}
              </label>
              <select value={form.productId||""} onChange={e=>F("productId",e.target.value)}
                className="field-input w-full border border-neutral-200/80 px-3.5 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit] appearance-none">
                <option value="">— Sin producto asociado —</option>
                {products.map(p=>(
                  <option key={p.id} value={p.id}>{p.name} (stock actual: {p.stock})</option>
                ))}
              </select>
              {selectedProduct && form.type==="inventory" && (
                <p className="text-[10px] text-green-600 mt-1 font-semibold">
                  ✓ Al guardar se sumará la cantidad al stock de "{selectedProduct.name}"
                </p>
              )}
            </div>

            {/* Cantidad y costos */}
            <Field label={`Cantidad ${form.type==="inventory"?"(unidades a entrar)":"(opcional)"}`}
              type="number" min="0" value={form.qty||""} onChange={e=>F("qty",parseInt(e.target.value)||0)}/>

            <Field label="Costo unitario ($)" type="number" step="0.01" min="0"
              value={form.unitCost||""} onChange={e=>F("unitCost",parseFloat(e.target.value)||0)}/>

            <Field label="Total pagado ($) *" type="number" step="0.01" min="0"
              value={form.total||""} onChange={e=>F("total",parseFloat(e.target.value)||0)}
              hint={form.qty&&form.unitCost?`Auto: ${fmt$(form.qty*form.unitCost)}`:""}/>

            <Select label="Método de pago" value={form.method} onChange={e=>F("method",e.target.value)}>
              {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
            </Select>

            <div className="col-span-full">
              <label className="block text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-1.5">Notas (opcional)</label>
              <textarea value={form.notes||""} onChange={e=>F("notes",e.target.value)} rows={2}
                className="field-input w-full border border-neutral-200/80 px-3.5 py-2.5 text-sm bg-white/72 rounded-lg font-[inherit] resize-none"
                placeholder="Observaciones, número de factura, etc."/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
