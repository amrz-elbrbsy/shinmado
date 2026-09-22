import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-semibold text-[#30445F] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-white text-slate-800 text-sm rounded-lg border appearance-none transition-all duration-150 py-2.5 pl-3.5 pr-9 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600 font-medium leading-relaxed max-w-prose">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-prose">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
