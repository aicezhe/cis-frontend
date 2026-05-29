import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoursesList, saveMyCourse } from '../hooks/useCourse';

const areas = [
  'Гуманитарные / культура',
  'Право / политика',
  'Инженерия / технологии',
  'Архитектура / дизайн',
  'Медицина / здоровье',
  'Биология / химия',
  'Пищевые науки',
  'Экономика / бизнес',
  'Математика / физика / IT',
  'Ветеринария / зоотехния',
];

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

const Header = () => (
  <div className="border-t-4 border-b-2 border-gold py-3 text-center">
    <span className="font-serif text-gold text-sm tracking-[0.2em]">
      ALMAE • VNIVERSITATIS • STVDII
    </span>
  </div>
);

const Footer = () => (
  <div className="border-t-4 border-b-2 border-gold py-3 text-center">
    <span className="font-serif text-gold text-sm tracking-[0.2em]">
      ALMAE • VNIVERSITATIS • STVDII
    </span>
  </div>
);

type Mode = 'pre' | 'pick-level' | 'pick-course' | 'quiz';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('pre');
  const [alreadyChose, setAlreadyChose] = useState('');
  const [pickLevel, setPickLevel] = useState<'laurea' | 'magistrale' | undefined>(undefined);

  // Quiz mode state (original 4 steps)
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [area, setArea] = useState('');
  const [ready, setReady] = useState('');

  const courses = useCoursesList(pickLevel);

  function goBack() {
    if (mode === 'pre') { navigate('/change-stage'); return; }
    if (mode === 'pick-level') { setMode('pre'); setAlreadyChose(''); return; }
    if (mode === 'pick-course') { setMode('pick-level'); return; }
    // quiz mode
    if (step > 1) { setStep(step - 1); }
    else { setMode('pre'); }
  }

  function canGoNextQuiz() {
    if (step === 1) return level !== '';
    if (step === 2) return language !== '';
    if (step === 3) return area !== '';
    if (step === 4) return ready !== '';
    return false;
  }

  function goNextQuiz() {
    if (step < 4) { setStep(step + 1); }
    else { navigate('/choice-program'); }
  }

  // ─── PRE STEP ───────────────────────────────────────────────────────────────
  if (mode === 'pre') {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">
        <Header />
        <div className="flex items-center px-6 mt-10">
          <button onClick={goBack} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex flex-col items-center mt-16 px-8">
          <p className="font-serif text-gold text-sm tracking-widest mb-8">
            УНИВЕРСИТЕТ
          </p>
          <h1 className="font-serif text-navy text-3xl text-center mb-10">
            Ты уже выбрал специальность?
          </h1>
          <div className="w-full flex flex-col gap-4">
            {['Да', 'Нет'].map((option) => (
              <button
                key={option}
                onClick={() => setAlreadyChose(option)}
                className={
                  'relative font-serif text-xl rounded-2xl py-6 border ' +
                  (alreadyChose === option
                    ? 'bg-navy text-gold border-navy'
                    : 'bg-cream text-navy border-navy/30')
                }
              >
                {alreadyChose === option && <Corners />}
                {option}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (alreadyChose === 'Да') setMode('pick-level');
              else if (alreadyChose === 'Нет') setMode('quiz');
            }}
            disabled={alreadyChose === ''}
            className={
              'font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 ' +
              (alreadyChose !== '' ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
            }
          >
            ДАЛЕЕ
          </button>
        </div>
        <div className="flex-1 min-h-20" />
        <Footer />
      </div>
    );
  }

  // ─── PICK LEVEL ─────────────────────────────────────────────────────────────
  if (mode === 'pick-level') {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">
        <Header />
        <div className="flex items-center gap-3 px-6 mt-10">
          <button onClick={goBack} className="text-navy text-2xl">←</button>
          <div className="flex gap-2 flex-1">
            {[1, 2].map((n) => (
              <div
                key={n}
                className={'h-1.5 flex-1 rounded-full ' + (n === 1 ? 'bg-navy' : 'bg-gold/40')}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center mt-16 px-8">
          <p className="font-serif text-gold text-sm tracking-widest mb-8">
            УНИВЕРСИТЕТ
          </p>
          <h1 className="font-serif text-navy text-3xl text-center mb-10">
            Бакалавриат или магистратура?
          </h1>
          <div className="w-full flex flex-col gap-4">
            {([
              { label: 'Бакалавриат', value: 'laurea' as const },
              { label: 'Магистратура', value: 'magistrale' as const },
            ]).map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPickLevel(value)}
                className={
                  'relative font-serif text-xl rounded-2xl py-6 border ' +
                  (pickLevel === value
                    ? 'bg-navy text-gold border-navy'
                    : 'bg-cream text-navy border-navy/30')
                }
              >
                {pickLevel === value && <Corners />}
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (pickLevel) setMode('pick-course'); }}
            disabled={!pickLevel}
            className={
              'font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 ' +
              (pickLevel ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
            }
          >
            ДАЛЕЕ
          </button>
        </div>
        <div className="flex-1 min-h-20" />
        <Footer />
      </div>
    );
  }

  // ─── PICK COURSE ────────────────────────────────────────────────────────────
  if (mode === 'pick-course') {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">
        <Header />
        <div className="flex items-center gap-3 px-6 mt-10">
          <button onClick={goBack} className="text-navy text-2xl">←</button>
          <div className="flex gap-2 flex-1">
            {[1, 2].map((n) => (
              <div key={n} className="h-1.5 flex-1 rounded-full bg-navy" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center mt-10 px-8">
          <p className="font-serif text-gold text-sm tracking-widest mb-4">
            УНИВЕРСИТЕТ
          </p>
          <h1 className="font-serif text-navy text-3xl text-center mb-8">
            Выбери свой курс
          </h1>

          {courses.length === 0 ? (
            <p className="font-serif text-navy/60 text-base italic text-center">
              Загрузка…
            </p>
          ) : (
            <div className="relative w-full">
              <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pb-6 no-scrollbar">
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      saveMyCourse(c.id);
                      navigate('/path');
                    }}
                    className="relative text-left font-serif rounded-xl py-4 px-4 border
                               bg-cream text-navy border-navy/30
                               hover:bg-navy hover:text-cream transition"
                  >
                    <div className="text-lg">{c.name}</div>
                    <div className="font-sans text-xs text-gold mt-1">
                      {c.lang === 'en' ? 'English' : 'Italiano'} · {c.is_stem ? 'STEM' : 'не STEM'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent" />
            </div>
          )}
        </div>
        <div className="flex-1 min-h-20" />
        <Footer />
      </div>
    );
  }

  // ─── QUIZ MODE (original 4 steps) ───────────────────────────────────────────
  const nextEnabled = canGoNextQuiz();

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">
      <Header />

      <div className="flex items-center gap-3 px-6 mt-10">
        <button onClick={goBack} className="text-navy text-2xl">←</button>
        <div className="flex gap-2 flex-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={
                'h-1.5 flex-1 rounded-full ' +
                (n <= step ? 'bg-navy' : 'bg-gold/40')
              }
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center mt-16 px-8">

        <p className="font-serif text-gold text-sm tracking-widest mb-8">
          УНИВЕРСИТЕТ
        </p>

        {step === 1 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              На программу какого уровня ты поступаешь?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Foundation Year', 'Бакалавриат', 'Магистратура'].map((option) => (
                <button
                  key={option}
                  onClick={() => setLevel(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (level === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {level === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              На каком языке хочешь учиться?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Английский', 'Итальянский'].map((option) => (
                <button
                  key={option}
                  onClick={() => setLanguage(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (language === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {language === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-8">
              Выбери направление программы
            </h1>
            <div className="relative w-full">
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pb-6 no-scrollbar">
                {areas.map((option) => (
                  <button
                    key={option}
                    onClick={() => setArea(option)}
                    className={
                      'relative font-serif text-lg rounded-xl py-4 px-4 border shrink-0 ' +
                      (area === option
                        ? 'bg-navy text-gold border-navy'
                        : 'bg-cream text-navy border-navy/30')
                    }
                  >
                    {area === option && <Corners />}
                    {option}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent" />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Готов к сложной учёбе?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Да', 'Нет'].map((option) => (
                <button
                  key={option}
                  onClick={() => setReady(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (ready === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {ready === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={goNextQuiz}
          disabled={!nextEnabled}
          className={
            'font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 ' +
            (nextEnabled ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          ДАЛЕЕ
        </button>

      </div>

      <div className="flex-1 min-h-20" />
      <Footer />
    </div>
  );
}
