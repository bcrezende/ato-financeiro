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
