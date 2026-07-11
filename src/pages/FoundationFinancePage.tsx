import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoundation } from '../hooks/useFoundation';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';

const CHECKS_KEY = 'cispr_foundation_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function FoundationFinancePage() {
  const navigate = useNavigate();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-cream px-6"><p className="font-serif text-navy text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p></div>;

  const c = data.costs;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Стоимость и оплата</h1>
      </div>

      <div className="mx-6 mt-5 flex flex-col gap-3">
        <div className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3 flex justify-between items-center">
          <div>
            <p className="font-serif text-navy text-base font-bold">Curriculum generale</p>
            <p className="font-serif text-navy/60 text-sm italic">Dante (−20%): {fmt(c.tuition_dante)}</p>
          </div>
          <p className="font-serif text-navy text-xl font-bold">{fmt(c.tuition_full)}</p>
        </div>

        <p className="font-serif text-gold text-sm mt-1 font-bold">
          Оплата тремя частями — отмечай галочкой, когда оплатил
        </p>
        {data.payment_schedule.installments.map((inst) => (
          <div key={inst.id} className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
            <div className="flex items-start gap-3">
              <button onClick={() => toggleCheck(`pay-${inst.id}`)} className="w-6 h-6 mt-0.5 flex-shrink-0">
                {isChecked(`pay-${inst.id}`) ? (
                  <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className={
                    'font-serif text-base font-bold flex-1 ' +
                    (isChecked(`pay-${inst.id}`) ? 'text-navy/50 line-through' : 'text-navy')
                  }>
                    {inst.label_ru}
                  </h5>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="font-serif text-navy text-base font-bold">{fmt(inst.amount_general)}</p>
                    <p className="font-serif text-gold text-xs font-bold">Dante {fmt(inst.amount_dante)}</p>
                  </div>
                </div>
                {inst.when_ru && <p className="font-serif text-navy/70 text-sm mt-1.5">{inst.when_ru}</p>}
                <div className="flex flex-col gap-1 mt-2">
                  {inst.deadlines.map((d, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-2">
                      <p className="font-serif text-navy/60 text-xs flex-1">{d.stream}</p>
                      <span className="font-serif text-navy text-xs bg-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">{d.date}</span>
                    </div>
                  ))}
                </div>
                {inst.refundable_if_visa_denied && (
                  <p className="font-serif text-gold text-xs mt-1.5 font-bold">Возвращается при отказе в визе.</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <p className="font-serif text-navy/50 text-xs italic">{data.payment_schedule.note_ru}</p>

        <p className="font-serif text-gold text-sm mt-2 font-bold">Потоки подачи</p>
        {data.enrollment_types.map((e) => (
          <div key={e.id} className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-serif text-navy text-base font-bold">{e.name}</p>
                <p className="font-serif text-gold text-xs font-bold">{e.name_ru}</p>
              </div>
              <span className="font-serif text-navy text-xs bg-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">до {e.deadline_template}</span>
            </div>
            <p className="font-serif text-navy/70 text-sm mt-1.5">{e.description_ru}</p>
          </div>
        ))}

        <div className="flex flex-col gap-1.5 mt-1">
          {c.notes_ru.map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5 text-sm">◆</span>
              <p className="font-serif text-navy/70 text-sm">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
