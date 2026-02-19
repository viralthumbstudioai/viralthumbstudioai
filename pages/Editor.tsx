
import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, Language, Template } from '../types';

// --- INTERFACES ---
interface TextLayer {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
  shadow: boolean;
  opacity: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  strokeColor: string;
  strokeWidth: number;
  glowColor: string;
  glowBlur: number;
}

interface EditorProps {
  initialImage?: string | null;
  initialTitle?: string;
  template?: Template | null;
}

const FONTS = [
  { name: 'Spline Sans', family: "'Spline Sans', sans-serif" },
  { name: 'Impact Modern', family: "Impact, sans-serif" },
  { name: 'Serif Elite', family: "Georgia, serif" },
  { name: 'Monospace Pro', family: "'Courier New', monospace" },
  { name: 'Display Bold', family: "system-ui, sans-serif" }
];

const RATIOS = [
  { id: '16:9', label: 'YouTube (16:9)', class: 'aspect-video' },
  { id: '9:16', label: 'Shorts/TikTok (9:16)', class: 'aspect-[9/16]' },
  { id: '1:1', label: 'Instagram (1:1)', class: 'aspect-square' }
];

const EMOJIS = ['🔥', '😱', '🚀', '💰', '🛑', '✅', '❌', '👀', '🤯', '💎'];

const EMOTIONS = [
  { id: 'shock', label: 'Choque Extremo', icon: 'bolt', prompt: 'extreme shock and surprise, wide open mouth, eyes wide open in disbelief' },
  { id: 'joy', label: 'Alegria Viral', icon: 'sentiment_very_satisfied', prompt: 'intense joy and happiness, wide cinematic smile, bright enthusiastic eyes' },
  { id: 'doubt', label: 'Dúvida/Curiosidade', icon: 'help', prompt: 'deep suspicion and curiosity, raised eyebrow, inquisitive facial expression' },
  { id: 'anger', label: 'Raiva/Desafio', icon: 'sentiment_very_dissatisfied', prompt: 'intense anger and determination, furrowed brows, aggressive challenge look' }
];

const LANGUAGES: { id: Language, label: string, flag: string }[] = [
  { id: 'pt-BR', label: 'BR', flag: '🇧🇷' },
  { id: 'en', label: 'EN', flag: '🇺🇸' },
  { id: 'es', label: 'ES', flag: '🇪🇸' },
];

