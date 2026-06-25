/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0EA',
        'cream-dark': '#EDE8E0',
        orange: { DEFAULT: '#C4601A', light: '#D4784A', pale: '#F0D5C0' },
        brown: '#7A3B1E',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
