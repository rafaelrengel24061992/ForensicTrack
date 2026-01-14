import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebase'; 

export const auth = getAuth(app);

export const login = async (email: string, pass: string) => {
  // Usamos o retorno direto do Firebase
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logout = () => signOut(auth);