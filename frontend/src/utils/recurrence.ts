/**
 * Calcula a próxima data de uma recorrência, espelhando o advanceDate do
 * backend. Trabalha em UTC para casar com a âncora "meio-dia UTC" das datas.
 */
export function nextOccurrence(dateIso: string | Date, frequency: string): Date {
  const d = new Date(dateIso);
  switch (frequency) {
    case 'DAILY':   d.setUTCDate(d.getUTCDate() + 1); break;
    case 'WEEKLY':  d.setUTCDate(d.getUTCDate() + 7); break;
    case 'MONTHLY': d.setUTCMonth(d.getUTCMonth() + 1); break;
    case 'YEARLY':  d.setUTCFullYear(d.getUTCFullYear() + 1); break;
  }
  return d;
}

export const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: 'diária',
  WEEKLY: 'semanal',
  MONTHLY: 'mensal',
  YEARLY: 'anual',
};
