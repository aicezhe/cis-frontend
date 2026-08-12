import skyline from '../assets/parma design.svg';
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { makeStarField, starBaseStyle } from '../lib/nightSky';

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

// Небо для десктопной левой панели: занимает всю её высоту, а не верхнюю
// треть экрана, поэтому звёзд больше и разброс по top на все 100%. Сид тот же,
// что на панели входа, — два экрана стоят рядом в одном флоу, и разный рисунок
// неба читался бы как склейка из разных макетов.
const panelStars = makeStarField(64, 100, 21);

// Детерминированные параметры анимации по индексу — мерцание/дрейф вразнобой.
function starVars(i: number, twMin: number): React.CSSProperties {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    '--tw-min': twMin,
    '--tw-dur': `${2.2 + rand(i + 600) * 3}s`,
    '--tw-delay': `${(rand(i + 700) * 3.5).toFixed(2)}s`,
    '--dx': `${(dir * (1 + rand(i + 800) * 2)).toFixed(1)}px`,
    '--dy': `${(-dir * (1 + rand(i + 900) * 2)).toFixed(1)}px`,
    '--dr-dur': `${6 + rand(i + 1000) * 5}s`,
    '--dr-delay': `${(rand(i + 1100) * 2).toFixed(2)}s`,
  } as React.CSSProperties;
}

/** Уголки-скобки — фирменный мотив приложения (те же, что на карточке LOCI и
 *  на экране визы, там 12px золотом по тёмному).
 *
 *  Два размера, и разница между ними принципиальна: они стоят вложенно —
 *  синяя рамка обводит весь блок, золотая сидит на кнопке внутри неё. Будь
 *  они одного калибра, читались бы как две конкурирующие рамки; крупная
 *  внешняя и мелкая внутренняя складываются в одну иерархию.
 *
 *  Классы прописаны целиком, а не собраны из кусков (`top-${inset}`):
 *  Tailwind ищет имена классов в исходнике строками и склеенные не увидит. */
const CORNER_STYLES = {
  button: {
    base: 'w-2.5 h-2.5 border-gold',
    tl: 'top-2.5 left-2.5',
    tr: 'top-2.5 right-2.5',
    bl: 'bottom-2.5 left-2.5',
    br: 'bottom-2.5 right-2.5',
  },
  block: {
    base: 'w-4 h-4 border-navy/45',
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0',
  },
} as const;

