import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTourStore } from '@/store/tour.store';

const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024;

const buildSteps = (): Step[] => {
  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: '👋 Bem-vindo ao Ato!',
      content: 'Vamos te mostrar o essencial em 30 segundos. É rápido — e você pode pular quando quiser.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="new-transaction"]',
      title: 'Registre sua primeira transação',
      content: 'Comece por aqui: adicione uma receita ou despesa. Esse é o coração do app.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="summary-cards"]',
      title: 'Sua visão do mês',
      content: 'Receitas, despesas, saldo e caixa atual aparecem aqui automaticamente conforme você registra.',
      placement: 'bottom',
      disableBeacon: true,
    },
  ];

  if (isDesktop()) {
    steps.push(
      {
        target: '[data-tour="sidebar-nav"]',
        title: 'Navegue pela plataforma',
        content: 'Transações, Relatórios, Orçamentos, Categorias e o Quadro dos Sonhos ficam neste menu.',
        placement: 'right',
        disableBeacon: true,
      },
      {
        target: '[data-tour="nav-dream"]',
        title: '✨ Quadro dos Sonhos',
        content: 'Adicione fotos dos seus objetivos e acompanhe sua motivação todos os dias.',
        placement: 'right',
        disableBeacon: true,
      },
      {
        target: '[data-tour="subscription-cta"]',
        title: 'Seu plano',
        content: 'Acompanhe aqui seu período de teste e gerencie a assinatura quando quiser.',
        placement: 'right',
        disableBeacon: true,
      },
    );
  }

  steps.push({
    target: 'body',
    placement: 'center',
    title: '🎉 Tudo pronto!',
    content: 'Explore à vontade. Você pode rever este tutorial a qualquer momento nas Configurações.',
    disableBeacon: true,
  });

  return steps;
};

export const ProductTour = () => {
  const { run, finish } = useTourStore();

  const handleCallback = (data: CallBackProps) => {
    const finished = ([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(data.status);
    if (finished) finish();
  };

  if (!run) return null;

  return (
    <Joyride
      steps={buildSteps()}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrollParentFix
      callback={handleCallback}
      locale={{ back: 'Voltar', close: 'Fechar', last: 'Concluir', next: 'Próximo', skip: 'Pular tutorial' }}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 10000,
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          overlayColor: 'rgba(15, 23, 42, 0.6)',
        },
        tooltipTitle: { fontWeight: 800, fontSize: 16 },
        buttonNext: { borderRadius: 10, fontWeight: 700, padding: '8px 16px' },
        buttonBack: { color: '#6b7280' },
        buttonSkip: { color: '#9ca3af' },
      }}
    />
  );
};
