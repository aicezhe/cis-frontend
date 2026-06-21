import { useEffect, useRef, useState } from 'react';
import { useNews } from '../hooks/useNews';
import type { NewsCategory, NewsItem } from '../types/news';

const TABS: { id: NewsCategory; label_ru: string }[] = [
  { id: 'study', label_ru: 'Учёба' },
  { id: 'italy', label_ru: 'Италия' },
];

const VISIBLE_COUNT = 5; // сколько листать в свайпе

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

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

  // На смене категории — скроллим в начало
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    setActiveIdx(0);
  }, [cat]);

  const openItem = items.find((n) => n.id === openId) || null;

  return (
    <>
      {/* Header + tabs */}
      <div className="flex items-center justify-between px-6 mt-6 mb-3">
        <p className="font-serif text-gold text-xs italic uppercase tracking-[0.2em]">
          Сегодня почитать
        </p>
        <div className="flex gap-1 bg-soft-cream border border-navy/15 rounded-full p-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setCat(t.id)}
              className={
                'font-serif text-[11px] px-3 py-1 rounded-full transition-colors ' +
                (cat === t.id ? 'bg-navy text-cream' : 'text-navy/60')
              }
            >
              {t.label_ru}
            </button>
          ))}
        </div>
      </div>

      {/* Загрузка / ошибка / пусто / контент */}
      {loading && (
        <div className="mx-6 rounded-3xl bg-soft-cream animate-pulse" style={{ aspectRatio: '5 / 4' }} />
      )}

      {!loading && error && (
        <div className="mx-6 rounded-3xl border border-navy/15 bg-soft-cream p-6 text-center" style={{ aspectRatio: '5 / 4' }}>
          <p className="font-serif text-navy/60 text-sm italic mb-3">
            Не удалось загрузить новости. Проверь интернет.
          </p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mx-6 rounded-3xl border border-navy/15 bg-soft-cream p-6 text-center" style={{ aspectRatio: '5 / 4' }}>
          <p className="font-serif text-navy/60 text-sm italic">
            Пока пусто — собираем свежие материалы. Зайди позже.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-6 pb-1"
            style={{ scrollBehavior: 'smooth' }}
          >
            {items.map((item) => (
              <NewsCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>

          {items.length > 1 && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={
                    'block w-1.5 h-1.5 rounded-full transition-all ' +
                    (i === activeIdx ? 'bg-cream' : 'bg-cream/35')
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

// ── Большая свайп-карточка ──────────────────────────────────────────────────
function NewsCard({ item, onOpen }: { item: NewsItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="relative snap-center flex-shrink-0 w-full rounded-3xl overflow-hidden text-left active:scale-[0.99] transition-transform"
      style={{
        aspectRatio: '5 / 4',
        background: 'linear-gradient(135deg, #1c2a48 0%, #243558 55%, #1c2a48 100%)',
      }}
    >
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

      <span
        aria-hidden
        className="absolute -bottom-12 -right-10 font-serif text-gold/10 select-none pointer-events-none"
        style={{ fontSize: '180px', lineHeight: 1 }}
      >
        ¬
      </span>

      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <p className="font-serif text-gold text-[10px] uppercase tracking-[0.25em]">
            {item.source}
          </p>
          {item.published_at && (
            <p className="font-serif text-cream/40 text-[10px]">{fmtDate(item.published_at)}</p>
          )}
        </div>

        <div>
          <h3 className="font-serif text-cream text-xl font-bold leading-snug mb-2 line-clamp-4">
            {item.title}
          </h3>
          {item.summary && (
            <p className="font-serif text-cream/60 text-xs leading-snug line-clamp-3">
              {item.summary}
            </p>
          )}
          <p className="font-serif text-gold text-xs mt-3 opacity-80">читать →</p>
        </div>
      </div>
    </button>
  );
}

// ── Bottom-sheet с полным summary + ссылкой на источник ────────────────────
function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-navy/60 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-cream rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        <div className="px-6 pb-6 pt-2 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="font-serif text-gold text-[10px] uppercase tracking-widest">
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
