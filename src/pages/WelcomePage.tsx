import skyline from '../assets/parma design.svg';
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Детерминированный псевдо-рандом по индексу — чтобы небо не «прыгало» при
// ре-рендере, но выглядело естественно-разбросанным.
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

// Оттенки настоящих звёзд: холодновато-белый, чисто-белый, тёпло-белый и редкие
// золотые (акцент бренда). Низкая насыщенность — глазу читается как небо.
const STAR_TONES = ['225,235,255', '255,253,248', '255,246,230', '255,253,248'];

// Звёздное поле в верхней «ночной» зоне. В основном мелкие тусклые + редкие
// яркие и золотые — как на настоящем небе. Свечение только у крупных.
const stars = Array.from({ length: 54 }, (_, i) => {
  const r1 = rand(i);
  const r2 = rand(i + 100);
  // размер: кв. распределение → большинство мелкие, редко крупные (0.8–3.0px)
  const size = +(0.8 + r1 * r1 * 2.2).toFixed(2);
  // яркость: большинство тусклые (0.22–0.95)
  const bright = +(0.22 + r2 * r2 * 0.73).toFixed(2);
  const gold = rand(i + 200) > 0.9; // ~10% золотых
  return {
    top: `${(rand(i + 300) * 33).toFixed(1)}%`, // только тёмная шапка
    left: `${(rand(i + 400) * 100).toFixed(1)}%`,
    size,
    bright,
    gold,
    rgb: gold ? '199,168,118' : STAR_TONES[i % STAR_TONES.length],
    twMin: +(0.3 + rand(i + 500) * 0.5).toFixed(2), // амплитуда мерцания вразнобой
  };
});

