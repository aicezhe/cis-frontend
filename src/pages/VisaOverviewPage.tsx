import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useVisa, getConsularDistrict } from '../hooks/useVisa';
import VisaUkrainePage from './VisaUkrainePage';

function Corners() {
  return (
    <>
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
    </>
  );
}

export default function VisaOverviewPage() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  // у Украины свой трек: безвиз + permesso / временная защита, без визы D
  if (country === 'ua') return <VisaUkrainePage />;
  return <VisaRuOverview />;
}

function VisaRuOverview() {
  const navigate = useNavigate();
  const { visa, loading } = useVisa();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  // нет seed для страны юзера (ua/by/kz) — заглушка
  if (!visa) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="font-serif text-navy text-2xl font-bold mb-3">Виза</p>
            <p className="font-serif text-navy/60 text-base leading-relaxed">
              Раздел для твоей страны в разработке. Скоро здесь будет пошаговый гайд по визе.
            </p>
          </div>
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  const city = localStorage.getItem('cispr_city') || '';
  const districtKey = getConsularDistrict(city, visa);
  const district = districtKey === 'spb'
    ? visa.consular_districts.spb_district
    : visa.consular_districts.moscow_district;
  const operators = visa.consular_districts.operators_ru;

  const cards = [
    { title: 'Шаги получения визы', sub: `${visa.steps.length} шагов — от Universitaly до паспорта с визой`, to: '/path/visa/steps' },
    { title: 'Причины отказа', sub: 'Что проверяют и как не завалить', to: '/path/visa/rejections' },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как в Университете) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Виза D</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Visto nazionale · studio</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {visa.meta.country_name_ru} · {visa.meta.academic_year}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Что это */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-3">{visa.intro_ru.what_ru}</p>
        <div className="bg-gold/10 border border-gold/40 rounded-xl px-4 py-3">
          <p className="font-serif text-navy/80 text-xs leading-relaxed">{visa.intro_ru.prerequisites_ru}</p>
        </div>
      </div>

      {/* Консульский округ */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Твой консульский округ</p>
      <div className="mx-6 relative bg-navy rounded-2xl p-5">
        <Corners />
        <p className="font-serif text-gold text-xs font-bold">
          {city ? `по твоему городу: ${city}` : 'город не указан — по умолчанию'}
        </p>
        <p className="font-serif text-cream text-xl font-bold mt-1">{district.name_ru}</p>
        <p className="font-serif text-cream/70 text-xs mt-2 leading-relaxed">
          {Array.isArray(district.regions_ru) ? district.regions_ru.join(', ') : district.regions_ru}
        </p>
        <a
          href={district.website}
          target="_blank"
          rel="noreferrer"
          className="font-serif text-gold text-xs underline mt-2 inline-block"
        >
          {district.website.replace('https://', '')} ↗
        </a>
        <div className="bg-cream/10 rounded-xl px-3 py-2 mt-3">
          <p className="font-serif text-cream/80 text-xs leading-relaxed">
            Операторы: {operators.moscow} · {operators.regions}
          </p>
          <p className="font-serif text-cream/50 text-[11px] mt-1 leading-relaxed">{operators.note_ru}</p>
        </div>
        <p className="font-serif text-gold/70 text-[10px] mt-3 font-bold">
          Распределение округов меняется — проверь на официальном сайте перед подачей
        </p>
      </div>

      {/* Процесс целиком */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Как устроен процесс</p>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
        <ol className="flex flex-col gap-2.5">
          {visa.process_overview_ru.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Навигация */}
      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">Разделы</h3>
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

      {/* После приезда */}
      <div className="mx-6 mt-5 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-2 font-bold">{visa.permesso_di_soggiorno_ru.title_ru}</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{visa.intro_ru.after_arrival_ru}</p>
        <p className="font-serif text-navy/50 text-xs italic mt-2">{visa.permesso_di_soggiorno_ru.note_ru}</p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {visa.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
