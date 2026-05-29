import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, User } from 'lucide-react';

const COUNTRIES = ['Россия', 'Беларусь', 'Украина', 'Казахстан'];

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Original 4 steps — unchanged
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // New steps: 5=gender, 6=country, 7=city (only if Russia)
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const totalSteps = step === 7 ? 7 : 6;

  function canGoNext() {
    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    }
    if (step === 2) return nickname.trim() !== '';
    if (step === 3) {
      const ageNum = parseInt(age);
      return !isNaN(ageNum) && ageNum >= 14 && ageNum <= 100;
    }
    if (step === 4) {
      return password.trim().length >= 6 && password === passwordRepeat;
    }
    if (step === 5) return gender !== '';
    if (step === 6) return country !== '';
    if (step === 7) return city.trim() !== '';
    return false;
  }

  function finish() {
    localStorage.setItem('cispr_email', email);
    localStorage.setItem('cispr_nickname', nickname);
    localStorage.setItem('cispr_age', age);
    localStorage.setItem('cispr_gender', gender === 'Девушка' ? 'f' : 'm');
    localStorage.setItem('cispr_country', country);
    if (country === 'Россия' && city.trim()) {
      localStorage.setItem('cispr_city', city.trim());
    }
    navigate('/change-stage');
  }

  function goNext() {
    if (!canGoNext()) return;
    if (step < 4) { setStep(step + 1); return; }
    if (step === 4) { setStep(5); return; }
    if (step === 5) { setStep(6); return; }
    if (step === 6) {
      if (country === 'Россия') { setStep(7); return; }
      finish();
      return;
    }
    if (step === 7) { finish(); return; }
  }

  function goBack() {
    if (step === 7) { setStep(6); return; }
    if (step === 6) { setStep(5); return; }
    if (step === 5) { setStep(4); return; }
    if (step > 1) { setStep(step - 1); return; }
    navigate('/');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') goNext();
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
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
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

      <div className="flex flex-col items-center mt-32 px-8">

        <p className="font-serif text-gold text-sm tracking-widest mb-3">
          РЕГИСТРАЦИЯ
        </p>

        {step === 1 && (
          <>
            <h1 className="font-serif text-navy text-3xl mb-12">
              Введи свой email.
            </h1>
            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="anna@mail.ru"
                autoComplete="off"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <Mail size={20} className="text-navy" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-serif text-navy text-3xl mb-12">
              Как тебя назвать?
            </h1>
            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-6">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="aicezhe"
                autoComplete="off"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <User size={20} className="text-navy" />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-serif text-navy text-3xl mb-12">
              Сколько тебе лет?
            </h1>
            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-6">
              <input
                type="number"
                min="0"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="18"
                autoComplete="off"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <User size={20} className="text-navy" />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-serif text-navy text-3xl mb-12 text-center">
              Придумай пароль<br />и повтори его.
            </h1>

            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-navy"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-navy"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {password.length > 0 && password.length < 6 && (
              <p className="font-serif text-gold text-xs italic mb-4 self-start">
                Пароль минимум 6 символов
              </p>
            )}
            {password.length >= 6 && passwordRepeat.length > 0 && password !== passwordRepeat && (
              <p className="font-serif text-gold text-xs italic mb-4 self-start">
                Пароли не совпадают
              </p>
            )}
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Ты девушка или парень?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {['Девушка', 'Парень'].map((option) => (
                <button
                  key={option}
                  onClick={() => setGender(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
                    (gender === option
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {gender === option && <Corners />}
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Из какой ты страны?
            </h1>
            <div className="w-full flex flex-col gap-4">
              {COUNTRIES.map((option) => (
                <button
                  key={option}
                  onClick={() => setCountry(option)}
                  className={
                    'relative font-serif text-xl rounded-2xl py-6 border ' +
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
          </>
        )}

        {step === 7 && (
          <>
            <h1 className="font-serif text-navy text-3xl text-center mb-10">
              Из какого ты города?
            </h1>
            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-6">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Москва"
                autoComplete="off"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
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
