import { useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import TabBar from '../components/TabBar';
import { useLociPlaces } from '../hooks/useLociPlaces';
import type { LociCategoryId, LociPlace } from '../types/loci';

// ── эмодзи-маркер, обёрнутый в каплю с золотой обводкой ──────────────────────
// Стандартные пины leaflet ломаются с бандлером (битые относительные урлы
// картинок), поэтому используем divIcon с инлайн-HTML.
function makeIcon(emoji: string, tier?: LociPlace['tier']) {
  const tierColor =
    tier === 'cheap' ? '#3a6d40' :
    tier === 'premium' ? '#a8332a' :
    null;

  // капля как в дизайне: navy фон, gold кант, эмодзи в центре
  return L.divIcon({
    html: `
      <div style="
        width: 34px; height: 34px;
        background: #1c2a48;
        border: 2px solid ${tierColor ?? '#c1a050'};
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
  const { data, loading } = useLociPlaces();
  const [activeCat, setActiveCat] = useState<LociCategoryId>('all');

  const categories = data?.categories ?? [];
  const filtered = useMemo<LociPlace[]>(() => {
    if (!data) return [];
    return activeCat === 'all' ? data.places : data.places.filter((p) => p.category === activeCat);
  }, [data, activeCat]);

  // эмодзи категории по id — для маркеров
  const emojiFor = useMemo(() => {
    const m: Record<string, string> = {};
    categories.forEach((c) => { m[c.id] = c.emoji; });
    return m;
  }, [categories]);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-24">

      {/* Шапка */}
      <div className="px-6 pt-12 pb-3">
        <h1 className="font-serif text-navy text-4xl font-bold">Loci</h1>
        <p className="font-serif text-gold text-sm italic mt-1">
          места Пармы, которые тебе пригодятся
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
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

      {/* Карта */}
      <div className="mx-4 mt-2 flex-1 relative rounded-3xl border border-navy/20 overflow-hidden min-h-[60vh]">
        {loading || !data ? (
          <div className="absolute inset-0 flex items-center justify-center bg-soft-cream">
            <p className="font-serif text-navy/60 italic">Загрузка карты…</p>
          </div>
        ) : (
          <MapContainer
            center={[data.meta.center_lat, data.meta.center_lng]}
            zoom={data.meta.default_zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            {filtered.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={makeIcon(emojiFor[place.category] || '•', place.tier)}
              >
                <Popup>
                  <div className="font-serif" style={{ minWidth: 200 }}>
                    <p className="text-navy text-base font-bold leading-snug">{place.name}</p>
                    <p className="text-navy/60 text-xs mt-1">{place.address}</p>
                    {place.note_ru && (
                      <p className="text-navy/75 text-xs italic mt-2 leading-relaxed">{place.note_ru}</p>
                    )}
                    {place.tier && (
                      <p className="text-[10px] uppercase tracking-widest mt-2"
                        style={{
                          color:
                            place.tier === 'cheap' ? '#3a6d40' :
                            place.tier === 'premium' ? '#a8332a' :
                            '#7a6a3a',
                        }}
                      >
                        {place.tier === 'cheap' ? 'эконом' : place.tier === 'premium' ? 'выше среднего' : 'средний'}
                      </p>
                    )}
                    <a
                      href={googleMapsRoute(place)}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-3 text-center bg-navy text-cream text-xs rounded-full px-3 py-2 no-underline"
                      style={{ textDecoration: 'none' }}
                    >
                      Маршрут от Parma Centrale →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Подсказка */}
      <p className="font-serif text-navy/40 text-[11px] italic text-center px-6 mt-3">
        Карта © OpenStreetMap. Маршруты открываются в Google Maps.
      </p>

      <TabBar active="loci" />

    </div>
  );
}
