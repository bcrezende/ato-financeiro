import { Link } from 'react-router-dom';
import {
  ArrowRight, LayoutDashboard, PieChart, Target,
  Sparkles, ShieldCheck, TrendingUp, Zap, CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard completo',
    desc: 'Visão geral das suas receitas, despesas e saldo em tempo real.',
  },
  {
    icon: TrendingUp,
    title: 'Transações inteligentes',
    desc: 'Registre entradas e saídas com categorias, recorrência e parcelas.',
  },
  {
    icon: PieChart,
    title: 'Relatórios visuais',
    desc: 'Gráficos claros por categoria e período para entender seus gastos.',
  },
  {
    icon: Target,
    title: 'Orçamentos',
    desc: 'Defina limites por categoria e receba alertas antes de estourar.',
  },
  {
    icon: Sparkles,
    title: 'Quadro dos Sonhos',
    desc: 'Visualize seus objetivos financeiros e acompanhe o progresso.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro e privado',
    desc: 'Seus dados ficam protegidos e nunca são compartilhados.',
  },
];

export const LandingPage = () => (
  <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">

    {/* ── Navbar ── */}
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <img src="/logo-wide.png" alt="Ato Financeiro" className="h-9 w-auto object-contain" />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Começar grátis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>

    <main className="flex-1">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-24 px-4">
        {/* decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> 14 dias grátis · sem cartão de crédito
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-5">
            Controle total das<br />
            <span className="text-primary-600 dark:text-primary-400">suas finanças</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Registre receitas e despesas, acompanhe orçamentos, visualize relatórios e realize seus sonhos financeiros — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
            >
              <Sparkles className="w-4 h-4" />
              Começar 14 dias grátis
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              Já sou cliente →
            </Link>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
            Após o trial, apenas <strong className="text-gray-500 dark:text-gray-500">R$19,90/mês</strong>. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Tudo que você precisa
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Ferramentas simples e poderosas para organizar sua vida financeira.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Preço simples e justo</h2>
            <p className="text-gray-500 dark:text-gray-400">Sem taxas escondidas. Cancele quando quiser.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-primary-600 to-indigo-600 px-8 py-8 text-center text-white">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-200 mb-2">Ato Pro</p>
              <div className="flex items-end justify-center gap-1 mb-1">
                <span className="text-5xl font-extrabold">R$19</span>
                <span className="text-2xl font-bold mb-1">,90</span>
                <span className="text-primary-200 mb-1">/mês</span>
              </div>
              <p className="text-sm text-primary-200">14 dias grátis para começar</p>
            </div>
            <div className="px-8 py-6">
              <ul className="space-y-3 mb-8">
                {[
                  'Transações ilimitadas',
                  'Relatórios e gráficos',
                  'Orçamentos por categoria',
                  'Quadro dos Sonhos',
                  'Suporte por e-mail',
                  'Acesso em qualquer dispositivo',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Começar 14 dias grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-600 to-indigo-700 text-center text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Pronto para organizar suas finanças?</h2>
        <p className="text-primary-200 mb-8 max-w-md mx-auto">
          Comece hoje sem precisar de cartão de crédito. 14 dias para experimentar tudo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Criar conta grátis
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

    </main>

    {/* ── Footer ── */}
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-6 px-4 text-center">
      <p className="text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} Ato Financeiro · Todos os direitos reservados
      </p>
    </footer>

  </div>
);
