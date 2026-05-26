import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 pr-10 text-sm font-medium transition-all duration-200
              focus:outline-none focus:ring-4
              ${error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                : 'border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/15'}
              bg-white dark:bg-gray-900 text-gray-900 dark:text-white
              disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer
              ${className}`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
