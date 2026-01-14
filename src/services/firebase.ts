import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

// 1. Inicializa o App no nível raiz (sem IF ou TRY em volta do export)
export const app = initializeApp(firebaseConfig);

// 2. Inicializa o Banco de Dados
export const db = getFirestore(app);

console.log("Firebase inicializado com sucesso.");