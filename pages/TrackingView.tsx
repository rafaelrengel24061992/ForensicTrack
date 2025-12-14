import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, FileText, WifiOff, Loader2 } from 'lucide-react';
import { getCaseById, addLogToCase } from '../services/storageService';
import { getIpData, getBrowserLocation } from '../services/geoService';
import { Button } from '../components/Button';
import { AccessLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase';

export const TrackingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [caseData, setCaseData] = useState<any>(undefined);

  useEffect(() => {
    const load = async () => {
        if (id) {
            const data = await getCaseById(id);
            setCaseData(data);
        }
        setInitialLoading(false);
    }
    load();
  }, [id]);

  const handleConsent = async () => {
    if (!id || !caseData) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Get IP Data
      const ipData = await getIpData();
      
      // 2. Try to get GPS
      let gpsData = undefined;
      try {
        const position = await getBrowserLocation();
        gpsData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } catch (e) {
        console.log("GPS denied or unavailable");
      }

      // 3. Construct Log
      const log: AccessLog = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: ipData.ip,
        geoRaw: ipData,
        gps: gpsData,
        consentGiven: true
      };

      // 4. Save (Async now)
      await addLogToCase(id, log);

      // 5. Redirect or Finish
      if (caseData.destinationUrl) {
          let url = caseData.destinationUrl.trim();
          if (!/^https?:\/\//i.test(url)) {
              url = 'https://' + url;
          }
          window.location.href = url;
      } else {
          setCompleted(true);
      }

    } catch (err) {
      console.error(err);
      setError('Erro de conexão ao salvar dados. Tente novamente.');
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    if (id) {
        try {
            const ipData = await getIpData();
            const log: AccessLog = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ip: ipData.ip,
                geoRaw: ipData,
                consentGiven: false
            };
            await addLogToCase(id, log);
        } catch(e) {
            console.error(e);
        }
    }
    window.location.href = 'https://google.com'; 
  };

  if (initialLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
        </div>
      )
  }

  if (!caseData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-slate-200">
                <WifiOff className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Procedimento Não Encontrado</h3>
                <p className="text-slate-500 text-sm mb-4">
                  O link é inválido ou o caso não existe neste banco de dados.
                </p>
                {!db && (
                    <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-700 text-left border border-yellow-100">
                    <strong>Nota:</strong> O app está em modo Demo (Local). Para funcionar globalmente, configure as chaves do Firebase em <code>services/firebase.ts</code>.
                    </div>
                )}
            </div>
        </div>
    );
  }

  if (completed) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4 animate-in fade-in duration-500 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Confirmado</h2>
                <p className="text-slate-600 mb-6">
                    Sua confirmação foi registrada com sucesso.
                </p>
                <Button onClick={() => window.close()} variant="secondary" className="w-full">
                    Fechar Janela
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-amber-400 p-6 text-amber-900 flex flex-col items-center text-center">
          <AlertTriangle className="w-12 h-12 mb-3" />
          <h1 className="text-xl font-bold uppercase tracking-wide">Aviso de Auditoria</h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">Solicitação de Acesso</h2>
            <div className="flex items-center justify-center gap-2 text-slate-500 bg-slate-100 py-2 rounded-lg">
                <FileText className="w-4 h-4" />
                <span className="font-mono text-sm">Ref: {caseData.procedureNumber}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed text-justify">
            Para acessar o conteúdo deste link, é necessário seu <strong>consentimento explícito</strong> para o registro técnico de acesso.
            Você será redirecionado para o destino após a confirmação.
          </p>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">Dados que serão coletados:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Endereço IP Público</li>
              <li>Data e Hora do acesso</li>
              <li>Geolocalização aproximada (GPS)</li>
            </ul>
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
                onClick={handleDeny} 
                variant="ghost" 
                className="w-full text-slate-500 hover:text-red-600"
                disabled={loading}
            >
                <XCircle className="w-4 h-4" /> Recusar
            </Button>
            <Button 
                onClick={handleConsent} 
                isLoading={loading}
                className="w-full shadow-lg shadow-blue-500/30"
            >
                <CheckCircle className="w-4 h-4" /> Confirmar
            </Button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Sistema de Registro Forense
            </p>
        </div>
      </div>
    </div>
  );
};
