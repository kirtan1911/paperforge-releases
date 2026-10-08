/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#14161B',
        paper: '#F6F3EC',
        brandOrange: '#E5681A',
      },
    },
  },
  plugins: [],
};
