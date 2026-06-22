import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadHomeAddress, saveHomeAddress, clearHomeAddress } from '../lib/homeAddress';
import { openRouteFromCurrentLocation } from '../utils/openInMaps';

// Универсальный блок «мой адрес в Парме» — используется и в Переезде, и в Жизни в Парме.
// При сохранении геокодит через Nominatim и сразу появляется на LOCI-карте.

export function HomeAddressInput() {
  const navigate = useNavigate();
  const initial = loadHomeAddress();
  const [address, setAddress] = useState(initial?.address || '');
  const [saved, setSaved] = useState(!!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!address.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveHomeAddress(address);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить адрес');
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    clearHomeAddress();
    setAddress('');
    setSaved(false);
    setError(null);
  }

  return (
    <div className="bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
      <p className="font-serif text-navy text-sm font-bold mb-1">Мой адрес в Парме</p>
      <p className="font-serif text-navy/60 text-xs leading-relaxed mb-3">
        Сохраним адрес и поставим метку на карте Loci, чтобы быстро строить маршрут.
      </p>

      <input
        type="text"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          setSaved(false);
          setError(null);
        }}
        placeholder="Strada Farini 12"
        autoComplete="off"
        className="w-full font-sans text-navy text-base bg-cream border border-navy/30 rounded-xl px-4 py-3 outline-none"
      />

      {error && (
        <p className="font-serif text-xs italic mt-2" style={{ color: '#a8332a' }}>
          {error}
        </p>
      )}

      {saved && !error && (
        <p className="font-serif text-gold text-xs italic mt-2">
          ✓ адрес сохранён и виден на карте
        </p>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={!address.trim() || saving}
          className={
            'flex-1 font-serif text-cream rounded-full py-2.5 text-sm ' +
            (address.trim() && !saving ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          {saving ? 'Ищу адрес…' : 'Сохранить'}
        </button>
        {saved && (
          <>
            <button
              onClick={() => {
                const h = loadHomeAddress();
                if (h) openRouteFromCurrentLocation(h.lat, h.lng, h.address, 'walking');
              }}
              className="font-serif text-navy border border-navy/30 rounded-full px-4 py-2.5 text-sm"
            >
              Маршрут
            </button>
            <button
              onClick={() => navigate('/map')}
              className="font-serif text-navy border border-navy/30 rounded-full px-4 py-2.5 text-sm"
            >
              На карте
            </button>
          </>
        )}
      </div>

      {saved && (
        <button
          onClick={handleClear}
          className="font-serif text-navy/40 text-[11px] underline mt-3"
        >
          убрать адрес
        </button>
      )}
    </div>
  );
}
