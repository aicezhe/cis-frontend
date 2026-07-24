import { useEffect, useState } from 'react';
import { seedUrl } from '../lib/seed';
import type { LaureaSeed, NumeroChiusoSeed, ProgramType } from '../types/laurea';

const _cache: Partial<Record<ProgramType, LaureaSeed>> = {};

export async function loadProgramSeed(type: ProgramType): Promise<LaureaSeed | null> {
  if (_cache[type]) return _cache[type]!;
  try {
    const file = type === 'bachelor' ? 'laurea_seed.json' : 'magistrale_seed.json';
    const r = await fetch(seedUrl(`/data/${file}`));
    if (!r.ok) return null;
    const data = (await r.json()) as LaureaSeed;
    _cache[type] = data;
    return data;
  } catch {
    return null;
  }
}

export function useMyProgram(): { program: LaureaSeed | null; programType: ProgramType | null; loading: boolean } {
  const [data, setData] = useState<LaureaSeed | null>(null);
  const [programType, setProgramType] = useState<ProgramType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cispr_program');
    if (stored === 'bachelor' || stored === 'master') {
      setProgramType(stored);
      loadProgramSeed(stored).then((d) => {
        setData(d);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return { program: data, programType, loading };
}

let _ncCache: NumeroChiusoSeed | null = null;

export function useNumeroChiuso(): NumeroChiusoSeed | null {
  const [data, setData] = useState<NumeroChiusoSeed | null>(_ncCache);

  useEffect(() => {
    if (_ncCache) return;
    fetch(seedUrl('/data/numero_chiuso_seed.json'))
      .then((r) => r.json())
      .then((d: NumeroChiusoSeed) => {
        _ncCache = d;
        setData(d);
      })
      .catch(() => {});
  }, []);

  return data;
}
