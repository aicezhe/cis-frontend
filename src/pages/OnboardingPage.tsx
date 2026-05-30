import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  AREA_TO_DEPT,
  languageToFilter,
  levelToFilter,
  levelToProgramLevel,
  saveQuizFilters,
} from '../lib/quiz';

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

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [area, setArea] = useState('');
  const [ready, setReady] = useState('');

  async function goNext() {
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    // сохраняем фильтры для подбора курсов в ChoiceProgramPage
    saveQuizFilters({
      level: levelToFilter(level),
      lang: languageToFilter(language),
      dept_id: AREA_TO_DEPT[area],
    });
    // пишем уровень/язык в профиль (не блокируем переход при ошибке/без токена)
    try {
      await api.updateProfile({
        program_level: levelToProgramLevel(level),
        language: languageToFilter(language),
      });
    } catch {
      // профиль допишется позже; для прототипа переход важнее
    }
    navigate('/choice-program');
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/change-stage');
    }
  }

  function canGoNext() {
    if (step === 1) return level !== '';
    if (step === 2) return language !== '';
    if (step === 3) return area !== '';
    if (step === 4) return ready !== '';
    return false;
  }

  const nextEnabled = canGoNext();

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">

      <div className="border-t-4 border-b-2 border-gold py-3 text-center">
        <span className="font-serif text-gold text-sm tracking-[0.2em]">
          ALMAE • VNIVERSITATIS • STVDII
        </span>
      </div>

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
          onClick={goNext}
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

      <div className="border-t-4 border-b-2 border-gold py-3 text-center">
        <span className="font-serif text-gold text-sm tracking-[0.2em]">
          ALMAE • VNIVERSITATIS • STVDII
        </span>
      </div>

    </div>
  );
}