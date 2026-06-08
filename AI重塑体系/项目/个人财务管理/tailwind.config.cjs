/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#effdf7',
          100: '#d8f8ea',
          200: '#b7efd9',
          300: '#82e1be',
          400: '#42c99a',
          500: '#20ad80',
          600: '#148b68',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 118, 110, 0.12)',
      },
    },
  },
  plugins: [],
};
