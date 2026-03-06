import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Cart from "../components/Cart";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useWishlist } from "../hooks/useWishlist";
import { useState } from "react";
import "./WishlistPage.css";

export default function WishlistPage() {
  const { products, loading } = useProducts();
  const { wishlist } = useWishlist();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const wished = products.filter(p =>
    wishlist.includes(p.id) &&
    (search === "" || p.name.includes(search) || (p.description || "").includes(search))
  );

  const sorted = [...wished].sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return 0;
  });

  return (
    <div className="wl-root">
      <Navbar onSearch={setSearch} />
      <Cart />

      <div className="wl-header">
        <div className="wl-header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        <h1 className="wl-header-title">المفضلة</h1>
        <p className="wl-header-sub">
          {wishlist.length === 0 ? "لم تضيفي أي منتج بعد" : `${wishlist.length} منتج محفوظ`}
        </p>
      </div>

      <main className="wl-main">
        {loading ? (
          <div className="wl-grid">
            {[...Array(4)].map((_, i) => <div key={i} className="wl-skeleton" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="wl-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <h2 className="wl-empty-title">
              {wishlist.length === 0 ? "المفضلة فارغة" : "لا نتائج للبحث"}
            </h2>
            <p className="wl-empty-sub">
              {wishlist.length === 0
                ? "اضغطي على القلب بجانب أي منتج لحفظه هنا"
                : "جربي كلمة بحث مختلفة"}
            </p>
            <button className="wl-browse-btn" onClick={() => navigate("/")}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              تصفحي المتجر
            </button>
          </div>
        ) : (
          <>
            <div className="wl-grid">
              {sorted.map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{cursor:"pointer"}}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="wl-footer-btn">
              <button className="wl-browse-btn" onClick={() => navigate("/")}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                اكتشفي المزيد
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}