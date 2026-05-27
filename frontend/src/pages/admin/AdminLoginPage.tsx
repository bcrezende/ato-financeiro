import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { useAdminStore } from '@/store/admin.store';
import toast from 'react-hot-toast';

interface FormValues { email: string; password: string }

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { setAdminAuth } = useAdminStore();
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await adminApi.post('/admin/login', data);
      const { admin, token } = res.data.data;
      setAdminAuth(admin, token);
      navigate('/admin');
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Falha no login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-900/40 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Ato Admin</h1>
          <p className="text-sm text-gray-500">Painel de controle</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="admin@..."
                {...register('email', { required: true })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Senha</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="••••••••"
                {...register('password', { required: true })}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};
