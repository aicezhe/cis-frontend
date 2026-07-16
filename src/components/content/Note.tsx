import type { ReactNode } from 'react';

// gold-bg плашка для side-инфо: формат, нюансы, оговорки («можно онлайн»,
// «кроме случаев…»).
export function Note({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-content-gold-bg px-4 py-3 mt-3 flex gap-2.5">
      {icon && <span className="text-content-gold flex-shrink-0 mt-0.5 flex">{icon}</span>}
      <div className="text-content-ink text-[14.5px] leading-relaxed [&_b]:font-semibold [&_b]:text-content-navy">
        {children}
      </div>
    </div>
  );
}
