// Каркас страницы-маршрута: шапка, титул, легенда, станции, таббар.
// Компоненты ничего не знают о стране и теме — только принимают данные.

import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Confidence } from '../../types/guide';

/**
 * Обёртка страницы. Колонка max-w-md и отступ pb-28 под таббар — те же, что
 * на остальных экранах приложения, чтобы ширина и ритм не прыгали при
 * переходе между разделами.
 */
export function RoutePage({ children }: { children: ReactNode }) {
  return (
    <div className="rt-page relative mx-auto min-h-screen max-w-md bg-rt-paper px-6 pb-28">
      {children}
    </div>
  );
}

/** Возврат назад — той же стрелкой и в том же месте, что на всех страницах. */
export function RouteBar({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="pt-12">
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label="Назад"
        className="text-2xl text-rt-ink"
      >
        ←
      </button>
    </div>
  );
}

/**
 * Титул страницы — канон приложения: заголовок антиквой, курсивный золотой
 * подзаголовок, мета, золотая линия 72×1 по центру. Порядок и центровка те же,
 * что на остальных разделах, чтобы страница не выглядела чужой.
 */
export function GuideHero({
  eyebrow,
  title,
  gloss,
  lead,
}: {
  eyebrow: string;
  title: string;
  gloss: string;
  lead?: string;
}) {
  return (
    <section className="mt-4 text-center">
      <h1 className="font-display text-3xl font-bold text-rt-ink">{title}</h1>
      {gloss && <p className="mt-1 font-gloss text-base italic text-rt-gold-ink">{gloss}</p>}
      {eyebrow && <p className="mt-1 font-display text-xs text-rt-ink-3">{eyebrow}</p>}
      <span className="mx-auto mt-3 block bg-rt-gold/60" style={{ width: 72, height: 1 }} />
      {lead && (
        <p className="mt-5 font-display text-sm leading-relaxed text-rt-ink-2">{lead}</p>
      )}
    </section>
  );
}

/**
 * Контейнер маршрута. Отступ слева держит вертикальную линию и ромбы,
 * которые вынесены в отрицательные координаты (см. .rt-stop в index.css).
 *
 * Здесь же один общий IntersectionObserver на все станции — дешевле, чем
 * по наблюдателю на каждую.
 */
export function RouteSpine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stops = Array.from(root.querySelectorAll<HTMLElement>('.rt-stop'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stops.forEach((s) => s.classList.add('rt-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('rt-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    stops.forEach((s, i) => {
      // лёгкая расфазировка через одну: маршрут проявляется волной, а не разом
      s.style.transitionDelay = `${i % 2 ? 60 : 0}ms`;
      io.observe(s);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative pl-8">
      {children}
    </div>
  );
}

/** Станция маршрута. Статус задаёт и ромб, и вид линии до следующей. */
export function RouteStop({
  confidence,
  children,
}: {
  confidence: Confidence;
  children: ReactNode;
}) {
  return (
    <div className={'rt-stop relative pb-[30px]' + (confidence === 'verify' ? ' rt-stop--verify' : '')}>
      {children}
    </div>
  );
}

/** Шапка станции: номер, глосса и чип «проверь» справа. */
export function StopHeader({
  index,
  gloss,
  title,
  confidence,
}: {
  index: number;
  gloss: string;
  title: string;
  confidence: Confidence;
}) {
  return (
    <>
      <div className="mb-[7px] flex items-center gap-[9px]">
        <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-rt-gold">
          {String(index).padStart(2, '0')}
        </span>
        {/* глоссы может не быть — итальянский термин не выдумываем */}
        {gloss && (
          <span className="font-gloss text-[15px] italic leading-none text-rt-gold-ink">{gloss}</span>
        )}
        {confidence === 'verify' && (
          <span className="ml-auto whitespace-nowrap rounded-full border border-rt-gold-soft px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.1em] text-rt-gold-ink">
            проверь
          </span>
        )}
      </div>
      <h2 className="mb-[13px] font-display text-[19px] font-bold leading-[1.25] text-rt-ink">
        {title}
      </h2>
    </>
  );
}

/** Курсивная строка в конце маршрута: куда человек идёт дальше. */
export function RouteOutro({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 border-t border-rt-line pt-4 font-gloss text-base italic text-rt-ink-3">
      {children}
    </p>
  );
}

/** Нижняя навигация в языке «Маршрута»: ромб вместо иконки. */
export function RouteTabBar({ active }: { active: 'laura' | 'path' | 'loci' }) {
  const navigate = useNavigate();
  const tabs = [
    { id: 'laura', label: 'Laura', route: '/laura' },
    { id: 'path', label: 'Path', route: '/path' },
    { id: 'loci', label: 'Loci', route: '/map' },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-3 border-t border-rt-line pt-[13px]"
      style={{
        background: 'rgba(251, 249, 245, 0.95)',
        backdropFilter: 'blur(12px)',
        paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map((tab) => {
        const cur = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.route)}
            className={
              'text-center font-mono text-[10px] uppercase tracking-[0.2em] ' +
              (cur ? 'text-rt-ink' : 'text-rt-ink-3')
            }
          >
            <span
              aria-hidden="true"
              className={
                'mx-auto mb-[7px] block h-1.5 w-1.5 rotate-45 border ' +
                (cur ? 'border-rt-gold bg-rt-gold' : 'border-rt-line')
              }
            />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
