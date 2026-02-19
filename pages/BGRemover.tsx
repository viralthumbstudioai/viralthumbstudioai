
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const BGRemover: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginalImage(ev.target?.result as string);
        processBackground(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processBackground = async (base64Data: string) => {
    setIsProcessing(true);
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 400);

    try {
      // Criar nova instância do GoogleGenAI logo antes da chamada para capturar a chave de API mais recente
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Content = base64Data.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Content, mimeType: "image/png" } },
            { text: "Isolate the main subject of this image. Remove the entire background and replace it with a clean, solid white background. Ensure edges are sharp and professional." }
          ]
        }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        setProcessedImage(`data:image/png;base64,${part.inlineData.data}`);
        setProgress(100);
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      alert("Erro ao processar imagem. Tente uma imagem menor ou mais nítida.");
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background-dark p-8 overflow-y-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-white tracking-tight text-4xl font-black uppercase italic">Removedor de Fundo <span className="text-primary text-2xl not-italic ml-2">IA PRO</span></h1>
          <p className="text-[#bb92c9] text-sm mt-2 font-bold uppercase tracking-widest opacity-60">Isolamento de assunto com precisão cinematográfica</p>
        </div>
        {!originalImage && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-3 rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 uppercase tracking-widest text-xs"
          >
            <span className="material-symbols-outlined">cloud_upload</span>
            Carregar Foto
          </button>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />

      {!originalImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center group cursor-pointer hover:border-primary/30 transition-all bg-[#1a0b25]/20"
        >
          <div className="size-32 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-6xl">image_search</span>
          </div>
          <p className="text-white text-xl font-bold mb-2">Arraste sua imagem aqui</p>
          <p className="text-slate-500 font-medium">Ideal para fotos de rosto ou produtos</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 min-h-0">
          {/* Original */}
          <div className="relative flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Foto Original</span>
              <button onClick={() => setOriginalImage(null)} className="text-red-500 text-[10px] font-black uppercase hover:underline">Remover</button>
            </div>
            <div className="relative w-full aspect-square md:aspect-auto md:h-full bg-surface-dark rounded-[2rem] overflow-hidden border-2 border-white/5">
              <img src={originalImage} className="w-full h-full object-cover" alt="Original" />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-12">
                  <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-white font-black text-sm uppercase tracking-widest animate-pulse">Analisando Bordas...</p>
                      <p className="text-primary font-black">{progress}%</p>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resultado */}
          <div className="relative flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Subject Isolated</span>
              {processedImage && (
                <a href={processedImage} download="vira-subject.png" className="text-accent-green text-[10px] font-black uppercase hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">download</span> Baixar PNG
                </a>
              )}
            </div>
            <div className="w-full aspect-square md:aspect-auto md:h-full rounded-[2rem] overflow-hidden relative bg-[conic-gradient(#2d1b32_90deg,#1d1022_90deg_180deg,#2d1b32_180deg_270deg,#1d1022_270deg)] [background-size:30px_30px] border-2 border-primary/20">
              {processedImage ? (
                <img src={processedImage} className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(189,43,238,0.3)]" alt="Processed" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 italic font-black text-white/20 uppercase tracking-tighter text-4xl">
                  Aguardando Processamento
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BGRemover;
