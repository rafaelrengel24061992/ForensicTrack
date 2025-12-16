import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Download, Trash2, MapPin, Globe, Smartphone, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { Case } from '../types';
import { getCaseById, deleteCase } from '../services/storageService';
import { Button } from '../components/Button';
import { jsPDF } from 'jspdf';
import { generateForensicReport } from '../services/geminiService';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [trackingLink, setTrackingLink] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getCaseById(id);
    setCaseData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (id) {
       // Using the origin + hash for the link
      const baseUrl = window.location.href.split('#')[0];
      setTrackingLink(`${baseUrl}#/track/${id}`);
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center flex justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>;
  if (!caseData) return <div className="p-8 text-center text-red-500">Caso não encontrado.</div>;

  const copyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Acesso Necessário',
        text: 'Por favor, acesse este link para confirmar.',
        url: trackingLink,
      });
    } else {
      copyLink();
    }
  };

  const handleGenerateAIReport = async () => {
    setGeneratingReport(true);
    const analysis = await generateForensicReport(caseData);
    setAiAnalysis(analysis);
    setGeneratingReport(false);
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`Relatório Técnico Forense`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Procedimento: ${caseData.procedureNumber}`, 14, 32);
    doc.text(`Alvo: ${caseData.description}`, 14, 38);
    if (caseData.destinationUrl) {
      doc.text(`Redirecionamento para: ${caseData.destinationUrl}`, 14, 44);
    }
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, caseData.destinationUrl ? 50 : 44);

    let yPos = caseData.destinationUrl ? 60 : 55;

    // AI Analysis Section
    if (aiAnalysis) {
        doc.setFontSize(14);
        doc.text("Análise Técnica (IA):", 14, yPos);
        yPos += 8;
        doc.setFontSize(10);
        
        const splitText = doc.splitTextToSize(aiAnalysis, 180);
        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 4 + 10;
    }

    // Logs Section
    doc.setFontSize(14);
    doc.text(`Registros de Acesso (${caseData.logs.length})`, 14, yPos);
    yPos += 10;

    caseData.logs.forEach((log, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Registro #${index + 1} - ${new Date(log.timestamp).toLocaleString()}`, 14, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(`IP: ${log.ip} (${log.geoRaw.org || 'ISP Desconhecido'})`, 14, yPos);
        yPos += 5;
        doc.text(`Localização (IP): ${log.geoRaw.city}, ${log.geoRaw.region} - ${log.geoRaw.country}`, 14, yPos);
        yPos += 5;
        
        if (log.gps) {
            doc.setTextColor(0, 100, 0);
            doc.text(`GPS: Lat ${log.gps.latitude}, Lon ${log.gps.longitude} (Precisão: ${log.gps.accuracy}m)`, 14, yPos);
            doc.setTextColor(80, 80, 80);
        } else {
            doc.text(`GPS: Permissão negada ou indisponível`, 14, yPos);
        }
        yPos += 5;

        const ua = doc.splitTextToSize(`User-Agent: ${log.userAgent}`, 180);
        doc.text(ua, 14, yPos);
        yPos += ua.length * 4 + 8;
    });

    doc.save(`relatorio_${caseData.procedureNumber}.pdf`);
  };

  const handleDelete = async () => {
    if(confirm('Tem certeza que deseja excluir este caso e todos os logs?')) {
        await deleteCase(caseData.id);
        navigate('/');
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Detalhes do Caso</h2>
                <p className="text-sm text-slate-500">#{caseData.procedureNumber}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={loadData} className="text-slate-500 p-2 hover:bg-slate-100 rounded-full">
                <RefreshCw className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Link Generator Card */}
      <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-blue-900">Link de Rastreamento</h3>
          {caseData.destinationUrl && (
             <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
               <ExternalLink className="w-3 h-3" />
               Redireciona para: <span className="max-w-[150px] truncate">{caseData.destinationUrl}</span>
             </div>
          )}
        </div>
        <p className="text-sm text-blue-700 mb-4">
            Envie este link. Se estiver usando o modo "Cloud/Online" (com chaves Firebase), você verá os acessos em tempo real aqui.
        </p>
        <div className="flex gap-2">
            <input 
                readOnly 
                value={trackingLink} 
                className="flex-1 text-xs sm:text-sm p-2 rounded border border-blue-200 bg-white text-slate-600 truncate"
            />
            <Button onClick={copyLink} variant="secondary" className="px-3">
                <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareLink} variant="primary" className="px-3">
                <Share2 className="w-4 h-4" />
            </Button>
        </div>
        {copySuccess && <p className="text-green-600 text-xs mt-2 font-medium">Link copiado!</p>}
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Análise Inteligente
            </h3>
            <Button 
                onClick={handleGenerateAIReport} 
                variant="ghost" 
                isLoading={generatingReport}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
                {aiAnalysis ? 'Regerar Análise' : 'Gerar Análise'}
            </Button>
        </div>
        {aiAnalysis ? (
            <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
                {aiAnalysis}
            </div>
        ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
                Utilize a IA para cruzar dados de IP, GPS e horários.
            </div>
        )}
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
            <h3 className="font-bold text-slate-800">Registros Capturados</h3>
            <Button onClick={downloadReport} variant="secondary" className="text-sm py-1">
                <Download className="w-4 h-4" /> PDF
            </Button>
        </div>

        {caseData.logs.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                Ainda não houve acessos neste link.
            </div>
        ) : (
            caseData.logs.map((log, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${log.consentGiven ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.consentGiven ? 'Consentido' : 'Negado'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex gap-2">
                            <Globe className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-700">Dados de Rede</p>
                                <p className="text-slate-600">IP: {log.ip}</p>
                                <p className="text-slate-500 text-xs">{log.geoRaw.org}</p>
                                <p className="text-slate-500 text-xs">{log.geoRaw.city}, {log.geoRaw.region}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-slate-700">Geolocalização (GPS)</p>
                                {log.gps ? (
                                    <>
                                        <p className="text-slate-600">{log.gps.latitude.toFixed(5)}, {log.gps.longitude.toFixed(5)}</p>
                                        <p className="text-slate-500 text-xs">Precisão: ~{Math.round(log.gps.accuracy)} metros</p>
                                        <a 
                                            href={`https://www.google.com/maps?q=${log.gps.latitude},${log.gps.longitude}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-blue-600 text-xs underline mt-1 block"
                                        >
                                            Ver no Mapa
                                        </a>
                                    </>
                                ) : (
                                    <p className="text-slate-400 italic">Não disponível ou negado</p>
                                )}
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 flex gap-2 pt-2 border-t border-slate-50">
                            <Smartphone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-500 break-all">{log.userAgent}</p>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
