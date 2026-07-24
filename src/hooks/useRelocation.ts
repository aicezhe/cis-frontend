import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { RelocationSeed, LociRoute } from '../types/relocation';

// Шаги переезда (виза уже на руках → штамп на границе → codice fiscale →
// permesso → SSN) — это итальянская бюрократия, одинаковая для любой визы D,
// поэтому ru/by/kz читают один и тот же сид (без дублирования контента).
// У Украины принципиально другой трек (безвиз + permesso/временная защита без
// визы D) — для нeё отдельного relocation-гайда пока нет, вернётся null.
// RU-специфичные куски внутри общего сида (третьи страны в intro.key_ru,
// карты в after_arrival.cash_card) страницы сами фильтруют по country==='ru'.
const SHARED_RELOCATION_SEED: Record<string, string> = { ru: 'ru', by: 'ru', kz: 'ru' };

const _cache: Record<string, RelocationSeed | null> = {};

export function useRelocation() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  const seedCountry = SHARED_RELOCATION_SEED[country];
  const supported = Boolean(seedCountry);
  const [data, setData] = useState<RelocationSeed | null>(supported ? _cache[seedCountry] ?? null : null);
  const [loading, setLoading] = useState(supported && !(seedCountry in _cache));

  useEffect(() => {
    if (!supported || seedCountry in _cache) return;
    fetch(seedUrl(`/data/relocation_${seedCountry}_seed.json`))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        _cache[seedCountry] = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        _cache[seedCountry] = null;
        setLoading(false);
      });
  }, [seedCountry, supported]);

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
