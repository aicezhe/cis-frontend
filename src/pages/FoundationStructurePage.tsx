import { useNavigate } from 'react-router-dom';
import { useFoundation } from '../hooks/useFoundation';
import type { FoundationModality } from '../types/foundation';

const MODALITY_LABEL: Record<FoundationModality, string> = {
  in_presenza: 'очно',
  blended: 'смешанно',
  online: 'онлайн',
};

export default function FoundationStructurePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-cream px-6"><p className="font-serif text-navy text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p></div>;

  const p = data.program;
  const plan = data.subjects_by_track.absolute_beginners;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Структура курса</h1>
      </div>

      <div className="mx-6 mt-5 flex flex-col gap-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{p.description_ru}</p>
        <div>
          <p className="font-serif text-gold text-base font-bold mb-1.5">Как устроена учёба</p>
          <p className="font-serif text-navy/80 text-sm leading-relaxed">{data.how_studies_work_ru}</p>
        </div>
        <div>
          <p className="font-serif text-gold text-base font-bold mb-2">После завершения</p>
          <div className="flex flex-col gap-1.5">
            {p.issued_after_completion.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold mt-0.5">◆</span>
                <p className="font-serif text-navy/80 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Учебный план</p>
      <div className="px-6 flex flex-col gap-3">
        <div className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3 flex justify-between items-center">
          <p className="font-serif text-navy text-base">Всего за год</p>
          <p className="font-serif text-gold text-xl font-bold">≈{plan.total_cfu ?? 60} CFU</p>
        </div>
        {plan.total_note_ru && (
          <p className="font-serif text-navy/60 text-sm italic">{plan.total_note_ru}</p>
        )}
        {plan.list.map((subj, i) => (
          <div
            key={i}
            className={
              'rounded-xl px-4 py-3 border ' +
              (subj.optional ? 'bg-soft-cream border-gold border-dashed' : 'bg-soft-cream border-navy/15')
            }
          >
            <div className="flex justify-between items-start gap-3">
              <h5 className={
                'font-serif text-base font-bold leading-snug flex-1 ' +
                (subj.optional ? 'text-gold' : 'text-navy')
              }>
                {subj.name}
              </h5>
              <span className="font-serif text-gold text-base font-bold flex-shrink-0">{subj.cfu} CFU</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subj.period && (
                <span className="font-serif text-navy/60 text-xs bg-cream border border-navy/15 rounded-full px-2 py-0.5">{subj.period}</span>
              )}
              {subj.modality && (
                <span className="font-serif text-navy/60 text-xs bg-cream border border-navy/15 rounded-full px-2 py-0.5">{MODALITY_LABEL[subj.modality]}</span>
              )}
              {subj.optional && (
                <span className="font-serif text-gold text-xs bg-cream border border-gold/40 rounded-full px-2 py-0.5">по выбору</span>
              )}
            </div>
            {subj.note && (
              <p className="font-serif text-navy/50 text-sm italic mt-2">{subj.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
