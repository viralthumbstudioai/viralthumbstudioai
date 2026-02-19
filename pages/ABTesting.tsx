
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

const VerdictAnalysis: React.FC<{ text: string; winner: 'A' | 'B' | null }> = ({ text, winner }) => {
  const sections = text.split(/Pilar:|###/g).filter(s => s.trim().length > 15);
  const finalVerdictRaw = text.split('### Veredito Final')[1] || "";
  const cleanFinalVerdict = finalVerdictRaw.replace(/\*\*/g, '').trim();

  return (
    <div className="mt-24 w-full max-w-7xl space-y-32 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-4 px-8 py-2.5 rounded-full bg-accent-green/10 border border-accent-green/30 text-accent-green text-[11px] font-black uppercase tracking-[0.5em]">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          Auditoria Técnica de Performance
        </div>
        <h2 className="text-white text-6xl font-black italic uppercase tracking-tighter leading-none">
          Diagnóstico de <span className="text-primary not-italic">Alta Retenção</span>
        </h2>
      </div>

      <div className="space-y-24">
        {sections.map((section, idx) => {
          if (section.toLowerCase().includes('veredito final')) return null;
          const lines = section.split('\n').filter(l => l.trim() !== '');
          const title = lines[0]?.trim();
          const analysisA = lines.find(l => l.toUpperCase().includes('IMAGEM A'))?.replace(/.*Imagem A:\s*/i, '').trim();
          const analysisB = lines.find(l => l.toUpperCase().includes('IMAGEM B'))?.replace(/.*Imagem B:\s*/i, '').trim();

          return (
            <div key={idx} className="relative">
              <div className="flex items-center gap-8 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <div className="px-10 py-3 bg-surface-dark border border-white/10 rounded-[2rem] shadow-2xl">
                  <h3 className="text-white text-2xl font-black uppercase tracking-tighter italic">{title}</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 lg:gap-32 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block"></div>
                <div className="relative">
                  <div className={`p-10 rounded-[3rem] border-2 transition-colors ${winner === 'A' ? 'bg-accent-green/5 border-accent-green/20' : 'bg-white/5 border-white/5'}`}>
                    <p className="text-slate-200 text-xl leading-relaxed font-bold tracking-tight">{analysisA || "Análise indisponível."}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className={`p-10 rounded-[3rem] border-2 transition-colors ${winner === 'B' ? 'bg-accent-green/5 border-accent-green/20' : 'bg-white/5 border-white/5'}`}>
                    <p className="text-slate-200 text-xl leading-relaxed font-bold tracking-tight">{analysisB || "Análise indisponível."}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cleanFinalVerdict && (
        <div className={`relative p-1 bg-gradient-to-br ${winner === 'A' ? 'from-accent-green/30' : 'from-primary/30'} to-transparent rounded-[5rem] mt-40 shadow-2xl`}>
          <div className="bg-[#0b060d] rounded-[4.9rem] p-16 md:p-28 relative z-10 flex flex-col md:flex-row items-center gap-20 border border-white/10">
            <div className="shrink-0 relative">
              <div className={`absolute inset-0 blur-[100px] opacity-20 ${winner === 'A' ? 'bg-accent-green' : 'bg-primary'}`}></div>
              <div className={`relative size-52 rounded-full flex flex-col items-center justify-center border-4 border-white/10 shadow-2xl ${winner === 'A' ? 'bg-accent-green' : 'bg-primary'}`}>
                <span className="material-symbols-outlined text-white text-8xl material-symbols-fill mb-2">military_tech</span>
                <span className="text-white font-black text-xs uppercase tracking-[0.2em]">Winner {winner}</span>
              </div>
            </div>
            <div className="flex-1 space-y-10">
              <h3 className="text-white text-5xl font-black uppercase tracking-tighter leading-[0.9]">
                A Superioridade da <span className={`${winner === 'A' ? 'text-accent-green' : 'text-primary'} italic`}>Variação {winner}</span>
              </h3>
              <p className="text-slate-100 text-3xl leading-snug font-black italic tracking-tight opacity-95">"{cleanFinalVerdict}"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ABTesting: React.FC = () => {
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const [verdict, setVerdict] = useState<{winner: 'A' | 'B' | null, reason: string} | null>(null);
  
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, variant: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (variant === 'A') setImgA(result);
        else setImgB(result);
        setVerdict(null); 
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVariantIA = async () => {
    if (!imgA) return;
    setIsGeneratingVariant(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imgA.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: "Crie uma variação estratégica desta thumbnail para um teste A/B. Foque em: 1. Aumentar drasticamente o contraste cromático. 2. Tornar o rosto do sujeito mais expressivo e nítido. 3. Mudar o fundo para uma cor complementar oposta para ver qual se destaca mais no feed. Mantenha os mesmos elementos de texto mas otimize a legibilidade." }
          ]
        },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setImgB(`data:image/png;base64,${part.inlineData.data}`);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar variante estratégica.");
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  const handleExportAll = () => {
    const now = new Date().toISOString().slice(0, 10);
    const download = (data: string, name: string) => {
      const link = document.createElement('a');
      link.href = data;
      link.download = name;
      link.click();
    };
    if (imgA) download(imgA, `TESTE_AB_${now}_VAR_A.png`);
    if (imgB) download(imgB, `TESTE_AB_${now}_VAR_B.png`);
  };

  const handleAnalyze = async () => {
    if (!imgA || !imgB) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64A = imgA.split(',')[1];
      const base64B = imgB.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            parts: [
              { text: "Você é um estrategista de YouTube. Compare A e B ponto a ponto.\nESTRUTURA:\n1. 'GANHADOR: VARIAÇÃO A' ou 'GANHADOR: VARIAÇÃO B'.\n2. Pilares: Contraste, Clareza, Emoção, Legibilidade.\n3. '### Veredito Final' técnico." },
              { inlineData: { data: base64A, mimeType: "image/png" } },
              { inlineData: { data: base64B, mimeType: "image/png" } }
            ]
          }
        ]
      });
      
      const text = response.text || "";
      const winner = text.toUpperCase().includes('GANHADOR: VARIAÇÃO B') ? 'B' : 'A';
      setVerdict({ winner: winner as 'A' | 'B', reason: text });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 p-12 bg-background-dark overflow-y-auto custom-scrollbar items-center flex flex-col">
      <div className="mb-20 text-center w-full max-w-4xl">
        <h1 className="text-white text-7xl font-black italic tracking-tighter uppercase mb-6 leading-none">Duelo de <span className="text-primary not-italic">CTR</span></h1>
        <p className="text-[#bb92c9] text-sm font-bold uppercase tracking-[0.6em] opacity-50">Inteligência Competitiva de A/B Testing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12 max-w-7xl w-full relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
           <div className="size-20 rounded-full bg-primary flex items-center justify-center border-4 border-background-dark shadow-[0_0_50px_rgba(189,43,238,0.5)]">
             <span className="text-white font-black italic text-2xl">VS</span>
           </div>
        </div>

        {/* Slot A */}
        <div className={`p-10 rounded-[5rem] border-2 transition-all duration-500 bg-surface-dark ${verdict?.winner === 'A' ? 'border-accent-green shadow-[0_0_100px_rgba(57,255,20,0.1)]' : 'border-white/5'}`}>
          <div className="flex justify-between items-center mb-10">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Design Original A</span>
            <button onClick={() => fileInputARef.current?.click()} className="text-primary font-black text-[10px] uppercase hover:underline">Trocar</button>
          </div>
          <input type="file" ref={fileInputARef} onChange={(e) => handleFileUpload(e, 'A')} className="hidden" accept="image/*" />
          <div className="aspect-video rounded-[3rem] overflow-hidden bg-black/40 border-2 border-dashed border-white/5 flex items-center justify-center group cursor-pointer" onClick={() => !imgA && fileInputARef.current?.click()}>
            {imgA ? <img src={imgA} className="w-full h-full object-cover" alt="Thumb A" /> : <span className="material-symbols-outlined text-6xl opacity-10">add_a_photo</span>}
          </div>
        </div>

        {/* Slot B */}
        <div className={`p-10 rounded-[5rem] border-2 transition-all duration-500 bg-surface-dark ${verdict?.winner === 'B' ? 'border-accent-green shadow-[0_0_100px_rgba(57,255,20,0.1)]' : 'border-white/5'}`}>
          <div className="flex justify-between items-center mb-10">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Variante de Teste B</span>
            <div className="flex gap-4">
              <button onClick={() => fileInputBRef.current?.click()} className="text-primary font-black text-[10px] uppercase hover:underline">Trocar</button>
            </div>
          </div>
          <input type="file" ref={fileInputBRef} onChange={(e) => handleFileUpload(e, 'B')} className="hidden" accept="image/*" />
          <div className="aspect-video rounded-[3rem] overflow-hidden bg-black/40 border-2 border-dashed border-white/5 flex items-center justify-center group relative cursor-pointer" onClick={() => !imgB && fileInputBRef.current?.click()}>
            {isGeneratingVariant && (
              <div className="absolute inset-0 z-20 bg-primary/20 backdrop-blur-md flex flex-col items-center justify-center">
                <div className="size-12 border-4 border-white border-t-transparent animate-spin rounded-full mb-4"></div>
                <p className="text-white font-black text-[10px] uppercase tracking-widest">IA Gerando Variação Estratégica...</p>
              </div>
            )}
            {imgB ? <img src={imgB} className="w-full h-full object-cover" alt="Thumb B" /> : (
              <div className="text-center p-8">
                 <span className="material-symbols-outlined text-6xl opacity-10 block mb-4">add_a_photo</span>
                 {imgA && (
                   <button 
                    onClick={(e) => { e.stopPropagation(); generateVariantIA(); }}
                    className="bg-primary/20 border border-primary/40 text-primary font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                   >
                     Gerar Variação IA
                   </button>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center w-full pb-48">
        <div className="flex gap-6 items-center flex-wrap justify-center">
          <button 
            onClick={handleAnalyze}
            disabled={!imgA || !imgB || isAnalyzing}
            className="bg-primary text-white font-black px-12 py-6 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-10 uppercase tracking-[0.4em] text-[10px] flex items-center gap-4 group"
          >
            {isAnalyzing ? <div className="size-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform">query_stats</span>}
            Auditar Duelo
          </button>

          {(imgA || imgB) && (
            <button 
              onClick={handleExportAll}
              className="bg-white/5 border border-white/10 text-white font-black px-12 py-6 rounded-[2rem] hover:bg-white/10 transition-all uppercase tracking-[0.4em] text-[10px] flex items-center gap-4"
            >
              <span className="material-symbols-outlined text-xl">download_for_offline</span>
              Baixar Kit de Teste
            </button>
          )}

          <button onClick={() => {setImgA(null); setImgB(null); setVerdict(null);}} className="text-slate-600 font-black px-8 py-2 text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">Resetar</button>
        </div>

        {verdict && <VerdictAnalysis text={verdict.reason} winner={verdict.winner} />}
      </div>
    </div>
  );
};

export default ABTesting;
