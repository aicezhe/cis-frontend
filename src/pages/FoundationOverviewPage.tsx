import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation } from '../hooks/useFoundation';
import { formatPrice } from '../lib/format';
import type { FoundationModality } from '../types/foundation';

const MODALITY_LABEL: Record<FoundationModality, string> = {
  in_presenza: 'очно',
  blended: 'смешанно',
  online: 'онлайн',
};

// Угловые скобки в стиле раздела «Виза»
function Corners() {
  return (
    <>
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
    </>
  );
}

export default function FoundationOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();
  const [expanded, setExpanded] = useState(1);
  const [copied, setCopied] = useState(false);

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
  const lang = data.language_requirements.by_track.absolute_beginners;
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
    { id: 1, title: 'Что это и как устроено', sub: 'Суть курса, формат, что получаешь' },
    { id: 2, title: 'Учебный план', sub: `≈${plan.total_cfu ?? 60} CFU за год` },
    { id: 3, title: 'Стоимость и оплата', sub: `${formatPrice(c.tuition_full, c.currency)} · 3 rate · потоки` },
    { id: 4, title: 'Языковые требования', sub: 'Итальянский, английский, сертификаты' },
    { id: 5, title: 'Как поступить', sub: 'Документы, апостиль, заявка' },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          <h1 className="font-serif text-navy text-3xl font-bold">Foundation Year</h1>
          <p className="font-serif text-gold text-base italic mt-1">{p.name_full}</p>
          <p className="font-serif text-navy/60 text-xs mt-1">
            {p.duration_months} мес · {p.period}
          </p>
        </div>
      </div>

      {/* Важно: FY ≠ университет */}
      <div className="mx-6 mt-6 relative bg-navy rounded-2xl p-5">
        <Corners />
        <p className="font-serif text-gold text-sm italic mb-2 px-2">Важно</p>
        <p className="font-serif text-cream text-sm leading-relaxed px-2">{p.important_note_ru}</p>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Что нужно знать
      </h3>

      {/* Аккордеон-разделы в стиле «Виза» */}
      <div className="px-6 flex flex-col gap-3">
        {sections.map((s) => {
          const isExpanded = expanded === s.id;
          return (
            <div
              key={s.id}
              className={
                'rounded-2xl border p-4 ' +
                (isExpanded ? 'bg-soft-cream border-gold border-2' : 'bg-soft-cream border-navy/20')
              }
            >
              <button
                onClick={() => setExpanded(isExpanded ? 0 : s.id)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className="flex-1">
                  <p className="font-serif text-gold text-sm italic">Раздел {s.id}</p>
                  <h4 className="font-serif text-navy text-lg font-bold">{s.title}</h4>
                  <p className="font-serif text-gold text-xs italic mt-0.5">{s.sub}</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  className={'text-navy mt-1 flex-shrink-0 transition-transform ' + (isExpanded ? 'rotate-180' : '')}
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
                        <p className="font-serif text-gold text-xs italic mb-1">Как устроена учёба</p>
                        <p className="font-serif text-navy/80 text-sm leading-relaxed">{data.how_studies_work_ru}</p>
                      </div>
                      <div>
                        <p className="font-serif text-gold text-xs italic mb-2">После завершения</p>
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
                        <p className="font-serif text-navy text-sm">Всего за год</p>
                        <p className="font-serif text-gold text-lg font-bold">≈{plan.total_cfu ?? 60} CFU</p>
                      </div>
                      {plan.total_note_ru && (
                        <p className="font-serif text-navy/60 text-xs italic">{plan.total_note_ru}</p>
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
                              'font-serif text-sm font-bold leading-snug flex-1 ' +
                              (subj.optional ? 'text-gold' : 'text-navy')
                            }>
                              {subj.name}
                            </h5>
                            <span className="font-serif text-gold text-sm font-bold flex-shrink-0">{subj.cfu} CFU</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {subj.period && (
                              <span className="font-serif text-navy/60 text-[11px] bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5">{subj.period}</span>
                            )}
                            {subj.modality && (
                              <span className="font-serif text-navy/60 text-[11px] bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5">{MODALITY_LABEL[subj.modality]}</span>
                            )}
                            {subj.optional && (
                              <span className="font-serif text-gold text-[11px] bg-soft-cream border border-gold/40 rounded-full px-2 py-0.5">по выбору</span>
                            )}
                          </div>
                          {subj.note && (
                            <p className="font-serif text-navy/50 text-xs italic mt-1.5">{subj.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Стоимость и оплата */}
                  {s.id === 3 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-serif text-navy text-sm font-bold">Curriculum generale</p>
                          <p className="font-serif text-navy/60 text-xs italic">Dante (−20%): {formatPrice(c.tuition_dante, c.currency)}</p>
                        </div>
                        <p className="font-serif text-navy text-lg font-bold">{formatPrice(c.tuition_full, c.currency)}</p>
                      </div>

                      <p className="font-serif text-gold text-xs italic mt-1">Оплата тремя частями (rate)</p>
                      {data.payment_schedule.installments.map((inst) => (
                        <div key={inst.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-serif text-navy text-sm font-bold flex-1">{inst.label_ru}</h5>
                            <div className="text-right ml-2 flex-shrink-0">
                              <p className="font-serif text-navy text-sm font-bold">{formatPrice(inst.amount_general, c.currency)}</p>
                              <p className="font-serif text-gold text-[11px] italic">Dante {formatPrice(inst.amount_dante, c.currency)}</p>
                            </div>
                          </div>
                          {inst.when_ru && <p className="font-serif text-navy/70 text-xs mt-1.5">{inst.when_ru}</p>}
                          <div className="flex flex-col gap-1 mt-2">
                            {inst.deadlines.map((d, i) => (
                              <div key={i} className="flex justify-between items-baseline gap-2">
                                <p className="font-serif text-navy/60 text-[11px] flex-1">{d.stream}</p>
                                <span className="font-serif text-navy text-[11px] bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">до {d.date}</span>
                              </div>
                            ))}
                          </div>
                          {inst.refundable_if_visa_denied && (
                            <p className="font-serif text-gold text-[11px] italic mt-1.5">Возвращается при отказе в визе.</p>
                          )}
                        </div>
                      ))}

                      <p className="font-serif text-gold text-xs italic mt-2">Потоки подачи</p>
                      {data.enrollment_types.map((e) => (
                        <div key={e.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-serif text-navy text-sm font-bold">{e.name}</p>
                              <p className="font-serif text-gold text-[11px] italic">{e.name_ru}</p>
                            </div>
                            <span className="font-serif text-navy text-[11px] bg-soft-cream border border-navy/15 rounded-full px-2 py-0.5 flex-shrink-0">до {e.deadline_template}</span>
                          </div>
                          <p className="font-serif text-navy/70 text-xs mt-1.5">{e.description_ru}</p>
                        </div>
                      ))}

                      <div className="flex flex-col gap-1.5 mt-1">
                        {c.notes_ru.map((note, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-gold mt-0.5 text-xs">◆</span>
                            <p className="font-serif text-navy/70 text-xs">{note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Языковые требования */}
                  {s.id === 4 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <p className="font-serif text-navy/60 text-sm">Итальянский</p>
                          <p className="font-serif text-navy text-sm">{lang.italian}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="font-serif text-navy/60 text-sm">Английский</p>
                          <p className="font-serif text-navy text-sm">{lang.english}</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-serif text-gold text-xs italic mb-1.5">Если идёшь на англоязычный bachelor — нужен B2:</p>
                        <div className="flex flex-col gap-1">
                          {lr.accepted_english_b2_certificates.map((cert, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold mt-0.5 text-xs">◆</span>
                              <p className="font-serif text-navy/80 text-sm">{cert}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-cream border border-gold rounded-xl px-4 py-3">
                        <p className="font-serif text-gold text-xs italic mb-1">Про Duolingo</p>
                        <p className="font-serif text-navy/80 text-xs leading-relaxed">{lr.duolingo_note_ru}</p>
                      </div>
                      <div className="bg-cream border border-gold rounded-xl px-4 py-3">
                        <p className="font-serif text-gold text-xs italic mb-1">Про визу</p>
                        <p className="font-serif text-navy/80 text-xs leading-relaxed">{lr.visa_note_ru}</p>
                      </div>
                    </div>
                  )}

                  {/* 5. Как поступить */}
                  {s.id === 5 && (
                    <div className="flex flex-col gap-3">
                      {data.steps_to_apply.map((step, idx) => (
                        <div key={step.id} className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <p className="font-serif text-gold text-xs italic">Шаг {idx + 1}</p>
                          <h5 className="font-serif text-navy text-sm font-bold mt-0.5">{step.title}</h5>
                          {step.description_ru && (
                            <p className="font-serif text-navy/80 text-xs mt-1.5 leading-relaxed">{step.description_ru}</p>
                          )}
                          {step.items && (
                            <div className="flex flex-col gap-1 mt-2">
                              {step.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-gold mt-0.5 text-xs">◆</span>
                                  <p className="font-serif text-navy/80 text-xs">{item}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {step.substeps && (
                            <div className="flex flex-col gap-1.5 mt-2">
                              {step.substeps.map((sub, i) => (
                                <div key={i} className="bg-soft-cream border border-navy/15 rounded-lg px-3 py-2">
                                  <p className="font-serif text-navy text-xs">{sub.name}</p>
                                  <div className="flex gap-3 mt-0.5">
                                    {sub.cost_rub && <span className="font-serif text-navy/60 text-[11px]">≈ {sub.cost_rub} ₽</span>}
                                    {sub.duration_days && <span className="font-serif text-navy/60 text-[11px]">{sub.duration_days} дн.</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {step.warnings && (
                            <div className="flex flex-col gap-1.5 mt-2">
                              {step.warnings.map((w, i) => (
                                <div key={i} className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2">
                                  <span className="text-gold mt-0.5 text-xs">!</span>
                                  <p className="font-serif text-navy/80 text-[11px]">{w}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {emailTemplate && (
                        <div className="bg-navy rounded-xl p-4 mt-1">
                          <p className="font-serif text-gold text-[11px] italic mb-1">Subject</p>
                          <p className="font-serif text-cream text-xs mb-3">{emailTemplate.subject}</p>
                          <p className="font-serif text-gold text-[11px] italic mb-1">Body</p>
                          <pre className="font-serif text-cream/90 text-[11px] whitespace-pre-wrap leading-relaxed">
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
                        <p className="font-serif text-gold text-xs italic mb-1.5">Частые ошибки</p>
                        <div className="flex flex-col gap-1.5">
                          {data.common_pitfalls_ru.map((pitfall, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold mt-0.5 text-xs">◆</span>
                              <p className="font-serif text-navy/80 text-xs">{pitfall}</p>
                            </div>
                          ))}
                        </div>
                      </div>
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

      <TabBar active="path" />
    </div>
  );
}
