// Минималистичные SVG-иконки для подразделов «В Парме».
// Тонкая навайная обводка, без заливки — в стилистике остальных иконок приложения.

type Props = { id: string; className?: string };

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

export function ParmaIcon({ id, className = 'w-7 h-7 text-navy/70' }: Props) {
  switch (id) {
    case 'cie':
      return (
        <Wrap className={className}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <circle cx="8" cy="11" r="2" />
          <path d="M6 16h4" />
          <path d="M13 10h6" />
          <path d="M13 13h4" />
        </Wrap>
      );

    case 'spid':
      return (
        <Wrap className={className}>
          <circle cx="8" cy="12" r="4" />
          <path d="M12 12h9" />
          <path d="M17 12v3" />
          <path d="M20 12v2" />
        </Wrap>
      );

    case 'tessera_sanitaria':
      return (
        <Wrap className={className}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M12 9v6" />
          <path d="M9 12h6" />
        </Wrap>
      );

    case 'work':
      return (
        <Wrap className={className}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </Wrap>
      );

    case 'ergo_foundation':
      return (
        <Wrap className={className}>
          <path d="M19 6a8 8 0 1 0 0 12" />
          <path d="M4 10h10" />
          <path d="M4 14h10" />
        </Wrap>
      );

    case 'fy_to_bachelor':
      return (
        <Wrap className={className}>
          <path d="M2 10l10-5 10 5-10 5z" />
          <path d="M6 12.5V18c1.5 1.3 3.7 2 6 2s4.5-.7 6-2v-5.5" />
          <path d="M22 10v5" />
        </Wrap>
      );

    case 'transport':
      return (
        <Wrap className={className}>
          <rect x="4" y="4" width="16" height="13" rx="2" />
          <path d="M4 11h16" />
          <path d="M7 17v2" />
          <path d="M17 17v2" />
          <circle cx="8" cy="14" r="0.6" fill="currentColor" />
          <circle cx="16" cy="14" r="0.6" fill="currentColor" />
        </Wrap>
      );

    case 'language_sport':
      return (
        <Wrap className={className}>
          <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4H5a2 2 0 0 1-2-2z" />
          <path d="M7 9h7" />
          <path d="M7 12h4" />
        </Wrap>
      );

    case 'erasmus':
      return (
        <Wrap className={className}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9" />
          <path d="M12 3c-2.5 2.5-4 5.6-4 9s1.5 6.5 4 9" />
        </Wrap>
      );

    case 'social_life':
      return (
        <Wrap className={className}>
          <path d="M12 3l1.6 4.8L18.5 9l-4.9 1.2L12 15l-1.6-4.8L5.5 9l4.9-1.2z" />
          <path d="M18 16l.9 2.5L21 19l-2.1.5L18 22l-.9-2.5L15 19l2.1-.5z" />
        </Wrap>
      );

    case 'support':
      return (
        <Wrap className={className}>
          <path d="M20.8 5.6a5.4 5.4 0 0 0-7.7 0L12 6.7l-1.1-1.1a5.4 5.4 0 1 0-7.7 7.7L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.7z" />
        </Wrap>
      );

    case 'shops_services':
      // Корзина покупателя
      return (
        <Wrap className={className}>
          <path d="M3 5h2l2.5 11.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6" />
          <circle cx="10" cy="20.5" r="1" />
          <circle cx="17" cy="20.5" r="1" />
        </Wrap>
      );

    case 'sim_operators':
      // Сотовый телефон с сигналом
      return (
        <Wrap className={className}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <line x1="11" y1="18" x2="13" y2="18" />
          <path d="M19 8l1.5 1.5a4 4 0 0 1 0 5L19 16" />
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
