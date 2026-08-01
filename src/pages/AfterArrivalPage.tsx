import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRelocation, openNearbyShops } from '../hooks/useRelocation';
import { Price } from '../components/Price';
import { ContentPage, PageHeader, TldrCard, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

const CHECKS_KEY = 'cispr_after_arrival_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function AfterArrivalPage() {
  const navigate = useNavigate();
  const { relocation, loading, country } = useRelocation();
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
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!relocation) {
    navigate('/path/travel');
    return null;
  }

  const aa = relocation.after_arrival;
  const sim = aa.steps.find((s) => s.id === 'sim');
  // РФ-специфика (обходные схемы для российских карт) — у других стран для
  // этого свои страницы (например, KzCardsPage), не показываем здесь.
  const cash = country === 'ru' ? aa.steps.find((s) => s.id === 'cash_card') : undefined;

  const CheckBox = ({ id }: { id: string }) => (
    <button onClick={() => toggle(id)} className="w-6 h-6 mt-0.5 flex-shrink-0" aria-label="Отметить">
      {isChecked(id) ? (
        <div className="w-6 h-6 rounded-full bg-content-gold flex items-center justify-center text-white text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-content-line" />
      )}
    </button>
  );

  const strike = (id: string) =>
    'text-base font-semibold flex-1 ' + (isChecked(id) ? 'text-content-ink-2 line-through' : 'text-content-navy');

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={aa.title_ru} backTo="/path/travel" />

      <TldrCard stats={[{ value: '3', label: 'первых дела' }]}>
        Первые дела после заселения: <b>магазин</b>, <b>SIM-карта</b>, <b>наличные и карта</b>.
        Отмечай сделанное — прогресс сохраняется.
      </TldrCard>

      <div className="flex flex-col gap-3 mt-6">
        {/* Магазин */}
        <div className={isChecked('shopping') ? 'opacity-70' : ''}>
          <div className="flex items-start gap-3">
            <CheckBox id="shopping" />
            <div className="flex-1 min-w-0">
              <p className={strike('shopping')}>Сходить в магазин за базовыми вещами</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1.5">{aa.first_shopping_ru}</p>
              <button
                onClick={openNearbyShops}
                className="mt-3 text-content-navy border border-content-line rounded-full px-4 py-2 text-sm"
              >
                Магазины рядом →
              </button>
            </div>
          </div>
        </div>

        {/* SIM */}
        {sim && (
          <div className={'pt-4 border-t border-content-line ' + (isChecked('sim') ? 'opacity-70' : '')}>
            <div className="flex items-start gap-3">
              <CheckBox id="sim" />
              <div className="flex-1 min-w-0">
                <p className={strike('sim')}>Купить SIM-карту</p>
                {sim.priority_ru && <p className="text-content-gold text-xs mt-0.5 font-semibold">{sim.priority_ru}</p>}

                <div className="mt-3">
                  <p className="text-content-gold text-xs font-semibold uppercase tracking-widest">рекомендуем</p>
                  <p className="text-content-navy text-xl font-bold mt-0.5">{sim.recommended_operator}</p>
                  <p className="text-content-ink-2 text-xs mt-1">{sim.why_ru}</p>

                  <div className="flex flex-col gap-2 mt-3">
                    {sim.tariffs_ru?.map((t, i) => (
                      <div key={i} className="bg-content-surface border border-content-line rounded-xl px-3.5 py-2.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="text-content-navy text-sm font-semibold">{t.name}</p>
                          <p className="text-content-navy text-sm font-bold flex-shrink-0"><Price eur={t.price_eur} />/мес</p>
                        </div>
                        <p className="text-content-ink-2 text-xs mt-0.5">{t.data} · {t.extra_ru}</p>
                      </div>
                    ))}
                  </div>

                  {sim.activation_ru && <p className="text-content-ink-2 text-xs leading-relaxed mt-3">{sim.activation_ru}</p>}
                  {sim.url && (
                    <a href={sim.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-2 inline-block">
                      {sim.url.replace('https://www.', '')} ↗
                    </a>
                  )}
                </div>

                {sim.alternatives_ru && <p className="text-content-ink-2 text-xs italic mt-2 leading-relaxed">{sim.alternatives_ru}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Наличные и карта */}
        {cash && (
          <div className={'pt-4 border-t border-content-line ' + (isChecked('cash') ? 'opacity-70' : '')}>
            <div className="flex items-start gap-3">
              <CheckBox id="cash" />
              <div className="flex-1 min-w-0">
                <p className={strike('cash')}>Подготовить наличные и карту</p>
                <div className="flex flex-col gap-1.5 mt-2">
                  {cash.details_ru?.map((d, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                      <p className="text-content-ink text-[14.5px] leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
                {cash.tip_ru && <Note>{cash.tip_ru}</Note>}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Тарифы операторов меняются — проверь актуальные на сайте перед покупкой
      </p>
    </ContentPage>
  );
}
