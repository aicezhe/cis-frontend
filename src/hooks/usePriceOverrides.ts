// Персональные правки цен разбивки «Стоимость». Юзер может подставить свою
// цифру («мне апостиль обошёлся в 200») — она хранится ЛОКАЛЬНО и НЕ трогает
// эталон из сида: сброс возвращает исходное значение. Ключ — стабильный id
// строки (uni:apostille, travel-permesso, parma-rent …).
import { useEffect, useState } from 'react';

const KEY = 'cispr_price_overrides';
type Overrides = Record<string, number>; // id строки → цена в EUR

function load(): Overrides {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

// Модульный кэш + подписчики — как в useExpenses/useCurrency: чтобы открытый
// поверх страницы лист EditPriceSheet и сама страница не разъезжались.
let _cache: Overrides = load();
const listeners = new Set<(o: Overrides) => void>();

function broadcast(next: Overrides) {
  _cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l(next));
}

export function usePriceOverrides() {
  const [overrides, setOverrides] = useState<Overrides>(_cache);

  useEffect(() => {
    listeners.add(setOverrides);
    return () => { listeners.delete(setOverrides); };
  }, []);

  const setOverride = (id: string, eur: number) => broadcast({ ..._cache, [id]: eur });
  const clearOverride = (id: string) => {
    const next = { ..._cache };
    delete next[id];
    broadcast(next);
  };

  return { overrides, setOverride, clearOverride };
}
