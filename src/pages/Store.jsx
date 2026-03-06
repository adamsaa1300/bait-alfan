import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Cart from "../components/Cart";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSettings } from "../hooks/useSettings";
import { IconTag } from "../components/Icons";
import "./Store.css";

export default function Store() {
  const { products, loading: pLoading } = useProducts();
  const { categories, loading: cLoading } = useCategories();
  const { settings, loaded } = useSettings();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [albumOpen, setAlbumOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);

  // Lock body scroll when modal is open - prevents background from scrolling/refreshing
  const setAlbumOpenSafe = (v) => {
    setAlbumOpen(v);
    document.body.style.overflow = v ? "hidden" : "";
    document.body.style.touchAction = v ? "none" : "";
  };
  const setRecentOpenSafe = (v) => {
    setRecentOpen(v);
    document.body.style.overflow = v ? "hidden" : "";
    document.body.style.touchAction = v ? "none" : "";
  };

  const [refreshing, setRefreshing] = useState(false);
  const touchY = useRef(0);
  const navigate = useNavigate();

  const handleTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (dy > 80 && window.scrollY === 0) {
      setRefreshing(true);
      setTimeout(() => { window.location.reload(); }, 400);
    }
  };

  const visibleCategories = categories.filter(c => !c.hidden);
  const saleProducts = products.filter(p => p.salePrice && p.salePrice < p.price);

  const albumProducts = useMemo(() =>
    products.filter(p => p.imageUrl),
  [products]);

  const recentProducts = useMemo(() =>
    [...products]
      .filter(p => p.imageUrl)
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 20),
  [products]);

  const sortedCategories = useMemo(() => {
    return [...visibleCategories].sort((a, b) => {
      const aHasAvail = products.some(p => p.categoryId === a.id && p.available);
      const bHasAvail = products.some(p => p.categoryId === b.id && b.available);
      if (aHasAvail && !bHasAvail) return -1;
      if (!aHasAvail && bHasAvail) return 1;
      return 0;
    });
  }, [visibleCategories, products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "all") list = list.filter(p => p.categoryId === activeCategory);
    if (search.trim()) list = list.filter(p => p.name.includes(search) || (p.description || "").includes(search));
    list = [...list].sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return 0;
    });
    return list;
  }, [products, activeCategory, search]);

  const WaIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const AlbumModal = ({ items, onClose, title, icon }) => (
    <div
      className="album-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      onTouchMove={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <div className="album-modal">
        <div className="album-header">
          <h2 className="album-title">
            {icon}
            {title}
            <span className="album-count-badge">{items.length}</span>
          </h2>
          <button className="album-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="album-grid">
          {items.map(p => (
            <button key={p.id} className="album-item"
              onClick={() => { onClose(); navigate(`/product/${p.id}`); }} title={p.name}>
              <img src={p.imageUrl} alt={p.name} loading="lazy" />
              <div className="album-item-overlay">
                <span className="album-item-name">{p.name}</span>
                <span className="album-item-price">
                  {p.salePrice && p.salePrice < p.price ? p.salePrice : p.price} ₪
                </span>
              </div>
              {!p.available && <div className="album-item-sold">نفذ</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="store-root" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {refreshing && (
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,height:3,background:"linear-gradient(90deg,var(--pink-400),var(--pink-600))",animation:"shimmer 0.8s infinite"}} />
      )}
      <Navbar onSearch={setSearch} />
      <Cart />

      {settings.showAnnouncement && settings.announcement && (
        <div className="announcement-bar">{settings.announcement}</div>
      )}

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1 className="hero-title">{settings.heroTitle || "بيت الفن"}</h1>
          <p className="hero-sub">{settings.heroSubtitle || "اكسسوارات، شنط، بكل، ومكياج بأرقى الأذواق"}</p>

          <div className="hero-btns">
            {saleProducts.length > 0 && (
              <button className="hero-sale-btn" onClick={() => navigate("/sale")}>
                <IconTag size={15} color="currentColor" />
                تسوقي العروض الآن — {saleProducts.length} منتج
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            {albumProducts.length > 0 && (
              <button className="hero-album-btn" onClick={() => setAlbumOpenSafe(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                تصفحي كل المنتجات
                <span className="hero-album-count">{albumProducts.length}</span>
              </button>
            )}
            {recentProducts.length > 0 && (
              <button className="hero-recent-btn" onClick={() => setRecentOpenSafe(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                وصل حديثاً
                <span className="hero-album-count">{recentProducts.length}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {albumOpen && (
        <AlbumModal
          items={albumProducts}
          onClose={() => setAlbumOpenSafe(false)}
          title="ألبوم المنتجات"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
        />
      )}

      {recentOpen && (
        <AlbumModal
          items={recentProducts}
          onClose={() => setRecentOpenSafe(false)}
          title="وصل حديثاً"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
      )}

      {/* Maintenance mode */}
      {loaded && settings.storeOpen === false && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 20px",gap:16}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--pink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{fontSize:"1.1rem",fontWeight:700,color:"var(--gray-700)",fontFamily:"var(--font-heading)",textAlign:"center"}}>{settings.maintenanceMsg || "المتجر مغلق مؤقتاً، نعود قريباً 🌸"}</p>
        </div>
      )}

      {(!loaded || settings.storeOpen !== false) && (
      <main className="store-main">
        {!cLoading && sortedCategories.length > 0 && (
          <div className="categories-wrap">
            <div className="categories-scroll">
              <button
                className={`cat-btn ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}>
                الكل
                <span className="cat-count">{products.length}</span>
              </button>
              {sortedCategories.map(c => {
                const count = products.filter(p => p.categoryId === c.id).length;
                const hasAvail = products.some(p => p.categoryId === c.id && p.available);
                return (
                  <button key={c.id}
                    className={`cat-btn ${activeCategory === c.id ? "active" : ""} ${!hasAvail ? "cat-btn-soldout" : ""}`}
                    onClick={() => setActiveCategory(c.id)}>
                    {c.name}
                    <span className="cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!pLoading && (
          <div className="results-bar">
            <span className="results-count">{filtered.length} منتج</span>
            {activeCategory !== "all" && (
              <button className="results-clear" onClick={() => setActiveCategory("all")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                مسح
              </button>
            )}
          </div>
        )}

        {pLoading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p>لا توجد منتجات</p>
            <button className="btn-outline" onClick={() => setActiveCategory("all")}>عرض الكل</button>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      )}

      <footer className="store-footer">
        <div className="footer-inner">
          <div className="footer-logo">بيت الفن</div>
          <p className="footer-copy">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
          {settings.whatsapp && (
            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="whatsapp-btn">
              <WaIcon /> تواصلي معنا
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}