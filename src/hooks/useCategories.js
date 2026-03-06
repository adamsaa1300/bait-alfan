import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot
} from "firebase/firestore";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addCategory = (data) =>
    addDoc(collection(db, "categories"), { ...data, hidden: false, order: Date.now() });

  const updateCategory = (id, data) =>
    updateDoc(doc(db, "categories", id), data);

  const deleteCategory = (id) =>
    deleteDoc(doc(db, "categories", id));

  const toggleHidden = (id, val) =>
    updateDoc(doc(db, "categories", id), { hidden: val });

  return { categories, loading, addCategory, updateCategory, deleteCategory, toggleHidden };
}
