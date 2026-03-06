import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import ConfirmDialog from "../../components/ConfirmDialog";
import styles from "./Dashboard.module.css";

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
const IcGrid = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

export default function DashCategories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory, toggleHidden } = useCategories();
  const { products } = useProducts();
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ name: "" });
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const openAdd  = () => { setForm({ name: "" }); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({ name: c.name }); setEditId(c.id); setModal(true); };
  const close    = () => setModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editId) await updateCategory(editId, form);
      else await addCategory(form);
      close();
    } catch (err) {
      alert("صار خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getCatEmoji = (name) => {
    if (name.includes("شنط") || name.includes("حقيب")) return "👜";
    if (name.includes("مكياج") || name.includes("ميك")) return "💄";
    if (name.includes("أساور") || name.includes("اساور")) return "💍";
    if (name.includes("قلادة") || name.includes("قلائد")) return "📿";
    if (name.includes("عطر") || name.includes("بخور")) return "🌸";
    if (name.includes("إكسسوار") || name.includes("اكسسوار")) return "✨";
    return "🏷️";
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>الأصناف</h2>
        <button className="btn-primary" onClick={openAdd}>+ إضافة صنف</button>
      </div>

      <div className={styles.listToolbar}>
        <span className={styles.countBadge}>{categories.length} صنف</span>
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <IcGrid />
          <p>لا يوجد أصناف</p>
        </div>
      ) : (
        <div className={styles.catCardsGrid}>
          {categories.map(c => {
            const count = products.filter(p => p.categoryId === c.id).length;
            return (
              <div key={c.id} className={`${styles.catCard} ${c.hidden ? styles.catCardHidden : ""}`}>
                <div className={styles.catCardIcon}>{getCatEmoji(c.name)}</div>
                <p className={styles.catCardName}>{c.name}</p>
                <p className={styles.catCardCount}>{count} منتج</p>
                <div className={styles.catCardToggle}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={!c.hidden} onChange={e => toggleHidden(c.id, !e.target.checked)} />
                    <span className={styles.toggleSlider} />
                  </label>
                  <span className={styles.availLabel}>{c.hidden ? "مخفي" : "ظاهر"}</span>
                </div>
                <div className={styles.catCardActions}>
                  <button className={`${styles.iconBtn} ${styles.btnEdit}`} onClick={() => openEdit(c)}>
                    <IcEdit /> تعديل
                  </button>
                  <button className={`${styles.iconBtn} ${styles.btnDelete}`} onClick={() => setConfirmId(c.id)}>
                    <IcTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && close()}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{editId ? "تعديل الصنف" : "إضافة صنف"}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>اسم الصنف *</label>
                <input className={styles.formInput} required value={form.name} onChange={e => setForm({name:e.target.value})} placeholder="مثال: أساور، شنط، مكياج..." />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className="btn-outline" onClick={close}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "جاري الحفظ..." : editId ? "حفظ" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="حذف الصنف؟"
        message="رح يُحذف الصنف نهائياً، والمنتجات المرتبطة فيه رح تبقى بدون صنف."
        confirmText="حذف"
        onConfirm={() => { deleteCategory(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}