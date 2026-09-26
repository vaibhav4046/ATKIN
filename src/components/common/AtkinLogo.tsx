import React from 'react';

interface AtkinLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'mark' | 'badge' | 'raw';
  alt?: string;
}

export const AtkinLogo: React.FC<AtkinLogoProps> = ({
  className = 'w-6 h-6',
  size,
  alt = 'ATKIN Sovereign Legal AI'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      src="/brand/atkin-mark.png"
      alt={alt}
      style={style}
      className={`object-contain select-none shrink-0 rounded-[4px] ${className}`}
      loading="eager"
    />
  );
};
