import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelocation, openNearbyShops } from '../hooks/useRelocation';
import { Price } from '../components/Price';

const CHECKS_KEY = 'cispr_after_arrival_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function AfterArrivalPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();
  const [checks, setChecks] = useState<string[]>(loadChecks);

  function toggle(id: string) {
    setChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }
  const isChecked = (id: string) => checks.includes(id);

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

  // Единый чек-лист «После заселения». Каждый пункт — галочка + название,
  // под ним разворачивается вспомогательный контент (тарифы SIM, детали
  // по картам и т.п.). Прогресс — доля отмеченных пунктов.
  const items = [
    { id: 'shopping', label: 'Сходить в магазин за базовыми вещами' },
    ...(sim ? [{ id: 'sim', label: 'Купить SIM-карту' }] : []),
    ...(cash ? [{ id: 'cash', label: 'Подготовить наличные и карту' }] : []),
  ];
  const doneCount = items.filter((it) => isChecked(it.id)).length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  // Круглый чекбокс в стиле остальных разделов
  const CheckBox = ({ id }: { id: string }) => (
    <button onClick={() => toggle(id)} className="w-6 h-6 mt-0.5 flex-shrink-0">
      {isChecked(id) ? (
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
      )}
    </button>
  );

  const strike = (id: string) =>
    'font-serif text-base font-bold flex-1 ' + (isChecked(id) ? 'text-navy/50 line-through' : 'text-navy');

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/travel')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">{aa.title_ru}</h1>
      </div>

      {/* Прогресс */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <div className="flex justify-between items-baseline mb-2">
          <p className="font-serif text-navy text-sm">Готово</p>
          <p className="font-serif text-navy/60 text-xs">{doneCount} из {items.length}</p>
        </div>
        <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-navy transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="px-6 mt-5 flex flex-col gap-3">

        {/* Магазин */}
        <div className={isChecked('shopping') ? 'opacity-70' : ''}>
          <div className="flex items-start gap-3">
            <CheckBox id="shopping" />
            <div className="flex-1">
              <p className={strike('shopping')}>Сходить в магазин за базовыми вещами</p>
              <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1.5">{aa.first_shopping_ru}</p>
              <button
                onClick={openNearbyShops}
                className="mt-3 font-serif text-navy border border-navy/30 rounded-full px-4 py-2 text-sm"
              >
                Магазины рядом →
              </button>
            </div>
          </div>
        </div>

        {/* SIM */}
        {sim && (
          <div className={'pt-4 border-t border-navy/10 ' + (isChecked('sim') ? 'opacity-70' : '')}>
            <div className="flex items-start gap-3">
              <CheckBox id="sim" />
              <div className="flex-1">
                <p className={strike('sim')}>Купить SIM-карту</p>
                {sim.priority_ru && (
                  <p className="font-serif text-gold text-xs mt-0.5 font-bold">{sim.priority_ru}</p>
                )}

                <div className="relative bg-navy rounded-2xl p-4 mt-3">
                  <p className="font-serif text-gold text-xs font-bold">рекомендуем</p>
                  <p className="font-serif text-cream text-xl font-bold mt-0.5">{sim.recommended_operator}</p>
                  <p className="font-serif text-cream/70 text-xs mt-1">{sim.why_ru}</p>

                  <div className="flex flex-col gap-2 mt-3">
                    {sim.tariffs_ru?.map((t, i) => (
                      <div key={i} className="bg-cream/10 rounded-xl px-3.5 py-2.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="font-serif text-cream text-sm font-bold">{t.name}</p>
                          <p className="font-serif text-gold text-sm font-bold flex-shrink-0">
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
                  <p className="font-serif text-navy/50 text-xs italic mt-2 leading-relaxed">{sim.alternatives_ru}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Наличные и карта */}
        {cash && (
          <div className={'pt-4 border-t border-navy/10 ' + (isChecked('cash') ? 'opacity-70' : '')}>
            <div className="flex items-start gap-3">
              <CheckBox id="cash" />
              <div className="flex-1">
                <p className={strike('cash')}>Подготовить наличные и карту</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  {cash.details_ru?.map((d, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                      <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
                {cash.tip_ru && (
                  <div className="bg-soft-cream border border-gold/40 rounded-xl px-3.5 py-2.5 mt-3">
                    <p className="font-serif text-navy/80 text-xs leading-relaxed">💡 {cash.tip_ru}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Тарифы операторов меняются — проверь актуальные на сайте перед покупкой
      </p>
    </div>
  );
}
