import { useEffect, useState } from 'react';
import type { ParmaLifeSeed } from '../types/parmaLife';

let _cache: ParmaLifeSeed | null = null;

export function useParmaLife() {
  const [data, setData] = useState<ParmaLifeSeed | null>(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch('/data/parma_life_seed.json')
      .then((r) => r.json())
      .then((d: ParmaLifeSeed) => {
        _cache = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { parmaLife: data, loading };
}
