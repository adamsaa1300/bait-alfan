import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import "./ProductCard.css";

const IcImg = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--pink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);

const CAMPAIGN_LABELS = {
  eid:     { label: "العيد",         color: "#7c3aed" },
  wedding: { label: "الأعراس",       color: "#d97706" },
  sale:    { label: "تخفيضات كبرى", color: "#ef4444" },
};

export default function ProductCard({ product }) {
  const { id, name, price, salePrice, imageUrl, images, available, description, tags } = product;
  const navigate = useNavigate();
  const { settings } = useSettings();
  const hasDiscount = salePrice && salePrice < price;
  const discount = hasDiscount ? Math.round((1 - salePrice / price) * 100) : 0;
  const firstTag = tags?.find(t => CAMPAIGN_LABELS[t]);
  const noPrice = !price && price !== 0;

  const allImages = images?.length > 1 ? images : imageUrl ? [imageUrl] : [];
  const hasMultiple = allImages.length > 1;

  // Two slots for crossfade — A and B
  const [slot, setSlot] = useState({ a: allImages[0] || imageUrl, b: null, active: "a", idx: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!hasMultiple) return;
    intervalRef.current = setInterval(() => {
      setSlot(prev => {
        const nextIdx = (prev.idx + 1) % allImages.length;
        const nextImg = allImages[nextIdx];
        if (prev.active === "a") {
          return { a: prev.a, b: nextImg, active: "b", idx: nextIdx };
        } else {
          return { a: nextImg, b: prev.b, active: "a", idx: nextIdx };
        }
      });
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [hasMultiple, allImages.length]);

  const currentIdx = hasMultiple ? slot.idx : 0;

  return (
    <div className={`pc ${!available ? "pc-unavail" : ""}`} onClick={() => navigate(`/product/${id}`)}>
      <div className="pc-img-wrap">
        {hasMultiple ? (
          <div className="pc-img-crossfade">
            <img
              src={slot.a}
              alt={name}
              className={`pc-cf-img ${slot.active === "a" ? "pc-cf-visible" : "pc-cf-hidden"}`}
              loading="lazy"
            />
            {slot.b && (
              <img
                src={slot.b}
                alt={name}
                className={`pc-cf-img ${slot.active === "b" ? "pc-cf-visible" : "pc-cf-hidden"}`}
                loading="lazy"
              />
            )}
          </div>
        ) : (allImages[0] || imageUrl) ? (
          <img src={allImages[0] || imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="pc-img-empty"><IcImg /></div>
        )}

        {hasMultiple && (
          <div className="pc-img-dots">
            {allImages.map((_, i) => (
              <span key={i} className={`pc-img-dot ${i === currentIdx ? "pc-img-dot-active" : ""}`} />
            ))}
          </div>
        )}
        {hasDiscount && <span className="pc-badge">-{discount}%</span>}
        {firstTag && (
          <span className="pc-campaign-badge" style={{"--camp-color": CAMPAIGN_LABELS[firstTag].color}}>
            {CAMPAIGN_LABELS[firstTag].label}
          </span>
        )}
        {!available && <div className="pc-overlay"><span>غير متوفر</span></div>}
      </div>

      <div className="pc-info">
        <h3 className="pc-name">{name}</h3>
        {description && <p className="pc-desc">{description}</p>}
        <div className="pc-price">
          {noPrice ? (
            <span className="pc-price-contact">تواصل معنا للسعر</span>
          ) : hasDiscount ? (
            <><span className="pc-price-sale">{salePrice} ₪</span><span className="pc-price-old">{price} ₪</span></>
          ) : (
            <span className="pc-price-main">{price} ₪</span>
          )}
        </div>
      </div>
    </div>
  );
}