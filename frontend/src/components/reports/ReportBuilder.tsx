import { useState } from 'react';
import { Search, FileSpreadsheet, FileText, Filter, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { transactionService } from '@/services/transaction.service';
import { TransactionFilters, Transaction } from '@/types';
import { formatCurrency, formatDate, downloadBlob } from '@/utils/format';
import { TransactionBadge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface FormState {
  startDate: string;
  endDate: string;
  categoryId: string;
  type: '' | 'INCOME' | 'EXPENSE';
  minAmount: string;
  maxAmount: string;
  search: string;
}

const EMPTY: FormState = {
  startDate: '', endDate: '', categoryId: '', type: '', minAmount: '', maxAmount: '', search: '',
};

export const ReportBuilder = () => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [activeFilters, setActiveFilters] = useState<TransactionFilters | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'category-sintetico' | 'category-analitico'>('category-sintetico');
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [generating, setGenerating] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data, isFetching } = useTransactions(activeFilters ? { ...activeFilters, page: 1, limit: 1000 } : { page: 1, limit: 0 });
  const transactions = activeFilters ? (data?.data ?? []) : [];

  const handleSearch = () => {
    const filters: TransactionFilters = { page: 1, limit: 1000 };
    if (form.startDate) filters.startDate = form.startDate;
    if (form.endDate) filters.endDate = form.endDate;
    if (form.categoryId) filters.categoryId = form.categoryId;
    if (form.type) filters.type = form.type;
    if (form.minAmount) filters.minAmount = form.minAmount;
    if (form.maxAmount) filters.maxAmount = form.maxAmount;
    if (form.search) filters.search = form.search;
    setActiveFilters(filters);
  };

  const handleClear = () => { setForm(EMPTY); setActiveFilters(null); };

  const handleGenerate = async () => {
    if (!activeFilters || transactions.length === 0) {
      toast.error('Faça uma busca com resultados primeiro');
      return;
    }
    setGenerating(true);
    try {
      const res = await transactionService.generateReport(activeFilters, reportType, format);
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(res.data, `relatorio-${reportType}-${stamp}.${ext}`);
      toast.success('Relatório gerado!');
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.response?.data?.error?.message ?? 'Erro ao gerar relatório');
    } finally {
      setGenerating(false);
    }
  };

  const totals = transactions.reduce(
    (acc, t: Transaction) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary-500" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Filtros</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Data inicial" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          <Input label="Data final"   type="date" value={form.endDate}   onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          <Select
            label="Categoria"
            placeholder="Todas"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          />
          <Select
            label="Tipo"
            placeholder="Todos"
            options={[{ value: 'INCOME', label: 'Receitas' }, { value: 'EXPENSE', label: 'Despesas' }]}
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
          />
          <Input label="Valor mínimo (R$)" type="number" step="0.01" value={form.minAmount} onChange={(e) => setForm((f) => ({ ...f, minAmount: e.target.value }))} />
          <Input label="Valor máximo (R$)" type="number" step="0.01" value={form.maxAmount} onChange={(e) => setForm((f) => ({ ...f, maxAmount: e.target.value }))} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Input label="Descrição contém" placeholder="ex: aluguel, mercado..." value={form.search} onChange={(e) => setForm((f) => ({ ...f, search: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" icon={<X className="w-4 h-4" />} onClick={handleClear}>Limpar</Button>
          <Button icon={<Search className="w-4 h-4" />} onClick={handleSearch} loading={isFetching}>Buscar</Button>
        </div>
      </div>

      {/* Resultados */}
      {activeFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{transactions.length} transação(ões) encontradas</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Receitas <span className="font-semibold text-emerald-600">{formatCurrency(totals.income)}</span>
                {' · '}
                Despesas <span className="font-semibold text-rose-600">{formatCurrency(totals.expense)}</span>
                {' · '}
                Saldo <span className="font-semibold">{formatCurrency(totals.income - totals.expense)}</span>
              </p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={transactions.length === 0}
              icon={<FileText className="w-4 h-4" />}
            >
              Gerar Relatório
            </Button>
          </div>

          {isFetching ? (
            <div className="p-10 text-center text-gray-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Carregando...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-sm">Nenhuma transação corresponde aos filtros.</div>
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 dark:bg-gray-800/50 sticky top-0">
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Data</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Descrição</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Categoria</th>
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest">Tipo</th>
                    <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions.map((t: Transaction) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-2.5 text-gray-600 dark:text-gray-400 text-xs font-medium whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-5 py-2.5 font-semibold text-gray-900 dark:text-white">{t.description}</td>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1 rounded-md text-xs">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.category?.color }} />
                          {t.category?.name}
                        </span>
                      </td>
                      <td className="px-5 py-2.5"><TransactionBadge type={t.type} /></td>
                      <td className={`px-5 py-2.5 text-right font-extrabold tabular-nums ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dialog: tipo + formato */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Gerar Relatório</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{transactions.length} transações serão incluídas</p>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Tipo de relatório</p>
                <div className="space-y-2">
                  {([
                    { v: 'category-sintetico', l: 'Por categoria — Sintético', d: 'Totais por categoria, sem listar transações individuais.' },
                    { v: 'category-analitico', l: 'Por categoria — Analítico', d: 'Cada transação listada dentro da sua categoria, com subtotais.' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.v}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        reportType === opt.v
                          ? 'border-primary-400 bg-primary-50/40 dark:bg-primary-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input type="radio" checked={reportType === opt.v} onChange={() => setReportType(opt.v)} className="mt-1 accent-primary-500" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{opt.l}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{opt.d}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Formato</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${format === 'pdf' ? 'border-primary-400 bg-primary-50/40 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="accent-primary-500" />
                    <FileText className="w-4 h-4 text-rose-500" /> PDF
                  </label>
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${format === 'excel' ? 'border-primary-400 bg-primary-50/40 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" checked={format === 'excel'} onChange={() => setFormat('excel')} className="accent-primary-500" />
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Excel
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <Button variant="secondary" onClick={() => setDialogOpen(false)} disabled={generating}>Cancelar</Button>
              <Button onClick={handleGenerate} loading={generating}>Gerar e baixar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
