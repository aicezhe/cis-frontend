import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { useFoundation, useMyLegalization } from '../hooks/useFoundation';
import { useCurrency } from '../hooks/useCurrency';
import { longPressHandlers } from '../lib/longPress';
import { formatPrice } from '../utils/formatPrice';
import type { FoundationModality } from '../types/foundation';

const MODALITY_LABEL: Record<FoundationModality, string> = {
  in_presenza: 'очно',
  blended: 'смешанно',
  online: 'онлайн',
};

const CHECKS_KEY = 'cispr_foundation_checks';

export default function FoundationOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();
  const { legalization } = useMyLegalization();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [expanded, setExpanded] = useState(1);
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
  // Единый курс Foundation: берём учебный план Absolute Beginners как основной.
  const plan = data.subjects_by_track.absolute_beginners;
  const lr = data.language_requirements;
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

  const sections = [
    { id: 1, title: 'Структура курса', sub: 'Суть курса, формат, что получаешь' },
    { id: 2, title: 'Учебный план', sub: `≈${plan.total_cfu ?? 60} CFU за год` },
    { id: 3, title: 'Стоимость и оплата', sub: `${fmt(c.tuition_full)} · 3 rate · потоки` },
    { id: 4, title: 'Языковые требования', sub: 'Итальянский, английский, сертификаты' },
    { id: 5, title: 'Шаги поступления', sub: 'Документы, апостиль, заявка, сроки' },
  ];

  // Общая примерная смета: курс + документы/тест на этапе подачи + легализация
  // диплома (если известна страна) — суммируем всё, что раньше было
  // разбросано по разным блокам отдельными диапазонами.
  const am = data.apply_meta;
  const totalMinEur =
    c.tuition_dante + am.apply_extra_cost_min_eur + (legalization?.total_cost_estimate.documents_only_min_eur ?? 0);
  const totalMaxEur =
    c.tuition_full + am.apply_extra_cost_max_eur + (legalization?.total_cost_estimate.documents_only_max_eur ?? 0);

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
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 40, height: 1 }} />
      </div>

      {/* Важно: FY ≠ университет — просто длинный синий блок, без декора */}
      <div className="mx-6 mt-6 bg-navy rounded-2xl p-5">
        <p className="font-serif text-cream text-base leading-relaxed">{p.important_note_ru}</p>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Об универе
      </h3>

      {/* Аккордеон-разделы в стиле «Виза» */}
      <div className="px-6 flex flex-col gap-3">
        {sections.map((s) => {
          const isExpanded = expanded === s.id;
          // «Шаги поступления» — самый важный, действенный раздел: выделяем
          // золотой рамкой всегда, не только при раскрытии, + маркер сверху.
          const isKey = s.id === 5;
          return (
            <div
              key={s.id}
              className={
                'rounded-2xl border p-4 ' +
                (isExpanded || isKey ? 'bg-soft-cream border-gold border-2' : 'bg-soft-cream border-navy/20')
              }
            >
              <button
                onClick={() => setExpanded(isExpanded ? 0 : s.id)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="flex-1">
                  {isKey && (
                    <p className="font-serif text-gold text-[10px] uppercase tracking-widest font-bold mb-1">
                      ⌐ начни здесь ¬
                    </p>
                  )}
                  <h4 className="font-serif text-navy text-xl font-bold">{s.title}</h4>
                  <p className="font-serif text-gold text-sm mt-0.5 font-bold">{s.sub}</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 14 14"
                  className={'text-navy flex-shrink-0 transition-transform ' + (isExpanded ? 'rotate-180' : '')}
                  fill="currentColor"
                >
                  <path d="M7 10L1 4h12L7 10z" />
                </svg>
              </button>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-navy/10">
                  {/* 1. Что это и как устроено */}
                  {s.id === 1 && (
                    <div className="flex flex-col gap-4">
                      <p className="font-serif text-navy/80 text-sm leading-relaxed">{p.description_ru}</p>
                      <div>
                        <p className="font-serif text-gold text-base font-bold mb-1.5">Как устроена учёба</p>
                        <p className="font-serif text-navy/80 text-sm leading-relaxed">{data.how_studies_work_ru}</p>
                      </div>
                      <div>
                        <p className="font-serif text-gold text-base font-bold mb-2">После завершения</p>
                        <div className="flex flex-col gap-1.5">
                          {p.issued_after_completion.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold mt-0.5">◆</span>
                              <p className="font-serif text-navy/80 text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Учебный план */}
                  {s.id === 2 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3 flex justify-between items-center">
                        <p className="font-serif text-navy text-base">Всего за год</p>
                        <p className="font-serif text-gold text-xl font-bold">≈{plan.total_cfu ?? 60} CFU</p>
                      </div>
                      {plan.total_note_ru && (
                        <p className="font-serif text-navy/60 text-sm italic">{plan.total_note_ru}</p>
                      )}
                      {plan.list.map((subj, i) => (
                        <div
                          key={i}
                          className={
                            'rounded-xl px-4 py-3 border ' +
                            (subj.optional ? 'bg-cream border-gold border-dashed' : 'bg-cream border-navy/15')
                          }
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h5 className={
                              'font-serif text-base font-bold leading-snug flex-1 ' +
                              (subj.optional ? 'text-gold' : 'text-navy')
                            }>
                              {subj.name}
                            </h5>
                            <span className="font-serif text-gold text-base font-bold flex-shrink-0">{subj.cfu} CFU</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {subj.period && (
                              <span className="font-serif text-navy/60 text-xs bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5">{subj.period}</span>
                            )}
                            {subj.modality && (
                              <span className="font-serif text-navy/60 text-xs bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5">{MODALITY_LABEL[subj.modality]}</span>
                            )}
                            {subj.optional && (
                              <span className="font-serif text-gold text-xs bg-soft-cream border border-gold/40 rounded-full px-2 py-0.5">по выбору</span>
                            )}
                          </div>
                          {subj.note && (
                            <p className="font-serif text-navy/50 text-sm italic mt-2">{subj.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Стоимость и оплата — с галочками «оплачено» */}
                  {s.id === 3 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3 flex justify-between items-center">
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
                        <div key={inst.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <div className="flex items-start gap-3">
                            <CheckBox id={`pay-${inst.id}`} />
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
                                    <span className="font-serif text-navy text-xs bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">{d.date}</span>
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
                        <div key={e.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-serif text-navy text-base font-bold">{e.name}</p>
                              <p className="font-serif text-gold text-xs font-bold">{e.name_ru}</p>
                            </div>
                            <span className="font-serif text-navy text-xs bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">до {e.deadline_template}</span>
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
                  )}

                  {/* 4. Языковые требования */}
                  {s.id === 4 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                        <p className="font-serif text-navy/80 text-base leading-relaxed">
                          Зависит от трека: можно зайти{' '}
                          <span className="text-navy font-bold">с нуля</span>, с базовым итальянским{' '}
                          <span className="text-navy font-bold">A1/A2</span> либо с английским{' '}
                          <span className="text-navy font-bold">B2</span>.
                        </p>
                      </div>

                      <div>
                        <p className="font-serif text-gold text-sm mb-1.5 font-bold">Если идёшь на англоязычный bachelor — нужен B2:</p>
                        <div className="flex flex-col gap-1">
                          {lr.accepted_english_b2_certificates.map((cert, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold mt-0.5 text-sm">◆</span>
                              <p className="font-serif text-navy/80 text-base">{cert}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-cream border border-gold rounded-xl px-4 py-3">
                        <p className="font-serif text-gold text-sm mb-1 font-bold">Про Duolingo</p>
                        <p className="font-serif text-navy/80 text-sm leading-relaxed">{lr.duolingo_note_ru}</p>
                      </div>
                    </div>
                  )}

                  {/* 5. Как поступить — галочки, сроки 2027/28, стоимости */}
                  {s.id === 5 && (
                    <div className="flex flex-col gap-3">
                      {/* Дисклеймер по срокам + общая стоимость */}
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                        <p className="font-serif text-gold text-sm mb-1 font-bold">
                          Ориентир на приём {data.apply_meta.target_year_ru}
                        </p>
                        <p className="font-serif text-navy/75 text-sm leading-relaxed">
                          {data.apply_meta.dates_disclaimer_ru}
                        </p>
                        <p className="font-serif text-navy text-sm leading-relaxed mt-2 font-bold">
                          {data.apply_meta.total_cost_note_ru}
                        </p>
                      </div>

                      {/* Итоговая примерная смета — курс + документы/тест + легализация
                          (если известна страна) сложены в одну цифру */}
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

                          {/* items как чекбоксы */}
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

                          {/* substeps как чекбоксы со стоимостью */}
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

                      {/* Страновой блок: легализация документов под гражданство юзера */}
                      {legalization && (
                        <div className="mt-3 flex flex-col gap-3">
                          <div className="border-t border-navy/15 pt-4">
                            <h4 className="font-serif text-navy text-xl font-bold">
                              Легализация документов — {legalization.meta.country_name_ru}
                            </h4>
                            <p className="font-serif text-navy/50 text-xs italic mt-0.5">
                              Источник: {legalization.meta.source}
                            </p>
                          </div>

                          {/* Особый статус: UA — временная защита, KZ — CIMEA Central Asia */}
                          {legalization.special_status?.active && (
                            <div className="bg-soft-cream border border-gold rounded-xl px-4 py-3">
                              <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">
                                ⌐ важно ¬
                              </p>
                              <h5 className="font-serif text-navy text-lg font-bold mt-1">
                                {legalization.special_status.name_ru}
                              </h5>
                              <p className="font-serif text-navy/80 text-sm mt-2 leading-relaxed">
                                {legalization.special_status.description_ru}
                              </p>
                              <p className="font-serif text-navy text-sm font-bold mt-2 leading-relaxed">
                                {legalization.special_status.implication_ru}
                              </p>
                              {legalization.special_status.alternative_path_steps_ru && (
                                <ol className="list-decimal pl-5 mt-3 flex flex-col gap-1">
                                  {legalization.special_status.alternative_path_steps_ru.map((st, i) => (
                                    <li key={i} className="font-serif text-navy/80 text-sm">{st}</li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          )}

                          {/* Шаги легализации */}
                          {legalization.diploma_legalization.steps.map((step) => (
                            <div key={step.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                              <h5 className="font-serif text-navy text-lg font-bold">{step.title_ru}</h5>
                              <p className="font-serif text-navy/80 text-base mt-2 leading-relaxed">{step.description_ru}</p>

                              {step.cost_local && (
                                <div className="flex gap-2 mt-2">
                                  <span className="font-serif text-navy/60 text-sm">Стоимость:</span>
                                  <span className="font-serif text-navy text-sm">
                                    {step.cost_local}
                                    {step.cost_eur_approx ? <> (~{fmt(step.cost_eur_approx)})</> : null}
                                  </span>
                                </div>
                              )}
                              {step.duration_days && (
                                <div className="flex gap-2">
                                  <span className="font-serif text-navy/60 text-sm">Срок:</span>
                                  <span className="font-serif text-navy text-sm">{step.duration_days}</span>
                                </div>
                              )}

                              {/* Варианты (CIMEA / DDV) */}
                              {step.options && (
                                <div className="flex flex-col gap-3 mt-3">
                                  {step.options.map((opt, i) => (
                                    <div key={i} className="border-l-2 border-gold pl-3">
                                      <p className="font-serif text-navy text-base font-bold">{opt.name}</p>
                                      <p className="font-serif text-navy/70 text-sm mt-1 leading-relaxed">{opt.description_ru}</p>
                                      <p className="font-serif text-navy/60 text-xs mt-1.5">
                                        Стоимость: {opt.cost_eur} € · Срок: {opt.duration}
                                      </p>
                                      {opt.pros_ru.map((pr, j) => (
                                        <p key={`p${j}`} className="font-serif text-navy/70 text-xs mt-0.5">＋ {pr}</p>
                                      ))}
                                      {opt.cons_ru.map((cn, j) => (
                                        <p key={`c${j}`} className="font-serif text-navy/50 text-xs mt-0.5">－ {cn}</p>
                                      ))}
                                    </div>
                                  ))}
                                  {step.recommendation_ru && (
                                    <p className="font-serif text-gold text-sm font-bold">💡 {step.recommendation_ru}</p>
                                  )}
                                </div>
                              )}

                              {step.warnings_ru && (
                                <div className="flex flex-col gap-1.5 mt-3">
                                  {step.warnings_ru.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2">
                                      <span className="text-gold mt-0.5 text-sm">!</span>
                                      <p className="font-serif text-navy/80 text-sm">{w}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Итоговая смета (виза — отдельный раздел приложения, здесь не дублируем) */}
                          <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                            <p className="font-serif text-gold text-sm mb-1.5 font-bold">Примерная смета</p>
                            <div className="flex flex-col gap-1">
                              <p className="font-serif text-navy/80 text-sm">Сам курс: {legalization.total_cost_estimate.course_separately}</p>
                              <p className="font-serif text-navy/80 text-sm">Документы + тест: {legalization.total_cost_estimate.documents_only}</p>
                            </div>
                            <p className="font-serif text-navy text-base font-bold mt-2">
                              Итого: {fmt(totalMinEur)} – {fmt(totalMaxEur)}
                            </p>
                          </div>

                          {/* Pitfalls легализации */}
                          <div className="mt-1">
                            <p className="font-serif text-gold text-sm mb-1.5 font-bold">Что часто ломается</p>
                            <div className="flex flex-col gap-1.5">
                              {legalization.common_pitfalls_ru.map((pf, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-gold mt-0.5 text-sm">◆</span>
                                  <p className="font-serif text-navy/80 text-sm">{pf}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <p className="font-serif text-navy/40 text-[11px] italic mt-1">
                            Данные обновляются. Перед подачей сверь с официальными источниками:{' '}
                            {legalization.diploma_legalization.competent_authority.website}, esteri.it.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
