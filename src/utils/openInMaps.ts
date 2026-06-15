// Утилита для глубоких ссылок в Google Maps.
// `?api=1` без `origin` = Google Maps возьмёт текущую локацию устройства.
// Это документированное поведение Maps URLs API.

export function openRouteFromCurrentLocation(
  destLat: number,
  destLng: number,
  destName?: string,
  travelMode: 'walking' | 'transit' | 'driving' | 'bicycling' = 'walking'
) {
  const dest = destName
    ? encodeURIComponent(destName)
    : `${destLat},${destLng}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${travelMode}`;
  window.open(url, '_blank');
}

export function openRouteToCoords(
  destLat: number,
  destLng: number,
  travelMode: 'walking' | 'transit' | 'driving' | 'bicycling' = 'walking'
) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=${travelMode}`;
  window.open(url, '_blank');
}
