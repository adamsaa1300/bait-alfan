import styles from "../pages/Dashboard/Dashboard.module.css";

const ICONS = {
  delete: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
    </svg>
  ),
};

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = "حذف", type = "delete" }) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.confirmDialog}>
        <div className={styles.confirmIcon}>{ICONS[type]}</div>
        <h3 className={styles.confirmTitle}>{title}</h3>
        {message && <p className={styles.confirmMessage}>{message}</p>}
        <div className={styles.confirmActions}>
          <button className="btn-outline" onClick={onCancel}>إلغاء</button>
          <button className={styles.btnConfirmDelete} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}