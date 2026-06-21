export type NewsCategory = 'uni' | 'visa' | 'finance' | 'life' | 'tip';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  title_ru: string;
  summary_ru: string;
  full_text_ru: string;
  source_url?: string;
}

export interface NewsSeed {
  meta: { description: string; last_updated: string };
  items: NewsItem[];
}
