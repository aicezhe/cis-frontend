import type { ReactNode } from 'react';

// Реальная последовательность действий/этапов. Surface-карточки с круглым
// номером в gold-bg.
export function Steps({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 mt-4">{children}</div>;
}

export function Step({
  number, title, children,
}: {
  number: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 flex gap-3.5">
      <span className="flex-shrink-0 w-[30px] h-[30px] rounded-full bg-content-gold-bg text-content-gold font-bold text-sm flex items-center justify-center">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-content-navy text-base font-semibold leading-snug">{title}</p>
        {children && (
          <div className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1 [&_b]:font-semibold [&_b]:text-content-navy">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
