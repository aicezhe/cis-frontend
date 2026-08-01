import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { api } from '../lib/api';
import type { CourseFull } from '../types/api';
import { ContentPage, PageHeader, TldrCard, H2 } from '../components/content';
import { LoadingScreen } from '../components/Loader';

// Нормативный total CFU по типу программы — не сумма распарсенных предметов
const TARGET_CFU: Record<string, number> = {
  triennale: 180,
  magistrale: 120,
  ciclo_unico: 300,
};

// Длительность по типу программы (стандарт Болонской системы)
const DURATION: Record<string, [string, string]> = {
  triennale: ['3', 'года'],
  magistrale: ['2', 'года'],
  ciclo_unico: ['5–6', 'лет'],
};

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
        const hasOptional = subs.some((s) => s.optional);
        return (
          <div key={String(year)} className="bg-content-bg border border-content-line rounded-xl px-4 py-3">
            <p className="text-content-gold text-xs font-semibold uppercase tracking-wide mb-2">
              {typeof year === 'number' ? `${year}-й год` : 'Предметы'}
            </p>
            <div className="flex flex-col gap-1.5">
              {subs.map((s, i) => (
                <div key={i} className="flex justify-between items-baseline gap-3">
                  <p className={'text-[14.5px] ' + (s.optional ? 'text-content-ink-2 italic' : 'text-content-ink')}>
                    {s.name}{s.optional ? ' (по выбору)' : ''}
                  </p>
                  <span className="text-content-ink-2 text-xs flex-shrink-0">{s.cfu} CFU</span>
                </div>
              ))}
            </div>
            {hasOptional && (
              <p className="text-content-ink-2 text-[11px] italic mt-1.5">
                * предметы по выбору — записывается только один вариант
              </p>
            )}
          </div>
        );
      })}
      <div className="flex justify-between items-center px-1">
        <p className="text-content-ink-2 text-xs">Всего по программе</p>
        <p className="text-content-navy text-sm font-bold">{targetCfu ?? '—'} CFU</p>
      </div>
      <button
        onClick={() => navigate('/course/' + course.id)}
        className="w-full text-content-ink-2 text-sm border border-content-line rounded-full py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
      >
        Открыть полную страницу курса ↗
      </button>
    </div>
  );
}

export default function ProgramStructurePage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();

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
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!program) return null;

  const p = program.program;
  const hasSubjects = course && (
    (course.curricula?.length > 0 && course.curricula[0].subjects.length > 0) ||
    course.subjects.length > 0
  );

  const stats = course
    ? [
        { value: String(TARGET_CFU[course.level] ?? '—'), label: 'CFU всего' },
        ...(DURATION[course.level] ? [{ value: DURATION[course.level][0], label: DURATION[course.level][1] }] : []),
      ]
    : undefined;

  return (
    <ContentPage>
      <PageHeader crumb="Университет · Программа" title="Структура курса" backTo="/path/uni/program" />

      <TldrCard stats={stats}>{p.description_ru}</TldrCard>

      <H2>Твоя программа</H2>

      {courseLoading ? (
        <div className="h-16 bg-content-surface rounded-2xl animate-pulse mt-4" />
      ) : courseId && courseName ? (
        <div className="bg-content-surface border border-content-line rounded-2xl px-5 py-4 mt-4">
          <div className="flex justify-between items-start gap-3">
            <p className="text-content-navy text-[16.5px] font-semibold leading-snug flex-1">{courseName}</p>
            {course && (
              <span className="text-content-ink-2 text-xs flex-shrink-0 mt-0.5">
                {course.lang === 'en' ? 'English' : 'Italiano'}
                {course.is_stem ? ' · STEM' : ''}
              </span>
            )}
          </div>

          {course?.short_ru && (
            <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{course.short_ru}</p>
          )}

          {hasSubjects && (
            <button
              onClick={() => setShowSubjects(!showSubjects)}
              className="w-full flex items-center justify-between mt-3 pt-3 border-t border-content-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
            >
              <span className="text-content-ink text-sm">
                Учебный план{course ? ` · ${TARGET_CFU[course.level] ?? (course.curricula?.[0]?.subjects ?? course.subjects).reduce((s, x) => s + x.cfu, 0)} CFU` : ''}
              </span>
              <svg
                width="14" height="14" viewBox="0 0 14 14"
                className={'text-content-navy transition-transform ' + (showSubjects ? 'rotate-180' : '')}
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
              className="w-full mt-3 text-content-ink-2 text-sm border border-content-line rounded-full py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
            >
              Открыть страницу курса ↗
            </button>
          )}
        </div>
      ) : (
        <div className="bg-content-surface border border-content-line rounded-2xl px-5 py-4 mt-4 flex flex-col gap-3">
          <p className="text-content-ink-2 text-sm">Программа ещё не выбрана</p>
          <button
            onClick={() => navigate('/change-course')}
            className="text-white bg-content-navy rounded-full py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
          >
            Выбрать программу
          </button>
        </div>
      )}
    </ContentPage>
  );
}
