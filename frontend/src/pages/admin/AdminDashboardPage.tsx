import {
  Users, UserPlus, Crown, DollarSign, Clock, Activity,
  ArrowLeftRight, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAdminMetrics, useAdminSignups } from '@/hooks/useAdmin';
import { formatCurrency } from '@/utils/format';

const StatCard = ({ icon: Icon, label, value, sub, accent }: any) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10b981', TRIAL: '#6366f1', EXPIRED: '#f59e0b', CANCELED: '#ef4444', PAST_DUE: '#f43f5e',
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Pro Ativo', TRIAL: 'Trial', EXPIRED: 'Expirado', CANCELED: 'Cancelado', PAST_DUE: 'Inadimplente',
};

export const AdminDashboardPage = () => {
  const { data: metrics, isLoading } = useAdminMetrics();
  const { data: signups } = useAdminSignups(30);

  if (isLoading || !metrics) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Carregando métricas...</div>;
  }

  const subData = Object.entries(metrics.subscriptions)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: STATUS_LABEL[k] ?? k, value: v, color: STATUS_COLORS[k] ?? '#94a3b8' }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Visão geral</h1>
        <p className="text-sm text-gray-500">Métricas da plataforma em tempo real</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Usuários" value={metrics.users.total} sub={`+${metrics.users.last30d} em 30d`} accent="bg-gradient-to-br from-primary-500 to-indigo-600" />
        <StatCard icon={Crown} label="Pro ativos" value={metrics.subscriptions.ACTIVE} sub={`${metrics.subscriptions.TRIAL} em trial`} accent="bg-gradient-to-br from-emerald-400 to-emerald-600" />
        <StatCard icon={DollarSign} label="MRR estimado" value={formatCurrency(metrics.mrr)} sub="receita recorrente/mês" accent="bg-gradient-to-br from-amber-400 to-orange-500" />
        <StatCard icon={Activity} label="Ativos (30d)" value={metrics.users.active30d} sub="com transação recente" accent="bg-gradient-to-br from-cyan-400 to-blue-600" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserPlus} label="Novos hoje" value={metrics.users.today} accent="bg-gray-700" />
        <StatCard icon={Clock} label="Trials expirando 7d" value={metrics.trialsExpiring7d} accent="bg-gray-700" />
        <StatCard icon={ArrowLeftRight} label="Transações" value={metrics.content.transactions} accent="bg-gray-700" />
        <StatCard icon={Sparkles} label="Sonhos" value={metrics.content.dreamItems} accent="bg-gray-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-white mb-4">Cadastros (últimos 30 dias)</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={signups ?? []}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(d) => d.slice(8)} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#sg)" name="Cadastros" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-white mb-4">Assinaturas</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={subData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {subData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
