import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';
import { Price } from '../components/Price';

export default function PermessoPage() {
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

  const pm = relocation.permesso_di_soggiorno;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{pm.title_ru}</h1>
      </div>

      {/* Дедлайн */}
      <div className="mx-6 mt-5 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex gap-3">
        <span className="text-gold text-sm flex-shrink-0 mt-0.5">⚠</span>
        <p className="font-serif text-navy text-sm font-bold leading-relaxed">{pm.deadline_ru}</p>
      </div>

      {/* Шаги */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">5 шагов</p>
      <div className="px-6 flex flex-col gap-3">
        {pm.steps_ru.map((s) => (
          <div key={s.step} className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-5">{s.step}.</span>
              <div className="flex-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-serif text-navy text-base font-bold">{s.title_ru}</p>
                  {s.cost_eur != null && (
                    <p className="font-serif text-navy text-sm font-bold flex-shrink-0">
                      <Price eur={s.cost_eur} />
                    </p>
                  )}
                </div>
                <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{s.detail_ru}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Лаура */}
      <button
        onClick={() => navigate('/laura')}
        className="mx-6 mt-4 font-serif text-navy bg-gold/20 border border-gold/50 rounded-full py-3 text-sm"
      >
        ✦ Спросить Лауру про заполнение KIT
      </button>

      {/* Документы */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Пакет документов</p>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
        <div className="flex flex-col gap-2">
          {pm.documents_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Трекинг */}
      <div className="mx-6 mt-4 relative bg-navy rounded-2xl p-5">
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-xs font-bold">отслеживание</p>
        <p className="font-serif text-cream/80 text-sm leading-relaxed mt-1">{pm.tracking_ru}</p>
        <a
          href={pm.tracking_url}
          target="_blank"
          rel="noreferrer"
          className="font-serif text-gold text-xs underline mt-1.5 inline-block"
        >
          {pm.tracking_url.replace('https://', '')} ↗
        </a>
      </div>
    </div>
  );
}
