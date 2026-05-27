import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Plus } from 'lucide-react';
import { useAdmins, useCreateAdmin } from '@/hooks/useAdmin';
import { formatDate } from '@/utils/format';
import toast from 'react-hot-toast';

interface FormValues { name: string; email: string; password: string }

export const AdminsPage = () => {
  const { data: admins = [], isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    createAdmin.mutate(data, {
      onSuccess: () => { toast.success('Admin criado'); reset(); setShowForm(false); },
      onError: (e: any) => toast.error(e.response?.data?.error?.message ?? 'Erro ao criar'),
    });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Administradores</h1>
          <p className="text-sm text-gray-500">{admins.length} admin(s)</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-xl">
          <Plus className="w-4 h-4" /> Novo admin
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
          <input {...register('name', { required: true })} placeholder="Nome" className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500" />
          <input {...register('email', { required: true })} type="email" placeholder="Email" className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500" />
          <input {...register('password', { required: true, minLength: 8 })} type="password" placeholder="Senha (mín. 8)" className="w-full rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500" />
          {errors.password && <p className="text-xs text-rose-400">Senha precisa de no mínimo 8 caracteres</p>}
          <button type="submit" disabled={createAdmin.isPending} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50">
            {createAdmin.isPending ? 'Criando...' : 'Criar admin'}
          </button>
        </form>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{a.name}</p>
              <p className="text-xs text-gray-500">{a.email}</p>
            </div>
            <p className="text-[10px] text-gray-600">desde {formatDate(a.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
