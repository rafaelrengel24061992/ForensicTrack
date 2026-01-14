import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder, Clock, ChevronRight, Loader2, Cloud, CloudOff, LogOut } from 'lucide-react';
import { Case } from '../types';
import { getCases } from '../services/storageService';
import { db } from '../services/firebase';
import { logout } from '../services/authService'; // Importação do serviço de logout

export const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      setLoading(true);
      const data = await getCases();
      setCases(data);
      setLoading(false);
    };
    loadCases();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair do sistema?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao deslogar:", error);
      }
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      {/* HEADER COM STATUS E LOGOUT */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Seus Procedimentos</h2>
          <div className="flex items-center gap-2 mt-1">
            {db ? (
              <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-bold border border-green-100">
                <Cloud className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-bold border border-orange-100">
                <CloudOff className="w-3 h-3" /> Local (Demo)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
            title="Sair do Sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <Link to="/create" className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700">Nenhum inquérito ativo</h3>
          <p className="text-slate-500 mt-2 text-sm px-6">
            Toque no botão "+" para iniciar um novo rastreamento forense.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link 
              key={c.id} 
              to={`/case/${c.id}`}
              className="block bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{c.procedureNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800">{c.description}</h3>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{c.logs?.length || 0} acessos</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="capitalize">{c.status === 'active' ? 'Ativo' : 'Arquivado'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};