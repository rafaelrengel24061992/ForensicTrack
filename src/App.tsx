import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/authService';

// IMPORTAÇÕES DAS SUAS PÁGINAS
import { Dashboard } from './pages/Dashboard'; 
import { CaseDetail } from './pages/CaseDetail';
import { Login } from './pages/Login';
import { TrackingView } from './pages/TrackingView';
import { CreateCase } from './pages/CreateCase'; // Adicionado a importação da página de criação

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observador de estado de autenticação
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
        {/* ROTA PÚBLICA: O alvo acessa esta página SEM login */}
        <Route path="/track/:id" element={<TrackingView />} />

        {/* TELA DE LOGIN: Se já estiver logado, redireciona para o Dashboard */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />

        {/* ROTAS PROTEGIDAS: Só abrem se o usuário estiver logado */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/case/:id" 
          element={user ? <CaseDetail /> : <Navigate to="/login" />} 
        />

        {/* ROTA DE CRIAÇÃO: Adicionada aqui para o botão "+" funcionar */}
        <Route 
          path="/create" 
          element={user ? <CreateCase /> : <Navigate to="/login" />} 
        />

        {/* Redirecionar qualquer rota desconhecida para a Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}