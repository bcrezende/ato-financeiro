import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white focus:ring-primary-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5',
  secondary: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 focus:ring-primary-500/30 shadow-sm',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500/30 dark:text-gray-300 dark:hover:bg-gray-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
