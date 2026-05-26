import { Crown, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCheckout, useSubscriptionStatus } from '@/hooks/useSubscription';

export const SubscriptionPage = () => {
  const { data: status } = useSubscriptionStatus();
  const checkout = useCheckout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-wide.png" alt="Ato Financeiro" className="h-14 w-auto object-contain mx-auto mb-6" />
          {status?.subscriptionStatus === 'TRIAL' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seu trial expirou</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Assine para continuar usando o Ato Financeiro</p>
            </>
          ) : status?.subscriptionStatus === 'PAST_DUE' ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagamento pendente</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Atualize seu método de pagamento para continuar</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assine o Ato Financeiro</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Controle total das suas finanças por menos de R$1 por dia</p>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5" />
              <span className="font-semibold text-lg">Plano Pro</span>
            </div>
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-bold">R$19,90</span>
              <span className="text-primary-200 mb-1">/mês</span>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 space-y-3">
            {[
              'Transações ilimitadas',
              'Relatórios completos',
              'Orçamentos e metas',
              'Quadro dos sonhos',
              'Acesso em qualquer dispositivo',
              'Suporte prioritário',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <Button
              className="w-full"
              size="lg"
              icon={<Zap className="w-4 h-4" />}
              loading={checkout.isPending}
              onClick={() => checkout.mutate()}
            >
              Assinar agora
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Cancele quando quiser · Cobrado mensalmente · Pagamento seguro via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
