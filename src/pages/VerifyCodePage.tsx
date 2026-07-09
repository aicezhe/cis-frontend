import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { api, ApiError, setToken } from '../lib/api';

interface RegisterData {
  nickname: string;
  age: string;
  country: string;
  city: string;
}

interface LocationState {
  email: string;
  mode: 'register' | 'login';
  registerData?: RegisterData;
}

const RESEND_COOLDOWN = 30;

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.email) {
      navigate('/login', { replace: true });
      return;
    }
    inputRef.current?.focus();
  }, [state, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!state?.email) return null;

  async function afterVerified() {
    // регистрация — сохраняем профиль и начинаем с чистого листа
    if (state!.mode === 'register' && state!.registerData) {
      const { nickname, age, country, city } = state!.registerData;
      [
        'cispr_passed_quiz',
        'cispr_course_id',
        'cispr_course_name',
        'cispr_quiz_level',
        'cispr_quiz_lang',
        'cispr_quiz_dept',
        'cispr_avatar',
      ].forEach((k) => localStorage.removeItem(k));
      Object.keys(localStorage)
        .filter((k) => k.startsWith('cispr_done_'))
        .forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('cispr_email', state!.email);
      localStorage.setItem('cispr_nickname', nickname);
      localStorage.setItem('cispr_age', age);
      localStorage.setItem('cispr_country', country);
      if (country === 'ru' && city.trim()) {
        localStorage.setItem('cispr_city', city.trim());
      } else {
        localStorage.removeItem('cispr_city');
      }
      try {
        await api.updateProfile({ age: parseInt(age) || null });
      } catch {
        // не критично — профиль допишется позже в онбординге
      }
      navigate('/change-stage');
      return;
    }

    // вход — подтягиваем профиль как обычный логин
    try {
      const user = await api.me();
      localStorage.setItem('cispr_email', user.email);
      localStorage.setItem('cispr_nickname', user.username);
      if (user.course_id) localStorage.setItem('cispr_course_id', user.course_id);
      if (user.program_level) localStorage.setItem('cispr_program', user.program_level);
    } catch {
      // не критично — данные подтянутся при следующем открытии страниц
    }
    navigate('/path');
  }

  async function handleVerify() {
    if (code.trim().length !== 6 || loading) return;
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.verifyRegistrationCode(state!.email, code.trim());
      setToken(access_token);
      await afterVerified();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Не удалось проверить код';
      setError(/неверн|устарел|invalid|expired/i.test(msg) ? 'Код неверный или устарел — запроси новый' : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError('');
    setResent(false);
    try {
      await api.resendVerificationCode(state!.email);
      setResendCooldown(RESEND_COOLDOWN);
      setResent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить код повторно');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleVerify();
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-6">
        <Mail size={28} className="text-navy" />
      </div>
      <h1 className="font-serif text-navy text-3xl font-bold mb-3">Введи код</h1>
      <p className="font-serif text-navy/60 text-sm leading-relaxed mb-1">
        Мы отправили 6-значный код на
      </p>
      <p className="font-serif text-navy font-bold text-base mb-8">{state.email}</p>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
        onKeyDown={handleKeyDown}
        placeholder="000000"
        autoComplete="one-time-code"
        className="w-full font-serif text-navy text-3xl font-bold tracking-[0.4em] text-center border border-navy/30 bg-soft-cream rounded-2xl py-4 mb-4 outline-none focus:border-navy"
      />

      {error && (
        <p className="font-serif text-sm italic mb-4" style={{ color: '#a8332a' }}>{error}</p>
      )}
      {resent && !error && (
        <p className="font-serif text-navy/50 text-xs italic mb-4">Код отправлен ещё раз</p>
      )}

      <button
        onClick={() => void handleVerify()}
        disabled={code.trim().length !== 6 || loading}
        className={
          'w-full font-serif text-cream text-base rounded-full py-3 mb-4 transition-colors ' +
          (code.trim().length === 6 && !loading ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
        }
      >
        {loading ? '...' : 'Подтвердить'}
      </button>

      <button
        onClick={() => void handleResend()}
        disabled={resendCooldown > 0}
        className="font-serif text-navy/60 text-xs underline disabled:opacity-40 disabled:no-underline"
      >
        {resendCooldown > 0 ? `Отправить код ещё раз через ${resendCooldown}с` : 'Отправить код ещё раз'}
      </button>
    </div>
  );
}
