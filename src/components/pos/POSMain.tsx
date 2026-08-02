"use client";
import React, { useState, useMemo } from "react";
import { fmt$, fmtBs } from "@/lib/store";
import type { POSCashier } from "./POSApp";
import type { Product, CartItem } from "@/lib/types";

type Tab = "pos" | "orders" | "inventory" | "shift";

const PAYMENT_METHODS = ["Efectivo USD", "Efectivo Bs", "Pago Móvil", "Zelle", "Binance"];

interface Payment { method: string; amount: number; currency: "EUR" | "BS"; }

interface Discount { type: "percent" | "fixed"; value: number; }

export default function POSMain({ store, cashier, shiftStart, onLogout }: {
  store: ReturnType<typeof import("@/lib/store").useAppStore>;
  cashier: POSCashier;
  shiftStart: string;
  onLogout: () => void;
}) {
  const [tab,        setTab]       = useState<Tab>("pos");
  const [search,     setSearch]    = useState("");
  const [category,   setCategory]  = useState("Todos");
  const [cart,       setCart]      = useState<CartItem[]>([]);
  const [showCart,   setShowCart]  = useState(false);
  const [showPay,    setShowPay]   = useState(false);
  const [payments,   setPayments]  = useState<Payment[]>([{ method: "Efectivo USD", amount: 0, currency: "EUR" }]);
  const [discount,   setDiscount]  = useState<Discount | null>(null);
  const [discInput,  setDiscInput] = useState("");
  const [discType,   setDiscType]  = useState<"percent"|"fixed">("percent");
  const [paying,     setPaying]    = useState(false);
  const [success,    setSuccess]   = useState<string | null>(null);
  const [orderFilter,setOrderFilter] = useState<"all"|"web"|"pos">("all");
  const [shiftSales, setShiftSales] = useState<{total:number; count:number; breakdown:Record<string,number>}>({ total:0, count:0, breakdown:{} });

  const { products, orders, rate, rateBCV, saveOrder, updateOrderStatus } = store;

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p:Product) => p.category).filter(Boolean))];
    return ["Todos", ...cats];
  }, [products]);

  const filtered = useMemo(() => products.filter((p:Product) => {
    const matchCat    = category === "Todos" || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [products, category, search]);

  const cartTotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s,i) => s + i.qty, 0);
  const discAmount = !discount ? 0 : discount.type === "percent"
    ? cartTotal * discount.value / 100
    : Math.min(discount.value, cartTotal);
  const finalTotal = Math.max(0, cartTotal - discAmount);

  const totalPaid = payments.reduce((s,p) => s + (p.currency === "BS" ? p.amount / rate.value : p.amount), 0);
  const change    = totalPaid - finalTotal;

  const addItem = (p: Product) => {
    setCart(c => {
      const ex = c.find(i => i.id === p.id);
      if (ex) return c.map(i => i.id === p.id ? { ...i, qty: i.qty+1 } : i);
      return [...c, { id:p.id, name:p.name, price:p.price, qty:1, img:p.img }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(c => c.map(i => i.id === id ? {...i, qty: Math.max(0, i.qty+delta)} : i).filter(i => i.qty > 0));
  };

  const clearCart = () => { setCart([]); setDiscount(null); setPayments([{ method:"Efectivo USD", amount:0, currency:"EUR" }]); };

  const handleCharge = async () => {
    if (totalPaid < finalTotal - 0.01) return;
    setPaying(true);
    try {
      await saveOrder({
        total: finalTotal,
        cart:  [...cart],
        form: {
          name:     cashier?.name ?? "POS",
          phone:    "",
          time:     "",
          address:  "Venta en tienda — POS",
          method:   payments[0]?.method ?? "Efectivo USD",
          payments: payments.map(p => ({ ...p, receipt: null })),
          totalPaid,
          balance:  Math.max(0, change),
        },
      });
      // Update shift
      const method = payments[0]?.method ?? "Efectivo USD";
      setShiftSales(s => ({
        total: s.total + finalTotal,
        count: s.count + 1,
        breakdown: { ...s.breakdown, [method]: (s.breakdown[method]??0) + finalTotal },
      }));
      setShowPay(false);
      clearCart();
      setSuccess(`✅ Venta de ${fmt$(finalTotal)} registrada`);
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setPaying(false);
    }
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2,"0")}`;
  };

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${d.getMinutes().toString().padStart(2,"0")}`;
  };

  const filteredOrders = orders.filter((o:any) => orderFilter === "all" ? true : o.source === orderFilter);
  const pendingWeb     = orders.filter((o:any) => o.source !== "pos" && o.status === "pending").length;

  const S = styles;

  return (
    <div style={S.root}>
      <style>{css}</style>

      {/* ── Toast ── */}
      {success && (
        <div style={S.toast}>{success}</div>
      )}

      {/* ── Header ── */}
      <div style={S.header}>
        <div>
          <span style={S.logo}>FIT 58 POS</span>
          <span style={S.cashierLabel}>{cashier.name}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {cartCount > 0 && (
            <button style={S.cartBtn} onClick={() => setShowCart(true)} className="pos-btn">
              🛒 <span style={S.cartBadge}>{cartCount}</span> {fmt$(finalTotal)}
            </button>
          )}
          <button style={S.iconBtn} onClick={onLogout} className="pos-btn" title="Salir">⏏</button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        {([
          { id:"pos",       label:"🏪 POS"       },
          { id:"orders",    label:`📋 Pedidos${pendingWeb > 0 ? ` (${pendingWeb})`:""}`    },
          { id:"inventory", label:"📦 Inventario" },
          { id:"shift",     label:"📊 Turno"      },
        ] as {id:Tab,label:string}[]).map(t => (
          <button key={t.id} className="pos-btn"
            onClick={() => setTab(t.id)}
            style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ POS TAB ══════════════════════════════════════════════ */}
      {tab === "pos" && (
        <div style={S.content}>
          {/* Search + Categories */}
          <div style={S.searchRow}>
            <input style={S.search} placeholder="Buscar producto..." value={search}
              onChange={e => setSearch(e.target.value)}/>
          </div>
          <div style={S.catsRow}>
            {categories.map((c:string) => (
              <button key={c} className="pos-btn"
                style={{ ...S.cat, ...(category===c ? S.catActive : {}) }}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={S.grid}>
            {filtered.map((p:Product) => {
              const inCart = cart.find(i => i.id === p.id);
              return (
                <button key={p.id} className="pos-card" style={S.card} onClick={() => addItem(p)}>
                  <img src={p.img || p.images?.[0] || "/placeholder.png"} alt={p.name}
                    style={S.cardImg} onError={e => { (e.target as HTMLImageElement).src="/placeholder.png"; }}/>
                  <div style={S.cardName}>{p.name}</div>
                  <div style={S.cardPrices}>
                    <span style={S.cardPrice}>{fmt$(p.price)}</span>
                    <span style={S.cardPriceBs}>{fmtBs(p.price, rate.value)}</span>
                  </div>
                  {inCart && <div style={S.cardQty}>{inCart.qty}</div>}
                  {p.stock <= 0 && <div style={S.soldOut}>SIN STOCK</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ ORDERS TAB ═══════════════════════════════════════════ */}
      {tab === "orders" && (
        <div style={S.content}>
          <div style={S.filterRow}>
            {(["all","web","pos"] as const).map(f => (
              <button key={f} className="pos-btn"
                style={{ ...S.filterBtn, ...(orderFilter===f ? S.filterBtnActive : {}) }}
                onClick={() => setOrderFilter(f)}>
                {f === "all" ? "Todos" : f === "web" ? "🌐 Web" : "🏪 POS"}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filteredOrders.map((o:any) => (
              <div key={o.id} style={S.orderCard}>
                <div style={S.orderTop}>
                  <div>
                    <span style={S.orderId}>#{o.id.slice(-8).toUpperCase()}</span>
                    <span style={S.orderDate}>{fmtDate(o.date)}</span>
                  </div>
                  <span style={{ ...S.statusBadge, background: STATUS_BG[o.status], color: STATUS_COLOR[o.status] }}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div style={S.orderMid}>
                  <span style={S.orderName}>{o.form?.name}</span>
                  <span style={S.orderSource}>{o.source === "web" ? "🌐" : "🏪"}</span>
                </div>
                <div style={S.orderBottom}>
                  <span style={S.orderItems}>{o.cart?.length} producto(s)</span>
                  <span style={S.orderTotal}>{fmt$(o.total)}</span>
                </div>
                {o.status === "pending" && (
                  <div style={{ display:"flex", gap:6, marginTop:8 }}>
                    <button className="pos-btn" style={S.processBtn}
                      onClick={() => updateOrderStatus(o.id, "processed")}>✅ Procesado</button>
                    <button className="pos-btn" style={S.cancelBtn}
                      onClick={() => updateOrderStatus(o.id, "cancelled")}>❌ Cancelar</button>
                  </div>
                )}
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div style={S.empty}>No hay pedidos</div>
            )}
          </div>
        </div>
      )}

      {/* ══ INVENTORY TAB ════════════════════════════════════════ */}
      {tab === "inventory" && (
        <div style={S.content}>
          <div style={S.statsRow}>
            <div style={S.stat}><span style={S.statVal}>{products.length}</span><span style={S.statLabel}>Productos</span></div>
            <div style={S.stat}><span style={{ ...S.statVal, color:"#f59e0b" }}>{products.filter((p:Product)=>p.stock>0&&p.stock<=3).length}</span><span style={S.statLabel}>Stock bajo</span></div>
            <div style={S.stat}><span style={{ ...S.statVal, color:"#ef4444" }}>{products.filter((p:Product)=>p.stock<=0).length}</span><span style={S.statLabel}>Agotados</span></div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {products.map((p:Product) => (
              <div key={p.id} style={S.invCard}>
                <div style={{ flex:1 }}>
                  <div style={S.invName}>{p.name}</div>
                  <div style={S.invCat}>{p.category}</div>
                </div>
                <div style={{
                  ...S.stockBadge,
                  background: p.stock <= 0 ? "#fef2f2" : p.stock <= 3 ? "#fffbeb" : "#f0fdf4",
                  color:      p.stock <= 0 ? "#ef4444" : p.stock <= 3 ? "#f59e0b" : "#16a34a",
                }}>
                  {p.stock} uds
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ SHIFT TAB ════════════════════════════════════════════ */}
      {tab === "shift" && (
        <div style={S.content}>
          <div style={S.shiftCard}>
            <div style={S.shiftLabel}>INICIO DEL TURNO</div>
            <div style={S.shiftTime}>{fmtTime(shiftStart)}</div>
            <div style={S.shiftCashier}>Cajero: {cashier.name}</div>
          </div>
          <div style={S.statsRow}>
            <div style={S.stat}><span style={S.statVal}>{shiftSales.count}</span><span style={S.statLabel}>Ventas</span></div>
            <div style={S.stat}>
              <span style={S.statVal}>{fmt$(shiftSales.total)}</span>
              <span style={S.statLabel}>Total</span>
              <span style={{ fontSize:10, color:"#999" }}>{fmtBs(shiftSales.total, rate.value)}</span>
            </div>
          </div>
          {Object.keys(shiftSales.breakdown).length > 0 && (
            <div style={S.shiftCard}>
              <div style={S.shiftLabel}>DESGLOSE POR MÉTODO</div>
              {Object.entries(shiftSales.breakdown).map(([m,v]) => (
                <div key={m} style={S.breakdownRow}>
                  <span style={S.breakdownMethod}>{m}</span>
                  <span style={S.breakdownTotal}>{fmt$(v as number)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...S.shiftCard, background:"#f0fdf4" }}>
            <div style={S.shiftLabel}>EQUIV. BCV</div>
            <div style={{ ...S.shiftTime, color:"#16a34a" }}>{fmt$(shiftSales.total * rate.value / rateBCV.value)}</div>
            <div style={S.shiftCashier}>Tasa BCV: {rateBCV.value} Bs/€</div>
          </div>
          <button className="pos-btn" style={S.logoutBtn} onClick={() => {
            if (confirm("¿Cerrar turno y salir?")) onLogout();
          }}>
            🔒 Cerrar turno y salir
          </button>
        </div>
      )}

      {/* ══ CART DRAWER ══════════════════════════════════════════ */}
      {showCart && (
        <div style={S.overlay} onClick={() => setShowCart(false)}>
          <div style={S.drawer} onClick={e => e.stopPropagation()}>
            <div style={S.drawerHeader}>
              <span style={S.drawerTitle}>Carrito</span>
              <button style={S.closeBtn} className="pos-btn" onClick={() => setShowCart(false)}>✕</button>
            </div>
            <div style={S.drawerBody}>
              {cart.map(item => (
                <div key={item.id} style={S.cartItem}>
                  <div style={{ flex:1 }}>
                    <div style={S.cartItemName}>{item.name}</div>
                    <div style={S.cartItemPrice}>{fmt$(item.price)} c/u</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button className="pos-btn" style={S.qtyBtn} onClick={() => updateQty(item.id,-1)}>−</button>
                    <span style={S.qty}>{item.qty}</span>
                    <button className="pos-btn" style={S.qtyBtn} onClick={() => updateQty(item.id,+1)}>+</button>
                    <span style={S.cartItemTotal}>{fmt$(item.price*item.qty)}</span>
                  </div>
                </div>
              ))}

              {/* Discount */}
              <div style={S.discBlock}>
                <div style={S.shiftLabel}>DESCUENTO</div>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  {(["percent","fixed"] as const).map(t => (
                    <button key={t} className="pos-btn"
                      style={{ ...S.discTypeBtn, ...(discType===t ? S.discTypeBtnActive : {}) }}
                      onClick={() => setDiscType(t)}>
                      {t === "percent" ? "% Porcentaje" : "€ Fijo"}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input style={S.discInput} type="number"
                    value={discInput} onChange={e => setDiscInput(e.target.value)}
                    placeholder={discType === "percent" ? "10" : "5.00"}/>
                  <button className="pos-btn" style={S.discApplyBtn}
                    onClick={() => {
                      const v = parseFloat(discInput);
                      if (!isNaN(v) && v > 0) { setDiscount({type:discType,value:v}); }
                    }}>
                    Aplicar
                  </button>
                </div>
                {discount && (
                  <div style={S.discApplied}>
                    <span>✅ −{discount.type==="percent" ? `${discount.value}%` : fmt$(discount.value)} = −{fmt$(discAmount)}</span>
                    <button className="pos-btn" style={{ background:"none",border:"none",cursor:"pointer",color:"#999" }}
                      onClick={() => setDiscount(null)}>✕</button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={S.totalsBlock}>
                {discAmount > 0 && <>
                  <div style={S.totalRow}><span>Subtotal</span><span>{fmt$(cartTotal)}</span></div>
                  <div style={{ ...S.totalRow, color:"#16a34a" }}><span>Descuento</span><span>−{fmt$(discAmount)}</span></div>
                </>}
                <div style={S.totalRowMain}>
                  <span>TOTAL</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={S.totalVal}>{fmt$(finalTotal)}</div>
                    <div style={{ fontSize:11, color:"#999" }}>{fmtBs(finalTotal, rate.value)}</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={S.drawerFooter}>
              <button className="pos-btn" style={S.clearBtn} onClick={() => { clearCart(); setShowCart(false); }}>🗑️ Vaciar</button>
              <button className="pos-btn" style={S.chargeBtn}
                onClick={() => { setShowCart(false); setShowPay(true); }}>
                💳 COBRAR {fmt$(finalTotal)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PAYMENT MODAL ════════════════════════════════════════ */}
      {showPay && (
        <div style={S.overlay} onClick={() => setShowPay(false)}>
          <div style={S.drawer} onClick={e => e.stopPropagation()}>
            <div style={S.drawerHeader}>
              <span style={S.drawerTitle}>Cobro</span>
              <button style={S.closeBtn} className="pos-btn" onClick={() => setShowPay(false)}>✕</button>
            </div>
            <div style={S.drawerBody}>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={S.totalVal}>{fmt$(finalTotal)}</div>
                <div style={{ fontSize:13, color:"#999" }}>{fmtBs(finalTotal, rate.value)}</div>
              </div>

              {payments.map((pm, idx) => (
                <div key={idx} style={S.payBlock}>
                  <div style={S.shiftLabel}>MÉTODO {idx+1}</div>
                  <div style={S.methodsRow}>
                    {PAYMENT_METHODS.map(m => (
                      <button key={m} className="pos-btn"
                        style={{ ...S.methodBtn, ...(pm.method===m ? S.methodBtnActive : {}) }}
                        onClick={() => setPayments(p => p.map((x,i) => i===idx
                          ? {...x, method:m, currency: m.includes("Bs")||m==="Pago Móvil" ? "BS":"EUR"} : x))}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <input style={S.amountInput} type="number"
                    placeholder={pm.currency==="BS" ? `Bs. ${(finalTotal*rate.value).toFixed(0)}` : fmt$(finalTotal)}
                    value={pm.amount > 0 ? pm.amount : ""}
                    onChange={e => setPayments(p => p.map((x,i) => i===idx ? {...x,amount:parseFloat(e.target.value)||0} : x))}/>
                  {pm.currency==="BS" && pm.amount > 0 && (
                    <div style={S.bsEquiv}>
                      Bs. {pm.amount.toLocaleString("es-VE")} ÷ {rateBCV.value} (BCV) = {fmt$(pm.amount/rateBCV.value)}
                    </div>
                  )}
                </div>
              ))}

              <button className="pos-btn" style={S.addMethodBtn}
                onClick={() => setPayments(p => [...p, {method:"Efectivo USD",amount:0,currency:"EUR"}])}>
                + Agregar método
              </button>

              {totalPaid > 0 && (
                <div style={{ ...S.changeBox, background: change>=0 ? "#f0fdf4":"#fffbeb" }}>
                  <span style={{ fontSize:11, fontWeight:800, color: change>=0?"#16a34a":"#d97706", textTransform:"uppercase", letterSpacing:1 }}>
                    {change >= 0 ? "VUELTO" : "FALTA"}
                  </span>
                  <span style={{ fontSize:24, fontWeight:900, color:"#111" }}>{fmt$(Math.abs(change))}</span>
                </div>
              )}
            </div>
            <div style={S.drawerFooter}>
              <button className="pos-btn" style={S.clearBtn} onClick={() => setShowPay(false)}>← Volver</button>
              <button className="pos-btn"
                style={{ ...S.chargeBtn, ...(paying || totalPaid < finalTotal-0.01 ? {background:"#ccc"} : {}) }}
                disabled={paying || totalPaid < finalTotal - 0.01}
                onClick={handleCharge}>
                {paying ? "..." : "✅ REGISTRAR VENTA"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<string,string> = { pending:"⏳ Pendiente", processed:"✅ Procesado", cancelled:"❌ Cancelado" };
const STATUS_BG:    Record<string,string> = { pending:"#fffbeb",      processed:"#f0fdf4",      cancelled:"#fef2f2"     };
const STATUS_COLOR: Record<string,string> = { pending:"#f59e0b",      processed:"#16a34a",      cancelled:"#ef4444"     };

const styles: Record<string, React.CSSProperties> = {
  root:           { minHeight:"100vh", background:"#f8f6f3", fontFamily:"system-ui,sans-serif", paddingBottom:80 },
  header:         { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"#fff", borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, zIndex:10 },
  logo:           { fontSize:17, fontWeight:900, color:"#111", letterSpacing:-0.5 },
  cashierLabel:   { fontSize:11, color:"#999", marginLeft:10 },
  cartBtn:        { display:"flex", alignItems:"center", gap:6, background:"#111", color:"#fff", border:"none", borderRadius:20, padding:"8px 14px", fontSize:13, fontWeight:800, cursor:"pointer" },
  cartBadge:      { background:"#ef4444", borderRadius:10, padding:"1px 6px", fontSize:10 },
  iconBtn:        { background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#666", padding:8 },
  tabs:           { display:"flex", gap:0, background:"#fff", borderBottom:"1px solid #f0f0f0", overflowX:"auto" },
  tab:            { flex:1, padding:"12px 8px", border:"none", background:"none", fontSize:11, fontWeight:700, color:"#888", cursor:"pointer", whiteSpace:"nowrap", borderBottom:"2px solid transparent" },
  tabActive:      { color:"#111", borderBottomColor:"#111" },
  content:        { padding:"12px 12px 0", maxWidth:900, margin:"0 auto" },
  searchRow:      { marginBottom:10 },
  search:         { width:"100%", boxSizing:"border-box", background:"#f5f5f5", border:"none", borderRadius:12, padding:"10px 14px", fontSize:14, color:"#111", outline:"none" },
  catsRow:        { display:"flex", gap:8, overflowX:"auto", paddingBottom:10 },
  cat:            { padding:"6px 14px", borderRadius:20, background:"#f0f0f0", border:"none", fontSize:12, fontWeight:700, color:"#555", cursor:"pointer", whiteSpace:"nowrap" },
  catActive:      { background:"#111", color:"#fff" },
  grid:           { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:10, paddingBottom:20 },
  card:           { background:"#fff", border:"none", borderRadius:14, padding:10, cursor:"pointer", textAlign:"left", position:"relative", overflow:"hidden" },
  cardImg:        { width:"100%", height:90, objectFit:"contain", borderRadius:8, marginBottom:6 },
  cardName:       { fontSize:10, fontWeight:800, color:"#111", textTransform:"uppercase", marginBottom:4, lineHeight:1.3, overflow:"hidden", maxHeight: 30 } as React.CSSProperties,
  cardPrices:     { display:"flex", flexDirection:"column", gap:1 },
  cardPrice:      { fontSize:14, fontWeight:900, color:"#111" },
  cardPriceBs:    { fontSize:9, color:"#999" },
  cardQty:        { position:"absolute", top:8, right:8, background:"#111", color:"#fff", borderRadius:10, width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900 },
  soldOut:        { position:"absolute", inset:0, background:"rgba(255,255,255,0.88)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:900, color:"#ef4444", letterSpacing:1, borderRadius:14 },
  filterRow:      { display:"flex", gap:8, marginBottom:12 },
  filterBtn:      { flex:1, padding:"8px 0", border:"none", borderRadius:20, background:"#f0f0f0", fontSize:12, fontWeight:700, color:"#555", cursor:"pointer" },
  filterBtnActive:{ background:"#111", color:"#fff" },
  orderCard:      { background:"#fff", borderRadius:12, padding:14 },
  orderTop:       { display:"flex", justifyContent:"space-between", marginBottom:8 },
  orderId:        { fontSize:12, fontWeight:900, color:"#111", marginRight:8 },
  orderDate:      { fontSize:10, color:"#999" },
  statusBadge:    { fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:20 },
  orderMid:       { display:"flex", justifyContent:"space-between", marginBottom:6 },
  orderName:      { fontSize:13, fontWeight:700, color:"#333" },
  orderSource:    { fontSize:14 },
  orderBottom:    { display:"flex", justifyContent:"space-between" },
  orderItems:     { fontSize:11, color:"#999" },
  orderTotal:     { fontSize:15, fontWeight:900, color:"#111" },
  processBtn:     { flex:1, padding:"8px 0", background:"#f0fdf4", color:"#16a34a", border:"none", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer" },
  cancelBtn:      { flex:1, padding:"8px 0", background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:8, fontSize:12, fontWeight:800, cursor:"pointer" },
  statsRow:       { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 },
  stat:           { background:"#fff", borderRadius:12, padding:14, display:"flex", flexDirection:"column", alignItems:"center" },
  statVal:        { fontSize:22, fontWeight:900, color:"#111" },
  statLabel:      { fontSize:9, color:"#999", textTransform:"uppercase", letterSpacing:1, marginTop:2 },
  invCard:        { background:"#fff", borderRadius:12, padding:14, display:"flex", alignItems:"center" },
  invName:        { fontSize:13, fontWeight:800, color:"#111" },
  invCat:         { fontSize:10, color:"#999", marginTop:2 },
  stockBadge:     { fontSize:11, fontWeight:800, padding:"4px 12px", borderRadius:20 },
  shiftCard:      { background:"#fff", borderRadius:14, padding:16, marginBottom:12 },
  shiftLabel:     { fontSize:9, fontWeight:900, color:"#999", letterSpacing:2, textTransform:"uppercase", marginBottom:10 },
  shiftTime:      { fontSize:36, fontWeight:900, color:"#111" },
  shiftCashier:   { fontSize:12, color:"#999", marginTop:4 },
  breakdownRow:   { display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f5f5f5" },
  breakdownMethod:{ fontSize:13, color:"#333" },
  breakdownTotal: { fontSize:13, fontWeight:900, color:"#111" },
  logoutBtn:      { width:"100%", padding:"14px 0", background:"#ef4444", color:"#fff", border:"none", borderRadius:14, fontSize:14, fontWeight:900, cursor:"pointer", marginTop:8 },
  empty:          { textAlign:"center", color:"#999", padding:40, fontSize:14 },
  toast:          { position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", background:"#111", color:"#fff", padding:"12px 24px", borderRadius:20, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" },
  overlay:        { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", justifyContent:"flex-end" },
  drawer:         { width:"min(420px, 100vw)", background:"#f8f6f3", display:"flex", flexDirection:"column", maxHeight:"100vh" },
  drawerHeader:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 16px", background:"#fff", borderBottom:"1px solid #f0f0f0" },
  drawerTitle:    { fontSize:20, fontWeight:900, color:"#111" },
  closeBtn:       { background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#999" },
  drawerBody:     { flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 },
  drawerFooter:   { display:"flex", gap:10, padding:16, background:"#fff", borderTop:"1px solid #f0f0f0" },
  cartItem:       { background:"#fff", borderRadius:12, padding:14, display:"flex", alignItems:"center", gap:12 },
  cartItemName:   { fontSize:13, fontWeight:800, color:"#111", marginBottom:2 },
  cartItemPrice:  { fontSize:11, color:"#999" },
  cartItemTotal:  { fontSize:14, fontWeight:900, color:"#111", minWidth:50, textAlign:"right" },
  qtyBtn:         { width:30, height:30, borderRadius:15, background:"#f0f0f0", border:"none", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  qty:            { fontSize:16, fontWeight:900, color:"#111", minWidth:24, textAlign:"center" },
  discBlock:      { background:"#fff", borderRadius:12, padding:14 },
  discTypeBtn:    { flex:1, padding:"8px 0", border:"none", borderRadius:10, background:"#f0f0f0", fontSize:12, fontWeight:700, color:"#555", cursor:"pointer" },
  discTypeBtnActive:{ background:"#111", color:"#fff" },
  discInput:      { flex:1, background:"#f5f5f5", border:"none", borderRadius:10, padding:"10px 12px", fontSize:14, color:"#111", outline:"none" },
  discApplyBtn:   { background:"#111", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px", fontSize:12, fontWeight:800, cursor:"pointer" },
  discApplied:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, background:"#f0fdf4", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#16a34a", fontWeight:700 },
  totalsBlock:    { background:"#fff", borderRadius:12, padding:14 },
  totalRow:       { display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12, color:"#888" },
  totalRowMain:   { display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid #f0f0f0", paddingTop:10, marginTop:4 },
  totalVal:       { fontSize:28, fontWeight:900, color:"#111" },
  clearBtn:       { padding:"14px 16px", borderRadius:14, background:"#f0f0f0", border:"none", fontSize:13, fontWeight:700, color:"#555", cursor:"pointer" },
  chargeBtn:      { flex:1, padding:"14px 0", borderRadius:14, background:"#111", border:"none", color:"#fff", fontSize:14, fontWeight:900, cursor:"pointer" },
  payBlock:       { background:"#fff", borderRadius:12, padding:14 },
  methodsRow:     { display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 },
  methodBtn:      { padding:"6px 12px", border:"none", borderRadius:20, background:"#f0f0f0", fontSize:11, fontWeight:700, color:"#555", cursor:"pointer" },
  methodBtnActive:{ background:"#111", color:"#fff" },
  amountInput:    { width:"100%", boxSizing:"border-box", background:"#f5f5f5", border:"none", borderRadius:10, padding:"12px 14px", fontSize:18, fontWeight:800, color:"#111", outline:"none" },
  bsEquiv:        { fontSize:11, color:"#999", marginTop:6 },
  addMethodBtn:   { width:"100%", padding:"12px 0", border:"1px dashed #ddd", borderRadius:12, background:"none", color:"#888", fontSize:13, fontWeight:700, cursor:"pointer" },
  changeBox:      { borderRadius:12, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center" },
};

const css = `
  .pos-btn:hover { opacity: 0.85; }
  .pos-btn:active { transform: scale(0.97); }
  .pos-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); transition: all 0.15s; }
  * { -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
`;
