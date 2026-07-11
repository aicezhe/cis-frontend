import { useNavigate } from 'react-router-dom';
import { useMyLegalization } from '../hooks/useFoundation';

// Легализация диплома (апостиль/консульская легализация + перевод + CIMEA/DDV) —
// отдельная страница, раньше была встроена в карточку документа и в шаг
// поступления, теперь и оттуда, и из «Документов» ведёт сюда кнопка.
export default function ProgramDiplomaPage() {
  const navigate = useNavigate();
  const { legalization, loading } = useMyLegalization();

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Диплом</h1>
      </div>

      <p className="font-serif text-navy/60 text-sm px-6 mt-2">
        Апостиль, перевод, признание диплома (CIMEA / DDV)
      </p>

      {loading && (
        <div className="mx-6 mt-6">
          <p className="font-serif text-navy/50 text-sm italic">Загрузка данных по стране…</p>
        </div>
      )}

      {!loading && !legalization && (
        <div className="mx-6 mt-6 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4 flex flex-col gap-3">
          <p className="font-serif text-gold text-sm font-bold">Общий порядок легализации</p>
          <div className="flex flex-col gap-2">
            {[
              '1. Апостиль документа об образовании — через уполномоченный орган своей страны',
              '2. Нотариально заверенный перевод на итальянский у аккредитованного переводчика',
              '3. Признание в Италии: CIMEA (cimea-diplome.it) или DDV через консульство Италии',
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold text-sm flex-shrink-0 mt-0.5">◆</span>
                <p className="font-serif text-navy/70 text-sm leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
          <p className="font-serif text-navy/40 text-[11px] italic">
            Для точного порядка по твоей стране — выбери страну в Настройках
          </p>
        </div>
      )}

      {!loading && legalization && (
        <div className="mx-6 mt-6 flex flex-col gap-3">
          <p className="font-serif text-gold text-sm font-bold">
            Порядок для {legalization.meta.country_name_ru}
            <span className="text-navy/40 ml-1 font-normal">(источник: {legalization.meta.source})</span>
          </p>

          <div className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
            <p className="font-serif text-navy text-sm font-bold">
              {legalization.diploma_legalization.country_in_hague ? '✓ Гаагская конвенция — апостиль' : 'Консульская легализация'}
            </p>
            <p className="font-serif text-navy/60 text-sm mt-0.5">
              Уполномоченный орган: {legalization.diploma_legalization.competent_authority.name_ru}
            </p>
            {legalization.diploma_legalization.competent_authority.website && (
              <a
                href={legalization.diploma_legalization.competent_authority.website}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-sm underline mt-1 inline-block"
              >
                {legalization.diploma_legalization.competent_authority.website.replace('https://', '')} ↗
              </a>
            )}
          </div>

          {legalization.diploma_legalization.steps.map((step, i) => (
            <div key={step.id} className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-cream text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <p className="font-serif text-navy text-base font-bold">{step.title_ru}</p>
              </div>
              <p className="font-serif text-navy/70 text-sm leading-relaxed pl-8">{step.description_ru}</p>

              {(step.cost_local || step.cost_eur_approx) && (
                <p className="font-serif text-navy/60 text-sm pl-8 mt-1.5">
                  💰 {step.cost_local}{step.cost_eur_approx ? ` (~${step.cost_eur_approx} €)` : ''}
                  {step.duration_days ? ` · ⏱ ${step.duration_days}` : ''}
                </p>
              )}

              {step.options && step.options.length > 0 && (
                <div className="pl-8 mt-2 flex flex-col gap-2">
                  {step.options.map((opt, j) => (
                    <div key={j} className="border-l-2 border-gold pl-3">
                      <p className="font-serif text-navy text-sm font-bold">{opt.name}</p>
                      <p className="font-serif text-navy/60 text-xs">{opt.cost_eur} € · {opt.duration}</p>
                      {opt.pros_ru.map((pr, k) => (
                        <p key={k} className="font-serif text-navy/60 text-xs">＋ {pr}</p>
                      ))}
                      {opt.cons_ru.map((cn, k) => (
                        <p key={k} className="font-serif text-navy/40 text-xs">－ {cn}</p>
                      ))}
                    </div>
                  ))}
                  {step.recommendation_ru && (
                    <p className="font-serif text-gold text-sm font-bold">💡 {step.recommendation_ru}</p>
                  )}
                </div>
              )}

              {step.warnings_ru && step.warnings_ru.length > 0 && (
                <div className="pl-8 mt-2 flex flex-col gap-1.5">
                  {step.warnings_ru.map((w, k) => (
                    <div key={k} className="flex items-start gap-2 bg-cream border border-gold/50 rounded-lg px-3 py-2">
                      <span className="text-gold text-sm flex-shrink-0">!</span>
                      <p className="font-serif text-navy/70 text-xs leading-relaxed">{w}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {legalization.common_pitfalls_ru.length > 0 && (
            <div className="bg-soft-cream border border-gold/30 rounded-xl px-4 py-4">
              <p className="font-serif text-gold text-sm mb-2 font-bold">Частые ошибки при легализации</p>
              <div className="flex flex-col gap-1.5">
                {legalization.common_pitfalls_ru.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gold text-sm flex-shrink-0 mt-0.5">◆</span>
                    <p className="font-serif text-navy/70 text-sm leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
