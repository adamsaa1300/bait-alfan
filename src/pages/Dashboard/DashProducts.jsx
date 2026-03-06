import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import ConfirmDialog from "../../components/ConfirmDialog";
import styles from "./Dashboard.module.css";

const IcCamera = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pink-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IcX = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const IcImg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const EMPTY = { name: "", price: "", salePrice: "", description: "", categoryId: "", available: true, images: [], tags: [] };

const CAMPAIGN_TAGS = [
  { value: "eid",     label: "العيد",         icon: "🌙", color: "#7c3aed" },
  { value: "wedding", label: "الأعراس",       icon: "💍", color: "#d97706" },
  { value: "sale",    label: "تخفيضات كبرى", icon: "🏷️", color: "#ef4444" },
];

export default function DashProducts() {
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleAvailable } = useProducts();
  const { categories } = useCategories();
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [editId, setEditId]           = useState(null);
  const [newImgFiles, setNewImgFiles] = useState([]);
  const [newImgPreviews, setNewImgPreviews] = useState([]);
  const [saving, setSaving]           = useState(false);
  const [search, setSearch]           = useState("");
  const [confirmId, setConfirmId]     = useState(null);

  const openAdd  = () => { setForm(EMPTY); setEditId(null); setNewImgFiles([]); setNewImgPreviews([]); setModal(true); };
  const openEdit = (p) => {
    setForm({ ...p, images: p.images || (p.imageUrl ? [p.imageUrl] : []) });
    setEditId(p.id); setNewImgFiles([]); setNewImgPreviews([]); setModal(true);
  };
  const close = () => { setModal(false); setSaving(false); };

  const handleImgs = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewImgFiles(prev => [...prev, ...files]);
    setNewImgPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImg = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  const removeNewImg = (idx) => {
    setNewImgFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImgPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = { ...form, price: form.price !== "" ? +form.price : null, salePrice: form.salePrice ? +form.salePrice : null };
      if (editId) await updateProduct(editId, data, newImgFiles);
      else await addProduct(data, newImgFiles);
      close();
    } catch (err) {
      alert("صار خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    search === "" || p.name.includes(search) ||
    categories.find(c => c.id === p.categoryId)?.name.includes(search)
  );

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>المنتجات</h2>
        <button className="btn-primary" onClick={openAdd}>+ إضافة منتج</button>
      </div>

      <div className={styles.listToolbar}>
        <input className={styles.searchInput} placeholder="بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
        <span className={styles.countBadge}>{filtered.length} منتج</span>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}><IcImg /><p>لا يوجد منتجات</p></div>
      ) : (
        <div className={styles.cardsGrid}>
          {filtered.map(p => {
            const catName = categories.find(c => c.id === p.categoryId)?.name;
            return (
              <div key={p.id} className={`${styles.productCard} ${!p.available ? styles.productCardUnavail : ""}`}>
                <div className={styles.productCardImg}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <div className={styles.productCardImgEmpty}><IcImg /></div>}
                  {p.images?.length > 1 && <span className={styles.imgCountBadge}>{p.images.length} 🖼</span>}
                  {p.salePrice && <span className={styles.saleBadge}>خصم</span>}
                </div>
                <div className={styles.productCardBody}>
                  <p className={styles.productCardName}>{p.name}</p>
                  {catName && <p className={styles.productCardCat}>{catName}</p>}
                  <div className={styles.productCardPrices}>
                    <span className={styles.productCardPrice}>{p.price != null ? `${p.price} ₪` : "تواصل للسعر"}</span>
                    {p.salePrice && <span className={styles.productCardSale}>{p.salePrice} ₪</span>}
                  </div>
                  <div className={styles.productCardAvail}>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={p.available} onChange={e => toggleAvailable(p.id, e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                    <span className={styles.availLabel}>{p.available ? "متوفر" : "نفذ"}</span>
                    {p.tags?.length > 0 && (
                      <span style={{marginRight:"auto",fontSize:"0.7rem",fontFamily:"var(--font-heading)",color:"var(--pink-400)",background:"var(--pink-50)",padding:"2px 8px",borderRadius:10}}>
                        {p.tags.length} حملة
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.productCardActions}>
                  <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => openEdit(p)}><IcEdit /> تعديل</button>
                  <button className={`${styles.iconBtn} ${styles.btnDelete}`} onClick={() => setConfirmId(p.id)}><IcTrash /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && close()}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
            <form onSubmit={handleSubmit}>

              {form.images?.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الصور الحالية ({form.images.length})</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{position:"relative"}}>
                        <img src={img} alt="" style={{width:68,height:68,objectFit:"cover",borderRadius:10,border:"2px solid var(--pink-200)",display:"block"}} />
                        {i === 0 && (
                          <span style={{position:"absolute",bottom:0,right:0,left:0,background:"rgba(236,72,153,0.8)",color:"white",fontSize:"0.58rem",fontFamily:"var(--font-heading)",textAlign:"center",borderBottomLeftRadius:8,borderBottomRightRadius:8,padding:"2px 0"}}>
                            رئيسية
                          </span>
                        )}
                        <button type="button" onClick={() => removeExistingImg(i)}
                          style={{position:"absolute",top:-6,left:-6,width:20,height:20,borderRadius:"50%",background:"#ef4444",color:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <IcX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newImgPreviews.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>صور جديدة ({newImgPreviews.length})</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {newImgPreviews.map((src, i) => (
                      <div key={i} style={{position:"relative"}}>
                        <img src={src} alt="" style={{width:68,height:68,objectFit:"cover",borderRadius:10,border:"2px dashed var(--pink-400)",display:"block"}} />
                        <button type="button" onClick={() => removeNewImg(i)}
                          style={{position:"absolute",top:-6,left:-6,width:20,height:20,borderRadius:"50%",background:"#ef4444",color:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <IcX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {form.images?.length > 0 || newImgPreviews.length > 0 ? "إضافة صور أخرى" : "رفع صور المنتج"}
                </label>
                <div className={styles.imgUpload}>
                  <input type="file" accept="image/*" multiple onChange={handleImgs} />
                  <IcCamera />
                  <p style={{marginTop:6,fontSize:"0.82rem"}}>اضغط لاختيار صورة أو أكثر</p>
                  <p style={{fontSize:"0.72rem",color:"var(--gray-400)",marginTop:2}}>الصورة الأولى ستكون الرئيسية</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>اسم المنتج *</label>
                <input className={styles.formInput} required value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="مثال: قلادة لؤلؤ" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الوصف</label>
                <textarea className={styles.formTextarea} value={form.description || ""} onChange={e => setForm({...form,description:e.target.value})} placeholder="وصف المنتج..." />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>السعر (₪) <span style={{color:"var(--gray-400)",fontWeight:400,fontSize:"0.75rem"}}>(اتركه فارغاً = تواصل للسعر)</span></label>
                  <input className={styles.formInput} type="number" min="0" step="0.5" value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="اتركه فارغاً إذا السعر بالتواصل" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>سعر الخصم (₪)</label>
                  <input className={styles.formInput} type="number" min="0" step="0.5" value={form.salePrice || ""} onChange={e => setForm({...form,salePrice:e.target.value})} placeholder="اختياري" />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الصنف</label>
                <select className={styles.formSelect} value={form.categoryId || ""} onChange={e => setForm({...form,categoryId:e.target.value})}>
                  <option value="">بدون صنف</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>الحملات</label>
                <div className={styles.campaignTagsGrid}>
                  {CAMPAIGN_TAGS.map(t => {
                    const active = (form.tags || []).includes(t.value);
                    return (
                      <button key={t.value} type="button"
                        className={`${styles.campaignChip} ${active ? styles.campaignChipActive : ""}`}
                        style={{ "--chip-color": t.color }}
                        onClick={() => {
                          const tags = form.tags || [];
                          setForm({...form, tags: active ? tags.filter(x => x !== t.value) : [...tags, t.value]});
                        }}>
                        <span className={styles.campaignChipIcon}>{t.icon}</span>
                        <span className={styles.campaignChipLabel}>{t.label}</span>
                        {active && <span className={styles.campaignChipCheck}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <p style={{fontFamily:"var(--font-heading)",fontSize:"0.72rem",color:"var(--gray-400)",marginTop:8}}>
                  المنتج رح يظهر بصفحة الحملات اللي اخترتها
                </p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn-outline" onClick={close}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "جاري الرفع..." : editId ? "حفظ التعديلات" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="حذف المنتج؟"
        message="هاد الإجراء ما بينعكس، المنتج رح يُحذف نهائياً مع صوره."
        confirmText="حذف"
        onConfirm={() => { deleteProduct(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}