// Тонкие линейные иконки для 4 разделов Path.
// Стиль — как ParmaIcon: stroke-width 1.5, currentColor, без заливки.
// Виза оставлена как импорт из SVG-ассета (юзеру нравится её вид).

import iconVisaSrc from '../assets/iconVisa.svg';

type SectionId = 'uni' | 'visa' | 'travel' | 'parma';
type Props = { id: SectionId; className?: string };

const COMMON = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Wrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...COMMON}>
      {children}
    </svg>
  );
}

export function SectionIcon({ id, className = 'w-6 h-6 text-gold' }: Props) {
  switch (id) {
    case 'uni':
      // Классическая колоннада «университет» — крыша, 4 колонны, основание
      return (
        <Wrap className={className}>
          <path d="M2 8.5 L12 3.5 L22 8.5" />
          <line x1="3" y1="11" x2="21" y2="11" />
          <line x1="5" y1="11" x2="5" y2="18.5" />
          <line x1="10" y1="11" x2="10" y2="18.5" />
          <line x1="14" y1="11" x2="14" y2="18.5" />
          <line x1="19" y1="11" x2="19" y2="18.5" />
          <line x1="2.5" y1="20.5" x2="21.5" y2="20.5" />
        </Wrap>
      );

    case 'visa':
      // Виза — оставляем исходный SVG-ассет (юзер просил его не менять).
      // Размеры подгоняем через className, цвет нельзя задать снаружи у raster-style SVG.
      return (
        <img
          src={iconVisaSrc}
          alt=""
          className={className}
          // currentColor у внешнего SVG не подхватится — игнорируем text-* классы для цвета
        />
      );

    case 'travel':
      // Самолёт-силуэт (контурный, без заливки)
      return (
        <Wrap className={className}>
          <path d="M21 14 L13 11 L13 5.5 a1.2 1.2 0 0 0 -2.4 0 L10.6 11 L3 14 L3 16 L10.6 14.6 L10.6 18.5 L8.6 19.6 L8.6 21 L12 20.2 L15.4 21 L15.4 19.6 L13.4 18.5 L13.4 14.6 L21 16 Z" />
        </Wrap>
      );

    case 'parma':
      // Силуэт города: купол кафедрального собора Пармы + колокольня + здание
      return (
        <Wrap className={className}>
          {/* левое здание */}
          <rect x="3" y="13" width="5" height="8" />
          <line x1="5" y1="16" x2="5" y2="16" />
          <line x1="5.5" y1="18" x2="5.5" y2="18.01" />
          {/* центральный собор с куполом */}
          <path d="M9 21 L9 12 a3 3 0 0 1 6 0 L15 21 Z" />
          <path d="M12 9 V 11" />
          <circle cx="12" cy="8" r="0.6" />
          {/* колокольня справа */}
          <rect x="16" y="9" width="3.5" height="12" />
          <path d="M16 9 L17.75 6.5 L19.5 9 Z" />
        </Wrap>
      );

    default:
      return (
        <Wrap className={className}>
          <circle cx="12" cy="12" r="9" />
        </Wrap>
      );
  }
}
