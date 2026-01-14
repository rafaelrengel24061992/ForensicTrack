import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebase'; 

// Inicializa o Auth usando a instância do app exportada
export const auth = getAuth(app);

export const login = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const logout = () => signOut(auth);