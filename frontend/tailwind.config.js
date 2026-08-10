/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // KSU brand blue
        ksu: {
          blue:     '#0089C4',
          blueDark: '#006E9E',
          blueTint: '#E6F4FA',
        },
        // Availability palette — semantic status colors, do not use for brand chrome
        'avail-green':  '#22c55e',
        'avail-yellow': '#f59e0b',
        'avail-red':    '#ef4444',
      },
    },
  },
  plugins: [],
};
