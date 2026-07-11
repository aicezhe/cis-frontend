import skyline from '../assets/parma design.svg';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Звёзды на ночном небе сверху — часть белые, часть золотые (цвет бренда).
// gold-звёзды чуть светятся. Мерцание + лёгкий дрейф задаются в index.css (.star),
// параметры на каждую — через CSS-переменные ниже.
const stars = [
  { top: '6%', left: '12%', size: 3, gold: false },
  { top: '9%', left: '78%', size: 3, gold: true },
  { top: '13%', left: '40%', size: 2, gold: false },
  { top: '16%', left: '88%', size: 3, gold: false },
  { top: '19%', left: '22%', size: 2, gold: true },
  { top: '22%', left: '63%', size: 3, gold: true },
  { top: '25%', left: '8%', size: 3, gold: false },
  { top: '11%', left: '55%', size: 2, gold: false },
  { top: '17%', left: '70%', size: 2, gold: true },
  { top: '8%', left: '30%', size: 2, gold: false },
  { top: '5%', left: '50%', size: 2, gold: true },
  { top: '14%', left: '18%', size: 2, gold: false },
  { top: '21%', left: '84%', size: 2, gold: false },
  { top: '27%', left: '38%', size: 2, gold: true },
  { top: '10%', left: '92%', size: 2, gold: false },
  { top: '24%', left: '48%', size: 2, gold: false },
];

// Детерминированные (не рандомные при ре-рендере) параметры анимации по индексу —
// чтобы звёзды мерцали/дрейфовали вразнобой, а не синхронно.
function starVars(i: number, gold: boolean): React.CSSProperties {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    '--tw-min': gold ? 0.3 : 0.45,
    '--tw-dur': `${2.4 + (i % 4) * 0.6}s`,
    '--tw-delay': `${((i * 0.53) % 3).toFixed(2)}s`,
    '--dx': `${dir * (2 + (i % 3))}px`,
    '--dy': `${-dir * (2 + ((i + 1) % 3))}px`,
    '--dr-dur': `${6 + (i % 4) * 1.3}s`,
    '--dr-delay': `${((i * 0.37) % 2).toFixed(2)}s`,
  } as React.CSSProperties;
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const [transition, setTransition] = useState<null | 'login' | 'register'>(null);

  // Поле звёзд для «влёта» (login): разлетаются из центра наружу по кругу.
  const warpStars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2 + (i % 5) * 0.6;
        const dist = 45 + (i % 6) * 10; // vmax
        return {
          tx: Math.round(Math.cos(angle) * dist),
          ty: Math.round(Math.sin(angle) * dist),
          size: 1 + (i % 3),
          gold: i % 4 === 0,
          delay: ((i * 0.045) % 0.9).toFixed(2),
          dur: (0.85 + (i % 4) * 0.15).toFixed(2),
        };
      }),
    [],
  );

  // Поле звёзд для регистрации: проходят сбоку (справа налево), на разной высоте.
  const passStars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        top: `${4 + ((i * 7) % 92)}%`,
        size: 1 + (i % 3),
        gold: i % 5 === 0,
        delay: ((i * 0.04) % 0.7).toFixed(2),
        dur: (0.85 + (i % 3) * 0.2).toFixed(2),
      })),
    [],
  );

  function goWithTransition(kind: 'login' | 'register') {
    if (transition) return;
    // у кого укачивает от анимаций — переходим сразу, без эффекта
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const path = kind === 'login' ? '/login' : '/register';
    if (reduce) {
      navigate(path);
      return;
    }
    setTransition(kind);
    setTimeout(() => navigate(path), kind === 'login' ? 1400 : 1150);
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col px-8 overflow-hidden">

      {/* Декоративные звёзды на синей шапке — мерцают и легонько дрейфуют */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="star absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: star.gold ? '#B89968' : 'rgba(244,241,233,0.7)',
            boxShadow: star.gold ? '0 0 6px 1px rgba(184,153,104,0.55)' : 'none',
            ...starVars(i, star.gold),
          }}
        />
      ))}

      {/* Тонкая золотая полоса сверху — как акцент бренда */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/60" />

      {/* Силуэт зданий — фоновый watermark прижат к самому низу */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none"
        style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
      />

      {/* HERO: слоган — главный визуальный акцент */}
      <div className="relative z-10 flex flex-col items-center text-center mt-48 px-6">
        <p
          className="font-serif text-navy font-bold leading-tight text-center"
          style={{
            fontSize: 'clamp(1.8rem, 7vw, 2.8rem)',
            letterSpacing: '0.04em',
          }}
        >
          Путь&nbsp;в&nbsp;Парму
        </p>
        <p className="font-serif text-cream italic text-lg leading-snug text-center mt-2">
          через тернии, но не в одиночку.
        </p>

        {/* Золотая чёрточка-разделитель */}
        <span className="block bg-gold/60" style={{ width: 40, height: 1, marginTop: 16, marginLeft: 'auto', marginRight: 'auto' }} />

        <p className="font-serif text-navy/60 text-sm leading-relaxed text-center mt-6 max-w-[260px]">
          Структура, ответы, поддержка для русскоязычных студентов.
        </p>
      </div>

      {/* Заполнитель: совсем небольшой — пустого центра не хотим */}
      <div className="flex-1 min-h-[16px]" />

      {/* CTA: войти — primary, регистрация — secondary link */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs mx-auto">
        <button
          onClick={() => goWithTransition('login')}
          className="font-serif text-cream text-lg bg-navy rounded-full py-3.5 px-16 shadow-sm border border-gold/50 active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(184,153,104,0.15)' }}
        >
          Войти
        </button>
        <button
          onClick={() => goWithTransition('register')}
          className="font-serif text-navy/70 text-sm mt-4 underline underline-offset-4 decoration-gold/60 decoration-1"
        >
          Впервые здесь? Создать аккаунт →
        </button>
      </div>

      {/* ── Оверлей перехода: вход = «влёт в поток звёзд» ── */}
      {transition === 'login' && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #1C2A48 0%, #0f1626 100%)',
            animation: 'overlay-fade-in 0.25s ease-out both',
          }}
        >
          {warpStars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: '50%',
                left: '50%',
                width: s.size,
                height: s.size,
                background: s.gold ? '#B89968' : '#F4F1E9',
                boxShadow: s.gold
                  ? '0 0 6px 1px rgba(184,153,104,0.6)'
                  : '0 0 4px rgba(244,241,233,0.6)',
                ...({ '--tx': `${s.tx}vmax`, '--ty': `${s.ty}vmax` } as React.CSSProperties),
                animation: `star-warp ${s.dur}s ease-in ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Оверлей перехода: регистрация = звёзды проходят сбоку ── */}
      {transition === 'register' && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #1C2A48 0%, #F4F1E9 100%)',
            animation: 'overlay-fade-in 0.25s ease-out both',
          }}
        >
          {passStars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: s.top,
                left: '105%',
                width: s.size,
                height: s.size,
                background: s.gold ? '#B89968' : 'rgba(244,241,233,0.85)',
                boxShadow: s.gold ? '0 0 6px 1px rgba(184,153,104,0.55)' : 'none',
                ...({ '--pass-x': '-130vw' } as React.CSSProperties),
                animation: `star-pass ${s.dur}s ease-in-out ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Резерв снизу под здания-watermark — больше, чтобы CTA поднялась */}
      <div className="min-h-[220px]" />

      {/* Тонкая золотая полоса внизу — рамка */}
      <div className="relative z-10 h-0.5 bg-gold/60 mb-4" />

    </div>
  );
}
