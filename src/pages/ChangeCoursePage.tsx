// Смена курса прямо из настроек — без возврата к онбординг-тесту.
// Показывает текущий этап (Foundation / Бакалавриат / Магистратура),
// позволяет переключить этап и выбрать специальность из листающегося списка.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import type { CourseCatalog, ProgramLevel } from '../types/api';

type Stage = 'foundation' | 'bachelor' | 'master';

const STAGE_LABEL: Record<Stage, string> = {
  foundation: 'Foundation',
  bachelor: 'Бакалавриат',
  master: 'Магистратура',
};

function readStage(): Stage {
  const p = localStorage.getItem('cispr_program');
  if (p === 'foundation' || p === 'bachelor' || p === 'master') return p;
  return 'bachelor';
}

function Corners() {
  const base = 'absolute w-3 h-3 border-gold';
  return (
    <>
      <span className={base + ' top-2 left-2 border-t-2 border-l-2'} />
      <span className={base + ' top-2 right-2 border-t-2 border-r-2'} />
      <span className={base + ' bottom-2 left-2 border-b-2 border-l-2'} />
      <span className={base + ' bottom-2 right-2 border-b-2 border-r-2'} />
    </>
  );
}

export default function ChangeCoursePage() {
  const navigate = useNavigate();
  // этап, который был у юзера при заходе — для контекстного вопроса вверху
  const [initialStage] = useState<Stage>(readStage);
  // этап, выбранный сейчас (можно переключить)
  const [stage, setStage] = useState<Stage>(initialStage);
  const [lang, setLang] = useState<'all' | 'it' | 'en'>('all');

  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<CourseCatalog | null>(null);
  const [saving, setSaving] = useState(false);

  const savedCourseId = localStorage.getItem('cispr_course_id');

  // загрузка специальностей под выбранный этап + язык
  useEffect(() => {
    if (stage === 'foundation') {
      setCourses([]);
      setSelected(null);
      setError('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    const level: 'laurea' | 'magistrale' = stage === 'master' ? 'magistrale' : 'laurea';
    const filters = lang === 'all' ? { level } : { level, lang };
    api
      .listCourses(filters)
      .then((list) => {
        if (cancelled) return;
        setCourses(list);
        // подсветить текущий курс, если он есть в списке
        const cur = savedCourseId ? list.find((c) => c.id === savedCourseId) : undefined;
        setSelected(cur ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Не удалось загрузить специальности');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, lang]);

  const prompt =
    initialStage === 'foundation'
      ? 'Сейчас вы на Foundation. Хотите перейти на бакалавриат и выбрать специальность?'
      : initialStage === 'bachelor'
        ? 'Сейчас вы на бакалавриате. Можно поменять свой курс бакалавра ниже.'
        : 'Сейчас вы на магистратуре. Можно поменять свою программу ниже.';

  async function saveCourse() {
    if (!selected || saving) return;
    setSaving(true);
    const programLevel: ProgramLevel = stage === 'master' ? 'master' : 'bachelor';
    try {
      await api.updateProfile({ course_id: selected.id, program_level: programLevel });
    } catch {
      // не залогинен / сеть — сохраняем локально, не блокируем
    }
    localStorage.setItem('cispr_course_id', selected.id);
    localStorage.setItem('cispr_course_name', selected.name);
    localStorage.setItem('cispr_program', programLevel);
    setSaving(false);
    navigate('/settings');
  }

  async function saveFoundation() {
    if (saving) return;
    setSaving(true);
    try {
      await api.updateProfile({ program_level: 'foundation' });
    } catch {
      // не критично
    }
    localStorage.setItem('cispr_program', 'foundation');
    // у Foundation нет конкретной специальности — чистим выбранный курс
    localStorage.removeItem('cispr_course_id');
    localStorage.removeItem('cispr_course_name');
    setSaving(false);
    navigate('/settings');
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">

      {/* Шапка */}
      <div className="flex items-center gap-4 px-6 pt-12 pb-2">
        <button onClick={() => navigate('/settings')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-3xl font-bold">Поменять курс</h1>
      </div>

      {/* Контекстный вопрос */}
      <div className="mx-6 mt-3 bg-soft-cream border border-gold rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-base leading-relaxed">{prompt}</p>
      </div>

      {/* Переключатель этапа */}
      <div className="mx-6 mt-5">
        <p className="font-serif text-gold text-sm mb-2 font-bold">Этап обучения</p>
        <div className="flex gap-2">
          {(['foundation', 'bachelor', 'master'] as Stage[]).map((st) => (
            <button
              key={st}
              onClick={() => setStage(st)}
              className={
                'relative flex-1 font-serif text-sm rounded-xl py-3 border transition-colors ' +
                (stage === st
                  ? 'bg-navy text-gold border-navy'
                  : 'bg-soft-cream text-navy border-navy/25')
              }
            >
              {stage === st && <Corners />}
              {STAGE_LABEL[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Foundation — без выбора специальности */}
      {stage === 'foundation' ? (
        <div className="mx-6 mt-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-5">
          <p className="font-serif text-navy/80 text-base leading-relaxed">
            Foundation Year — подготовительный год, без выбора конкретной специальности.
            Специальность выберешь позже, когда перейдёшь на бакалавриат.
          </p>
        </div>
      ) : (
        <>
          {/* Фильтр по языку */}
          <div className="mx-6 mt-5">
            <p className="font-serif text-gold text-sm mb-2 font-bold">Язык программы</p>
            <div className="flex gap-2">
              {([
                { id: 'all', label: 'Все' },
                { id: 'it', label: 'Italiano' },
                { id: 'en', label: 'English' },
              ] as { id: 'all' | 'it' | 'en'; label: string }[]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLang(opt.id)}
                  className={
                    'flex-1 font-serif text-sm rounded-xl py-2.5 border transition-colors ' +
                    (lang === opt.id
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-soft-cream text-navy border-navy/25')
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Список специальностей */}
          <div className="mx-6 mt-5">
            <p className="font-serif text-gold text-sm mb-2 font-bold">
              {loading ? 'Загружаем специальности…' : `Выбери специальность (${courses.length})`}
            </p>

            {error && !loading && (
              <div className="text-center py-6">
                <p className="font-serif text-navy/70 text-sm mb-3">{error}</p>
                <button
                  onClick={() => setStage((s) => s)}
                  className="font-serif text-navy text-sm underline"
                >
                  повторить
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-soft-cream border border-navy/10 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-3 max-h-[48vh] overflow-y-auto pb-2 no-scrollbar">
                {courses.map((course) => {
                  const isSelected = selected?.id === course.id;
                  const isCurrent = savedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      onClick={() => setSelected(course)}
                      className={
                        'relative font-serif rounded-2xl border text-left px-5 py-4 shrink-0 transition-colors ' +
                        (isSelected
                          ? 'bg-navy text-gold border-navy'
                          : 'bg-soft-cream text-navy border-navy/25')
                      }
                    >
                      {isSelected && <Corners />}
                      <span className="block text-base leading-snug pr-2">{course.name}</span>
                      <span
                        className={
                          'block text-xs mt-1 ' + (isSelected ? 'text-gold/80 font-bold' : 'text-navy/50')
                        }
                      >
                        {course.lang === 'en' ? 'English' : 'Italiano'}
                        {course.is_stem ? ' · STEM' : ''}
                        {isCurrent ? ' · текущий' : ''}
                      </span>
                    </button>
                  );
                })}
                {courses.length === 0 && (
                  <p className="font-serif text-navy/50 text-sm italic text-center py-6">
                    По этому фильтру специальностей не нашлось
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Нижняя кнопка действия */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-cream/95 backdrop-blur border-t border-navy/10 px-6 py-4">
        {stage === 'foundation' ? (
          <button
            onClick={saveFoundation}
            disabled={saving}
            className={
              'w-full font-serif text-cream text-lg rounded-full py-3 ' +
              (saving ? 'bg-navy/40 cursor-not-allowed' : 'bg-navy')
            }
          >
            {saving ? '...' : 'Перейти на Foundation'}
          </button>
        ) : (
          <button
            onClick={saveCourse}
            disabled={!selected || saving}
            className={
              'w-full font-serif text-cream text-lg rounded-full py-3 ' +
              (selected && !saving ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
            }
          >
            {saving ? '...' : 'Сохранить курс'}
          </button>
        )}
      </div>

    </div>
  );
}
