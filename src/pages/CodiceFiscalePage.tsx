import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';

export default function CodiceFiscalePage() {
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

  const cf = relocation.codice_fiscale;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{cf.title_ru}</h1>
      </div>

      {/* Интро — просто текст, без коробки-плашки */}
      <p className="font-serif text-navy/75 text-sm leading-relaxed px-6 mt-5">{cf.what_ru}</p>
      <p className="font-serif text-navy/70 text-sm leading-relaxed px-6 mt-2">{cf.if_not_in_russia_ru}</p>

      {/* Где + цена — тап открывает эту точку на карте Loci */}
      <button
        onClick={() => navigate('/map', { state: { focus: 'agenzia_entrate' } })}
        className="mx-6 mt-4 relative bg-navy rounded-2xl p-5 text-left w-[calc(100%-3rem)]"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-xs font-bold">куда идти · на карте →</p>
        <p className="font-serif text-cream text-lg font-bold mt-0.5">{cf.where_ru}</p>
        <p className="font-serif text-gold text-sm mt-1">{cf.cost_ru}</p>
      </button>

      {/* Документы */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Документы с собой</p>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
        <div className="flex flex-col gap-2">
          {cf.documents_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Шаги */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Как получить</p>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
        <ol className="flex flex-col gap-2.5">
          {cf.steps_ru.map((s, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
