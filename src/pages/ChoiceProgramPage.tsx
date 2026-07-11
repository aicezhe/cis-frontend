import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { loadQuizFilters } from '../lib/quiz';
import type { CourseCatalog } from '../types/api';

const stars = [
  { top: '6%', left: '12%', size: 3 },
  { top: '9%', left: '78%', size: 2 },
  { top: '13%', left: '40%', size: 2 },
  { top: '16%', left: '88%', size: 3 },
  { top: '19%', left: '22%', size: 2 },
  { top: '22%', left: '63%', size: 2 },
  { top: '25%', left: '8%', size: 3 },
  { top: '11%', left: '55%', size: 2 },
  { top: '17%', left: '70%', size: 2 },
  { top: '8%', left: '30%', size: 2 },
  { top: '4%', left: '50%', size: 2 },
  { top: '15%', left: '5%', size: 2 },
];

export default function ChoiceProgramPage() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<CourseCatalog | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const [courses, setCourses] = useState<CourseCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [broadened, setBroadened] = useState(false); // показали без фильтра кафедры
  const [saving, setSaving] = useState(false);

  // Пришли с English Bachelor — показываем все программы сразу без «выбери другое»
  const filters = loadQuizFilters();
  const isEnglishBachelor = filters.level === 'laurea' && filters.lang === 'en';

  // Загружаем курсы по фильтрам квиза. Если по кафедре пусто — расширяем выбор.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      const filters = loadQuizFilters();
      try {
        let list = await api.listCourses(filters);
        let broad = false;
        if (list.length === 0 && filters.dept_id != null) {
          // подбор по кафедре пуст (напр. нет программ нужного уровня) — убираем кафедру
          list = await api.listCourses({ level: filters.level, lang: filters.lang });
          broad = true;
        }
        if (list.length === 0) {
          // и так пусто — показываем вообще всё
          list = await api.listCourses();
          broad = true;
        }
        if (!cancelled) {
          setCourses(list);
          setBroadened(broad);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Не удалось загрузить курсы');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = showAll ? courses : courses.slice(0, 3);

  // плавное появление карточек по одной
  useEffect(() => {
    if (loading) return;
    setVisibleCount(0);
    const total = options.length;
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= total) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(timer);
  }, [showAll, loading, courses]);

  function showFullList() {
    setVisibleCount(0);
    setShowAll(true);
  }

  async function confirm() {
    if (!selected || saving) return;
    setSaving(true);
    try {
      // сохраняем выбранный курс в профиль (требует логина)
      await api.updateProfile({ course_id: selected.id });
    } catch {
      // если не залогинен — всё равно продолжаем (прототип), курс сохраним локально
    } finally {
      localStorage.setItem('cispr_course_id', selected.id);
      localStorage.setItem('cispr_course_name', selected.name);
      // стадию ставим только при первом прохождении онбординга (значения ещё нет).
      // при смене курса из настроек НЕ откатываем стадию назад на 'uni'.
      if (!localStorage.getItem('cispr_passed_quiz')) {
        localStorage.setItem('cispr_passed_quiz', 'uni');
      }
      setSaving(false);
      navigate('/course/' + selected.id);
    }
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-navy to-cream flex flex-col items-center px-6 pb-10 overflow-hidden">

      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cream"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.7,
          }}
        />
      ))}

      <button
        onClick={() => navigate('/onboarding')}
        className="absolute top-12 left-6 text-cream text-2xl z-10"
      >
        ←
      </button>

      <h1 className="font-serif text-cream text-3xl text-center mt-24 mb-2 z-10">
        Твои программы
      </h1>
      <p className="font-serif text-gold text-sm text-center mb-10 z-10 font-bold">
        {loading
          ? 'загружаем программы...'
          : error
            ? 'ошибка загрузки'
            : isEnglishBachelor
              ? 'все англоязычные программы бакалавриата'
              : showAll
                ? 'выбери любую из списка'
                : broadened
                  ? 'по твоему направлению пусто — вот другие'
                  : 'на основе твоего теста'}
      </p>

      {/* Состояние ошибки */}
      {error && !loading && (
        <div className="z-10 text-center">
          <p className="font-serif text-cream/80 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-serif text-cream text-sm underline"
          >
            повторить
          </button>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="z-10 flex flex-col gap-4 w-full">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-cream/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Карточки */}
      {!loading && !error && (
        <div className={
          'w-full z-10 ' +
          (showAll
            ? 'flex flex-col gap-3 max-h-[55vh] overflow-y-auto pb-4 no-scrollbar'
            : 'flex flex-col gap-4')
        }>
          {options.map((course, i) => {
            const isVisible = i < visibleCount;
            const isSelected = selected?.id === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelected(course)}
                className={
                  'relative font-serif rounded-2xl border transition-all duration-500 shrink-0 text-left ' +
                  (showAll ? 'py-4 px-5 ' : 'py-6 px-6 ') +
                  (isSelected
                    ? 'bg-navy text-gold border-gold'
                    : 'bg-cream/95 text-navy border-navy/30') + ' ' +
                  (isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4')
                }
              >
                {isSelected && (
                  <>
                    <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-gold" />
                    <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gold" />
                    <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gold" />
                    <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-gold" />
                  </>
                )}
                <span className={'block ' + (showAll ? 'text-lg' : 'text-xl')}>
                  {course.name}
                </span>
                <span className={
                  'block text-xs italic mt-1 ' +
                  (isSelected ? 'text-gold/80' : 'text-navy/50')
                }>
                  {course.lang === 'en' ? 'English' : 'Italiano'}
                  {course.is_stem ? ' · STEM' : ''}
                  {course.accesso === 'programmato' ? ' · Numero chiuso' : ''}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!loading && !error && !showAll && !isEnglishBachelor && courses.length > 3 && (
        <button
          onClick={showFullList}
          className="font-serif text-cream text-sm underline mt-6 z-10"
        >
          выбрать другое
        </button>
      )}

      <button
        onClick={confirm}
        disabled={!selected || saving}
        className={
          'font-serif text-cream text-lg rounded-full px-12 py-3 mt-8 z-10 ' +
          (selected && !saving ? 'bg-gold' : 'bg-gold/30 cursor-not-allowed')
        }
      >
        {saving ? '...' : 'ДАЛЕЕ'}
      </button>

      <div className="flex-1 min-h-10" />

    </div>
  );
}
