import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVisa } from '../hooks/useVisa';
import { useMyLegalization } from '../hooks/useFoundation';
import { Price } from '../components/Price';
import type { VisaSeed, VisaStep } from '../types/visa';

// Признание диплома (CIMEA/DDV) — реальные данные по стране юзера (те же,
// что на странице «Диплом»), встроены прямо в шаг «Документы об образовании»
// вместо ссылки на другой раздел.
function CimeaDdvBlock() {
  const { legalization, loading } = useMyLegalization();
  if (loading || !legalization) return null;
  const recognition = legalization.diploma_legalization.steps.find((s) => s.id === '3_recognition');
  if (!recognition?.options) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <p className="font-serif text-gold text-xs font-bold">{recognition.title_ru}</p>
      {recognition.options.map((opt, i) => (
        <div key={i} className="bg-cream border border-navy/15 rounded-xl px-3.5 py-3">
          <div className="flex justify-between items-baseline gap-2">
            <p className="font-serif text-navy text-sm font-bold">{opt.name}</p>
            <p className="font-serif text-navy text-xs font-bold flex-shrink-0">{opt.cost_eur} € · {opt.duration}</p>
          </div>
          <p className="font-serif text-navy/70 text-xs leading-relaxed mt-1">{opt.description_ru}</p>
          <div className="flex flex-col gap-1 mt-2">
            {opt.pros_ru.map((p, j) => (
              <p key={`p${j}`} className="font-serif text-navy/70 text-xs">✓ {p}</p>
            ))}
            {opt.cons_ru.map((c, j) => (
              <p key={`c${j}`} className="font-serif text-navy/50 text-xs">– {c}</p>
            ))}
          </div>
        </div>
      ))}
      {recognition.recommendation_ru && (
        <p className="font-serif text-navy/60 text-xs italic leading-relaxed">{recognition.recommendation_ru}</p>
      )}
    </div>
  );
}

