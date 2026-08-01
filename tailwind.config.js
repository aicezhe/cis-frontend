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
        // ── Дизайн-система «Маршрут» (src/components/path/*) ──────────────
        // Префикс rt-, потому что имена gold и navy уже заняты живой палитрой
        // LAURA/LOCI/онбординга — 32 файла вне PATH. Когда те разделы
        // мигрируют, префикс снимается, а старые токены удаляются
        // (см. MIGRATION-TODO.md).
        rt: {
          paper: '#F4F1EB', // фон страницы
          'paper-2': '#FBF9F5', // карточки и таббар
          ink: '#16253E', // основной текст, заголовки
          'ink-2': '#3E4B60', // текст в карточках
          'ink-3': '#5A6577', // мета, подписи
          gold: '#B08F4F', // линии, ромбы, номера
          'gold-ink': '#7E5F2A', // мелкий золотой текст (5.2:1 на paper)
          'gold-lite': '#D4B36A', // золото на тёмном
          'gold-soft': '#E2D6BA', // подложки терминов, рамки чипов
          navy: '#17283F', // тёмный блок, залитые ромбы
          'navy-2': '#0E1B2E', // нижняя точка градиента DarkBand
          line: '#DFD8CA', // разделители, границы
          // Текст на тёмном блоке. В референсе задан литералом #D9D3C6,
          // в палитре его не было — заводим токеном, чтобы не плодить хардкод.
          'on-navy': '#D9D3C6',
        },
        // Токены редизайна контентных страниц (src/components/content/*).
        // ЛЕГАСИ: заменяется системой «Маршрут», удалить после раскатки.
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
        // ── «Маршрут» ──
        display: ['Unbounded', 'system-ui', 'sans-serif'], // только h1 страницы
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'], // мета, номера
        gloss: ['"EB Garamond"', 'Georgia', 'serif'], // итальянские глоссы
        // Каллиграфическая заглавная «L» Лауры (аватарка, иконка таба,
        // первая буква приветствия). Только латиница — этого достаточно.
        script: ['"Great Vibes"', 'cursive'],
      },
    },
  },
  plugins: [],
};
