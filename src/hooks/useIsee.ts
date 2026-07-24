import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { IseeSeed } from '../types/isee';

let _cache: IseeSeed | null = null;

export function useIsee() {
  const [data, setData] = useState<IseeSeed | null>(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    fetch(seedUrl('/data/isee_documents_seed.json'))
      .then((r) => r.json())
      .then((d) => {
        _cache = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { isee: data, loading };
}
