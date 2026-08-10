/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // KSU brand green
        'ksu-green': '#006633',
        'ksu-green-light': '#008844',
        // Availability palette
        'avail-green':  '#22c55e',
        'avail-yellow': '#f59e0b',
        'avail-red':    '#ef4444',
      },
    },
  },
  plugins: [],
};
