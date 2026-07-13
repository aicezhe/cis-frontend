import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { useRelocation } from '../hooks/useRelocation';

// Инициалы провайдера для аватарки-плитки («Crédit Agricole — CartaConto…» → «CA»)
function initials(name: string): string {
  const core = name.split('—')[0].trim();
  const words = core.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return core.slice(0, 2).toUpperCase();
}

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

      {/* Интро — с иконкой карты */}
      <div className="mx-6 mt-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-4.5 h-4.5 text-gold" strokeWidth={1.75} style={{ width: 18, height: 18 }} />
        </div>
        <p className="font-serif text-navy/75 text-sm leading-relaxed flex-1">{c.intro_ru}</p>
      </div>

      <div className="px-6 mt-6 flex flex-col gap-4">
        {c.options.map((opt, i) => {
          const recommended = opt.tag_ru === 'рекомендуем';
          return (
            <div
              key={i}
              className={
                'rounded-2xl px-4 py-4 border ' +
                (recommended ? 'bg-soft-cream border-gold/60' : 'bg-soft-cream/60 border-navy/15')
              }
            >
              <div className="flex items-center gap-3">
                {/* Аватарка-плитка с инициалами провайдера */}
                <div
                  className={
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ' +
                    (recommended ? 'bg-navy' : 'bg-cream border border-navy/15')
                  }
                >
                  <span className={'font-serif text-sm font-bold ' + (recommended ? 'text-gold' : 'text-navy/70')}>
                    {initials(opt.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-navy text-lg font-bold leading-tight">{opt.name}</p>
                  {opt.tag_ru && (
                    <span
                      className={
                        'inline-block font-serif text-[10px] rounded-full px-2 py-0.5 leading-none mt-1 ' +
                        (recommended
                          ? 'bg-gold text-cream'
                          : 'text-gold border border-gold/60')
                      }
                    >
                      {opt.tag_ru}
                    </span>
                  )}
                </div>
              </div>

              <p className="font-serif text-navy/80 text-sm leading-relaxed mt-3">{opt.how_ru}</p>

              {opt.details_ru && (
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-navy/10">
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
                  className="font-serif text-gold text-xs underline mt-3 inline-block"
                >
                  {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
                </a>
              )}
            </div>
          );
        })}
      </div>

      {c.disclaimer_ru && (
        <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">{c.disclaimer_ru}</p>
      )}
    </div>
  );
}
