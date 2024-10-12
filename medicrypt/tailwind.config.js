/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        avantGarde: ['AvantGardeGothic', 'sans-serif'],
      },
      colors: {
        primary: '#1e63dc', //encrypt
        primary0: '#1644b3', //text in Explore
        primary1: '#1583fe', 
        primary2: '#1645b4', 
        primary3: '#1644b3', //Instructions Blue
        secondary: '#102a6b', 
        secondary1: '#103d8b', 
        black: '#1d1d1f', 
        white: '#F0F4F8', 
        background:'#1583fe',
      },
      fontSize: {
        'xxs': '0.60rem', 
      },
    },
  },
  plugins: [],
}
