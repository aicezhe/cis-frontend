// Загрузка данных Foundation Year из public/data/foundation_seed.json.
import { useEffect, useState } from 'react';
import type { FoundationSeed, FoundationTrackId } from '../types/foundation';

interface FoundationState {
  data: FoundationSeed | null;
  loading: boolean;
  error: string | null;
}

let cache: FoundationSeed | null = null;

export function useFoundation(): FoundationState {
  const [state, setState] = useState<FoundationState>({
    data: cache,
    loading: !cache,
    error: null,
  });

  useEffect(() => {
    if (cache) {
      setState({ data: cache, loading: false, error: null });
      return;
    }
    let cancelled = false;
    fetch('/data/foundation_seed.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<FoundationSeed>;
      })
      .then((json) => {
        cache = json;
        if (!cancelled) setState({ data: json, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: e instanceof Error ? e.message : 'Не удалось загрузить данные',
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Возвращает id трека, выбранного пользователем (localStorage),
// либо дефолтный для русскоязычных (absolute_beginners).
export function useMyFoundationTrack(): FoundationTrackId {
  const stored = localStorage.getItem('cispr_foundation_track');
  if (
    stored === 'absolute_beginners' ||
    stored === 'elementary' ||
    stored === 'english_track'
  ) {
    return stored;
  }
  return 'absolute_beginners';
}
