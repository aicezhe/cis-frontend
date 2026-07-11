import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { CourseFull, CourseSubject } from '../types/api';

const LEVEL_LABEL: Record<string, string> = {
  triennale: 'Бакалавриат',
  ciclo_unico: 'Единый цикл',
  magistrale: 'Магистратура',
};

// Полоса-шкала 1..5 с подписью. value=0 → не показываем (нет оценки).
function ScaleBar({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-3">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-serif text-navy text-sm font-bold">{label}</span>
        <span className="font-serif text-gold text-sm font-bold">{value}/5</span>
      </div>
      <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-navy transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {note && (
        <p className="font-serif text-navy/60 text-xs italic mt-2">{note}</p>
      )}
    </div>
  );
}

function groupByYear(subjects: CourseSubject[]): Map<number | string, CourseSubject[]> {
  const map = new Map<number | string, CourseSubject[]>();
  for (const s of subjects) {
    const key = s.year ?? 'Без года';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

// Учебный план по годам: карточки лет с предметами, выборные помечены.
function YearPlan({ subjects }: { subjects: CourseSubject[] }) {
  const yearGroups = groupByYear(subjects);
  return (
    <div className="flex flex-col gap-4">
      {[...yearGroups.entries()].map(([year, subs]) => (
        <div key={String(year)} className="bg-soft-cream border border-navy/20 rounded-2xl p-4">
          <p className="font-serif text-navy font-bold text-sm mb-3">
            {typeof year === 'number' ? `${year}-й год` : year}
          </p>
          <div className="flex flex-col gap-2">
            {subs.map((s, i) => (
              <div key={i} className="flex justify-between items-baseline gap-3">
                <p className={
                  'font-serif text-sm ' +
                  (s.optional ? 'text-navy/60 italic' : 'text-navy')
                }>
                  {s.name}{s.optional ? ' (по выбору)' : ''}
                </p>
                <p className="font-serif text-navy/50 text-xs flex-shrink-0">{s.cfu} CFU</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState<CourseFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [curIdx, setCurIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const data = await api.getCourse(id);
        if (!cancelled) setCourse(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Не удалось загрузить курс');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col gap-4 p-6 pt-16">
        <div className="h-8 w-2/3 rounded bg-navy/10 animate-pulse" />
        <div className="h-24 rounded-2xl bg-navy/10 animate-pulse" />
        <div className="h-40 rounded-2xl bg-navy/10 animate-pulse" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center gap-4 p-6">
        <p className="font-serif text-navy text-center">{error || 'Курс не найден'}</p>
        <button onClick={() => navigate(-1)} className="font-serif text-gold underline">
          назад
        </button>
      </div>
    );
  }

  const curricula = course.curricula ?? [];
  const hasCurricula = curricula.length > 0;
  const activeCur = hasCurricula ? curricula[Math.min(curIdx, curricula.length - 1)] : null;
  // Несколько направлений показываем вкладками; одно «Unico» — без вкладок.
  const showTabs = curricula.length > 1;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-32">

      <div className="px-6 pt-12">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка курса */}
      <div className="mx-6 mt-4 relative bg-navy rounded-3xl p-6">
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

        <h1 className="font-serif text-cream text-2xl leading-tight">{course.name}</h1>
        <p className="font-serif text-gold text-sm mt-2 font-bold">{course.dept_name}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="font-serif text-cream text-xs border border-gold/60 rounded-full px-3 py-1">
            {LEVEL_LABEL[course.level] || course.level}
          </span>
          <span className="font-serif text-cream text-xs border border-gold/60 rounded-full px-3 py-1">
            {course.lang === 'en' ? 'English' : 'Italiano'}
          </span>
          {course.is_stem && (
            <span className="font-serif text-navy bg-gold text-xs rounded-full px-3 py-1">
              STEM
            </span>
          )}
          {course.blended && (
            <span className="font-serif text-cream text-xs border border-gold/60 rounded-full px-3 py-1">
              blended
            </span>
          )}
        </div>
      </div>

      {/* ИИ-оценки */}
      {(course.difficulty > 0 || course.demand_it > 0) && (
        <>
          <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-3">
            Оценка ИИ
          </h3>
          <div className="px-6 flex flex-col gap-3">
            {course.difficulty > 0 && (
              <ScaleBar
                label="Сложность обучения"
                value={course.difficulty}
                note={course.difficulty_note}
              />
            )}
            {course.demand_it > 0 && (
              <ScaleBar
                label="Востребованность в Италии"
                value={course.demand_it}
                note={course.demand_note}
              />
            )}
          </div>
          <p className="font-serif text-navy/40 text-[11px] italic px-6 mt-2">
            Ориентировочная оценка ИИ, не официальная статистика
          </p>
        </>
      )}

      {/* Описание */}
      {course.short_ru && (
        <>
          <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-2">О программе</h3>
          <p className="font-serif text-navy/80 text-sm leading-relaxed px-6">{course.short_ru}</p>
        </>
      )}

      {/* Кем работать */}
      {course.jobs_ru.length > 0 && (
        <>
          <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-3">Кем работать</h3>
          <div className="px-6 flex flex-wrap gap-2">
            {course.jobs_ru.map((job, i) => (
              <span
                key={i}
                className="font-serif text-navy text-xs bg-soft-cream border border-navy/20 rounded-full px-3 py-1.5"
              >
                {job}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Учебный план: по направлениям (curricula) либо плоский список */}
      {hasCurricula ? (
        <>
          <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-3">
            Учебный план
          </h3>

          {showTabs && (
            <div className="px-6 mb-3 flex gap-2 overflow-x-auto pb-1 -mx-0">
              {curricula.map((cur, i) => (
                <button
                  key={cur.id}
                  onClick={() => setCurIdx(i)}
                  className={
                    'font-serif text-xs whitespace-nowrap rounded-full px-3 py-1.5 border transition-colors ' +
                    (i === curIdx
                      ? 'bg-navy text-cream border-navy'
                      : 'bg-soft-cream text-navy border-navy/20')
                  }
                >
                  {cur.name}
                </button>
              ))}
            </div>
          )}

          {activeCur && (
            <div className="px-6">
              {activeCur.note && (
                <p className="font-serif text-navy/60 text-xs italic mb-3">{activeCur.note}</p>
              )}
              <YearPlan subjects={activeCur.subjects} />
            </div>
          )}
        </>
      ) : (
        course.subjects.length > 0 && (
          <>
            <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-3">
              Учебный план
            </h3>
            <div className="px-6">
              <YearPlan subjects={course.subjects} />
            </div>
          </>
        )
      )}

      {/* Действия */}
      <div className="px-6 mt-10 flex flex-col gap-3">
        <button
          onClick={() => navigate('/scholarship')}
          className="font-serif text-navy bg-gold rounded-full py-3 text-base"
        >
          Рассчитать стипендию ER.GO
        </button>
        {course.url && (
          <a
            href={course.url}
            target="_blank"
            rel="noreferrer"
            className="font-serif text-navy/70 text-center text-sm underline"
          >
            Официальная страница курса ↗
          </a>
        )}
        <button
          onClick={() => navigate('/path')}
          className="font-serif text-cream bg-navy rounded-full py-3 text-base mt-2"
        >
          К моему пути
        </button>
      </div>

    </div>
  );
}
