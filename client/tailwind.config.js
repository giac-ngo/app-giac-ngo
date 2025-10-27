/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-light': 'var(--color-primary-light)',
        'primary-text': 'var(--color-primary-text)',
        'text-on-primary': 'var(--color-text-on-primary)',
        'accent-red': 'var(--color-accent-red)',
        'accent-red-hover': 'var(--color-accent-red-hover)',
        'accent-green': 'var(--color-accent-green)',
        'accent-yellow': 'var(--color-accent-yellow)',
        'text-main': 'var(--color-text-main)',
        'text-light': 'var(--color-text-light)',
        'background-main': 'var(--color-background-main)',
        'background-light': 'var(--color-background-light)',
        'background-panel': 'var(--color-background-panel)',
        'border-color': 'var(--color-border-color)',
        'background-ai-bubble': 'var(--color-background-ai-bubble)',
        'text-on-ai-bubble': 'var(--color-text-on-ai-bubble)',
      },
      animation: {
        'fade-in-right': 'fadeInRight 0.5s ease-out forwards',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      }
    },
  },
  plugins: [],
}