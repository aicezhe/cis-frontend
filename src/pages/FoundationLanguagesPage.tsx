import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation } from '../hooks/useFoundation';
import type { FoundationTrackId } from '../types/foundation';

const TRACK_ORDER: FoundationTrackId[] = ['absolute_beginners', 'elementary', 'english_track'];

export default function FoundationLanguagesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">Не удалось загрузить данные.</p>
      </div>
    );
  }

  const lr = data.language_requirements;
  const trackName = (id: FoundationTrackId) =>
    data.tracks.find((t) => t.id === id)?.name || id;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
      </div>

      <div className="mx-6 mt-4">
        <h1 className="font-serif text-navy text-3xl font-bold">Языки</h1>
        <p className="font-serif text-gold text-base italic mt-1">Требования по трекам</p>
      </div>

      {/* Требования по трекам */}
      <div className="mx-6 mt-6 flex flex-col gap-3">
        {TRACK_ORDER.map((id) => {
          const req = lr.by_track[id];
          return (
            <div key={id} className="bg-soft-cream border border-navy/20 rounded-2xl p-4">
              <h4 className="font-serif text-navy text-base font-bold mb-2">{trackName(id)}</h4>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <p className="font-serif text-navy/60 text-sm">Итальянский</p>
                  <p className="font-serif text-navy text-sm">{req.italian}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-serif text-navy/60 text-sm">Английский</p>
                  <p className="font-serif text-navy text-sm">{req.english}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Принимаемые сертификаты B2 */}
      <div className="mx-6 mt-8">
        <h3 className="font-serif text-navy text-lg font-bold mb-3">
          Сертификаты английского B2
        </h3>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl p-4 flex flex-col gap-2">
          {lr.accepted_english_b2_certificates.map((cert, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5">◆</span>
              <p className="font-serif text-navy/80 text-sm">{cert}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Duolingo предупреждение */}
      <div className="mx-6 mt-6 bg-navy rounded-2xl p-5">
        <p className="font-serif text-gold text-sm italic mb-2">Про Duolingo</p>
        <p className="font-serif text-cream text-sm leading-relaxed">{lr.duolingo_note_ru}</p>
      </div>

      {/* Виза предупреждение */}
      <div className="mx-6 mt-4 bg-soft-cream border border-gold rounded-2xl p-5">
        <p className="font-serif text-gold text-sm italic mb-2">Про визу</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{lr.visa_note_ru}</p>
      </div>

      <TabBar active="path" />
    </div>
  );
}
