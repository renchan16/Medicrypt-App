/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1C1C41',
        'primary-light': '#2c2c66',
        'primary-lighter': '#474791',
        white:'#FFFFFF',
      },
    },
  },
  plugins: [],
}