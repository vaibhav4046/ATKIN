/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gallery: {
          white: '#ffffff',
          mist: '#f5f5f7',
          paper: '#fafafc',
        },
        border: {
          hairline: '#d6d6d6',
          control: '#e6e6e8',
        },
        ink: {
          DEFAULT: '#1d1d1f',
          slate: '#707070',
          steel: '#86868b',
        },
        proofline: {
          blue: '#0071e3',
          navy: '#0066cc',
          ochre: '#b64400',
          green: '#2e7d32',
        }
      },
      borderRadius: {
        'card': '28px',
        'pill': '36px',
        'full-pill': '9999px',
        'nav': '20px',
      },
      fontFamily: {
        sans: [
          'SF Pro Text',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        editorial: [
          'New York',
          'Georgia',
          'Cambria',
          'serif'
        ]
      },
      boxShadow: {
        subtle: 'rgb(230, 230, 232) 0px 0px 0px 1px',
        'subtle-hover': 'rgb(214, 214, 214) 0px 0px 0px 1px, 0 4px 12px rgba(0, 0, 0, 0.04)',
        stage: '0 24px 60px -12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
