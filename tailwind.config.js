/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0a0c10',
          900: '#0f1216',
          800: '#151920',
          700: '#1c212b',
          600: '#262c38',
        },
        midnight: {
          900: '#0b1224',
          800: '#101a33',
        },
        cyan: {
          accent: '#4ee8ff',
          soft: '#8ff2ff',
        },
        lavender: {
          DEFAULT: '#a9a6ff',
          soft: '#c7c5ff',
        },
        violet: {
          DEFAULT: '#7c6cf0',
        },
        magenta: {
          DEFAULT: '#e558c9',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(78, 232, 255, 0.15)',
        'glow-lg': '0 0 80px rgba(78, 232, 255, 0.18)',
        violetGlow: '0 0 40px rgba(124, 108, 240, 0.2)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at 50% 0%, rgba(78,232,255,0.08), transparent 60%)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.04)' },
        },
        drift: {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(4px,-6px)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        pulseSlow: 'pulseSlow 3.5s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
