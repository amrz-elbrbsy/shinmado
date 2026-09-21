import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Search: React.FC<SearchProps> = ({
  value,
  onChange,
  placeholder = 'Cari...',
  className = '',
  size = 'md',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <SearchIcon
        className={`absolute left-3 text-slate-400 pointer-events-none ${
          size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white text-slate-800 rounded-xl border border-slate-200 pl-9 pr-8 focus:outline-none focus:ring-2 focus:ring-[#B88710]/20 focus:border-[#B88710] transition-all placeholder:text-slate-400 ${
          size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm'
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
