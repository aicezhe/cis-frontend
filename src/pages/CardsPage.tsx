import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';

export default function CardsPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  if (!relocation?.cards_ru) {
    navigate('/path/travel');
    return null;
  }

  const c = relocation.cards_ru;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{c.title_ru}</h1>
      </div>

      <p className="font-serif text-navy/75 text-sm leading-relaxed px-6 mt-5">{c.intro_ru}</p>

      <div className="px-6 mt-6 flex flex-col gap-5">
        {c.options.map((opt, i) => (
          <div key={i} className={i === 0 ? '' : 'pt-5 border-t border-navy/10'}>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-serif text-navy text-lg font-bold">{opt.name}</p>
              {opt.tag_ru && (
                <span className="font-serif text-[10px] text-gold border border-gold/60 rounded-full px-2 py-0.5 leading-none">
                  {opt.tag_ru}
                </span>
              )}
            </div>

            <p className="font-serif text-navy/80 text-sm leading-relaxed mt-2">{opt.how_ru}</p>

            {opt.details_ru && (
              <div className="flex flex-col gap-1.5 mt-2">
                {opt.details_ru.map((d, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5 text-xs flex-shrink-0">◆</span>
                    <p className="font-serif text-navy/70 text-sm leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            )}

            {opt.url && (
              <a
                href={opt.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-xs underline mt-2 inline-block"
              >
                {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            )}
          </div>
        ))}
      </div>

      {c.disclaimer_ru && (
        <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">{c.disclaimer_ru}</p>
      )}
    </div>
  );
}
