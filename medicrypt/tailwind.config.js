/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A1F44', // Dark navy blue for trust and professionalism
        primary0: '#102A55', // Slightly lighter blue for backgrounds or accents
        primary1: '#0E7490', // Medium cyan-blue for active elements
        primary2: '#1C2D3E', // Dark grayish blue for deeper accents
        primary3: '#162337', // Even darker blue for shadows or highlights
        secondary: '#00CC88', // Bright green for success indicators (secure, encrypted)
        secondary1: '#99FFC2', // Light green for subtle accents
        black: '#131517', // Very dark gray for text or icons
        white: '#F0F4F8', // Off-white for contrast with dark elements
      },
      fontSize: {
        'xxs': '0.75rem', // Slightly smaller for very subtle text
      },
    },
  },
  plugins: [],
}