// Детерминированные параметры анимации по индексу — мерцание/дрейф вразнобой.
function starVars(i: number, twMin: number): React.CSSProperties {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    '--tw-min': twMin,
    '--tw-dur': `${2.2 + rand(i + 600) * 3}s`,
    '--tw-delay': `${(rand(i + 700) * 3.5).toFixed(2)}s`,
    '--dx': `${dir * (1 + rand(i + 800) * 2).toFixed(1)}px`,
    '--dy': `${-dir * (1 + rand(i + 900) * 2).toFixed(1)}px`,
    '--dr-dur': `${6 + rand(i + 1000) * 5}s`,
    '--dr-delay': `${(rand(i + 1100) * 2).toFixed(2)}s`,
  } as React.CSSProperties;
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState<null | 'login' | 'register'>(null);

  // Кнопка «Войти» по ширине фразы «Путь в Парму» — замеряем её вживую.
  const heroRef = useRef<HTMLParagraphElement>(null);
  const [heroWidth, setHeroWidth] = useState<number>();
  useLayoutEffect(() => {
    const measure = () => {
      if (heroRef.current) setHeroWidth(heroRef.current.offsetWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Запуск анимации ухода, затем навигация. Вход — небо «накрывает» экран
  // (~0.5с), дальше поток звёзд и расплывание уже на странице входа (SkyIntro).
  // Регистрация — элементы по очереди отлетают, экран бежевеет (~1.15с).
  function go(kind: 'login' | 'register') {
    if (leaving) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      navigate(kind === 'login' ? '/login' : '/register');
      return;
    }
    setLeaving(kind);
    if (kind === 'login') {
      // флаг sky → страница входа проигрывает SkyIntro (бесшовно после накрытия)
      window.setTimeout(() => navigate('/login', { state: { sky: true } }), 520);
    } else {
      window.setTimeout(() => navigate('/register'), 1150);
    }
  }

  // Регистрация: элемент отлетает влево/вправо со сдвигом очереди по order.
  // Вход отдельным оверлеем-«накрытием», сами элементы не анимируем.
  const leaveCls = (side: 'left' | 'right') =>
    leaving === 'register' ? (side === 'left' ? 'wp-fly-left' : 'wp-fly-right') : '';
  const leaveDelay = (order: number): React.CSSProperties =>
    leaving === 'register' ? { animationDelay: `${(order * 0.1).toFixed(2)}s` } : {};
  // Рамка/звёзды при регистрации просто гаснут.
  const frameCls = leaving === 'register' ? 'wp-fade' : '';

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col px-8 overflow-hidden">

      {/* Звёздное небо — единым слоем (чтобы уходило целиком).
          Свечение (ореол) только у крупных/ярких — как у настоящих звёзд. */}
      <div className={`absolute inset-0 z-0 ${frameCls}`}>
        {stars.map((star, i) => (
          <div
            key={i}
            className="star absolute rounded-full"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              background: `rgba(${star.rgb},${star.bright})`,
              boxShadow:
                star.size > 1.8
                  ? `0 0 ${Math.round(star.size * 2.5)}px ${(star.size * 0.35).toFixed(1)}px rgba(${star.rgb},${(star.bright * 0.55).toFixed(2)})`
                  : 'none',
              ...starVars(i, star.twMin),
            }}
          />
        ))}
      </div>

      {/* Тонкая золотая полоса сверху — как акцент бренда */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gold/60 z-0 ${frameCls}`} />

      {/* Силуэт зданий — фоновый watermark прижат к самому низу */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        className={`absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none z-0 ${frameCls}`}
        style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
      />

      {/* HERO: слоган — главный визуальный акцент */}
      <div className="relative z-10 flex flex-col items-center text-center mt-48 px-6">
        <p
          ref={heroRef}
          className={`font-serif text-navy font-bold leading-tight text-center inline-block ${leaveCls('left')}`}
          style={{
            fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
            letterSpacing: '0.04em',
            ...leaveDelay(0),
          }}
        >
          Путь&nbsp;в&nbsp;Парму
        </p>
        <p
          className={`font-serif text-cream italic text-lg leading-snug text-center mt-2 ${leaveCls('right')}`}
          style={leaveDelay(1)}
        >
          через тернии, но не в одиночку.
        </p>

        {/* Золотая чёрточка-разделитель */}
        <span
          className={`block bg-gold/60 ${leaveCls('left')}`}
          style={{ width: 40, height: 1, marginTop: 16, marginLeft: 'auto', marginRight: 'auto', ...leaveDelay(2) }}
        />

        <p
          className={`font-serif text-navy/60 text-sm leading-relaxed text-center mt-6 max-w-[260px] ${leaveCls('right')}`}
          style={leaveDelay(3)}
        >
          Структура, ответы, поддержка для русскоязычных студентов.
        </p>
      </div>

      {/* Заполнитель: совсем небольшой — пустого центра не хотим */}
      <div className="flex-1 min-h-[16px]" />

      {/* CTA: войти — primary, регистрация — secondary link */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto">
        <button
          onClick={() => go('login')}
          className={`font-serif text-cream text-lg bg-navy rounded-full py-3.5 shadow-sm border border-gold/50 active:scale-[0.98] transition-transform ${leaveCls('left')}`}
          style={{
            width: heroWidth,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(184,153,104,0.15)',
            ...leaveDelay(4),
          }}
        >
          Войти
        </button>
        <button
          onClick={() => go('register')}
          className={`font-serif text-navy/70 text-sm mt-4 underline underline-offset-4 decoration-gold/60 decoration-1 ${leaveCls('right')}`}
          style={leaveDelay(5)}
        >
          Впервые здесь? Создать аккаунт →
        </button>
      </div>

      {/* Резерв снизу под здания-watermark — больше, чтобы CTA поднялась */}
      <div className="min-h-[220px]" />

      {/* Тонкая золотая полоса внизу — рамка */}
      <div className={`relative z-10 h-0.5 bg-gold/60 mb-4 ${frameCls}`} />

      {/* Регистрация: бежевый экран проступает по мере отлёта элементов */}
      {leaving === 'register' && (
        <div className="wp-cream-in absolute inset-0 bg-cream" style={{ zIndex: 5 }} />
      )}

      {/* Вход: само небо welcome (тот же navy) растягивается сверху вниз и
          накрывает страницу — не отдельная синяя панель, а продолжение шапки. */}
      {leaving === 'login' && (
        <div
          className="wp-cover absolute inset-0"
          style={{
            zIndex: 40,
            background: 'linear-gradient(to bottom, #1C2A48 0%, #12203a 55%, #0d1830 100%)',
          }}
        />
      )}

    </div>
  );
}
