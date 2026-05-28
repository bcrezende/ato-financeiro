import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { transactionService } from './transaction.service';
import { TransactionFilters } from '../types';
import { ValidationError } from '../utils/errors';

// Limite máximo de range para relatório/export — evita que uma única requisição
// pesada (range de anos sobre milhares de transações) sature o pool de conexões
// e bloqueie o event loop.
const MAX_REPORT_RANGE_DAYS = 365;
const MAX_REPORT_ROWS = 5000;

function assertRangeWithinLimit(filters: { startDate?: string; endDate?: string }) {
  if (!filters.startDate || !filters.endDate) {
    throw new ValidationError('Informe o período (data inicial e final) do relatório.');
  }
  const start = new Date(filters.startDate).getTime();
  const end = new Date(filters.endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    throw new ValidationError('Datas inválidas.');
  }
  const days = Math.ceil((end - start) / 86400000);
  if (days > MAX_REPORT_RANGE_DAYS) {
    throw new ValidationError(
      `Período máximo do relatório: ${MAX_REPORT_RANGE_DAYS} dias. Gere relatórios menores para períodos longos.`,
    );
  }
}

export type ReportType = 'category-sintetico' | 'category-analitico';
export type ReportFormat = 'pdf' | 'excel';

interface ReportInput {
  filters: TransactionFilters;
  reportType: ReportType;
  format: ReportFormat;
}

interface CategoryGroup {
  category: string;
  type: string;
  color?: string;
  transactions: any[];
  count: number;
  total: number;
}

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: Date | string) => {
  const date = new Date(d);
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
};

function groupByCategory(transactions: any[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>();
  for (const t of transactions) {
    const key = `${t.category?.name ?? '—'}|${t.type}`;
    if (!map.has(key)) {
      map.set(key, {
        category: t.category?.name ?? 'Sem categoria',
        type: t.type,
        color: t.category?.color,
        transactions: [],
        count: 0,
        total: 0,
      });
    }
    const g = map.get(key)!;
    g.transactions.push(t);
    g.count++;
    g.total += t.amount;
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function summarize(transactions: any[]) {
  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense, count: transactions.length };
}

function rangeLabel(filters: TransactionFilters): string {
  if (filters.startDate && filters.endDate) return `${fmtDate(filters.startDate)} a ${fmtDate(filters.endDate)}`;
  if (filters.startDate) return `A partir de ${fmtDate(filters.startDate)}`;
  if (filters.endDate) return `Até ${fmtDate(filters.endDate)}`;
  return 'Todo o histórico';
}

// ─────────────────────────────────────────────────────────────
//  Excel
// ─────────────────────────────────────────────────────────────
async function generateExcel(transactions: any[], reportType: ReportType, filters: TransactionFilters): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Ato Financeiro';
  wb.created = new Date();

  const sheet = wb.addWorksheet(reportType === 'category-sintetico' ? 'Sintético' : 'Analítico');
  const groups = groupByCategory(transactions);
  const totals = summarize(transactions);

  // Cabeçalho
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = reportType === 'category-sintetico'
    ? 'Relatório por Categoria — Sintético'
    : 'Relatório por Categoria — Analítico';
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF4F46E5' } };
  titleCell.alignment = { horizontal: 'left' };

  sheet.mergeCells('A2:E2');
  sheet.getCell('A2').value = `Período: ${rangeLabel(filters)}  ·  ${totals.count} transação(ões)`;
  sheet.getCell('A2').font = { size: 10, color: { argb: 'FF6B7280' } };

  sheet.addRow([]);

  if (reportType === 'category-sintetico') {
    // Linha de headers
    const header = sheet.addRow(['Categoria', 'Tipo', 'Quantidade', 'Total']);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    });
    sheet.columns = [
      { key: 'category', width: 28 },
      { key: 'type', width: 12 },
      { key: 'count', width: 14 },
      { key: 'total', width: 16 },
    ];
    for (const g of groups) {
      const row = sheet.addRow([g.category, g.type === 'INCOME' ? 'Receita' : 'Despesa', g.count, g.total]);
      row.getCell(4).numFmt = 'R$ #,##0.00';
      row.getCell(4).font = { color: { argb: g.type === 'INCOME' ? 'FF16A34A' : 'FFDC2626' }, bold: true };
    }
  } else {
    // Analítico: seção por categoria
    sheet.columns = [{ width: 14 }, { width: 35 }, { width: 14 }, { width: 14 }, { width: 16 }];
    for (const g of groups) {
      const sectionHeader = sheet.addRow([`${g.category}  (${g.type === 'INCOME' ? 'Receita' : 'Despesa'})`]);
      sheet.mergeCells(`A${sectionHeader.number}:E${sectionHeader.number}`);
      sectionHeader.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      sectionHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: g.type === 'INCOME' ? 'FF16A34A' : 'FFDC2626' } };

      const cols = sheet.addRow(['Data', 'Descrição', 'Tipo', 'Status', 'Valor']);
      cols.font = { bold: true, color: { argb: 'FF6B7280' } };

      for (const t of g.transactions) {
        const row = sheet.addRow([fmtDate(t.date), t.description, t.type === 'INCOME' ? 'Receita' : 'Despesa', t.status === 'PAID' ? 'Pago' : 'Pendente', t.amount]);
        row.getCell(5).numFmt = 'R$ #,##0.00';
      }

      const subRow = sheet.addRow(['', '', '', 'Subtotal', g.total]);
      subRow.font = { bold: true };
      subRow.getCell(5).numFmt = 'R$ #,##0.00';
      sheet.addRow([]);
    }
  }

  // Totais gerais
  sheet.addRow([]);
  const totRow = sheet.addRow(['', '', '', 'Total Receitas', totals.totalIncome]);
  totRow.font = { bold: true, color: { argb: 'FF16A34A' } };
  totRow.getCell(5).numFmt = 'R$ #,##0.00';

  const expRow = sheet.addRow(['', '', '', 'Total Despesas', totals.totalExpense]);
  expRow.font = { bold: true, color: { argb: 'FFDC2626' } };
  expRow.getCell(5).numFmt = 'R$ #,##0.00';

  const balRow = sheet.addRow(['', '', '', 'Saldo', totals.balance]);
  balRow.font = { bold: true, color: { argb: totals.balance >= 0 ? 'FF4F46E5' : 'FFDC2626' }, size: 12 };
  balRow.getCell(5).numFmt = 'R$ #,##0.00';

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf as ArrayBuffer);
}

