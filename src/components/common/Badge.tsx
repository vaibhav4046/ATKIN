import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'ochre' | 'green' | 'slate' | 'ink' | 'red' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
  icon
}) => {
  const variantStyles = {
    blue: 'bg-blue-50/80 text-blue-800 border-blue-200/90 font-medium',
    ochre: 'bg-amber-50/90 text-amber-950 border-amber-300/80 font-medium',
    green: 'bg-emerald-50/80 text-emerald-900 border-emerald-200/90 font-medium',
    slate: 'bg-slate-100/90 text-slate-700 border-slate-200 font-medium',
    ink: 'bg-slate-900 text-slate-100 border-slate-850 font-medium',
    red: 'bg-rose-50/90 text-rose-900 border-rose-200/90 font-medium',
    neutral: 'bg-slate-50 text-slate-800 border-slate-200 font-medium'
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded-[3px] tracking-tight',
    md: 'text-xs px-2 py-0.5 rounded-[4px] tracking-tight'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 border font-sans select-none ${variantStyles} ${sizeStyles} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
