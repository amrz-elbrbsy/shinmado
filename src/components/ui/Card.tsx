import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  padding = 'md',
  className = '',
  bodyClassName = '',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-3 sm:p-3.5',
    md: 'p-3.5 sm:p-4.5',
    lg: 'p-4 sm:p-6',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-clamp-h3 font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
        </div>
      )}
      <div className={`${paddingMap[padding]} ${bodyClassName}`}>{children}</div>
    </div>
  );
};
