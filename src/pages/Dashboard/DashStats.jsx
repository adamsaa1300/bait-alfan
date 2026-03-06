import { useMemo } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useOrders } from "../../hooks/useOrders";
import styles from "./Dashboard.module.css";

const IcBag    = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IcCheck  = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcClose  = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcTag    = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcGrid   = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IcBox    = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IcBell   = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcDone   = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcMoney  = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IcCal    = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcEye    = ({c}) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcBoxEmpty = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;

export function StatusBadge({ status }) {
  const map = {
    pending:  { label: "جديد",         bg: "#fef3c7", color: "#d97706" },
    progress: { label: "قيد التجهيز", bg: "#ede9fe", color: "#7c3aed" },
    shipped:  { label: "تم الشحن",    bg: "#dbeafe", color: "#2563eb" },
    done:     { label: "منجز",         bg: "#d1fae5", color: "#059669" },
    cancelled:{ label: "ملغي",         bg: "#fee2e2", color: "#dc2626" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{background:s.bg,color:s.color,padding:"3px 10px",borderRadius:20,fontSize:"0.75rem",fontFamily:"var(--font-heading)",fontWeight:700,whiteSpace:"nowrap"}}>{s.label}</span>
  );
}

export default function DashStats() {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { orders } = useOrders();

  const s = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayOrders  = orders.filter(o => o.createdAt?.toDate?.() >= todayStart);
    const monthOrders  = orders.filter(o => o.createdAt?.toDate?.() >= monthStart);
    const doneOrders   = orders.filter(o => o.status === "done");
    const revenue = doneOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const todayRevenue = todayOrders.filter(o => o.status === "done").reduce((acc, o) => acc + (o.total || 0), 0);
    const productCounts = {};
    orders.forEach(o => { (o.items || []).forEach(item => { productCounts[item.name] = (productCounts[item.name] || 0) + (item.qty || 1); }); });
    const topProducts = Object.entries(productCounts).sort(([,a],[,b]) => b - a).slice(0, 5).map(([name, count]) => ({ name, count }));
    const topViewed = [...products].sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 5);
    return {
      available: products.filter(p => p.available).length,
      unavailable: products.filter(p => !p.available).length,
      withDiscount: products.filter(p => p.salePrice && p.salePrice < p.price).length,
      pending: orders.filter(o => o.status === "pending").length,
      done: doneOrders.length,
      todayOrders: todayOrders.length,
      monthOrders: monthOrders.length,
      revenue, todayRevenue, topProducts, topViewed,
    };
  }, [products, orders]);

  const cards = [
    { label: "طلبات اليوم",     value: s.todayOrders,          Ic: IcCal,   color: "#f97316" },
    { label: "طلبات الشهر",     value: s.monthOrders,          Ic: IcBox,   color: "#06b6d4" },
    { label: "إجمالي الطلبات", value: orders.length,          Ic: IcBag,   color: "#ec4899" },
    { label: "طلبات جديدة",    value: s.pending,              Ic: IcBell,  color: "#f59e0b" },
    { label: "طلبات منجزة",    value: s.done,                 Ic: IcDone,  color: "#10b981" },
    { label: "المبيعات الكلية", value: `${s.revenue} ₪`,      Ic: IcMoney, color: "#8b5cf6" },
    { label: "مبيعات اليوم",   value: `${s.todayRevenue} ₪`, Ic: IcMoney, color: "#22c55e" },
    { label: "إجمالي المنتجات",value: products.length,        Ic: IcBag,   color: "#ec4899" },
    { label: "متوفر",           value: s.available,           Ic: IcCheck, color: "#22c55e" },
    { label: "غير متوفر",      value: s.unavailable,         Ic: IcClose, color: "#ef4444" },
    { label: "عليها خصم",      value: s.withDiscount,        Ic: IcTag,   color: "#f59e0b" },
    { label: "الأصناف",        value: categories.length,      Ic: IcGrid,  color: "#8b5cf6" },
  ];

  return (
    <div>
      <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>الإحصائيات</h2></div>

      <div className={styles.statsGrid}>
        {cards.map((c, i) => (
          <div key={i} className={styles.statCard} style={{"--accent": c.color}}>
            <div className={styles.statIcon}><c.Ic c={c.color} /></div>
            <div className={styles.statValue}>{c.value}</div>
            <div className={styles.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {s.topProducts.length > 0 && (
        <div style={{marginTop:28}}>
          <h3 className={styles.subTitle}>🏆 أكثر المنتجات طلباً</h3>
          <div className={styles.topList}>
            {s.topProducts.map((p, i) => (
              <div key={i} className={styles.topListItem}>
                <span className={styles.topListRank}>{i + 1}</span>
                <span className={styles.topListName}>{p.name}</span>
                <span className={styles.topListVal}>{p.count} طلب</span>
                <div className={styles.topListBar}><div className={styles.topListBarFill} style={{width:`${Math.round((p.count/s.topProducts[0].count)*100)}%`,background:"var(--pink-400)"}} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {s.topViewed.filter(p => (p.views||0) > 0).length > 0 && (
        <div style={{marginTop:24}}>
          <h3 className={styles.subTitle}>👁 أكثر المنتجات مشاهدةً</h3>
          <div className={styles.topList}>
            {s.topViewed.filter(p => (p.views||0) > 0).map((p, i) => (
              <div key={i} className={styles.topListItem}>
                <span className={styles.topListRank}>{i + 1}</span>
                <span className={styles.topListName}>{p.name}</span>
                <span className={styles.topListVal}>{p.views} مشاهدة</span>
                <div className={styles.topListBar}><div className={styles.topListBarFill} style={{width:`${Math.round(((p.views||0)/(s.topViewed[0]?.views||1))*100)}%`,background:"#8b5cf6"}} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div style={{marginTop:24}}>
          <h3 className={styles.subTitle}>آخر الطلبات</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>العميل</th><th>المنتجات</th><th>المجموع</th><th>الحالة</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td style={{fontWeight:600}}>{o.customerName||"—"}</td>
                    <td style={{color:"var(--gray-400)",fontSize:"0.78rem",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.items?.map(i => i.name).join("، ")||"—"}</td>
                    <td style={{color:"var(--pink-600)",fontWeight:700,whiteSpace:"nowrap"}}>{o.total} ₪</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orders.length === 0 && <div className={styles.emptyState}><IcBoxEmpty /><p>لا يوجد طلبات بعد</p></div>}
    </div>
  );
}