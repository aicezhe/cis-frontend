import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { useMyLegalization } from '../hooks/useFoundation';
import { Price } from '../components/Price';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { longPressHandlers } from '../lib/longPress';

// Ключевые термины в «Важно знать» подсвечиваем золотым,
// чтобы взгляд цеплялся за смысл, а не за стену текста.
const HIGHLIGHT_TERMS = [
  'LIBERO ACCESSO',
  'NUMERO CHIUSO',
  'libero accesso',
  'numero chiuso',
  'Foundation Year',
  'non-EU',
  'OFA',
  'TOLC',
  'verifica',
  'ciclo unico',
  'diploma di laurea',
  'laurea magistrale',
  '12 ЛЕТ',
  '12 лет',
  '11 лет',
];

function renderHighlights(text: string) {
  const escaped = HIGHLIGHT_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  escaped.sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    HIGHLIGHT_TERMS.includes(part)
      ? <span key={i} className="text-gold font-semibold">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function NavCard({ title, sub, to }: { title: string; sub: string; to: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="w-full rounded-2xl border border-navy/20 bg-soft-cream p-4 flex items-center gap-3 text-left"
    >
      <div className="flex-1">
        <h4 className="font-serif text-navy text-xl font-bold">{title}</h4>
        <p className="font-serif text-gold text-sm mt-0.5 font-bold">{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 14 14" className="text-navy flex-shrink-0 -rotate-90" fill="currentColor">
        <path d="M7 10L1 4h12L7 10z" />
      </svg>
    </button>
  );
}

function CheckBox({ id, checks, toggle }: { id: string; checks: string[]; toggle: (id: string) => void }) {
  const done = checks.includes(id);
  return (
    <button onClick={() => toggle(id)} className="w-6 h-6 mt-0.5 flex-shrink-0">
      {done ? (
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
      )}
    </button>
  );
}

// Компактная врезка легализации внутри шага — полная версия теперь на
// отдельной странице «Диплом», здесь только ссылка туда.
function DiplomaLink() {
  const navigate = useNavigate();
  const { legalization } = useMyLegalization();
  return (
    <button
      onClick={() => navigate('/path/uni/program/diploma')}
      className="mt-3 flex items-center gap-1.5 font-serif text-gold text-sm"
    >
      <span>Легализация диплома{legalization ? ` — ${legalization.meta.country_name_ru}` : ''}</span>
      <span>→</span>
    </button>
  );
}

const STEPS_KEY = 'cispr_steps_checks';

function loadList(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

export default function ProgramOverviewPage() {
  const navigate = useNavigate();
  const { program, programType, loading } = useMyProgram();

  const [stepsOpen, setStepsOpen] = useState(true);
  const [stepChecks, setStepChecks] = useState<string[]>(() => loadList(STEPS_KEY));
  const [expenseFor, setExpenseFor] = useState<string | null>(null);

  function toggleStep(id: string) {
    setStepChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STEPS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (!program || !programType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="text-center">
          <p className="font-serif text-navy text-base mb-4">
            Программа не определена. Пройди онбординг, чтобы выбрать бакалавриат или магистратуру.
          </p>
          <button onClick={() => navigate('/onboarding')} className="font-serif text-cream bg-navy rounded-full px-8 py-3">
            Пройти онбординг
          </button>
        </div>
      </div>
    );
  }

  const p = program.program;
  const isBachelor = programType === 'bachelor';
  const deadline = program.deadlines_2026_2027;
  const windowStr = (deadline['application_window'] || deadline['application_window_english'] || '') as string;

  const buttons = [
    { title: 'Структура курса', sub: 'Описание, учебный план', to: '/path/uni/program/structure' },
    { title: 'Документы', sub: 'Чек-лист всего что нужно', to: '/path/uni/program/documents' },
    { title: 'Диплом', sub: 'Апостиль, перевод, CIMEA/DDV', to: '/path/uni/program/diploma' },
    { title: 'Стоимость и оплата', sub: 'ISEE, ER.GO, no tax area', to: '/path/uni/program/finance' },
    { title: 'Языковые требования', sub: 'Сертификаты, тесты UniPR', to: '/path/uni/program/languages' },
    ...(isBachelor ? [{ title: 'Numero chiuso и тесты', sub: 'IMAT, TOLC-MED, TOLC-A…', to: '/path/uni/program/numero-chiuso' }] : []),
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">
          {p.name_ru.replace(/\s*\(.*\)/, '')}
        </h1>
        <p className="font-serif text-gold text-lg mt-0.5 italic">{p.name_it}</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {p.duration_years} {p.duration_years === 2 ? 'года' : 'лет'} · {p.ects_total} CFU · {p.title_after}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Важные заметки — длинный синий блок, без декора */}
      {p.important_notes_ru.length > 0 && (
        <div className="mx-6 mt-6 bg-navy rounded-2xl px-5 py-5">
          <div className="flex flex-col gap-4">
            {p.important_notes_ru.map((note, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-gold text-[10px] mt-1.5 flex-shrink-0">◆</span>
                <p className="font-sans text-cream/90 text-[13px] leading-[1.7]">
                  {renderHighlights(note)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Об универе
      </h3>

      <div className="px-6 flex flex-col gap-3">

        {/* Шаги поступления — единственный раздел прямо на странице, открыт
            по умолчанию. Обычный аккордеон: рамка золотая только пока открыт,
            без постоянных бейджей — как остальные секции у Foundation. */}
        <div className={
          'rounded-2xl border p-4 ' +
          (stepsOpen ? 'bg-soft-cream border-gold border-2' : 'bg-soft-cream border-navy/20')
        }>
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="flex-1">
              <h4 className="font-serif text-navy text-xl font-bold">Шаги поступления</h4>
              <p className="font-serif text-gold text-sm mt-0.5 font-bold">Документы, дедлайны, заявка</p>
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
              <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                <p className="font-serif text-gold text-sm mb-2 font-bold">Ориентировочные сроки 2026/2027</p>
                {windowStr && (
                  <p className="font-serif text-navy text-sm font-bold">📅 Подача: {windowStr}</p>
                )}
                {(deadline['universitaly_preenrolment'] as string) && (
                  <p className="font-serif text-navy/80 text-sm mt-1">
                    Universitaly: {deadline['universitaly_preenrolment'] as string}
                  </p>
                )}
                {(deadline['warnings_ru'] as string[] | undefined)?.map((w, i) => (
                  <p key={i} className="font-serif text-navy/60 text-xs italic mt-1">⚠ {w}</p>
                ))}
              </div>

              {program.application_steps.map((step, idx) => {
                const isDone = stepChecks.includes(step.id);
                const hasCost = step.cost_eur !== undefined && step.cost_eur !== 0;
                return (
                  <div
                    key={step.id}
                    className={
                      'relative bg-cream border rounded-xl px-4 py-3 select-none ' +
                      (isDone ? 'border-navy/15 opacity-70' : 'border-navy/15')
                    }
                    style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
                    {...longPressHandlers(() => setExpenseFor(step.title_ru))}
                  >
                    <span
                      className="absolute top-3 right-3 w-5 h-5 rounded-full border border-gold/50 flex items-center justify-center text-gold text-xs"
                      title="Долгий тап — добавить свой расход"
                    >
                      +
                    </span>
                    <div className="flex items-start gap-3">
                      <CheckBox id={step.id} checks={stepChecks} toggle={toggleStep} />
                      <div className="flex-1 pr-4">
                        <p className="font-serif text-gold text-xs font-bold">Шаг {idx + 1}</p>
                        <h5 className={
                          'font-serif text-lg font-bold mt-0.5 ' +
                          (isDone ? 'text-navy/50 line-through' : 'text-navy')
                        }>
                          {step.title_ru}
                        </h5>

                        {step.duration_ru && (
                          <span className="inline-block font-serif text-navy/60 text-xs bg-soft-cream border border-navy/15 rounded-full px-2.5 py-1 mt-2">
                            🕑 {step.duration_ru}
                          </span>
                        )}
                        {step.deadline_ru && (
                          <span className="inline-block font-serif text-gold text-xs bg-soft-cream border border-gold/50 rounded-full px-2.5 py-1 mt-2 ml-1">
                            ⚑ {step.deadline_ru}
                          </span>
                        )}

                        <p className="font-serif text-navy/75 text-sm leading-relaxed mt-2">
                          {step.description_ru}
                        </p>

                        {hasCost && (
                          <p className="font-serif text-navy text-sm mt-2">
                            Стоимость:{' '}
                            {typeof step.cost_eur === 'number'
                              ? <Price eur={step.cost_eur} />
                              : <span className="text-gold">{step.cost_eur} €</span>
                            }
                          </p>
                        )}

                        {step.tip_ru && (
                          <div className="mt-2 bg-soft-cream border border-navy/10 rounded-xl px-3 py-2">
                            <p className="font-serif text-navy/70 text-xs">💡 {step.tip_ru}</p>
                          </div>
                        )}

                        {step.platform_url && (
                          <a
                            href={step.platform_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block font-serif text-gold text-xs underline mt-2"
                          >
                            {step.platform_url.replace('https://', '')} ↗
                          </a>
                        )}

                        {step.warnings_ru && step.warnings_ru.length > 0 && (
                          <div className="flex flex-col gap-1.5 mt-3">
                            {step.warnings_ru.map((w, i) => (
                              <div key={i} className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2">
                                <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
                                <p className="font-serif text-navy/80 text-xs">{w}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {step.warning_ru && (
                          <div className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2 mt-3">
                            <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
                            <p className="font-serif text-navy/80 text-xs">{step.warning_ru}</p>
                          </div>
                        )}

                        {step.linked_to_country_seed && <DiplomaLink />}

                        {step.next_step_ru && (
                          <p className="font-serif text-gold text-sm mt-3 font-bold">
                            → {step.next_step_ru}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-1">
                <p className="font-serif text-gold text-sm mb-1.5 font-bold">Частые ошибки</p>
                <div className="flex flex-col gap-1.5">
                  {program.common_pitfalls_ru.map((pf, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
                      <p className="font-serif text-navy/80 text-sm">{pf}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/path/visa')}
                className="w-full font-serif text-cream bg-navy rounded-full py-3 text-base mt-1"
              >
                Перейти к разделу Виза →
              </button>
            </div>
          )}
        </div>

        {/* Остальное — кнопки-переходы на отдельные страницы */}
        {buttons.map((b) => (
          <NavCard key={b.to} {...b} />
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Дедлайны актуальны на 2026/2027 — проверяй на apply.unipr.it перед подачей
      </p>

      {expenseFor && (
        <AddExpenseSheet
          defaultCategory="uni"
          defaultLabel={expenseFor}
          onClose={() => setExpenseFor(null)}
        />
      )}
    </div>
  );
}
