import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation, useMyFoundationTrack } from '../hooks/useFoundation';
import type { FoundationModality, FoundationTrackId } from '../types/foundation';

const MODALITY_LABEL: Record<FoundationModality, string> = {
  in_presenza: 'очно',
  blended: 'смешанно',
  online: 'онлайн',
};

export default function FoundationSubjectsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();
  const defaultTrack = useMyFoundationTrack();
  const [track, setTrack] = useState<FoundationTrackId>(defaultTrack);

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

  const subjects = data.subjects_by_track[track];
  const hasList = subjects.list.length > 0;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
      </div>

      <div className="mx-6 mt-4">
        <h1 className="font-serif text-navy text-3xl font-bold">Предметы</h1>
        <p className="font-serif text-gold text-base italic mt-1">Учебный план по треку</p>
      </div>

      {/* Переключатель треков */}
      <div className="mx-6 mt-6 flex flex-col gap-2">
        {data.tracks.map((t) => {
          const active = t.id === track;
          return (
            <button
              key={t.id}
              onClick={() => setTrack(t.id)}
              className={
                'rounded-2xl border p-3 text-left ' +
                (active ? 'bg-navy border-navy' : 'bg-soft-cream border-navy/20')
              }
            >
              <div className="flex justify-between items-center">
                <p className={'font-serif font-bold ' + (active ? 'text-cream' : 'text-navy')}>
                  {t.name}
                </p>
                {t.is_default_for_russian && (
                  <span className={'font-serif text-[11px] italic ' + (active ? 'text-gold' : 'text-gold')}>
                    рекоменд. для РФ
                  </span>
                )}
              </div>
              <p className={'font-serif text-xs italic mt-0.5 ' + (active ? 'text-cream/70' : 'text-navy/60')}>
                {t.name_ru} · {t.italian_level_start} → {t.italian_level_end}
              </p>
            </button>
          );
        })}
      </div>

      {/* Сумма CFU */}
      {hasList && subjects.total_cfu != null && (
        <div className="mx-6 mt-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-3 flex justify-between items-center">
          <p className="font-serif text-navy text-base">Всего за год</p>
          <p className="font-serif text-gold text-xl font-bold">{subjects.total_cfu} CFU</p>
        </div>
      )}

      {/* Список предметов или заглушка */}
      {hasList ? (
        <div className="mx-6 mt-6 flex flex-col gap-3">
          {subjects.list.map((s, i) => (
            <div key={i} className="bg-soft-cream border border-navy/20 rounded-2xl p-4">
              <div className="flex justify-between items-start gap-3">
                <h4 className="font-serif text-navy text-base font-bold leading-snug flex-1">{s.name}</h4>
                <span className="font-serif text-gold text-sm font-bold flex-shrink-0">{s.cfu} CFU</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {s.period && (
                  <span className="font-serif text-navy/60 text-[11px] bg-cream border border-navy/15 rounded-full px-2 py-0.5">
                    {s.period}
                  </span>
                )}
                {s.modality && (
                  <span className="font-serif text-navy/60 text-[11px] bg-cream border border-navy/15 rounded-full px-2 py-0.5">
                    {MODALITY_LABEL[s.modality]}
                  </span>
                )}
                {s.grading === 'attendance' && (
                  <span className="font-serif text-navy/60 text-[11px] bg-cream border border-navy/15 rounded-full px-2 py-0.5">
                    только посещение
                  </span>
                )}
                {s.grading === 'pass_fail' && (
                  <span className="font-serif text-navy/60 text-[11px] bg-cream border border-navy/15 rounded-full px-2 py-0.5">
                    зачёт/незачёт
                  </span>
                )}
              </div>
              {s.note && (
                <p className="font-serif text-navy/50 text-xs italic mt-2">{s.note}</p>
              )}
            </div>
          ))}
          <p className="font-serif text-navy/40 text-[11px] italic mt-1">
            Источник: {subjects.source}
          </p>
        </div>
      ) : (
        <div className="mx-6 mt-6 bg-soft-cream border border-navy/20 rounded-2xl p-5">
          <p className="font-serif text-navy/70 text-sm leading-relaxed">
            {subjects.note || 'Точный список предметов этого трека пока уточняется на офсайте.'}
          </p>
        </div>
      )}

      <TabBar active="path" />
    </div>
  );
}
