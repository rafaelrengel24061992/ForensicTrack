import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Case } from '../types';
import { saveCase } from '../services/storageService';
import { Button } from '../components/Button';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';

export const CreateCase: React.FC = () => {
  const navigate = useNavigate();
  const [procNum, setProcNum] = useState('');
  const [desc, setDesc] = useState('');
  const [destUrl, setDestUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procNum || !desc) return;
    
    setIsSaving(true);

    const newCase: Case = {
      id: uuidv4(),
      procedureNumber: procNum,
      description: desc,
      destinationUrl: destUrl || undefined,
      createdAt: new Date().toISOString(),
      status: 'active',
      logs: []
    };

    await saveCase(newCase);
    setIsSaving(false);
    navigate(`/case/${newCase.id}`);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h2 className="text-xl font-bold text-slate-800">Novo Procedimento</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número do Inquérito / Procedimento
          </label>
          <input
            type="text"
            value={procNum}
            onChange={(e) => setProcNum(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            placeholder="Ex: IP 123/2024"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descrição / Alvo
          </label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            placeholder="Ex: Identificação de perfil falso"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-slate-500" />
            Link de Destino / Redirecionamento (Opcional)
          </label>
          <input
            type="url"
            value={destUrl}
            onChange={(e) => setDestUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50"
            placeholder="Ex: https://noticia-exemplo.com"
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full py-3 text-lg" isLoading={isSaving}>
            Criar Link Rastreador
          </Button>
        </div>
      </form>
    </div>
  );
};
