import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const DEFAULT_SETTINGS = {
  storeName: "بيت الفن",
  announcement: "",
  showAnnouncement: false,
  whatsapp: "",
  heroTitle: "بيت الفن",
  heroSubtitle: "اكسسوارات، شنط، بكل، ومكياج بأرقى الأذواق",
  storeOpen: true,
  ordersEnabled: true,
  showViews: true,
  maintenanceMsg: "",
  instagram: "",
  tiktok: "",
  deliveryFee: "",
  freeDeliveryMin: "",
  deliveryAreas: [],
};

function sanitize(data) {
  const d = { ...data };
  if (typeof d.storeOpen        === "string") d.storeOpen        = d.storeOpen        === "true";
  if (typeof d.ordersEnabled    === "string") d.ordersEnabled    = d.ordersEnabled    === "true";
  if (typeof d.showViews        === "string") d.showViews        = d.showViews        === "true";
  if (typeof d.showAnnouncement === "string") d.showAnnouncement = d.showAnnouncement === "true";
  if (d.deliveryFee    !== "" && d.deliveryFee    != null) d.deliveryFee    = Number(d.deliveryFee);
  if (d.freeDeliveryMin !== "" && d.freeDeliveryMin != null) d.freeDeliveryMin = Number(d.freeDeliveryMin);
  return d;
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "settings"), (snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...sanitize(snap.data()) });
      setLoaded(true);
    });
    return unsub;
  }, []);

  const saveSettings = (data) =>
    setDoc(doc(db, "config", "settings"), sanitize(data), { merge: true });

  return { settings, saveSettings, loaded };
}