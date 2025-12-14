import { Case, AccessLog } from '../types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, deleteDoc, query, orderBy } from "firebase/firestore";

const STORAGE_KEY = 'forensic_track_data';

// Helper para simular delay no LocalStorage (para parecer rede)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MÉTODOS HÍBRIDOS (FIREBASE OU LOCALSTORAGE) ---

export const getCases = async (): Promise<Case[]> => {
  if (db) {
    // Modo Online (Firebase)
    try {
      const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Case);
    } catch (e) {
      console.error("Erro Firebase getCases:", e);
      return [];
    }
  } else {
    // Modo Offline (LocalStorage)
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const saveCase = async (newCase: Case): Promise<void> => {
  if (db) {
    try {
      await setDoc(doc(db, "cases", newCase.id), newCase);
    } catch (e) {
      console.error("Erro Firebase saveCase:", e);
      throw e;
    }
  } else {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const cases = data ? JSON.parse(data) : [];
    cases.unshift(newCase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }
};

export const getCaseById = async (id: string): Promise<Case | undefined> => {
  if (db) {
    try {
      const docRef = doc(db, "cases", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Case;
      }
      return undefined;
    } catch (e) {
      console.error("Erro Firebase getCaseById:", e);
      return undefined;
    }
  } else {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const cases: Case[] = data ? JSON.parse(data) : [];
    return cases.find((c) => c.id === id);
  }
};

export const addLogToCase = async (caseId: string, log: AccessLog): Promise<void> => {
  if (db) {
    try {
      const caseRef = doc(db, "cases", caseId);
      // Adiciona o log ao array 'logs' no documento
      await updateDoc(caseRef, {
        logs: arrayUnion(log)
      });
    } catch (e) {
      console.error("Erro Firebase addLog:", e);
    }
  } else {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const cases: Case[] = data ? JSON.parse(data) : [];
    const caseIndex = cases.findIndex((c) => c.id === caseId);
    if (caseIndex > -1) {
      cases[caseIndex].logs.unshift(log);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    }
  }
};

export const deleteCase = async (id: string): Promise<void> => {
  if (db) {
    try {
      await deleteDoc(doc(db, "cases", id));
    } catch (e) {
      console.error("Erro Firebase deleteCase:", e);
    }
  } else {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEY);
    const cases: Case[] = data ? JSON.parse(data) : [];
    const newCases = cases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCases));
  }
};
