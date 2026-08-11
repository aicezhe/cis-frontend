import skyline from '../assets/parma design.svg';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { api, ApiError, setToken } from '../lib/api';
import { cacheAvatar } from '../lib/avatar';
import SkyIntro from '../components/SkyIntro';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { makeStarField, starBaseStyle, starVars } from '../lib/nightSky';

// То же натуральное ночное небо, что на WelcomePage — для единства входа.
const stars = makeStarField(50, 33, 7);
// Для десктопной левой панели небо своё: там оно занимает всю высоту колонки,
// а не верхнюю треть экрана, и звёзд нужно больше — иначе панель выглядит
// пустой синей плашкой. Сид другой, чтобы рисунок не повторял мобильный.
const panelStars = makeStarField(64, 100, 21);

export default function LoginPage() {
  const navigate = useNavigate();
  // Пришли по анимации с WelcomePage → проигрываем заставку-поток звёзд.
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [intro, setIntro] = useState(
    (location.state as { sky?: boolean } | null)?.sky === true,
  );
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
      // Страна фиксируется при регистрации и в Настройках не меняется —
      // на новом устройстве обязана восстановиться из профиля (иначе дефолт ru).
      if (user.country) localStorage.setItem('cispr_country', user.country);
      if (user.city) localStorage.setItem('cispr_city', user.city);
      if (user.course_id) {
        localStorage.setItem('cispr_course_id', user.course_id);
        // имя курса нужно Настройкам и Лауре, в профиле его нет — тянем фоном
        void api.getCourse(user.course_id)
          .then((c) => localStorage.setItem('cispr_course_name', c.name))
          .catch(() => { /* не критично, подлечится в Настройках */ });
      }
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

  // Десктоп — отдельная разметка, а не та же с другими отступами: слева
  // navy-панель с небом и героем, справа cream-панель с формой. Через
  // md:hidden/hidden md:flex это не собрать — в DOM оказались бы два комплекта
  // полей email/пароля, и менеджер паролей полез бы заполнять невидимый.
  if (isDesktop) {
    return (
      <div className="flex min-h-screen bg-soft-cream">

        {/* ── Левая панель: ночное небо, герой, силуэт ───────────────────── */}
        <div className="relative w-[45%] flex-shrink-0 overflow-hidden bg-navy flex flex-col items-center justify-center px-12">

          {/* Звёзды на всю высоту панели */}
          <div className="absolute inset-0">
            {panelStars.map((s, i) => (
              <div
                key={i}
                className="star absolute rounded-full"
                style={{
                  top: s.top,
                  left: s.left,
                  width: s.size,
                  height: s.size,
                  ...starBaseStyle(s),
                  ...starVars(i, s.twMin),
                }}
              />
            ))}
          </div>

          {/* Силуэт Пармы — тот же watermark, что на Welcome. Тут он на navy,
              поэтому mix-blend-mode не нужен: multiply на тёмном съел бы линии
              в ноль. Вместо него — прозрачность и светлый тон самой картинки. */}
          <img
            src={skyline}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-16 left-0 right-0 mx-auto w-full max-w-sm select-none"
            style={{ opacity: 0.16, filter: 'invert(1) brightness(1.6)' }}
          />

          <button
            onClick={() => navigate('/')}
            className="absolute top-8 left-8 z-20 font-serif text-cream/50 text-sm hover:text-cream/80 transition-colors"
          >
            ← назад
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1
              className="font-serif text-cream font-bold leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.4vw, 3.25rem)', letterSpacing: '0.03em' }}
            >
              С&nbsp;возвращением
            </h1>
            <p className="font-serif text-gold italic text-xl mt-3">Bentornata</p>
            <span className="block bg-gold/60 mt-6" style={{ width: 56, height: 1 }} />
            <p className="font-serif text-cream/60 text-base leading-relaxed mt-6 max-w-xs">
              Твой прогресс, дедлайны и ответы ждут внутри
            </p>
          </div>

          {/* Подпись понизу панели */}
          <div className="absolute inset-x-0 bottom-0 border-t border-gold/40 py-4 text-center">
            <span className="font-serif text-cream/45 text-xs tracking-[0.28em]">
              PARMA · MMXXVI
            </span>
          </div>
        </div>

        {/* ── Правая панель: форма ───────────────────────────────────────── */}
        <div className="flex flex-1 items-center justify-center px-12">
          <div className="w-full max-w-sm">

            <label className="block font-golos text-navy text-sm font-medium mb-2" htmlFor="login-email">
              Email
            </label>
            <div className="flex items-center rounded-xl border border-navy/20 bg-cream px-4 py-3 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold">
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="anna@example.com"
                autoComplete="email"
                className="font-golos text-navy text-base flex-1 bg-transparent outline-none placeholder:text-navy/35"
              />
              <Mail size={18} className="text-navy/45" />
            </div>

            <label className="block font-golos text-navy text-sm font-medium mt-5 mb-2" htmlFor="login-password">
              Пароль
            </label>
            <div className="flex items-center rounded-xl border border-navy/20 bg-cream px-4 py-3 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                className="font-golos text-navy text-base flex-1 bg-transparent outline-none placeholder:text-navy/35"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-navy/45 hover:text-navy/70 transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-2 text-right">
              <button
                onClick={() => navigate('/forgot-password')}
                className="font-golos text-navy/55 text-sm hover:text-navy transition-colors"
              >
                Забыли пароль?
              </button>
            </div>

            {error && (
              <p className="font-golos text-sm mt-4 text-center" style={{ color: '#a8332a' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={!canLogin}
              className={
                'w-full font-serif text-cream text-lg rounded-xl py-3.5 mt-6 transition-colors ' +
                (canLogin ? 'bg-navy hover:bg-navy/90' : 'bg-navy/30 cursor-not-allowed')
              }
            >
              {loading ? '...' : 'Войти'}
            </button>

            <p className="font-golos text-navy/60 text-sm text-center mt-6">
              Впервые здесь?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-navy underline underline-offset-4 decoration-gold decoration-1 hover:decoration-2"
              >
                Создать аккаунт →
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-md md:max-w-none mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col md:justify-center px-8 overflow-hidden">

      {intro && <SkyIntro onDone={() => setIntro(false)} />}

      {/* Звёзды — то же ночное небо, что на WelcomePage (мерцают, дрейфуют) */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="star absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            ...starBaseStyle(s),
            ...starVars(i, s.twMin),
          }}
        />
      ))}

      {/* Золотая полоса сверху */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/60" />

      {/* Силуэт зданий — watermark */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none md:max-w-lg md:mx-auto"
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
      <div className="page-descend relative z-10 flex flex-col items-center text-center mt-32 md:mt-0 px-6">
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
      <div className="page-descend relative z-10 w-full max-w-xs mx-auto mt-8 flex flex-col gap-3">
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

      {/* Spacer + CTA: войти + ссылка регистрации.
          md:hidden — распорка прижимает кнопку к низу экрана, чтобы на
          телефоне она попадала под большой палец. На десктопе прижимать не к
          чему: экран низкий и широкий, кнопка уезжала прямо на силуэт зданий.
          Вместо распорки там центрируем всю группу (md:justify-center). */}
      <div className="flex-1 min-h-[16px] md:hidden" />

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
      <div className="min-h-[220px] md:min-h-0" />

    </div>
  );
}
