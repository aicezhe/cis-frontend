import { useEffect, useState } from 'react';
import type { VisaSeed } from '../types/visa';

const _cache: Record<string, VisaSeed | null> = {};

export function useVisa() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  const [data, setData] = useState<VisaSeed | null>(_cache[country] ?? null);
  const [loading, setLoading] = useState(!(country in _cache));

  useEffect(() => {
    if (country in _cache) return;
    fetch(`/data/visa_${country}_seed.json`)
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

  return { visa: data, loading, country };
}

// Определение консульского округа по городу/региону из cispr_city
export function getConsularDistrict(city: string, seed: VisaSeed | null): 'spb' | 'moscow' {
  if (!seed || !city) return 'moscow';
  const regions = seed.consular_districts.spb_district.regions_ru;
  if (!Array.isArray(regions)) return 'moscow';
  const c = city.toLowerCase();
  // частые написания Петербурга
  if (c.includes('спб') || c.includes('питер') || c.includes('петербург')) return 'spb';
  const match = regions.some((r) => {
    const head = r.toLowerCase().split(' ')[0]; // «санкт-петербург», «ленинградская», «республика»…
    if (head === 'республика') {
      const second = r.toLowerCase().split(' ')[1] || '';
      return second !== '' && c.includes(second);
    }
    // сверяем по корню («ленинград», «архангельск»…), чтобы ловить и город, и область
    const root = head.replace(/(ская|ской)$/u, '');
    return root.length >= 4 && c.includes(root);
  });
  return match ? 'spb' : 'moscow';
}
