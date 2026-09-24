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
    blue: 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20',
    ochre: 'bg-[#b64400]/10 text-[#b64400] border-[#b64400]/25 font-medium',
    green: 'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/25',
    slate: 'bg-[#f5f5f7] text-[#707070] border-[#d6d6d6]',
    ink: 'bg-[#1d1d1f] text-white border-transparent',
    red: 'bg-[#d32f2f]/10 text-[#d32f2f] border-[#d32f2f]/25 font-medium',
    neutral: 'bg-[#f5f5f7] text-[#1d1d1f] border-[#d6d6d6]'
  }[variant];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full-pill tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-full-pill tracking-tight'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 border font-sans ${variantStyles} ${sizeStyles} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
