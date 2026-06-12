import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';
import { Price } from '../components/Price';
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

export default function TravelRoutesPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  if (!relocation) {
    navigate('/path/travel');
    return null;
  }

  const tr = relocation.travel_routes;
  const ar = relocation.arrival_routes;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Дорога в Парму</h1>
      </div>

      {/* Логика первого переезда */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{tr.first_trip_logic_ru}</p>
        <p className="font-serif text-navy/70 text-sm leading-relaxed">{tr.airports_ru}</p>
      </div>

      {/* Маршруты */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">Варианты маршрутов</p>
      <div className="px-6 flex flex-col gap-3">
        {tr.routes.map((route) => (
          <div
            key={route.id}
            className={'rounded-2xl border px-4 py-4 ' + (route.safe ? 'bg-soft-cream border-navy/20' : '')}
            style={
              route.safe
                ? undefined
                : { backgroundColor: 'rgba(168, 51, 42, 0.06)', borderColor: 'rgba(168, 51, 42, 0.4)' }
            }
          >
            <p className="font-serif text-navy text-base font-bold">{route.name_ru}</p>
            <p className="font-serif text-navy/60 text-xs mt-1">
              {route.via_ru.join(' · ')} {route.to_ru}
            </p>
            {route.warning_ru && (
              <div
                className="rounded-xl px-3 py-2 mt-2 flex gap-2"
                style={{ backgroundColor: 'rgba(168, 51, 42, 0.1)' }}
              >
                <span className="flex-shrink-0 text-sm" style={{ color: '#a8332a' }}>⚠</span>
                <p className="font-serif text-xs font-bold leading-relaxed" style={{ color: '#a8332a' }}>
                  {route.warning_ru}
                </p>
              </div>
            )}
            {route.note_ru && (
              <p className="font-serif text-navy/60 text-xs italic mt-2 leading-relaxed">{route.note_ru}</p>
            )}
          </div>
        ))}
      </div>

      {/* Стоимость перелёта */}
      <div className="mx-6 mt-4 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{tr.flight_cost_ru.estimate_ru}</p>
        <p className="font-serif text-navy/50 text-xs italic mt-2 leading-relaxed">{tr.flight_cost_ru.tip_ru}</p>
      </div>

      {/* Кнопка LOCI */}
      <button
        onClick={() => navigate('/loci/routes')}
        className="mx-6 mt-4 font-serif text-cream bg-navy rounded-full py-3 text-sm"
      >
        Показать на карте ✈ →
      </button>

      {/* Прибытие */}
      <p className="font-serif text-gold text-sm italic px-6 mt-8 mb-3">{ar.title_ru}</p>

      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
        <p className="font-serif text-navy text-base font-bold">{ar.via_bologna.name_ru}</p>
        <ArrivalTable steps={ar.via_bologna.steps_ru} />
      </div>

      <div className="mx-6 mt-3 bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
        <p className="font-serif text-navy text-base font-bold">{ar.via_milan.name_ru}</p>
        <p className="font-serif text-navy/60 text-xs mt-0.5">{ar.via_milan.airports_ru}</p>
        <ArrivalTable steps={ar.via_milan.steps_ru} />
      </div>

      <div className="mx-6 mt-4 bg-gold/10 border border-gold/40 rounded-2xl px-4 py-3">
        <p className="font-serif text-navy/80 text-xs leading-relaxed">📱 {ar.trenit_app_ru}</p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Цены перелётов и тарифы — проверь перед поездкой
      </p>
    </div>
  );
}
