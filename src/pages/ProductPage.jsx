import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment, collection, query, where, limit, getDocs } from "firebase/firestore";
import { useCart } from "../hooks/useCart";
import { useSettings } from "../hooks/useSettings";
import ProductCard from "../components/ProductCard";
import Cart from "../components/Cart";
import Navbar from "../components/Navbar";
import "./ProductPage.css";

const IcChevronLeft = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const IcCart  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>);
const IcCheck = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const IcWa    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const IcEye   = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IcZoom  = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>);
const IcClose = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const IcLink  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>);

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [product, setProduct]         = useState(null);
  const [related, setRelated]         = useState([]);
  const [activeImg, setActiveImg]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [added, setAdded]             = useState(false);
  const [lightbox, setLightbox]       = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [linkCopied, setLinkCopied]   = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const imgRef      = useRef(null);
  const lbRef       = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setRelated([]);
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) { navigate("/"); return; }
      const data = { id: snap.id, ...snap.data() };
      setProduct(data); setActiveImg(0);
      try { await updateDoc(doc(db, "products", id), { views: increment(1) }); } catch(_) {}
      if (data.categoryId) {
        const q = query(collection(db, "products"), where("categoryId", "==", data.categoryId), where("available", "==", true), limit(6));
        const relSnap = await getDocs(q);
        setRelated(relSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id && p.imageUrl).slice(0, 4));
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    const images = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [];
    const handler = (e) => {
      if (e.key === "Escape")     setLightbox(false);
      if (e.key === "ArrowRight") setLightboxIdx(i => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft")  setLightboxIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, product]);

  // Non-passive touchmove — يمنع الصفحة من الانسحاب لما السحب أفقي
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onMove = (e) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 8) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  useEffect(() => {
    const el = lbRef.current;
    if (!el || !lightbox) return;
    const onMove = (e) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (dx > dy && dx > 8) e.preventDefault();
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, [lightbox]);

  const handleAdd    = () => { addItem(product); setAdded(true); setTimeout(() => setAdded(false), 2200); };
  const openLightbox = (idx) => { setLightboxIdx(idx); setLightbox(true); };

  const shareWa = () => {
    const msg = `شوفي هاد المنتج: ${product.name}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const shareWaOwner = () => {
    if (!settings.whatsapp) return;
    const msg = `مرحبا، بدي استفسر عن: ${product.name}\n${window.location.href}`;
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) return (<div className="pp-loading"><div className="pp-spinner" /></div>);
  if (!product) return null;

  const images      = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount    = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const views       = product.views || 0;

  return (
    <div>
      <Navbar onSearch={() => {}} />
      <Cart />

      <div className="pp-root">
        <div className="pp-breadcrumb">
          <button onClick={() => navigate(-1)} className="pp-back"><IcChevronLeft /> رجوع</button>
          <span className="pp-breadcrumb-sep">/</span>
          <span className="pp-breadcrumb-name">{product.name}</span>
        </div>

        <div className="pp-detail">
          <div className="pp-images">
            <div className="pp-main-img"
              ref={imgRef}
              onClick={() => images.length > 0 && openLightbox(activeImg)}
              style={{cursor: images.length > 0 ? "zoom-in" : "default"}}
              onTouchStart={e => {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
              }}
              onTouchEnd={e => {
                const dx = touchStartX.current - e.changedTouches[0].clientX;
                const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
                if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
                  if (dx < 0) setActiveImg(i => Math.min(i + 1, images.length - 1));
                  else        setActiveImg(i => Math.max(i - 1, 0));
                }
              }}
            >
              {images.length > 0
                ? <img src={images[activeImg]} alt={product.name} />
                : (<div className="pp-img-empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>)
              }
              {hasDiscount && <span className="pp-badge-sale">-{discount}%</span>}
              {!product.available && <div className="pp-unavail-overlay"><span>غير متوفر حالياً</span></div>}
              {images.length > 0 && <button className="pp-zoom-btn" onClick={e => { e.stopPropagation(); openLightbox(activeImg); }}><IcZoom /></button>}
            </div>
            {images.length > 1 && (
              <div className="pp-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`pp-thumb ${activeImg === i ? "pp-thumb-active" : ""}`} onClick={() => setActiveImg(i)}>
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pp-info">
            {hasDiscount && (
              <div className="pp-discount-tag">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                خصم {discount}%
              </div>
            )}
            <h1 className="pp-name">{product.name}</h1>
            {views > 0 && settings.showViews !== false && (
              <div className="pp-views"><IcEye /><span>{views} مشاهدة</span></div>
            )}
            <div className="pp-price-row">
              {hasDiscount ? (
                <><span className="pp-price-sale">{product.salePrice} ₪</span><span className="pp-price-old">{product.price} ₪</span><span className="pp-save-badge">وفري {product.price - product.salePrice} ₪</span></>
              ) : (
                <span className="pp-price-main">{product.price} ₪</span>
              )}
            </div>
            {product.description && <p className="pp-desc">{product.description}</p>}
            <div className={`pp-avail ${product.available ? "pp-avail-yes" : "pp-avail-no"}`}>
              {product.available ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>متوفر وجاهز للشحن</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>غير متوفر حالياً</>
              )}
            </div>
            <div className="pp-share-row">
              <button className="pp-share-row-btn pp-share-row-share" onClick={shareWa}>
                <IcWa /> <span>شارك على واتساب</span>
              </button>
              {settings.whatsapp && (
                <button className="pp-share-row-btn pp-share-row-ask" onClick={shareWaOwner}>
                  <IcWa /> <span>استفسر من المتجر</span>
                </button>
              )}
              <button className={`pp-share-row-btn pp-share-row-copy ${linkCopied ? "pp-share-row-copied" : ""}`} onClick={shareLink}>
                <IcLink /> <span>{linkCopied ? "تم النسخ ✓" : "انسخ الرابط"}</span>
              </button>
            </div>
            {settings.ordersEnabled !== false && (
            <div className="pp-actions">
              <button className={`pp-add-btn ${added ? "pp-added" : ""}`} onClick={handleAdd} disabled={!product.available}>
                {!product.available ? <>غير متوفر</> : added ? <><IcCheck /> أضيف للسلة!</> : <><IcCart /> أضف للسلة</>}
              </button>
            </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="pp-related">
            <h2 className="pp-related-title">منتجات مشابهة</h2>
            <div className="pp-related-grid">
              {related.map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{cursor:"pointer"}}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div
          className="pp-lightbox"
          ref={lbRef}
          onClick={() => setLightbox(false)}
          onTouchStart={e => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={e => {
            const dx = touchStartX.current - e.changedTouches[0].clientX;
            const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
            if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
              e.stopPropagation();
              if (dx < 0) setLightboxIdx(i => Math.min(i + 1, images.length - 1));
              else        setLightboxIdx(i => Math.max(i - 1, 0));
            }
          }}
        >
          <button className="pp-lb-close" onClick={() => setLightbox(false)}><IcClose /></button>
          <img src={images[lightboxIdx]} alt={product.name} className="pp-lb-img" onClick={e => e.stopPropagation()} />
          {images.length > 1 && (
            <div className="pp-lb-dots">
              {images.map((_, i) => <button key={i} className={`pp-lb-dot ${i === lightboxIdx ? "pp-lb-dot-active" : ""}`} onClick={e => { e.stopPropagation(); setLightboxIdx(i); }} />)}
            </div>
          )}
          {images.length > 1 && (
            <div className="pp-lb-counter">{lightboxIdx + 1} / {images.length}</div>
          )}
        </div>
      )}
    </div>
  );
}