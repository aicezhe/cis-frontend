import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';
import { ContentPage, PageHeader, TldrCard } from '../components/content';

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
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!relocation?.cards_ru) {
    navigate('/path/travel');
    return null;
  }

  const c = relocation.cards_ru;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={c.title_ru} backTo="/path/travel" />

      <TldrCard>{c.intro_ru}</TldrCard>

      <div className="flex flex-col gap-4 mt-5">
        {c.options.map((opt, i) => {
          const recommended = opt.tag_ru === 'рекомендуем';
          return (
            <div
              key={i}
              className={
                'rounded-2xl px-4 py-4 border bg-content-surface ' +
                (recommended ? 'border-content-gold' : 'border-content-line')
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ' +
                    (recommended ? 'bg-content-navy' : 'bg-content-bg border border-content-line')
                  }
                >
                  <span className={'text-sm font-bold ' + (recommended ? 'text-content-gold' : 'text-content-ink-2')}>
                    {initials(opt.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-content-navy text-lg font-semibold leading-tight">{opt.name}</p>
                  {opt.tag_ru && (
                    <span
                      className={
                        'inline-block text-[10px] rounded-full px-2 py-0.5 leading-none mt-1 font-semibold uppercase ' +
                        (recommended ? 'bg-content-gold text-white' : 'text-content-gold bg-content-gold-bg')
                      }
                    >
                      {opt.tag_ru}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-content-ink text-[14.5px] leading-relaxed mt-3">{opt.how_ru}</p>

              {opt.details_ru && (
                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-content-line">
                  {opt.details_ru.map((d, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-content-gold mt-0.5 text-xs flex-shrink-0">◆</span>
                      <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              )}

              {opt.url && (
                <a href={opt.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-3 inline-block">
                  {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
                </a>
              )}
            </div>
          );
        })}
      </div>

      {c.disclaimer_ru && (
        <p className="text-content-ink-2 text-xs italic text-center mt-6">{c.disclaimer_ru}</p>
      )}
    </ContentPage>
  );
}
