import { useEffect, useMemo } from 'react';
import { rand, starBaseStyle, TRANSITION_STARS } from '../lib/nightSky';

/**
 * Заставка на странице входа. Оверлей стартует полностью синим (бесшовно после
 * «накрытия» на WelcomePage) с уже опустившимися звёздами. Звёзды разъезжаются
 * из своих позиций наружу — эффект приближения, БЕЗ центральной точки, — затем
 * весь оверлей плавно размывается и гаснет, открывая экран входа. onDone
 * вызывается по завершении, чтобы родитель снял оверлей.
 */
export default function SkyIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 1500); // = длительность .sky-intro
    return () => window.clearTimeout(t);
  }, [onDone]);

  // Те же звёзды, что «опустились» (TRANSITION_STARS) — на тех же местах.
  // Для каждой считаем вектор от центра и «разлёт» наружу + масштаб: приближение
  // идёт ровно от их позиций, без перескока.
  const field = useMemo(() => {
    return TRANSITION_STARS.map((s, i) => {
      const ox = parseFloat(s.left) - 50; // % от центра по X (vw)
      const oy = parseFloat(s.top) - 50; // vh от центра по Y
      const k = 1.9 + rand(i + 33) * 1.3; // множитель разлёта
      return {
        star: s,
        ax: `${(ox * (k - 1)).toFixed(1)}vw`,
        ay: `${(oy * (k - 1)).toFixed(1)}vh`,
        asc: (1.5 + rand(i + 44) * 1.4).toFixed(2),
        delay: (rand(i + 55) * 0.12).toFixed(2),
      };
    });
  }, []);

  return (
    <div
      className="sky-intro fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #1C2A48 0%, #12203a 55%, #0d1830 100%)' }}
    >
      {field.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={
            {
              top: f.star.top,
              left: f.star.left,
              width: f.star.size,
              height: f.star.size,
              ...starBaseStyle(f.star),
              animation: `star-approach 1.5s cubic-bezier(0.45, 0, 0.75, 1) ${f.delay}s both`,
              '--ax': f.ax,
              '--ay': f.ay,
              '--asc': f.asc,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
