// Адрес дома юзера: геокодим в координаты через Nominatim и сохраняем в localStorage.
// На LOCI-карте появится отдельная метка «мой дом».

const ADDR_KEY = 'cispr_home_address';
const LAT_KEY = 'cispr_home_lat';
const LNG_KEY = 'cispr_home_lng';

export type HomeAddress = {
  address: string;
  lat: number;
  lng: number;
};

export function loadHomeAddress(): HomeAddress | null {
  const address = localStorage.getItem(ADDR_KEY) || '';
  const lat = parseFloat(localStorage.getItem(LAT_KEY) || '');
  const lng = parseFloat(localStorage.getItem(LNG_KEY) || '');
  if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { address, lat, lng };
}

export function clearHomeAddress(): void {
  localStorage.removeItem(ADDR_KEY);
  localStorage.removeItem(LAT_KEY);
  localStorage.removeItem(LNG_KEY);
}

/**
 * Геокодит адрес через Nominatim (бесплатный OSM-сервис, лимит 1 запрос/сек).
 * Сохраняет результат в localStorage и возвращает HomeAddress.
 * Бросает Error если адрес не найден.
 */
export async function saveHomeAddress(rawAddress: string): Promise<HomeAddress> {
  const trimmed = rawAddress.trim();
  if (!trimmed) throw new Error('Адрес пустой');

  // Если только улица без города — дополним Парма
  const queryText = /пар(м|m)/i.test(trimmed) ? trimmed : `${trimmed}, Parma, Italy`;
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=it&q=' +
    encodeURIComponent(queryText);

  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru,it;q=0.8,en;q=0.5' },
  });
  if (!res.ok) throw new Error('Сервер карт недоступен. Попробуй позже.');

  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Адрес не найден. Уточни улицу и номер дома.');
  }
  const lat = parseFloat(data[0].lat);
  const lng = parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error('Координаты невалидны. Попробуй другой адрес.');
  }

  localStorage.setItem(ADDR_KEY, trimmed);
  localStorage.setItem(LAT_KEY, String(lat));
  localStorage.setItem(LNG_KEY, String(lng));
  return { address: trimmed, lat, lng };
}
