import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Sparkles, ShieldCheck,
  Zap, CheckCircle2, TrendingUp, Wallet, PieChart, Target, Bell,
  Lock, Smartphone, BarChart3, Eye, LineChart, Plus, Coffee,
  ShoppingBag, Briefcase, Home as HomeIcon, Star, Menu, X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Dashboard Preview (mockup that visually reflects the product)
// ─────────────────────────────────────────────────────────────
const DashboardPreview = () => (
  <div className="relative">
    {/* Glow */}
    <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/30 via-indigo-500/20 to-cyan-500/20 rounded-3xl blur-2xl pointer-events-none" />

    {/* Browser-style frame */}
    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1 text-[10px] text-gray-400 text-center">
            ato.rezendetech.com.br/dashboard
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Olá, Bruno 👋</p>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Maio de 2026</h3>
          </div>
          <button className="text-[10px] font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
            <Plus className="w-3 h-3" /> Nova
          </button>
        </div>

        {/* Caixa Atual - hero card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3 h-3 text-primary-200" />
              <p className="text-[10px] text-primary-200 font-medium uppercase tracking-wider">Caixa atual</p>
            </div>
            <p className="text-2xl font-bold">R$ 8.432<span className="text-base text-primary-200">,50</span></p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-300">
              <ArrowUpRight className="w-3 h-3" />
              <span className="font-semibold">+12,4%</span>
              <span className="text-primary-200">vs. mês anterior</span>
            </div>
          </div>
        </div>

        {/* Mini cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">Receitas</p>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">R$ 12.840</p>
            {/* Mini bars */}
            <div className="flex items-end gap-0.5 mt-1.5 h-4">
              {[60, 45, 70, 55, 80, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-400 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center">
                <ArrowDownRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">Despesas</p>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">R$ 4.408</p>
            <div className="flex items-end gap-0.5 mt-1.5 h-4">
              {[40, 55, 35, 65, 45, 50, 40].map((h, i) => (
                <div key={i} className="flex-1 bg-rose-400 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Últimas transações</p>
            <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">Ver todas</p>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: Briefcase, color: 'emerald', label: 'Salário', cat: 'Trabalho', value: '+R$ 8.500,00' },
              { icon: HomeIcon, color: 'rose', label: 'Aluguel', cat: 'Moradia', value: '-R$ 1.800,00' },
              { icon: ShoppingBag, color: 'rose', label: 'Mercado', cat: 'Alimentação', value: '-R$ 423,50' },
              { icon: Coffee, color: 'rose', label: 'Café', cat: 'Lazer', value: '-R$ 18,90' },
            ].map((tx, i) => {
              const Icon = tx.icon;
              const isIncome = tx.color === 'emerald';
              return (
                <div key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isIncome ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
                    <Icon className={`w-3.5 h-3.5 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{tx.label}</p>
                    <p className="text-[10px] text-gray-400">{tx.cat}</p>
                  </div>
                  <p className={`text-xs font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{tx.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

    {/* Floating notification card */}
    <div className="absolute -top-3 -right-3 sm:-right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3 animate-float">
      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-900 dark:text-white">Meta atingida!</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">Economia de R$ 500 ✨</p>
      </div>
    </div>

    {/* Floating budget card */}
    <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 animate-float-slow">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-3.5 h-3.5 text-primary-600" />
        <p className="text-[11px] font-bold text-gray-900 dark:text-white">Orçamento Lazer</p>
      </div>
      <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full" style={{ width: '64%' }} />
      </div>
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">R$ 320 de R$ 500</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Grid background pattern
// ─────────────────────────────────────────────────────────────
const GridBackground = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.05]"
    style={{
      backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }}
  />
);

// ─────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────
export const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white selection:bg-primary-200 selection:text-primary-900">

      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo-wide.png" alt="Ato Financeiro" className="h-9 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#recursos" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Como funciona</a>
            <a href="#preco" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Preço</a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link
              to="/register"
              className="group inline-flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Começar grátis
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-3">
            <a href="#recursos" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-2">Recursos</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-2">Como funciona</a>
            <a href="#preco" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-gray-600 dark:text-gray-400 py-2">Preço</a>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
              <Link to="/login" className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2.5">Entrar</Link>
              <Link to="/register" className="text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl">
                Começar grátis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-white to-white dark:from-primary-950/30 dark:via-gray-950 dark:to-gray-950" />
        <GridBackground />

        {/* Animated blobs */}
        <div className="absolute top-20 -left-32 w-[480px] h-[480px] bg-primary-300/30 dark:bg-primary-700/20 rounded-full blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-40 -right-32 w-[440px] h-[440px] bg-indigo-300/30 dark:bg-indigo-700/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-cyan-200/20 dark:bg-cyan-700/10 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm px-3 py-1.5 rounded-full text-xs font-semibold mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-gray-700 dark:text-gray-300">14 dias grátis — sem cartão de crédito</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s', animationFillMode: 'both' }}>
              Suas finanças<br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  no controle
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 7C 40 2, 100 12, 198 5" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="underline" x1="0" y1="0" x2="200" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              de verdade.
            </h1>

            {/* Subhead */}
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              Pare de planilhas confusas. Registre, organize e visualize suas finanças pessoais com clareza — feito para o seu dia a dia, não para analistas de Wall Street.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                Começar 14 dias grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 text-gray-900 dark:text-white font-semibold px-7 py-3.5 rounded-xl transition-all"
              >
                Já sou cliente
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-8 text-xs text-gray-500 dark:text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dados criptografados</span>
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── VALUE / WHY ── */}
      <section className="relative py-24 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Por que o Ato?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Controle financeiro sem fricção
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Esqueça apps complicados feitos para contadores. O Ato é simples por design — para quem só quer entender pra onde está indo o seu dinheiro.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap, color: 'amber', title: 'Rápido de usar', desc: 'Registre uma transação em segundos. Sem campos obrigatórios desnecessários.' },
              { icon: Eye, color: 'primary', title: 'Visualização clara', desc: 'Veja em um relance quanto entrou, quanto saiu e quanto sobrou no mês.' },
              { icon: Bell, color: 'rose', title: 'Alertas inteligentes', desc: 'Avisamos quando você estiver perto de estourar um orçamento.' },
              { icon: Smartphone, color: 'cyan', title: 'Funciona no celular', desc: 'Mesma experiência rica em qualquer dispositivo — sem app para instalar.' },
              { icon: ShieldCheck, color: 'emerald', title: 'Seus dados são seus', desc: 'Não vendemos seus dados. Não exibimos publicidade. Ponto.' },
              { icon: Sparkles, color: 'indigo', title: 'Quadro dos Sonhos', desc: 'Visualize seus objetivos e veja seu progresso real em direção a eles.' },
            ].map(({ icon: Icon, color, title, desc }) => {
              const colorMap: Record<string, string> = {
                amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
                primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400',
                rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
                cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
                indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
              };
              return (
                <div
                  key={title}
                  className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <GridBackground />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Três passos. Controle total.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Sem migração complicada. Sem conectar conta bancária. Você no comando do início ao fim.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

            {[
              { n: '01', icon: Plus, title: 'Crie sua conta', desc: 'Cadastro em 30 segundos. 14 dias grátis para experimentar tudo, sem precisar de cartão.' },
              { n: '02', icon: Wallet, title: 'Registre suas transações', desc: 'Receitas, despesas, parcelas e recorrências. Categorize do seu jeito.' },
              { n: '03', icon: LineChart, title: 'Visualize e ajuste', desc: 'Acompanhe orçamentos, veja gráficos claros e tome melhores decisões.' },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-[10px] font-bold text-primary-600 dark:text-primary-400 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded-md shadow-sm">
                    {n}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SHOWCASE ── */}
      <section id="recursos" className="relative py-24 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Recursos</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Todas as ferramentas que você precisa</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Em um só lugar. Sem complicação.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Big feature: dashboard */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-10 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <BarChart3 className="w-10 h-10 text-primary-200 mb-4" />
                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">Dashboard que diz tudo de uma vez</h3>
                  <p className="text-primary-100 text-base leading-relaxed">
                    Receitas, despesas, caixa atual, próximos vencimentos. Tudo em uma única tela limpa e elegante. Sem precisar clicar em mil lugares.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Caixa', val: 'R$ 8.4k', color: 'bg-white/10' },
                    { label: 'Receitas', val: 'R$ 12k', color: 'bg-emerald-500/30' },
                    { label: 'Despesas', val: 'R$ 4.4k', color: 'bg-rose-500/30' },
                  ].map((c) => (
                    <div key={c.label} className={`${c.color} backdrop-blur-md rounded-xl p-3 border border-white/20`}>
                      <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">{c.label}</p>
                      <p className="font-bold text-lg">{c.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card: relatórios */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl" />
              <div className="relative">
                <PieChart className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-4" />
                <h3 className="text-xl font-extrabold mb-2">Relatórios visuais</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Gráficos que mostram exatamente onde você gasta. Por categoria, por mês, por período.
                </p>
                {/* Mini chart visual */}
                <div className="flex items-end gap-1.5 h-20">
                  {[35, 60, 45, 80, 55, 90, 70, 65, 85, 50, 75, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-md"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Card: orçamentos */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl" />
              <div className="relative">
                <Target className="w-10 h-10 text-primary-600 dark:text-primary-400 mb-4" />
                <h3 className="text-xl font-extrabold mb-2">Orçamentos por categoria</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Defina limites e seja avisado antes de extrapolar. Disciplina sem esforço.
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Alimentação', pct: 78, val: 'R$ 780 / R$ 1.000' },
                    { label: 'Lazer', pct: 45, val: 'R$ 225 / R$ 500' },
                    { label: 'Transporte', pct: 92, val: 'R$ 368 / R$ 400', warn: true },
                  ].map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{b.label}</span>
                        <span className={`${b.warn ? 'text-rose-500 font-semibold' : 'text-gray-400'}`}>{b.val}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${b.warn ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                          style={{ width: `${b.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card: dream board */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-8 border border-amber-100 dark:border-amber-900/30">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-4" />
                <h3 className="text-xl font-extrabold mb-2">Quadro dos Sonhos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  Realizar sonhos exige planejamento. Visualize seus objetivos e veja o progresso real.
                </p>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">🏖 Viagem para Paris</span>
                    <span className="text-xs font-bold text-amber-600">68%</span>
                  </div>
                  <div className="h-2 bg-amber-100 dark:bg-amber-900/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">R$ 6.800 de R$ 10.000</p>
                </div>
              </div>
            </div>

            {/* Card: segurança */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-100 dark:bg-cyan-900/20 rounded-full blur-3xl" />
              <div className="relative">
                <ShieldCheck className="w-10 h-10 text-cyan-600 dark:text-cyan-400 mb-4" />
                <h3 className="text-xl font-extrabold mb-2">Segurança em primeiro lugar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  Senha criptografada, sessão protegida, dados isolados por usuário. Sem compartilhamento com terceiros.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['JWT auth', 'Senhas bcrypt', 'HTTPS', 'Backups diários'].map((tag) => (
                    <span key={tag} className="text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="preco" className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-200/20 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-md mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">Preço</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Um plano. Tudo incluso.</h2>
            <p className="text-gray-500 dark:text-gray-400">Sem pegadinhas. Sem upsell. Sem complicação.</p>
          </div>

          <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-2xl shadow-primary-100 dark:shadow-primary-950/50 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 px-8 py-10 text-center text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/20">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  Ato Pro
                </div>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-5xl font-extrabold tracking-tight">R$ 19</span>
                  <span className="text-2xl font-bold mb-1">,90</span>
                  <span className="text-primary-200 mb-1.5">/mês</span>
                </div>
                <p className="text-sm text-primary-200">14 dias grátis para experimentar</p>
              </div>
            </div>

            {/* Features list */}
            <div className="px-8 py-8">
              <ul className="space-y-3 mb-8">
                {[
                  'Transações ilimitadas',
                  'Dashboard inteligente',
                  'Relatórios e gráficos detalhados',
                  'Orçamentos com alertas',
                  'Quadro dos Sonhos',
                  'Categorias personalizadas',
                  'Acesso em qualquer dispositivo',
                  'Suporte prioritário por e-mail',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Começar 14 dias grátis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-[11px] text-gray-400 mt-3">Sem cartão de crédito. Cancele quando quiser.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
        <div className="relative max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-indigo-900 rounded-3xl p-10 sm:p-16 text-center text-white">
            {/* Decorative */}
            <GridBackground />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-500/40 rounded-full blur-3xl animate-blob" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                Comece hoje
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5 max-w-3xl mx-auto leading-tight">
                Pare de adiar.<br />
                <span className="bg-gradient-to-r from-white via-primary-200 to-cyan-300 bg-clip-text text-transparent">
                  Comece a controlar suas finanças hoje.
                </span>
              </h2>
              <p className="text-primary-100 text-base sm:text-lg max-w-xl mx-auto mb-10">
                14 dias para experimentar tudo. Sem cartão de crédito. Sem compromisso.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl transition-all shadow-2xl hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-4 rounded-xl transition-all"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-wide.png" alt="Ato Financeiro" className="h-8 w-auto opacity-80" />
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Entrar</Link>
            <Link to="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Criar conta</Link>
            <span>© {new Date().getFullYear()} Ato Financeiro</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
