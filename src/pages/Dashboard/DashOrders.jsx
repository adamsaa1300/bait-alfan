import { useState, useMemo } from "react";
import { useOrders } from "../../hooks/useOrders";
import { StatusBadge } from "./DashStats";
import ConfirmDialog from "../../components/ConfirmDialog";
import styles from "./Dashboard.module.css";

const IcEye   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcBox   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const IcPhone = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.9a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IcDownload = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;

const STATUSES = [
  { value:"all",       label:"الكل"        },
  { value:"pending",   label:"جديد"        },
  { value:"progress",  label:"قيد التجهيز" },
  { value:"shipped",   label:"تم الشحن"   },
  { value:"done",      label:"منجز"        },
  { value:"cancelled", label:"ملغي"        },
];

const STATUS_LABELS = {
  pending: "جديد", progress: "قيد التجهيز",
  shipped: "تم الشحن", done: "منجز", cancelled: "ملغي"
};

function exportToCSV(orders) {
  const rows = [["العميل","الهاتف","العنوان","المنتجات","المجموع","الحالة","التاريخ"]];
  orders.forEach(o => {
    rows.push([
      o.customerName || "", o.phone || "", o.address || "",
      (o.items || []).map(i => `${i.name} x${i.qty}`).join(" | "),
      o.total || 0,
      STATUS_LABELS[o.status] || o.status || "",
      o.createdAt?.toDate?.()?.toLocaleDateString("ar") || ""
    ]);
  });
  const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function DashOrders() {
  const { orders, loading, updateStatus, deleteOrder } = useOrders();
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = useMemo(() => {
    let list = filter === "all" ? orders : orders.filter(o => o.status === filter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(o =>
        (o.customerName || "").toLowerCase().includes(s) ||
        (o.phone || "").includes(s) ||
        (o.address || "").toLowerCase().includes(s) ||
        (o.items || []).some(i => i.name.toLowerCase().includes(s))
      );
    }
    return list;
  }, [orders, filter, search]);

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          سجل الطلبات
          {pendingCount > 0 && <span className={styles.notifDot}>{pendingCount}</span>}
        </h2>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontFamily:"var(--font-heading)",fontSize:"0.82rem",color:"var(--gray-400)",background:"var(--pink-50)",padding:"4px 12px",borderRadius:20}}>
            {filtered.length} / {orders.length}
          </span>
          {orders.length > 0 && (
            <button onClick={() => exportToCSV(filtered.length < orders.length ? filtered : orders)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,border:"1.5px solid var(--pink-200)",background:"white",color:"var(--pink-600)",fontFamily:"var(--font-heading)",fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>
              <IcDownload /> تصدير CSV
            </button>
          )}
        </div>
      </div>

      <div className={styles.ordersSearchWrap}>
        <IcSearch />
        <input className={styles.ordersSearch} placeholder="ابحث باسم العميل، هاتف، منتج..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button style={{background:"none",border:"none",cursor:"pointer",color:"var(--gray-400)",padding:"0 4px"}} onClick={() => setSearch("")}>✕</button>}
      </div>

      <div className={styles.filterTabs}>
        {STATUSES.map(s => {
          const cnt = s.value === "all" ? orders.length : orders.filter(o => o.status === s.value).length;
          return (
            <button key={s.value}
              className={`${styles.filterTab} ${filter===s.value ? styles.filterTabActive : ""}`}
              onClick={() => setFilter(s.value)}>
              {s.label}
              {cnt > 0 && <span style={{marginRight:4,fontSize:"0.68rem",opacity:0.7}}>({cnt})</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:40,color:"var(--gray-400)",fontFamily:"var(--font-heading)"}}>جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}><IcBox /><p>{search ? "لا توجد نتائج" : "لا يوجد طلبات"}</p></div>
      ) : (
        <>
          <div className={styles.tableWrapDesktop}>
            <table className={styles.table}>
              <thead><tr><th>العميل</th><th>الهاتف</th><th>المنتجات</th><th>المجموع</th><th>الحالة</th><th>التاريخ</th><th></th></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{fontWeight:700}}>{o.customerName||"—"}</td>
                    <td style={{direction:"ltr",fontSize:"0.8rem"}}>{o.phone||"—"}</td>
                    <td style={{color:"var(--gray-400)",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.78rem"}}>
                      {o.items?.map(i=>`${i.name} ×${i.qty}`).join("، ")||"—"}
                    </td>
                    <td style={{color:"var(--pink-600)",fontWeight:700,whiteSpace:"nowrap"}}>{o.total} ₪</td>
                    <td><StatusBadge status={o.status}/></td>
                    <td style={{color:"var(--gray-400)",fontSize:"0.75rem",whiteSpace:"nowrap"}}>{o.createdAt?.toDate?.()?.toLocaleDateString("ar")||"—"}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => setModal(o)}><IcEye /> تفاصيل</button>
                        <button className={`${styles.iconBtn} ${styles.btnDelete}`} onClick={() => setConfirmId(o.id)}><IcTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.orderCards}>
            {filtered.map(o => (
              <div key={o.id} className={`${styles.orderCard} ${o.status === "pending" ? styles.orderCardNew : ""}`}>
                <div className={styles.orderCardTop}>
                  <div style={{flex:1,minWidth:0}}>
                    <div className={styles.orderCardName}>{o.customerName||"—"}</div>
                    {o.phone && (
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
                        <IcPhone/>
                        <span style={{fontFamily:"var(--font-heading)",fontSize:"0.78rem",color:"var(--gray-400)",direction:"ltr"}}>{o.phone}</span>
                      </div>
                    )}
                  </div>
                  <span className={styles.orderCardDate} style={{flexShrink:0}}>{o.createdAt?.toDate?.()?.toLocaleDateString("ar")||""}</span>
                  <button className={styles.orderCardDelete} onClick={() => setConfirmId(o.id)}><IcTrash/></button>
                </div>

                {o.items?.length > 0 && (
                  <div className={styles.orderImgRow}>
                    {o.items.slice(0, 4).map((item, i) => (
                      <div key={i} className={styles.orderImgWrap}>
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt={item.name} className={styles.orderItemImg} />
                          : (<div className={styles.orderItemImgEmpty}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>)
                        }
                        <span className={styles.orderImgQty}>×{item.qty}</span>
                      </div>
                    ))}
                    {o.items.length > 4 && <div className={styles.orderImgMore}>+{o.items.length - 4}</div>}
                  </div>
                )}

                <div className={styles.orderCardItems}>{o.items?.map(i => `${i.name} ×${i.qty}`).join("، ")||"—"}</div>

                <div className={styles.orderCardBottom}>
                  <span className={styles.orderCardTotal}>{o.total} ₪</span>
                  <select className={styles.orderStatusSelect} value={o.status || "pending"}
                    onChange={e => updateStatus(o.id, e.target.value)} onClick={e => e.stopPropagation()}>
                    {STATUSES.filter(s => s.value !== "all").map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => setModal(o)}><IcEye/></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modal && (
        <div className={styles.overlay} onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>تفاصيل الطلب</h3>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div className={styles.infoBox}><p className={styles.infoLabel}>العميل</p><p className={styles.infoVal}>{modal.customerName||"—"}</p></div>
                <div className={styles.infoBox}><p className={styles.infoLabel}>الهاتف</p><p className={styles.infoVal} style={{direction:"ltr"}}>{modal.phone||"—"}</p></div>
              </div>
              {modal.address && (<div className={styles.infoBox}><p className={styles.infoLabel}>العنوان</p><p className={styles.infoVal}>{modal.address}</p></div>)}
              {modal.note && (
  <div className={styles.infoBoxWarn}>
    <p className={styles.infoLabel} style={{color:"#92400e"}}>ملاحظة</p>
    <p className={styles.infoVal} style={{color:"#92400e", wordBreak:"break-word", overflowWrap:"anywhere", whiteSpace:"normal"}}>
      {modal.note}
    </p>
  </div>
)}
              <div>
                <p style={{fontSize:"0.78rem",fontWeight:700,color:"var(--gray-600)",fontFamily:"var(--font-heading)",marginBottom:8}}>المنتجات</p>
                <div style={{border:"1.5px solid #f0e6f8",borderRadius:10,overflow:"hidden"}}>
                  {modal.items?.map((item,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:"1px solid #faf0ff",background:i%2===0?"white":"#fdf9ff"}}>
                      <span style={{fontFamily:"var(--font-heading)",fontSize:"0.88rem"}}>{item.name} × {item.qty}</span>
                      <span style={{fontFamily:"var(--font-heading)",color:"var(--pink-600)",fontWeight:700,whiteSpace:"nowrap"}}>{((item.salePrice||item.price)*item.qty).toFixed(0)} ₪</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",background:"var(--pink-50)"}}>
                    <span style={{fontFamily:"var(--font-heading)",fontWeight:700}}>المجموع</span>
                    <span style={{fontFamily:"var(--font-heading)",color:"var(--pink-600)",fontWeight:800,fontSize:"1.05rem"}}>{modal.total} ₪</span>
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>تغيير الحالة</label>
                <select className={styles.formSelect} value={modal.status}
                  onChange={e => { updateStatus(modal.id,e.target.value); setModal({...modal,status:e.target.value}); }}>
                  {STATUSES.filter(s=>s.value!=="all").map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className="btn-primary" onClick={() => setModal(null)}>إغلاق</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!confirmId} title="حذف الطلبية؟" message="رح تُحذف الطلبية نهائياً ومش رح تقدر ترجعها."
        confirmText="حذف" onConfirm={() => { deleteOrder(confirmId); setConfirmId(null); }} onCancel={() => setConfirmId(null)} />
    </div>
  );
}