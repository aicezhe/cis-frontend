/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F4F1E9',
        'soft-cream': '#FEFBF3',
        navy: '#1C2A48',
        gold: '#B89968',
        // Токены редизайна контентных страниц (src/components/content/*).
        // Отдельный неймспейс, чтобы не задеть остальные экраны.
        content: {
          bg: '#F3EFE4',
          surface: '#FBF9F2',
          navy: '#1D2B4A',
          gold: '#A98950',
          'gold-bg': '#F0E8D6',
          ink: '#23262E',
          'ink-2': '#61646C',
          line: '#E2DCCB',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        golos: ['"Golos Text"', '-apple-system', 'sans-serif'],
        // Каллиграфическая заглавная «L» Лауры (аватарка, иконка таба,
        // первая буква приветствия). Только латиница — этого достаточно.
        script: ['"Great Vibes"', 'cursive'],
      },
    },
  },
  plugins: [],
};
