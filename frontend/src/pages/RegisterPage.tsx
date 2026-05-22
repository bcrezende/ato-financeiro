import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

interface FormValues { name: string; email: string; password: string; confirmPassword: string }

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const password = watch('password');

  const onSubmit = async (data: FormValues) => {
    try {
      await authService.register({ email: data.email, name: data.name, password: data.password });
      toast.success('Conta criada! Faça login para continuar.');
      navigate('/login');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ato Financeiro</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Crie sua conta gratuitamente</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Criar conta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name', { required: 'Nome obrigatório', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', { required: 'Email obrigatório', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' } })}
            />
            <Input
              label="Senha"
              type={showPwd ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="cursor-pointer hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirme a senha',
                validate: (v) => v === password || 'Senhas não conferem',
              })}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Criar Conta
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
