/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0162E2',
        primary1: '#21316F',
        primary2: '#21316f40',
        secondary: '#60C6E4',
        secondary1: '#CBE2F5',
        black: '#1D1B20',
        white: '#D4D4D4',
      },
      fontSize: {
        'xxs': '0.8rem',
      },
    },
  },
  plugins: [],
}
