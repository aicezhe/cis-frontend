import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const countries = [
  'Россия', 'Беларусь', 'Казахстан', 'Армения', 'Азербайджан',
  'Кыргызстан', 'Молдова', 'Таджикистан', 'Узбекистан', 'Украина',
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

export default function QuizVisaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [arriveDate, setArriveDate] = useState('');
  const [country, setCountry] = useState('');

  function goNext() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      console.log('Квиз Visa:', { arriveDate, country });
      localStorage.setItem('cispr_passed_quiz', 'visa');
      navigate('/path');
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/change-stage');
    }
  }

  function canGoNext() {
    if (step === 1) return arriveDate !== '';
    if (step === 2) return country !== '';
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
          {[1, 2].map((n) => (
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
          ВИЗА
        </p>

        {step === 1 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Когда ты должен приехать?
            </h1>
            <input
              type="date"
              value={arriveDate}
              onChange={(e) => setArriveDate(e.target.value)}
              className="w-full font-sans text-navy text-lg bg-cream border border-navy rounded-2xl px-5 py-4 outline-none"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-8">
              Из какой ты страны?
            </h1>
            <div className="relative w-full">
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pb-6 no-scrollbar">
                {countries.map((option) => (
                  <button
                    key={option}
                    onClick={() => setCountry(option)}
                    className={
                      'relative font-serif text-lg rounded-xl py-4 px-4 border shrink-0 ' +
                      (country === option
                        ? 'bg-navy text-gold border-navy'
                        : 'bg-cream text-navy border-navy/30')
                    }
                  >
                    {country === option && <Corners />}
                    {option}
                  </button>
                ))}
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream to-transparent" />
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