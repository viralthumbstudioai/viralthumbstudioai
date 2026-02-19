
import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, Template } from '../types';

interface LibraryProps {
  onSelectTemplate?: (template: Template) => void;
}

const POWER_WORDS = [
  { word: 'Bizarro', impact: '98%', type: 'Curiosidade' },
  { word: 'Revelado', impact: '95%', type: 'Promessa' },
  { word: 'Finalmente', impact: '92%', type: 'Alívio' },
  { word: 'Erro Crucial', impact: '97%', type: 'Medo' },
  { word: 'Proibido', impact: '99%', type: 'Exclusividade' },
  { word: 'Inacreditável', impact: '94%', type: 'Choque' },
];

const PSYCH_TRIGGERS = [
  { id: 'curiosity', label: 'Curiosidade', icon: 'help', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'shock', label: 'Choque', icon: 'bolt', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { id: 'promise', label: 'Promessa', icon: 'stars', color: 'text-accent-green', bg: 'bg-accent-green/10' },
  { id: 'conflict', label: 'Conflito', icon: 'swords', color: 'text-red-500', bg: 'bg-red-500/10' },
];

const STRATEGIC_TEMPLATES: Template[] = [
  {
    id: 'fin-01',
    category: 'financas',
    name: 'A Grande Queda',
    description: 'Focado em urgência e perda. Cores vermelhas e contraste pesado.',
    previewUrl: 'https://images.unsplash.com/photo-1611974715853-26d30574299a?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 75, y: 55, w: 35, h: 70 },
      textArea: { x: 30, y: 45, w: 40, h: 30 },
      eyeLevel: 45
    }
  },
  {
    id: 'tech-01',
    category: 'tech',
    name: 'Review Minimalista',
    description: 'Assunto centralizado com luz neon. Foco em estética e detalhe.',
    previewUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 50, y: 65, w: 25, h: 50 },
      textArea: { x: 50, y: 25, w: 70, h: 20 },
      eyeLevel: 55
    }
  },
  {
    id: 'games-01',
    category: 'games',
    name: 'Battle Royale Chaos',
    description: 'Cenas de ação ao fundo com rosto expressivo em primeiro plano.',
    previewUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 25, y: 60, w: 35, h: 65 },
      textArea: { x: 70, y: 40, w: 40, h: 40 },
      eyeLevel: 50
    }
  },
  {
    id: 'relig-01',
    category: 'religiao',
    name: 'Sabedoria Profunda',
    description: 'Iluminação Rembrandt, tons sépia e fontes clássicas elegantes.',
    previewUrl: 'https://images.unsplash.com/photo-1504052434139-4413b63118f6?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 50, y: 45, w: 40, h: 55 },
      textArea: { x: 50, y: 82, w: 85, h: 18 },
      eyeLevel: 35
    }
  },
  {
    id: 'mkt-01',
    category: 'marketing',
    name: 'O Método Secreto',
    description: 'Split screen comparativo: Antes vs Depois com setas indicativas.',
    previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 88, y: 72, w: 22, h: 42 },
      textArea: { x: 45, y: 35, w: 65, h: 28 },
      eyeLevel: 65
    }
  },
  {
    id: 'vlog-01',
    category: 'vlog',
    name: 'Day in Life Natural',
    description: 'Profundidade de campo suave (bokeh) com texto manuscrito.',
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 35, y: 55, w: 45, h: 75 },
      textArea: { x: 75, y: 25, w: 35, h: 22 },
      eyeLevel: 45
    }
  },
  {
    id: 'pod-01',
    category: 'podcast',
    name: 'Dual Guest Focus',
    description: 'Dois rostos em perfil com microfone icônico ao centro.',
    previewUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 50, y: 55, w: 85, h: 55 },
      textArea: { x: 50, y: 18, w: 80, h: 18 },
      eyeLevel: 48
    }
  },
  {
    id: 'edu-01',
    category: 'educacao',
    name: 'Aula de Quadro Negro',
    description: 'Assunto em destaque lateral com área limpa para diagramas.',
    previewUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    blueprint: {
      faceArea: { x: 85, y: 55, w: 28, h: 75 },
      textArea: { x: 38, y: 50, w: 65, h: 65 },
      eyeLevel: 40
    }
  }
];

