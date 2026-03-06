import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, serverTimestamp
} from "firebase/firestore";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addOrder = (data) =>
    addDoc(collection(db, "orders"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp()
    });

  const updateStatus = (id, status) =>
    updateDoc(doc(db, "orders", id), { status });

  const deleteOrder = (id) =>
    deleteDoc(doc(db, "orders", id));

  return { orders, loading, addOrder, updateStatus, deleteOrder };
}