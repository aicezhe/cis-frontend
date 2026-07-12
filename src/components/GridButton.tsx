import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { longPressHandlers } from '../lib/longPress';
import { scatterIcons } from '../lib/scatterIcons';

// Широкая невысокая плитка-кнопка: внутри рамки раскидано несколько мелких
// копий иконки разного размера — мерцают, дрейфуют, слегка пульсируют
// (та же анимация, что звёзды на Welcome). Подпись — под рамкой.
// onLongPress открывает произвольное действие (например, форму расхода).
export function GridButton({
  icon: Icon, title, to, seed, onLongPress,
}: {
  icon: LucideIcon; title: string; to: string; seed: number; onLongPress?: () => void;
}) {
  const navigate = useNavigate();
  const icons = scatterIcons(seed, 11);
  return (
    <button
      onClick={() => navigate(to)}
      className="flex flex-col items-center gap-1.5 select-none"
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
