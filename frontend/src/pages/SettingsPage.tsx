import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
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
    </div>
  );
};
