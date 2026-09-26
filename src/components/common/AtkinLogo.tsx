import React from 'react';
import atkinRawLogo from '../../assets/atkin-logo.png';
import atkinBadgeLogo from '../../assets/atkin-logo-badge.png';

interface AtkinLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'badge' | 'raw';
  alt?: string;
}

export const AtkinLogo: React.FC<AtkinLogoProps> = ({
  className = 'w-6 h-6',
  size,
  variant = 'badge',
  alt = 'Atkin Sovereign Legal AI'
}) => {
  const src = variant === 'badge' ? atkinBadgeLogo : atkinRawLogo;
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={`object-contain select-none shrink-0 ${className}`}
      loading="eager"
    />
  );
};
