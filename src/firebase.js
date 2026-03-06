import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ضع هنا إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyB4TaOUFDzOJDIuKkIADn6EvtIAzi7eQLs",
  authDomain: "bait-alfan.firebaseapp.com",
  projectId: "bait-alfan",
  storageBucket: "bait-alfan.firebasestorage.app",
  messagingSenderId: "471209793873",
  appId: "1:471209793873:web:704842de467afd06681b70"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
