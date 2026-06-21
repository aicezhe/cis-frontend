import { useEffect, useRef, useState } from 'react';
import { useNews } from '../hooks/useNews';
import type { NewsItem } from '../types/news';

const CATEGORY_LABELS: Record<string, string> = {
  uni: 'учёба',
  visa: 'виза',
  finance: 'финансы',
  life: 'жизнь',
  tip: 'совет',
};

export function NewsWidget() {
  const { today, loading } = useNews(3);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Отслеживаем какая карточка по центру (для точек-индикатора)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(idx);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [today.length]);

  if (loading) {
    return <div className="mx-6 mt-6 h-48 rounded-3xl bg-soft-cream animate-pulse" />;
  }
  if (today.length === 0) return null;

  const openItem = today.find((n) => n.id === openId) || null;

  return (
    <>
      {/* Header секции */}
      <p className="font-serif text-gold text-xs italic uppercase tracking-[0.2em] px-6 mt-6 mb-3">
        Сегодня почитать
      </p>

      <div className="relative">
        {/* Полоса свайпаемых карточек */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-6 pb-1"
          style={{ scrollBehavior: 'smooth' }}
        >
          {today.map((item) => (
            <NewsCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
          ))}
        </div>

        {/* Точки-индикатор справа сбоку, вертикально (как в Apple widget) */}
        {today.length > 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
            {today.map((_, i) => (
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

      {/* Модалка с полным текстом */}
      {openItem && <NewsModal item={openItem} onClose={() => setOpenId(null)} />}
    </>
  );
}

// ── Одна свайп-карточка ─────────────────────────────────────────────────────
function NewsCard({ item, onOpen }: { item: NewsItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="relative snap-center flex-shrink-0 w-full rounded-3xl overflow-hidden text-left active:scale-[0.99] transition-transform"
      style={{
        // ширина = ширина контейнера минус paddinng (px-6 = 24*2)
        width: 'calc(100% - 0px)',
        // 4:3 пропорция как у iOS-виджета фото — крупная, заметная карточка
        aspectRatio: '5 / 4',
        background:
          'linear-gradient(135deg, #1c2a48 0%, #243558 55%, #1c2a48 100%)',
      }}
    >
      {/* золотые уголки в стиле приложения */}
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

      {/* субтильная декорация на фоне — большая ¬-скобка как у логотипа */}
      <span
        aria-hidden
        className="absolute -bottom-12 -right-10 font-serif text-gold/10 select-none pointer-events-none"
        style={{ fontSize: '180px', lineHeight: 1 }}
      >
        ¬
      </span>

      <div className="relative h-full flex flex-col justify-between p-6">
        <div>
          <p className="font-serif text-gold text-[10px] uppercase tracking-[0.25em] mb-2">
            {CATEGORY_LABELS[item.category] || item.category}
          </p>
        </div>

        <div>
          <h3 className="font-serif text-cream text-2xl font-bold leading-tight mb-2">
            {item.title_ru}
          </h3>
          <p className="font-serif text-cream/65 text-sm leading-snug line-clamp-3">
            {item.summary_ru}
          </p>
          <p className="font-serif text-gold text-xs mt-3 opacity-80">читать →</p>
        </div>
      </div>
    </button>
  );
}

// ── Bottom-sheet модалка с полным текстом ───────────────────────────────────
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
          <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-2">
            {CATEGORY_LABELS[item.category] || item.category}
          </p>
          <h2 className="font-serif text-navy text-2xl font-bold leading-tight mb-3">
            {item.title_ru}
          </h2>
          <p className="font-serif text-navy/70 text-sm italic leading-relaxed mb-4">
            {item.summary_ru}
          </p>
          <div className="font-serif text-navy/85 text-[15px] leading-relaxed">
            {item.full_text_ru.split('\n\n').map((para, i) => (
              <p key={i} className="mb-3">
                {para}
              </p>
            ))}
          </div>
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noreferrer"
              className="font-serif text-gold text-xs underline mt-4 inline-block"
            >
              {item.source_url.replace(/^https?:\/\//, '')} ↗
            </a>
          )}
        </div>

        <div className="px-6 pb-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full font-serif text-cream bg-navy rounded-full py-3 text-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
