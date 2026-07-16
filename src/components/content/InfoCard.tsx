import type { ReactNode } from 'react';

// Карточка с uppercase-тегом по роли (документ / требование / вариант),
// заголовком и описанием.
export function InfoCard({
  tag, title, children,
}: {
  tag?: string;
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4">
      {tag && (
        <span className="inline-block text-content-gold bg-content-gold-bg rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
          {tag}
        </span>
      )}
      {title && (
        <p className="text-content-navy text-[16.5px] font-semibold leading-snug mt-2">{title}</p>
      )}
      {children && (
        <div className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1 [&_b]:font-semibold [&_b]:text-content-navy">
          {children}
        </div>
      )}
    </div>
  );
}