const ViralityWidget = memo(({ score, info }: any) => (
  <div className={`flex items-center gap-4 px-6 py-3 bg-black/40 rounded-2xl border transition-all duration-500 ${info.border} ${info.glow}`}>
    <div className="flex flex-col">
      <p className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em]">Sucesso IA</p>
      <h3 className={`text-2xl font-black tracking-tighter ${info.color}`}>{score}%</h3>
    </div>
    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${info.bg} ${info.color} ${info.border}`}>
      {info.label}
    </div>
  </div>
));

const Editor: React.FC<EditorProps> = ({ initialImage, initialTitle, template }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage || null);
  const [projectTitle, setProjectTitle] = useState(initialTitle || 'Design Sem Nome');
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isProcessingFace, setIsProcessingFace] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [useCurrentAsBase, setUseCurrentAsBase] = useState(true);
  
  const [zoomLevel, setZoomLevel] = useState(80);
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'design' | 'ia' | 'texto'>('design');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efeito para inicializar com blueprint se houver template
  useEffect(() => {
    if (template) {
      const { textArea } = template.blueprint;
      addTextLayer('HEADLINE AQUI', textArea.x, textArea.y);
      setProjectTitle(template.name);
      setCurrentImage(template.previewUrl);
    }
  }, [template]);

  // --- FUNÇÕES DE IA ---
  const handleAIOperation = async (isAutoOptimize: boolean = false) => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let contents: any;
      const promptText = isAutoOptimize 
        ? "Optimize this thumbnail background image for high CTR. Enhance lighting and composition. NO TEXT."
        : `Refine background image: ${aiPrompt}. High cinematic quality. NO TEXT.`;

      if (useCurrentAsBase && currentImage) {
        const base64Data = currentImage.split(',')[1];
        contents = {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: promptText }
          ]
        };
      } else {
        contents = {
          parts: [{ text: `YouTube thumbnail background: ${aiPrompt}. Cinematic, NO TEXT.` }]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents,
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
      });
      
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setCurrentImage(`data:image/png;base64,${part.inlineData.data}`);
        setActiveToast("Visual Refinado!");
      }
    } catch (e) {
      console.error(e);
      alert("Erro na operação de IA.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFacialExpression = async (emotionPrompt: string) => {
    if (!currentImage) return;
    setIsProcessingFace(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = currentImage.split(',')[1];
      const prompt = `Modify the person's face to show ${emotionPrompt}. Keep identity. High cinematic quality.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: prompt }
          ]
        },
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setCurrentImage(`data:image/png;base64,${part.inlineData.data}`);
        setActiveToast("Expressão Facial Otimizada!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingFace(false);
    }
  };

  const generateTextSuggestions = async () => {
    setIsGeneratingText(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Gere 5 frases curtas e impactantes para thumbnail do YouTube (máximo 3 palavras cada). Idioma: ${language}. Contexto: "${projectTitle}". Retorne apenas um array JSON de strings.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const data = JSON.parse(response.text || '[]');
      setTextSuggestions(data);
    } catch (e) { console.error(e); } finally { setIsGeneratingText(false); }
  };

  const addTextLayer = (content: string = 'TEXTO', x: number = 50, y: number = 50) => {
    const newLayer: TextLayer = {
      id: `text-${Date.now()}-${Math.random()}`,
      content,
      x,
      y,
      fontSize: 80,
      color: '#ffffff',
      fontFamily: FONTS[1].family,
      rotation: 0,
      shadow: true,
      opacity: 100,
      isBold: true,
      isItalic: false,
      isUnderline: false,
      strokeColor: '#000000',
      strokeWidth: 4,
      glowColor: '#ffffff',
      glowBlur: 0
    };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedTextId(newLayer.id);
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer => layer.id === id ? { ...layer, ...updates } : layer));
  };

  const handleTextDrag = (e: React.MouseEvent, id: string) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const layer = textLayers.find(l => l.id === id);
    if (!layer) return;

    const initialX = layer.x;
    const initialY = layer.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      updateTextLayer(id, { 
        x: Math.max(0, Math.min(100, initialX + dx)), 
        y: Math.max(0, Math.min(100, initialY + dy)) 
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCurrentImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImage;
    img.onload = () => {
      const [w, h] = aspectRatio === '16:9' ? [1920, 1080] : aspectRatio === '9:16' ? [1080, 1920] : [1080, 1080];
      canvas.width = w;
      canvas.height = h;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.filter = 'none';
      textLayers.forEach(layer => {
        ctx.save();
        const posX = (layer.x / 100) * w;
        const posY = (layer.y / 100) * h;
        ctx.translate(posX, posY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.globalAlpha = layer.opacity / 100;
        const fontSize = layer.fontSize * (w/1280);
        ctx.font = `${layer.isItalic ? 'italic' : ''} ${layer.isBold ? '900' : 'normal'} ${fontSize}px ${layer.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (layer.shadow) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 20 * (w/1280);
          ctx.shadowOffsetX = 8 * (w/1280);
          ctx.shadowOffsetY = 8 * (w/1280);
        }
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.content, 0, 0);
        if (layer.strokeWidth > 0) {
          ctx.shadowColor = 'transparent';
          ctx.lineWidth = layer.strokeWidth * (w/1280);
          ctx.strokeStyle = layer.strokeColor;
          ctx.strokeText(layer.content, 0, 0);
        }
        ctx.restore();
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL(`image/${exportFormat}`);
      link.download = `viral-thumb.${exportFormat}`;
      link.click();
    };
  };

  const score = useMemo(() => {
    let base = 70;
    if (textLayers.length > 0) base += 10;
    if (saturation > 120) base += 5;
    return Math.min(base, 99);
  }, [textLayers, saturation]);

  const viralityInfo = {
    label: score > 85 ? 'Viral' : 'Promissor',
    color: score > 85 ? 'text-accent-green' : 'text-primary',
    border: score > 85 ? 'border-accent-green/30' : 'border-primary/30',
    glow: score > 85 ? 'shadow-[0_0_20px_rgba(57,255,20,0.2)]' : '',
    bg: score > 85 ? 'bg-accent-green/10' : 'bg-primary/10'
  };

  const selectedLayer = useMemo(() => textLayers.find(l => l.id === selectedTextId), [textLayers, selectedTextId]);

  return (
    <div className="flex flex-1 overflow-hidden relative h-full">
      <canvas ref={canvasRef} className="hidden" />
      <aside className="w-80 border-r border-border-dark bg-[#0f0812] flex flex-col shrink-0 z-20 shadow-2xl h-full overflow-y-auto custom-scrollbar">
        <div className="flex border-b border-white/5 sticky top-0 bg-[#0f0812] z-30">
          <button onClick={() => setSidebarTab('design')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'design' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-white'}`}>Design</button>
          <button onClick={() => setSidebarTab('texto')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'texto' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-white'}`}>Texto</button>
          <button onClick={() => setSidebarTab('ia')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${sidebarTab === 'ia' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-white'}`}>IA Master</button>
        </div>
        <div className="p-6 space-y-8">
          {sidebarTab === 'design' && (
            <>
              <div className="space-y-4">
                <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">cloud_upload</span> Substituir Fundo
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Filtros</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase"><span>Brilho</span><span>{brightness}%</span></div>
                    <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase"><span>Saturação</span><span>{saturation}%</span></div>
                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>
            </>
          )}
          {sidebarTab === 'texto' && (
            <>
              <button onClick={() => addTextLayer()} className="w-full bg-primary py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Inserir Texto</button>
              {selectedLayer && (
                <div className="space-y-6 animate-in slide-in-from-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Conteúdo</label>
                    <textarea value={selectedLayer.content} onChange={(e) => updateTextLayer(selectedTextId!, { content: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white resize-none h-20 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Cor</label>
                    <input type="color" value={selectedLayer.color} onChange={(e) => updateTextLayer(selectedTextId!, { color: e.target.value })} className="w-full h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer" />
                  </div>
                </div>
              )}
            </>
          )}
          {sidebarTab === 'ia' && (
            <div className="space-y-8">
              <div className="p-5 bg-gradient-to-br from-primary/10 to-[#1a0b25] border border-primary/20 rounded-2xl">
                <h5 className="text-[10px] font-black text-primary mb-4 uppercase flex items-center gap-2"><span className="material-symbols-outlined text-sm">face</span> Expressões IA</h5>
                <div className="grid grid-cols-2 gap-2">
                  {EMOTIONS.map(emotion => (
                    <button key={emotion.id} onClick={() => handleFacialExpression(emotion.prompt)} disabled={isProcessingFace || !currentImage} className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/40 border border-white/5 hover:border-primary/50 transition-all group disabled:opacity-30">
                      <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-primary mb-1">{emotion.icon}</span>
                      <span className="text-[8px] font-black uppercase text-slate-500 text-center leading-tight">{emotion.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col bg-background-dark relative overflow-hidden h-full">
        <div className="flex justify-between items-center px-8 py-4 border-b border-border-dark bg-[#0a050d] z-30 shrink-0">
          <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="bg-transparent border-none text-white font-black text-sm uppercase tracking-widest outline-none" />
          <button onClick={handleDownload} className="bg-primary text-white font-black px-8 py-3 rounded-xl shadow-2xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all">Exportar 4K</button>
        </div>
        <div className="flex-1 flex items-center justify-center p-12 overflow-hidden pattern-grid relative z-10">
          <div 
            ref={previewContainerRef}
            className={`relative shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black rounded-lg overflow-hidden border-2 border-white/10 transition-all duration-300 ${RATIOS.find(r => r.id === aspectRatio)?.class}`}
            style={{ 
              maxHeight: '70vh', 
              maxWidth: '85%',
              width: aspectRatio === '16:9' ? 'calc(70vh * 1.77)' : aspectRatio === '9:16' ? 'calc(70vh * 0.56)' : '70vh',
              transform: `scale(${zoomLevel / 100})` 
            }}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${currentImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}')`, filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` }}></div>
            {textLayers.map(layer => (
              <div key={layer.id} onMouseDown={(e) => { e.stopPropagation(); setSelectedTextId(layer.id); handleTextDrag(e, layer.id); }} className={`absolute cursor-move select-none group/text ${selectedTextId === layer.id ? 'z-50' : 'z-40'}`} style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`, opacity: layer.opacity / 100 }}>
                {selectedTextId === layer.id && <div className="absolute -inset-4 border-2 border-primary/60 rounded-sm pointer-events-none"></div>}
                <h3 className="whitespace-nowrap leading-none tracking-tighter" style={{ fontSize: `${layer.fontSize}px`, color: layer.color, fontFamily: layer.fontFamily, fontWeight: layer.isBold ? '900' : 'normal', textShadow: layer.shadow ? '8px 8px 30px rgba(0,0,0,0.8)' : 'none', WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor}` : 'none' }}>{layer.content}</h3>
              </div>
            ))}
          </div>
        </div>
        <div className="h-28 bg-[#0a050d] border-t border-white/5 flex items-center px-10 gap-10 shrink-0 z-30 backdrop-blur-lg">
          <ViralityWidget score={score} info={viralityInfo} />
          <div className="flex-1 flex items-center gap-4 overflow-x-auto py-2">
            {textLayers.map(l => (
              <div key={l.id} onClick={() => setSelectedTextId(l.id)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${selectedTextId === l.id ? 'bg-primary/20 border-primary text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-400'}`}>
                <span className="text-[10px] font-bold truncate max-w-[100px]">{l.content}</span>
                <button onClick={(e) => { e.stopPropagation(); setTextLayers(prev => prev.filter(layer => layer.id !== l.id)); }} className="size-5 flex items-center justify-center hover:text-red-500 transition-all"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;
