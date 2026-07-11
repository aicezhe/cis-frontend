import { useNavigate } from 'react-router-dom';
import { useVisa } from '../hooks/useVisa';

export default function VisaRejectionsPage() {
  const navigate = useNavigate();
  const { visa, loading } = useVisa();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  if (!visa) {
    navigate('/path/visa');
    return null;
  }

  const rj = visa.rejection_reasons_ru;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/visa')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{rj.title_ru}</h1>
      </div>

      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{rj.intro_ru}</p>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-3">
        {rj.reasons.map((r) => (
          <div
            key={r.n}
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: 'rgba(168, 51, 42, 0.06)', borderColor: 'rgba(168, 51, 42, 0.35)' }}
          >
            <div className="flex items-start gap-3">
              <span
                className="font-serif font-bold text-sm flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-cream"
                style={{ backgroundColor: '#a8332a' }}
              >
                {r.n}
              </span>
              <div className="flex-1">
                <p className="font-serif text-navy text-sm font-bold">{r.title_ru}</p>
                <p className="font-serif text-navy/70 text-xs leading-relaxed mt-1">{r.detail_ru}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Универсальные советы */}
      <div className="mx-6 mt-6 bg-gold/10 border border-gold/50 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-3 font-bold">Как не попасть под отказ</p>
        <div className="flex flex-col gap-2">
          {rj.universal_tips_ru.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">✓</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Источник: ст. 32 Визового кодекса ЕС · проверяй актуальные правила своего консульства
      </p>
    </div>
  );
}
