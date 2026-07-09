import skyline from '../assets/parma design.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { api, ApiError, setToken } from '../lib/api';
import { cacheAvatar } from '../lib/avatar';

// Та же звёздная композиция что на WelcomePage — для единства входа в приложение
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
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (email.trim() === '' || password.trim() === '' || loading) return;
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.login(email.trim(), password);
      setToken(access_token);
      const user = await api.me();
      localStorage.setItem('cispr_email', user.email);
      localStorage.setItem('cispr_nickname', user.username);
      cacheAvatar(user.avatar_b64 || null);
      if (user.course_id) localStorage.setItem('cispr_course_id', user.course_id);
      if (user.program_level) localStorage.setItem('cispr_program', user.program_level);
      navigate('/path');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Не удалось войти';
      if (msg === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-code', { state: { email: email.trim(), mode: 'login' } });
        return;
      }
      setError(/401|invalid|incorrect|неверн/i.test(msg) ? 'Неверный email или пароль' : msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  const canLogin = email.trim() !== '' && password.trim() !== '' && !loading;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col px-8 overflow-hidden">

      {/* Звёзды */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cream/60"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
        />
      ))}

      {/* Золотая полоса сверху */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/60" />

      {/* Силуэт зданий — watermark */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none"
        style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
      />

      {/* Кнопка назад */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-12 left-6 text-cream text-2xl z-20"
        aria-label="Назад"
      >
        ←
      </button>

      {/* HERO: «С возвращением» в едином ритме с WelcomePage */}
      <div className="relative z-10 flex flex-col items-center text-center mt-32 px-6">
        <p
          className="font-serif text-navy font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
            letterSpacing: '0.04em',
          }}
        >
          С&nbsp;возвращением
        </p>
        <p className="font-serif text-cream italic text-lg leading-snug mt-2">
          Bentornati!
        </p>

        {/* Золотая чёрточка-разделитель */}
        <span
          className="block bg-gold/60"
          style={{ width: 40, height: 1, marginTop: 16, marginLeft: 'auto', marginRight: 'auto' }}
        />
      </div>

      {/* Форма */}
      <div className="relative z-10 w-full max-w-xs mx-auto mt-8 flex flex-col gap-3">
        <div className="flex items-center bg-cream/70 border border-navy/25 rounded-2xl px-5 py-3.5 backdrop-blur-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="email"
            autoComplete="email"
            className="font-sans text-navy text-base flex-1 bg-transparent outline-none placeholder:text-navy/40"
          />
          <Mail size={18} className="text-navy/50" />
        </div>

        <div className="flex items-center bg-cream/70 border border-navy/25 rounded-2xl px-5 py-3.5 backdrop-blur-sm">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="пароль"
            autoComplete="current-password"
            className="font-sans text-navy text-base flex-1 bg-transparent outline-none placeholder:text-navy/40"
          />
          <button onClick={() => setShowPassword(!showPassword)} className="text-navy/50">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          onClick={() => navigate('/forgot-password')}
          className="font-serif text-navy/60 text-xs underline self-end -mt-1"
        >
          Забыли пароль?
        </button>

        {error && (
          <p className="font-serif text-xs italic text-center" style={{ color: '#a8332a' }}>
            {error}
          </p>
        )}
      </div>

      {/* Spacer + CTA: войти + ссылка регистрации */}
      <div className="flex-1 min-h-[16px]" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto">
        <button
          onClick={handleLogin}
          disabled={!canLogin}
          className={
            'w-full font-serif text-cream text-lg rounded-full py-3.5 shadow-sm transition-transform ' +
            (canLogin ? 'bg-navy active:scale-[0.98]' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          {loading ? '...' : 'Войти'}
        </button>
        <button
          onClick={() => navigate('/register')}
          className="font-serif text-navy/70 text-sm mt-4 underline underline-offset-4 decoration-gold/60 decoration-1"
        >
          Впервые здесь? Создать аккаунт →
        </button>
      </div>

      {/* Резерв под здания */}
      <div className="min-h-[220px]" />

    </div>
  );
}
