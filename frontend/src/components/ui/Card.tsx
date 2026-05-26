import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
  hover?: boolean;
  variant?: 'default' | 'gradient' | 'dark';
}

export const Card = ({
  title, subtitle, action, noPadding, hover, variant = 'default',
  children, className = '', ...props
}: CardProps) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm',
    gradient: 'bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-700 border-0 text-white shadow-xl shadow-primary-200/40 dark:shadow-primary-900/30',
    dark: 'bg-gray-900 dark:bg-gray-950 border border-gray-800 text-white shadow-xl',
  };
  const hoverClass = hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-200 dark:hover:border-gray-700' : '';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${variantClasses[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className={`flex items-center justify-between px-6 py-4 ${variant === 'default' ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
          <div>
            {title && <h3 className={`text-sm font-bold tracking-tight ${variant === 'default' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>{title}</h3>}
            {subtitle && <p className={`text-xs mt-0.5 ${variant === 'default' ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'}`}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};
