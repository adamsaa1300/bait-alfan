import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useOrders } from "../../hooks/useOrders";
import DashStats from "./DashStats";
import DashOrders from "./DashOrders";
import DashProducts from "./DashProducts";
import DashCategories from "./DashCategories";
import DashSettings from "./DashSettings";
import { IconBarChart, IconPackage, IconShoppingBag, IconGrid, IconSettings, IconLogout } from "../../components/Icons";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user, isAdmin, loading, login, logout } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState("stats");

  const pendingCount = orders.filter(o => o.status === "pending").length;

  const tabs = [
    { id: "stats",      label: "الإحصائيات", Icon: IconBarChart,    badge: 0 },
    { id: "orders",     label: "الطلبات",    Icon: IconPackage,     badge: pendingCount },
    { id: "products",   label: "المنتجات",   Icon: IconShoppingBag, badge: 0 },
    { id: "categories", label: "الأصناف",    Icon: IconGrid,        badge: 0 },
    { id: "settings",   label: "الإعدادات", Icon: IconSettings,    badge: 0 },
  ];

  if (loading) return <div className={styles.splash}>جاري التحميل...</div>;

  if (!user) return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>بيت الفن</h1>
        <p className={styles.loginSub}>لوحة التحكم</p>
        <button className={styles.loginBtn} onClick={login}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.43-8.83l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h2 style={{color:"var(--pink-600)",fontFamily:"var(--font-heading)",marginBottom:16}}>غير مصرح لك</h2>
        <button className={styles.loginBtn} onClick={logout} style={{background:"#9ca3af"}}>خروج</button>
      </div>
    </div>
  );

  const ActiveComp = { stats: DashStats, orders: DashOrders, products: DashProducts, categories: DashCategories, settings: DashSettings }[activeTab];
  const activeLabel = tabs.find(t => t.id === activeTab)?.label;

  return (
    <div className={styles.dashRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>بيت الفن</div>
        <nav className={styles.sidebarNav}>
          {tabs.map(({ id, label, Icon, badge }) => (
            <button key={id} className={`${styles.navItem} ${activeTab === id ? styles.navActive : ""}`} onClick={() => setActiveTab(id)}>
              <span style={{position:"relative",display:"inline-flex"}}>
                <Icon size={17} color="currentColor" />
                {badge > 0 && <span className={styles.sidebarBadge}>{badge}</span>}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={logout}>
          <IconLogout size={16} color="currentColor" /><span>خروج</span>
        </button>
      </aside>

      <header className={styles.mobileTopBar}>
        <span className={styles.mobileTopLogo}>بيت الفن</span>
        <span className={styles.mobileTopTitle}>{activeLabel}</span>
        <button className={styles.mobileLogoutBtn} onClick={logout} title="خروج"><IconLogout size={17} color="#ef4444" /></button>
      </header>

      <main className={styles.dashContent}><ActiveComp /></main>

      <nav className={styles.mobileNav}>
        {tabs.map(({ id, label, Icon, badge }) => (
          <button key={id} className={`${styles.mobileNavItem} ${activeTab === id ? styles.mobileNavActive : ""}`} onClick={() => setActiveTab(id)}>
            <span className={styles.mobileNavIcon} style={{position:"relative"}}>
              <Icon size={20} color="currentColor" />
              {badge > 0 && <span className={styles.mobileBadge}>{badge}</span>}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}