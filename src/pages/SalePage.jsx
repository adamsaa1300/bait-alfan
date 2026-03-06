import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Cart from "../components/Cart";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useState } from "react";
import "./Store.css";

export default function SalePage() {
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const saleProducts = products.filter(p =>
    p.salePrice && p.salePrice < p.price &&
    (search === "" || p.name.includes(search))
  );

  return (
    <div className="store-root">
      <Navbar onSearch={setSearch} />
      <Cart />

      <section className="hero" style={{minHeight: 160, padding: "36px 20px"}}>
        <div className="hero-bg" />
        <div className="hero-content">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, var(--pink-500), #ef4444)",
            color: "white", padding: "6px 18px", borderRadius: 50,
            fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 700,
            marginBottom: 10, boxShadow: "0 4px 14px rgba(236,72,153,0.3)"
          }}>
            🏷️ تخفيضات حصرية
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 7vw, 3rem)", fontWeight: 700,
            background: "linear-gradient(135deg, var(--pink-600), #ef4444)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", lineHeight: 1.2, marginBottom: 4
          }}>
            العروض والتخفيضات
          </h1>
        </div>
      </section>

      <main className="store-main">
        {loading ? (
          <div className="loading-grid">{[...Array(8)].map((_,i) => <div key={i} className="skeleton-card" />)}</div>
        ) : saleProducts.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>لا توجد عروض حالياً</p>
          </div>
        ) : (
          <>
            <p style={{fontFamily:"var(--font-heading)",color:"var(--gray-500)",marginBottom:20,fontSize:"0.9rem"}}>
              {saleProducts.length} منتج مخفض
            </p>
            <div className="products-grid">
              {saleProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}