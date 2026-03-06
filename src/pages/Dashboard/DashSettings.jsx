import { useState, useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";
import styles from "./Dashboard.module.css";

const IcHero     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const IcAnnounce = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
const IcContact  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.19 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.1a16 16 0 006 6l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 13.92v3z"/></svg>);
const IcStore    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><rect x="9" y="14" width="6" height="8"/></svg>);
const IcDelivery = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>);
const IcInsta    = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>);
const IcTiktok   = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>);
const IcWa       = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);

const SECTIONS = [
  { id: "hero",     label: "الهيرو",    Icon: IcHero     },
  { id: "announce", label: "الإعلانات", Icon: IcAnnounce },
  { id: "contact",  label: "التواصل",   Icon: IcContact  },
  { id: "store",    label: "المتجر",    Icon: IcStore    },
  { id: "delivery", label: "الشحن",     Icon: IcDelivery },
];

export default function DashSettings() {
  const { settings, saveSettings } = useSettings();
  const [form, setForm]             = useState(settings);
  const [saved, setSaved]           = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>الإعدادات</h2>
      </div>

      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <div className={styles.settingsSidebar}>
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`${styles.settingsNavBtn} ${activeSection === id ? styles.settingsNavActive : ""}`}
              onClick={() => setActiveSection(id)}
            >
              <span className={styles.settingsNavIcon}><Icon /></span>
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className={styles.settingsPanel}>
          <form onSubmit={handleSave}>

            {activeSection === "hero" && (
              <>
                <p className={styles.settingsSectionTitle}>قسم الهيرو</p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>اسم المتجر (العنوان الكبير)</label>
                  <input className={styles.formInput} value={form.heroTitle || ""} onChange={e => set("heroTitle", e.target.value)} placeholder="بيت الفن" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>الوصف تحت الاسم</label>
                  <input className={styles.formInput} value={form.heroSubtitle || ""} onChange={e => set("heroSubtitle", e.target.value)} placeholder="اكسسوارات، شنط، بكل..." />
                </div>
              </>
            )}

            {activeSection === "announce" && (
              <>
                <p className={styles.settingsSectionTitle}>شريط الإعلانات</p>
                <div className={styles.formGroup}>
                  <div className={styles.settingsToggleRow}>
                    <div>
                      <p className={styles.formLabel} style={{margin:0}}>إظهار شريط الإعلان</p>
                      <p className={styles.settingsHint}>يظهر شريط ملون أعلى الصفحة الرئيسية</p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.showAnnouncement || false} onChange={e => set("showAnnouncement", e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>نص الإعلان</label>
                  <input className={styles.formInput} value={form.announcement || ""} onChange={e => set("announcement", e.target.value)} placeholder="مثال: توصيل مجاني على الطلبات فوق 100₪ 🎉" />
                </div>
                {form.showAnnouncement && form.announcement && (
                  <div className={styles.settingsPreview}>
                    <p className={styles.settingsHint}>معاينة:</p>
                    <div style={{background:"linear-gradient(135deg,var(--pink-500),var(--pink-600))",color:"white",textAlign:"center",padding:"10px 16px",borderRadius:8,fontFamily:"var(--font-heading)",fontSize:"0.85rem"}}>
                      {form.announcement}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeSection === "contact" && (
              <>
                <p className={styles.settingsSectionTitle}>معلومات التواصل</p>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} style={{display:"flex",alignItems:"center",gap:6}}>
                    <IcWa /> رقم واتساب (مع رمز الدولة، بدون +)
                  </label>
                  <input className={styles.formInput} value={form.whatsapp || ""} onChange={e => set("whatsapp", e.target.value)} placeholder="972591234567" dir="ltr" />
                  <p className={styles.settingsHint}>يُستخدم في زر "استفسر من المتجر" وزر واتساب بالفوتر</p>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} style={{display:"flex",alignItems:"center",gap:6}}>
                    <IcInsta /> انستغرام
                  </label>
                  <input className={styles.formInput} value={form.instagram || ""} onChange={e => set("instagram", e.target.value)} placeholder="https://instagram.com/baitelfan" dir="ltr" />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} style={{display:"flex",alignItems:"center",gap:6}}>
                    <IcTiktok /> تيك توك
                  </label>
                  <input className={styles.formInput} value={form.tiktok || ""} onChange={e => set("tiktok", e.target.value)} placeholder="https://tiktok.com/@baitelfan" dir="ltr" />
                </div>
              </>
            )}

            {activeSection === "store" && (
              <>
                <p className={styles.settingsSectionTitle}>إعدادات المتجر</p>

                <div className={styles.settingsCard}>
                  <div className={styles.settingsToggleRow}>
                    <div>
                      <p className={styles.settingsCardLabel}>تفعيل المتجر</p>
                      <p className={styles.settingsHint}>إيقافه يعرض رسالة صيانة للزوار</p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.storeOpen !== false} onChange={e => set("storeOpen", e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                  {form.storeOpen === false && (
                    <div className={styles.formGroup} style={{marginTop:12,marginBottom:0}}>
                      <label className={styles.formLabel}>رسالة الصيانة</label>
                      <input className={styles.formInput} value={form.maintenanceMsg || ""} onChange={e => set("maintenanceMsg", e.target.value)} placeholder="المتجر مغلق مؤقتاً، نعود قريباً 🌸" />
                    </div>
                  )}
                </div>

                <div className={styles.settingsCard}>
                  <div className={styles.settingsToggleRow}>
                    <div>
                      <p className={styles.settingsCardLabel}>السماح بالطلبات</p>
                      <p className={styles.settingsHint}>إيقافه يُخفي زر "أضف للسلة" من كل المنتجات</p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.ordersEnabled !== false} onChange={e => set("ordersEnabled", e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>

                <div className={styles.settingsCard}>
                  <div className={styles.settingsToggleRow}>
                    <div>
                      <p className={styles.settingsCardLabel}>إظهار عداد المشاهدات</p>
                      <p className={styles.settingsHint}>يظهر عدد المشاهدات على صفحة كل منتج</p>
                    </div>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={form.showViews !== false} onChange={e => set("showViews", e.target.checked)} />
                      <span className={styles.toggleSlider} />
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeSection === "delivery" && (
              <>
                <p className={styles.settingsSectionTitle}>إعدادات الشحن والتوصيل</p>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>رسوم التوصيل (₪)</label>
                    <input className={styles.formInput} type="number" min="0" step="0.5" value={form.deliveryFee ?? ""} onChange={e => set("deliveryFee", e.target.value)} placeholder="0" />
                    <p className={styles.settingsHint}>0 = توصيل مجاني دائماً</p>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>حد التوصيل المجاني (₪)</label>
                    <input className={styles.formInput} type="number" min="0" step="1" value={form.freeDeliveryMin ?? ""} onChange={e => set("freeDeliveryMin", e.target.value)} placeholder="مثال: 100" />
                    <p className={styles.settingsHint}>فوق هذا المبلغ = مجاني</p>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>مناطق التوصيل (كل منطقة بسطر)</label>
                  <textarea className={styles.formInput}
                    value={(form.deliveryAreas || []).join("\n")}
                    onChange={e => set("deliveryAreas", e.target.value.split("\n").filter(Boolean))}
                    rows={5} placeholder={"نابلس\nرام الله\nالقدس\nجنين"} />
                </div>
                {(form.deliveryAreas || []).length > 0 && (
                  <div className={styles.settingsTagsPreview}>
                    {(form.deliveryAreas || []).map((a, i) => (
                      <span key={i} className={styles.settingsTag}>{a}</span>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className={styles.settingsSaveRow}>
              <button type="submit" className="btn-primary">حفظ الإعدادات</button>
              {saved && (
                <span className={styles.settingsSavedMsg}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  تم الحفظ!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}