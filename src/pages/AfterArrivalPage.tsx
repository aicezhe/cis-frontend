import { useNavigate } from 'react-router-dom';
import { useRelocation, openNearbyShops } from '../hooks/useRelocation';
import { Price } from '../components/Price';

export default function AfterArrivalPage() {
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

  const aa = relocation.after_arrival;
  const sim = aa.steps.find((s) => s.id === 'sim');
  const cash = aa.steps.find((s) => s.id === 'cash_card');

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{aa.title_ru}</h1>
      </div>

      {/* Первый магазин */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-3">{aa.first_shopping_ru}</p>
        <button
          onClick={openNearbyShops}
          className="w-full font-serif text-navy border border-navy/30 rounded-full py-2.5 text-sm"
        >
          Магазины рядом 🛒 →
        </button>
      </div>

      {/* SIM */}
      {sim && (
        <>
          <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">
            {sim.title_ru} · {sim.priority_ru}
          </p>
          <div className="mx-6 relative bg-navy rounded-2xl p-5">
            <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

            <p className="font-serif text-gold text-xs font-bold">рекомендуем</p>
            <p className="font-serif text-cream text-2xl font-bold mt-0.5">{sim.recommended_operator}</p>
            <p className="font-serif text-cream/70 text-xs mt-1">{sim.why_ru}</p>

            <div className="flex flex-col gap-2 mt-4">
              {sim.tariffs_ru?.map((t, i) => (
                <div key={i} className="bg-cream/10 rounded-xl px-4 py-3">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="font-serif text-cream text-sm font-bold">{t.name}</p>
                    <p className="font-serif text-gold text-base font-bold flex-shrink-0">
                      <Price eur={t.price_eur} />/мес
                    </p>
                  </div>
                  <p className="font-serif text-cream/70 text-xs mt-0.5">{t.data} · {t.extra_ru}</p>
                </div>
              ))}
            </div>

            {sim.activation_ru && (
              <p className="font-serif text-cream/60 text-xs leading-relaxed mt-3">{sim.activation_ru}</p>
            )}
            {sim.url && (
              <a
                href={sim.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-xs underline mt-2 inline-block"
              >
                {sim.url.replace('https://www.', '')} ↗
              </a>
            )}
          </div>
          {sim.alternatives_ru && (
            <p className="font-serif text-navy/50 text-xs italic px-6 mt-2 leading-relaxed">
              {sim.alternatives_ru}
            </p>
          )}
        </>
      )}

      {/* Наличные и карта */}
      {cash && (
        <>
          <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">{cash.title_ru}</p>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <div className="flex flex-col gap-2">
              {cash.details_ru?.map((d, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                  <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
            {cash.tip_ru && (
              <div className="bg-cream border border-gold/40 rounded-xl px-3.5 py-2.5 mt-3">
                <p className="font-serif text-navy/80 text-xs leading-relaxed">💡 {cash.tip_ru}</p>
              </div>
            )}
          </div>
        </>
      )}

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Тарифы операторов меняются — проверь актуальные на сайте перед покупкой
      </p>
    </div>
  );
}
