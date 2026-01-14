import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/authService';

// IMPORTAÇÕES DAS SUAS PÁGINAS
import { Dashboard } from './pages/Dashboard'; 
import { CaseDetail } from './pages/CaseDetail';
import { Login } from './pages/Login';
import { TrackingView } from './pages/TrackingView'; // Nome corrigido aqui

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

  if (loading) return null;

  return (
    <HashRouter>
      <Routes>
        {/* ROTA PÚBLICA (O alvo acede a esta página SEM precisar de login) */}
        <Route path="/track/:id" element={<TrackingView />} />

        {/* ROTAS PROTEGIDAS (Só abrem se o utilizador estiver logado) */}
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

        {/* Redirecionar qualquer rota desconhecida para a Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}