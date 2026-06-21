import { useEffect, useState } from 'react';
import type { NewsItem, NewsSeed } from '../types/news';

let _cache: NewsSeed | null = null;

export function useNews(count = 3) {
  const [today, setToday] = useState<NewsItem[]>([]);
  const [all, setAll] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    const apply = (seed: NewsSeed) => {
      setAll(seed.items);
      setToday(pickTodaysItems(seed.items, count));
      setLoading(false);
    };
    if (_cache) {
      apply(_cache);
      return;
    }
    fetch('/data/news_seed.json')
      .then((r) => r.json())
      .then((d: NewsSeed) => {
        _cache = d;
        apply(d);
      })
      .catch(() => setLoading(false));
  }, [count]);

  return { today, all, loading };
}

// Детерминированный выбор N материалов на сегодня — одинаков для всех юзеров
// в один день, но меняется каждый календарный день.
export function pickTodaysItems(items: NewsItem[], n: number): NewsItem[] {
  if (items.length === 0) return [];
  const dayNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const step = Math.max(1, Math.floor(items.length / n));
  const result: NewsItem[] = [];
  for (let i = 0; i < n; i++) {
    const idx = (dayNum + i * step) % items.length;
    result.push(items[idx]);
  }
  return result;
}
