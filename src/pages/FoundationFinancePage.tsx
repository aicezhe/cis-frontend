import { useState } from 'react';
import { useFoundation } from '../hooks/useFoundation';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';
import { ContentPage, PageHeader, TldrCard, H2, InfoCard, Note } from '../components/content';

const CHECKS_KEY = 'cispr_foundation_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function FoundationFinancePage() {
  const { data, loading, error } = useFoundation();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [checks, setChecks] = useState<string[]>(loadChecks);

  function toggleCheck(id: string) {
    setChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }
  const isChecked = (id: string) => checks.includes(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg px-6">
        <p className="font-golos text-content-ink text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p>
      </div>
    );
  }

  const c = data.costs;

  return (
    <ContentPage>
      <PageHeader crumb="Foundation Year" title="Стоимость и оплата" backTo="/path/foundation" />

      <TldrCard stats={[{ value: fmt(c.tuition_full), label: 'за год' }, { value: fmt(c.tuition_dante), label: 'с Dante −20%' }]}>
        Curriculum generale — <b>{fmt(c.tuition_full)}</b> за год, оплата <b>тремя частями</b>.
        С сертификатом Dante — скидка 20%.
      </TldrCard>

      <H2>Оплата тремя частями</H2>
      <p className="text-content-ink-2 text-[14.5px] mt-2">Отмечай галочкой, когда оплатил.</p>
      <div className="flex flex-col gap-3 mt-4">
        {data.payment_schedule.installments.map((inst) => (
          <div key={inst.id} className="bg-content-surface border border-content-line rounded-2xl px-4 py-3">
            <div className="flex items-start gap-3">
              <button onClick={() => toggleCheck(`pay-${inst.id}`)} className="w-6 h-6 mt-0.5 flex-shrink-0" aria-label="Отметить оплату">
                {isChecked(`pay-${inst.id}`) ? (
                  <div className="w-6 h-6 rounded-full bg-content-gold flex items-center justify-center text-white text-xs">✓</div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-content-line" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h5 className={'text-base font-semibold flex-1 ' + (isChecked(`pay-${inst.id}`) ? 'text-content-ink-2 line-through' : 'text-content-navy')}>
                    {inst.label_ru}
                  </h5>
                  <div className="text-right flex-shrink-0">
                    <p className="text-content-navy text-base font-bold">{fmt(inst.amount_general)}</p>
                    <p className="text-content-gold text-xs font-semibold">Dante {fmt(inst.amount_dante)}</p>
                  </div>
                </div>
                {inst.when_ru && <p className="text-content-ink-2 text-[14.5px] mt-1.5">{inst.when_ru}</p>}
                <div className="flex flex-col gap-1 mt-2">
                  {inst.deadlines.map((d, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-2">
                      <p className="text-content-ink-2 text-xs flex-1">{d.stream}</p>
                      <span className="text-content-navy text-xs bg-content-bg border border-content-line rounded-full px-2 py-0.5 flex-shrink-0">{d.date}</span>
                    </div>
                  ))}
                </div>
                {inst.refundable_if_visa_denied && (
                  <p className="text-content-gold text-xs mt-1.5 font-semibold">Возвращается при отказе в визе.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Note>{data.payment_schedule.note_ru}</Note>

      <H2>Потоки подачи</H2>
      <div className="flex flex-col gap-3 mt-4">
        {data.enrollment_types.map((e) => (
          <InfoCard key={e.id} tag={`до ${e.deadline_template}`} title={`${e.name} · ${e.name_ru}`}>
            {e.description_ru}
          </InfoCard>
        ))}
      </div>

      <div className="flex flex-col gap-1.5 mt-5">
        {c.notes_ru.map((note, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-content-gold mt-0.5 text-sm">◆</span>
            <p className="text-content-ink-2 text-[14.5px]">{note}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
