import { useState } from 'react';
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

  if (loading) {
    return (
      <div className="mx-6 mt-6 h-32 rounded-2xl bg-soft-cream animate-pulse" />
    );
  }
  if (today.length === 0) return null;

  const openItem = today.find((n) => n.id === openId) || null;

  return (
    <>
      {/* Заголовок секции */}
      <p className="font-serif text-gold text-xs italic uppercase tracking-[0.2em] px-6 mt-6 mb-3">
        Сегодня почитать
      </p>

      {/* 3 карточки одна под другой */}
      <div className="px-6 flex flex-col gap-2.5">
        {today.map((item) => (
          <button
            key={item.id}
            onClick={() => setOpenId(item.id)}
            className="w-full text-left bg-soft-cream border border-navy/15 rounded-2xl px-4 py-3 active:bg-cream transition-colors"
          >
            <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">
              {CATEGORY_LABELS[item.category] || item.category}
            </p>
            <p className="font-serif text-navy text-sm font-bold leading-snug">{item.title_ru}</p>
            <p className="font-serif text-navy/60 text-xs leading-relaxed mt-1.5">{item.summary_ru}</p>
          </button>
        ))}
      </div>

      {/* Модалка с полным текстом */}
      {openItem && <NewsModal item={openItem} onClose={() => setOpenId(null)} />}
    </>
  );
}

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
        {/* Хэндл-полоска для свайпа */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        {/* Содержимое */}
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
          <div className="font-serif text-navy/85 text-[15px] leading-relaxed whitespace-pre-line">
            {item.full_text_ru.split('\n\n').map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
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

        {/* Низ — кнопка закрыть */}
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
