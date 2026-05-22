import skyline from '../assets/parma design.svg';
import { useNavigate } from 'react-router-dom';


// Звёзды: позиции в процентах + размер. Можно добавлять/убирать.
const stars = [
  { top: '6%', left: '12%', size: 3 },
  { top: '9%', left: '78%', size: 2 },
  { top: '13%', left: '40%', size: 2 },
  { top: '16%', left: '88%', size: 3 },
  { top: '19%', left: '22%', size: 2 },
  { top: '22%', left: '63%', size: 2 },
  { top: '25%', left: '8%', size: 3 },
  { top: '27%', left: '50%', size: 2 },
  { top: '30%', left: '92%', size: 2 },
  { top: '33%', left: '33%', size: 3 },
  { top: '11%', left: '55%', size: 2 },
  { top: '17%', left: '70%', size: 2 },
  { top: '24%', left: '85%', size: 2 },
  { top: '8%', left: '30%', size: 2 },
  { top: '28%', left: '18%', size: 2 },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col items-center px-8 overflow-hidden">

      {/* Звёзды */}
      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-cream"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* Заголовок Ciao! */}
      <h1 className="font-serif text-cream text-7xl mt-32 mb-16">
        Ciao!
      </h1>

      {/* Слоган */}
      <div className="text-center mb-8">
        <p className="font-serif text-navy text-2xl font-semibold">
          Путь в Парму —
        </p>
        <p className="font-serif text-gold text-2xl italic">
          через тернии, но не в одиночку.
        </p>
      </div>

      {/* Подзаголовок */}
      <p className="font-serif text-navy text-lg text-center mb-12">
        Структура, ответы, поддержка для русскоязычных студентов.
      </p>

      {/* Кнопки */}
      <div className="flex gap-4 mb-auto">
        <button
          onClick={() => navigate('/login')}
          className="font-serif text-navy text-base border-2 border-navy rounded-full px-7 py-3"
        >
          ВОЙТИ
        </button>
        <button
          onClick={() => navigate('/register')}
          className="font-serif text-cream text-base bg-navy rounded-full px-7 py-3"
        >
          РЕГИСТРАЦИЯ
        </button>
      </div>

      {/* Здания Пармы */}
      <img
        src={skyline}
        alt="Здания Пармы"
        className="w-full"
      />

      {/* Декоративные полоски */}
      <div className="w-full flex flex-col gap-1 pb-6">
        <div className="h-0.5 bg-gold w-full" />
        <div className="h-0.5 bg-gold w-full" />
        <div className="h-0.5 bg-gold w-full" />
      </div>

    </div>
  );
}