import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mainOptions = ['Вариант 1', 'Вариант 2', 'Вариант 3'];

const allPrograms = [
  'Ingegneria gestionale',
  'Ingegneria informatica',
  'Economia e management',
  'Scienze della comunicazione',
  'Lingue e culture moderne',
  'Giurisprudenza',
  'Architettura',
  'Biologia',
  'Medicina e chirurgia',
  'Farmacia',
];

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
  const [selected, setSelected] = useState('');
  const [visibleCount, setVisibleCount] = useState(0);

  // плавное появление карточек по одной
  useEffect(() => {
    const total = showAll ? allPrograms.length : mainOptions.length;
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= total) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(timer);
  }, [showAll]);

  // когда переключаем на полный список — сброс счётчика
  function showFullList() {
    setVisibleCount(0);
    setShowAll(true);
  }

  function confirm() {
    if (!selected) return;
    console.log('Выбрана программа:', selected);
    localStorage.setItem('cispr_program', selected);
    localStorage.setItem('cispr_passed_quiz', 'uni');
    navigate('/path');
  }

  const options = showAll ? allPrograms : mainOptions;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-navy to-cream flex flex-col items-center px-6 pb-10 overflow-hidden">

      {/* звёзды */}
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

      {/* стрелка назад */}
      <button
        onClick={() => navigate('/onboarding')}
        className="absolute top-12 left-6 text-cream text-2xl z-10"
      >
        ←
      </button>

      <h1 className="font-serif text-cream text-3xl text-center mt-24 mb-2 z-10">
        Твои программы
      </h1>
      <p className="font-serif text-gold text-sm italic text-center mb-10 z-10">
        {showAll ? 'выбери любую из списка' : 'на основе твоего теста'}
      </p>

      {/* Карточки */}
      <div className={
        'w-full z-10 ' +
        (showAll
          ? 'flex flex-col gap-3 max-h-[55vh] overflow-y-auto pb-4 no-scrollbar'
          : 'flex flex-col gap-4')
      }>
        {options.map((option, i) => {
          const isVisible = i < visibleCount;
          const isSelected = selected === option;
          return (
            <button
              key={option}
              onClick={() => setSelected(option)}
              className={
                'relative font-serif rounded-2xl border transition-all duration-500 shrink-0 ' +
                (showAll ? 'py-4 px-5 text-lg ' : 'py-7 px-6 text-2xl ') +
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
              {option}
            </button>
          );
        })}
      </div>

      {/* Кнопка "Выбрать другое" — только в режиме 3 карточек */}
      {!showAll && (
        <button
          onClick={showFullList}
          className="font-serif text-cream text-sm underline mt-6 z-10"
        >
          выбрать другое
        </button>
      )}

      {/* Кнопка подтверждения */}
      <button
        onClick={confirm}
        disabled={!selected}
        className={
          'font-serif text-cream text-lg rounded-full px-12 py-3 mt-8 z-10 ' +
          (selected ? 'bg-gold' : 'bg-gold/30 cursor-not-allowed')
        }
      >
        ДАЛЕЕ
      </button>

      <div className="flex-1 min-h-10" />

    </div>
  );
}