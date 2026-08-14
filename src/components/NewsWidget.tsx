import { useEffect, useRef, useState } from 'react';
import { useNews } from '../hooks/useNews';
import type { NewsCategory, NewsItem } from '../types/news';

const TABS: { id: NewsCategory; label_ru: string }[] = [
  { id: 'study', label_ru: 'Учёба' },
  { id: 'italy', label_ru: 'Италия' },
];

const VISIBLE_COUNT = 5;

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

// Единый акцент вместо зелёного/красного по категориям — тёмно-коричневый,
// в тон бренду (gold), не завязан на study/italy.
const ACCENT = '#6B4A32';

export function NewsWidget() {
  const [cat, setCat] = useState<NewsCategory>('study');
  const { items, loading, error } = useNews(cat, VISIBLE_COUNT);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      setActiveIdx(Math.round(el.scrollLeft / el.clientWidth));
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [items.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    setActiveIdx(0);
  }, [cat]);

  const openItem = items.find((n) => n.id === openId) || null;

  return (
    <>
      {/* Хедер раздела */}
      <div className="flex items-center justify-between px-6 mt-7 mb-3">
        <h2 className="font-serif text-navy text-xl leading-none">
          Новости
        </h2>
        <div className="flex gap-0">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCat(t.id)}
              className={
                'font-serif text-xs px-3 py-1 transition-colors ' +
                (i === 0 ? 'rounded-l-full' : 'rounded-r-full') + ' ' +
                (cat === t.id
                  ? 'bg-navy text-cream'
                  : 'bg-transparent text-navy/50 border border-navy/20')
              }
            >
              {t.label_ru}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div
          className="mx-6 rounded-2xl bg-soft-cream border border-navy/10 flex items-center justify-center"
          style={{ height: 190 }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {!loading && error && (
        <div
          className="mx-6 rounded-2xl border border-navy/10 bg-cream flex items-center justify-center px-6"
          style={{ height: 190 }}
        >
          <p className="font-serif text-navy/55 text-sm italic text-center">
            Не удалось загрузить — проверь интернет.
          </p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div
          className="mx-6 rounded-2xl border border-navy/10 bg-cream flex items-center justify-center px-6"
          style={{ height: 190 }}
        >
          <p className="font-serif text-navy/55 text-sm italic text-center">
            Пока пусто — собираем свежие материалы.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-6 pb-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {items.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>

          {/* Точки-индикатор СНИЗУ по центру (а не сбоку — менее «iOS-копия», более журнальное) */}
          {items.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2 px-6">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={
                    'block h-1 rounded-full transition-all ' +
                    (i === activeIdx ? 'w-5 bg-navy' : 'w-1 bg-navy/25')
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {openItem && <NewsModal item={openItem} onClose={() => setOpenId(null)} />}
    </>
  );
}

// ── Карточка в журнальном стиле: cream BG, полоса-акцент справа, крупная типографика ──
function NewsCard({ item, onOpen }: { item: NewsItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="relative snap-center flex-shrink-0 w-full rounded-2xl overflow-hidden text-left active:scale-[0.99] transition-transform bg-cream border border-navy/10"
      style={{ height: 190 }}
    >
      {/* Полоса-акцент справа */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1.5"
        style={{ backgroundColor: ACCENT }}
      />

      <div className="relative h-full flex flex-col justify-between p-4 pl-4 pr-5">
        {/* Верх: источник + дата */}
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="font-serif text-[9px] uppercase tracking-[0.25em] truncate"
            style={{ color: ACCENT }}
          >
            {item.source}
          </p>
          {item.published_at && (
            <p className="font-serif text-navy/40 text-[9px] flex-shrink-0">
              {fmtDate(item.published_at)}
            </p>
          )}
        </div>

        {/* Центр: заголовок serif */}
        <h3 className="font-serif text-navy text-base leading-[1.2] line-clamp-3 my-1">
          {item.title}
        </h3>

        {/* Низ: разделитель + читать */}
        <div className="flex items-center justify-between mt-1">
          <span
            className="block h-px flex-1 mr-3"
            style={{ background: 'rgba(28, 42, 72, 0.15)' }}
          />
          <p className="font-serif text-navy/70 text-[10px] italic">читать →</p>
        </div>
      </div>
    </button>
  );
}

// ── Bottom-sheet ────────────────────────────────────────────────────────────
function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-navy/60 flex items-end md:items-center justify-center md:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md md:max-w-lg bg-cream rounded-t-3xl md:rounded-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        <div className="px-6 pb-6 pt-2 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="font-serif text-[10px] uppercase tracking-widest" style={{ color: ACCENT }}>
              {item.source}
            </p>
            {item.published_at && (
              <p className="font-serif text-navy/40 text-[11px]">{fmtDate(item.published_at)}</p>
            )}
          </div>
          <h2 className="font-serif text-navy text-2xl font-bold leading-tight mb-3">
            {item.title}
          </h2>
          {item.summary && (
            <p className="font-serif text-navy/75 text-[15px] leading-relaxed mb-4">
              {item.summary}
            </p>
          )}
          <p className="font-serif text-navy/50 text-xs italic">
            Это краткое описание. Полный текст — по ссылке у источника.
          </p>
        </div>

        <div className="px-6 pb-6 flex-shrink-0 flex flex-col gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="w-full text-center font-serif text-cream bg-navy rounded-full py-3 text-sm no-underline"
            style={{ textDecoration: 'none' }}
          >
            Открыть источник ↗
          </a>
          <button
            onClick={onClose}
            className="w-full font-serif text-navy border border-navy/30 rounded-full py-3 text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
