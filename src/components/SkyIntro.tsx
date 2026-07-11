import { useEffect, useMemo } from 'react';

// Детерминированный псевдо-рандом по индексу.
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const TONES = ['225,235,255', '255,253,248', '255,246,230', '255,253,248'];

/**
 * Заставка на странице входа: оверлей стартует полностью синим (бесшовно после
 * «накрытия» на WelcomePage), звёзды летят потоком из центра на зрителя, затем
 * весь оверлей размывается и гаснет — открывается экран входа. onDone вызывается
 * по завершении, чтобы родитель снял оверлей.
 */
export default function SkyIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1250); // = длительность .sky-intro
    return () => window.clearTimeout(t);
  }, [onDone]);

  // Звёзды летят из центра наружу (радиально) — эффект приближения на зрителя.
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => {
        const angle = (i * 2.399963) % (Math.PI * 2); // золотой угол — равномерно
        const dist = 45 + rand(i) * 55; // vmax до края
        const gold = rand(i + 200) > 0.9;
        return {
          ex: `${(Math.cos(angle) * dist).toFixed(1)}vmax`,
          ey: `${(Math.sin(angle) * dist).toFixed(1)}vmax`,
          size: +(1 + rand(i + 100) * 2.2).toFixed(2),
          rgb: gold ? '199,168,118' : TONES[i % TONES.length],
          dur: (0.7 + rand(i + 300) * 0.5).toFixed(2),
          delay: (rand(i + 400) * 0.6).toFixed(2),
        };
      }),
    [],
  );

  return (
    <div
      className="sky-intro fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 44%, #17233d 0%, #0d1322 100%)' }}
    >
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={
            {
              top: '50%',
              left: '50%',
              width: s.size,
              height: s.size,
              background: `rgb(${s.rgb})`,
              boxShadow: `0 0 6px 1px rgba(${s.rgb},0.6)`,
              animation: `star-stream ${s.dur}s ease-in ${s.delay}s infinite`,
              '--ex': s.ex,
              '--ey': s.ey,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
