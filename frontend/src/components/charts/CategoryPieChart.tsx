import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CategoryBreakdown } from '@/types';
import { formatCurrency } from '@/utils/format';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  type: 'INCOME' | 'EXPENSE';
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
      </div>
      <p className="text-sm font-bold mt-1" style={{ color: p.color }}>{formatCurrency(value)}</p>
    </div>
  );
};

export const CategoryPieChart = ({ data, type }: CategoryPieChartProps) => {
  const filtered = data.filter((d) => d.type === type);
  // total available for future percentage display

  if (!filtered.length) {
    return (
      <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
        Sem dados para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="total"
          nameKey={(d: any) => d.category?.name ?? d.categoryId}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          labelLine={false}
          label={renderLabel}
        >
          {filtered.map((entry, i) => (
            <Cell key={i} fill={entry.category?.color ?? '#6366f1'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
