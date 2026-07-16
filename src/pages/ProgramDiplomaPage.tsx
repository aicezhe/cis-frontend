import { TriangleAlert } from 'lucide-react';
import { useMyLegalization } from '../hooks/useFoundation';
import { ContentPage, PageHeader, TldrCard, H2, Steps, Step, Note, InfoCard } from '../components/content';

// Легализация диплома (апостиль/консульская легализация + перевод + CIMEA/DDV).
export default function ProgramDiplomaPage() {
  const { legalization, loading } = useMyLegalization();

  return (
    <ContentPage>
      <PageHeader
        crumb="Университет · Программа"
        title="Диплом"
        subtitle="Апостиль, перевод, признание диплома (CIMEA / DDV)"
      />

      <TldrCard>
        Диплом легализуется в три шага: <b>апостиль</b> в своей стране → <b>перевод</b> на итальянский →
        <b> признание</b> в Италии через CIMEA или DDV. Порядок и сроки — по твоей стране ниже.
      </TldrCard>

      {loading && <p className="text-content-ink-2 text-sm italic mt-6">Загрузка данных по стране…</p>}

      {!loading && !legalization && (
        <>
          <H2>Общий порядок</H2>
          <Steps>
            <Step number={1} title="Апостиль документа об образовании">
              Через уполномоченный орган своей страны.
            </Step>
            <Step number={2} title="Перевод на итальянский">
              Нотариально заверенный, у аккредитованного переводчика.
            </Step>
            <Step number={3} title="Признание в Италии">
              CIMEA (cimea-diplome.it) или DDV через консульство Италии.
            </Step>
          </Steps>
          <Note>Для точного порядка по твоей стране — выбери страну в Настройках.</Note>
        </>
      )}

      {!loading && legalization && (
        <>
          <H2>Порядок для {legalization.meta.country_name_ru}</H2>
          <p className="text-content-ink-2 text-xs italic mt-1">источник: {legalization.meta.source}</p>

          <div className="mt-4">
            <InfoCard
              tag="куда идти"
              title={
                legalization.diploma_legalization.country_in_hague
                  ? 'Гаагская конвенция — апостиль'
                  : 'Консульская легализация'
              }
            >
              Уполномоченный орган: {legalization.diploma_legalization.competent_authority.name_ru}
              {legalization.diploma_legalization.competent_authority.website && (
                <>
                  {' '}
                  <a
                    href={legalization.diploma_legalization.competent_authority.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-content-gold underline"
                  >
                    {legalization.diploma_legalization.competent_authority.website.replace('https://', '')} ↗
                  </a>
                </>
              )}
            </InfoCard>
          </div>

          <Steps>
            {legalization.diploma_legalization.steps.map((step, i) => (
              <Step key={step.id} number={i + 1} title={step.title_ru}>
                {step.description_ru}

                {(step.cost_local || step.cost_eur_approx) && (
                  <p className="text-content-navy text-[13px] font-medium mt-2">
                    {step.cost_local}{step.cost_eur_approx ? ` (~${step.cost_eur_approx} €)` : ''}
                    {step.duration_days ? ` · ${step.duration_days}` : ''}
                  </p>
                )}

                {step.options && step.options.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {step.options.map((opt, j) => (
                      <div key={j} className="rounded-xl bg-content-bg border border-content-line px-3 py-2.5">
                        <p className="text-content-navy text-[14.5px] font-semibold">{opt.name}</p>
                        <p className="text-content-ink-2 text-xs">{opt.cost_eur} € · {opt.duration}</p>
                        {opt.pros_ru.map((pr, k) => (
                          <p key={k} className="text-content-ink-2 text-xs mt-0.5">＋ {pr}</p>
                        ))}
                        {opt.cons_ru.map((cn, k) => (
                          <p key={k} className="text-content-ink-2/70 text-xs mt-0.5">－ {cn}</p>
                        ))}
                      </div>
                    ))}
                    {step.recommendation_ru && (
                      <p className="text-content-gold text-[13px] font-semibold">{step.recommendation_ru}</p>
                    )}
                  </div>
                )}

                {step.warnings_ru && step.warnings_ru.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {step.warnings_ru.map((w, k) => (
                      <Note key={k} icon={<TriangleAlert size={15} />}>{w}</Note>
                    ))}
                  </div>
                )}
              </Step>
            ))}
          </Steps>

          {legalization.common_pitfalls_ru.length > 0 && (
            <>
              <H2>Частые ошибки</H2>
              <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 mt-4 flex flex-col gap-2">
                {legalization.common_pitfalls_ru.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-content-gold text-sm flex-shrink-0 mt-0.5">◆</span>
                    <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </ContentPage>
  );
}
