// Монохромные золотые флаги для переключателя валюты.
//
// Эмодзи-флаги рендерятся системным шрифтом: на macOS цветные и «чужие»
// по стилю, на части Android вообще показываются буквами страны. Рисуем
// сами — одним цветом (currentColor), чтобы вписывались в палитру navy/gold
// и одинаково выглядели на всех устройствах.
//
// Цвет полос передаём не оттенками gold, а прозрачностью: так значок
// читается и на кремовой карточке, и на тёмно-синей активной.

import type { CurrencyCode } from '../config/currencies';

const VIEWBOX = '0 0 24 16';

// Рамка флага — общая для всех, чтобы значки стояли в одну сетку
function Frame() {
  return <rect x="0.6" y="0.6" width="22.8" height="14.8" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />;
}

// Орнаментальная полоса у древка (Беларусь, Казахстан) — ромбы
function Ornament({ x }: { x: number }) {
  return (
    <g fill="currentColor" opacity="0.9">
      {[3.4, 8, 12.6].map((cy) => (
        <path key={cy} d={`M${x} ${cy - 1.5} L${x + 1.5} ${cy} L${x} ${cy + 1.5} L${x - 1.5} ${cy} Z`} />
      ))}
    </g>
  );
}

const FLAGS: Record<CurrencyCode, JSX.Element> = {
  // ЕС: круг из двенадцати звёзд. На 24×16 полноценные пятиконечные звёзды
  // превращаются в кашу, поэтому точки — читаются как тот самый круг.
  EUR: (
    <>
      <Frame />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        return <circle key={i} cx={12 + Math.cos(a) * 4.6} cy={8 + Math.sin(a) * 4.6} r="0.85" fill="currentColor" />;
      })}
    </>
  ),

  // Россия: три горизонтальные полосы, вес растёт сверху вниз
  RUB: (
    <>
      <Frame />
      <rect x="1.2" y="5.9" width="21.6" height="4.2" fill="currentColor" opacity="0.35" />
      <rect x="1.2" y="10.1" width="21.6" height="4.7" fill="currentColor" opacity="0.75" />
    </>
  ),

  // Украина: две полосы, верхняя тяжелее
  UAH: (
    <>
      <Frame />
      <rect x="1.2" y="1.2" width="21.6" height="6.8" fill="currentColor" opacity="0.5" />
    </>
  ),

  // Беларусь: орнаментальная полоса у древка + две полосы поля
  BYN: (
    <>
      <Frame />
      <rect x="6.2" y="1.2" width="16.6" height="8.3" fill="currentColor" opacity="0.6" />
      <rect x="6.2" y="9.5" width="16.6" height="5.3" fill="currentColor" opacity="0.22" />
      <Ornament x={3.7} />
    </>
  ),

  // Казахстан: солнце с лучами и парящий орёл под ним, орнамент у древка
  KZT: (
    <>
      <Frame />
      <rect x="5.6" y="1.2" width="17.2" height="13.6" fill="currentColor" opacity="0.16" />
      <Ornament x={3.4} />
      <circle cx="14.2" cy="6.2" r="2.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="0.85" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={14.2 + Math.cos(a) * 3.1}
              y1={6.2 + Math.sin(a) * 3.1}
              x2={14.2 + Math.cos(a) * 4}
              y2={6.2 + Math.sin(a) * 4}
            />
          );
        })}
      </g>
      <path
        d="M9.6 12.9 Q12.2 10.9 14.2 12.4 Q16.2 10.9 18.8 12.9"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
};

export function FlagIcon({ code, className = '' }: { code: CurrencyCode; className?: string }) {
  return (
    <svg
      viewBox={VIEWBOX}
      width="24"
      height="16"
      className={'shrink-0 ' + className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {FLAGS[code]}
    </svg>
  );
}
