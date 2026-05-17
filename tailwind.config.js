/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EDE0',
        'soft-cream': '#FBF6EC',
        navy: '#1A2438',
        brick: '#8B4A2F',
        gold: '#9B8550',
        green: '#7A9B5A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
