
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../types';
import PollinationsImage from "../components/PollinationsImage";

interface FastScaleResult {
  imageUrl: string;
  headline: string;
  palette: { name: string, colors: string[], strategy: string };
  trigger: string;
}

interface GeneratorProps {
  initialEntry?: 'generator' | 'upload' | 'template' | 'fast-scale';
  onComplete: (image: string, title: string) => void;
  onCancel: () => void;
}

const RATIO_OPTIONS = [
  { id: '16:9', label: 'YouTube', sub: '16:9 / 1920x1080', icon: 'rectangle', class: 'w-8 h-4.5' },
  { id: '9:16', label: 'Shorts/TikTok', sub: '9:16 / 1080x1920', icon: 'smartphone', class: 'w-4.5 h-8' },
  { id: '1:1', label: 'Instagram', sub: '1:1 / 1080x1080', icon: 'square', class: 'w-6 h-6' },
];

const LANGUAGES: { id: Language, label: string, flag: string }[] = [
  { id: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { id: 'en', label: 'English (US)', flag: '🇺🇸' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

const Generator: React.FC<GeneratorProps> = ({ initialEntry = 'generator', onComplete, onCancel }) => {
  const [step, setStep] = useState<'topic' | 'title' | 'image-choice' | 'style' | 'result' | 'fast-scale-results'>('topic');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<string>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [fastScaleResults, setFastScaleResults] = useState<FastScaleResult[]>([]);
  // Store valid URLs that successfully loaded
  const [validImageUrls, setValidImageUrls] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialEntry === 'fast-scale') {
      setStep('topic');
    } else if (initialEntry === 'template') {
      setTopic('Ideias de Tendência');
    }
  }, [initialEntry]);

  const generateTitles = async () => {
    if (!topic.trim()) return;
    if (initialEntry === 'fast-scale') {
      setSelectedTitle(topic);
      runFastScaleIA();
      return;
    }

    setIsGenerating(true);
    setStatusMsg('Brainstorming títulos virais...');
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setTitles(data);
      setStep('title');
    } catch (e) {
      console.error(e);
      setStatusMsg('Erro ao gerar ideias.');
    } finally {
      setIsGenerating(false);
    }
  };

  const runFastScaleIA = async () => {
    setIsGenerating(true);
    setStatusMsg('Concebendo 3 ângulos psicológicos...');
    setFastScaleResults([]);

    try {
      // Use Pollinations Text API for Strategy Generation
      const promptText = `Analise o título: "${topic}". Crie 3 variantes estratégicas para thumbnail.
      Idioma de saída: ${language}.
      REGRAS CRÍTICAS DE TEXTO:
      - A "headline" deve estar escrita com GRAFIA 100% CORRETA, sem erros.
      - Idioma: ${language}.
      - Máximo 3 palavras por headline.
      - Retorne APENAS um JSON válido.
      Exemplo de formato:
      [
        {
          "headline": "TEXTO AQUI",
          "trigger": "curiosidade",
          "palette": { "name": "Vibrante", "colors": ["#FF0000"], "strategy": "Alto Contraste" }
        }
      ]`;

      let strategies = [];

      // 1. Try Google Gemini (Best Quality)
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const strategyResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: promptText,
          config: { responseMimeType: "application/json" }
        });
        strategies = JSON.parse(strategyResponse.text || '[]');
      } catch (geminiError) {
        console.warn("Gemini Failed, trying Pollinations...", geminiError);

        // 2. Try Pollinations (Backup)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (response.ok) {
            const text = await response.text();
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
            strategies = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
          }
        } catch (pollinationsError) {
          console.error("Pollinations also failed:", pollinationsError);
        }
      }

      // UNIFIED SMART FALLBACK
      // If strategies is empty (API failed or JSON parse failed), use local context-aware version.
      if (!strategies || strategies.length === 0) {
        strategies = [
          {
            headline: "IMPERDÍVEL",
            trigger: `Curiosidade: ${topic}`,
            palette: { name: "Alto Impacto", colors: ["#FF0000", "#FFFFFF"], strategy: "Contraste" }
          },
          {
            headline: "SEGREDO",
            trigger: `Revelação sobre ${topic}`,
            palette: { name: "Misterioso", colors: ["#800080", "#000000"], strategy: "Dark" }
          },
          {
            headline: "NOVO MÉTODO",
            trigger: `Solução para ${topic}`,
            palette: { name: "Futurista", colors: ["#00FF00", "#000000"], strategy: "Neon" }
          }
        ];
      }

      setStatusMsg('Materializando visuais de alta retenção...');
      const imagePromises = strategies.map(async (strat: any) => {
        // Use Pollinations.ai (Simplified for reliability)
        // Clean prompt: just keywords, no punctuation that might break URLs
        const simpleTopic = topic.replace(/[^a-zA-Z0-9 ]/g, "");
        const cleanTrigger = strat.trigger.replace(/[^a-zA-Z0-9 ]/g, "");
        const finalPrompt = `youtube thumbnail background ${simpleTopic} ${cleanTrigger} 8k resolution`;

        const encodedPrompt = encodeURIComponent(finalPrompt);
        const width = selectedRatio === '16:9' ? 1280 : selectedRatio === '9:16' ? 720 : 1080;
        const height = selectedRatio === '16:9' ? 720 : selectedRatio === '9:16' ? 1280 : 1080;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000)}&t=${Date.now()}`;

        return {
          imageUrl: imageUrl,
          headline: strat.headline,
          trigger: strat.trigger,
          palette: strat.palette
        };
      });

      const generatedResults = await Promise.all(imagePromises);
      setFastScaleResults(generatedResults);
      setStep('fast-scale-results');
    } catch (e: any) {
      console.error(e);
      alert(`Erro na Escala Rápida: ${e.message || e.toString()}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTitleSelected = (title: string) => {
    setSelectedTitle(title);
    setStep('image-choice');
  };

  const generateThumbnailIA = async () => {
    setIsGenerating(true);
    setStatusMsg(`Construindo em formato ${selectedRatio}...`);
    try {
      const response = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Subject: "${selectedTitle}". Ultra-detailed, no text. Professional lighting.`,
          aspectRatio: selectedRatio
        })
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      if (data.imageUrl) {
        onComplete(data.imageUrl, selectedTitle);
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('Erro ao gerar imagem.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Added handleFileUpload to handle manual image selection from the user's device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        onComplete(result, selectedTitle || topic || 'Nova Thumbnail');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative min-h-full pb-32">
      <div className="p-8 pb-0">
        <button
          onClick={onCancel}
          className="group flex items-center gap-2 text-slate-500 hover:text-white font-black uppercase tracking-widest text-xs transition-all"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
          Voltar ao Painel
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-7xl mx-auto w-full">
        {isGenerating ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative w-80 aspect-video bg-[#1a0b25] border-2 border-primary/30 rounded-2xl overflow-hidden mb-10">
              <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-20 border-4 border-primary border-t-transparent animate-spin rounded-full"></div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1 bg-primary animate-scanline"></div>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{statusMsg}</h2>
          </div>
        ) : (
          <div className="w-full">
            {step === 'topic' && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="mb-12">
                  <h2 className="text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
                    {initialEntry === 'fast-scale' ? 'Escala Rápida IA' : 'Qual o tópico hoje?'}
                  </h2>
                </div>

                <div className="bg-[#1a0b25] p-10 rounded-[3rem] border-2 border-primary/20 shadow-2xl max-w-3xl mx-auto">
                  <div className="flex flex-col gap-6 text-left">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Título ou Ideia</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Segredos para ganhar dinheiro..."
                        className="w-full bg-background-dark/50 border-border-dark rounded-2xl px-8 py-5 text-white focus:ring-2 focus:ring-primary outline-none transition-all text-xl font-bold"
                        onKeyPress={(e) => e.key === 'Enter' && generateTitles()}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Idioma da IA</label>
                        <div className="flex gap-2">
                          {LANGUAGES.map(l => (
                            <button
                              key={l.id}
                              onClick={() => setLanguage(l.id)}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${language === l.id ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                            >
                              <span>{l.flag}</span> {l.id.split('-')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Formato</label>
                        <div className="flex gap-2">
                          {RATIO_OPTIONS.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedRatio(opt.id)}
                              className={`flex-1 flex items-center justify-center py-3 rounded-xl border transition-all ${selectedRatio === opt.id ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                              <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={generateTitles}
                      disabled={!topic.trim()}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 uppercase tracking-widest"
                    >
                      {initialEntry === 'fast-scale' ? 'Processar Escala Rápida' : 'Continuar'}
                      <span className="material-symbols-outlined">rocket_launch</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'fast-scale-results' && (
              <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center">
                  <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">Bundles <span className="text-primary not-italic">Virais</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {fastScaleResults.map((res, i) => (
                    <div key={i} className="group bg-surface-dark border border-white/5 rounded-[3rem] overflow-hidden flex flex-col transition-all hover:border-primary/50 hover:scale-[1.02]">
                      <div className="aspect-video relative overflow-hidden bg-black">
                        <PollinationsImage
                          prompt={`youtube thumbnail background ${res.trigger} 8k resolution`}
                          width={1280}
                          height={720}
                          alt={res.headline}
                          className="w-full h-full"
                          onImageLoaded={(url) => setValidImageUrls(prev => ({ ...prev, [i]: url }))}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-4 left-6 right-6">
                          <h4 className="text-white font-black text-2xl leading-none uppercase tracking-tighter italic">{res.headline}</h4>
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <p className="text-slate-300 text-[11px] leading-relaxed italic mb-6">"{res.palette.strategy}"</p>
                        <button
                          onClick={() => onComplete(validImageUrls[i] || res.imageUrl, res.headline)}
                          disabled={!validImageUrls[i]}
                          className="w-full bg-primary py-4 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {validImageUrls[i] ? 'Editar este Bundle' : 'Carregando...'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'title' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
                  {titles.map((t, i) => (
                    <div key={i} onClick={() => handleTitleSelected(t)} className="group bg-[#1a0b25] border-2 border-border-dark p-6 rounded-3xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between">
                      <p className="text-white text-lg font-bold">{t}</p>
                      <span className="material-symbols-outlined text-primary">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'image-choice' && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <button onClick={generateThumbnailIA} className="bg-[#1a0b25] border-2 border-primary/40 p-12 rounded-[3rem] hover:bg-primary/20 transition-all flex flex-col items-center group">
                    <span className="material-symbols-outlined text-primary text-5xl mb-4">psychology</span>
                    <span className="text-white font-black uppercase text-xs">Gerar com IA</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-surface-dark border-2 border-white/5 p-12 rounded-[3rem] hover:border-white/10 transition-all flex flex-col items-center group">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <span className="material-symbols-outlined text-slate-400 text-5xl mb-4">cloud_upload</span>
                    <span className="text-white font-black uppercase text-xs">Subir Minha Foto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;
