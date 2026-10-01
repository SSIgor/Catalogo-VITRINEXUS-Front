/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Space Grotesk', 'sans-serif'] },
      colors: { ink: '#17211f', teal: '#0f766e', mint: '#dff7ed', coral: '#f9735b', paper: '#f8faf8' },
    },
  },
  plugins: [],
}