function Corners({ variant = 'button' }: { variant?: keyof typeof CORNER_STYLES }) {
  const s = CORNER_STYLES[variant];
  const base = 'pointer-events-none absolute ' + s.base + ' ';
  return (
    <>
      <span className={base + s.tl + ' border-t-2 border-l-2'} />
      <span className={base + s.tr + ' border-t-2 border-r-2'} />
      <span className={base + s.bl + ' border-b-2 border-l-2'} />
      <span className={base + s.br + ' border-b-2 border-r-2'} />
    </>
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [leaving, setLeaving] = useState<null | 'login' | 'register'>(null);

  // Кнопка «Войти» по ширине фразы «Путь в Парму» — замеряем её вживую.
  const heroRef = useRef<HTMLParagraphElement>(null);
  const [heroWidth, setHeroWidth] = useState<number>();
  useLayoutEffect(() => {
    const measure = () => {
      if (heroRef.current) setHeroWidth(heroRef.current.offsetWidth);
    };
    measure();
    // Первый замер приходится на момент, когда Playfair ещё не подгрузился, и
    // фраза меряется метриками подменного шрифта: кнопка получала 193px вместо
    // 206 и такой оставалась до первого ресайза. Перемеряем, когда шрифты
    // доехали. Опционально — в jsdom document.fonts нет.
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Запуск анимации ухода, затем навигация. Вход — экран плавно гаснет (~0.5с)
  // и сменяется страницей входа. Регистрация — элементы по очереди отлетают,
  // экран бежевеет (~1.15с), это не трогали.
  //
  // На десктопе уход не анимируем вовсе: там вход — две панели, а не
  // полноэкранный переход, и затемнение поверх них читалось бы как чужой слой.
  function go(kind: 'login' | 'register') {
    if (leaving) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || isDesktop) {
      navigate(kind === 'login' ? '/login' : '/register');
      return;
    }
    setLeaving(kind);
    if (kind === 'login') {
      // Экран просто гаснет и сменяется входом. Флаг sky больше не шлём: он
      // включал на странице входа SkyIntro — продолжение «накрытия небом»,
      // которого теперь нет, и оно читалось бы как анимация на ровном месте.
      // 520мс = 500 у wp-fade + запас, чтобы уход дорисовался до перехода.
      window.setTimeout(() => navigate('/login'), 520);
    } else {
      window.setTimeout(() => navigate('/register'), 1150);
    }
  }

  // Регистрация: элемент отлетает влево/вправо со сдвигом очереди по order.
  // Вход: ничего не разлетается, весь экран плавно гаснет — см. frameCls.
  const leaveCls = (side: 'left' | 'right') =>
    leaving === 'register' ? (side === 'left' ? 'wp-fly-left' : 'wp-fly-right') : '';
  const leaveDelay = (order: number): React.CSSProperties =>
    leaving === 'register' ? { animationDelay: `${(order * 0.1).toFixed(2)}s` } : {};
  // При регистрации гаснут рамка и звёзды — текст в это время разлетается сам.
  const frameCls = leaving === 'register' ? 'wp-fade' : '';
  // Вход: гасим весь экран разом, одним классом на корне. Вешать fade на
  // каждый элемент по отдельности не нужно и вредно — слова, кнопка и небо
  // должны уходить одной волной, а не тремя наложенными прозрачностями.
  const leaveScreenCls = leaving === 'login' ? 'wp-fade' : '';

  // Десктоп — отдельная разметка: две панели, как на экране входа. Через md:
  // это не собрать, композиция другая по сути, а не по отступам.
  // Анимаций ухода тут нет вовсе — на широком экране переход мгновенный,
  // поэтому leaveCls/leaveDelay/frameCls ниже относятся только к телефону.
  if (isDesktop) {
    return (
      <div className="flex min-h-screen bg-soft-cream">

        {/* ── Левая панель: ночное небо и герой ───────────────────────────
            Ровно та же рамка, что на экране входа: те же 45%, те же плоские
            цвета без градиента, тот же силуэт и та же подпись понизу. Раньше
            Welcome был растянутой мобильной вёрсткой с закатным градиентом на
            всю страницу — рядом с входом это читалось как два разных
            приложения. */}
        <div className="relative w-[45%] flex-shrink-0 overflow-hidden bg-navy flex flex-col items-center justify-center px-12">

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

          {/* Силуэт на navy: multiply на тёмном съел бы линии в ноль, поэтому
              инверсия и прозрачность — как на панели входа. */}
          <img
            src={skyline}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-16 left-0 right-0 mx-auto w-full max-w-sm select-none"
            style={{ opacity: 0.16, filter: 'invert(1) brightness(1.6)' }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1
              className="font-serif text-cream font-bold leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.4vw, 3.25rem)', letterSpacing: '0.03em' }}
            >
              Путь&nbsp;в&nbsp;Парму
            </h1>
            <p className="font-serif text-gold italic text-xl mt-3">
              через тернии, но не в одиночку.
            </p>
            {/* Простая черта вместо орнамента с ромбом: на входе такая же,
                и минималистичность держится именно на этом. */}
            <span className="block bg-gold/60 mt-6" style={{ width: 56, height: 1 }} />
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-gold/40 py-4 text-center">
            <span className="font-serif text-cream/45 text-xs tracking-[0.28em]">
              PARMA · MMXXVI
            </span>
          </div>
        </div>

        {/* ── Правая панель: что это и с чего начать ────────────────────────
            Блок шире (max-w-md против sm): на 55% экрана узкая колонка висела
            в пустоте. Ритм собран вокруг кнопки — над ней воздуха больше, чем
            под ней, поэтому ссылка читается спутником кнопки, а описание
            отделено от пары. Раньше отступы были 40 сверху и 24 снизу, и связь
            распадалась: три отдельных элемента вместо одного узла. */}
        <div className="flex flex-1 items-center justify-center px-4 lg:px-12">
          {/* Синяя рамка из уголков обводит весь узел, а не только кнопку.
              Отступы внутри неё крупные не для красоты: уголок стоит в самом
              углу бокса, и подойди текст ближе — рамка читалась бы обводкой
              абзаца, а не полем, в котором он лежит.
              До lg отступы урезаны, и это не вкусовщина, а арифметика: колонка
              внутри фиксированные 304px, правая панель — 55% ширины окна.
              С полными 48+48 узлу нужно 496px, то есть окно от 902px, а
              десктопная вёрстка включается уже с 768 (айпад). На 820px страница
              разъезжалась вбок — scrollWidth 865 при окне 820. */}
          <div className="relative flex flex-col items-center px-6 py-10 text-center lg:px-12 lg:py-14">
            <Corners variant="block" />

            {/* Ширина та же, что у кнопки: абзац и кнопка стоят одной колонкой
                в 304px, и их края совпадают. Неразрывный пробел держит «для»
                при следующем слове — без него строка ломалась после предлога и
                он висел в конце. */}
            <p className="w-[19rem] font-serif text-navy/85 font-medium text-xl leading-relaxed">
              Структура, ответы, поддержка для&nbsp;русскоязычных студентов.
            </p>

            {/* 19rem = 304px: столько занимала длинная строка описания (297px),
                когда абзац верстался свободно. Теперь по этой мерке выровнены
                оба — и кнопка, и текст. Кнопка во всю колонку (448px) была
                шире описания, и уголки расползались по концам широкой полосы,
                читаясь рамкой вокруг плашки, а не скобками.
                Пилюля с золотой обводкой заменена прямоугольником с уголками:
                на скруглении в 9999px уголок-скобка лечь не может, ему нужна
                прямая сторона. Обводки нет вовсе — на тёмных плашках
                приложения уголки стоят без неё, и вместе они дали бы двойную
                золотую рамку. */}
            <button
              onClick={() => go('login')}
              className="relative mt-9 w-[19rem] rounded-xl bg-navy py-4 font-serif text-cream text-xl shadow-sm transition-colors hover:bg-navy/90"
            >
              <Corners />
              Войти
            </button>

            <p className="font-serif text-navy/75 font-medium text-base mt-5">
              Впервые здесь?{' '}
              <button
                onClick={() => go('register')}
                className="text-navy underline underline-offset-4 decoration-gold/60 decoration-1 hover:decoration-gold hover:decoration-2"
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
    <div className={`relative min-h-screen max-w-md md:max-w-none mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col md:justify-center px-8 overflow-hidden ${leaveScreenCls}`}>

      {/* Звёздное небо — единым слоем (чтобы уходило целиком).
          Свечение (ореол) только у крупных/ярких — как у настоящих звёзд.
          При уходе на вход замораживаем (они под вуалью — незачем анимировать). */}
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
        className={`absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none md:max-w-2xl md:mx-auto z-0 ${frameCls}`}
        style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
      />

      {/* HERO: слоган — главный визуальный акцент */}
      <div className="relative z-10 flex flex-col items-center text-center mt-48 md:mt-0 px-6">
        <p
          ref={heroRef}
          className={`font-serif text-navy font-bold leading-tight text-center inline-block ${leaveCls('left')}`}
          style={{
            fontSize: 'clamp(1.8rem, 7vw, 4rem)',
            letterSpacing: '0.04em',
            ...leaveDelay(0),
          }}
        >
          Путь&nbsp;в&nbsp;Парму
        </p>
        <p
          className={`font-serif text-cream md:text-gold italic text-lg md:text-2xl leading-snug text-center mt-2 md:mt-4 ${leaveCls('right')}`}
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
          className={`font-serif text-navy/60 text-sm md:text-base leading-relaxed text-center mt-6 max-w-[260px] md:max-w-sm ${leaveCls('right')}`}
          style={leaveDelay(3)}
        >
          Структура, ответы, поддержка для русскоязычных студентов.
        </p>
      </div>

      {/* Зазор до CTA фиксированный: раньше тут был flex-1, и на высоких
          экранах кнопка «уезжала» далеко от текста. Лишнюю высоту теперь
          забирает нижний резерв под зданиями. */}
      <div className="min-h-[40px]" />

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

      {/* Резерв снизу под здания-watermark: теперь он тянется (flex-1), чтобы
          лишняя высота экрана уходила сюда, а не в зазор текст↔кнопка */}
      <div className="flex-1 min-h-[220px] md:hidden" />

      {/* Тонкая золотая полоса внизу — рамка */}
      <div
        className={`relative z-10 h-0.5 bg-gold/60 mb-4 md:absolute md:inset-x-0 md:bottom-0 md:mb-0 ${frameCls}`}
      />

      {/* Регистрация: бежевый экран проступает по мере отлёта элементов */}
      {leaving === 'register' && (
        <div className="wp-cream-in absolute inset-0 bg-cream" style={{ zIndex: 5 }} />
      )}


    </div>
  );
}
