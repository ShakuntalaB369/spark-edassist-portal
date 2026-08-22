/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-dark': 'var(--background)',
        'panel-bg': 'var(--surface)',
        'panel-border': 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'foundational': 'var(--primary)',
        'foundational-glow': 'var(--primary-glow)',
        'applied': 'var(--success)',
        'applied-glow': 'var(--success-glow)',
        'collaborative': 'var(--primary)',
        'collaborative-glow': 'var(--primary-glow)',
        'reflective': 'var(--accent)',
        'reflective-glow': 'var(--accent-glow)',
        'primary': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'accent': 'var(--accent)',
        'success': 'var(--success)',
      },
      fontFamily: {
        heading: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        body: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'float-flower': 'floatFlower 6s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        floatFlower: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
