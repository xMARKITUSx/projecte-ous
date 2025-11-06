// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// =================================================================
// ¡¡¡ ATENCIÓN !!!
// Pega aquí el bloque de código `const firebaseConfig = { ... };`
// que te dio la página web de Firebase.
// Asegúrate de que reemplazas todo el bloque de ejemplo de abajo.
// =================================================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDe2v7LLi3Fg1wKNeCZ9rWhXZBRsmq42bc",
  authDomain: "projecteous.firebaseapp.com",
  projectId: "projecteous",
  storageBucket: "projecteous.firebasestorage.app",
  messagingSenderId: "800219881039",
  appId: "1:800219881039:web:ca655e316ff442853cd43a",
  measurementId: "G-QVKV35WXJB"
};
// =================================================================

// El resto del código no necesita cambios
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };