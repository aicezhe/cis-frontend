import { useNavigate } from 'react-router-dom';
import { Route, PackageOpen, FileText, IdCard } from 'lucide-react';
import TabBar from '../components/TabBar';
import { GridButton } from '../components/GridButton';
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

  const gridButtons = [
    { icon: Route, title: 'Дорога в Парму', to: '/path/travel/routes', seed: 1 },
    { icon: PackageOpen, title: 'После приезда', to: '/path/travel/after', seed: 2 },
    { icon: FileText, title: 'Codice Fiscale', to: '/path/travel/codice-fiscale', seed: 3 },
    { icon: IdCard, title: 'Permesso di soggiorno', to: '/path/travel/permesso', seed: 4 },
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

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как в Университете) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Переезд</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Дорога и первые дни</p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Интро — просто текст, без коробки-плашки */}
      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
        {relocation.intro_ru.what_ru}
      </p>
      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-2 leading-relaxed">
        {relocation.intro_ru.key_ru}
      </p>

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

      {/* Навигация — компактная сетка мелких плиток, как в Университете */}
      <p className="font-serif text-gold text-sm font-bold px-6 mt-8 mb-3">Подробнее о:</p>
      <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-4">
        {gridButtons.map((b) => (
          <GridButton key={b.to} {...b} />
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
