/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#121316',
          light: '#282A30',
          dark: '#08080A',
        },
        accent: {
          DEFAULT: '#D18C59',
          dark: '#B06F3F',
          light: '#EED9C7',
        },
        status: {
          complete: '#2D5A43',
          missing: '#8C3B3B',
          attention: '#8A5A2B',
          na: '#66655E',
        },
        memori: {
          text: '#121316',
          secondary: '#55544E',
          tertiary: '#8C8A82',
          bg: '#FBF9F5',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F3EFEA',
          border: '#E5E0D8',
          borderHover: '#D6CFBF',
          error: '#8C3B3B',
          offline: '#55544E',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(18, 19, 22, 0.04)',
        'card': '0 1px 3px rgba(18, 19, 22, 0.05), 0 1px 2px rgba(18, 19, 22, 0.03)',
        'card-hover': '0 6px 16px -4px rgba(18, 19, 22, 0.08), 0 2px 4px -2px rgba(18, 19, 22, 0.04)',
        'modal': '0 20px 40px -12px rgba(18, 19, 22, 0.16), 0 0 0 1px rgba(18, 19, 22, 0.06)',
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'input': '8px',
        'badge': '6px',
        'modal': '16px',
      },
    },
  },
  plugins: [],
};
