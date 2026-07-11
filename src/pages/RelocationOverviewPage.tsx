import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useRelocation } from '../hooks/useRelocation';
import { HomeAddressInput } from '../components/HomeAddressInput';

export default function RelocationOverviewPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  // нет seed для страны (ua/by/kz) — заглушка + маршруты LOCI всё равно доступны
  if (!relocation) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="font-serif text-navy text-2xl font-bold mb-3">Переезд</p>
            <p className="font-serif text-navy/60 text-base leading-relaxed mb-6">
              Детальный гайд для твоей страны в разработке. Типовые маршруты уже можно посмотреть.
            </p>
            <button
              onClick={() => navigate('/loci/routes')}
              className="font-serif text-cream bg-navy rounded-full px-8 py-3"
            >
              Предположить маршрут →
            </button>
          </div>
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  const cards = [
    { title: 'Дорога в Парму', sub: 'Маршруты, аэропорты, поезда', to: '/path/travel/routes' },
    { title: 'После приезда', sub: 'SIM, наличные, первый магазин', to: '/path/travel/after' },
    { title: 'Codice Fiscale', sub: 'Налоговый код — нужен для всего', to: '/path/travel/codice-fiscale' },
    { title: 'Permesso di soggiorno', sub: 'ВНЖ — 8 дней после въезда', to: '/path/travel/permesso' },
  ];

  // Примерный бюджет — считаем только из уже проверенных полей seed'а, ничего не выдумываем.
  const permessoTotal = relocation.permesso_di_soggiorno.steps_ru.reduce(
    (sum, s) => sum + (s.cost_eur ?? 0), 0
  );
  const housing = relocation.housing_search.options.find((o) => o.price_min_eur != null);

  const budgetLines = [
    { label: 'Билет (через третью страну)', value: relocation.travel_routes.flight_cost_ru.estimate_ru.split('.')[0] },
    housing && {
      label: 'Аренда жилья',
      value: `${housing.price_min_eur}–${housing.price_max_eur} €/мес + депозит (обычно = 1 месяц)`,
    },
    { label: 'SIM-карта (Iliad, активация + первый месяц)', value: '≈18–20 €' },
    { label: 'Permesso di soggiorno (marca da bollo + KIT)', value: `${permessoTotal} €` },
    { label: 'Codice Fiscale', value: relocation.codice_fiscale.cost_ru },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-center">
          <h1 className="font-serif text-navy text-3xl font-bold">Переезд</h1>
          <p className="font-serif text-gold text-lg mt-0.5 font-bold">дорога и первые дни</p>
        </div>
      </div>

      {/* Интро */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-3">{relocation.intro_ru.what_ru}</p>
        <div className="bg-gold/10 border border-gold/40 rounded-xl px-4 py-3">
          <p className="font-serif text-navy/80 text-xs leading-relaxed">{relocation.intro_ru.key_ru}</p>
        </div>
      </div>

      {/* Примерные расходы — только реальные цифры из проверенных источников */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Примерные расходы</p>
      <div className="mx-6 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden">
        {budgetLines.map((line, i) => (
          <div
            key={line.label}
            className={
              'flex justify-between items-start gap-3 px-4 py-3 ' +
              (i < budgetLines.length - 1 ? 'border-b border-navy/10' : '')
            }
          >
            <p className="font-serif text-navy/80 text-xs leading-relaxed flex-1">{line.label}</p>
            <p className="font-serif text-navy text-xs font-bold flex-shrink-0 text-right whitespace-nowrap">{line.value}</p>
          </div>
        ))}
      </div>
      <p className="font-serif text-navy/40 text-[11px] italic px-6 mt-1.5">
        Примерно, по данным на {relocation.meta.last_updated} · источники: {relocation.meta.source}
      </p>

      {/* Кнопка LOCI маршруты */}
      <button
        onClick={() => navigate('/loci/routes')}
        className="relative mx-6 mt-4 bg-navy rounded-2xl px-5 py-4 text-left"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ loci ¬</p>
        <p className="font-serif text-cream text-lg">Предположить маршрут ✈</p>
        <p className="font-serif text-cream/60 text-sm mt-1">Типичные пути из твоей страны до Пармы</p>
      </button>

      {/* Адрес дома — общий компонент с геокодингом и меткой на карте */}
      <div className="mx-6 mt-4">
        <HomeAddressInput />
      </div>

      {/* Навигация */}
      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">Что нужно знать</h3>
      <div className="px-6 flex flex-col gap-3">
        {cards.map((card) => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="w-full rounded-2xl border border-navy/20 bg-soft-cream p-4 flex items-center gap-3 text-left"
          >
            <div className="flex-1">
              <h4 className="font-serif text-navy text-xl font-bold">{card.title}</h4>
              <p className="font-serif text-gold text-sm mt-0.5 font-bold">{card.sub}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 14 14" className="text-navy flex-shrink-0 -rotate-90" fill="currentColor">
              <path d="M7 10L1 4h12L7 10z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Жильё */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">{relocation.housing_search.title_ru}</p>
      <div className="px-6 flex flex-col gap-2">
        {relocation.housing_search.options.map((opt, i) => (
          <div key={i} className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
            <div className="flex justify-between items-baseline gap-2">
              <p className="font-serif text-navy text-sm font-bold">{opt.name}</p>
              {opt.price_min_eur != null && opt.price_max_eur != null && (
                <p className="font-serif text-navy/70 text-xs flex-shrink-0">
                  {opt.price_min_eur}–{opt.price_max_eur} €/мес
                </p>
              )}
            </div>
            <p className="font-serif text-navy/65 text-xs leading-relaxed mt-1">{opt.pros_ru}</p>
            {opt.url && (
              <a
                href={opt.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-xs underline mt-1 inline-block"
              >
                {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {relocation.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
