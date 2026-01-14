import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/authService';

// Suas páginas
import { Dashboard } from './pages/Dashboard'; // Verifique se o nome é esse ou 'Home'
import { CaseDetail } from './pages/CaseDetail';
import { Login } from './pages/Login';
import { Track } from './pages/Track'; // A página que o ALVO vê

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // Ou um ícone de carregamento

  return (
    <HashRouter>
      <Routes>
        {/* ROTA PÚBLICA: O alvo precisa acessar isso SEM login */}
        <Route path="/track/:id" element={<Track />} />

        {/* ROTAS PROTEGIDAS: Só abrem se 'user' existir */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/case/:id" 
          element={user ? <CaseDetail /> : <Navigate to="/login" />} 
        />
        
        {/* TELA DE LOGIN */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
      </Routes>
    </HashRouter>
  );
}