import skyline from '../assets/parma design.svg';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePageTransition } from '../components/PageTransition';

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
    '--tw-min': gold ? 0.55 : 0.7, // поярче
    '--tw-dur': `${2.4 + (i % 4) * 0.6}s`,
    '--tw-delay': `${((i * 0.53) % 3).toFixed(2)}s`,
    '--dx': `${dir * (2 + (i % 3))}px`,
    '--dy': `${-dir * (2 + ((i + 1) % 3))}px`,
    '--dr-dur': `${6 + (i % 4) * 1.3}s`,
    '--dr-delay': `${((i * 0.37) % 2).toFixed(2)}s`,
  } as React.CSSProperties;
}

export default function WelcomePage() {
  const startTransition = usePageTransition();

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
            background: star.gold ? '#C7A876' : 'rgba(255,253,248,0.95)',
            boxShadow: star.gold
              ? '0 0 7px 1.5px rgba(199,168,118,0.75)'
              : '0 0 4px 0.5px rgba(255,253,248,0.6)',
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
          ref={heroRef}
          className="font-serif text-navy font-bold leading-tight text-center inline-block"
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
          onClick={() => startTransition('login', '/login')}
          className="font-serif text-cream text-lg bg-navy rounded-full py-3.5 shadow-sm border border-gold/50 active:scale-[0.98] transition-transform"
          style={{
            width: heroWidth,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(184,153,104,0.15)',
          }}
        >
          Войти
        </button>
        <button
          onClick={() => startTransition('register', '/register')}
          className="font-serif text-navy/70 text-sm mt-4 underline underline-offset-4 decoration-gold/60 decoration-1"
        >
          Впервые здесь? Создать аккаунт →
        </button>
      </div>

      {/* Резерв снизу под здания-watermark — больше, чтобы CTA поднялась */}
      <div className="min-h-[220px]" />

      {/* Тонкая золотая полоса внизу — рамка */}
      <div className="relative z-10 h-0.5 bg-gold/60 mb-4" />

    </div>
  );
}
