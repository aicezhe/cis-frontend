// Загрузка: три кольца печати CIS.PR дышат волной от внешнего к внутреннему.
//
// Кольца взяты из loadingIcon.svg как есть — это его единственная векторная
// часть. Сам файл весит 3.7 МБ, потому что 93% его — встроенный растр со
// зданиями и надписью; тащить его в бандл ради заставки бессмысленно, а на
// движении читаются всё равно только кольца.
//
// Кремовое кольцо r=440.5 из исходника пропущено намеренно: на кремовом фоне
// приложения его физически не видно.

import { useEffect, useRef, useState } from 'react';

// Одно движение кольца — вдох от малого к большому. Должно совпадать с
// длительностью loader-ring в index.css (там оно повторяется через alternate,
// поэтому полный вдох-выдох занимает вдвое больше).
export const LOADER_CYCLE_MS = 1600;

const RINGS = [
  { r: 446, stroke: '#D4A67F', width: 7, delay: '0ms' },
  { r: 396, stroke: '#1C2A48', width: 8, delay: '200ms' },
  { r: 271, stroke: '#1C2A48', width: 8, delay: '400ms' },
];

export function Loader({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 903 900"
      width={size}
      height={size}
      fill="none"
      className={'loader-in ' + className}
      role="status"
      aria-label="Загрузка"
    >
      {RINGS.map((ring) => (
        <circle
          key={ring.r}
          cx="451.955"
          cy="450.653"
          r={ring.r}
          stroke={ring.stroke}
          strokeWidth={ring.width}
          className="loader-ring"
          style={{ animationDelay: ring.delay }}
        />
      ))}
    </svg>
  );
}

/** Экран загрузки во весь рост — то, что было надписью «Загрузка…». */
export function LoadingScreen({ className = 'bg-cream' }: { className?: string }) {
  return (
    <div className={'min-h-screen flex items-center justify-center ' + className}>
      <Loader />
    </div>
  );
}

/**
 * Держит заставку на экране, пока анимация не отработает хотя бы один круг.
 *
 * Без этого быстрый ответ (кэш, локальный сид) даёт моргание: кольца успевают
 * появиться и тут же исчезнуть на середине вдоха. Если загрузка идёт дольше
 * круга — ничего не задерживаем, отдаём управление сразу.
 */
export function useMinCycle(active: boolean, cycleMs = LOADER_CYCLE_MS): boolean {
  const [held, setHeld] = useState(active);
  const startedAt = useRef<number | null>(active ? Date.now() : null);

  useEffect(() => {
    if (active) {
      if (startedAt.current === null) startedAt.current = Date.now();
      setHeld(true);
      return;
    }
    if (startedAt.current === null) {
      setHeld(false);
      return;
    }
    const rest = cycleMs - (Date.now() - startedAt.current);
    if (rest <= 0) {
      setHeld(false);
      return;
    }
    const t = setTimeout(() => setHeld(false), rest);
    return () => clearTimeout(t);
  }, [active, cycleMs]);

  return held;
}
