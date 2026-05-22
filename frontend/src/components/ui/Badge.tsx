interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'solid' | 'soft';
  size?: 'sm' | 'md';
}

export const Badge = ({ children, color = '#6366f1', variant = 'soft', size = 'sm' }: BadgeProps) => {
  const bg = variant === 'solid' ? color : `${color}20`;
  const text = variant === 'solid' ? '#fff' : color;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {children}
    </span>
  );
};

export const TransactionBadge = ({ type }: { type: 'INCOME' | 'EXPENSE' }) => (
  <Badge color={type === 'INCOME' ? '#22c55e' : '#ef4444'} variant="soft">
    {type === 'INCOME' ? 'Receita' : 'Despesa'}
  </Badge>
);
