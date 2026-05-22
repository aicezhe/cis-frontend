import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stages = [
  {
    id: 'uni',
    title: 'УНИВЕР',
    desc: 'Выбор программы, требования, пошаговая инструкция',
    route: '/onboarding',
  },
  {
    id: 'visa',
    title: 'ВИЗА',
    desc: 'Документы, дедлайны',
    route: '/quiz-visa',
  },
  {
    id: 'travel',
    title: 'ПЕРЕЕЗД',
    desc: 'Жильё, карта, банк, codice fiscale',
    route: '/quiz-travel',
  },
  {
    id: 'parma',
    title: 'В ПАРМЕ',
    desc: 'Работа, медицина, стипендия, социальная жизнь, транспорт',
    route: '/path',
  },
];

export default function ChangeStagePage() {
  const navigate = useNavigate();
  // какая карточка сейчас нажата (для подсветки на секунду)
  const [pressed, setPressed] = useState('');

  function handlePick(stage: { id: string; route: string }) {
    setPressed(stage.id);
    setTimeout(() => {
      if (stage.id === 'parma') {
        localStorage.setItem('cispr_passed_quiz', 'parma');
      }
      navigate(stage.route);
    }, 250);
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col px-6 pb-10">

      <p className="font-serif text-gold text-base font-semibold text-center mt-16 mb-6">
        Выбери свой шаг
      </p>
      <h1 className="font-serif text-navy text-5xl text-center leading-tight mb-12">
        Твой путь
        <br />
        <span className="italic">через тернии</span>
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {stages.map((stage) => {
          const isPressed = pressed === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => handlePick(stage)}
              className={
                'relative rounded-3xl p-5 h-52 flex flex-col items-center justify-center text-center border transition-colors duration-200 ' +
                (isPressed
                  ? 'bg-navy border-navy'
                  : 'bg-soft-cream border-navy/25')
              }
            >
              <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
              <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
              <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
              <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

              <h2
                className={
                  'font-serif text-2xl font-bold mb-2 ' +
                  (isPressed ? 'text-gold' : 'text-navy')
                }
              >
                {stage.title}
              </h2>

              <p
                className={
                  'font-serif text-xs leading-snug px-1 ' +
                  (isPressed ? 'text-cream' : 'text-gold')
                }
              >
                {stage.desc}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
}