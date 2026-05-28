import ExcelJS from 'exceljs';
import { transactionService } from './transaction.service';
import { ValidationError } from '../utils/errors';

// Mesma proteção do report.service: cap de range + linhas para não saturar
// o pool de conexões do Postgres nem bloquear o event loop em datasets grandes.
const MAX_EXPORT_RANGE_DAYS = 365;
const MAX_EXPORT_ROWS = 5000;

function assertExportRange(filters: { startDate?: string; endDate?: string }) {
  if (!filters.startDate || !filters.endDate) {
    throw new ValidationError('Informe o período (data inicial e final) para exportar.');
  }
  const start = new Date(filters.startDate).getTime();
  const end = new Date(filters.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new ValidationError('Datas inválidas.');
  }
  const days = Math.ceil((end - start) / 86400000);
  if (days > MAX_EXPORT_RANGE_DAYS) {
    throw new ValidationError(
      `Período máximo da exportação: ${MAX_EXPORT_RANGE_DAYS} dias. Exporte em blocos menores para períodos longos.`,
    );
  }
}

export const exportService = {
  async toExcel(userId: string, filters: { startDate?: string; endDate?: string }) {
    assertExportRange(filters);
    const { data } = await transactionService.findAll(userId, filters, 1, MAX_EXPORT_ROWS);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Ato Financeiro';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Transações');
    sheet.columns = [
      { header: 'Data', key: 'date', width: 14 },
      { header: 'Descrição', key: 'description', width: 35 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Valor (R$)', key: 'amount', width: 16 },
      { header: 'Notas', key: 'notes', width: 30 },
    ];

    // Header style
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };

    data.forEach((t: any) => {
      const row = sheet.addRow({
        date: new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        description: t.description,
        type: t.type === 'INCOME' ? 'Receita' : 'Despesa',
        category: t.category?.name ?? '',
        amount: Number(t.amount),
        notes: t.notes ?? '',
      });
      row.getCell('amount').numFmt = '#,##0.00';
      row.getCell('amount').font = {
        color: { argb: t.type === 'INCOME' ? 'FF16A34A' : 'FFDC2626' },
        bold: true,
      };
    });

    return workbook;
  },

  async toCsv(userId: string, filters: { startDate?: string; endDate?: string }) {
    assertExportRange(filters);
    const { data } = await transactionService.findAll(userId, filters, 1, MAX_EXPORT_ROWS);
    const header = 'Data,Descrição,Tipo,Categoria,Valor,Notas\n';
    const rows = data.map((t: any) =>
      [
        new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        `"${t.description.replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? 'Receita' : 'Despesa',
        `"${t.category?.name ?? ''}"`,
        Number(t.amount).toFixed(2),
        `"${(t.notes ?? '').replace(/"/g, '""')}"`,
      ].join(','),
    );
    return header + rows.join('\n');
  },
};
