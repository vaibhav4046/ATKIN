import React from 'react';
import { ATKIN_MARK_INTRINSIC, ATKIN_MARK_SRCSET } from '../../content/brandAssets';

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
      src="/brand/atkin-mark-64.png"
      srcSet={ATKIN_MARK_SRCSET}
      sizes="(max-width: 640px) 24px, 32px"
      width={ATKIN_MARK_INTRINSIC.width}
      height={ATKIN_MARK_INTRINSIC.height}
      alt={alt}
      style={style}
      className={`object-contain select-none shrink-0 rounded-[4px] ${className}`}
      decoding="async"
    />
  );
};
