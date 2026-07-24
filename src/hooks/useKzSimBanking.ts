import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';

// KZ-блоки «Связь/SIM» и «Карты и оплата». Лежат отдельным файлом, а не в
// relocation_kz_seed — полного гайда переезда для KZ пока нет, а эти два блока
// самодостаточны и показываются из заглушки раздела «Переезд».
export interface KzSimBanking {
  meta: { country_code: string; data_policy: string };
  sim: {
    title_ru: string;
    subtitle_ru: string;
    intro_ru: string;
    steps_ru: Array<{ title_ru: string; detail_ru: string }>;
  };
  cards: {
    title_ru: string;
    subtitle_ru: string;
    intro_ru: string;
    works_intro_ru: string;
    options_ru: Array<{ name: string; note_ru: string }>;
    nuances_intro_ru: string;
    nuances_ru: string[];
    bottom_line_ru: string;
  };
}

let _cache: KzSimBanking | null = null;

export function useKzSimBanking() {
  const [data, setData] = useState<KzSimBanking | null>(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) return;
    let cancelled = false;
    fetch(seedUrl('/data/kz_sim_banking.json'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) { _cache = d; setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}
