import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue' | 'purple' | 'gold' | 'navy';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: string; // Optional auto-detector for ZIPLIND status strings
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  size = 'md',
  dot = true,
  className = '',
  ...props
}) => {
  let computedVariant: BadgeVariant = variant || 'neutral';

  if (status && !variant) {
    const s = status.toLowerCase();
    if (['selesai', 'aktif', 'tersedia', 'aman', 'baik'].includes(s)) {
      computedVariant = 'success';
    } else if (['berjalan', 'proses', 'menipis', 'perlu servis'].includes(s)) {
      computedVariant = 'warning';
    } else if (['rusak', 'hilang', 'habis', 'dibatalkan', 'nonaktif'].includes(s)) {
      computedVariant = 'danger';
    } else if (['terjadwal', 'dipinjam'].includes(s)) {
      computedVariant = 'blue';
    } else {
      computedVariant = 'neutral';
    }
  }

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    blue: 'bg-[#FAF2DF] text-[#8C6207] border-[#F2E0B5]',
    gold: 'bg-[#FAF2DF] text-[#8C6207] border-[#F2E0B5]',
    navy: 'bg-slate-100 text-[#0B2546] border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    blue: 'bg-[#B88710]',
    gold: 'bg-[#B88710]',
    navy: 'bg-[#0B2546]',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 font-semibold rounded-md gap-1.5 whitespace-nowrap tracking-tight',
    md: 'text-sm px-3 py-1 font-semibold rounded-lg gap-1.5 whitespace-nowrap tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center shrink-0 border ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[computedVariant]}`} />}
      <span>{children || status}</span>
    </span>
  );
};
