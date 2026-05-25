import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface FormValues { email: string; password: string }

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate('/');
      toast.success(`Bem-vindo, ${result.user.name}!`);
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-wide.png" alt="Ato Financeiro" className="h-20 w-auto object-contain mb-2" />
          <p className="text-gray-500 dark:text-gray-400 mt-1">Controle total das suas finanças</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', { required: 'Email obrigatório' })}
            />

            <Input
              label="Senha"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="cursor-pointer hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', { required: 'Senha obrigatória' })}
            />

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
