import React from 'react';

/**
 * Ambient art layer for the marketing surface.
 *
 * Design rules this component exists to enforce:
 *
 * 1. Art supports the product, it never competes with it. Every layer sits
 *    behind content in its own stacking context and is masked so the live HTML
 *    copy always lands on quiet paper, in both themes.
 * 2. Dark mode is designed, not inverted. Warm-paper generated art is faded
 *    into an ink field with a gradient scrim plus a light edge mask, so it reads
 *    as intentional rather than as a pale ghost at 9% opacity.
 * 3. One opacity rule does not fit every surface, so the strength is a prop.
 * 4. Only the hero is eager. Everything below the fold is lazy.
 * 5. WebP first with a JPEG fallback via <picture>, and explicit dimensions so
 *    the layout never shifts.
 */

export type ArtPlacement =
  /** Full-bleed cinematic field behind the hero, strongest treatment. */
  | 'hero'
  /** Quieter band behind an editorial section. */
  | 'section'
  /** Small closing motif, cropped hard. */
  | 'footer';

interface ArtLayerProps {
  /** Base name under /atkin/backgrounds/webp and /jpg. */
  name: string;
  placement: ArtPlacement;
  /** Intrinsic aspect ratio of the source, e.g. 1672 / 941. */
  aspect: number;
  /** Focal point so cropping never decapitates the subject. */
  objectPosition?: string;
  className?: string;
  alt?: string;
  /** Accessible name is only needed when the art carries meaning. */
  decorative?: boolean;
}

const PLACEMENT: Record<
  ArtPlacement,
  { eager: boolean; scrim: string; mask: string; strength: string }
> = {
  hero: {
    eager: true,
    // Light: warm paper wash from the left so the headline column stays clean.
    // Dark: ink scrim so the art sits behind the surface instead of glowing.
    scrim:
      'bg-gradient-to-r from-atkin-bg via-atkin-bg/85 to-atkin-bg/25 ' +
      'dark:from-atkin-bg dark:via-atkin-bg/88 dark:to-atkin-bg/45',
    // Fade the bottom edge into the page so there is no hard photographic seam.
    mask:
      '[mask-image:linear-gradient(to_bottom,black_55%,black_92%,transparent_100%)] ' +
      '[-webkit-mask-image:linear-gradient(to_bottom,black_55%,black_92%,transparent_100%)]',
    strength: 'opacity-[0.16] dark:opacity-[0.13]',
  },
  section: {
    eager: false,
    scrim:
      'bg-gradient-to-b from-atkin-bg/70 via-atkin-bg/80 to-atkin-bg ' +
      'dark:from-atkin-bg/75 dark:via-atkin-bg/85 dark:to-atkin-bg',
    mask:
      '[mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_78%)] ' +
      '[-webkit-mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_78%)]',
    strength: 'opacity-[0.10] dark:opacity-[0.09]',
  },
  footer: {
    eager: false,
    scrim: 'bg-gradient-to-t from-atkin-bg via-atkin-bg/70 to-transparent',
    mask:
      '[mask-image:linear-gradient(to_top,black_30%,transparent_85%)] ' +
      '[-webkit-mask-image:linear-gradient(to_top,black_30%,transparent_85%)]',
    strength: 'opacity-[0.09] dark:opacity-[0.08]',
  },
};

export const ArtLayer: React.FC<ArtLayerProps> = ({
  name,
  placement,
  aspect,
  objectPosition = 'center',
  className = '',
  alt = '',
  decorative = true,
}) => {
  const cfg = PLACEMENT[placement];
  const width = 1600;
  const height = Math.round(width / aspect);

  return (
    <div
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : alt}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <picture>
        <source
          type="image/webp"
          srcSet={`/atkin/backgrounds/webp/${name}.webp`}
        />
        <img
          src={`/atkin/backgrounds/jpg/${name}.jpg`}
          alt={decorative ? '' : alt}
          width={width}
          height={height}
          loading={cfg.eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={cfg.eager ? 'high' : 'auto'}
          style={{ objectPosition }}
          className={`h-full w-full object-cover ${cfg.strength} ${cfg.mask}`}
        />
      </picture>
      <div className={`absolute inset-0 ${cfg.scrim}`} />
    </div>
  );
};

/** Intrinsic aspect ratios of the shipped kit art, kept next to the component. */
export const ART_ASPECT = {
  courtroom: 1672 / 941,
  wideDocuments: 1916 / 821,
  collage: 1122 / 1402,
} as const;
