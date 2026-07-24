import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { RelocationSeed, LociRoute } from '../types/relocation';

const _cache: Record<string, RelocationSeed | null> = {};

export function useRelocation() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  const [data, setData] = useState<RelocationSeed | null>(_cache[country] ?? null);
  const [loading, setLoading] = useState(!(country in _cache));

  useEffect(() => {
    if (country in _cache) return;
    fetch(seedUrl(`/data/relocation_${country}_seed.json`))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        _cache[country] = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        _cache[country] = null;
        setLoading(false);
      });
  }, [country]);

  return { relocation: data, loading, country };
}

let _lociCache: Record<string, LociRoute[]> | null = null;

export function useLociRoutes() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  const [routes, setRoutes] = useState<LociRoute[]>(_lociCache?.[country] ?? []);
  const [loading, setLoading] = useState(!_lociCache);

  useEffect(() => {
    if (_lociCache) return;
    fetch(seedUrl('/data/loci_routes_seed.json'))
      .then((r) => r.json())
      .then((d) => {
        _lociCache = d.routes_by_country;
        setRoutes(d.routes_by_country[country] || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [country]);

  return { routes, loading };
}

// Deep links на Google Maps (своей карты с роутингом пока нет)
export function openRouteToHome(address: string) {
  const origin = encodeURIComponent('Parma Centrale, Parma, Italy');
  const dest = encodeURIComponent(address + ', Parma, Italy');
  window.open(`https://www.google.com/maps/dir/${origin}/${dest}`, '_blank');
}

export function openNearbyShops() {
  // TODO: интегрировать реальные POI с ценовыми категориями (Lidl/Eurospin = эконом, Conad/Coop = средний, Esselunga = выше)
  window.open('https://www.google.com/maps/search/supermercato+Parma+Italy', '_blank');
}
