import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1
}) => {
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded';

  const variantClasses = {
    text: 'h-3.5 w-full my-1 rounded-[2px]',
    rectangular: 'h-16 w-full rounded-[4px]',
    circular: 'w-8 h-8 rounded-full',
    card: 'h-28 w-full rounded-[6px] border border-border-hairline p-4'
  }[variant];

  if (count > 1) {
    return (
      <div className="space-y-2 w-full" aria-hidden="true" role="status">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} ${variantClasses} ${className}`} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses} ${className}`} 
      aria-hidden="true" 
      role="status"
    />
  );
};

export const DocumentSkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-4 p-6" aria-label="Loading document evidence...">
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <Skeleton className="w-1/3 h-5" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Skeleton count={4} className="w-full" />
      <div className="pt-2">
        <Skeleton variant="rectangular" className="h-20" />
      </div>
      <Skeleton count={3} className="w-5/6" />
    </div>
  );
};
