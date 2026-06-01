import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation } from '../hooks/useFoundation';
import { formatPrice } from '../lib/format';

export default function FoundationFinancePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">Не удалось загрузить данные.</p>
      </div>
    );
  }

  const c = data.costs;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
      </div>

      <div className="mx-6 mt-4">
        <h1 className="font-serif text-navy text-3xl font-bold">Финансы</h1>
        <p className="font-serif text-gold text-base italic mt-1">Стоимость и потоки подачи</p>
      </div>

      {/* Стоимость */}
      <div className="mx-6 mt-6 flex flex-col gap-3">
        <div className="bg-soft-cream border border-navy/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="font-serif text-navy text-base font-bold">Curriculum generale</p>
            <p className="font-serif text-navy/60 text-xs italic">полная стоимость курса</p>
          </div>
          <p className="font-serif text-navy text-xl font-bold">{formatPrice(c.tuition_full, c.currency)}</p>
        </div>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="font-serif text-navy text-base font-bold">Программа PIFY (Dante)</p>
            <p className="font-serif text-navy/60 text-xs italic">скидка 20%</p>
          </div>
          <p className="font-serif text-gold text-xl font-bold">{formatPrice(c.tuition_dante, c.currency)}</p>
        </div>
        <div className="bg-navy rounded-2xl p-5">
          <div className="flex justify-between items-center">
            <p className="font-serif text-cream text-base font-bold">Депозит ({c.deposit_pct}%)</p>
            <p className="font-serif text-gold text-xl font-bold">{formatPrice(c.deposit_amount, c.currency)}</p>
          </div>
          {c.deposit_refundable_if_visa_denied && (
            <p className="font-serif text-cream/70 text-xs mt-2">
              Возвращается, если в визе откажут.
            </p>
          )}
        </div>
      </div>

      {/* График оплаты (3 rate) */}
      <div className="mx-6 mt-8">
        <h3 className="font-serif text-navy text-xl font-bold mb-1">График оплаты</h3>
        <p className="font-serif text-navy/60 text-xs italic mb-4">
          Курс оплачивается тремя частями (rate)
        </p>
        <div className="flex flex-col gap-3">
          {data.payment_schedule.installments.map((inst) => (
            <div key={inst.id} className="bg-soft-cream border border-navy/20 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-serif text-navy text-base font-bold flex-1">{inst.label_ru}</h4>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-serif text-navy text-base font-bold">
                    {formatPrice(inst.amount_general, c.currency)}
                  </p>
                  <p className="font-serif text-gold text-xs italic">
                    Dante {formatPrice(inst.amount_dante, c.currency)}
                  </p>
                </div>
              </div>

              {inst.when_ru && (
                <p className="font-serif text-navy/70 text-sm mt-2">{inst.when_ru}</p>
              )}

              <div className="flex flex-col gap-1.5 mt-3">
                {inst.deadlines.map((d, i) => (
                  <div key={i} className="flex justify-between items-baseline gap-2">
                    <p className="font-serif text-navy/60 text-xs flex-1">{d.stream}</p>
                    <span className="font-serif text-navy text-xs bg-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">
                      до {d.date}
                    </span>
                  </div>
                ))}
              </div>

              {inst.refundable_if_visa_denied && (
                <p className="font-serif text-gold text-xs italic mt-2">
                  Возвращается, если в визе откажут.
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="font-serif text-navy/40 text-[11px] italic mt-3">
          {data.payment_schedule.note_ru}
        </p>
      </div>

      {/* Заметки по стоимости */}
      <div className="mx-6 mt-8">
        <h3 className="font-serif text-navy text-lg font-bold mb-3">Что важно знать</h3>
        <div className="flex flex-col gap-2">
          {c.notes_ru.map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5">◆</span>
              <p className="font-serif text-navy/80 text-sm">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Потоки подачи */}
      <div className="mx-6 mt-8">
        <h3 className="font-serif text-navy text-xl font-bold mb-4">Потоки подачи</h3>
        <div className="flex flex-col gap-3">
          {data.enrollment_types.map((e) => (
            <div key={e.id} className="bg-soft-cream border border-navy/20 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-navy text-base font-bold">{e.name}</h4>
                  <p className="font-serif text-gold text-xs italic">{e.name_ru}</p>
                </div>
                <span className="font-serif text-navy text-sm bg-cream border border-navy/15 rounded-full px-3 py-1">
                  до {e.deadline_template}
                </span>
              </div>
              <p className="font-serif text-navy/70 text-sm mt-2">{e.description_ru}</p>
            </div>
          ))}
        </div>
        <p className="font-serif text-navy/40 text-[11px] italic mt-3">
          Дедлайны двигаются каждый год — проверяй на foundationyear.unipr.it перед подачей.
        </p>
      </div>

      <TabBar active="path" />
    </div>
  );
}
