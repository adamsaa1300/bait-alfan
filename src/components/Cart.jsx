import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { useSettings } from "../hooks/useSettings";
import { useOrders } from "../hooks/useOrders";
import "./Cart.css";

const IcX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IcBag = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--pink-200)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IcArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Cart() {
  const { items, open, setOpen, removeItem, updateQty, clearCart, total } = useCart();
  const { settings } = useSettings();
  const { addOrder } = useOrders();
  const [step, setStep]           = useState("cart");
  const [form, setForm]           = useState({ customerName:"", phone:"", address:"", note:"" });
  const [saving, setSaving]       = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const handleClose = () => { setOpen(false); setStep("cart"); };

  const handleOrder = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const orderItems = items.map(i => ({
        id: i.id, name: i.name, price: i.price,
        salePrice: i.salePrice || null, qty: i.qty, imageUrl: i.imageUrl || ""
      }));
      const orderTotal = +total.toFixed(0);
      await addOrder({ ...form, items: orderItems, total: orderTotal });
      setLastOrder({ ...form, items: orderItems, total: orderTotal });
      clearCart();
      setStep("done");
    } catch(err) {
      alert("صار خطأ: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsapp = () => {
    if (!settings.whatsapp || !lastOrder) return;
    const { customerName, phone, address, note, items: oItems, total: oTotal } = lastOrder;
    let msg = `مرحبا 👋\n`;
    msg += `اسمي ${customerName}\n`;
    if (phone)   msg += `رقم الهاتف: ${phone}\n`;
    if (address) msg += `العنوان: ${address}\n`;
    msg += `\nبدي أطلب:\n`;
    oItems.forEach(i => {
      msg += `• ${i.name} × ${i.qty} = ${((i.salePrice||i.price)*i.qty).toFixed(0)} ₪\n`;
    });
    msg += `\nالمجموع: ${oTotal} ₪`;
    if (note) msg += `\n\nملاحظة: ${note}`;
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <>
      {open && <div className="cart-overlay" onClick={handleClose} />}
      <div className={`cart-drawer ${open ? "cart-open" : ""}`}>

        {/* ── CART ── */}
        {step === "cart" && (
          <>
            <div className="cart-header">
              <h2 className="cart-title">سلة التسوق</h2>
              <div className="cart-header-actions">
                {items.length > 0 && (
                  <button className="cart-clear" onClick={clearCart}>مسح الكل</button>
                )}
                <button className="cart-close" onClick={handleClose}><IcX /></button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <IcBag />
                <p>السلة فارغة</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.id} className="cart-item">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                        : (
                          <div className="cart-item-img-placeholder">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pink-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                          </div>
                        )
                      }
                      <div className="cart-item-info">
                        <p className="cart-item-name">{item.name}</p>
                        <p className="cart-item-price">{item.price != null ? `${item.salePrice || item.price} ₪` : "سعر بالتواصل"}</p>
                      </div>
                      <div className="cart-item-qty">
                        <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                        <IcX />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>المجموع</span>
                    <span className="cart-total-price">{total.toFixed(0)} ₪</span>
                  </div>
                  {settings.ordersEnabled !== false ? (
                    <button className="cart-checkout-btn" onClick={() => setStep("form")}>
                      إتمام الطلب <IcArrow />
                    </button>
                  ) : (
                    <div className="cart-orders-disabled">
                      الطلبات مغلقة مؤقتاً — تواصلي معنا مباشرة
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── FORM ── */}
        {step === "form" && (
          <>
            <div className="cart-header">
              <button className="cart-close" onClick={() => setStep("cart")} style={{transform:"rotate(180deg)"}}>
                <IcArrow />
              </button>
              <h2 className="cart-title">بيانات الطلب</h2>
              <button className="cart-close" onClick={handleClose}><IcX /></button>
            </div>

            <form onSubmit={handleOrder} style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
              <div className="cart-form-body">
                <div className="order-field">
                  <label>الاسم *</label>
                  <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="اسمك الكامل" />
                </div>
                <div className="order-field">
                  <label>رقم الهاتف *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="05xxxxxxxx" dir="ltr" />
                </div>
                <div className="order-field">
                  <label>العنوان</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="المدينة، الحي..." />
                </div>
                <div className="order-field">
                  <label>ملاحظة</label>
                  <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="أي تفاصيل إضافية..." rows={3} />
                </div>
              </div>

              <div className="cart-form-footer">
                <div className="cart-form-total">
                  <div className="cart-form-total-row">
                    <span>المجموع</span>
                    <strong>{total.toFixed(0)} ₪</strong>
                  </div>
                </div>
                <button type="submit" className="cart-submit-btn" disabled={saving}>
                  {saving ? "جاري الإرسال..." : <><WaIcon /> تأكيد الطلب</>}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── DONE ── */}
        {step === "done" && (
          <div className="cart-done">
            <div className="cart-done-circle">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline className="cart-done-check" points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="cart-done-title">تم استلام طلبك! 🎉</h2>
            <p className="cart-done-sub">
              شكراً {lastOrder?.customerName} 🌸<br/>سنتواصل معك قريباً
            </p>
            <button className="cart-done-wa" onClick={() => { sendWhatsapp(); handleClose(); }}>
              <WaIcon /> تابع عبر واتساب
            </button>
            <button className="cart-done-close" onClick={handleClose}>إغلاق</button>
          </div>
        )}

      </div>
    </>
  );
}