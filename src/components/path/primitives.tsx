// Мелкие кирпичи дизайн-системы «Маршрут».
//
// Ромб — несущий элемент языка: он же маркер станции, буллет списка, значок
// TTL и индикатор вкладки. Поэтому он один компонент, а не четыре разных иконки.

import type { ReactNode } from 'react';
import { TERM_PATTERN } from '../../types/guide';

/** Ромб. Один размер на все роли, отличается только пикселями и цветом. */
export function Diamond({ size = 6, className = 'bg-rt-gold' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={'inline-block flex-none rotate-45 ' + className}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Ключевой термин. Одно поведение на светлом фоне, другое на тёмном —
 * переключается контекстом (правило `.rt-band .rt-term` в index.css),
 * а не вторым пропом-дублёром.
 */
export function Term({ children }: { children: ReactNode }) {
  return <span className="rt-term">{children}</span>;
}

/**
 * Оборачивает в <Term> бюрократические имена собственные, которые уже
 * работают в тексте как термины: Universitaly, Prenot@Mi, permesso di
 * soggiorno и т.п. Ничего не добавляет и не переписывает — только размечает
 * то, что в тексте уже есть.
 */
export function withTerms(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TERM_PATTERN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(<Term key={`${at}-${m[0]}`}>{m[0]}</Term>);
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Светлая карточка — основная поверхность для текста станции. */
export function Card({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-[14px] border border-rt-line bg-rt-paper-2 px-[18px] py-[17px]"
      style={{ boxShadow: '0 1px 2px rgba(22, 37, 62, 0.04)' }}
    >
      {children}
    </div>
  );
}

/** Абзац внутри карточки. */
export function CardText({ children }: { children: ReactNode }) {
  return <p className="text-[15.5px] leading-[1.55] text-rt-ink-2">{children}</p>;
}

/**
 * Тёмный блок — единственное место в системе, где разрешён градиент.
 * Он же единственный носитель ссылки на первоисточник.
 */
export function DarkBand({
  label,
  children,
  link,
}: {
  label: string;
  children: ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <div
      className="rt-band relative overflow-hidden rounded-[14px] p-[18px]"
      style={{ background: 'linear-gradient(160deg, var(--rt-navy) 0%, var(--rt-navy-2) 100%)' }}
    >
      <p className="mb-[10px] flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-rt-gold-lite">
        <Diamond size={6} className="bg-rt-gold-lite" />
        {label}
      </p>
      <div className="relative text-[15.5px] leading-[1.58] text-rt-on-navy">{children}</div>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block border-b-[1.5px] border-rt-gold-lite pb-0.5 font-mono text-[13px] text-white"
        >
          {link.label}
        </a>
      )}
    </div>
  );
}

/** Список с золотыми ромбами вместо буллетов и разделителями между строками. */
export function DiamondList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, i) => (
        <li
          key={i}
          className={
            'relative py-[10px] pl-5 text-[15.5px] leading-[1.5] text-rt-ink-2 ' +
            (i < items.length - 1 ? 'border-b border-rt-line' : 'pb-0')
          }
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-[17px] h-1.5 w-1.5 rotate-45 bg-rt-gold"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Строка под блоком: что именно стоит перепроверить и почему. */
export function TtlNote({ children }: { children: ReactNode }) {
  return (
    <p className="ml-0.5 mt-[10px] flex items-center gap-[7px] font-mono text-[9.5px] tracking-[0.08em] text-rt-gold-ink">
      <Diamond size={5} />
      {children}
    </p>
  );
}
