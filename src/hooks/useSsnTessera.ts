import { useEffect, useState } from 'react';

// Блок «SSN и tessera sanitaria» общий для всех стран — процесс зависит от
// типа статуса, а не от гражданства. Один статический сид, без страновых
// вариаций (не дублируем по трекам ru/ua/by/kz).

export interface SsnVariant {
  label_ru: string;
  points_ru: string[];
  warning_ru?: string;
}

export interface SsnCase {
  id: string;
  title_ru: string;
  lead_ru?: string;
  variants?: SsnVariant[];
  body_ru?: string;
  todo_ru?: string;
  link_ru?: { label_ru: string; to: string; focus?: string };
}

export interface SsnTessera {
  meta: { title_ru: string; subtitle_ru: string; source: string; last_updated: string; data_policy: string };
  intro_ru: string;
  cases: SsnCase[];
}

let _cache: SsnTessera | null = null;

export function useSsnTessera() {
  const [data, setData] = useState<SsnTessera | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    fetch('/data/ssn_tessera.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        _cache = d;
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

  return { ssn: data, loading };
}
