import { useEffect, useMemo, useRef, useState } from 'react';
import { useTrackSection } from '../hooks/useTrackSection';
import { useLocation } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-leaflet';

import TabBar from '../components/TabBar';
import { useLociPlaces } from '../hooks/useLociPlaces';
import { openRouteFromCurrentLocation } from '../utils/openInMaps';
import { loadHomeAddress } from '../lib/homeAddress';
import { lociMapStyle } from '../lib/lociMapStyle';
import type { LociCategoryId, LociPlace } from '../types/loci';

// Векторная подложка в фирменных цветах (см. lib/lociMapStyle) вместо растровых
// тайлов OSM — та же роль, что раньше играл <TileLayer>, но без чужой палитры
// и подписей. Рисуется через плагин maplibre-gl-leaflet поверх react-leaflet,
// маркеры/попапы остаются как были.
function VectorBasemap() {
  const map = useMap();
  useEffect(() => {
    const gl = L.maplibreGL({ style: lociMapStyle }).addTo(map);
    return () => {
      map.removeLayer(gl);
    };
  }, [map]);
  return null;
}

// Долетает до конкретной точки, если пришли с deep-link (напр. из шага
// «Codice Fiscale» → Agenzia delle Entrate). Один раз на маунте.
function FlyToPlace({ place }: { place: LociPlace | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.setView([place.lat, place.lng], 16);
  }, [map, place]);
  return null;
}

// Цвет канта маркера: магазины — по ценовой категории, остальное — золото.
function borderColorFor(place: LociPlace): string {
  if (place.category === 'shop' && place.tier) {
    if (place.tier === 'cheap') return '#3a6d40';
    if (place.tier === 'premium') return '#a8332a';
  }
  if (place.category === 'health') return '#a8332a';
  return '#c1a050';
}

