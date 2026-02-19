
import React from 'react';
import { Page } from '../types';

interface NavItemProps {
  id: Page;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: (id: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ id, label, icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
      isActive 
        ? 'bg-primary/10 text-primary' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(189,43,238,0.8)]" />
    )}
    <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 ${isActive ? 'material-symbols-fill' : ''}`}>
      {icon}
    </span>
    <p className={`text-[15px] tracking-wide transition-all whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
      {label}
    </p>
    {isActive && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
    )}
  </button>
);

interface SidebarProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  userPlan?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, userPlan = 'free' }) => {
  const menuItems = [
    { id: Page.Dashboard, label: 'Painel', icon: 'grid_view' },
    { id: Page.Editor, label: 'Editor', icon: 'edit_square' },
    { id: Page.Library, label: 'Meus Ativos', icon: 'folder_open' },
  ];

  const toolItems = [
    { id: Page.ABTesting, label: 'Teste A/B', icon: 'compare_arrows' },
    { id: Page.Analytics, label: 'Análise Viral', icon: 'monitoring' },
    { id: Page.BGRemover, label: 'Removedor de Fundo', icon: 'auto_fix_high' },
  ];

  return (
    <aside className="w-80 flex-shrink-0 border-r border-white/5 bg-[#0a050d] hidden lg:flex flex-col p-6 z-20">
      <div className="mb-12 flex items-center gap-4 px-2">
        <div className="relative group">
          <div className="absolute -inset-1 bg-primary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-primary size-12 rounded-xl flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-white text-2xl material-symbols-fill">bolt</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-white text-xl font-black tracking-tighter leading-none">Viral Thumb</h1>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Studio IA</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-8 flex-1">
        <div>
          <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] px-4">Menu Principal</p>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={currentPage === item.id}
                onClick={setPage}
              />
            ))}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] px-4">Ferramentas IA</p>
          <nav className="flex flex-col gap-1">
            {toolItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={currentPage === item.id}
                onClick={setPage}
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        {userPlan === 'free' && (
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-4 rounded-2xl border border-primary/20 mb-6 group cursor-pointer hover:border-primary/40 transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-white text-xs font-black uppercase tracking-wider">Upgrade Disponível</span>
              <span className="material-symbols-outlined text-primary text-sm">stars</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug mb-3">Libere exportação 4K e mais 300 créditos de IA.</p>
            <button 
              onClick={() => setPage(Page.Pricing)}
              className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 uppercase tracking-widest"
            >
              Virar PRO
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="size-10 rounded-full border-2 border-primary/20 p-0.5">
               <span className="material-symbols-outlined text-slate-500">account_circle</span>
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-white text-sm font-bold truncate italic">Logado</p>
            <p className="text-primary text-[10px] font-black uppercase tracking-tighter">Plano {userPlan.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
