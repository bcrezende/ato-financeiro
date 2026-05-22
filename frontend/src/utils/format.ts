import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatCurrency = (value: number, currency = 'BRL', locale = 'pt-BR'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

export const formatDate = (date: string | Date, fmt = 'dd/MM/yyyy'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, fmt, { locale: ptBR }) : '-';
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