// ── эмодзи-маркер, обёрнутый в каплю с цветной обводкой ──────────────────────
// Стандартные пины leaflet ломаются с бандлером (битые относительные урлы
// картинок), поэтому используем divIcon с инлайн-HTML.
function makeIcon(emoji: string, place: LociPlace) {
  return L.divIcon({
    html: `
      <div style="
        width: 34px; height: 34px;
        background: #1c2a48;
        border: 2px solid ${borderColorFor(place)};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px; line-height: 1;">
          ${emoji}
        </span>
      </div>
    `,
    className: 'loci-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

function googleMapsRoute(to: LociPlace) {
  const origin = encodeURIComponent('Parma Centrale, Parma, Italy');
  const dest = encodeURIComponent(`${to.address}, Parma, Italy`);
  return `https://www.google.com/maps/dir/${origin}/${dest}`;
}

export default function MapPage() {
  useTrackSection('map');
  const { data, loading } = useLociPlaces();
  const location = useLocation();
  const focusId = (location.state as { focus?: string } | null)?.focus;
  const [activeCat, setActiveCat] = useState<LociCategoryId>('all');
  const focusMarkerRef = useRef<L.Marker | null>(null);

  const categories = data?.categories ?? [];
  const focusPlace = data?.places.find((p) => p.id === focusId);
  const filtered = useMemo<LociPlace[]>(() => {
    if (!data) return [];
    return activeCat === 'all' ? data.places : data.places.filter((p) => p.category === activeCat);
  }, [data, activeCat]);

  // Открываем попап целевой точки после её появления на карте.
  useEffect(() => {
    if (focusId) focusMarkerRef.current?.openPopup();
  }, [focusId, filtered]);

  // эмодзи категории по id — для маркеров
  const emojiFor = useMemo(() => {
    const m: Record<string, string> = {};
    categories.forEach((c) => { m[c.id] = c.emoji; });
    return m;
  }, [categories]);

  return (
    // Вся страница ровно во весь экран, без скролла: иначе на iOS Safari во
    // время «свайпа вверх» WebGL-канва MapLibre всплывает поверх fixed-меню
    // (известный баг рендеринга) — убираем сам скролл, а не боремся с ним.
    <div className="relative h-[100dvh] max-w-md mx-auto bg-cream flex flex-col overflow-hidden">

      {/* Шапка */}
      <div className="px-6 pt-12 pb-3 flex-shrink-0">
        <h1 className="font-serif text-navy text-4xl font-bold">Loci</h1>
        <p className="font-serif text-gold text-sm mt-1 font-bold">
          места Пармы, которые тебе пригодятся
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar flex-shrink-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={
              'font-serif text-sm px-4 py-2 rounded-full border whitespace-nowrap flex-shrink-0 ' +
              (activeCat === cat.id
                ? 'bg-navy text-gold border-navy'
                : 'bg-soft-cream text-navy border-navy/20')
            }
          >
            {cat.emoji} {cat.label_ru}
          </button>
        ))}
      </div>

      {/* Карта — занимает всё оставшееся место (flex-1), а не фиксированную
          calc()-высоту — так суммарная высота страницы никогда не превышает
          экран и скроллить нечего */}
      <div
        className="mx-4 mt-2 relative rounded-3xl border border-navy/20 overflow-hidden bg-soft-cream flex-1 min-h-0"
      >
        {loading || !data ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-serif text-navy/60 italic">Загрузка карты…</p>
          </div>
        ) : (
          <MapContainer
            center={[data.meta.center_lat, data.meta.center_lng]}
            zoom={data.meta.default_zoom}
            scrollWheelZoom={true}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <VectorBasemap />
            <FlyToPlace place={focusPlace} />
            {filtered.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={makeIcon(emojiFor[place.category] || '•', place)}
                ref={place.id === focusId ? focusMarkerRef : undefined}
              >
                <Popup>
                  <div className="font-serif" style={{ minWidth: 200 }}>
                    <p className="text-navy text-base font-bold leading-snug">{place.name}</p>
                    <p className="text-navy/60 text-xs mt-1">{place.address}</p>
                    {place.note_ru && (
                      <p className="text-navy/75 text-xs italic mt-2 leading-relaxed">{place.note_ru}</p>
                    )}
                    <div className="flex flex-col gap-1.5 mt-3">
                      <button
                        onClick={() => openRouteFromCurrentLocation(place.lat, place.lng, place.name, 'walking')}
                        className="bg-navy text-cream text-xs rounded-full px-3 py-2 cursor-pointer"
                        style={{ border: 'none' }}
                      >
                        Маршрут от моей локации →
                      </button>
                      <a
                        href={googleMapsRoute(place)}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-center border text-xs rounded-full px-3 py-2 no-underline"
                        style={{ textDecoration: 'none', borderColor: '#1c2a48', color: '#1c2a48' }}
                      >
                        От Parma Centrale
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Метка «мой дом» — отдельная, всегда поверх остальных */}
            {(() => {
              const home = loadHomeAddress();
              if (!home) return null;
              return (
                <Marker
                  position={[home.lat, home.lng]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        width: 38px; height: 38px;
                        background: #c1a050;
                        border: 2px solid #1c2a48;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex; align-items: center; justify-content: center;
                      ">
                        <span style="transform: rotate(45deg); font-size: 16px; color: #1c2a48;">★</span>
                      </div>`,
                    className: 'loci-marker',
                    iconSize: [38, 38],
                    iconAnchor: [19, 38],
                    popupAnchor: [0, -34],
                  })}
                >
                  <Popup>
                    <div className="font-serif" style={{ minWidth: 200 }}>
                      <p className="text-gold text-[10px] uppercase tracking-widest">⌐ мой дом ¬</p>
                      <p className="text-navy text-sm mt-1 leading-snug">{home.address}</p>
                      <button
                        onClick={() => openRouteFromCurrentLocation(home.lat, home.lng, home.address, 'walking')}
                        className="bg-navy text-cream text-xs rounded-full px-3 py-2 cursor-pointer mt-3 w-full"
                        style={{ border: 'none' }}
                      >
                        Маршрут от моей локации →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })()}
          </MapContainer>
        )}
      </div>

      {/* Подсказка */}
      <p className="font-serif text-navy/40 text-[11px] italic text-center px-6 mt-2 mb-1 flex-shrink-0">
        Карта © OpenStreetMap. Маршруты открываются в Google Maps.
      </p>

      {/* Резерв под fixed-меню внизу — часть flex-потока, не padding */}
      <div className="flex-shrink-0" style={{ height: 88 }} />

      <TabBar active="loci" />

    </div>
  );
}
