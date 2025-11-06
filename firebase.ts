// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe2v7LLi3Fg1wKNeCZ9rWhXZBRsmq42bc",
  authDomain: "projecteous.firebaseapp.com",
  projectId: "projecteous",
  storageBucket: "projecteous.firebasestorage.app", // Usa este si es el que te da Firebase
  messagingSenderId: "800219881039",
  appId: "1:800219881039:web:ca655e316ff442853cd43a",
  measurementId: "G-QVKV35WXJB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };