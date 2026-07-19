import { useEffect, useState } from 'react';
import type { VisaSeed, VisaUaSeed, VisaBySeed } from '../types/visa';

// Какой сид формата VisaSeed отдаёт общие данные визы D по стране.
// Беларусь переиспользует общий сид России (чек-лист документов, причины
// отказа, шаблоны — они одинаковы), а страновая специфика Беларуси лежит
// отдельно в visa_by_seed.json (см. useVisaBy). Так не дублируем текст.
const SHARED_VISA_SEED: Record<string, string> = { ru: 'ru', by: 'ru' };

const _cache: Record<string, VisaSeed | null> = {};

export function useVisa() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  const seedCountry = SHARED_VISA_SEED[country];
  const supported = Boolean(seedCountry);
  const [data, setData] = useState<VisaSeed | null>(supported ? _cache[seedCountry] ?? null : null);
  const [loading, setLoading] = useState(supported && !(seedCountry in _cache));

  useEffect(() => {
    if (!supported || seedCountry in _cache) return;
    fetch(`/data/visa_${seedCountry}_seed.json`)
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

  return { visa: data, loading, country };
}

// Беларусь: страновая специфика поверх общего сида (посольство в Минске,
// шаги подачи 3–5, специфика документов, дорога в Италию).
let _byCache: VisaBySeed | null = null;

export function useVisaBy() {
  const [data, setData] = useState<VisaBySeed | null>(_byCache);
  const [loading, setLoading] = useState(!_byCache);

  useEffect(() => {
    if (_byCache) return;
    let cancelled = false;
    fetch('/data/visa_by_seed.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        _byCache = d;
        setData(d);
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

  return { by: data, loading };
}

// Украина: свой формат seed (безвиз + permesso / временная защита)
let _uaCache: VisaUaSeed | null = null;

export function useVisaUa() {
  const [data, setData] = useState<VisaUaSeed | null>(_uaCache);
  const [loading, setLoading] = useState(!_uaCache);

  useEffect(() => {
    if (_uaCache) return;
    fetch('/data/visa_ua_seed.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        _uaCache = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { visa: data, loading };
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
