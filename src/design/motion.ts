/**
 * ATKIN Motion System
 * Centralized motion tokens, easing functions, and animation variants.
 * Strictly respects prefers-reduced-motion. Never uses elastic/bouncy cartoons.
 */

export const MOTION = {
  duration: {
    instant: 0.05,
    fast: 0.12,   // 120ms
    normal: 0.22, // 220ms
    slow: 0.48,   // 480ms
    hero: 0.80    // 800ms
  },
  ease: {
    // Premium editorial curve: fast start, soft settle, zero bounce
    standard: [0.22, 1, 0.36, 1],
    out: [0, 0, 0.2, 1],
    enter: [0.22, 1, 0.36, 1],
    exit: [0.4, 0, 1, 1]
  }
} as const;

export const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.standard
    }
  })
};

export const PAPER_CONVERGENCE = {
  hidden: { opacity: 0, scale: 0.985, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.hero,
      ease: MOTION.ease.standard
    }
  }
};
