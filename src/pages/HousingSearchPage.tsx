import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';

export default function HousingSearchPage() {
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

  const hs = relocation.housing_search;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{hs.title_ru}</h1>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-2">
        {hs.options.map((opt, i) => (
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
    </div>
  );
}
