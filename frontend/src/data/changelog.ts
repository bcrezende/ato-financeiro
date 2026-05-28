export interface ChangelogEntry {
  version: string;
  date: string;            // YYYY-MM-DD
  title: string;           // headline curto
  highlights: { emoji: string; title: string; description: string }[];
}

/**
 * Histórico de novidades visíveis aos usuários. A entrada mais recente é
 * exibida automaticamente no WhatsNewModal quando o usuário ainda não viu
 * essa versão. Toda mudança efetiva no produto deve adicionar uma entrada
 * aqui e fazer bump em package.json.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.0',
    date: '2026-05-28',
    title: 'Metas, relatórios sob medida e mais',
    highlights: [
      {
        emoji: '🏆',
        title: 'Metas — financeiras e não financeiras',
        description: 'Cadastre objetivos (juntar R$50k, perder 5kg, fazer uma viagem). Adicione etapas, faça aportes, acompanhe progresso. Celebra junto quando você atinge 100%.',
      },
      {
        emoji: '📊',
        title: 'Gerador de Relatórios',
        description: 'Filtra por data, categoria, tipo, valor e descrição. Gera PDF ou Excel — sintético (totais por categoria) ou analítico (cada transação dentro de cada categoria, com subtotais).',
      },
      {
        emoji: '📅',
        title: 'Período personalizado em Relatórios',
        description: 'Além dos chips rápidos (3m/6m/12m/24m), agora dá pra escolher qualquer faixa de meses, mantendo gráficos e ranking sincronizados.',
      },
      {
        emoji: '↻',
        title: 'Recorrência sob demanda + frequência obrigatória',
        description: 'Marcou uma recorrente como paga? O Ato pergunta se quer gerar a próxima. E marcar "É recorrente" agora exige escolher a frequência (não dá mais pra esquecer).',
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-05-28',
    title: 'Recorrências sob demanda',
    highlights: [
      {
        emoji: '↻',
        title: 'Próxima parcela na hora certa',
        description: 'Marcou uma transação recorrente como paga? O Ato agora pergunta se você quer já gerar a próxima ocorrência — sem cron rodando, sem horizonte fixo. Você decide quando.',
      },
      {
        emoji: '📅',
        title: 'Recorrente sem parcelas agora faz sentido',
        description: 'Antes, marcar "recorrente" sem informar quantidade não gerava nada para o futuro. Agora a próxima é criada conforme você confirma cada pagamento.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-05-28',
    title: 'Mais controle sobre suas recorrências',
    highlights: [
      {
        emoji: '↻',
        title: 'Edição em lote de transações recorrentes',
        description: 'Editar ou excluir parcelas agora vem com 3 opções: apenas esta, esta e as próximas, ou todas as parcelas da série. Adeus deletar 200 parcelas uma a uma.',
      },
      {
        emoji: '✨',
        title: 'Quadro dos Sonhos sincronizado',
        description: 'Suas fotos do Quadro dos Sonhos agora ficam na sua conta e aparecem em qualquer dispositivo. Nada mais se perde ao trocar de celular.',
      },
      {
        emoji: '📅',
        title: 'Datas corrigidas',
        description: 'Acabou aquele bug em que uma transação no dia 01 aparecia como dia 30 ou 31 do mês anterior. Agora o dia que você escolhe é o dia que aparece.',
      },
      {
        emoji: '🧭',
        title: 'Navegação de meses em Orçamentos',
        description: 'Setas para avançar/voltar, atalho "Hoje" e chips dos outros meses que têm orçamento.',
      },
      {
        emoji: '🎓',
        title: 'Tutorial guiado refeito',
        description: 'Pode revisitar o passo a passo de uso da plataforma a qualquer momento em Configurações → Tutorial.',
      },
    ],
  },
];
