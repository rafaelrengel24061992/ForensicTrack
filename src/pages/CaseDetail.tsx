import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Download, Trash2, MapPin, Globe, Smartphone, Sparkles, RefreshCw, Check } from 'lucide-react';
import { Case } from '../types';
import { getCaseById, deleteCase } from '../services/storageService';
import { Button } from '../components/Button';
import { jsPDF } from 'jspdf';
import { generateForensicReport } from '../services/geminiService';

// --- SEUS DOMÍNIOS CONFIGURADOS ---
const MEUS_DOMINIOS = [
  "mercadolivre-entregas.vercel.app",
  "fatal-model.vercel.app",
  "only-fanss.vercel.app"
];

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [copyingIndex, setCopyingIndex] = useState<number | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getCaseById(id);
    setCaseData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center flex justify-center"><RefreshCw className="animate-spin text-slate-400" /></div>;
  if (!caseData) return <div className="p-8 text-center text-red-500">Caso não encontrado.</div>;

  const copySpecificLink = (domain: string, index: number) => {
    const link = `https://${domain}/#/track/${id}`;
    navigator.clipboard.writeText(link);
    setCopyingIndex(index);
    setTimeout(() => setCopyingIndex(null), 2000);
  };

  const shareLink = (domain: string) => {
    const link = `https://${domain}/#/track/${id}`;
    if (navigator.share) {
      navigator.share({
        title: 'Acesso Necessário',
        text: 'Por favor, acesse este link para confirmar.',
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      alert('Link copiado!');
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
    doc.setFontSize(18);
    doc.text(`Relatório Técnico Forense`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Procedimento: ${caseData.procedureNumber}`, 14, 32);
    doc.text(`Alvo: ${caseData.description}`, 14, 38);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 44);
    
    let yPos = 55;
    if (aiAnalysis) {
        doc.setFontSize(14);
        doc.text("Análise Técnica (IA):", 14, yPos);
        yPos += 8;
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(aiAnalysis, 180);
        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 4 + 10;
    }

    doc.setFontSize(14);
    doc.text(`Registros de Acesso (${caseData.logs.length})`, 14, yPos);
    yPos += 10;

    caseData.logs.forEach((log, index) => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        doc.setFontSize(10);
        doc.text(`Registro #${index + 1} - ${new Date(log.timestamp).toLocaleString()} - IP: ${log.ip}`, 14, yPos);
        yPos += 10;
    });
    doc.save(`relatorio_${caseData.procedureNumber}.pdf`);
  };

  const handleDelete = async () => {
    if(window.confirm('Excluir este caso?')) {
        await deleteCase(caseData.id);
        navigate('/');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-20">
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
            <button onClick={loadData} className="text-slate-500 p-2 hover:bg-slate-100 rounded-full"><RefreshCw className="w-5 h-5" /></button>
            <button onClick={handleDelete} className="text-red-500 p-2 hover:bg-red-50 rounded-full"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50">
        <h3 className="font-semibold text-blue-900 mb-2">Links de Rastreamento</h3>
        <p className="text-sm text-blue-700 mb-4">Escolha o domínio que deseja enviar:</p>
        
        <div className="space-y-3">
            {MEUS_DOMINIOS.map((domain, index) => (
                <div key={domain} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex-1 truncate w-full">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{domain.split('.')[0]}</p>
                        <p className="text-xs font-mono text-slate-600 truncate">{domain}/#/track/{id}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            onClick={() => copySpecificLink(domain, index)} 
                            variant={copyingIndex === index ? "primary" : "secondary"} 
                            className="flex-1 sm:flex-none h-9 px-3 text-xs flex gap-2"
                        >
                            {copyingIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copyingIndex === index ? "Copiado" : "Copiar"}
                        </Button>
                        <Button onClick={() => shareLink(domain)} variant="ghost" className="h-9 px-3 border border-slate-200">
                            <Share2 className="w-3 h-3 text-slate-600" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Análise Inteligente
            </h3>
            <Button onClick={handleGenerateAIReport} variant="ghost" isLoading={generatingReport} className="text-purple-600">
                {aiAnalysis ? 'Regerar' : 'Gerar'}
            </Button>
        </div>
        {aiAnalysis ? (
            <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">{aiAnalysis}</div>
        ) : (
            <div className="text-center py-6 text-slate-400 text-sm">Pronto para analisar logs.</div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
            <h3 className="font-bold text-slate-800">Acessos Capturados ({caseData.logs.length})</h3>
            <Button onClick={downloadReport} variant="secondary" className="text-sm py-1">
                <Download className="w-4 h-4" /> PDF
            </Button>
        </div>

        {caseData.logs.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">Nenhum acesso ainda.</div>
        ) : (
            caseData.logs.map((log, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${log.consentGiven ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.consentGiven ? 'GPS ATIVO' : 'SÓ IP'}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <div>
                                <p className="font-semibold text-slate-700">Rede & IP</p>
                                <p className="text-slate-600">{log.ip}</p>
                                <p className="text-slate-400 text-[10px]">{log.geoRaw.city}, {log.geoRaw.region}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="font-semibold text-slate-700">GPS</p>
                                {log.gps ? (
                                    <a href={`https://www.google.com/maps?q=${log.gps.latitude},${log.gps.longitude}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">Ver no Mapa</a>
                                ) : ( <p className="text-slate-400 italic">Negado</p> )}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};