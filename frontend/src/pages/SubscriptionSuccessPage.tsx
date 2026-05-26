import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const SubscriptionSuccessPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Assinatura ativada!</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Bem-vindo ao Ato Financeiro Pro. Seu acesso completo está liberado.
      </p>
      <Link to="/">
        <Button className="w-full" size="lg">Ir para o Dashboard</Button>
      </Link>
    </div>
  </div>
);
