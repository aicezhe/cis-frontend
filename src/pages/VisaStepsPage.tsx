import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useVisa, useVisaBy, useVisaKz } from '../hooks/useVisa';
import { useMyLegalization } from '../hooks/useFoundation';
import { Price } from '../components/Price';
import type { VisaSeed, VisaStep } from '../types/visa';
import { ContentPage, PageHeader, TldrCard, Note, InfoCard } from '../components/content';

const CHECKS_KEY = 'cispr_visa_docs_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

function CheckBox({ id, checked, toggle }: { id: string; checked: boolean; toggle: (id: string) => void }) {
  return (
    <button onClick={() => toggle(id)} className="w-5 h-5 mt-0.5 flex-shrink-0" aria-label="Отметить">
      {checked ? (
        <div className="w-5 h-5 rounded-full bg-content-gold flex items-center justify-center text-white text-[10px]">✓</div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-content-line" />
      )}
    </button>
  );
}

function CheckList({
  items, idPrefix, checked, toggle, numbered = false,
}: {
  items: string[]; idPrefix: string; checked: string[]; toggle: (id: string) => void; numbered?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((s, i) => {
        const id = `${idPrefix}-${i}`;
        const done = checked.includes(id);
        return (
          <div key={i} className="flex gap-2 items-start">
            <CheckBox id={id} checked={done} toggle={toggle} />
            <p className={'text-[14.5px] leading-relaxed flex-1 ' + (done ? 'text-content-ink-2 line-through' : 'text-content-ink')}>
              {numbered ? `${i + 1}. ` : ''}{s}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Признание диплома (CIMEA/DDV) — данные по стране юзера, встроены в шаг.
function CimeaDdvBlock() {
  const { legalization, loading } = useMyLegalization();
  if (loading || !legalization) return null;
  const steps = legalization.diploma_legalization.steps;
  const translation = steps.find((s) => s.id === '2_translation');
  const recognition = steps.find((s) => s.id === '3_recognition');
  if (!recognition?.options) return null;

  return (
    <div className="flex flex-col gap-3 mt-1">
      {translation && (
        <div className="bg-content-bg border border-content-line rounded-xl px-3.5 py-3">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-content-navy text-sm font-semibold">{translation.title_ru}</p>
            {translation.cost_eur_approx != null && (
              <p className="text-content-navy text-xs font-bold flex-shrink-0">
                ~{translation.cost_eur_approx} € · {translation.duration_days}
              </p>
            )}
          </div>
          <p className="text-content-ink-2 text-xs leading-relaxed mt-1">{translation.description_ru}</p>
          {translation.cost_local && (
            <p className="text-content-ink-2 text-xs mt-1">В местной валюте: {translation.cost_local}</p>
          )}
          {translation.warnings_ru && translation.warnings_ru.length > 0 && (
            <div className="flex flex-col gap-1 mt-2">
              {translation.warnings_ru.map((w, i) => (
                <p key={i} className="text-content-gold text-xs">{w}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-content-gold text-xs font-semibold">{recognition.title_ru}</p>
      {recognition.options.map((opt, i) => (
        <div key={i} className="bg-content-bg border border-content-line rounded-xl px-3.5 py-3">
          <div className="flex justify-between items-baseline gap-2">
            <p className="text-content-navy text-sm font-semibold">{opt.name}</p>
            <p className="text-content-navy text-xs font-bold flex-shrink-0">{opt.cost_eur} € · {opt.duration}</p>
          </div>
          <p className="text-content-ink-2 text-xs leading-relaxed mt-1">{opt.description_ru}</p>
          <p className="text-content-ink-2 text-xs mt-2 italic">
            {opt.name === 'CIMEA'
              ? 'Слоты: подача онлайн, но в пиковый сезон (июнь–сентябрь) у CIMEA бывают периоды, когда приём новых заявок временно закрыт — подавай заранее, не жди последний месяц.'
              : 'Слоты: запись на приём в консульство через Prenot@Mi — в пиковый сезон свободные даты разбирают быстро, проверяй портал регулярно и записывайся, как только освободится время.'}
          </p>
          <div className="flex flex-col gap-1 mt-2">
            {opt.pros_ru.map((p, j) => (
              <p key={`p${j}`} className="text-content-ink-2 text-xs">✓ {p}</p>
            ))}
            {opt.cons_ru.map((c, j) => (
              <p key={`c${j}`} className="text-content-ink-2/70 text-xs">– {c}</p>
            ))}
          </div>
        </div>
      ))}
      {recognition.recommendation_ru && (
        <p className="text-content-ink-2 text-xs italic leading-relaxed">{recognition.recommendation_ru}</p>
      )}
    </div>
  );
}

function List({ items, icon = '◆' }: { items: string[]; icon?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">{icon}</span>
          <p className="text-content-ink text-[14.5px] leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}

function StepCard({
  step, seed, checked, toggle,
}: {
  step: VisaStep; seed: VisaSeed; checked: string[]; toggle: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mainId = `visa-step-${step.id}`;
  const stepDone = checked.includes(mainId);

  const template = step.sponsor_letter_template_id ? seed.templates.sponsor_declaration : null;

  async function copyTemplate() {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard может быть недоступен (http) */ }
  }

  return (
    <div className={'bg-content-surface border rounded-2xl overflow-hidden ' + (stepDone ? 'border-content-gold' : 'border-content-line')}>
      <div className="w-full px-4 py-4 flex items-center gap-3">
        <CheckBox id={mainId} checked={stepDone} toggle={toggle} />
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-3 text-left">
          <p className={'text-base font-semibold flex-1 ' + (stepDone ? 'text-content-ink-2 line-through' : 'text-content-navy')}>
            {step.title_ru}
          </p>
          <svg width="14" height="14" viewBox="0 0 14 14"
            className={'text-content-navy transition-transform flex-shrink-0 ' + (open ? 'rotate-180' : '')} fill="currentColor">
            <path d="M7 10L1 4h12L7 10z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-content-line pt-3 flex flex-col gap-3">
          {step.description_ru && <p className="text-content-ink text-[14.5px] leading-relaxed">{step.description_ru}</p>}

          {step.substeps_ru && (
            <CheckList items={step.substeps_ru} idPrefix={`${mainId}-substep`} checked={checked} toggle={toggle} numbered />
          )}
          {step.checklist_ru && (
            <CheckList items={step.checklist_ru} idPrefix={`${mainId}-checklist`} checked={checked} toggle={toggle} />
          )}
          {step.details_ru && <List items={step.details_ru} />}
          {step.options_ru && <List items={step.options_ru} />}
          {step.what_happens_ru && <List items={step.what_happens_ru} />}
          {step.requirements_ru && (
            <CheckList items={step.requirements_ru} idPrefix={`${mainId}-req`} checked={checked} toggle={toggle} />
          )}

          {step.best_practice_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3 py-2.5">
              <p className="text-content-ink text-[13px] leading-relaxed">{step.best_practice_ru}</p>
            </div>
          )}
          {template && (
            <button onClick={copyTemplate} className="w-full text-white bg-content-navy rounded-full py-2.5 text-sm">
              {copied ? '✓ Скопировано' : `Скопировать «${template.title_ru}»`}
            </button>
          )}
          {step.extra_ru && <p className="text-content-ink-2 text-xs leading-relaxed">{step.extra_ru}</p>}

          {step.housing_search_ru && (
            <div>
              <p className="text-content-gold text-xs mb-2 font-semibold">{step.housing_search_ru.title_ru}</p>
              <div className="flex flex-col gap-2">
                {step.housing_search_ru.options.map((opt, i) => (
                  <div key={i} className="bg-content-bg border border-content-line rounded-xl px-3.5 py-3">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="text-content-navy text-sm font-semibold">{opt.name}</p>
                      {opt.price_min_eur != null && opt.price_max_eur != null && (
                        <p className="text-content-navy text-xs font-bold flex-shrink-0">
                          <Price eur={opt.price_min_eur} />–<Price eur={opt.price_max_eur} />/мес
                        </p>
                      )}
                    </div>
                    <p className="text-content-ink-2 text-xs leading-relaxed mt-1">{opt.pros_ru}</p>
                    {opt.url && (
                      <a href={opt.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-1 inline-block">
                        {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-content-ink-2 text-xs italic mt-2 leading-relaxed">{step.housing_search_ru.estimated_costs_ru}</p>
            </div>
          )}

          {step.recommended_ru && (
            <div className="rounded-xl bg-content-navy px-4 py-3.5">
              <p className="text-content-gold text-xs font-semibold">рекомендуем</p>
              <div className="flex justify-between items-baseline gap-2 mt-0.5">
                <p className="text-white text-base font-semibold">{step.recommended_ru.name}</p>
                {step.recommended_ru.price_year_eur != null && (
                  <p className="text-[#D8BC85] text-sm font-bold flex-shrink-0">
                    <Price eur={step.recommended_ru.price_year_eur} />/год
                  </p>
                )}
              </div>
              <p className="text-white/70 text-xs leading-relaxed mt-1">{step.recommended_ru.price_ru}</p>
              <p className="text-white/60 text-xs leading-relaxed mt-1">{step.recommended_ru.why_ru}</p>
              <a href={step.recommended_ru.url} target="_blank" rel="noreferrer" className="text-[#D8BC85] text-xs underline mt-1.5 inline-block">
                {step.recommended_ru.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            </div>
          )}
          {step.alternative_ru && <p className="text-content-ink-2 text-xs leading-relaxed">{step.alternative_ru}</p>}
          {step.after_arrival_ru && <p className="text-content-ink-2 text-xs leading-relaxed">{step.after_arrival_ru}</p>}

          {step.slots_strategy_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3.5 py-3">
              <p className="text-content-gold text-xs mb-2 font-semibold">{step.slots_strategy_ru.title_ru}</p>
              <List items={step.slots_strategy_ru.details_ru} icon="→" />
            </div>
          )}

          {step.warning_ru && (
            <Note icon={<TriangleAlert size={15} />}>{step.warning_ru}</Note>
          )}

          {step.important_ru && <p className="text-content-ink-2 text-xs leading-relaxed">{step.important_ru}</p>}
          {step.link_to_section_ru && (
            <button
              onClick={() => navigate('/path/uni/program/documents')}
              className="w-full text-content-navy border border-content-line rounded-full py-2.5 text-sm"
            >
              {step.link_to_section_ru} →
            </button>
          )}
          {step.id === '2_education_docs' && <CimeaDdvBlock />}

          {step.note_ru && <p className="text-content-ink-2 text-xs italic leading-relaxed">{step.note_ru}</p>}
          {step.prepare_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3 py-2.5">
              <p className="text-content-ink text-[13px] leading-relaxed">{step.prepare_ru}</p>
            </div>
          )}
          {step.check_ru && <p className="text-content-ink-2 text-xs leading-relaxed">{step.check_ru}</p>}
          {step.on_receipt_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3 py-2.5">
              <p className="text-content-ink text-[13px] leading-relaxed">✓ {step.on_receipt_ru}</p>
            </div>
          )}

          {step.laura_help_ru && (
            <button
              onClick={() => navigate('/laura')}
              className="w-full text-content-navy bg-content-gold-bg border border-content-line rounded-full py-2.5 text-sm"
            >
              ✦ Спросить Лауру — {step.laura_help_ru.replace('Лаура может помочь ', '').replace(/\.$/, '')}
            </button>
          )}

          {step.url && (
            <a href={step.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline">
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
  const { visa, loading, country } = useVisa();
  const { by } = useVisaBy();
  const { kz } = useVisaKz();
  const [checked, setChecked] = useState<string[]>(loadChecks);
  // Страновая специфика документов над общим чек-листом (by/kz).
  const docsSpecifics =
    country === 'by' ? by?.docs_specifics_ru : country === 'kz' ? kz?.docs_specifics_ru : null;
  const openSteps = Boolean((location.state as { openSteps?: boolean } | null)?.openSteps);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!visa) {
    navigate('/path/visa');
    return null;
  }

  // Для Беларуси/Казахстана общий чек-лист должен читаться «под свою страну»:
  // пункты про РФ, рубли и российские сервисы скрываем — их страновая
  // специфика показана отдельным блоком выше.
  const RU_ONLY = /РФ|₽|росси|Cherehapa|OneTwoTrip|Ингосстрах|АльфаСтрахование/i;
  const noRu = (xs?: string[]) => xs?.filter((x) => !RU_ONLY.test(x));
  const steps = country === 'ru'
    ? visa.steps
    : visa.steps.map((s) => ({
        ...s,
        checklist_ru: noRu(s.checklist_ru),
        options_ru: noRu(s.options_ru),
        details_ru: noRu(s.details_ru),
        substeps_ru: noRu(s.substeps_ru),
        alternative_ru: s.alternative_ru && RU_ONLY.test(s.alternative_ru) ? undefined : s.alternative_ru,
      }));

  return (
    <ContentPage>
      <PageHeader
        crumb="Виза"
        title="Подробнее о документах"
        onBack={() => navigate('/path/visa', openSteps ? { state: { openSteps: true } } : undefined)}
      />

      <TldrCard stats={[{ value: String(steps.length), label: 'шагов' }]}>
        Пошаговый чек-лист документов и действий для визы D. Отмечай сделанное —
        <b> прогресс сохраняется</b>. Разверни шаг, чтобы увидеть детали.
      </TldrCard>

      {/* Страновая специфика документов (Беларусь/Казахстан) — над общим чек-листом */}
      {docsSpecifics && (
        <div className="mt-5">
          <InfoCard title={docsSpecifics.title_ru}>
            <p className="leading-relaxed">{docsSpecifics.intro_ru}</p>
            <div className="flex flex-col gap-2 mt-2.5">
              {docsSpecifics.items_ru.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                  <p className="text-content-ink text-[14px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-5">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} seed={visa} checked={checked} toggle={toggle} />
        ))}
      </div>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Суммы и требования меняются — перед подачей сверься с чек-листом своего консульства
      </p>
    </ContentPage>
  );
}