function List({ items, icon = '◆' }: { items: string[]; icon?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-gold flex-shrink-0 mt-0.5 text-xs">{icon}</span>
          <p className="font-serif text-navy/75 text-sm leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}

function StepCard({ step, index, seed }: { step: VisaStep; index: number; seed: VisaSeed }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const template = step.sponsor_letter_template_id
    ? seed.templates.sponsor_declaration
    : null;

  async function copyTemplate() {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard может быть недоступен (http) — не падаем
    }
  }

  return (
    <div className="bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
      >
        <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-6">{index + 1}.</span>
        <p className="font-serif text-navy text-base font-bold flex-1">{step.title_ru}</p>
        <svg
          width="14" height="14" viewBox="0 0 14 14"
          className={'text-navy transition-transform flex-shrink-0 ' + (open ? 'rotate-180' : '')}
          fill="currentColor"
        >
          <path d="M7 10L1 4h12L7 10z" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-navy/10 pt-3 flex flex-col gap-3">

          {step.description_ru && (
            <p className="font-serif text-navy/80 text-sm leading-relaxed">{step.description_ru}</p>
          )}

          {step.substeps_ru && (
            <ol className="flex flex-col gap-1.5">
              {step.substeps_ru.map((s, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="font-serif text-gold text-xs font-bold flex-shrink-0 mt-0.5 w-4">{i + 1}.</span>
                  <p className="font-serif text-navy/75 text-sm leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          )}

          {step.checklist_ru && <List items={step.checklist_ru} />}
          {step.details_ru && <List items={step.details_ru} />}
          {step.options_ru && <List items={step.options_ru} />}
          {step.what_happens_ru && <List items={step.what_happens_ru} />}
          {step.requirements_ru && <List items={step.requirements_ru} icon="✓" />}

          {/* Финансы: best practice + спонсорское письмо */}
          {step.best_practice_ru && (
            <div className="bg-cream border border-gold/40 rounded-xl px-3 py-2.5">
              <p className="font-serif text-navy/80 text-xs leading-relaxed">💡 {step.best_practice_ru}</p>
            </div>
          )}
          {template && (
            <button
              onClick={copyTemplate}
              className="w-full font-serif text-cream bg-navy rounded-full py-2.5 text-sm"
            >
              {copied ? '✓ Скопировано' : `Скопировать «${template.title_ru}»`}
            </button>
          )}
          {step.extra_ru && (
            <p className="font-serif text-navy/60 text-xs leading-relaxed">{step.extra_ru}</p>
          )}

          {/* Жильё: карточки вариантов */}
          {step.housing_search_ru && (
            <div>
              <p className="font-serif text-gold text-xs mb-2 font-bold">{step.housing_search_ru.title_ru}</p>
              <div className="flex flex-col gap-2">
                {step.housing_search_ru.options.map((opt, i) => (
                  <div key={i} className="bg-cream border border-navy/15 rounded-xl px-3.5 py-3">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-serif text-navy text-sm font-bold">{opt.name}</p>
                      {opt.price_min_eur != null && opt.price_max_eur != null && (
                        <p className="font-serif text-navy text-xs font-bold flex-shrink-0">
                          <Price eur={opt.price_min_eur} />–<Price eur={opt.price_max_eur} />/мес
                        </p>
                      )}
                    </div>
                    <p className="font-serif text-navy/65 text-xs leading-relaxed mt-1">{opt.pros_ru}</p>
                    {opt.url && (
                      <a
                        href={opt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-serif text-gold text-xs underline mt-1 inline-block"
                      >
                        {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="font-serif text-navy/50 text-xs italic mt-2 leading-relaxed">
                {step.housing_search_ru.estimated_costs_ru}
              </p>
            </div>
          )}

          {/* Страховка: рекомендация */}
          {step.recommended_ru && (
            <div className="relative bg-navy rounded-xl px-4 py-3.5">
              <p className="font-serif text-gold text-xs font-bold">рекомендуем</p>
              <div className="flex justify-between items-baseline gap-2 mt-0.5">
                <p className="font-serif text-cream text-base font-bold">{step.recommended_ru.name}</p>
                {step.recommended_ru.price_year_eur != null && (
                  <p className="font-serif text-gold text-sm font-bold flex-shrink-0">
                    <Price eur={step.recommended_ru.price_year_eur} />/год
                  </p>
                )}
              </div>
              <p className="font-serif text-cream/70 text-xs leading-relaxed mt-1">{step.recommended_ru.price_ru}</p>
              <p className="font-serif text-cream/60 text-xs leading-relaxed mt-1">{step.recommended_ru.why_ru}</p>
              <a
                href={step.recommended_ru.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-xs underline mt-1.5 inline-block"
              >
                {step.recommended_ru.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            </div>
          )}
          {step.alternative_ru && (
            <p className="font-serif text-navy/60 text-xs leading-relaxed">{step.alternative_ru}</p>
          )}
          {step.after_arrival_ru && (
            <p className="font-serif text-navy/60 text-xs leading-relaxed">{step.after_arrival_ru}</p>
          )}

          {/* Слоты */}
          {step.slots_strategy_ru && (
            <div className="bg-cream border border-gold/40 rounded-xl px-3.5 py-3">
              <p className="font-serif text-gold text-xs mb-2 font-bold">{step.slots_strategy_ru.title_ru}</p>
              <List items={step.slots_strategy_ru.details_ru} icon="→" />
            </div>
          )}

          {/* Предупреждение */}
          {step.warning_ru && (
            <div className="bg-gold/10 border border-gold/60 rounded-xl px-3.5 py-2.5 flex gap-2">
              <span className="text-gold flex-shrink-0 text-sm">⚠</span>
              <p className="font-serif text-navy/80 text-xs leading-relaxed">{step.warning_ru}</p>
            </div>
          )}

          {step.important_ru && (
            <p className="font-serif text-navy/70 text-xs leading-relaxed">{step.important_ru}</p>
          )}
          {step.link_to_section_ru && (
            <button
              onClick={() => navigate('/path/uni/program/documents')}
              className="w-full font-serif text-navy border border-navy/30 rounded-full py-2.5 text-sm"
            >
              {step.link_to_section_ru} →
            </button>
          )}
          {/* Признание диплома (CIMEA/DDV) — прямо в этом шаге, без ссылки на другой раздел */}
          {step.id === '2_education_docs' && <CimeaDdvBlock />}

          {step.note_ru && (
            <p className="font-serif text-navy/50 text-xs italic leading-relaxed">{step.note_ru}</p>
          )}
          {step.prepare_ru && (
            <div className="bg-cream border border-gold/40 rounded-xl px-3 py-2.5">
              <p className="font-serif text-navy/80 text-xs leading-relaxed">💡 {step.prepare_ru}</p>
            </div>
          )}
          {step.check_ru && (
            <p className="font-serif text-navy/70 text-xs leading-relaxed">{step.check_ru}</p>
          )}
          {step.on_receipt_ru && (
            <div className="bg-gold/10 border border-gold/40 rounded-xl px-3 py-2.5">
              <p className="font-serif text-navy/80 text-xs leading-relaxed">✓ {step.on_receipt_ru}</p>
            </div>
          )}

          {/* Лаура */}
          {step.laura_help_ru && (
            <button
              onClick={() => navigate('/laura')}
              className="w-full font-serif text-navy bg-gold/20 border border-gold/50 rounded-full py-2.5 text-sm"
            >
              ✦ Спросить Лауру — {step.laura_help_ru.replace('Лаура может помочь ', '').replace(/\.$/, '')}
            </button>
          )}

          {/* Внешняя ссылка шага */}
          {step.url && (
            <a
              href={step.url}
              target="_blank"
              rel="noreferrer"
              className="font-serif text-gold text-xs underline"
            >
              {step.url.replace('https://www.', '').replace('https://', '')} ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function VisaStepsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { visa, loading } = useVisa();
  // Пришли по ссылке из «Шаги получения визы» — возвращаем назад тоже с
  // раскрытым тем разделом, а не на свёрнутую страницу.
  const openSteps = Boolean((location.state as { openSteps?: boolean } | null)?.openSteps);

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

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button
          onClick={() => navigate('/path/visa', openSteps ? { state: { openSteps: true } } : undefined)}
          className="text-navy text-2xl"
        >←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Подробнее о документах</h1>
      </div>

      <p className="font-serif text-gold text-sm px-6 mt-5 mb-3 font-bold">
        {visa.steps.length} шагов — нажимай и раскрывай
      </p>

      <div className="px-6 flex flex-col gap-3">
        {visa.steps.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} seed={visa} />
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Суммы и требования меняются — перед подачей сверься с чек-листом своего консульства
      </p>
    </div>
  );
}
