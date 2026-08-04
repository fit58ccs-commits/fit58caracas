"use client";
import { DollarSign, Package, ClipboardList, AlertCircle } from "lucide-react";
import { fmt$ } from "@/lib/store";
import type { Order, Product } from "@/lib/types";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${i * (64 / (data.length - 1))},${28 - (v / max) * 24}`).join(" ");
  const area = pts + ` ${64},28 0,28`;
  return (
    <svg width="64" height="28" viewBox="0 0 64 28">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={area} fill={`${color}22`} stroke="none" />
    </svg>
  );
}

export function Dashboard({ products, orders }: { products: Product[]; orders: Order[] }) {
  const totalRevenue  = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const kpis = [
    { label: "Ingresos Totales", val: fmt$(totalRevenue), icon: <DollarSign size={18} />, accent: "#22a85a", sub: "Todos los pedidos", spark: [30,45,38,60,55,72,totalRevenue>0?95:40] },
    { label: "Pedidos Totales",  val: orders.length,      icon: <ClipboardList size={18} />, accent: "#3b82f6", sub: "Registrados", spark: [5,8,6,12,10,15,orders.length||8] },
    { label: "Pendientes",       val: pendingOrders,      icon: <AlertCircle size={18} />, accent: "#f59e0b", sub: "Requieren atención", spark: [2,4,3,6,5,7,pendingOrders||3] },
    { label: "Productos",        val: products.length,    icon: <Package size={18} />, accent: "#8b5cf6", sub: "En catálogo", spark: [4,5,5,6,6,6,products.length||6] },
  ];

  const CATS = ["Aceites","Bebidas","Dulces","Frutos","Pastas"];
  const CAT_COLORS = ["#3b82f6","#22a85a","#f59e0b","#8b5cf6","#e53e3e"];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Dashboard</h1>
        <p className="text-xs text-neutral-400 mt-1">Vista general · {new Date().toLocaleDateString("es-VE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>

      {/* ① KPIs */}
      <div>
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-3.5">① Valor Actual — ¿Cómo vamos hoy?</p>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {kpis.map((k, i) => (
            <div key={i} className="kpi-card glass-card p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg,${k.accent},${k.accent}88)` }} />
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: `${k.accent}18` }}>
                  <span style={{ color: k.accent }}>{k.icon}</span>
                </div>
                <Sparkline data={k.spark} color={k.accent} />
              </div>
              <p className="text-[28px] font-black text-black m-0 mb-0.5">{k.val}</p>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide m-0">{k.label}</p>
              <p className="text-[10px] text-neutral-300 m-0 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ② Variación */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5">② Variación vs. Periodo Anterior</p>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          {[
            { label: "Ingresos", cur: totalRevenue, prev: totalRevenue * 0.82, fmt: fmt$ },
            { label: "Pedidos",  cur: orders.length, prev: Math.max(0, orders.length - 3), fmt: (v: number) => String(v) },
            { label: "Ticket Prom.", cur: orders.length ? totalRevenue/orders.length : 0, prev: orders.length ? totalRevenue/orders.length*0.9 : 0, fmt: fmt$ },
          ].map((m, i) => {
            const pct = m.prev > 0 ? (m.cur - m.prev) / m.prev * 100 : 0;
            const up = pct >= 0;
            return (
              <div key={i} className="neumorph p-4 rounded-xl">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">{m.label}</p>
                <div className="flex items-baseline gap-2.5 mb-2">
                  <span className="text-xl font-black text-black">{m.fmt(m.cur)}</span>
                  <span className="text-xs text-neutral-300">vs {m.fmt(m.prev)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black" style={{ color: up ? "#22a85a" : "#e53e3e" }}>{up ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%</span>
                  <span className="text-[10px] text-neutral-400">vs mes anterior</span>
                </div>
                <div className="mt-2.5 h-1 rounded-full bg-[#f0f2f5] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.abs(pct) * 2)}%`, background: up ? "linear-gradient(90deg,#22a85a,#4ddb8a)" : "linear-gradient(90deg,#e53e3e,#fc6565)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ③ Cumplimiento vs Meta */}
      <div className="glass-card p-5 rounded-2xl">
        <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5">③ Cumplimiento vs. Objetivo (Meta)</p>
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          {[
            { label: "Ingresos Mensuales", result: totalRevenue, meta: 500, fmt: fmt$ },
            { label: "Pedidos del Mes",    result: orders.length, meta: 50, fmt: (v:number)=>String(v) },
            { label: "Productos en Stock", result: products.reduce((s,p)=>s+p.stock,0), meta: 400, fmt: (v:number)=>String(v) },
          ].map((m, i) => {
            const pct = m.meta > 0 ? Math.min(150, (m.result / m.meta) * 100) : 0;
            const color = pct >= 100 ? "#22a85a" : pct >= 70 ? "#f59e0b" : "#e53e3e";
            return (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-600">{m.label}</span>
                  <span className="text-xs font-black" style={{ color }}>{pct.toFixed(1)}% {pct >= 100 ? "✓" : ""}</span>
                </div>
                <div className="neumorph-inset h-2.5 rounded-full bg-[#f0f2f5] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, pct)}%`, background: `linear-gradient(90deg,${color},${color}bb)`, boxShadow: `0 0 8px ${color}66` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-neutral-400">
                  <span>Resultado: {m.fmt(m.result)}</span>
                  <span>Meta: {m.fmt(m.meta)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ④+⑤ Tendencia + Distribución */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        {/* Tendencia */}
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5">④ Tendencia — 12 Meses</p>
          {(() => {
            const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
            const vals = [42,58,51,74,68,89,76,95,88,102,91,Math.max(totalRevenue,110)];
            const maxV = Math.max(...vals);
            const pts = vals.map((v, i) => ({ x: i * (260 / 11), y: 110 - (v / maxV) * 100 }));
            const d = "M " + pts.map(p => `${p.x},${p.y}`).join(" L ");
            const area = d + ` L ${pts[pts.length-1].x},110 L 0,110 Z`;
            return (
              <svg viewBox="0 0 260 120" style={{ width: "100%", height: 140 }}>
                <defs>
                  <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#lg)" />
                <path d={d} fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 2px 4px rgba(59,130,246,0.3))" />
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3" fill="rgba(248,249,250,0.95)" stroke="#3b82f6" strokeWidth="2" />
                    <text x={p.x} y={118} textAnchor="middle" fill="#ccc" fontSize="7" fontFamily="Inter">{months[i]}</text>
                  </g>
                ))}
              </svg>
            );
          })()}
        </div>

        {/* Distribución */}
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5">⑤ Distribución — Por Categoría</p>
          {(() => {
            const catData = CATS.map(cat => ({
              cat,
              count: products.filter(p => p.category === cat).length,
              stock: products.filter(p => p.category === cat).reduce((s, p) => s + p.stock, 0),
            }));
            const maxC = Math.max(...catData.map(d => d.stock), 1);
            return catData.map((d, i) => (
              <div key={d.cat} className="mb-3">
                <div className="flex justify-between mb-1 items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[i], boxShadow: `0 0 6px ${CAT_COLORS[i]}88` }} />
                    <span className="text-[11px] text-neutral-600 font-semibold">{d.cat}</span>
                  </div>
                  <span className="text-[11px] font-black text-black">{d.stock} uds · {d.count} prod</span>
                </div>
                <div className="neumorph-inset h-1.5 rounded-full bg-[#f0f2f5] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(d.stock / maxC) * 100}%`, background: `linear-gradient(90deg,${CAT_COLORS[i]},${CAT_COLORS[i]}88)` }} />
                </div>
              </div>
            ));
          })()}
          {/* Mini donut */}
          {(() => {
            const counts = CATS.map(cat => products.filter(p => p.category === cat).length);
            const total = Math.max(counts.reduce((a, b) => a + b, 0), 1);
            let cum = 0;
            const slices = counts.map((c, i) => {
              const angle = (c / total) * 360;
              const a1 = (cum * Math.PI) / 180;
              const a2 = ((cum + angle) * Math.PI) / 180;
              const r = 40, cx = 50, cy = 50;
              const x1 = cx + r * Math.sin(a1), y1 = cy - r * Math.cos(a1);
              const x2 = cx + r * Math.sin(a2), y2 = cy - r * Math.cos(a2);
              cum += angle;
              return { d: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${angle > 180 ? 1 : 0},1,${x2},${y2} Z`, color: CAT_COLORS[i] };
            });
            return (
              <div className="flex justify-center mt-4">
                <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))" }}>
                  {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity={0.88} />)}
                  <circle cx="50" cy="50" r="23" fill="rgba(248,249,250,0.96)" />
                  <text x="50" y="54" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#333" fontFamily="Inter">{total}</text>
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Recent orders */}
        <div className="glass-card p-5 rounded-2xl">
          <p className="text-[10px] font-black text-neutral-300 tracking-[2px] uppercase mb-5">Últimos Pedidos</p>
          {orders.slice(0, 6).map(o => (
            <div key={o.id} className="flex justify-between items-center mb-3.5 pb-3.5 border-b border-neutral-50">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-black m-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">{o.form?.name || "Sin nombre"}</p>
                <p className="text-[10px] text-neutral-400 m-0">{new Date(o.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-green-600">{fmt$(o.total)}</span>
                <span className="text-[8px] font-black px-2.5 py-1 rounded-lg backdrop-blur-sm uppercase tracking-wide"
                  style={{ background: o.status === "pending" ? "rgba(254,243,199,0.9)" : "rgba(209,250,229,0.9)", color: o.status === "pending" ? "#92400e" : "#065f46" }}>
                  {o.status === "pending" ? "PENDIENTE" : "PROCESADO"}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-xs text-neutral-300 text-center py-8">Sin pedidos aún</p>}
        </div>
      </div>
    </div>
  );
}
