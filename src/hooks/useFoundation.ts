// Загрузка данных Foundation Year из public/data/foundation_seed.json.
import { useEffect, useState } from 'react';
import type {
  FoundationSeed,
  FoundationTrackId,
  FoundationLegalizationSeed,
} from '../types/foundation';

type CountryCode = 'ru' | 'ua' | 'by' | 'kz';

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

// Страновые данные по легализации документов (апостиль/перевод/CIMEA/виза).
// Файлы: public/data/foundation_legalization_<country>.json.
const _legalCache: Record<string, FoundationLegalizationSeed> = {};

export async function loadLegalizationFor(
  countryCode: CountryCode,
): Promise<FoundationLegalizationSeed | null> {
  if (_legalCache[countryCode]) return _legalCache[countryCode];
  try {
    const r = await fetch(`/data/foundation_legalization_${countryCode}.json`);
    if (!r.ok) return null;
    const data = (await r.json()) as FoundationLegalizationSeed;
    _legalCache[countryCode] = data;
    return data;
  } catch {
    return null;
  }
}

export function useMyLegalization() {
  const [data, setData] = useState<FoundationLegalizationSeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cispr_country');
    // Поддерживаем 4 страны с готовым датасетом. Ключа нет (старые юзеры) → ru.
    // Явно выбранная «Другая страна» (other) → датасета нет, блок не показываем.
    if (stored !== null && stored !== 'ru' && stored !== 'ua' && stored !== 'by' && stored !== 'kz') {
      setData(null);
      setLoading(false);
      return;
    }
    const country: CountryCode =
      stored === 'ua' || stored === 'by' || stored === 'kz' ? stored : 'ru';
    let cancelled = false;
    loadLegalizationFor(country).then((d) => {
      if (cancelled) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { legalization: data, loading };
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
