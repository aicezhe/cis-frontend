export type LociCategoryId =
  | 'all' | 'study' | 'housing' | 'docs' | 'health'
  | 'shop' | 'chemist' | 'mall' | 'life' | 'transport';

export interface LociCategory {
  id: LociCategoryId;
  label_ru: string;
  emoji: string;
}

export interface LociPlace {
  id: string;
  name: string;
  category: Exclude<LociCategoryId, 'all'>;
  address: string;
  lat: number;
  lng: number;
  note_ru?: string;
  tier?: 'cheap' | 'mid' | 'premium';
}

export interface LociTierInfo {
  label_ru: string;
  color: string;
}

export interface LociPlacesSeed {
  meta: {
    city: string;
    center_lat: number;
    center_lng: number;
    default_zoom: number;
    note: string;
  };
  categories: LociCategory[];
  tier_legend?: Record<'cheap' | 'mid' | 'premium', LociTierInfo>;
  places: LociPlace[];
}
