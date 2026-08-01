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
    <div className="rounded-2xl border border-rt-line bg-rt-paper-2 px-[18px] py-[17px]">
      {children}
    </div>
  );
}

/** Абзац внутри карточки. */
export function CardText({ children }: { children: ReactNode }) {
  return <p className="font-golos text-[15px] leading-[1.55] text-rt-ink-2">{children}</p>;
}

/** Уголки-скобки — фирменный мотив тёмных плашек приложения. */
function Corners() {
  const base = 'absolute w-3 h-3 border-rt-gold';
  return (
    <>
      <span className={base + ' left-3 top-3 border-l-2 border-t-2'} />
      <span className={base + ' right-3 top-3 border-r-2 border-t-2'} />
      <span className={base + ' bottom-3 left-3 border-b-2 border-l-2'} />
      <span className={base + ' bottom-3 right-3 border-b-2 border-r-2'} />
    </>
  );
}

/**
 * Тёмный блок для того, что нельзя пропустить. Плоская navy-плашка с
 * золотыми уголками — как остальные тёмные блоки приложения; градиента из
 * макета здесь нет намеренно, он выбивался из общего языка.
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
    <div className="rt-band relative overflow-hidden rounded-2xl bg-rt-navy p-5">
      <Corners />
      <p className="mb-[10px] flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-rt-gold-lite">
        <Diamond size={6} className="bg-rt-gold-lite" />
        {label}
      </p>
      <div className="relative font-golos text-[15px] leading-[1.58] text-rt-on-navy">
        {children}
      </div>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block border-b-[1.5px] border-rt-gold-lite pb-0.5 font-golos text-[13px] text-white"
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
            'relative py-[10px] pl-5 font-golos text-[15px] leading-[1.5] text-rt-ink-2 ' +
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
    <p className="ml-0.5 mt-[10px] flex items-start gap-[7px] font-mono text-[11px] italic leading-snug text-rt-gold-ink">
      {/* ромбик выравниваем по первой строке, а не по центру блока */}
      <span className="mt-1.5">
        <Diamond size={5} />
      </span>
      {children}
    </p>
  );
}
