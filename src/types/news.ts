export type NewsCategory = 'study' | 'italy';

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  category: NewsCategory;
  summary: string | null;
  published_at: string | null; // ISO-строка из бэка
  fetched_at: string;
}
