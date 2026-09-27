/** @type {import('tailwindcss').Config} */
export default {
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
