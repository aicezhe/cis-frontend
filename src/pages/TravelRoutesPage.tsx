import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRelocation, useLociRoutes } from '../hooks/useRelocation';
import { Price } from '../components/Price';
import { RouteCard } from '../components/RouteCard';
import type { ArrivalStep } from '../types/relocation';

function ArrivalTable({ steps }: { steps: ArrivalStep[] }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {steps.map((s, i) => (
        <div key={i} className="bg-cream border border-navy/10 rounded-xl px-3.5 py-3">
          <div className="flex justify-between items-baseline gap-2">
            <p className="font-serif text-navy text-sm font-bold flex-1">{s.transport}</p>
            <p className="font-serif text-navy text-sm font-bold flex-shrink-0">
              <Price eur={s.cost_eur} />
            </p>
          </div>
          <p className="font-serif text-navy/70 text-xs leading-relaxed mt-0.5">
            {s.step}{s.duration_ru ? ` · ${s.duration_ru}` : ''}
          </p>
          {s.note_ru && (
            <p className="font-serif text-navy/50 text-[11px] italic mt-1 leading-relaxed">{s.note_ru}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Раскрывающийся раздел пути прибытия — без рамки-«кнопки», просто
// кликабельный заголовок со стрелкой, как «Шаги» в остальных разделах.
function ArrivalSection({
  name, subtitle, steps, first = false,
}: {
  name: string; subtitle?: string; steps: ArrivalStep[]; first?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={'px-6 ' + (first ? '' : 'pt-4 border-t border-navy/10')}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 text-left py-1"
      >
        <div className="flex-1">
          <p className="font-serif text-navy text-lg font-bold">{name}</p>
          {subtitle && <p className="font-serif text-navy/60 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14"
          className={'text-navy flex-shrink-0 transition-transform ' + (open ? 'rotate-180' : '')}
          fill="currentColor"
        >
          <path d="M7 10L1 4h12L7 10z" />
        </svg>
      </button>
      {open && <ArrivalTable steps={steps} />}
    </div>
  );
}

export default function TravelRoutesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { relocation, loading } = useRelocation();
  const { routes: lociRoutes } = useLociRoutes();
  // Пришли по ссылке из «Шаги переезда» — возвращаем назад тоже с раскрытым разделом.
  const openSteps = Boolean((location.state as { openSteps?: boolean } | null)?.openSteps);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  // Нет детального seed'а для страны (ua/by/kz) — маршруты всё равно
  // показываем, остальное (логика поездки, прибытие в Парму) недоступно.
  if (!relocation) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12 flex items-center gap-4">
          <button
            onClick={() => navigate('/path/travel', openSteps ? { state: { openSteps: true } } : undefined)}
            className="text-navy text-2xl"
          >←</button>
          <h1 className="font-serif text-navy text-2xl font-bold">Дорога в Парму</h1>
        </div>

        <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Варианты маршрутов</p>
        <div className="px-5 flex flex-col gap-3">
          {lociRoutes.length === 0 ? (
            <p className="font-serif text-navy/50 text-sm italic px-1">Маршруты для твоей страны уточняются.</p>
          ) : (
            lociRoutes.map((route) => <RouteCard key={route.id} route={route} />)
          )}
        </div>

        <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
          Подробный гайд по дороге и первым дням для твоей страны в разработке.
        </p>
      </div>
    );
  }

  const tr = relocation.travel_routes;
  const ar = relocation.arrival_routes;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button
          onClick={() => navigate('/path/travel', openSteps ? { state: { openSteps: true } } : undefined)}
          className="text-navy text-2xl"
        >←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Дорога в Парму</h1>
      </div>

      {/* Логика первого переезда */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{tr.first_trip_logic_ru}</p>
        <p className="font-serif text-navy/70 text-sm leading-relaxed">{tr.airports_ru}</p>
      </div>

      {/* Маршруты — карточки с цепочкой точек-транспорта */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Варианты маршрутов</p>
      <div className="px-5 flex flex-col gap-3">
        {lociRoutes.length === 0 ? (
          <p className="font-serif text-navy/50 text-sm italic px-1">Маршруты для твоей страны уточняются.</p>
        ) : (
          lociRoutes.map((route) => <RouteCard key={route.id} route={route} />)
        )}
      </div>

      {/* Стоимость перелёта */}
      <div className="mx-6 mt-4 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{tr.flight_cost_ru.estimate_ru}</p>
        <p className="font-serif text-navy/50 text-xs italic mt-2 leading-relaxed">{tr.flight_cost_ru.tip_ru}</p>
      </div>

      {/* Прибытие — два раскрывающихся раздела */}
      <p className="font-serif text-gold text-sm px-6 mt-8 mb-2 font-bold">{ar.title_ru}</p>

      <div className="flex flex-col">
        <ArrivalSection name={ar.via_bologna.name_ru} steps={ar.via_bologna.steps_ru} first />
        <ArrivalSection
          name={ar.via_milan.name_ru}
          subtitle={ar.via_milan.airports_ru}
          steps={ar.via_milan.steps_ru}
        />
      </div>

      <div className="mx-6 mt-4 bg-gold/10 border border-gold/40 rounded-2xl px-4 py-3">
        <p className="font-serif text-navy/80 text-xs leading-relaxed">{ar.trenit_app_ru}</p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Цены перелётов и тарифы — проверь перед поездкой
      </p>
    </div>
  );
}
