import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { LociPlacesSeed } from '../types/loci';

let _cache: LociPlacesSeed | null = null;

export function useLociPlaces() {
  const [data, setData] = useState<LociPlacesSeed | null>(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch(seedUrl('/data/loci_places_seed.json'))
      .then((r) => r.json())
      .then((d: LociPlacesSeed) => {
        _cache = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}
