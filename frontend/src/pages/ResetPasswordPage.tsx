import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

interface FormValues { newPassword: string; confirmPassword: string }

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const newPassword = watch('newPassword');

  const onSubmit = async ({ newPassword }: FormValues) => {
    try {
      await authService.resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Link inválido ou expirado.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link inválido</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Este link de redefinição é inválido ou já foi utilizado.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Solicitar novo link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-wide.png" alt="Ato Financeiro" className="h-16 w-auto object-contain" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Senha redefinida!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Criar nova senha</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Escolha uma senha forte com no mínimo 8 caracteres.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nova senha"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoFocus
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="cursor-pointer hover:text-gray-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={errors.newPassword?.message}
                  {...register('newPassword', {
                    required: 'Campo obrigatório',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                <Input
                  label="Confirmar nova senha"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="cursor-pointer hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Campo obrigatório',
                    validate: (v) => v === newPassword || 'As senhas não conferem',
                  })}
                />
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                  Salvar nova senha
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
