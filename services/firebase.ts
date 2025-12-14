import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE (ATUALIZADO COM SUAS CHAVES REAIS) ---
// O código usa as variáveis de ambiente (process.env) como primeira opção,
// e usa as chaves reais como fallback, garantindo a conexão.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB2qmx_HM8t-U7ZsDeo5_o0GMaT23Od8e4", // CHAVE REAL
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "forensictrack-1f3ef.firebaseapp.com", // DOMÍNIO REAL
  projectId: process.env.FIREBASE_PROJECT_ID || "forensictrack-1f3ef", // ID DO PROJETO REAL
  storageBucket: "forensictrack-1f3ef.firebasestorage.app", // BUCKET REAL
  messagingSenderId: "201038584400", // SENDER ID REAL
  appId: "1:201038584400:web:9e4b125a72e000934e0f55" // APP ID REAL
};

let db: any = null;

// Só inicializa se tiver configuração válida (o valor da chave não for o placeholder antigo)
if (firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") {
  try {
    const app = initializeApp(firebaseConfig as any);
    db = getFirestore(app);
    console.log("Firebase conectado com sucesso.");
  } catch (e) {
    console.error("Erro ao conectar Firebase:", e);
  }
} else {
  console.log("Firebase não configurado. Usando LocalStorage (Modo Demo).");
}

export { db };