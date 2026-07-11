import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { useMyLegalization } from '../hooks/useFoundation';
import { api } from '../lib/api';
import { Price } from '../components/Price';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { longPressHandlers } from '../lib/longPress';
import type { CourseFull } from '../types/api';
import type { RequiredDocument, TwelfthYearOptions } from '../types/laurea';

// Нормативный total CFU по типу программы — не сумма распарсенных предметов
const TARGET_CFU: Record<string, number> = {
  triennale: 180,
  magistrale: 120,
  ciclo_unico: 300,
};

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

// Круглый чекбокс в стиле раздела «Виза»/Foundation — переиспользуется и для
// шагов поступления, и для чек-листа документов (разные localStorage-ключи,
// разные id-префиксы, один и тот же визуал).
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

// Блок страновой легализации — единственная версия (раньше было два разных
// компонента: компактный в ProgramStepsPage и подробный в ProgramDocumentsPage,
// беру подробный как канонический).
function LegalizationBlock() {
  const { legalization, loading } = useMyLegalization();

  if (loading) {
    return (
      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="font-serif text-navy/50 text-xs italic">Загрузка данных по стране…</p>
      </div>
    );
  }

  if (!legalization) {
    return (
      <div className="mt-4 border-t border-navy/10 pt-3 flex flex-col gap-2">
        <p className="font-serif text-gold text-xs font-bold">Общий порядок легализации</p>
        <div className="flex flex-col gap-1.5">
          {[
            '1. Апостиль документа об образовании — через уполномоченный орган своей страны',
            '2. Нотариально заверенный перевод на итальянский у аккредитованного переводчика',
            '3. Признание в Италии: CIMEA (cimea-diplome.it) или DDV через консульство Италии',
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold text-xs flex-shrink-0 mt-0.5">◆</span>
              <p className="font-serif text-navy/70 text-xs leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        <p className="font-serif text-navy/40 text-[11px] italic">
          Для точного порядка по твоей стране — выбери страну в Настройках
        </p>
      </div>
    );
  }

  const leg = legalization.diploma_legalization;
  return (
    <div className="mt-4 border-t border-navy/10 pt-4 flex flex-col gap-3">
      <p className="font-serif text-gold text-xs font-bold">
        Порядок для {legalization.meta.country_name_ru}
        <span className="text-navy/40 ml-1">(источник: {legalization.meta.source})</span>
      </p>

      <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2">
        <p className="font-serif text-navy text-xs font-bold">
          {leg.country_in_hague ? '✓ Гаагская конвенция — апостиль' : 'Консульская легализация'}
        </p>
        <p className="font-serif text-navy/60 text-xs mt-0.5">
          Уполномоченный орган: {leg.competent_authority.name_ru}
        </p>
        {leg.competent_authority.website && (
          <a
            href={leg.competent_authority.website}
            target="_blank"
            rel="noreferrer"
            className="font-serif text-gold text-xs underline mt-0.5 inline-block"
          >
            {leg.competent_authority.website.replace('https://', '')} ↗
          </a>
        )}
      </div>

      {leg.steps.map((step, i) => (
        <div key={step.id} className="bg-cream border border-navy/10 rounded-xl px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-navy flex items-center justify-center text-cream text-[10px] flex-shrink-0">
              {i + 1}
            </span>
            <p className="font-serif text-navy text-sm font-bold">{step.title_ru}</p>
          </div>
          <p className="font-serif text-navy/70 text-xs leading-relaxed pl-7">{step.description_ru}</p>

          {(step.cost_local || step.cost_eur_approx) && (
            <p className="font-serif text-navy/60 text-xs pl-7 mt-1">
              💰 {step.cost_local}{step.cost_eur_approx ? ` (~${step.cost_eur_approx} €)` : ''}
              {step.duration_days ? ` · ⏱ ${step.duration_days}` : ''}
            </p>
          )}

          {step.options && step.options.length > 0 && (
            <div className="pl-7 mt-2 flex flex-col gap-1.5">
              {step.options.map((opt, j) => (
                <div key={j} className="border-l-2 border-gold pl-2">
                  <p className="font-serif text-navy text-xs font-bold">{opt.name}</p>
                  <p className="font-serif text-navy/60 text-xs">{opt.cost_eur} € · {opt.duration}</p>
                  {opt.pros_ru.map((pr, k) => (
                    <p key={k} className="font-serif text-navy/60 text-[11px]">＋ {pr}</p>
                  ))}
                  {opt.cons_ru.map((cn, k) => (
                    <p key={k} className="font-serif text-navy/40 text-[11px]">－ {cn}</p>
                  ))}
                </div>
              ))}
              {step.recommendation_ru && (
                <p className="font-serif text-gold text-xs font-bold">💡 {step.recommendation_ru}</p>
              )}
            </div>
          )}

          {step.warnings_ru && step.warnings_ru.length > 0 && (
            <div className="pl-7 mt-2 flex flex-col gap-1">
              {step.warnings_ru.map((w, k) => (
                <div key={k} className="flex items-start gap-1.5 bg-soft-cream border border-gold/50 rounded-lg px-2 py-1.5">
                  <span className="text-gold text-xs flex-shrink-0">!</span>
                  <p className="font-serif text-navy/70 text-[11px] leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {legalization.common_pitfalls_ru.length > 0 && (
        <div className="bg-soft-cream border border-gold/30 rounded-xl px-3 py-3">
          <p className="font-serif text-gold text-xs mb-2 font-bold">Частые ошибки при легализации</p>
          <div className="flex flex-col gap-1.5">
            {legalization.common_pitfalls_ru.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold text-xs flex-shrink-0 mt-0.5">◆</span>
                <p className="font-serif text-navy/70 text-xs leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Расширенное описание по id документа (перенесено из ProgramDocumentsPage)
const EXTRA_DETAILS: Record<string, { steps?: string[]; tip?: string }> = {
  language_cert: {
    steps: [
      'Для итальянского: CILS, CELI, PLIDA, Roma Tre — или бесплатный тест UniPR (CLA)',
      'Для английского: IELTS 6.0+, TOEFL iBT 80+, Cambridge FCE/CAE/CPE, TOEIC 785+',
      'UniPR Language Test сдаётся бесплатно через CLA — можно после приезда',
    ],
    tip: 'Если бакалавриат был полностью на английском — попроси у своего вуза Director\'s Statement (заменяет сертификат)',
  },
  recognition: {
    steps: [
      'CIMEA Statement of Verification — быстрее и проще, рекомендуется',
      'Dichiarazione di Valore (DDV) — через итальянское консульство в твоей стране, занимает дольше',
      'Для magistrale CIMEA предпочтительнее — комиссия лучше понимает структуру документа',
    ],
    tip: 'CIMEA можно заказать онлайн на cimea-diplome.it. DDV — в консульстве Италии лично.',
  },
  transcript_bachelor: {
    steps: [
      'Запроси в своём вузе транскрипт со всеми дисциплинами, оценками и количеством часов/кредитов',
      'Если вуз выдаёт Diploma Supplement — обязательно возьми',
      'Переведи на итальянский у аккредитованного переводчика',
      'Апостилируй аналогично диплому',
    ],
    tip: 'Чем подробнее транскрипт — тем проще пройдёт pre-evaluation. Комиссия смотрит именно на названия предметов.',
  },
  cv: {
    steps: [
      'Формат Europass (europass.europa.eu) — предпочтительный для Италии',
      'Укажи образование, языки, опыт (если есть), дополнительные курсы',
      'Язык: итальянский или английский в зависимости от программы',
    ],
  },
  motivation_letter: {
    steps: [
      'Объясни почему хочешь поступить именно на эту программу и именно в UniPR',
      'Свяжи свой бакалавриат с выбранной магистратурой',
      'Упомяни профессиональные планы и как программа помогает их реализовать',
      'Объём: 300-500 слов, язык программы',
    ],
    tip: 'Мотивационное письмо особенно важно при конкурсном отборе (IBD, FSM, MUNER).',
  },
};

function TwelfthYearBlock({ data }: { data: TwelfthYearOptions }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-cream border border-gold/30 rounded-2xl px-4 py-3">
        <p className="font-serif text-gold text-sm mb-1 font-bold">{data.title_ru}</p>
        <p className="font-serif text-navy/70 text-sm leading-relaxed">{data.explanation_ru}</p>
      </div>
      {data.options.map((opt) => {
        const isOpen = openId === opt.id;
        return (
          <div key={opt.id} className="bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : opt.id)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left"
            >
              <div className="flex-1">
                <p className="font-serif text-navy text-base font-bold">{opt.name_ru}</p>
                <p className="font-serif text-navy/60 text-xs mt-0.5 leading-relaxed">{opt.description_ru}</p>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 14 14"
                className={'text-navy flex-shrink-0 mt-1 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-navy/10 pt-3 flex flex-col gap-2">
                <p className="font-serif text-navy/50 text-xs italic">Документы для этого пути:</p>
                {opt.documents_ru.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                    <p className="font-serif text-navy/80 text-xs leading-relaxed">{doc}</p>
                  </div>
                ))}
                <div className="mt-1 bg-cream border border-navy/10 rounded-xl px-3 py-2">
                  <p className="font-serif text-navy/60 text-xs">
                    <span className="text-gold">→</span> {opt.best_for_ru}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="font-serif text-navy/40 text-[11px] italic px-1">{data.note_ru}</p>
    </div>
  );
}

function DocCard({ doc, checked, toggle }: {
  doc: RequiredDocument;
  checked: boolean;
  toggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDiploma = doc.linked_to_country_seed;
  const extra = EXTRA_DETAILS[doc.id];

  return (
    <div className={
      'bg-soft-cream border rounded-2xl px-4 py-4 ' +
      (doc.critical ? 'border-gold/60' : 'border-navy/20') +
      (checked ? ' opacity-60' : '')
    }>
      <div className="flex items-start gap-3">
        <button onClick={toggle} className="w-6 h-6 mt-0.5 flex-shrink-0">
          {checked ? (
            <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
          ) : (
            <div className={
              'w-6 h-6 rounded-full border-2 ' +
              (doc.critical ? 'border-gold' : 'border-navy/30')
            } />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={
              'font-serif text-base font-bold ' +
              (checked ? 'text-navy/50 line-through' : 'text-navy')
            }>
              {doc.name_ru}
            </p>
            {doc.critical && (
              <span className="font-serif text-[10px] text-gold border border-gold/60 rounded-full px-2 py-0.5 leading-none flex-shrink-0">
                важно
              </span>
            )}
            {doc.optional && (
              <span className="font-serif text-[10px] text-navy/50 border border-navy/20 rounded-full px-2 py-0.5 leading-none flex-shrink-0">
                по ситуации
              </span>
            )}
          </div>

          <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{doc.details_ru}</p>

          {extra?.steps && (
            <div className="mt-2 flex flex-col gap-1">
              {extra.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                  <p className="font-serif text-navy/70 text-xs leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          )}
          {extra?.tip && (
            <div className="mt-2 bg-cream border border-navy/10 rounded-xl px-3 py-2">
              <p className="font-serif text-navy/60 text-xs">💡 {extra.tip}</p>
            </div>
          )}

          {isDiploma && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1.5 font-serif text-gold text-xs"
            >
              <span>{expanded ? 'Скрыть' : 'Показать'} порядок легализации по стране</span>
              <svg
                width="12" height="12" viewBox="0 0 14 14"
                className={'transition-transform ' + (expanded ? 'rotate-180' : '')}
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
          )}

          {isDiploma && expanded && <LegalizationBlock />}
        </div>
      </div>
    </div>
  );
}

// Предметы по годам с CFU
function CourseSubjectsList({ course }: { course: CourseFull }) {
  const navigate = useNavigate();

  const subjects = (() => {
    const curricula = course.curricula ?? [];
    if (curricula.length > 0) return curricula[0].subjects;
    return course.subjects;
  })();

  const byYear = new Map<number | string, typeof subjects>();
  for (const s of subjects) {
    const key = s.year ?? '—';
    if (!byYear.has(key)) byYear.set(key, []);
    byYear.get(key)!.push(s);
  }

  const targetCfu = TARGET_CFU[course.level];

  return (
    <div className="mt-4 flex flex-col gap-3">
      {[...byYear.entries()].map(([year, subs]) => {
        const hasOptional = subs.some(s => s.optional);
        return (
          <div key={String(year)} className="bg-cream border border-navy/10 rounded-xl px-4 py-3">
            <p className="font-serif text-navy/60 text-xs italic mb-2">
              {typeof year === 'number' ? `${year}-й год` : 'Предметы'}
            </p>
            <div className="flex flex-col gap-1.5">
              {subs.map((s, i) => (
                <div key={i} className="flex justify-between items-baseline gap-3">
                  <p className={
                    'font-serif text-sm ' +
                    (s.optional ? 'text-navy/50 italic' : 'text-navy/80')
                  }>
                    {s.name}{s.optional ? ' (по выбору)' : ''}
                  </p>
                  <span className="font-serif text-navy/40 text-xs flex-shrink-0">{s.cfu} CFU</span>
                </div>
              ))}
            </div>
            {hasOptional && (
              <p className="font-serif text-navy/40 text-[11px] italic mt-1.5">
                * предметы по выбору — записывается только один вариант
              </p>
            )}
          </div>
        );
      })}
      <div className="flex justify-between items-center px-1">
        <p className="font-serif text-navy/50 text-xs italic">Всего по программе</p>
        <p className="font-serif text-navy text-sm font-bold">{targetCfu ?? '—'} CFU</p>
      </div>
      <button
        onClick={() => navigate('/course/' + course.id)}
        className="w-full font-serif text-navy/70 text-sm border border-navy/20 rounded-full py-2.5"
      >
        Открыть полную страницу курса ↗
      </button>
    </div>
  );
}

const STEPS_KEY = 'cispr_steps_checks';
const DOCS_KEY = 'cispr_docs_checklist';

function loadList(key: string): string[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

export default function ProgramOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { program, programType, loading } = useMyProgram();

  const courseId = localStorage.getItem('cispr_course_id');
  const courseName = localStorage.getItem('cispr_course_name');

  const [course, setCourse] = useState<CourseFull | null>(null);
  const [courseLoading, setCourseLoading] = useState(!!courseId);
  const [showSubjects, setShowSubjects] = useState(false);

  // Аккордеон — та же логика, что в FoundationOverviewPage. Можно прийти
  // сюда с уже выбранной секцией (напр. из Визы — «покажи документы»).
  const initialSection = (location.state as { openSection?: number } | null)?.openSection ?? 1;
  const [expanded, setExpanded] = useState(initialSection);

  const [stepChecks, setStepChecks] = useState<string[]>(() => loadList(STEPS_KEY));
  const [docChecks, setDocChecks] = useState<string[]>(() => loadList(DOCS_KEY));
  const [expenseFor, setExpenseFor] = useState<string | null>(null);

  function toggleStep(id: string) {
    setStepChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STEPS_KEY, JSON.stringify(next));
      return next;
    });
  }
  function toggleDoc(id: string) {
    setDocChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(DOCS_KEY, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    if (!courseId) { setCourseLoading(false); return; }
    let cancelled = false;
    api.getCourse(courseId).then((d) => {
      if (!cancelled) { setCourse(d); setCourseLoading(false); }
    }).catch(() => {
      if (!cancelled) setCourseLoading(false);
    });
    return () => { cancelled = true; };
  }, [courseId]);

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

  const hasSubjects = course && (
    (course.curricula?.length > 0 && course.curricula[0].subjects.length > 0) ||
    course.subjects.length > 0
  );

  const fees = program.tuition_fees;
  const noTax = fees.no_tax_area;
  const withoutIsee = fees.without_isee;
  const ergo = fees.scholarships?.ergo_borsa;

  const lr = program.language_requirements;
  const completedFY = localStorage.getItem('cispr_completed_fy') === 'true';

  const docs = program.documents_required;
  const docsTotal = docs.length;
  const docsDone = docs.filter((d) => docChecks.includes(d.id)).length;
  const docsPct = docsTotal > 0 ? Math.round((docsDone / docsTotal) * 100) : 0;

  const deadline = program.deadlines_2026_2027;
  const windowStr = (deadline['application_window'] || deadline['application_window_english'] || '') as string;

  const sections = [
    { id: 1, title: 'Структура курса', sub: p.name_it },
    { id: 2, title: 'Документы', sub: `${docsDone} из ${docsTotal} готово` },
    { id: 3, title: 'Стоимость и оплата', sub: `от ${noTax.amount_eur} € в год` },
    { id: 4, title: 'Языковые требования', sub: 'Итальянский, английский, сертификаты' },
    { id: 5, title: 'Шаги поступления', sub: 'Документы, дедлайны, заявка' },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как Foundation) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">
          {p.name_ru.replace(/\s*\(.*\)/, '')}
        </h1>
        <p className="font-serif text-gold text-lg mt-0.5 italic">{p.name_it}</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {p.duration_years} {p.duration_years === 2 ? 'года' : 'лет'} · {p.ects_total} CFU · {p.title_after}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 40, height: 1 }} />
      </div>

      {/* Важные заметки — просто длинный синий блок, без декора (как Foundation) */}
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

      {/* Аккордеон-разделы — тот же шаблон, что в Foundation Year */}
      <div className="px-6 flex flex-col gap-3">
        {sections.map((s) => {
          const isExpanded = expanded === s.id;
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

                  {/* 1. Структура курса */}
                  {s.id === 1 && (
                    <div className="flex flex-col gap-4">
                      <p className="font-serif text-navy/80 text-sm leading-relaxed">{p.description_ru}</p>

                      {courseLoading ? (
                        <div className="h-16 bg-cream rounded-xl animate-pulse" />
                      ) : courseId && courseName ? (
                        <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <div className="flex justify-between items-start gap-3">
                            <p className="font-serif text-navy text-base font-bold leading-snug flex-1">{courseName}</p>
                            {course && (
                              <span className="font-serif text-navy/50 text-xs flex-shrink-0 mt-0.5">
                                {course.lang === 'en' ? 'English' : 'Italiano'}
                                {course.is_stem ? ' · STEM' : ''}
                              </span>
                            )}
                          </div>

                          {course?.short_ru && (
                            <p className="font-serif text-navy/70 text-sm leading-relaxed mt-2">{course.short_ru}</p>
                          )}

                          {hasSubjects && (
                            <button
                              onClick={() => setShowSubjects(!showSubjects)}
                              className="w-full flex items-center justify-between mt-3 pt-3 border-t border-navy/10"
                            >
                              <p className="font-serif text-navy/70 text-sm">
                                Учебный план{course ? ` · ${TARGET_CFU[course.level] ?? (course.curricula?.[0]?.subjects ?? course.subjects).reduce((s, x) => s + x.cfu, 0)} CFU` : ''}
                              </p>
                              <svg
                                width="14" height="14" viewBox="0 0 14 14"
                                className={'text-navy transition-transform ' + (showSubjects ? 'rotate-180' : '')}
                                fill="currentColor"
                              >
                                <path d="M7 10L1 4h12L7 10z" />
                              </svg>
                            </button>
                          )}

                          {showSubjects && course && <CourseSubjectsList course={course} />}

                          {!hasSubjects && !courseLoading && (
                            <button
                              onClick={() => navigate('/course/' + courseId)}
                              className="w-full mt-3 font-serif text-navy/70 text-sm border border-navy/20 rounded-full py-2"
                            >
                              Открыть страницу курса ↗
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3 flex flex-col gap-3">
                          <p className="font-serif text-navy/60 text-sm">Программа ещё не выбрана</p>
                          <button
                            onClick={() => navigate('/change-course')}
                            className="font-serif text-cream bg-navy rounded-full py-2.5 text-sm"
                          >
                            Выбрать программу
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Документы */}
                  {s.id === 2 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                        <div className="flex justify-between items-baseline mb-2">
                          <p className="font-serif text-navy text-sm">Готово</p>
                          <p className="font-serif text-navy/60 text-xs">{docsDone} из {docsTotal}</p>
                        </div>
                        <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-navy transition-all duration-500"
                            style={{ width: `${docsPct}%` }}
                          />
                        </div>
                      </div>

                      {docs.map((doc) => (
                        <DocCard
                          key={doc.id}
                          doc={doc}
                          checked={docChecks.includes(doc.id)}
                          toggle={() => toggleDoc(doc.id)}
                        />
                      ))}

                      {isBachelor && program.twelfth_year_options && (
                        <>
                          <p className="font-serif text-gold text-sm mt-2 font-bold">
                            12 лет образования — как закрыть
                          </p>
                          <TwelfthYearBlock data={program.twelfth_year_options} />
                        </>
                      )}
                    </div>
                  )}

                  {/* 3. Стоимость и оплата */}
                  {s.id === 3 && (
                    <div className="flex flex-col gap-3">
                      <p className="font-serif text-navy/80 text-sm leading-relaxed">{fees.explanation_ru}</p>

                      <div className="relative bg-navy rounded-2xl p-5">
                        <Corners />
                        <p className="font-serif text-gold text-sm font-bold">С ISEE parificato ≤ {noTax.isee_threshold_eur.toLocaleString()} €</p>
                        <p className="font-serif text-cream text-3xl font-bold mt-2">
                          <Price eur={noTax.amount_eur} />
                        </p>
                        <p className="font-serif text-cream/70 text-sm mt-2 leading-relaxed">
                          {noTax.components_ru || 'Региональный налог + виртуальная марка — это вся плата за год'}
                        </p>
                        <p className="font-serif text-gold text-xs mt-2 font-bold">
                          ISEE parificato оформляется бесплатно через CAF в Италии
                        </p>
                      </div>

                      <div className="bg-cream border border-navy/15 rounded-2xl p-5">
                        <p className="font-serif text-navy/60 text-sm italic">Без ISEE / с высоким ISEE</p>
                        <p className="font-serif text-navy text-2xl font-bold mt-2">
                          <Price eur={withoutIsee.amount_eur_min} />
                          {' – '}
                          <Price eur={withoutIsee.amount_eur_max} />
                        </p>
                        <p className="font-serif text-navy/70 text-sm mt-2 leading-relaxed">{withoutIsee.note_ru}</p>
                      </div>

                      {ergo && (
                        <div className="bg-cream border border-navy/15 rounded-2xl px-5 py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-serif text-navy text-base font-bold">{ergo.name}</p>
                              {ergo.for_whom && (
                                <p className="font-serif text-navy/70 text-sm mt-1 leading-relaxed">{ergo.for_whom}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="font-serif text-navy/60 text-xs">до</p>
                              <p className="font-serif text-navy text-xl font-bold">
                                <Price eur={ergo.max_amount_eur} />
                              </p>
                              <p className="font-serif text-navy/60 text-xs">в год</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/scholarship')}
                            className="w-full mt-4 font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
                          >
                            Рассчитать мою стипендию ER.GO →
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => navigate('/path/uni/program/isee')}
                        className="relative bg-navy rounded-2xl px-5 py-4 text-left"
                      >
                        <Corners />
                        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ документы ¬</p>
                        <p className="font-serif text-cream text-lg leading-snug">Как собрать документы для ISEE</p>
                        <p className="font-serif text-cream/60 text-sm mt-1">Персональная схема под твою семью</p>
                      </button>

                      <div className="bg-cream border border-gold/40 rounded-2xl px-5 py-4">
                        <p className="font-serif text-gold text-sm mb-2 font-bold">💡 Как сэкономить</p>
                        <p className="font-serif text-navy/80 text-sm leading-relaxed">
                          Сразу после приезда в Италию — иди в ближайший CAF и оформи ISEE parificato. Это бесплатно
                          и займёт 1-2 визита. С ISEE ≤ 27 000 € ты платишь только 156 € в год вместо 1500-2500 €.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4. Языковые требования */}
                  {s.id === 4 && (
                    <div className="flex flex-col gap-3">
                      {completedFY && (
                        <div className="bg-navy rounded-2xl px-5 py-4">
                          <p className="font-serif text-gold text-sm mb-1 font-bold">Foundation Year завершён</p>
                          <p className="font-serif text-cream text-sm leading-relaxed">
                            Сертификат Italstudio B2 из Foundation Year UniPR засчитывается для поступления на италоязычный бакалавриат автоматически.
                          </p>
                        </div>
                      )}

                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-serif text-navy text-base font-bold">Итальянский</p>
                          <span className="font-serif text-gold text-sm border border-gold/60 rounded-full px-3 py-1">
                            {lr.italian_taught_courses.level}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {lr.italian_taught_courses.accepted_certificates.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-gold text-sm">◆</span>
                              <p className="font-serif text-navy/80 text-sm">{cert}</p>
                            </div>
                          ))}
                        </div>
                        {lr.italian_taught_courses.exemption_for_fy && !completedFY && (
                          <p className="font-serif text-navy/60 text-xs italic mt-3 leading-relaxed">
                            💡 {lr.italian_taught_courses.exemption_for_fy}
                          </p>
                        )}
                      </div>

                      <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-serif text-navy text-base font-bold">Английский</p>
                          <span className="font-serif text-gold text-sm border border-gold/60 rounded-full px-3 py-1">
                            {lr.english_taught_courses.level}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {lr.english_taught_courses.accepted_certificates.map((cert, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-gold text-sm">◆</span>
                              <p className="font-serif text-navy/80 text-sm">{cert}</p>
                            </div>
                          ))}
                        </div>
                        {lr.english_taught_courses.exemption_ru && (
                          <p className="font-serif text-navy/60 text-xs italic mt-3 leading-relaxed">
                            💡 {lr.english_taught_courses.exemption_ru}
                          </p>
                        )}
                      </div>

                      <div className="bg-cream border border-gold/40 rounded-xl px-4 py-3">
                        <p className="font-serif text-gold text-sm mb-2 font-bold">🎓 UniPR Language Test — бесплатно</p>
                        <p className="font-serif text-navy/80 text-sm leading-relaxed">
                          UniPR предлагает собственный языковой тест через CLA (Centro Linguistico di Ateneo).
                          Он признаётся для поступления и не требует оплаты.
                          Можно сдать после приезда или уточнить возможность онлайн-сдачи.
                        </p>
                      </div>

                      {lr.duolingo_note_ru && (
                        <div className="bg-cream border border-navy/15 rounded-xl px-4 py-3">
                          <p className="font-serif text-gold text-sm mb-1 font-bold">Про Duolingo</p>
                          <p className="font-serif text-navy/70 text-sm leading-relaxed">{lr.duolingo_note_ru}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Шаги поступления — ключевой раздел, долгий тап по карточке = добавить расход */}
                  {s.id === 5 && (
                    <div className="flex flex-col gap-3">
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

                                {step.linked_to_country_seed && <LegalizationBlock />}

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

                      {isBachelor && (
                        <NavCard
                          title="Numero chiuso и тесты"
                          sub="IMAT, TOLC-MED, TOLC-A…"
                          to="/path/uni/program/numero-chiuso"
                        />
                      )}

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
              )}
            </div>
          );
        })}
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
