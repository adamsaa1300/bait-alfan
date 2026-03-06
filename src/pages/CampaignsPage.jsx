import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Cart from "../components/Cart";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useState } from "react";
import "./CampaignsPage.css";

const IcMoon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="18.36" y1="5.64" x2="16.95" y2="7.05"/>
    <line x1="21" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcRings = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="12" r="5"/>
    <circle cx="15" cy="12" r="5"/>
    <path d="M12 9.5c.97-1.22 2.43-2 4-2a5 5 0 010 10c-1.57 0-3.03-.78-4-2"/>
    <path d="M12 14.5c-.97 1.22-2.43 2-4 2a5 5 0 010-10c1.57 0 3.03.78 4 2"/>
  </svg>
);
const IcTag = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const CAMPAIGNS = [
  { id: "eid",     label: "العيد",         Icon: IcMoon,  color: ["#4c1d95","#7c3aed"], glow: "rgba(124,58,237,0.45)",  tag: "eid",     desc: "أجمل إطلالة في أسعد الأيام" },
  { id: "wedding", label: "الأعراس",       Icon: IcRings, color: ["#92400e","#d97706"], glow: "rgba(217,119,6,0.45)",   tag: "wedding", desc: "إطلالة العروس المثالية" },
  { id: "sale",    label: "تخفيضات كبرى", Icon: IcTag,   color: ["#991b1b","#ef4444"], glow: "rgba(239,68,68,0.45)",   tag: "sale",    desc: "خصومات لفترة محدودة" },
];

export default function CampaignsPage() {
  const { products, loading } = useProducts();
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const campaign = CAMPAIGNS.find(c => c.id === active);

  const campaignProducts = active
    ? products.filter(p =>
        p.available &&
        (
          (active === "sale" && p.salePrice && p.salePrice < p.price) ||
          (p.tags && Array.isArray(p.tags) && p.tags.includes(campaign?.tag)) ||
          (p.campaign === active)
        )
      )
    : [];

  return (
    <div className="camp-root">
      <Navbar />
      <Cart />

      {/* Hero */}
      <div className="camp-hero">
        <div className="camp-hero-bg" />
        <div className="camp-hero-stars">
          {[...Array(18)].map((_, i) => (
            <span key={i} className="camp-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${(i * 0.3).toFixed(1)}s`,
              fontSize: `${0.5 + Math.random() * 0.8}rem`,
            }}>✦</span>
          ))}
        </div>
        <div className="camp-hero-content">
          <p className="camp-hero-sub">بيت الفن يقدم</p>
          <h1 className="camp-hero-title">الحملات<br/>والمناسبات</h1>
          <p className="camp-hero-desc">اختاري المناسبة واكتشفي أجمل المنتجات المختارة خصيصاً ليكِ</p>
        </div>
      </div>

      {/* Campaign Cards */}
      <div className="camp-section">
        <h2 className="camp-section-title">اختاري المناسبة</h2>
        <div className="camp-grid">
          {CAMPAIGNS.map(c => (
            <button
              key={c.id}
              className={`camp-card ${active === c.id ? "camp-card-active" : ""}`}
              style={{ "--c1": c.color[0], "--c2": c.color[1], "--glow": c.glow }}
              onClick={() => setActive(active === c.id ? null : c.id)}
            >
              <div className="camp-card-shine" />
              <div className="camp-card-icon"><c.Icon /></div>
              <span className="camp-card-label">{c.label}</span>
              <span className="camp-card-desc">{c.desc}</span>
              {active === c.id && <span className="camp-card-check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      {active && (
        <div className="camp-products-section">
          <div className="camp-products-header">
            <div className="camp-products-title-row">
              <div className="camp-products-icon"><campaign.Icon /></div>
              <h2 className="camp-products-title">{campaign.label}</h2>
            </div>
            <p className="camp-products-sub">{campaign.desc}</p>
          </div>

          {loading ? (
            <div className="camp-loading">
              {[...Array(4)].map((_, i) => <div key={i} className="camp-skeleton" />)}
            </div>
          ) : campaignProducts.length === 0 ? (
            <div className="camp-empty">
              <div className="camp-empty-icon"><campaign.Icon /></div>
              <p>منتجات هاي الحملة قريباً</p>
              <small>تابعينا للاطلاع على أحدث العروض</small>
            </div>
          ) : (
            <div className="products-grid">
              {campaignProducts.map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{cursor:"pointer"}}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}