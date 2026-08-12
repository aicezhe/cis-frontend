import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { api } from '../lib/api';
import type { CountryChange } from '../types/api';

const COUNTRIES = [
  { id: 'ru', label: 'Россия' },
  { id: 'ua', label: 'Украина' },
  { id: 'by', label: 'Беларусь' },
  { id: 'kz', label: 'Казахстан' },
];

const LABELS: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c.label]),
);

/** У Украины есть свой раздел переезда, но визового трека нет: в
 *  SHARED_VISA_SEED её нет, потому что путь другой — безвиз, а не виза D.
 *  Материал по нему живёт в разделе «Виза» отдельным сидом visa_ua_seed. */
const NO_VISA_TRACK = new Set(['ua']);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ChangeCountryPage() {
  const navigate = useNavigate();
  const current = localStorage.getItem('cispr_country') || '';
  const [picked, setPicked] = useState(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CountryChange[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .countryHistory()
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      // История — справка, а не условие работы экрана. Не показываем ошибку:
      // человек пришёл сюда менять страну, а не читать журнал.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    if (picked === current || saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile({ country: picked });
      localStorage.setItem('cispr_country', picked);
      // Жёсткая перезагрузка, а не navigate. Все хуки сидов читают
      // cispr_country в теле рендера (см. CLAUDE.md), поэтому при обычном
      // переходе половина экранов осталась бы на данных прежней страны до
      // следующего перемонтирования — и разошлась бы с шапкой профиля.
      window.location.href = '/path';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
      setSaving(false);
    }
  }

  const changed = picked !== current;

  return (
    <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-10">
      <div className="px-5 pt-6 flex items-center gap-2">
        <button onClick={() => navigate(-1)} aria-label="Назад" className="text-navy/60">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-navy text-xl font-bold">Моя страна</h1>
      </div>

      <p className="font-serif text-navy/70 text-sm px-6 mt-3 leading-relaxed">
        От страны зависят визовый трек, маршруты переезда и цены. Прогресс и
        отметки останутся на месте — но часть из них будет относиться к прежней
        стране.
      </p>

      <div className="mx-6 mt-5 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
        {COUNTRIES.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setPicked(c.id)}
            className={
              'w-full flex items-center justify-between px-5 py-4 text-left ' +
              (i < COUNTRIES.length - 1 ? 'border-b border-navy/10 ' : '') +
              (picked === c.id ? 'bg-navy/5' : '')
            }
          >
            <span>
              <span className="font-serif text-navy text-base block">{c.label}</span>
              {NO_VISA_TRACK.has(c.id) && (
                <span className="font-serif text-navy/50 text-xs italic">
                  въезд по безвизу — раздел «Виза» устроен иначе
                </span>
              )}
            </span>
            <span
              className={
                'w-5 h-5 rounded-full flex-shrink-0 ' +
                (picked === c.id ? 'bg-gold' : 'border-2 border-navy/25')
              }
            />
          </button>
        ))}
      </div>

      {changed && NO_VISA_TRACK.has(picked) && (
        <div className="mx-6 mt-4 flex items-start gap-2 border border-gold/60 rounded-xl px-4 py-3">
          <TriangleAlert size={16} className="text-gold flex-shrink-0 mt-0.5" />
          <p className="font-serif text-navy/75 text-xs leading-relaxed">
            У «{LABELS[picked]}» въезд по безвизу, поэтому раздел «Виза» устроен
            иначе, чем у остальных: там про статус в Италии, а не про подачу на
            визу D. Переезд и всё остальное работает.
          </p>
        </div>
      )}

      {error && (
        <p className="font-serif text-red-700 text-xs px-6 mt-3">{error}</p>
      )}

      <button
        onClick={save}
        disabled={!changed || saving}
        className="mx-6 mt-5 rounded-xl bg-navy py-3.5 font-serif text-cream text-base disabled:opacity-40"
      >
        {saving ? 'Сохраняю…' : 'Сохранить'}
      </button>

      {history.length > 0 && (
        <>
          <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
            История изменений
          </h3>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
            {history.map((h, i) => (
              <div
                key={h.created_at + i}
                className={
                  'px-5 py-3 flex items-baseline justify-between gap-3 ' +
                  (i < history.length - 1 ? 'border-b border-navy/10' : '')
                }
              >
                <span className="font-serif text-navy text-sm">
                  {(h.from_country && LABELS[h.from_country]) || '—'} →{' '}
                  {LABELS[h.to_country] || h.to_country}
                </span>
                <span className="font-serif text-navy/50 text-xs flex-shrink-0">
                  {formatDate(h.created_at)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
