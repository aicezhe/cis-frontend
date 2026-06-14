export type LociCategoryId = 'all' | 'study' | 'housing' | 'docs' | 'shop' | 'life' | 'transport';

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

export interface LociPlacesSeed {
  meta: {
    city: string;
    center_lat: number;
    center_lng: number;
    default_zoom: number;
    note: string;
  };
  categories: LociCategory[];
  places: LociPlace[];
}
