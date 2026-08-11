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
// чтобы не висела одиноко слева «крестиком»). На десктопе сетка трёхколоночная,
// и растяжка гасится: считать её должна была бы страница (там length % 2), а
// при трёх колонках эта арифметика врёт — последняя плитка заняла бы две
// колонки из трёх посреди ряда. Неполный последний ряд в сетке 3×N выглядит
// нормально сам по себе, костыль там просто не нужен.
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
        (wide ? ' col-span-2 md:col-span-1' : '')
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
