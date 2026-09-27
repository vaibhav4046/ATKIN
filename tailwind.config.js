/** @type {import('tailwindcss').Config} */

// The palette below is aliased onto the ATKIN design tokens rather than left as
// stock Tailwind values. Two reasons, both learned the hard way:
//
// 1. `darkMode` was unset, so it defaulted to the `media` strategy. That keys the
//    `dark:` variants off the OS preference while the product's own toggle sets
//    `data-theme` and a `.dark` class. The two fought each other: on a light-mode
//    machine the toggle flipped the CSS variables but left every `dark:` override
//    inert, and on a dark-mode machine the overrides stayed on after switching to
//    light. `class` makes the variants follow the product's own toggle.
//
// 2. Roughly 400 class usages predate the token system and name stock Tailwind
//    colours (`bg-white`, `text-slate-800`, `bg-stone-100`, ...). Those are
//    light-mode values, so in dark mode they painted light cards and dark-grey
//    text on a near-black page. Aliasing the families to the tokens fixes every
//    existing usage in both themes at once, instead of hand-editing hundreds of
//    class strings and missing some.
//
// Mapping is by role, not by hue: 50-100 are raised surfaces, 200-300 are
// recessed surfaces and hairlines, 400-600 are secondary ink, 700-900 is primary
// ink. That preserves the light theme's appearance (the tokens are the same
// palette it already used) while making the dark theme follow the same hierarchy.
const inkScale = (token) => ({ 50: token, 100: token, 200: token, 300: token });

