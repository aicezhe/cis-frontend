import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function QuizTravelPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [hasCard, setHasCard] = useState('');
  const [hasHousing, setHasHousing] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  function goNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('Квиз Travel:', { hasCard, hasHousing, address, city });
      localStorage.setItem('cispr_passed_quiz', 'travel');
      if (address) localStorage.setItem('cispr_address', address);
      if (city) localStorage.setItem('cispr_city', city);
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

  // переход с шага 2 к 3 с возможным сохранением адреса
  function goNextFromHousing(saveAddress: boolean) {
    if (!saveAddress) {
      setAddress('');
    }
    setStep(3);
  }

  function canGoNext() {
    if (step === 1) return hasCard !== '';
    if (step === 2) {
      // если "Нет" — можно дальше сразу
      if (hasHousing === 'Нет') return true;
      // если "Да" — должен быть адрес
      if (hasHousing === 'Да') return address.trim() !== '';
      return false;
    }
    if (step === 3) return city.trim() !== '';
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
          {[1, 2, 3].map((n) => (
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
          ПЕРЕЕЗД
        </p>

        {/* ВОПРОС 1 — КАРТА */}
        {step === 1 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Есть ли у тебя иностранная карта?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Да', 'Нет'].map((option) => (
                <button
                  key={option}
                  onClick={() => setHasCard(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (hasCard === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {hasCard === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>
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
          </>
        )}

        {/* ВОПРОС 2 — ЖИЛЬЁ */}
        {step === 2 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Нашёл ли ты жильё?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Да', 'Нет'].map((option) => (
                <button
                  key={option}
                  onClick={() => setHasHousing(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (hasHousing === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {hasHousing === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>

            {/* Поле адреса — только если "Да" */}
            {hasHousing === 'Да' && (
              <div className="w-full mt-6">
                <p className="font-serif text-gold text-sm italic mb-2">
                  Адрес жилья в Парме
                </p>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Strada Farini 12"
                  autoComplete="off"
                  className="w-full font-sans text-navy text-lg bg-cream border border-navy rounded-2xl px-5 py-4 outline-none"
                />
                <p className="font-serif text-gold text-xs italic mt-2">
                  чтобы построить маршрут от станции до дома
                </p>
              </div>
            )}

            {/* Кнопки в зависимости от ответа */}
            {hasHousing === 'Нет' && (
              <button
                onClick={() => setStep(3)}
                className="font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 bg-navy"
              >
                ДАЛЕЕ
              </button>
            )}

            {hasHousing === 'Да' && (
              <div className="w-full flex gap-3 mt-6">
                <button
                  onClick={() => goNextFromHousing(false)}
                  className="flex-1 font-serif text-navy text-base rounded-full px-6 py-3 border-2 border-navy"
                >
                  Пропустить
                </button>
                <button
                  onClick={() => goNextFromHousing(true)}
                  disabled={address.trim() === ''}
                  className={
                    'flex-1 font-serif text-cream text-base rounded-full px-6 py-3 ' +
                    (address.trim() !== ''
                      ? 'bg-navy'
                      : 'bg-navy/30 cursor-not-allowed')
                  }
                >
                  Далее
                </button>
              </div>
            )}
          </>
        )}

        {/* ВОПРОС 3 — ГОРОД */}
        {step === 3 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-8">
              Из какого ты города?
            </h1>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва"
              autoComplete="off"
              className="w-full font-sans text-navy text-lg bg-cream border border-navy rounded-2xl px-5 py-4 outline-none"
            />
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
          </>
        )}

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