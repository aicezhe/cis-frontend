import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api';
import type { NewsCategory, NewsItem } from '../types/news';

// Кэш на время сессии (по категории) — чтоб не дёргать бэк при переключении таба.
const _cache: Partial<Record<NewsCategory, NewsItem[]>> = {};

export type NewsState = {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
};

export function useNews(category: NewsCategory, limit = 10): NewsState {
  const [items, setItems] = useState<NewsItem[]>(_cache[category] || []);
  const [loading, setLoading] = useState(!_cache[category]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_cache[category]) {
      setItems(_cache[category]!);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/news?category=${category}&limit=${limit}`)
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить');
        return r.json() as Promise<NewsItem[]>;
      })
      .then((data) => {
        if (cancelled) return;
        _cache[category] = data;
        setItems(data);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Ошибка сети');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, limit]);

  return { items, loading, error };
}
