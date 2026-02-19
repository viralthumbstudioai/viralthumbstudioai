
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Library from './pages/Library';
import BGRemover from './pages/BGRemover';
import Generator from './pages/Generator';
import ABTesting from './pages/ABTesting';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import { Page, Template } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  const [projectImage, setProjectImage] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [wizardEntry, setWizardEntry] = useState<'generator' | 'upload' | 'template' | 'fast-scale'>('generator');

  useEffect(() => {
    // Check if variables are the placeholders or missing
    const isConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' &&
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key';

    setIsSupabaseConfigured(!!isConfigured);

    if (isConfigured) {
      // Verificar sessão atual
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.warn("Supabase auth error (likely invalid keys):", error.message);
          return;
        }
        setSession(session);
        if (session) fetchProfile(session.user.id);
      }).catch(err => {
        console.error("Supabase connection failed:", err);
      });

      // Ouvir mudanças na autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) fetchProfile(session.user.id);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setUserProfile(data);
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const handleLogin = async () => {
    if (!isSupabaseConfigured) {
      alert("Configuração do Supabase ausente. Adicione SUPABASE_URL e SUPABASE_ANON_KEY às variáveis de ambiente.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleStartWizard = (entry: 'generator' | 'upload' | 'template' | 'fast-scale') => {
    setWizardEntry(entry);
    setCurrentPage(Page.Generator);
  };

  const handleOpenProject = (imageUrl: string, title: string) => {
    setProjectImage(imageUrl);
    setProjectTitle(title);
    setActiveTemplate(null);
    setCurrentPage(Page.Editor);
  };

  const handleApplyTemplate = (template: Template) => {
    setProjectImage(template.previewUrl);
    setProjectTitle(template.name);
    setActiveTemplate(template);
    setCurrentPage(Page.Editor);
  };

  const handleWizardComplete = (image: string, title: string) => {
    setProjectImage(image);
    setProjectTitle(title);
    setActiveTemplate(null);
    setCurrentPage(Page.Editor);
  };

  const renderPage = () => {
    // If not configured, we allow a "Demo Mode" or a clear error message
    if (!isSupabaseConfigured) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-pattern p-8">
          <div className="bg-surface-dark border border-red-500/30 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
            <div className="bg-red-500 size-16 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <span className="material-symbols-outlined text-white text-3xl material-symbols-fill">warning</span>
            </div>
            <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter mb-4">Configuração Pendente</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">As variáveis de ambiente <b>SUPABASE_URL</b> e <b>SUPABASE_ANON_KEY</b> não foram detectadas.</p>
            <div className="text-left bg-black/40 p-4 rounded-xl mb-10 text-[10px] text-slate-500 font-mono">
              1. Vá ao Painel do Supabase<br />
              2. Project Settings &gt; API<br />
              3. Adicione as chaves na Vercel
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    if (!session) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-pattern p-8">
          <div className="bg-surface-dark border border-white/10 p-12 rounded-[3rem] text-center max-w-md shadow-2xl">
            <div className="bg-primary size-16 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <span className="material-symbols-outlined text-white text-3xl material-symbols-fill">bolt</span>
            </div>
            <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter mb-4">Acesso Restrito</h2>
            <p className="text-slate-400 text-sm mb-10 leading-relaxed">Entre com sua conta Google para salvar seus projetos e acessar as ferramentas de IA.</p>
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
            >
              <img src="https://www.google.com/favicon.ico" className="size-4" />
              Entrar com Google
            </button>

            {/* Developer Bypass - Only shows in development */}
            {import.meta.env.DEV && (
              <button
                onClick={() => {
                  setSession({
                    user: {
                      id: 'dev-user-id',
                      email: 'dev@example.com',
                      user_metadata: { name: 'Developer' }
                    }
                  });
                }}
                className="mt-4 text-xs text-slate-500 hover:text-white underline"
              >
                [DEV] Acessar sem Login
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case Page.Dashboard:
        return (
          <Dashboard
            onStartWizard={handleStartWizard}
            onViewLibrary={() => setCurrentPage(Page.Library)}
            onOpenProject={handleOpenProject}
          />
        );
      case Page.Editor:
        return <Editor initialImage={projectImage} initialTitle={projectTitle} template={activeTemplate} />;
      case Page.Library:
        return <Library onSelectTemplate={handleApplyTemplate} />;
      case Page.BGRemover:
        return <BGRemover />;
      case Page.ABTesting:
        return <ABTesting />;
      case Page.Analytics:
        return <Analytics activeImage={projectImage} />;
      case Page.Pricing:
        return <Pricing />;
      case Page.Generator:
        return (
          <Generator
            initialEntry={wizardEntry}
            onComplete={handleWizardComplete}
            onCancel={() => setCurrentPage(Page.Dashboard)}
          />
        );
      default:
        return <Dashboard onStartWizard={handleStartWizard} onOpenProject={handleOpenProject} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      <Sidebar currentPage={currentPage} setPage={setCurrentPage} userPlan={userProfile?.plan || 'free'} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-8 py-4 border-b border-border-dark sticky top-0 bg-background-dark/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="max-w-md w-full relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#bb92c9] text-xl">search</span>
              <input
                className="w-full bg-surface-dark border-none rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-primary placeholder:text-[#bb92c9]/50"
                placeholder="Pesquisar projetos..."
                type="text"
              />
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleStartWizard('fast-scale')}
                className="flex items-center gap-2 bg-accent-green px-4 py-2 rounded-lg text-black text-sm font-black hover:brightness-110 transition-all shadow-lg shadow-accent-green/20"
              >
                <span className="material-symbols-outlined text-sm material-symbols-fill">rocket_launch</span>
                Escala Rápida
              </button>
            </div>
          )}
        </header>
        <div className="flex-1 overflow-y-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;
