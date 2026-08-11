import { useNavigate } from 'react-router-dom';
import { longPressHandlers } from '../lib/longPress';
import { scatterIcons } from '../lib/scatterIcons';

// Любой компонент-иконка, принимающий className/style/strokeWidth —
// подходят как lucide-react иконки, так и кастомные (например ParmaIcon
// через parmaIconComponent).
type IconComponent = React.ComponentType<{
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: string | number;
}>;

// Широкая невысокая плитка-кнопка: внутри рамки раскидано несколько мелких
// копий иконки разного размера — мерцают, дрейфуют, слегка пульсируют
// (та же анимация, что звёзды на Welcome). Подпись — под рамкой.
// onLongPress открывает произвольное действие (например, форму расхода).
// wide — растянуть плитку на 2 колонки (для последней при нечётном числе,
// чтобы не висела одиноко слева «крестиком»). Это про телефон: там контейнер
// grid из двух колонок. На десктопе контейнер переключается на flex-wrap,
// col-span там просто не действует, а растяжка и не нужна — неполный ряд
// центрируется сам.
//
// Ширина на десктопе — треть за вычетом двух зазоров gap-x-5 (2 × 20px).
// 2.6rem вместо ровных 2.5rem — запас в пару пикселей: при точном совпадении
// суммы со 100% браузер иногда переносит третью плитку на новую строку.
const DESKTOP_BASIS = ' md:basis-[calc((100%_-_2.6rem)/3)] md:grow-0';

export function GridButton({
  icon: Icon, title, to, seed, onLongPress, wide,
}: {
  icon: IconComponent; title: string; to: string; seed: number; onLongPress?: () => void; wide?: boolean;
}) {
  const navigate = useNavigate();
  const icons = scatterIcons(seed, 11);
  return (
    <button
      onClick={() => navigate(to)}
      className={
        'flex flex-col items-center gap-1.5 select-none' +
        DESKTOP_BASIS +
        (wide ? ' col-span-2' : '')
      }
      style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
      {...(onLongPress ? longPressHandlers(onLongPress) : {})}
    >
      <div className="relative w-full h-20 rounded-xl border-2 border-gold/50 bg-soft-cream overflow-hidden">
        {icons.map((ic, i) => (
          <Icon
            key={i}
            className="tile-icon text-gold"
            strokeWidth={1.5}
            style={{ top: ic.top, left: ic.left, width: ic.size, height: ic.size, ...ic.style }}
          />
        ))}
      </div>
      <span className="font-serif text-navy text-xs font-bold text-center leading-tight">{title}</span>
    </button>
  );
}
