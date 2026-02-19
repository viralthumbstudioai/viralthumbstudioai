
import React, { useRef, useState } from 'react';
import { Project } from '../types';

interface DashboardProps {
  onStartWizard: (entry: 'generator' | 'upload' | 'template' | 'fast-scale') => void;
  onViewLibrary?: () => void;
  onOpenProject: (imageUrl: string, title: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartWizard, onViewLibrary, onOpenProject }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveState = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onOpenProject(result, file.name.split('.')[0] || 'Novo Upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const recentProjects: Project[] = [
    { 
      id: '1', 
      title: 'Desafio de Sobrevivência Ep. 4', 
      editedAt: 'há 2h', 
      score: 92, 
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJyQovyY5DWM-4Nk1rjnmtbTRvjc0Wg3OTYp9oREVu3oooSO2Ugh16XXvOfpzWE3k8V0kmQD4iHGdLhrgqLYsuzBy1c3NdLPGSkIcPJs8njCJ3CZjVHo3-uMwE7ZGZ7kB3xJMy6Z1Cr3SB410cqcmjr1uszQZdjBqBc0r2TK2yIsw_yRwrgrV4wi-1RvPrSULrJAJOXQJmjk5yqEBEb1o2Mq053KOqnkl02GgySJ0Kc-dLCkZAOaFaAB3pX-0xbD7deEOH4PHzDOg'
    },
    { 
      id: '2', 
      title: 'Review Tech: O Setup Definitivo', 
      editedAt: 'ontem', 
      score: 74, 
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_xz8mkGDAm0_8owaJZGKDaE33XEzYSGqDyMXjVeUByjQWYUof28Lyc7EGBqy8OudzfzC3zn6xt34qxxA0CjVwbN8SDGzJPFtlwHSUeKVB8AbPEfxG748cYRpPYUa_M3BLQH-eEXTrsgxrk-FeVGfCltIpa3VI7AisGC51KC_jDto28cxB16jBcg7OK6ollly_RjoN2zqnFj-S0pYjHBq1ag-ZalnhlPWi8GLhqsDh20BaStwCDBzXvXTpV8-546MFZLSAxhOp9OU'
    }
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full pb-40">
      <div className="mb-10">
        <h1 className="text-white text-4xl font-black tracking-tight mb-2">Painel do Criador</h1>
        <p className="text-[#bb92c9] text-lg font-normal">Sua próxima thumbnail viral começa aqui.</p>
      </div>

      <section className="mb-14">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <h2 className="text-white text-xl font-bold uppercase tracking-widest text-sm">Início Rápido</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Escala Rápida IA */}
          <div 
            onClick={() => onStartWizard('fast-scale')}
            className="group relative bg-gradient-to-br from-primary/30 to-[#1a0b25] border-2 border-primary/50 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.05] hover:border-primary hover:shadow-[0_0_50px_rgba(189,43,238,0.4)] h-80 justify-center overflow-hidden"
          >
             <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent-green text-black font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">TURBO</div>
             <div className="size-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl material-symbols-fill">rocket_launch</span>
            </div>
            <h3 className="text-white text-xl font-black mb-1">Escala Rápida IA</h3>
            <p className="text-[#bb92c9] text-sm leading-relaxed max-w-[180px]">Título → 3 Pacotes Virais Completos</p>
            <div className="absolute bottom-0 inset-x-0 h-1 bg-accent-green/50 animate-pulse"></div>
          </div>

          {/* Card: Gerador Viral IA */}
          <div 
            onClick={() => onStartWizard('generator')}
            className="group relative bg-[#1a0b25] border-2 border-primary/30 rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] hover:border-primary hover:shadow-[0_0_30px_rgba(189,43,238,0.2)] h-80 justify-center overflow-hidden"
          >
            <div className="size-20 rounded-full bg-primary flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(189,43,238,0.4)] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-4xl">psychology</span>
            </div>
            <h3 className="text-white text-xl font-black mb-1">Gerador Viral IA</h3>
            <p className="text-[#bb92c9] text-sm leading-relaxed max-w-[200px]">Crie títulos e thumbnails do zero com IA</p>
          </div>

          {/* Card: Carregar Imagem */}
          <div 
            onClick={() => uploadInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative bg-background-dark border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] h-80 justify-center overflow-hidden ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border-dark hover:border-primary/50'
            }`}
          >
            <input 
              type="file" 
              ref={uploadInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <div className={`size-16 rounded-full flex items-center justify-center mb-6 border transition-all ${
              isDragging ? 'bg-primary border-primary scale-110' : 'bg-surface-dark border-border-dark group-hover:border-primary'
            }`}>
              <span className={`material-symbols-outlined text-3xl ${isDragging ? 'text-white' : 'text-primary'}`}>
                {isDragging ? 'download' : 'cloud_upload'}
              </span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Upload Manual</h3>
            <p className="text-[#bb92c9] text-sm leading-relaxed">Arraste sua imagem base</p>
          </div>

          {/* Card: Template Mágico */}
          <div 
            onClick={() => onStartWizard('template')}
            className="group relative bg-[#1a0b25] border-2 border-transparent rounded-[2rem] p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-[1.02] h-80 justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
            <div className="size-20 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center mb-6 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl material-symbols-fill">magic_button</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Templates</h3>
            <p className="text-[#bb92c9] text-sm leading-relaxed">Layouts por Nicho</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Projetos Recentes</h2>
          <button 
            onClick={onViewLibrary}
            className="text-primary text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((p) => (
            <div 
              key={p.id} 
              onClick={() => onOpenProject(p.imageUrl, p.title)}
              className="bg-surface-dark rounded-2xl overflow-hidden border border-border-dark hover:border-primary/50 transition-all group cursor-pointer active:scale-[0.99]"
            >
              <div className="aspect-video relative overflow-hidden bg-[#0a050d]">
                <img 
                  src={p.imageUrl} 
                  loading="lazy" 
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-accent-green flex items-center gap-1 border border-accent-green/30">
                  <span className="material-symbols-outlined text-xs">trending_up</span> {p.score}%
                </div>
              </div>
              <div className="p-4 bg-surface-dark/50">
                <h4 className="text-white font-bold text-sm truncate mb-1">{p.title}</h4>
                <p className="text-[#bb92c9] text-[10px] uppercase tracking-wider font-bold">Editado {p.editedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
