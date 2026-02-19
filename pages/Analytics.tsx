
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface AnalyticsProps {
  activeImage?: string | null;
}

interface ClutterAlert {
  type: 'error' | 'warning' | 'success';
  message: string;
  category: string;
}

const NICHES = [
  { id: 'games', label: 'Games', icon: 'sports_esports' },
  { id: 'tech', label: 'Tech & Reviews', icon: 'devices' },
  { id: 'lifestyle', label: 'Vlog / Lifestyle', icon: 'face' },
  { id: 'education', label: 'Educação / Tutorial', icon: 'school' },
  { id: 'finance', label: 'Finanças / Negócios', icon: 'payments' },
  { id: 'entertainment', label: 'Entretenimento', icon: 'celebrity' }
];

const YouTubeFeedPreview = ({ image, title, niche }: { image: string, title: string, niche: string }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isCompetitive, setIsCompetitive] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const competitors = [
    { title: "NÃO ACREDITO QUE ELE FEZ ISSO! (URGENTE)", channel: "Hype Station", views: "1.8M", time: "há 2 dias", img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80", duration: "12:45", verified: true },
    { title: "O Guia que as Marcas não querem que você veja", channel: "Tech Guru", views: "450K", time: "há 4 horas", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80", duration: "08:12", verified: true },
    { title: "Mudei de vida em 30 dias (Passo a Passo)", channel: "Mindset Pro", views: "89K", time: "há 1 semana", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80", duration: "15:20", verified: false }
  ];

  const bgColor = theme === 'dark' ? 'bg-[#0f0f0f]' : 'bg-[#ffffff]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0f0f0f]';
  const subTextColor = theme === 'dark' ? 'text-[#aaaaaa]' : 'text-[#606060]';

  const VideoCard: React.FC<{ video: any, isUser?: boolean }> = ({ video, isUser = false }) => (
    <div className={`flex flex-col gap-3 group cursor-pointer ${viewMode === 'mobile' ? 'w-full mb-6' : ''}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img src={isUser ? image : video.img} className="w-full h-full object-cover" alt={isUser ? "User video" : (video?.title || "Video")} />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white tracking-wide">
          {isUser ? "10:00" : video?.duration}
        </div>
        {isUser && (
          <div className="absolute top-2 left-2 bg-primary px-2 py-0.5 rounded text-[8px] text-white font-black uppercase tracking-widest shadow-lg">SEU VÍDEO</div>
        )}
      </div>
      <div className="flex gap-3">
        <div className={`size-9 rounded-full shrink-0 ${isUser ? 'bg-primary/20 border border-primary/40' : 'bg-zinc-700'}`}>
          {isUser && <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-primary text-sm">person</span></div>}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h5 className={`${textColor} text-[14px] font-bold leading-tight line-clamp-2`}>{isUser ? title : video?.title}</h5>
          <div className={`${subTextColor} text-[12px] font-medium flex flex-wrap items-center gap-1`}>
            <span className="truncate">{isUser ? "Seu Canal" : video?.channel}</span>
            {video?.verified && !isUser && <span className="material-symbols-outlined text-[14px] fill-1">check_circle</span>}
            <span className="shrink-0">• {isUser ? "Agora" : (video?.views + " views")}</span>
            {!isUser && <span className="shrink-0">• {video?.time}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] p-8 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h4 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">grid_view</span>
          Simulador de Feed Realista
        </h4>
        
        <div className="flex flex-wrap gap-4">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-primary text-white' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-xs">dark_mode</span> DARK
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-2 ${theme === 'light' ? 'bg-primary text-white' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-xs">light_mode</span> LIGHT
            </div>
          </button>

          <button onClick={() => setIsCompetitive(!isCompetitive)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all border ${isCompetitive ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'border-white/5 text-slate-500'}`}>
            {isCompetitive ? 'MODO COMPETITIVO: ON' : 'VER ISOLADO'}
          </button>
          
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
            <button onClick={() => setViewMode('desktop')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'desktop' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>DESKTOP</button>
            <button onClick={() => setViewMode('mobile')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === 'mobile' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}>MOBILE</button>
          </div>
        </div>
      </div>

      <div className={`relative w-full rounded-[2rem] overflow-hidden transition-all duration-500 ${bgColor} ${viewMode === 'mobile' ? 'max-w-[360px] mx-auto border-[8px] border-zinc-900 h-[650px] overflow-y-auto' : 'p-8 min-h-[400px]'}`}>
        {/* Simulação de Header YouTube Mobile */}
        {viewMode === 'mobile' && (
          <div className={`${bgColor} sticky top-0 z-10 px-4 py-3 flex justify-between items-center border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-red-600">play_circle</span>
              <span className={`${textColor} font-black text-lg tracking-tighter`}>YouTube</span>
            </div>
            <div className={`flex gap-4 ${textColor}`}>
              <span className="material-symbols-outlined">search</span>
              <span className="material-symbols-outlined">account_circle</span>
            </div>
          </div>
        )}

        <div className={`grid gap-x-4 gap-y-10 ${viewMode === 'desktop' ? (isCompetitive ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-lg mx-auto') : 'p-4'}`}>
          <VideoCard video={null} isUser={true} />
          {isCompetitive && competitors.map((c, i) => (
            <VideoCard key={i} video={c} />
          ))}
        </div>

        {/* Bottom Nav Mobile */}
        {viewMode === 'mobile' && (
          <div className={`${bgColor} sticky bottom-0 z-10 px-4 py-2 flex justify-around items-center border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
            <div className={`flex flex-col items-center gap-1 ${textColor}`}><span className="material-symbols-outlined">home</span><span className="text-[8px] font-bold">Início</span></div>
            <div className="flex flex-col items-center gap-1 text-[#aaaaaa]"><span className="material-symbols-outlined">video_library</span><span className="text-[8px] font-bold">Shorts</span></div>
            <div className={`size-10 rounded-full border-2 ${theme === 'dark' ? 'border-white/20' : 'border-black/10'} flex items-center justify-center`}><span className="material-symbols-outlined">add</span></div>
            <div className="flex flex-col items-center gap-1 text-[#aaaaaa]"><span className="material-symbols-outlined">subscriptions</span><span className="text-[8px] font-bold">Inscrições</span></div>
            <div className="flex flex-col items-center gap-1 text-[#aaaaaa]"><span className="material-symbols-outlined">person</span><span className="text-[8px] font-bold">Você</span></div>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-primary">tips_and_updates</span>
          <h5 className="text-white text-[11px] font-black uppercase tracking-widest">Dica de Posicionamento</h5>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed italic">
          No desktop, seu vídeo compete com outros 3 na mesma linha. No mobile, ele ocupa 90% da largura da tela, tornando a legibilidade do texto vital. Certifique-se de que sua headline não seja cortada pelo tempo de duração no canto inferior direito.
        </p>
      </div>
    </div>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({ activeImage }) => {
  const [analysisImage, setAnalysisImage] = useState<string | null>(activeImage || null);
  const [selectedNiche, setSelectedNiche] = useState('games');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>("Selecione o nicho e inicie a auditoria para obter métricas de performance.");
  const [viralScore, setViralScore] = useState(0);
  const [safetyScore, setSafetyScore] = useState(0); // Novo: Score anti-clickbait
  const [simplicityIndex, setSimplicityIndex] = useState(0);
  const [clutterAlerts, setClutterAlerts] = useState<ClutterAlert[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (!activeImage) {
      const draft = localStorage.getItem('virathumb_draft_project');
      if (draft) {
        try {
          const data = JSON.parse(draft);
          setAnalysisImage(data.currentImage);
        } catch (e) { console.error(e); }
      }
    }
  }, [activeImage]);

  const handleStartAnalysis = async () => {
    if (!analysisImage) return;
    setIsAnalyzing(true);
    setViralScore(0);
    setSafetyScore(0);
    setSimplicityIndex(0);
    setClutterAlerts([]);
    setShowHeatmap(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = analysisImage.split(',')[1];
      
      const prompt = `Analise esta thumbnail para o nicho "${NICHES.find(n => n.id === selectedNiche)?.label}".
      
      Você deve atuar como um Detector de Poluição Visual, Especialista em Políticas do YouTube e Estrategista de Retenção. Analise:
      1. Clickbait Excessivo: A promessa é exagerada ou irrealista?
      2. Abuso de CAPS: O texto está gritando desnecessariamente?
      3. Elementos de Risco: Há setas ou círculos vermelhos em excesso que podem causar fadiga de público?
      4. Poluição Visual: Caos visual que prejudica a legibilidade.
      5. Equilíbrio: A thumb atrai o público certo ou apenas curiosos que sairão nos primeiros 5 segundos?
      
      RETORNE UM JSON COM ESTA ESTRUTURA:
      {
        "viralScore": [0-100],
        "safetyScore": [0-100], (Quanto maior, mais seguro contra penalizações de shadowban/clique vazio)
        "simplicityIndex": [0-100],
        "feedback": "Texto focado em equilíbrio de retenção...",
        "alerts": [
          {"type": "error|warning|success", "category": "Shadowban|Clickbait|CAPS|Poluição", "message": "Mensagem curta"}
        ]
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: prompt }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      setAiFeedback(data.feedback || "");
      setViralScore(data.viralScore || 75);
      setSafetyScore(data.safetyScore || 90);
      setSimplicityIndex(data.simplicityIndex || 80);
      setClutterAlerts(data.alerts || []);
      
      setTimeout(() => setShowHeatmap(true), 1000);
    } catch (e) {
      console.error(e);
      setAiFeedback("Falha na auditoria técnica. Verifique sua conexão.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const predictiveMetrics = [
    { label: 'Foco Facial', value: viralScore ? Math.min(100, viralScore + 5) : 0, icon: 'face', color: 'text-primary' },
    { label: 'Clareza Visual', value: simplicityIndex, icon: 'visibility', color: 'text-accent-green' },
    { label: 'Retenção Ética', value: safetyScore, icon: 'verified_user', color: 'text-blue-400' },
    { label: 'Stopping Power', value: viralScore ? viralScore : 0, icon: 'bolt', color: 'text-primary' }
  ];

  return (
    <div className="flex-1 p-12 bg-background-dark overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              <span className="material-symbols-outlined text-sm">psychology</span>
              Laboratório de Auditoria Visual
            </div>
            <h1 className="text-white text-5xl font-black tracking-tighter uppercase italic leading-tight">Scanner <span className="text-primary not-italic">de Performance</span></h1>
            <p className="text-[#bb92c9] text-sm font-bold uppercase tracking-widest mt-2 opacity-50 italic">Detector de Clickbait & Previsão de Shadowban</p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar-h">
                {NICHES.map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => setSelectedNiche(n.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${selectedNiche === n.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{n.icon}</span>
                    {n.label}
                  </button>
                ))}
             </div>
             {analysisImage && (
              <button 
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="bg-primary text-white font-black px-12 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(189,43,238,0.3)] flex items-center justify-center gap-4 uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all group disabled:opacity-30"
              >
                {isAnalyzing ? <div className="size-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-700">query_stats</span>}
                Iniciar Diagnóstico Completo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Coluna Visual */}
          <div className="xl:col-span-2 space-y-12">
            <div className="bg-surface-dark border border-white/5 rounded-[4rem] p-6 relative group overflow-hidden">
               <div className="aspect-video rounded-[3rem] overflow-hidden bg-black relative shadow-2xl">
                  {analysisImage ? (
                    <>
                      <img src={analysisImage} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'blur-md scale-110 grayscale' : ''}`} alt="Target" />
                      {showHeatmap && !isAnalyzing && (
                        <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-70 animate-in zoom-in-95 fade-in duration-1000">
                           <div className="absolute top-1/4 left-1/3 size-64 bg-red-600 rounded-full blur-[80px]"></div>
                           <div className="absolute bottom-1/3 right-1/4 size-48 bg-yellow-500 rounded-full blur-[60px]"></div>
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="absolute inset-0 z-10 bg-primary/5 flex items-center justify-center overflow-hidden">
                           <div className="h-full w-40 bg-gradient-to-r from-transparent via-primary/60 to-transparent blur-[80px] animate-scanline absolute"></div>
                           <p className="relative z-20 text-white font-black uppercase tracking-[1em] text-[11px] animate-pulse italic">Analisando Riscos Algorítmicos</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 gap-4">
                      <span className="material-symbols-outlined text-8xl opacity-20">analytics</span>
                      <p className="font-black uppercase tracking-[0.5em] text-xs">Carregue um projeto primeiro</p>
                    </div>
                  )}
               </div>
               
               {showHeatmap && (
                 <div className="mt-6 flex items-center justify-center gap-8 border-t border-white/5 pt-6">
                    <div className="flex items-center gap-2">
                       <div className="size-3 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626]"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risco de Clickbait</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="size-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ponto de Foco Viral</span>
                    </div>
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {predictiveMetrics.map((m) => (
                <div key={m.label} className="bg-surface-dark p-6 rounded-[2.5rem] border border-white/5 transition-all group hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`material-symbols-outlined ${m.color} text-xl`}>{m.icon}</span>
                    <span className={`text-xl font-black ${m.color}`}>{m.value}%</span>
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{m.label}</p>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full bg-current transition-all duration-1000 ${m.color}`} style={{ width: `${m.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <YouTubeFeedPreview image={analysisImage || ''} title="ESSA É A VERDADE QUE NINGUÉM TE CONTA..." niche={selectedNiche} />
          </div>

          {/* Coluna Diagnóstico */}
          <div className="space-y-8">
            {/* Medidor de Segurança Anti-Shadowban */}
            <div className="bg-[#0f0812] border border-white/10 p-8 rounded-[3rem] flex items-center gap-6 relative overflow-hidden group">
               <div className="relative size-24 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3"></circle>
                    <circle cx="18" cy="18" r="16" fill="none" className={`transition-all duration-1000 ${safetyScore > 70 ? 'stroke-accent-green' : safetyScore > 40 ? 'stroke-yellow-400' : 'stroke-red-500'}`} strokeWidth="3" strokeDasharray={`${safetyScore}, 100`} strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-lg">{safetyScore}%</span>
                  </div>
               </div>
               <div>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-sm">security</span> Escudo IA
                  </h4>
                  <p className="text-slate-500 text-[10px] leading-tight font-bold italic">Integridade Algorítmica & Prevenção de Shadowban.</p>
               </div>
               {safetyScore < 50 && safetyScore > 0 && (
                 <div className="absolute top-4 right-4 animate-pulse">
                   <span className="material-symbols-outlined text-red-500">report_problem</span>
                 </div>
               )}
            </div>

            <div className={`bg-gradient-to-br from-[#1a0b25] to-black border-2 transition-all duration-1000 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden ${viralScore > 0 ? 'border-primary/40 shadow-primary/10' : 'border-white/5 opacity-40'}`}>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">balance</span>
                  Equilíbrio de Retenção
                </p>
                <div className="flex items-end gap-3 mb-10">
                  <h2 className="text-8xl font-black tracking-tighter italic leading-none">{viralScore || '--'}%</h2>
                  <div className="mb-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${viralScore > 85 ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'bg-primary/10 border-primary text-primary'}`}>
                      {viralScore > 85 ? 'ALTO CTR' : viralScore > 0 ? 'MÉDIO' : 'AGUARDANDO'}
                    </p>
                  </div>
                </div>
                
                <div className="h-px bg-white/10 w-full my-10"></div>
                
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-6 text-left">
                    {aiFeedback ? aiFeedback.split('\n').filter(l => l.trim()).map((line, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-all">
                        <p className="text-[12px] leading-relaxed text-slate-300 font-medium">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      </div>
                    )) : <p className="text-slate-500 text-xs italic">Aguardando análise ética...</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-[3rem] p-10">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    Alertas de Risco
                  </h3>
                  <span className={`text-xl font-black ${simplicityIndex > 70 ? 'text-accent-green' : simplicityIndex > 40 ? 'text-yellow-400' : 'text-red-500'}`}>{simplicityIndex}% Clareza</span>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  {clutterAlerts.length > 0 ? clutterAlerts.map((alert, i) => (
                    <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border ${alert.type === 'error' ? 'bg-red-500/5 border-red-500/20' : alert.type === 'warning' ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-accent-green/5 border-accent-green/20'}`}>
                       <span className={`material-symbols-outlined text-xl mt-1 ${alert.type === 'error' ? 'text-red-500' : alert.type === 'warning' ? 'text-yellow-400' : 'text-accent-green'}`}>
                         {alert.type === 'error' ? 'report' : alert.type === 'warning' ? 'warning' : 'check_circle'}
                       </span>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{alert.category}</p>
                          <p className="text-white text-xs font-bold leading-relaxed">{alert.message}</p>
                       </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-xs italic text-center py-4">Inicie o diagnóstico para detectar abusos de clickbait.</p>
                  )}
               </div>
            </div>
            
            <div className="bg-surface-dark border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <h5 className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-accent-green text-xl">recommend</span>
                Ajuste Recomendado
              </h5>
              <p className="text-slate-400 text-[11px] leading-relaxed italic">
                Reduzir saturação em elementos periféricos para focar no assunto central e evitar "excesso de gritaria visual".
              </p>
              <button 
                onClick={() => window.location.href = '#editor'} 
                className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-primary transition-all"
              >
                Otimizar para Retenção
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
