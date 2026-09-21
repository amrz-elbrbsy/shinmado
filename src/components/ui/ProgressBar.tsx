import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  subLabel?: string;
  showPercentage?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'navy' | 'gold';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  subLabel,
  showPercentage = false,
  size = 'md',
  color = 'gold',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    xs: 'h-1.5',
    sm: 'h-2',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorClasses = {
    gold: 'bg-[#B88710]',
    blue: 'bg-[#B88710]',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    navy: 'bg-[#0B2546]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage || subLabel) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <div className="flex items-center gap-2">
            {label && <span className="text-slate-700">{label}</span>}
            {subLabel && <span className="text-slate-400 font-normal">{subLabel}</span>}
          </div>
          {showPercentage && <span className="text-slate-800 font-semibold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
