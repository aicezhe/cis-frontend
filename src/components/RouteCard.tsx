import { Bus, Car, Plane, TrainFront, TriangleAlert } from 'lucide-react';
import type { LociRoute } from '../types/relocation';

// SVG вместо эмодзи-транспорта — в стилистике остальных иконок приложения.
function ModeIcon({ mode }: { mode: string }) {
  const cls = 'w-4 h-4 text-gold flex-shrink-0';
  switch (mode) {
    case 'plane':
      return <Plane className={cls} strokeWidth={1.75} />;
    case 'train':
      return <TrainFront className={cls} strokeWidth={1.75} />;
    case 'bus':
      return <Bus className={cls} strokeWidth={1.75} />;
    case 'car':
      return <Car className={cls} strokeWidth={1.75} />;
    case 'plane_or_bus':
      return (
        <span className="flex items-center gap-0.5">
          <Plane className={cls} strokeWidth={1.75} />
          <Bus className={cls} strokeWidth={1.75} />
        </span>
      );
    default:
      return null;
  }
}

// Карточка маршрута с цепочкой точек-транспорта (тёмно-синяя, с золотым
// финишем «Парма») — единственное место, где показываются маршруты переезда.
export function RouteCard({ route }: { route: LociRoute }) {
  const danger = route.requires_permit;

  return (
    <div
      className={'rounded-2xl p-4 ' + (danger ? 'border' : 'border border-navy/20')}
      style={{
        backgroundColor: danger ? 'rgba(140, 100, 55, 0.12)' : '#1C2A48',
        borderColor: danger ? 'rgba(196, 160, 108, 0.45)' : undefined,
      }}
    >
      <p className="font-serif text-cream text-lg">{route.name_ru}</p>

      {route.warning_ru && (
        <p className="font-serif text-xs mt-1 font-bold flex items-center gap-1.5" style={{ color: '#d9b579' }}>
          <TriangleAlert className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
          {route.warning_ru}
        </p>
      )}

      {/* Цепочка точек с транспортом */}
      {route.legs.length > 0 && (
        <div className="mt-4 flex flex-col gap-0">
          {route.legs.map((leg, i) => (
            <div key={i}>
              <div className="flex items-center gap-3">
                <span className={'w-2.5 h-2.5 rounded-full flex-shrink-0 ' + (danger ? 'bg-cream/40' : 'bg-gold')} />
                <p className="font-serif text-cream/90 text-sm">{leg.from}</p>
              </div>
              <div className="flex items-center gap-3 py-0.5">
                <div
                  className="w-px h-7 ml-[4px] flex-shrink-0"
                  style={
                    danger
                      ? { borderLeft: '2px dashed rgba(196, 160, 108, 0.6)' }
                      : { borderLeft: '2px solid rgba(193, 160, 80, 0.5)' }
                  }
                />
                <ModeIcon mode={leg.mode} />
                {leg.note_ru && (
                  <p className="font-serif text-cream/50 text-[11px] italic">{leg.note_ru}</p>
                )}
              </div>
              {i === route.legs.length - 1 && (
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" />
                  <p className="font-serif text-gold text-sm font-bold">{leg.to}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {route.note_ru && (
        <p className="font-serif text-cream/60 text-xs italic mt-3 leading-relaxed">{route.note_ru}</p>
      )}
      {route.cost_estimate_ru && (
        <p className="font-serif text-cream/60 text-xs mt-3">≈ {route.cost_estimate_ru}</p>
      )}
    </div>
  );
}
