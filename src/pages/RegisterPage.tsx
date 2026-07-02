import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, User } from 'lucide-react';
import { api, ApiError } from '../lib/api';

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

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

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
    if (step === 4) return country !== '';
    if (step === 5) return city.trim() !== '';
    if (step === 6) {
      return (
        password.trim().length >= 6 &&
        password === passwordRepeat
      );
    }
    return false;
  }

  async function goNext() {
    if (!canGoNext() || loading || checking) return;
    setError('');

    // Шаг 1 — проверяем, не занят ли email, прежде чем идти дальше
    if (step === 1) {
      setChecking(true);
      try {
        const { email_taken } = await api.checkAvailability({ email: email.trim() });
        if (email_taken) {
          setError('Этот email уже зарегистрирован');
          return;
        }
      } catch (e) {
        // 422 — бэкенд считает формат email некорректным (например, плохой домен)
        if (e instanceof ApiError && e.status === 422) {
          setError('Этот email не похож на настоящий — проверь домен');
          return;
        }
        // прочее (сеть, 5xx) — не блокируем, провалидируем при финале
      } finally {
        setChecking(false);
      }
      setStep(2);
      return;
    }

    // Шаг 2 — проверяем никнейм
    if (step === 2) {
      setChecking(true);
      try {
        const { username_taken } = await api.checkAvailability({ username: nickname.trim() });
        if (username_taken) {
          setError('Этот никнейм уже занят');
          return;
        }
      } catch {
        // не блокируем — проверим при регистрации
      } finally {
        setChecking(false);
      }
      setStep(3);
      return;
    }

    if (step < 6) {
      // город спрашиваем только у России (для консульского округа) — остальным шаг 5 пропускаем
      setStep(step === 4 && country !== 'ru' ? 6 : step + 1);
      return;
    }
    setLoading(true);
    try {
      await api.registerAndLogin(email.trim(), nickname.trim(), password);
      // новый аккаунт начинает с чистого листа: убираем прогресс/стадию/курс,
      // оставшиеся от предыдущих сессий (иначе в кабинете всплывают ложные 100%)
      [
        'cispr_passed_quiz',
        'cispr_course_id',
        'cispr_course_name',
        'cispr_quiz_level',
        'cispr_quiz_lang',
        'cispr_quiz_dept',
      ].forEach((k) => localStorage.removeItem(k));
      Object.keys(localStorage)
        .filter((k) => k.startsWith('cispr_done_'))
        .forEach((k) => localStorage.removeItem(k));
      // сохраняем для мгновенного отображения в шапке/настройках
      localStorage.setItem('cispr_email', email.trim());
      localStorage.setItem('cispr_nickname', nickname.trim());
      localStorage.setItem('cispr_age', age);
      // страна нужна, чтобы подобрать страновой датасет легализации (Foundation)
      localStorage.setItem('cispr_country', country);
      // город нужен для автоопределения консульского округа (раздел Виза, только РФ)
      if (country === 'ru' && city.trim()) {
        localStorage.setItem('cispr_city', city.trim());
      } else {
        localStorage.removeItem('cispr_city');
      }
      // возраст уходит в профиль на бэкенд
      try {
        await api.updateProfile({ age: parseInt(age) || null });
      } catch {
        // не критично для регистрации — профиль допишется позже в онбординге
      }
      setStep(7);  // показываем экран "проверь почту"
    } catch (e) {
      const raw = e instanceof ApiError ? e.message : 'Не удалось зарегистрироваться';
      // Pydantic ошибка валидации (длинный JSON) — детектим по упоминанию полей
      // и возвращаем юзера на нужный шаг с понятным текстом.
      if (/email|@-sign|top-level domain/i.test(raw)) {
        setError('Этот email не похож на настоящий — проверь домен');
        setStep(1);
      } else if (/exist|занят|registered|409/i.test(raw)) {
        setError('Этот email уже зарегистрирован');
        setStep(1);
      } else if (/username|nickname/i.test(raw)) {
        setError('Что-то не так с никнеймом — попробуй другой');
        setStep(2);
      } else {
        setError('Не удалось зарегистрироваться. Проверь данные и попробуй ещё раз.');
      }
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError('');
    if (step > 1) {
      setStep(step === 6 && country !== 'ru' ? 4 : step - 1);
    } else {
      navigate('/');
    }
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

      {step < 7 && (
        <div className="flex items-center gap-3 px-6 mt-10">
          <button onClick={goBack} className="text-navy text-2xl">←</button>
          <div className="flex gap-2 flex-1">
            {(country === 'ru' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 6]).map((n) => (
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
      )}

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
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
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
                onChange={(e) => { setNickname(e.target.value); setError(''); }}
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
            <h1 className="font-serif text-navy text-3xl mb-10 text-center">
              Из какой ты страны?
            </h1>
            <p className="font-serif text-navy/60 text-sm italic text-center mb-8 -mt-6">
              Подберём процесс легализации документов под твою страну
            </p>
            <div className="w-full flex flex-col gap-3">
              {[
                { code: 'ru', label: 'Россия' },
                { code: 'ua', label: 'Украина' },
                { code: 'by', label: 'Беларусь' },
                { code: 'kz', label: 'Казахстан' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => { setCountry(opt.code); setError(''); }}
                  className={
                    'relative font-serif text-lg rounded-2xl py-4 border ' +
                    (country === opt.code
                      ? 'bg-navy text-gold border-navy'
                      : 'bg-cream text-navy border-navy/30')
                  }
                >
                  {country === opt.code && <Corners />}
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="font-serif text-navy text-3xl mb-10 text-center">
              Из какого ты города?
            </h1>
            <p className="font-serif text-navy/60 text-sm italic text-center mb-8 -mt-6">
              Определим твой консульский округ для подачи на визу
            </p>
            <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4 mb-6">
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="Москва"
                autoComplete="off"
                className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
              />
              <User size={20} className="text-navy" />
            </div>
          </>
        )}

        {step === 7 && (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-6">
              <Mail size={28} className="text-navy" />
            </div>
            <h1 className="font-serif text-navy text-3xl mb-4">Проверь почту</h1>
            <p className="font-serif text-navy/60 text-sm leading-relaxed mb-2">
              Мы отправили письмо на
            </p>
            <p className="font-serif text-navy font-bold text-base mb-6">{email}</p>
            <p className="font-serif text-navy/50 text-xs leading-relaxed mb-10">
              Нажми на ссылку в письме, чтобы подтвердить аккаунт. Можешь сделать это потом — приложение уже открыто.
            </p>
            <button
              onClick={() => navigate('/change-stage')}
              className="font-serif text-cream bg-navy rounded-full px-10 py-3 text-base"
            >
              Продолжить
            </button>
          </div>
        )}

        {step === 6 && (
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

        {step < 7 && error && (
          <p className="font-serif text-sm italic mt-4 text-center" style={{ color: '#a8332a' }}>
            {error}
          </p>
        )}

        {step < 7 && (
          <button
            onClick={goNext}
            disabled={!nextEnabled || loading || checking}
            className={
              'font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 ' +
              (nextEnabled && !loading && !checking ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
            }
          >
            {loading || checking ? '...' : 'ДАЛЕЕ'}
          </button>
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