// Каркас страницы-маршрута: шапка, титул, легенда, станции, таббар.
// Компоненты ничего не знают о стране и теме — только принимают данные.

import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diamond } from './primitives';
import type { Confidence } from '../../types/guide';

/** Обёртка страницы: колонка 430px, фон бумаги, место под таббар. */
export function RoutePage({ children }: { children: ReactNode }) {
  return (
    <div className="rt-page min-h-screen bg-rt-paper">
      <div className="mx-auto max-w-[430px] px-5 pb-[110px]">{children}</div>
    </div>
  );
}

/**
 * Липкая шапка бренда. Нижняя граница появляется только когда страница
 * прокручена — на нуле линия под заголовком выглядела бы лишней чертой.
 */
export function RouteBar({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => ref.current?.classList.toggle('border-rt-line', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 -mx-5 flex items-center justify-between border-b border-transparent px-5 py-[14px] transition-colors"
      style={{ background: 'rgba(244, 241, 235, 0.9)', backdropFilter: 'blur(12px)' }}
    >
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        aria-label="Назад"
        className="text-base leading-none text-rt-ink"
      >
        ←
      </button>
      <span className="flex items-center gap-[7px] font-mono text-[10px] uppercase tracking-[0.22em] text-rt-ink-3">
        <Diamond size={6} />
        CIS.PR · PATH
      </span>
    </header>
  );
}

/** Титул страницы. Всё по левому краю — центровки в системе нет. */
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
    <section className="pb-1 pt-[26px]">
      {eyebrow && (
        <p className="mb-[14px] font-mono text-[10px] uppercase tracking-[0.2em] text-rt-ink-3">
          {eyebrow}
        </p>
      )}
      <h1 className="mb-[10px] font-display text-[32px] font-medium leading-none tracking-[-0.035em] text-rt-ink">
        {title}
      </h1>
      {gloss && (
        <p className="font-gloss text-xl font-medium italic text-rt-gold-ink">{gloss}</p>
      )}
      <div className="my-[18px] h-[1.5px] w-11 bg-rt-gold" />
      {lead && <p className="max-w-[33ch] text-[17px] leading-[1.5] text-rt-ink-2">{lead}</p>}
    </section>
  );
}

/** Легенда: что означают залитый и полый ромбы. */
export function ConfidenceLegend() {
  return (
    <div className="mb-[30px] mt-6 flex gap-4 rounded-[10px] border border-rt-line bg-rt-paper-2 px-[14px] py-[11px] font-mono text-[9px] uppercase tracking-[0.09em] text-rt-ink-3">
      <span className="inline-flex items-center gap-[7px]">
        <span aria-hidden="true" className="h-[9px] w-[9px] flex-none rotate-45 bg-rt-navy" />
        подтверждено
      </span>
      <span className="inline-flex items-center gap-[7px]">
        <span
          aria-hidden="true"
          className="h-[9px] w-[9px] flex-none rotate-45 border-[1.5px] border-rt-gold"
        />
        проверь сам
      </span>
    </div>
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
        <span className="font-mono text-[10px] font-medium tracking-[0.1em] text-rt-gold">
          {String(index).padStart(2, '0')}
        </span>
        {/* глоссы может не быть — итальянский термин не выдумываем */}
        {gloss && (
          <span className="font-gloss text-[15px] italic leading-none text-rt-gold-ink">{gloss}</span>
        )}
        {confidence === 'verify' && (
          <span className="ml-auto whitespace-nowrap rounded-sm border border-rt-gold-soft px-1.5 py-[3px] font-mono text-[8.5px] uppercase tracking-[0.12em] text-rt-gold-ink">
            ⟳ проверь
          </span>
        )}
      </div>
      <h2 className="mb-[13px] text-[19px] font-semibold leading-[1.25] tracking-[-0.015em] text-rt-ink">
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
