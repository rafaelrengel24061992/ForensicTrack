import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CreateCase } from './pages/CreateCase';
import { CaseDetail } from './pages/CaseDetail';
import { TrackingView } from './pages/TrackingView';

// Wrapper to conditionally hide header on tracking pages
const AppContent: React.FC = () => {
  const location = useLocation();
  const isTrackingPage = location.pathname.includes('/track/');

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {!isTrackingPage && <Header />}
      <main className={!isTrackingPage ? "container mx-auto" : ""}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateCase />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/track/:id" element={<TrackingView />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
