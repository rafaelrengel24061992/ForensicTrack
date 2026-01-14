import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2qmx_HM8t-U7ZsDeo5_o0GMaT23Od8e4",
  authDomain: "forensictrack-1f3ef.firebaseapp.com",
  projectId: "forensictrack-1f3ef",
  storageBucket: "forensictrack-1f3ef.firebasestorage.app",
  messagingSenderId: "201038584400",
  appId: "1:201038584400:web:9e4b125a72e000934e0f55",
  measurementId: "G-2MTG3PBQD0"
};

// 1. Inicializa o App no nível raiz (sem IF ou TRY em volta do export)
export const app = initializeApp(firebaseConfig);

// 2. Inicializa o Banco de Dados
export const db = getFirestore(app);

console.log("Firebase inicializado com sucesso.");