const Library: React.FC<LibraryProps> = ({ onSelectTemplate }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'copy' | 'templates'>('templates');
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [showBlueprints, setShowBlueprints] = useState(true);
  
  // Hook Engine State
  const [hookTopic, setHookTopic] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('curiosity');
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<any[]>([]);
  const [emotionalScore, setEmotionalScore] = useState(0);

  const staticAssets: Asset[] = [
    { id: '1', title: 'Rosto de Choque Supremo', type: 'Rosto', format: 'PNG', heat: 98, velocity: '+22%', imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
    { id: '2', title: 'Fundo de Explosão Nuclear', type: 'Fundo', format: 'JPG', heat: 85, velocity: '+12%', imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=400&q=80' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('virathumb_user_assets');
    if (saved) try { setUserAssets(JSON.parse(saved)); } catch (e) { console.error(e); }
  }, []);

  const generateStrategicHooks = async () => {
    if (!hookTopic) return;
    setIsGeneratingHooks(true);
    setEmotionalScore(0);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const triggerLabel = PSYCH_TRIGGERS.find(t => t.id === selectedTrigger)?.label;
      
      const prompt = `Como um estrategista de YouTube, crie 3 "Ganchos Visuais" (Headline para thumbnail) para o tópico: "${hookTopic}".
      Gatilho Psicológico principal: ${triggerLabel}.
      Cada gancho deve ser curto (2-4 palavras grandes).
      Retorne um JSON com: 
      - text: a frase
      - emphasis: qual palavra deve ser a maior de todas
      - power: score de 0 a 100 de impacto emocional
      - reason: breve explicação do gatilho usado.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                emphasis: { type: Type.STRING },
                power: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '[]');
      setGeneratedHooks(data);
      if (data.length > 0) setEmotionalScore(data[0].power);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingHooks(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (templateCategory === 'all') return STRATEGIC_TEMPLATES;
    return STRATEGIC_TEMPLATES.filter(t => t.category === templateCategory);
  }, [templateCategory]);

  const allAssets = [...userAssets, ...staticAssets];

  const TemplateCard: React.FC<{ template: Template }> = ({ template }) => (
    <div className="group bg-surface-dark rounded-[2.5rem] border border-white/5 overflow-hidden transition-all hover:border-primary/50 flex flex-col h-full">
      <div className="aspect-video relative overflow-hidden bg-black shrink-0">
        <img src={template.previewUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={template.name} />
        
        {showBlueprints && (
          <div className="absolute inset-0 pointer-events-none z-10 animate-in fade-in zoom-in-95">
             <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
             <div 
               className="absolute border-2 border-accent-green/60 bg-accent-green/5 rounded-full flex items-center justify-center"
               style={{ 
                 left: `${template.blueprint.faceArea.x}%`, 
                 top: `${template.blueprint.faceArea.y}%`,
                 width: `${template.blueprint.faceArea.w}%`,
                 height: `${template.blueprint.faceArea.h}%`,
                 transform: 'translate(-50%, -50%)'
               }}
             >
                <div className="text-[7px] font-black text-accent-green uppercase tracking-widest bg-black/60 px-1 py-0.5 rounded">Face Zone</div>
             </div>

             <div 
               className="absolute border-2 border-primary/60 bg-primary/5 rounded-xl flex items-center justify-center"
               style={{ 
                 left: `${template.blueprint.textArea.x}%`, 
                 top: `${template.blueprint.textArea.y}%`,
                 width: `${template.blueprint.textArea.w}%`,
                 height: `${template.blueprint.textArea.h}%`,
                 transform: 'translate(-50%, -50%)'
               }}
             >
                <div className="text-[7px] font-black text-primary uppercase tracking-widest bg-black/60 px-1 py-0.5 rounded">Text Hook</div>
             </div>
          </div>
        )}

        <div className="absolute top-4 right-4 z-20">
          <span className="bg-black/60 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded-full uppercase tracking-widest border border-white/10">
            {template.category}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">{template.name}</h4>
        <p className="text-slate-500 text-[10px] leading-relaxed mb-6 flex-1 italic">{template.description}</p>
        <button 
          onClick={() => onSelectTemplate?.(template)}
          className="w-full bg-white/5 border border-white/10 hover:bg-primary transition-all py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
        >
          Aplicar Estrutura
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-background-dark overflow-hidden">
      <div className="flex px-12 py-6 border-b border-white/5 bg-[#0a050d] gap-12 shrink-0 overflow-x-auto custom-scrollbar-h">
        <button onClick={() => setActiveTab('templates')} className={`group flex items-center gap-3 transition-all shrink-0 ${activeTab === 'templates' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}>
          <span className={`material-symbols-outlined ${activeTab === 'templates' ? 'material-symbols-fill' : ''}`}>dashboard_customize</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Templates Virais</p>
            <p className="text-[8px] font-bold opacity-40 uppercase">Estratégias de Sucesso</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('visual')} className={`group flex items-center gap-3 transition-all shrink-0 ${activeTab === 'visual' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}>
          <span className={`material-symbols-outlined ${activeTab === 'visual' ? 'material-symbols-fill' : ''}`}>photo_library</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Visual Lab</p>
            <p className="text-[8px] font-bold opacity-40 uppercase">Ativos & Grafismos</p>
          </div>
        </button>
        <button onClick={() => setActiveTab('copy')} className={`group flex items-center gap-3 transition-all shrink-0 ${activeTab === 'copy' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}>
          <span className={`material-symbols-outlined ${activeTab === 'copy' ? 'material-symbols-fill' : ''}`}>psychology_alt</span>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Copy Lab</p>
            <p className="text-[8px] font-bold opacity-40 uppercase">Estratégia & Headlines</p>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        {activeTab === 'templates' && (
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Vault <span className="text-primary not-italic">Estratégico</span></h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Estruturas comprovadas por nicho e comportamento real</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <button onClick={() => setShowBlueprints(!showBlueprints)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${showBlueprints ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                    {showBlueprints ? 'Ocultar Hierarquia' : 'Ver Blueprints IA'}
                  </button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}
        {/* Rest of activeTab conditions (visual/copy) remain unchanged for brevity but are part of the file */}
        {activeTab === 'visual' && (
          <div className="max-w-7xl mx-auto space-y-12">
            <section>
              <div className="relative overflow-hidden rounded-[3rem] bg-surface-dark h-64 flex items-center p-12 group border border-white/5">
                <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1200&q=80')` }}></div>
                <div className="relative z-10">
                  <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-2">Visual <span className="text-primary not-italic">Assets</span></h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Elementos de alta retenção para sua composição</p>
                </div>
              </div>
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allAssets.map((asset) => (
                <div key={asset.id} className="group bg-surface-dark rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-primary/50 hover:scale-[1.02]">
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <img src={asset.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={asset.title} />
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-bold text-xs truncate mb-1">{asset.title}</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase">{asset.type} • {asset.format}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}
        {activeTab === 'copy' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-8">
              <div className="bg-surface-dark border border-white/5 rounded-[3rem] p-10">
                <h3 className="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Configurar Gancho
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Tópico do Vídeo</label>
                    <input type="text" value={hookTopic} onChange={(e) => setHookTopic(e.target.value)} placeholder="Ex: Como ganhar seguidores..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <button onClick={generateStrategicHooks} disabled={isGeneratingHooks || !hookTopic} className="w-full bg-primary text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30">
                    {isGeneratingHooks ? 'Analisando Psicologia...' : 'Gerar Headlines Estratégicas'}
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-gradient-to-br from-[#1d1022] to-black border border-white/5 rounded-[4rem] p-12 relative overflow-hidden">
                  <div className="space-y-6">
                    {isGeneratingHooks ? (
                      <div className="space-y-4 py-20 flex flex-col items-center">
                        <div className="size-12 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
                      </div>
                    ) : generatedHooks.length > 0 ? (
                      generatedHooks.map((h, i) => (
                        <div key={i} className="group bg-white/5 border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/30 transition-all">
                           <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">{h.text}</h4>
                        </div>
                      ))
                    ) : (
                      <div className="py-32 flex flex-col items-center justify-center text-slate-800">
                        <p className="font-black uppercase tracking-[0.5em] text-xs">Aguardando entrada estratégica</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
