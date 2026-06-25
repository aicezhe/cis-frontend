import skyline from '../assets/parma design.svg';
import { useNavigate } from 'react-router-dom';

// Звёзды на ночном небе сверху — лёгкая декорация
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

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col px-8 overflow-hidden">

      {/* Декоративные звёзды на синей шапке */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cream/60"
          style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
        />
      ))}

      {/* Тонкая золотая полоса сверху — как акцент бренда */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/60" />

      {/* Силуэт зданий — фоновый watermark снизу, не доминирует */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        className="absolute bottom-12 left-0 right-0 w-full pointer-events-none select-none"
        style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
      />

      {/* HERO: Ciao + слоган + описание — занимают верх */}
      <div className="relative z-10 flex flex-col items-center text-center mt-24 mb-10">
        <h1 className="font-serif text-cream text-6xl leading-none mb-10">
          Ciao!
        </h1>
        <p className="font-serif text-navy text-xl font-semibold leading-snug">
          Путь в Парму —
        </p>
        <p className="font-serif text-gold text-xl italic leading-snug">
          через тернии, но не в одиночку.
        </p>
        <p className="font-serif text-navy/70 text-sm mt-5 max-w-xs">
          Структура, ответы, поддержка для русскоязычных студентов.
        </p>
      </div>

      {/* CTA: основной — войти, второстепенный — текст-ссылка регистрация */}
      <div className="relative z-10 flex flex-col items-center mt-auto mb-12 w-full max-w-xs mx-auto">
        <button
          onClick={() => navigate('/login')}
          className="w-full font-serif text-cream text-lg bg-navy rounded-full py-3.5 shadow-sm active:scale-[0.98] transition-transform"
        >
          Войти
        </button>
        <button
          onClick={() => navigate('/register')}
          className="font-serif text-navy/70 text-sm mt-4 underline underline-offset-4 decoration-gold/60 decoration-1"
        >
          Впервые здесь? Создать аккаунт →
        </button>
      </div>

      {/* Тонкая золотая полоса внизу — рамка */}
      <div className="relative z-10 h-0.5 bg-gold/60 mb-4" />

    </div>
  );
}
