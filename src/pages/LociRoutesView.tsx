import { useNavigate } from 'react-router-dom';
import { Bus, Car, Plane, TrainFront, TriangleAlert } from 'lucide-react';
import TabBar from '../components/TabBar';
import { useLociRoutes } from '../hooks/useRelocation';
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

function RouteCard({ route }: { route: LociRoute }) {
  const danger = route.requires_permit;

  return (
    <div
      className={'rounded-2xl p-4 ' + (danger ? 'border' : 'bg-cream/10')}
      style={danger ? { backgroundColor: 'rgba(168, 51, 42, 0.18)', borderColor: 'rgba(220, 100, 90, 0.45)' } : undefined}
    >
      <p className="font-serif text-cream text-lg">{route.name_ru}</p>

      {route.warning_ru && (
        <p className="font-serif text-xs mt-1 font-bold flex items-center gap-1.5" style={{ color: '#e8978f' }}>
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
                      ? { borderLeft: '2px dashed rgba(232, 151, 143, 0.6)' }
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

export default function LociRoutesView() {
  const navigate = useNavigate();
  const { routes, loading } = useLociRoutes();

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-navy flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-cream text-2xl">←</button>
        <div>
          <p className="font-serif text-gold text-[10px] uppercase tracking-widest">⌐ loci ¬</p>
          <h1 className="font-serif text-cream text-2xl font-bold">Маршруты в Парму</h1>
        </div>
      </div>

      {loading && (
        <p className="font-serif text-cream/60 italic px-6 mt-8">Загрузка…</p>
      )}

      {!loading && routes.length === 0 && (
        <p className="font-serif text-cream/60 italic px-6 mt-8 text-center">
          Маршруты для твоей страны уточняются.
        </p>
      )}

      <div className="px-5 mt-6 flex flex-col gap-3">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>

      <p className="font-serif text-cream/40 text-xs italic text-center px-6 mt-6">
        Маршруты — общая логика. Детали (рейсы, цены, правила транзита) проверяй перед поездкой.
      </p>

      <TabBar active="loci" />
    </div>
  );
}
