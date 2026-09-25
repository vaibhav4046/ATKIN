/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 5-tier surface hierarchy: canvas -> surface-1 -> surface-2 -> surface-recessed -> surface-elevated
        canvas: {
          DEFAULT: '#f8f9fa',
          subtle: '#f1f3f5',
          paper: '#ffffff',
        },
        surface: {
          base: '#ffffff',
          recessed: '#f1f3f5',
          panel: '#ffffff',
          elevated: '#ffffff',
          hover: '#f8fafc',
          selected: '#f1f5f9',
        },
        // Restrained, semantic legal borders
        border: {
          hairline: '#e2e4e8',
          subtle: '#ebecee',
          strong: '#cbd5e1',
          focus: '#1d4ed8',
          control: '#d8dade',
        },
        // Dignified ink hierarchy
        ink: {
          DEFAULT: '#0f172a',    // Deep slate black
          light: '#1e293b',      // Heading ink
          slate: '#475569',      // Body text
          steel: '#64748b',      // Secondary metadata
          muted: '#94a3b8',      // Tertiary labels
        },
        // Domain-specific legal palette (No neon, no random rainbow)
        proofline: {
          blue: '#1d4ed8',       // Scholarly cobalt (Primary law, citations, primary actions)
          navy: '#0f2744',       // Deep English navy
          ochre: '#9a3412',      // Deep amber/ochre (Adverse records, contradictions)
          green: '#166534',      // British forest green (Verified admissibility, CEA s.9)
          crimson: '#991b1b',    // Deep crimson (Prompt injection quarantine, critical risks)
          amber: '#b45309',      // Warning/caution
        }
      },
      // Restrained, semantic radius scale (Rule 19: No 28px or pill everywhere)
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        'pill': '9999px',
        // Legacy aliases mapped to restrained radius for backward compatibility
        'card': '8px',
        'full-pill': '9999px',
        'nav': '8px',
      },
      fontFamily: {
        sans: [
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
