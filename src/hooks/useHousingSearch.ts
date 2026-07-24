import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { RelocationHousingOption } from '../types/relocation';

export interface HousingSearch {
  title_ru: string;
  options: RelocationHousingOption[];
}

// Поиск жилья в Парме одинаков для всех стран (RU/UA/KZ): это про сам город,
// а не про гражданство. Поэтому берём единый источник — блок housing_search из
// relocation_ru_seed.json — и не дублируем данные по странам.
let _cache: HousingSearch | null = null;

export function useHousingSearch() {
  const [data, setData] = useState<HousingSearch | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    fetch(seedUrl('/data/relocation_ru_seed.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        _cache = d?.housing_search ?? null;
        setData(_cache);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { housing: data, loading };
}
