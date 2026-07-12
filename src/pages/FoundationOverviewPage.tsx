import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Euro, Languages, Award } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { useFoundation, useMyLegalization } from '../hooks/useFoundation';
import { useCurrency } from '../hooks/useCurrency';
import { longPressHandlers } from '../lib/longPress';
import { formatPrice } from '../utils/formatPrice';

const CHECKS_KEY = 'cispr_foundation_checks';

// Небольшая квадратная плитка-иконка — сама иконка занимает почти всю
// площадь квадрата, подпись отдельно снизу (не внутри рамки).
function GridButton({ icon: Icon, title, to }: { icon: typeof GraduationCap; title: string; to: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="flex flex-col items-center gap-1.5 w-24 mx-auto">
      <div className="w-full aspect-square rounded-xl border-2 border-gold/50 bg-soft-cream flex items-center justify-center p-3">
        <Icon className="w-full h-full text-gold" strokeWidth={1.5} />
      </div>
      <span className="font-serif text-navy text-xs font-bold text-center leading-tight">{title}</span>
    </button>
  );
}

export default function FoundationOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();
  const { legalization } = useMyLegalization();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Долгий тап по карточке шага «Шаги поступления» → добавить свой расход
  const [expenseFor, setExpenseFor] = useState<string | null>(null);
  const [checks, setChecks] = useState<string[]>(() => {
    const raw = localStorage.getItem(CHECKS_KEY);
    return raw ? JSON.parse(raw) : [];
  });

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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">
          Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.
        </p>
      </div>
    );
  }

  const p = data.program;
  const c = data.costs;
  const emailTemplate = data.email_templates['fy_application_email'];

  function copyEmail() {
    if (!emailTemplate) return;
    const text = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body_en}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }

  // Круглый чекбокс в стиле раздела «Виза»
  const CheckBox = ({ id }: { id: string }) => (
    <button onClick={() => toggleCheck(id)} className="w-6 h-6 mt-0.5 flex-shrink-0">
      {isChecked(id) ? (
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
      )}
    </button>
  );

  // Общая примерная смета: курс + документы/тест на этапе подачи + легализация
  // диплома (если известна страна) — суммируем всё в одну цифру.
  const am = data.apply_meta;
  const totalMinEur =
    c.tuition_dante + am.apply_extra_cost_min_eur + (legalization?.total_cost_estimate.documents_only_min_eur ?? 0);
  const totalMaxEur =
    c.tuition_full + am.apply_extra_cost_max_eur + (legalization?.total_cost_estimate.documents_only_max_eur ?? 0);

  const gridButtons = [
    { icon: GraduationCap, title: 'Структура', to: '/path/foundation/structure' },
    { icon: Euro, title: 'Оплата', to: '/path/foundation/finance' },
    { icon: Languages, title: 'Языки', to: '/path/foundation/languages' },
    { icon: Award, title: 'Диплом', to: '/path/uni/program/diploma' },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Foundation Year</h1>
        <p className="font-serif text-gold text-base mt-1 italic">{p.name_full}</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {p.duration_months} мес · {p.period}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Важно: FY ≠ университет — просто длинный синий блок, без декора */}
      <div className="mx-6 mt-6 bg-navy rounded-2xl p-5">
        <p className="font-serif text-cream text-base leading-relaxed">{p.important_note_ru}</p>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Об универе
      </h3>

      <div className="px-6 flex flex-col gap-3">

        {/* Шаги поступления — единственный раздел прямо на странице, открыт
            по умолчанию. Крупная скруглённая карточка, обычный аккордеон,
            без постоянных бейджей. */}
        <div className={
          'rounded-[28px] border-2 p-5 ' +
          (stepsOpen ? 'bg-soft-cream border-gold' : 'bg-soft-cream border-gold/50')
        }>
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="flex-1 text-center">
              <h4 className="font-serif text-navy text-2xl font-bold">Шаги поступления</h4>
              {!stepsOpen && (
                <p className="font-serif text-gold text-sm mt-1 font-bold">Документы, апостиль, заявка, сроки</p>
              )}
            </div>
            <svg
              width="16" height="16" viewBox="0 0 14 14"
              className={'text-navy flex-shrink-0 transition-transform ' + (stepsOpen ? 'rotate-180' : '')}
              fill="currentColor"
            >
              <path d="M7 10L1 4h12L7 10z" />
            </svg>
          </button>

          {stepsOpen && (
            <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-3">
              <p className="font-serif text-gold text-base text-center italic">
                ~ Приём {data.apply_meta.target_year_ru} ~
              </p>

              <div className="bg-navy rounded-xl px-4 py-3">
                <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">
                  Итого ориентировочно
                </p>
                <p className="font-serif text-cream text-2xl font-bold mt-1">
                  {fmt(totalMinEur)} – {fmt(totalMaxEur)}
                </p>
                <p className="font-serif text-cream/70 text-xs mt-1 leading-relaxed">
                  Курс + документы/языковой тест{legalization ? ' + легализация диплома' : ''}.
                  {!legalization && ' Выбери страну в профиле, чтобы учесть и легализацию диплома.'}
                </p>
              </div>

              {data.steps_to_apply.map((step, idx) => (
                <div
                  key={step.id}
                  className="relative bg-cream border border-navy/15 rounded-xl px-4 py-3 select-none"
                  style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
                  {...longPressHandlers(() => setExpenseFor(step.title))}
                >
                  <span
                    className="absolute top-3 right-3 w-5 h-5 rounded-full border border-gold/50 flex items-center justify-center text-gold text-xs"
                    title="Долгий тап — добавить свой расход"
                  >
                    +
                  </span>
                  <p className="font-serif text-gold text-sm font-bold">Шаг {idx + 1}</p>
                  <h5 className="font-serif text-navy text-lg font-bold mt-0.5">{step.title}</h5>
                  {step.timing_ru && (
                    <span className="inline-block font-serif text-navy text-xs bg-soft-cream border border-gold/40 rounded-full px-2.5 py-1 mt-2">
                      🕑 {step.timing_ru}
                    </span>
                  )}
                  {step.description_ru && (
                    <p className="font-serif text-navy/80 text-base mt-2 leading-relaxed">{step.description_ru}</p>
                  )}

                  {step.items && (
                    <div className="flex flex-col gap-2 mt-3">
                      {step.items.map((item, i) => {
                        const cid = `apply-${step.id}-item-${i}`;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <CheckBox id={cid} />
                            <p className={
                              'font-serif text-base flex-1 ' +
                              (isChecked(cid) ? 'text-navy/50 line-through' : 'text-navy/80')
                            }>
                              {item}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {step.substeps && (
                    <div className="flex flex-col gap-2 mt-3">
                      {step.substeps.map((sub, i) => {
                        const cid = `apply-${step.id}-sub-${i}`;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <CheckBox id={cid} />
                            <div className="flex-1">
                              <p className={
                                'font-serif text-base ' +
                                (isChecked(cid) ? 'text-navy/50 line-through' : 'text-navy/80')
                              }>
                                {sub.name}
                              </p>
                              <div className="flex gap-3 mt-0.5">
                                {sub.cost_rub && sub.cost_rub !== '0' && (
                                  <span className="font-serif text-gold text-xs">≈ {sub.cost_rub} ₽</span>
                                )}
                                {sub.cost_rub === '0' && (
                                  <span className="font-serif text-navy/50 text-xs">бесплатно</span>
                                )}
                                {sub.duration_days && (
                                  <span className="font-serif text-navy/60 text-xs">{sub.duration_days} дн.</span>
                                )}
                              </div>
                              {sub.cost_note_ru && (
                                <p className="font-serif text-gold text-xs mt-0.5">{sub.cost_note_ru}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {step.warnings && (
                    <div className="flex flex-col gap-1.5 mt-3">
                      {step.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2">
                          <span className="text-gold mt-0.5 text-sm">!</span>
                          <p className="font-serif text-navy/80 text-sm">{w}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {emailTemplate && (
                <div className="bg-navy rounded-xl p-4 mt-1">
                  <p className="font-serif text-gold text-xs mb-1 font-bold">Subject</p>
                  <p className="font-serif text-cream text-sm mb-3">{emailTemplate.subject}</p>
                  <p className="font-serif text-gold text-xs mb-1 font-bold">Body</p>
                  <pre className="font-serif text-cream/90 text-xs whitespace-pre-wrap leading-relaxed">
{emailTemplate.body_en}
                  </pre>
                  <button
                    onClick={copyEmail}
                    className="w-full mt-3 font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
                  >
                    {copied ? 'Скопировано ✓' : 'Скопировать письмо'}
                  </button>
                </div>
              )}

              <div className="mt-1">
                <p className="font-serif text-gold text-sm mb-1.5 font-bold">Частые ошибки</p>
                <div className="flex flex-col gap-1.5">
                  {data.common_pitfalls_ru.map((pitfall, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5 text-sm">◆</span>
                      <p className="font-serif text-navy/80 text-sm">{pitfall}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Остальное — компактная сетка мелких плиток вместо длинных строк */}
        <p className="font-serif text-gold text-sm font-bold mt-2">Подробнее о:</p>
        <div className="grid grid-cols-2 gap-y-4">
          {gridButtons.map((b) => (
            <GridButton key={b.to} {...b} />
          ))}
        </div>
      </div>

      {/* Контакты */}
      <div className="mx-6 mt-6">
        <p className="font-serif text-navy/60 text-xs">
          Офиц. сайт:{' '}
          <a href={p.official_url} target="_blank" rel="noreferrer" className="text-gold underline">
            {p.official_url.replace('https://', '')}
          </a>
        </p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          Почта:{' '}
          <a href={`mailto:${p.official_email}`} className="text-gold underline">
            {p.official_email}
          </a>
        </p>
        <p className="font-serif text-navy/40 text-[11px] italic mt-3">
          Данные: {data.meta.source} · уч. год {data.meta.academic_year}
        </p>
      </div>

      {expenseFor && (
        <AddExpenseSheet
          defaultCategory="uni"
          defaultLabel={expenseFor}
          onClose={() => setExpenseFor(null)}
        />
      )}

      <TabBar active="path" />
    </div>
  );
}
