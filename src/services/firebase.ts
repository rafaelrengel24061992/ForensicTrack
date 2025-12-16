import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE (VERSÃO SEGURA) ---
// Agora, ele depende EXCLUSIVAMENTE das variáveis de ambiente injetadas pelo Vercel.
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
};

let db: any = null;

// Só inicializa se a chave principal existir (agora injetada pelo Vercel)
if (firebaseConfig.apiKey) {
  try {
    // Usando `import.meta.env` para ser compatível com o sistema de variáveis de ambiente do Vite
    const app = initializeApp(firebaseConfig as any);
    db = getFirestore(app);
    console.log("Firebase conectado com sucesso.");
  } catch (e) {
    console.error("Erro ao conectar Firebase:", e);
  }
} else {
  // Isso será exibido no console se as variáveis não forem encontradas (o que não deve acontecer após o Passo 1)
  console.log("Firebase não configurado. Verifique as Variáveis de Ambiente.");
}

export { db };