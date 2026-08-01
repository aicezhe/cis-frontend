// Карточки разделов — общая оболочка для «шапка + важное + сравнение».
//
// Собраны из уже существующей палитры приложения: cream-страница,
// soft-cream карточка, navy-плашка для того, что нельзя пропустить.
// Заголовки антиквой, тело — Golos: на мелком кегле и длинных строках
// засечки дробят строку.

import { Fragment, type ReactNode } from 'react';

/** Внешняя карточка раздела. */
export function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 rounded-3xl border border-navy/10 bg-soft-cream px-5 py-6">{children}</div>
  );
}

/**
 * Шапка карточки: название и итальянский термин слева, характеристики
 * справа в столбик. Мета — не предложение, а пара коротких фактов, поэтому
 * они разнесены по строкам, а не склеены точками.
 */
export function CardHeader({
  title,
  gloss,
  meta,
}: {
  title: string;
  gloss?: string;
  meta?: string[];
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-serif text-navy text-3xl font-bold leading-tight">{title}</h2>
        {gloss && <p className="font-serif text-gold text-lg italic mt-0.5">{gloss}</p>}
      </div>
      {meta && meta.length > 0 && (
        <div className="flex-shrink-0 text-right">
          {meta.map((m) => (
            <p key={m} className="font-golos text-navy/50 text-sm leading-snug">
              {m}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Тёмная плашка для того, что нельзя пропустить. Первая строка — сам факт,
 * вторая приглушена: это уточнение, а не второй по важности факт.
 */
export function NavyNote({
  children,
  detail,
}: {
  children: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl bg-navy px-5 py-4">
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-gold text-gold text-[10px] leading-none"
        >
          !
        </span>
        <p className="font-golos text-cream text-[15px] font-semibold leading-snug">{children}</p>
      </div>
      {detail && (
        <p className="font-golos text-cream/60 text-[14px] leading-snug mt-2.5">{detail}</p>
      )}
    </div>
  );
}

export type CompareTone = 'good' | 'bad';

export interface CompareRow {
  label: string;
  left: string;
  right: string;
  leftTone?: CompareTone;
  rightTone?: CompareTone;
}

const TONE = {
  good: 'text-[#3a6d40]',
  bad: 'text-[#a8332a]',
} as const;

/**
 * Сравнение двух вариантов построчно. Таблица, а не два абзаца рядом:
 * человеку нужно поймать разницу по каждому признаку, а не прочитать два
 * описания и держать их в голове.
 */
export function CompareTable({
  columns,
  rows,
  note,
}: {
  columns: [string, string];
  rows: CompareRow[];
  note?: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-navy/10 bg-cream px-4 py-4">
      <div className="grid grid-cols-[minmax(52px,0.6fr)_1fr_1fr] gap-x-3 [&>*]:min-w-0">
        <span />
        {columns.map((c) => (
          <p key={c} className="font-golos text-navy text-[15px] font-semibold leading-snug pb-3">
            {c}
          </p>
        ))}

        {rows.map((r, i) => (
          <Fragment key={r.label}>
            <p
              className={
                'font-golos text-navy/45 text-[13px] leading-snug py-3 ' +
                (i > 0 ? 'border-t border-navy/10' : 'border-t border-navy/10')
              }
            >
              {r.label}
            </p>
            <p
              className={
                'font-golos text-[15px] leading-snug py-3 border-t border-navy/10 ' +
                (r.leftTone ? TONE[r.leftTone] : 'text-navy/85')
              }
            >
              {r.left}
            </p>
            <p
              className={
                'font-golos text-[15px] leading-snug py-3 border-t border-navy/10 ' +
                (r.rightTone ? TONE[r.rightTone] : 'text-navy/85')
              }
            >
              {r.right}
            </p>
          </Fragment>
        ))}
      </div>

      {note && (
        <p className="font-golos text-navy/45 text-[13px] leading-snug border-t border-navy/10 pt-3">
          {note}
        </p>
      )}
    </div>
  );
}