export default {
  // Follows the product's own toggle (theme.ts sets `.dark` on <html>), not the OS.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atkin: {
          bg: 'var(--atkin-bg)',
          'bg-subtle': 'var(--atkin-bg-subtle)',
          surface: 'var(--atkin-surface)',
          'surface-raised': 'var(--atkin-surface-raised)',
          paper: 'var(--atkin-paper)',
          ink: 'var(--atkin-ink)',
          'ink-secondary': 'var(--atkin-ink-secondary)',
          muted: 'var(--atkin-muted)',
          border: 'var(--atkin-border)',
          'border-strong': 'var(--atkin-border-strong)',
          focus: 'var(--atkin-focus)',
          success: 'var(--atkin-success)',
          warning: 'var(--atkin-warning)',
          danger: 'var(--atkin-danger)',
        },
        // `gallery-*` was used in 208 places but never defined here, so every one
        // of those classes emitted no CSS at all and the elements fell back to
        // whatever was behind them. In dark mode that is why cards and page
        // backgrounds read as inconsistent. Mapped to the surface hierarchy so
        // they now resolve, and flip with the theme.
        gallery: {
          paper: 'var(--atkin-paper)',
          white: 'var(--atkin-surface)',
          mist: 'var(--atkin-bg-subtle)',
        },
        // 5-tier surface hierarchy mapped to tokens
        canvas: {
          DEFAULT: 'var(--atkin-bg)',
          subtle: 'var(--atkin-bg-subtle)',
          paper: 'var(--atkin-paper)',
        },
        surface: {
          base: 'var(--atkin-surface)',
          recessed: 'var(--atkin-bg-subtle)',
          panel: 'var(--atkin-surface)',
          elevated: 'var(--atkin-surface-raised)',
          hover: 'var(--atkin-bg-subtle)',
          selected: 'var(--atkin-bg-subtle)',
        },
        // Restrained, semantic legal borders
        border: {
          hairline: 'var(--atkin-border)',
          subtle: 'var(--atkin-border)',
          strong: 'var(--atkin-border-strong)',
          focus: 'var(--atkin-focus)',
          control: 'var(--atkin-border)',
        },
        // Dignified ink hierarchy
        ink: {
          DEFAULT: 'var(--atkin-ink)',
          light: 'var(--atkin-ink-secondary)',
          slate: 'var(--atkin-muted)',
          steel: 'var(--atkin-muted)',
          muted: 'var(--atkin-muted)',
        },

        // --- stock palette aliased onto the tokens (see header comment) ---
        white: 'var(--atkin-surface)',
        stone: {
          ...inkScale('var(--atkin-bg-subtle)'),
          400: 'var(--atkin-border-strong)',
          500: 'var(--atkin-muted)',
          600: 'var(--atkin-ink-secondary)',
          700: 'var(--atkin-ink-secondary)',
          800: 'var(--atkin-ink)',
          850: 'var(--atkin-ink)',
          900: 'var(--atkin-ink)',
          950: 'var(--atkin-ink)',
        },
        slate: {
          ...inkScale('var(--atkin-bg-subtle)'),
          400: 'var(--atkin-border-strong)',
          500: 'var(--atkin-muted)',
          600: 'var(--atkin-ink-secondary)',
          700: 'var(--atkin-ink-secondary)',
          800: 'var(--atkin-ink)',
          850: 'var(--atkin-ink)',
          900: 'var(--atkin-ink)',
          950: 'var(--atkin-ink)',
        },
        zinc: {
          300: 'var(--atkin-border)',
          700: 'var(--atkin-ink-secondary)',
          800: 'var(--atkin-ink)',
        },

        // Accent families, aliased for the same reason as stone/slate above. The
        // shade that reads as "blue text" in light mode (700) is unreadable on the
        // dark surface, and roughly half the call sites already carried a manual
        // `dark:` override while the rest did not, which is what made dark mode
        // look inconsistent page to page. Aliasing by role fixes both halves at
        // once and keeps the existing `dark:` overrides harmless.
        //
        // The deep shades matter as much as the mid ones: `text-amber-950` on a
        // near-black surface measured 1.2:1, which is effectively invisible text.
        // Every shade a caller can reach is mapped, so no accent text can land on
        // an unreadable value regardless of which shade the call site picked.
        blue: {
          50: 'var(--atkin-tint)',
          100: 'var(--atkin-tint)',
          200: 'var(--atkin-tint-border)',
          400: 'var(--atkin-accent-text)',
          700: 'var(--atkin-accent-text)',
          800: 'var(--atkin-accent-text-strong)',
          900: 'var(--atkin-accent-text-strong)',
        },
        emerald: {
          50: 'var(--atkin-tint)',
          100: 'var(--atkin-tint)',
          200: 'var(--atkin-tint-border)',
          300: 'var(--atkin-tint-border)',
          400: 'var(--atkin-positive-text)',
          700: 'var(--atkin-positive-text)',
          800: 'var(--atkin-positive-text)',
          900: 'var(--atkin-positive-text)',
          950: 'var(--atkin-positive-text)',
        },
        amber: {
          50: 'var(--atkin-tint)',
          100: 'var(--atkin-tint)',
          200: 'var(--atkin-tint-border)',
          300: 'var(--atkin-tint-border)',
          400: 'var(--atkin-caution-text)',
          700: 'var(--atkin-caution-text)',
          800: 'var(--atkin-caution-text)',
          900: 'var(--atkin-caution-text)',
          950: 'var(--atkin-caution-text)',
        },
        rose: {
          50: 'var(--atkin-tint)',
          200: 'var(--atkin-tint-border)',
          300: 'var(--atkin-tint-border)',
          400: 'var(--atkin-danger)',
          600: 'var(--atkin-danger)',
          700: 'var(--atkin-danger)',
          800: 'var(--atkin-danger)',
          900: 'var(--atkin-danger)',
        },
      },
      // Restrained, semantic radius scale
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        'pill': '9999px',
        'card': '8px',
        'full-pill': '9999px',
        'nav': '8px',
      },
      fontFamily: {
        sans: [
          '"Instrument Sans"',
          '"IBM Plex Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        serif: [
          'Newsreader',
          'Charter',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif'
        ],
        editorial: [
          'Newsreader',
          'Charter',
          'Georgia',
          'serif'
        ],
        mono: [
          '"IBM Plex Mono"',
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        none: 'none',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'subtle-hover': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        modal: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        stage: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