// ─────────────────────────────────────────────────────────────
//  PDF
// ─────────────────────────────────────────────────────────────
function generatePdf(transactions: any[], reportType: ReportType, filters: TransactionFilters): Buffer {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const groups = groupByCategory(transactions);
  const totals = summarize(transactions);

  const title = reportType === 'category-sintetico'
    ? 'Relatório por Categoria — Sintético'
    : 'Relatório por Categoria — Analítico';

  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229);
  doc.text(title, 40, 50);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Período: ${rangeLabel(filters)}  ·  ${totals.count} transação(ões)`, 40, 68);

  let cursorY = 90;

  if (reportType === 'category-sintetico') {
    autoTable(doc, {
      startY: cursorY,
      head: [['Categoria', 'Tipo', 'Qtd', 'Total']],
      body: groups.map((g) => [
        g.category,
        g.type === 'INCOME' ? 'Receita' : 'Despesa',
        String(g.count),
        fmtBRL(g.total),
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 20;
  } else {
    for (const g of groups) {
      // Header de seção
      doc.setFillColor(g.type === 'INCOME' ? 22 : 220, g.type === 'INCOME' ? 163 : 38, g.type === 'INCOME' ? 74 : 38);
      doc.rect(40, cursorY, 515, 22, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      doc.text(`${g.category}  (${g.type === 'INCOME' ? 'Receita' : 'Despesa'})`, 48, cursorY + 15);
      cursorY += 24;

      autoTable(doc, {
        startY: cursorY,
        head: [['Data', 'Descrição', 'Status', 'Valor']],
        body: g.transactions.map((t) => [
          fmtDate(t.date),
          t.description,
          t.status === 'PAID' ? 'Pago' : 'Pendente',
          fmtBRL(t.amount),
        ]),
        foot: [['', '', 'Subtotal', fmtBRL(g.total)]],
        headStyles: { fillColor: [243, 244, 246], textColor: [107, 114, 128], fontStyle: 'bold' },
        footStyles: { fillColor: [249, 250, 251], textColor: 0, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 60 }, 3: { halign: 'right', fontStyle: 'bold' } },
      });
      cursorY = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  // Totais finais
  if (cursorY > 720) { doc.addPage(); cursorY = 50; }
  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74);
  doc.text(`Total Receitas: ${fmtBRL(totals.totalIncome)}`, 40, cursorY);
  doc.setTextColor(220, 38, 38);
  doc.text(`Total Despesas: ${fmtBRL(totals.totalExpense)}`, 40, cursorY + 16);
  doc.setTextColor(totals.balance >= 0 ? 79 : 220, totals.balance >= 0 ? 70 : 38, totals.balance >= 0 ? 229 : 38);
  doc.setFontSize(12);
  doc.text(`Saldo: ${fmtBRL(totals.balance)}`, 40, cursorY + 36);

  return Buffer.from(doc.output('arraybuffer'));
}

// ─────────────────────────────────────────────────────────────
//  API pública
// ─────────────────────────────────────────────────────────────
export const reportService = {
  async generate(userId: string, input: ReportInput) {
    assertRangeWithinLimit(input.filters);
    const { data: transactions } = await transactionService.findAll(userId, input.filters, 1, MAX_REPORT_ROWS);

    const stamp = new Date().toISOString().slice(0, 10);
    const typeName = input.reportType === 'category-sintetico' ? 'sintetico' : 'analitico';

    if (input.format === 'excel') {
      const buffer = await generateExcel(transactions, input.reportType, input.filters);
      return {
        buffer,
        filename: `relatorio-${typeName}-${stamp}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
    const buffer = generatePdf(transactions, input.reportType, input.filters);
    return {
      buffer,
      filename: `relatorio-${typeName}-${stamp}.pdf`,
      contentType: 'application/pdf',
    };
  },
};
