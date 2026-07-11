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

function Overlay({ kind, visible }: { kind: Kind; visible: boolean }) {
  // Мягкое звёздное поле: небольшие точки со свечением + редкие крупные
  // размытые для глубины. Расположение детерминированное (не прыгает).
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => ({
        top: `${((i * 16.18) % 100).toFixed(1)}%`,
        left: `${((i * 61.803) % 100).toFixed(1)}%`,
        size: 1 + (i % 3),
        gold: i % 6 === 0,
        big: i % 13 === 0,
        min: 0.4 + ((i % 4) * 0.12),
        dur: `${3 + (i % 5)}s`,
        delay: `${((i * 0.11) % 2.2).toFixed(2)}s`,
      })),
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
                width: s.size,
                height: s.size,
                background: s.gold ? '#C7A876' : 'rgba(255,253,248,0.92)',
                boxShadow: s.gold
                  ? '0 0 8px 2px rgba(199,168,118,0.6)'
                  : '0 0 5px 1px rgba(255,253,248,0.5)',
                filter: s.big ? 'blur(2px)' : 'none',
                opacity: s.big ? 0.55 : 1,
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
