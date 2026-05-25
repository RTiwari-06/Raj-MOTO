/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#282C20',
        darker: '#1C1F15',
        black: '#111112',
        light: '#EFEEE6',
        mid: '#3D4233',
        accent: '#D2FF00',
        muted: '#888880',
      },
      fontFamily: {
        sans:  ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['160px', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        'display-lg': ['120px', { lineHeight: '0.90', letterSpacing: '-0.04em' }],
        'display-md': ['80px',  { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-sm': ['60px',  { lineHeight: '0.94', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        'tight-cap': '-0.04em',
      },
    },
  },
  plugins: [],
}
