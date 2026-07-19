import { useEffect, useState } from 'react';

// Разбор Mod. 209 (KIT permesso) — общий для всех стран (процесс одинаков для
// не-ЕС), поэтому отдельный статический сид, не зависящий от relocation.

export interface Mod209Field {
  n: number;
  label_ru: string;
  note_ru: string;
}

export interface Mod209 {
  meta: { title_ru: string; subtitle_ru: string; source: string; last_updated: string; disclaimer_ru: string };
  what_ru: string;
  submit_ru: { title_ru: string; points_ru: string[] };
  fields_ru: Mod209Field[];
  documents_ru: string[];
  payments_note_ru: string;
  bottom_note_ru: string;
}

let _cache: Mod209 | null = null;

export function useMod209() {
  const [data, setData] = useState<Mod209 | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    fetch('/data/mod209.json')
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

  return { mod209: data, loading };
}
