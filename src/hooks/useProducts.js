import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot
} from "firebase/firestore";

const CLOUD_NAME = "djcfgao6b";
const UPLOAD_PRESET = "bait_alfan";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("فشل رفع الصورة: " + JSON.stringify(data));
  return data.secure_url;
}

async function uploadMultiple(files) {
  return Promise.all(Array.from(files).map(uploadToCloudinary));
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("order", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => {
      // fallback if no order field
      const q2 = query(collection(db, "products"), orderBy("createdAt", "desc"));
      onSnapshot(q2, (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    });
    return unsub;
  }, []);

  const addProduct = async (data, imageFiles) => {
    let images = [];
    if (imageFiles && imageFiles.length > 0) images = await uploadMultiple(imageFiles);
    await addDoc(collection(db, "products"), {
      ...data,
      imageUrl: images[0] || "",
      images,
      available: true,
      order: Date.now(),
      createdAt: new Date()
    });
  };

  const updateProduct = async (id, data, imageFiles) => {
    let images = data.images || (data.imageUrl ? [data.imageUrl] : []);
    if (imageFiles && imageFiles.length > 0) {
      const newImgs = await uploadMultiple(imageFiles);
      images = [...images, ...newImgs];
    }
    await updateDoc(doc(db, "products", id), { ...data, imageUrl: images[0] || "", images });
  };

  const updateOrder = async (id, order) =>
    updateDoc(doc(db, "products", id), { order });

  const deleteProduct = async (id) => deleteDoc(doc(db, "products", id));

  const toggleAvailable = async (id, val) =>
    updateDoc(doc(db, "products", id), { available: val });

  return { products, loading, addProduct, updateProduct, updateOrder, deleteProduct, toggleAvailable };
}