import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Globe, Crown, CreditCard, CheckCircle2, Clock, AlertTriangle, Trash2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useSubscriptionStatus, useCheckout, useBillingPortal } from '@/hooks/useSubscription';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { value: 'BRL', label: 'Real Brasileiro (R$)' },
  { value: 'USD', label: 'Dólar Americano ($)' },
  { value: 'EUR', label: 'Euro (€)' },
];

const LOCALES = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
];

const SubscriptionSection = () => {
  const { data: sub, isLoading } = useSubscriptionStatus();
  const checkout = useCheckout();
  const portal = useBillingPortal();

  if (isLoading) {
    return (
      <Card title="Assinatura" action={<Crown className="w-5 h-5 text-yellow-500" />}>
        <div className="h-20 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  const status = sub?.subscriptionStatus ?? 'TRIAL';
  const daysLeft = sub?.daysLeft ?? 0;
  const hasPortal = sub?.hasPortal ?? false;

  const statusBadge = () => {
    if (status === 'ACTIVE') return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Pro Ativo
      </span>
    );
    if (status === 'TRIAL') return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
        daysLeft <= 7
          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      }`}>
        <Clock className="w-3.5 h-3.5" />
        {daysLeft > 0 ? `Trial — ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}` : 'Trial expirado'}
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold">
        <AlertTriangle className="w-3.5 h-3.5" /> Sem assinatura ativa
      </span>
    );
  };

  return (
    <Card title="Assinatura" action={<Crown className="w-5 h-5 text-yellow-500" />}>
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Plano atual</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {status === 'ACTIVE' ? 'Ato Pro — R$19,90/mês' : 'Ato Pro — R$19,90/mês · cobrado mensalmente'}
            </p>
          </div>
          {statusBadge()}
        </div>

        {/* Action */}
        <div className="flex justify-end gap-3">
          {status === 'ACTIVE' && hasPortal ? (
            <Button
              variant="secondary"
              onClick={() => portal.mutate()}
              loading={portal.isPending}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Gerenciar Assinatura
            </Button>
          ) : status === 'ACTIVE' && !hasPortal ? (
            /* Owner account manually set to ACTIVE — no Stripe customer */
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acesso vitalício ativo
            </span>
          ) : (
            <Button
              onClick={() => checkout.mutate()}
              loading={checkout.isPending}
            >
              <Crown className="w-4 h-4 mr-2" />
              {status === 'TRIAL' ? 'Assinar Agora — R$19,90/mês' : 'Reativar Assinatura'}
            </Button>
          )}
        </div>

        {/* Info note */}
        {status === 'ACTIVE' && hasPortal && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Gerencie seu cartão, histórico de faturas e cancelamento pelo portal de cobrança.
          </p>
        )}
        {status === 'TRIAL' && daysLeft > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Você está no período gratuito. Assine antes que ele expire para continuar usando o Ato sem interrupção.
          </p>
        )}
      </div>
    </Card>
  );
};

const DangerZone = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password) { toast.error('Digite sua senha para confirmar'); return; }
    setLoading(true);
    try {
      await authService.deleteAccount(password);
      toast.success('Conta excluída. Até logo!');
      logout();
      navigate('/login', { replace: true });
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao excluir conta');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => { setModalOpen(false); setPassword(''); setShowPwd(false); };

  return (
    <>
      {/* Card */}
      <div className="rounded-2xl border-2 border-red-200 dark:border-red-800/60 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-800/40 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Área Perigosa</h2>
        </div>
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Excluir minha conta</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Remove permanentemente sua conta, todas as transações, categorias e orçamentos. Essa ação <strong>não pode ser desfeita</strong>.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir conta
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Excluir conta permanentemente?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Isso irá apagar <strong className="text-gray-700 dark:text-gray-300">todos os seus dados</strong>: transações, categorias, orçamentos e histórico. Não há como recuperar.
                </p>
              </div>
            </div>

            {/* Warning box */}
            <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                Conta: <span className="font-bold">{user?.email}</span>
              </p>
            </div>

            {/* Password field */}
            <div className="px-6 pb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirme sua senha para continuar
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={!password || loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {loading ? 'Excluindo...' : 'Sim, excluir minha conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const profileForm = useForm({
    defaultValues: { name: user?.name ?? '', currency: user?.currency ?? 'BRL', locale: user?.locale ?? 'pt-BR' },
  });

  const pwdForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();
  const newPwd = pwdForm.watch('newPassword');

  const onProfileSubmit = async (data: any) => {
    setProfileLoading(true);
    try {
      const updated = await authService.updateProfile(data);
      setUser({ ...user!, ...updated });
      toast.success('Perfil atualizado!');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao atualizar');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPwdSubmit = async (data: any) => {
    setPwdLoading(true);
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Senha alterada com sucesso!');
      pwdForm.reset();
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao alterar senha');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile */}
      <Card title="Informações do Perfil" action={<User className="w-5 h-5 text-gray-400" />}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Nome"
            {...profileForm.register('name', { required: true, minLength: 2 })}
            error={profileForm.formState.errors.name ? 'Nome obrigatório (mín. 2 caracteres)' : undefined}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Moeda" options={CURRENCIES} {...profileForm.register('currency')} />
            <Select label="Idioma" options={LOCALES} {...profileForm.register('locale')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={profileLoading}>Salvar Perfil</Button>
          </div>
        </form>
      </Card>

      {/* Email info */}
      <Card title="Conta" action={<Globe className="w-5 h-5 text-gray-400" />}>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
            Verificado
          </span>
        </div>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Membro desde</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }) : '-'}
          </p>
        </div>
      </Card>

      {/* Password */}
      <Card title="Alterar Senha" action={<Lock className="w-5 h-5 text-gray-400" />}>
        <form onSubmit={pwdForm.handleSubmit(onPwdSubmit)} className="space-y-4">
          <Input
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            error={pwdForm.formState.errors.currentPassword?.message}
            {...pwdForm.register('currentPassword', { required: 'Campo obrigatório' })}
          />
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            error={pwdForm.formState.errors.newPassword?.message}
            {...pwdForm.register('newPassword', { required: 'Campo obrigatório', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            error={pwdForm.formState.errors.confirmPassword?.message}
            {...pwdForm.register('confirmPassword', {
              required: 'Campo obrigatório',
              validate: (v) => v === newPwd || 'Senhas não conferem',
            })}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={pwdLoading} variant="secondary">Alterar Senha</Button>
          </div>
        </form>
      </Card>

      {/* Subscription */}
      <SubscriptionSection />

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
};
