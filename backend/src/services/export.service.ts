import ExcelJS from 'exceljs';
import { transactionService } from './transaction.service';

export const exportService = {
  async toExcel(userId: string, filters: { startDate?: string; endDate?: string }) {
    const { data } = await transactionService.findAll(userId, filters, 1, 10000);

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
        date: new Date(t.date).toLocaleDateString('pt-BR'),
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
    const { data } = await transactionService.findAll(userId, filters, 1, 10000);
    const header = 'Data,Descrição,Tipo,Categoria,Valor,Notas\n';
    const rows = data.map((t: any) =>
      [
        new Date(t.date).toLocaleDateString('pt-BR'),
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
