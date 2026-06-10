import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { api } from '../lib/api';
import type { CourseFull } from '../types/api';

// Нормативный total CFU по типу программы — не сумма распарсенных предметов
const TARGET_CFU: Record<string, number> = {
  triennale: 180,
  magistrale: 120,
  ciclo_unico: 300,
};

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
        <p className="font-serif text-gold text-sm italic mt-0.5">{sub}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 14 14" className="text-navy flex-shrink-0 -rotate-90" fill="currentColor">
        <path d="M7 10L1 4h12L7 10z" />
      </svg>
    </button>
  );
}

// Предметы по годам с CFU
function CourseSubjectsList({ course }: { course: CourseFull }) {
  const navigate = useNavigate();

  // Собираем предметы: сначала из curricula (если есть), иначе из subjects
  const subjects = (() => {
    const curricula = course.curricula ?? [];
    if (curricula.length > 0) {
      // Берём первое направление
      return curricula[0].subjects;
    }
    return course.subjects;
  })();

  // Группируем по году
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

export default function ProgramOverviewPage() {
  const navigate = useNavigate();
  const { program, programType, loading } = useMyProgram();

  const courseId = localStorage.getItem('cispr_course_id');
  const courseName = localStorage.getItem('cispr_course_name');

  const [course, setCourse] = useState<CourseFull | null>(null);
  const [courseLoading, setCourseLoading] = useState(!!courseId);
  const [showSubjects, setShowSubjects] = useState(false);

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
  const isMag = programType === 'master';

  const cards = [
    { title: 'Дедлайны и шаги', sub: 'Что и когда делать', to: '/path/uni/program/steps' },
    { title: 'Документы', sub: 'Чек-лист всего что нужно', to: '/path/uni/program/documents' },
    { title: 'Стоимость и стипендия', sub: 'ISEE, ER.GO, no tax area', to: '/path/uni/program/finance' },
    { title: 'Языковые требования', sub: 'Сертификаты, тесты UniPR', to: '/path/uni/program/languages' },
    ...(!isMag ? [{ title: 'Numero chiuso и тесты', sub: 'IMAT, TOLC-MED, TOLC-A…', to: '/path/uni/program/numero-chiuso' }] : []),
  ];

  const hasSubjects = course && (
    (course.curricula?.length > 0 && course.curricula[0].subjects.length > 0) ||
    course.subjects.length > 0
  );

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка — тип программы */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          {/* Разбиваем «Бакалавриат» и «(Laurea triennale)» на отдельные строки */}
          <h1 className="font-serif text-navy text-3xl font-bold">
            {p.name_ru.replace(/\s*\(.*\)/, '')}
          </h1>
          <p className="font-serif text-gold text-lg italic mt-0.5">{p.name_it}</p>
          <p className="font-serif text-navy/60 text-xs mt-1">
            {p.duration_years} {p.duration_years === 2 ? 'года' : 'лет'} · {p.ects_total} CFU · {p.title_after}
          </p>
        </div>
      </div>

      {/* Блок выбранной программы с предметами */}
      <div className="mx-6 mt-5">
        <p className="font-serif text-gold text-sm italic mb-2">Твоя программа</p>
        {courseLoading ? (
          <div className="h-16 bg-soft-cream rounded-2xl animate-pulse" />
        ) : courseId && courseName ? (
          <div className="bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
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
          <div className="bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4 flex flex-col gap-3">
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

      {/* Описание */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-base leading-relaxed">{p.description_ru}</p>
      </div>

      {/* Важные заметки */}
      {p.important_notes_ru.length > 0 && (
        <div className="mx-6 mt-4 relative bg-navy rounded-2xl p-5">
          <Corners />
          <p className="font-serif text-gold text-xs italic uppercase tracking-widest mb-3 px-2">Важно знать</p>
          <div className="flex flex-col gap-3 px-2">
            {p.important_notes_ru.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold mt-0.5 flex-shrink-0">◆</span>
                <p className="font-serif text-cream text-sm leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Карточки навигации */}
      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Что нужно знать
      </h3>
      <div className="px-6 flex flex-col gap-3">
        {cards.map((card) => (
          <NavCard key={card.to} {...card} />
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Дедлайны актуальны на 2026/2027 — проверяй на apply.unipr.it перед подачей
      </p>
    </div>
  );
}
