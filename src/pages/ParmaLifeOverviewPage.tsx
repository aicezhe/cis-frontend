import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useParmaLife } from '../hooks/useParmaLife';

export default function ParmaLifeOverviewPage() {
  const navigate = useNavigate();
  const { parmaLife, loading } = useParmaLife();

  if (loading || !parmaLife) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  const isFoundation = (localStorage.getItem('cispr_program') || '') === 'foundation';
  const subsections = parmaLife.subsections.filter((s) => isFoundation || !s.foundation_only);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          <h1 className="font-serif text-navy text-3xl font-bold">В Парме</h1>
          <p className="font-serif text-gold text-lg italic mt-0.5">жизнь после переезда</p>
        </div>
      </div>

      {/* Интро + порядок */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-3">{parmaLife.intro_ru.what_ru}</p>
        <div className="bg-gold/10 border border-gold/40 rounded-xl px-4 py-3">
          <p className="font-serif text-gold text-xs italic mb-1">Порядок первых месяцев</p>
          <p className="font-serif text-navy/80 text-xs leading-relaxed">{parmaLife.intro_ru.order_ru}</p>
        </div>
      </div>

      {/* Карта мест Loci */}
      <button
        onClick={() => navigate('/map')}
        className="relative mx-6 mt-4 bg-navy rounded-2xl px-5 py-4 text-left"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ loci ¬</p>
        <p className="font-serif text-cream text-lg">Места Пармы на карте</p>
        <p className="font-serif text-cream/60 text-sm mt-1">Комуна, Questura, ASL, магазины — с маршрутом</p>
      </button>

      {/* Карточки подразделов */}
      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">Что нужно знать</h3>
      <div className="px-6 flex flex-col gap-3">
        {subsections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => navigate(`/path/parma/${sec.id}`)}
            className="w-full rounded-2xl border border-navy/20 bg-soft-cream p-4 flex items-center gap-4 text-left"
          >
            <span className="text-2xl flex-shrink-0">{sec.icon}</span>
            <div className="flex-1">
              <h4 className="font-serif text-navy text-lg font-bold leading-tight">{sec.title_ru}</h4>
              {sec.subtitle_ru && (
                <p className="font-serif text-gold text-xs italic mt-0.5">{sec.subtitle_ru}</p>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 14 14" className="text-navy flex-shrink-0 -rotate-90" fill="currentColor">
              <path d="M7 10L1 4h12L7 10z" />
            </svg>
          </button>
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {parmaLife.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
