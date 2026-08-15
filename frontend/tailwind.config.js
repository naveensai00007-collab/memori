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
          DEFAULT: '#1A1A2E',
          light: '#3D3D5C',
          dark: '#121220',
        },
        accent: {
          DEFAULT: '#E8A87C',
          dark: '#C4845A',
          light: '#F4CBB2',
        },
        status: {
          complete: '#7BAF8D',
          missing: '#D4A5A5',
          attention: '#E8B86D',
          na: '#9CA3AF',
        },
        memori: {
          text: '#1E1E2A',
          secondary: '#4A4A5A',
          tertiary: '#8A8A9A',
          bg: '#F7F5F0',
          surface: '#FFFFFF',
          border: '#E4E2DC',
          error: '#B0414A',
          offline: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '24px',
        'space-6': '32px',
        'space-7': '48px',
        'space-8': '64px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 26, 46, 0.08)',
        'card-hover': '0 4px 12px rgba(26, 26, 46, 0.12)',
        'modal': '0 10px 30px rgba(26, 26, 46, 0.20)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'input': '8px',
        'badge': '12px',
        'modal': '20px',
      },
    },
  },
  plugins: [],
};
