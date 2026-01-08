import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// O Vite exige o prefixo VITE_ e o uso de import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db: any = null;

if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase conectado com sucesso via Vercel.");
  } catch (e) {
    console.error("Erro ao conectar Firebase:", e);
  }
} else {
  // Se cair aqui, o app entra em modo Demo automaticamente
  console.warn("Atenção: Chaves VITE_ não encontradas. Verifique o Vercel.");
}

export { db };