"use client";
/**
 * BIModule.tsx — Inteligencia de Negocios
 * Integrado al admin panel de Fit +58 Caracas
 * Fuente de datos: store (orders + products)
 */
import { useState, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  AlertCircle, Info, Target, BarChart3, RefreshCw,
  CheckCircle, Package, XCircle,
} from "lucide-react";
import type { Order, Product } from "@/lib/types";

interface Props {
  orders:   Order[];
  products: Product[];
  rate:     number;
}

type BITab = "kpis" | "metas" | "tendencias" | "alertas" | "cierre";

/* ── Helpers ─────────────────────────────────────────────── */
const fmt$ = (n: number) => `$${Number(n || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtN = (n: number) => Number(n || 0).toLocaleString("es-VE", { minimumFractionDigits: 0 });

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function getDayKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function currentMonth() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}
function prevMonth() {
  const n = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

interface KPIResult {
  income: number; count: number; units: number; avgTicket: number; clients: number;
}
function calcKPIs(orders: Order[]): KPIResult {
  const income    = orders.reduce((s, o) => s + (o.total || 0), 0);
  const count     = orders.length;
  const units     = orders.reduce((s, o) => s + o.cart.reduce((a, i) => a + i.qty, 0), 0);
  const avgTicket = count > 0 ? income / count : 0;
  const clients   = new Set(orders.map(o => o.form?.name || o.form?.phone || "anon").filter(Boolean)).size;
  return { income, count, units, avgTicket, clients };
}
function variation(curr: number, prev: number) {
  if (prev === 0 && curr === 0) return { pct: 0, dir: "flat" as const };
  if (prev === 0) return { pct: 100, dir: "up" as const };
  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  return { pct: Math.abs(pct), dir: pct > 2 ? "up" as const : pct < -2 ? "down" as const : "flat" as const };
}

/* ── Sub-components ─────────────────────────────────────── */
function TabBtn({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide border-none cursor-pointer transition-all"
      style={{
        background: active ? "rgba(17,17,17,0.88)" : "rgba(240,242,245,0.8)",
        color:      active ? "#fff" : "#888",
        boxShadow:  active ? "0 4px 14px rgba(0,0,0,0.18)" : "none",
      }}>
      {label}
    </button>
  );
}

function KPICard({ label, value, trend, color }: {
  label: string; value: string; trend: { pct: number; dir: "up"|"down"|"flat" }; color: string;
}) {
  const Icon = trend.dir === "up" ? TrendingUp : trend.dir === "down" ? TrendingDown : Minus;
  const trendColor = trend.dir === "up" ? "#22a85a" : trend.dir === "down" ? "#e53e3e" : "#888";
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden kpi-card">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }}/>
      <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-3">{label}</p>
      <p className="text-2xl font-black text-black tracking-tight mb-2">{value}</p>
      <div className="flex items-center gap-1.5 text-[10px] font-bold rounded-full px-2.5 py-1 w-fit"
        style={{ background: trendColor + "15", color: trendColor }}>
        <Icon size={11}/>
        {trend.dir === "flat" ? "Sin variación" : `${trend.pct.toFixed(1)}% vs mes anterior`}
      </div>
    </div>
  );
}

/* ── CIERRE DE CAJA ─────────────────────────────────────── */
function CierreCaja({ orders }: { orders: Order[] }) {
  const now      = new Date();
  const [month, setMonth] = useState(currentMonth());

  const dayMap = useMemo(() => {
    const map: Record<string, { orders: Order[]; total: number; count: number; units: number; methods: Record<string, number> }> = {};
    orders.filter(o => getMonthKey(o.date) === month).forEach(o => {
      const day = getDayKey(o.date);
      if (!map[day]) map[day] = { orders: [], total: 0, count: 0, units: 0, methods: {} };
      map[day].orders.push(o);
      map[day].total += o.total || 0;
      map[day].count += 1;
      map[day].units += o.cart.reduce((a, i) => a + i.qty, 0);
      const method = o.form?.method || "Sin especificar";
      map[day].methods[method] = (map[day].methods[method] || 0) + (o.total || 0);
    });
    return map;
  }, [orders, month]);

  const days = Object.keys(dayMap).sort().reverse();
  const totalMes = days.reduce((s, d) => s + dayMap[d].total, 0);
  const pedidosMes = days.reduce((s, d) => s + dayMap[d].count, 0);

  // Generar todos los días del mes seleccionado
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(y, m - 1, i + 1);
    return `${y}-${String(m).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
  }).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-black uppercase tracking-tight m-0">Cierre de Caja</h2>
          <p className="text-xs text-neutral-400 mt-1">Resumen diario de ventas por mes</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="field-input border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-xl font-[inherit]"/>
      </div>

      {/* Totales del mes */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))" }}>
        {[
          { label:"Total del Mes",    value: fmt$(totalMes),    color:"#22a85a" },
          { label:"Pedidos del Mes",  value: fmtN(pedidosMes),  color:"#3b82f6" },
          { label:"Días con ventas",  value: fmtN(days.length), color:"#f59e0b" },
          { label:"Promedio por día", value: fmt$(days.length > 0 ? totalMes / days.length : 0), color:"#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }}/>
            <p className="text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase mb-2">{label}</p>
            <p className="text-2xl font-black text-black tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla día por día */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100/80">
          <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase m-0">
            Detalle por Día — {month}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50/80">
                {["Fecha","Día","Pedidos","Unidades","Total","Método Principal","Estado"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-neutral-400 tracking-[1.5px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allDays.map(dayKey => {
                const d = dayMap[dayKey];
                const date = new Date(dayKey + "T12:00:00");
                const dayName = date.toLocaleDateString("es-VE", { weekday: "short" });
                const dayNum  = date.getDate();
                const isToday = getDayKey(new Date().toISOString()) === dayKey;
                const hasData = !!d;

                const mainMethod = hasData
                  ? Object.entries(d.methods).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
                  : "—";

                return (
                  <tr key={dayKey}
                    className="border-t border-neutral-100/60 transition-colors hover:bg-neutral-50/50"
                    style={{ background: isToday ? "rgba(34,168,90,0.04)" : undefined }}>
                    <td className="px-5 py-3 font-semibold text-black text-xs">
                      {dayNum} {date.toLocaleDateString("es-VE", { month: "short" })} {y}
                      {isToday && <span className="ml-2 text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black uppercase">Hoy</span>}
                    </td>
                    <td className="px-5 py-3 text-[11px] font-bold text-neutral-500 uppercase">{dayName}</td>
                    <td className="px-5 py-3 font-black text-black">{hasData ? d.count : "—"}</td>
                    <td className="px-5 py-3 text-neutral-600">{hasData ? d.units : "—"}</td>
                    <td className="px-5 py-3 font-black" style={{ color: hasData && d.total > 0 ? "#22a85a" : "#aaa" }}>
                      {hasData && d.total > 0 ? fmt$(d.total) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-neutral-500">{mainMethod}</td>
                    <td className="px-5 py-3">
                      {!hasData
                        ? <span className="text-[9px] text-neutral-300 font-semibold uppercase">Sin ventas</span>
                        : <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">Cerrado</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totales */}
            <tfoot>
              <tr className="border-t-2 border-neutral-200/60 bg-neutral-50/80">
                <td colSpan={2} className="px-5 py-3 text-[10px] font-black text-neutral-500 uppercase tracking-wide">TOTAL MES</td>
                <td className="px-5 py-3 font-black text-black">{pedidosMes}</td>
                <td className="px-5 py-3 font-black text-black">
                  {days.reduce((s, d) => s + dayMap[d].units, 0)}
                </td>
                <td className="px-5 py-3 font-black text-lg" style={{ color: "#22a85a" }}>{fmt$(totalMes)}</td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── KPIs TAB ───────────────────────────────────────────── */
function KPIsTab({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<"current"|"prev"|"7d"|"30d"|"all">("current");

  const filtered = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const d = new Date(o.date);
      if (period === "current") return getMonthKey(o.date) === currentMonth();
      if (period === "prev")    return getMonthKey(o.date) === prevMonth();
      if (period === "7d")      return (now.getTime() - d.getTime()) <= 7 * 86400000;
      if (period === "30d")     return (now.getTime() - d.getTime()) <= 30 * 86400000;
      return true;
    });
  }, [orders, period]);

  const prevFiltered = useMemo(() => {
    const now = new Date();
    if (period === "current") return orders.filter(o => getMonthKey(o.date) === prevMonth());
    if (period === "7d")  return orders.filter(o => { const d = new Date(o.date); return (now.getTime()-d.getTime())>7*86400000 && (now.getTime()-d.getTime())<=14*86400000; });
    if (period === "30d") return orders.filter(o => { const d = new Date(o.date); return (now.getTime()-d.getTime())>30*86400000 && (now.getTime()-d.getTime())<=60*86400000; });
    return [];
  }, [orders, period]);

  const curr = calcKPIs(filtered);
  const prev = calcKPIs(prevFiltered);

  const PERIODS = [
    { key:"current", label:"Mes actual"    },
    { key:"prev",    label:"Mes anterior"  },
    { key:"7d",      label:"Últimos 7 días"},
    { key:"30d",     label:"Últimos 30 días"},
    { key:"all",     label:"Todo"          },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border-none cursor-pointer transition-all"
            style={{
              background: period === p.key ? "rgba(17,17,17,0.88)" : "rgba(240,242,245,0.8)",
              color:      period === p.key ? "#fff" : "#888",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))" }}>
        <KPICard label="💰 Ventas Totales"  value={fmt$(curr.income)}    trend={variation(curr.income,   prev.income)}   color="#22a85a"/>
        <KPICard label="🧾 Ticket Promedio" value={fmt$(curr.avgTicket)} trend={variation(curr.avgTicket,prev.avgTicket)} color="#3b82f6"/>
        <KPICard label="👥 Pedidos"         value={fmtN(curr.count)}     trend={variation(curr.count,    prev.count)}    color="#f59e0b"/>
        <KPICard label="📦 Unidades"        value={fmtN(curr.units)}     trend={variation(curr.units,    prev.units)}    color="#8b5cf6"/>
      </div>

      {/* Orders by payment method */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase mb-4">Ventas por método de pago</p>
        {(() => {
          const methods: Record<string, number> = {};
          filtered.forEach(o => {
            const m = o.form?.method || "Sin especificar";
            methods[m] = (methods[m] || 0) + (o.total || 0);
          });
          const total = Object.values(methods).reduce((s, v) => s + v, 0);
          return Object.entries(methods).sort((a, b) => b[1] - a[1]).map(([m, v]) => (
            <div key={m} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-neutral-600">{m}</span>
                <span className="text-xs font-black text-black">{fmt$(v)}</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-black transition-all" style={{ width: `${total > 0 ? (v / total) * 100 : 0}%` }}/>
              </div>
            </div>
          ));
        })()}
        {filtered.length === 0 && <p className="text-sm text-neutral-400 text-center py-4">Sin datos para el período seleccionado</p>}
      </div>
    </div>
  );
}

/* ── METAS TAB ──────────────────────────────────────────── */
interface Goal { id: string; label: string; period: string; target: number; kpi: "income"|"count"|"units"|"avgTicket"; }

function MetasTab({ orders }: { orders: Order[] }) {
  const [goals, setGoals] = useState<Goal[]>(() => {
    try { return JSON.parse(localStorage.getItem("fit58_bi_goals") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ label:"", period: currentMonth(), target:"", kpi:"income" as Goal["kpi"] });

  const save = () => {
    if (!form.label || !form.period || !form.target) return;
    const newGoals = [...goals, { id: Date.now().toString(36), ...form, target: parseFloat(form.target) }];
    setGoals(newGoals);
    localStorage.setItem("fit58_bi_goals", JSON.stringify(newGoals));
    setForm(f => ({ ...f, label:"", target:"" }));
  };

  const del = (id: string) => {
    const ng = goals.filter(g => g.id !== id);
    setGoals(ng);
    localStorage.setItem("fit58_bi_goals", JSON.stringify(ng));
  };

  const getActual = (g: Goal) => {
    const filtered = orders.filter(o => getMonthKey(o.date) === g.period);
    const k = calcKPIs(filtered);
    return k[g.kpi] || 0;
  };

  const KPI_LABELS: Record<string, string> = {
    income:"💰 Ventas (USD)", count:"🧾 Pedidos", units:"📦 Unidades", avgTicket:"🏷️ Ticket prom."
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Form */}
      <div className="glass-card rounded-2xl p-6">
        <p className="text-[10px] font-black text-neutral-400 tracking-[2px] uppercase mb-4">Nueva Meta</p>
        <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))" }}>
          <div>
            <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">KPI</label>
            <select value={form.kpi} onChange={e => setForm(f => ({ ...f, kpi: e.target.value as Goal["kpi"] }))}
              className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]">
              {Object.entries(KPI_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">Descripción</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Ej: Meta julio" className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"/>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">Mes</label>
            <input type="month" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
              className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"/>
          </div>
          <div>
            <label className="block text-[9px] font-bold text-neutral-400 tracking-wide uppercase mb-1">Objetivo</label>
            <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              placeholder="Ej: 5000" className="field-input w-full border border-neutral-200/80 px-3 py-2 text-sm bg-white/72 rounded-lg font-[inherit]"/>
          </div>
        </div>
        <button onClick={save}
          className="mt-4 px-5 py-2.5 text-[11px] font-black uppercase tracking-wide rounded-xl border-none cursor-pointer bg-black text-white">
          + Agregar Meta
        </button>
      </div>

      {/* Goals list */}
      <div className="flex flex-col gap-3">
        {goals.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Target size={32} className="mx-auto mb-3 text-neutral-300"/>
            <p className="text-sm text-neutral-400">Aún no hay metas. Agrega una arriba.</p>
          </div>
        )}
        {goals.map(g => {
          const actual = getActual(g);
          const pct    = Math.min((actual / g.target) * 100, 100);
          const color  = pct >= 100 ? "#22a85a" : pct >= 80 ? "#f59e0b" : pct >= 50 ? "#3b82f6" : "#e53e3e";
          return (
            <div key={g.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-black text-black mb-0.5">{g.label} — {g.period}</p>
                  <p className="text-[10px] text-neutral-400">{KPI_LABELS[g.kpi]} · Objetivo: {g.kpi==="income"||g.kpi==="avgTicket" ? fmt$(g.target) : fmtN(g.target)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black" style={{ color }}>
                    {g.kpi==="income"||g.kpi==="avgTicket" ? fmt$(actual) : fmtN(actual)}
                  </span>
                  <button onClick={() => del(g.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer bg-neutral-100 text-neutral-400 hover:bg-red-100 hover:text-red-500 transition-all">
                    <XCircle size={13}/>
                  </button>
                </div>
              </div>
              <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }}/>
              </div>
              <p className="text-[10px] font-bold mt-1.5" style={{ color }}>{pct.toFixed(1)}% completado</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── TENDENCIAS TAB ─────────────────────────────────────── */
function TendenciasTab({ orders, products }: { orders: Order[]; products: Product[] }) {
  const [filter, setFilter] = useState<"all"|"growth"|"decline"|"stagnant"|"unstable">("all");

  const enriched = useMemo(() => {
    const now = new Date();
    return products.map(p => {
      // Ventas últimos 3 meses
      const monthly = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
        const mk = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        return orders
          .filter(o => getMonthKey(o.date) === mk)
          .reduce((s, o) => s + o.cart.filter(c => c.id === p.id).reduce((a, c) => a + c.qty, 0), 0);
      });
      // Clasificar
      const avg = monthly.reduce((s, v) => s + v, 0) / 3;
      let trend: "growth"|"decline"|"stagnant"|"unstable" = "stagnant";
      if (avg > 0) {
        const std = Math.sqrt(monthly.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / 3);
        const cv  = std / avg;
        if (cv > 0.5) trend = "unstable";
        else {
          const ratio = (monthly[2] + 0.001) / (monthly[0] + 0.001);
          if (ratio >= 1.15) trend = "growth";
          else if (ratio <= 0.85) trend = "decline";
        }
      }
      return { ...p, monthly, trend };
    }).filter(p => filter === "all" || p.trend === filter);
  }, [orders, products, filter]);

  const TREND_META = {
    growth:   { label:"🟢 Crecimiento", color:"#22a85a" },
    decline:  { label:"🔴 Descenso",    color:"#e53e3e" },
    stagnant: { label:"⚫ Estancado",   color:"#888"    },
    unstable: { label:"🟡 Inestable",   color:"#f59e0b" },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap">
        {(["all","growth","decline","stagnant","unstable"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide border-none cursor-pointer transition-all"
            style={{ background:filter===f?"rgba(17,17,17,0.88)":"rgba(240,242,245,0.8)", color:filter===f?"#fff":"#888" }}>
            {f==="all"?"Todos":TREND_META[f].label}
          </button>
        ))}
      </div>

      {enriched.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-neutral-300"/>
          <p className="text-sm text-neutral-400">Sin productos para este filtro</p>
        </div>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))" }}>
        {enriched.map(p => {
          const m = TREND_META[p.trend];
          const maxV = Math.max(...p.monthly, 1);
          return (
            <div key={p.id} className="glass-card rounded-2xl p-4">
              <p className="text-[11px] font-black text-black mb-0.5 truncate">{p.name}</p>
              <p className="text-[9px] text-neutral-400 mb-3 uppercase tracking-wide">{p.category || "—"}</p>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5 mb-3" style={{ height: 40 }}>
                {p.monthly.map((v, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[8px] text-neutral-400">{v}</span>
                    <div className="w-full rounded-t-sm transition-all"
                      style={{ height: `${Math.max((v / maxV) * 32, 2)}px`, background: m.color, opacity: 0.6 + i * 0.2 }}/>
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                style={{ background: m.color + "20", color: m.color }}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── ALERTAS TAB ────────────────────────────────────────── */
function AlertasTab({ orders, products }: { orders: Order[]; products: Product[] }) {
  const alerts = useMemo(() => {
    const list: { id:string; type:string; severity:"critical"|"warning"|"info"; message:string; meta:string }[] = [];

    // Stock bajo
    products.forEach(p => {
      if (p.stock === 0) {
        list.push({ id:`sk0-${p.id}`, type:"stock", severity:"critical", message:`Sin stock: ${p.name}`, meta:`Categoría: ${p.category||"—"}` });
      } else if (p.stock <= 5) {
        list.push({ id:`skl-${p.id}`, type:"stock", severity:"warning", message:`Stock bajo: ${p.name} (${p.stock} uds)`, meta:`Categoría: ${p.category||"—"}` });
      }
    });

    // Sin ventas en 30 días con stock
    const now = new Date();
    products.filter(p => p.stock > 0).forEach(p => {
      const lastSale = orders.filter(o => o.cart.some(c => c.id === p.id)).pop();
      const days = lastSale ? Math.floor((now.getTime() - new Date(lastSale.date).getTime()) / 86400000) : 999;
      if (days > 30) {
        list.push({ id:`mv-${p.id}`, type:"movement", severity:"info",
          message:`Sin movimiento: ${p.name}`,
          meta: days > 900 ? `Stock: ${p.stock} uds · Nunca vendido` : `Stock: ${p.stock} uds · ${days} días sin venta` });
      }
    });

    // Mes sin ventas
    const curSales = orders.filter(o => getMonthKey(o.date) === currentMonth());
    if (curSales.length === 0) {
      list.push({ id:"no-sales", type:"kpi", severity:"critical", message:"Sin ventas registradas este mes", meta:"Registra pedidos desde el módulo Pedidos" });
    }

    // Pedidos pendientes
    const pending = orders.filter(o => o.status === "pending").length;
    if (pending > 0) {
      list.push({ id:"pending", type:"orders", severity:"warning", message:`${pending} pedido${pending > 1 ? "s" : ""} pendiente${pending > 1 ? "s" : ""} de procesar`, meta:"Ve a Pedidos para procesarlos" });
    }

    return list;
  }, [orders, products]);

  const ICONS = { critical: <AlertCircle size={16} className="shrink-0" style={{ color:"#e53e3e" }}/>, warning: <AlertTriangle size={16} className="shrink-0" style={{ color:"#f59e0b" }}/>, info: <Info size={16} className="shrink-0" style={{ color:"#3b82f6" }}/> };
  const BG    = { critical:"rgba(229,62,62,0.06)", warning:"rgba(245,158,11,0.06)", info:"rgba(59,130,246,0.06)" };
  const BORDER= { critical:"rgba(229,62,62,0.2)",  warning:"rgba(245,158,11,0.2)",  info:"rgba(59,130,246,0.15)" };

  return (
    <div className="flex flex-col gap-4">
      {alerts.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <CheckCircle size={36} className="mx-auto mb-3 text-green-400"/>
          <p className="text-sm font-semibold text-neutral-500">Todo en orden — Sin alertas activas</p>
        </div>
      )}
      {alerts.map(a => (
        <div key={a.id} className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ background: BG[a.severity], border: `1.5px solid ${BORDER[a.severity]}` }}>
          {ICONS[a.severity]}
          <div className="flex-1">
            <p className="text-sm font-bold text-black mb-0.5">{a.message}</p>
            <p className="text-xs text-neutral-500">{a.meta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────────── */
export function BIModule({ orders, products, rate }: Props) {
  const [tab, setTab] = useState<BITab>("kpis");

  // Excluir pedidos anulados de todos los calculos de BI
  const activeOrders = orders.filter(o => o.status !== "cancelled");

  const TABS: { key: BITab; label: string }[] = [
    { key:"kpis",        label:"📊 KPIs"        },
    { key:"metas",       label:"🎯 Metas"        },
    { key:"tendencias",  label:"📈 Tendencias"   },
    { key:"alertas",     label:"🚨 Alertas"      },
    { key:"cierre",      label:"🧾 Cierre de Caja"},
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-black uppercase tracking-tight m-0">Inteligencia de Negocios</h1>
        <p className="text-xs text-neutral-400 mt-1">
          {activeOrders.length} pedidos activos · {orders.filter(o=>o.status==="cancelled").length} anulados · {products.length} productos
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => <TabBtn key={t.key} label={t.label} active={tab === t.key} onClick={() => setTab(t.key)}/>)}
      </div>

      {/* Content */}
      {tab === "kpis"       && <KPIsTab       orders={activeOrders}/>}
      {tab === "metas"      && <MetasTab      orders={activeOrders}/>}
      {tab === "tendencias" && <TendenciasTab orders={activeOrders} products={products}/>}
      {tab === "alertas"    && <AlertasTab    orders={activeOrders} products={products}/>}
      {tab === "cierre"     && <CierreCaja    orders={activeOrders}/>}
    </div>
  );
}
