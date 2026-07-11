import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

type Kind = 'login' | 'register';
type RunFn = (kind: Kind, path: string) => void;

const Ctx = createContext<RunFn>(() => {});

/** Запустить плавный переход на новый маршрут (со звёздной заставкой). */
export const usePageTransition = () => useContext(Ctx);

// Тайминги (мс). Всё мягкое и небыстрое — эффект «спокойного ночного неба»,
// без резких движений. FADE_IN перекрывает экран, под покрытием меняется
// маршрут, затем FADE_OUT плавно проявляет новую страницу.
const FADE_IN = 900;
const HOLD = 300;
const FADE_OUT = 950;

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<Kind | null>(null);
  const [visible, setVisible] = useState(false); // opacity через CSS-transition
  const busy = useRef(false);

  const run = useCallback<RunFn>(
    (kind, path) => {
      if (busy.current) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        navigate(path);
        return;
      }
      busy.current = true;
      setActive(kind);
      // на следующий кадр включаем видимость → CSS плавно затемняет экран
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      // экран полностью перекрыт → меняем маршрут незаметно под покрытием
      window.setTimeout(() => {
        navigate(path);
        window.setTimeout(() => {
          setVisible(false); // плавно проявляем новую страницу
          window.setTimeout(() => {
            setActive(null);
            busy.current = false;
          }, FADE_OUT);
        }, HOLD);
      }, FADE_IN);
    },
    [navigate],
  );

  return (
    <Ctx.Provider value={run}>
      {children}
      {active && <Overlay kind={active} visible={visible} />}
    </Ctx.Provider>
  );
}

// Детерминированный псевдо-рандом (тот же приём, что на WelcomePage).
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const TONES = ['225,235,255', '255,253,248', '255,246,230', '255,253,248'];

function Overlay({ kind, visible }: { kind: Kind; visible: boolean }) {
  // Натуральное звёздное поле: в основном мелкие тусклые + редкие яркие/золотые,
  // разброс по размеру, яркости и оттенку. Пара крупных размытых — для глубины.
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const r1 = rand(i);
        const r2 = rand(i + 100);
        const size = +(0.8 + r1 * r1 * 2.4).toFixed(2);
        const bright = +(0.3 + r2 * r2 * 0.7).toFixed(2);
        const gold = rand(i + 200) > 0.9;
        return {
          top: `${(rand(i + 300) * 100).toFixed(1)}%`,
          left: `${(rand(i + 400) * 100).toFixed(1)}%`,
          size,
          bright,
          rgb: gold ? '199,168,118' : TONES[i % TONES.length],
          big: rand(i + 500) > 0.93,
          min: +(0.35 + rand(i + 600) * 0.45).toFixed(2),
          dur: `${3 + rand(i + 700) * 3}s`,
          delay: `${(rand(i + 800) * 2.5).toFixed(2)}s`,
        };
      }),
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      style={{
        background: 'radial-gradient(circle at 50% 44%, #17233d 0%, #0d1322 100%)',
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? FADE_IN : FADE_OUT}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: 'opacity',
      }}
    >
      {/* Слой со звёздами: вход = медленное приближение, регистрация = дрейф вбок */}
      <div
        className="absolute inset-0"
        style={{
          animation:
            kind === 'login'
              ? 'transition-approach 2.1s ease-out both'
              : 'transition-side 2.1s ease-in-out both',
        }}
      >
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={
              {
                top: s.top,
                left: s.left,
                width: s.big ? s.size * 2.2 : s.size,
                height: s.big ? s.size * 2.2 : s.size,
                background: `rgba(${s.rgb},${s.bright})`,
                boxShadow:
                  s.size > 1.8 && !s.big
                    ? `0 0 ${Math.round(s.size * 2.5)}px ${(s.size * 0.4).toFixed(1)}px rgba(${s.rgb},${(s.bright * 0.55).toFixed(2)})`
                    : 'none',
                filter: s.big ? 'blur(2.5px)' : 'none',
                opacity: s.big ? 0.5 : 1,
                animation: `star-twinkle ${s.dur} ease-in-out ${s.delay} infinite`,
                '--tw-min': s.min,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
