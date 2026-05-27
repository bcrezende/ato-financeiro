import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number, currency = 'BRL', locale = 'pt-BR'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

export const formatDate = (date: string | Date, fmt = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '-';
  // A data da transação é um dia do calendário ancorado em UTC. Formatamos pelas
  // partes UTC para que o dia nunca "volte" por causa do fuso do navegador.
  const dayLocal = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return format(dayLocal, fmt, { locale: ptBR });
};

/** Converte um ISO de transação para o valor "yyyy-MM-dd" de um <input type="date">, em UTC. */
export const toDateInput = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatMonth = (month: number, year: number): string =>
  format(new Date(year, month - 1, 1), 'MMM/yyyy', { locale: ptBR });

export const formatPercent = (value: number): string =>
  `${Math.round(value)}%`;

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
