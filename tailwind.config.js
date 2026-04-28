/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--c-bg-base) / <alpha-value>)',
        card: 'rgb(var(--c-bg-card) / <alpha-value>)',
        panel: 'rgb(var(--c-bg-panel) / <alpha-value>)',
        btn: 'rgb(var(--c-bg-btn) / <alpha-value>)',
        'btn-hover': 'rgb(var(--c-bg-btn-hover) / <alpha-value>)',
        border: 'rgb(var(--c-border) / <alpha-value>)',
        'border-strong': 'rgb(var(--c-border-strong) / <alpha-value>)',
        text: 'rgb(var(--c-text) / <alpha-value>)',
        muted: 'rgb(var(--c-text-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-text-faint) / <alpha-value>)',
        drama: {
          low: '#22c55e',    // green-500
          mid: '#f59e0b',    // amber-500
          high: '#ef4444',   // red-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
