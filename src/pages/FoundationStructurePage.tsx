import { useFoundation } from '../hooks/useFoundation';
import type { FoundationModality } from '../types/foundation';
import { ContentPage, PageHeader, TldrCard, H2, BodyText } from '../components/content';
import { LoadingScreen } from '../components/Loader';

const MODALITY_LABEL: Record<FoundationModality, string> = {
  in_presenza: 'очно',
  blended: 'смешанно',
  online: 'онлайн',
};

export default function FoundationStructurePage() {
  const { data, loading, error } = useFoundation();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg px-6">
        <p className="font-golos text-content-ink text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p>
      </div>
    );
  }

  const p = data.program;
  const plan = data.subjects_by_track.absolute_beginners;

  return (
    <ContentPage>
      <PageHeader crumb="Foundation Year" title="Структура курса" backTo="/path/foundation" />

      <TldrCard stats={[{ value: `≈${plan.total_cfu ?? 60}`, label: 'CFU за год' }]}>{p.description_ru}</TldrCard>

      <H2>Как устроена учёба</H2>
      <BodyText>{data.how_studies_work_ru}</BodyText>

      <H2>После завершения</H2>
      <div className="flex flex-col gap-1.5 mt-3">
        {p.issued_after_completion.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-content-gold mt-0.5">◆</span>
            <p className="text-content-ink text-[15px]">{item}</p>
          </div>
        ))}
      </div>

      <H2>Учебный план</H2>
      <div className="flex flex-col gap-3 mt-4">
        <div className="bg-content-surface border border-content-line rounded-xl px-4 py-3 flex justify-between items-center">
          <p className="text-content-navy text-base font-medium">Всего за год</p>
          <p className="text-content-gold text-xl font-bold">≈{plan.total_cfu ?? 60} CFU</p>
        </div>
        {plan.total_note_ru && <p className="text-content-ink-2 text-sm italic">{plan.total_note_ru}</p>}
        {plan.list.map((subj, i) => (
          <div
            key={i}
            className={
              'rounded-xl px-4 py-3 border bg-content-surface ' +
              (subj.optional ? 'border-content-gold border-dashed' : 'border-content-line')
            }
          >
            <div className="flex justify-between items-start gap-3">
              <h5 className={'text-base font-semibold leading-snug flex-1 ' + (subj.optional ? 'text-content-gold' : 'text-content-navy')}>
                {subj.name}
              </h5>
              <span className="text-content-gold text-base font-bold flex-shrink-0">{subj.cfu} CFU</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subj.period && (
                <span className="text-content-ink-2 text-xs bg-content-bg border border-content-line rounded-full px-2 py-0.5">{subj.period}</span>
              )}
              {subj.modality && (
                <span className="text-content-ink-2 text-xs bg-content-bg border border-content-line rounded-full px-2 py-0.5">{MODALITY_LABEL[subj.modality]}</span>
              )}
              {subj.optional && (
                <span className="text-content-gold text-xs bg-content-gold-bg rounded-full px-2 py-0.5 font-semibold">по выбору</span>
              )}
            </div>
            {subj.note && <p className="text-content-ink-2 text-sm italic mt-2">{subj.note}</p>}
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
