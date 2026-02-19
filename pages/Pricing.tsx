
import React, { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    description: 'Para quem está começando a jornada viral.',
    features: [
      { text: '5 thumbnails por mês', included: true },
      { text: 'Remoção de fundo básica', included: true },
      { text: 'Score avançado', included: false },
      { text: 'Teste A/B interno', included: false },
      { text: 'Biblioteca premium', included: false },
      { text: 'Simulador de feed', included: false },
    ],
    cta: 'Começar Agora',
    checkoutUrl: '#', // Link para cadastro gratuito
    color: 'border-white/5',
    button: 'bg-white/5 hover:bg-white/10 text-white'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '97',
    popular: true,
    description: 'O arsenal definitivo para criadores de elite.',
    features: [
      { text: '300 thumbnails no mês', included: true },
      { text: 'Score de CTR IA', included: true },
      { text: 'Teste A/B interno', included: true },
      { text: 'Biblioteca Premium', included: true },
      { text: 'Simulador de Feed', included: true },
    ],
    cta: 'Tornar-se Pro',
    checkoutUrl: 'https://seu-link-de-pagamento-pro.com', // COLOQUE SEU LINK AQUI
    color: 'border-primary shadow-[0_0_50px_rgba(189,43,238,0.2)]',
    button: 'bg-primary text-white shadow-xl shadow-primary/30'
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '297',
    description: 'Escalabilidade máxima para equipes e agências.',
    features: [
      { text: 'Multi-usuários (Até 5)', included: true },
      { text: 'White label (Sua Marca)', included: true },
      { text: 'Dashboard de Desempenho', included: true },
      { text: 'Suporte Prioritário', included: true },
      { text: 'Exportação 4K', included: true },
    ],
    cta: 'Falar com Consultor',
    checkoutUrl: 'https://seu-link-de-pagamento-agency.com', // COLOQUE SEU LINK AQUI
    color: 'border-accent-green/30',
    button: 'bg-accent-green text-black font-black'
  }
];

const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const handleCheckout = (url: string) => {
    if (url === '#') {
       alert("Redirecionando para criação de conta gratuita...");
       return;
    }
    // Redireciona para a plataforma de vendas (Hotmart, Kiwify, Stripe)
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 p-12 bg-background-dark overflow-y-auto custom-scrollbar flex flex-col items-center">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-white text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">
          Escolha seu <span className="text-primary not-italic">Plano Viral</span>
        </h1>
        <p className="text-[#bb92c9] text-sm font-bold uppercase tracking-[0.4em] opacity-60 mb-10">
          Acelere seu crescimento com inteligência competitiva
        </p>

        <div className="flex items-center justify-center gap-6 bg-surface-dark p-2 rounded-2xl border border-white/5 inline-flex">
          <button 
            onClick={() => setBilling('monthly')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billing === 'monthly' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Mensal
          </button>
          <button 
            onClick={() => setBilling('yearly')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${billing === 'yearly' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
          >
            Anual
            <div className="absolute -top-3 -right-3 bg-accent-green text-black px-2 py-1 rounded-md text-[8px] font-black italic">-20% OFF</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full pb-40">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-surface-dark border-2 p-10 rounded-[4rem] flex flex-col transition-all hover:scale-[1.02] ${plan.color}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                MAIS POPULAR
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-white text-2xl font-black uppercase italic tracking-tighter mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1">
                <span className="text-slate-500 text-lg font-bold mb-1">R$</span>
                <span className="text-white text-6xl font-black tracking-tighter">
                  {billing === 'yearly' ? Math.floor(parseInt(plan.price) * 0.8) : plan.price}
                </span>
                <span className="text-slate-500 text-sm font-bold mb-2">/mês</span>
              </div>
              <p className="text-slate-500 text-xs mt-4 font-medium leading-relaxed">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-12 flex-1">
              {plan.features.map((feature, i) => (
                <div key={i} className={`flex items-center gap-3 ${feature.included ? 'text-slate-300' : 'text-slate-600 line-through opacity-40'}`}>
                  <span className={`material-symbols-outlined text-lg ${feature.included ? 'text-accent-green' : ''}`}>
                    {feature.included ? 'check_circle' : 'cancel'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide">{feature.text}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleCheckout(plan.checkoutUrl)}
              className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 ${plan.button}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center max-w-2xl">
        <p className="text-slate-500 text-xs italic leading-relaxed">
          *Precisa de um plano customizado para um canal com mais de 10 milhões de inscritos? <br/>
          <span className="text-primary font-black uppercase cursor-pointer hover:underline">Fale com nosso time Enterprise</span>
        </p>
      </div>
    </div>
  );
};

export default Pricing;
