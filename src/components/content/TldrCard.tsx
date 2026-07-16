import { Fragment, type ReactNode } from 'react';

export interface TldrStat {
  value: string;
  label: string;
}

// Navy-карточка сразу под H1 — суть страницы в один экран. Опционально строка
// цифр/схема (значения 26px, подписи, стрелки между), затем абзац сути.
// Акценты внутри абзаца — <b> (золотой #D8BC85). Каждая страница начинается
// с TldrCard. Тёмная плашка-дисклеймер использует тот же стиль.
export function TldrCard({ stats, children }: { stats?: TldrStat[]; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl bg-content-navy px-5 py-5">
      {stats && stats.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-4">
          {stats.map((s, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="text-white/30 text-lg leading-none">→</span>}
              <div>
                <p className="text-white font-bold" style={{ fontSize: 26, lineHeight: 1 }}>{s.value}</p>
                <p className="text-white/55 text-xs mt-1">{s.label}</p>
              </div>
            </Fragment>
          ))}
        </div>
      )}
      <p
        className="text-[15.5px] leading-relaxed [&_b]:font-semibold [&_b]:text-[#D8BC85]"
        style={{ color: '#EDE7DA' }}
      >
        {children}
      </p>
    </section>
  );
}
