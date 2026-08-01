import { Fragment, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, XCircle } from 'lucide-react';
import TabBar from '../components/TabBar';
import { GridButton } from '../components/GridButton';
import { useVisa, useVisaKz } from '../hooks/useVisa';
import type { VisaByStep } from '../types/visa';
import { LoadingScreen } from '../components/Loader';
import { Collapse } from '../components/Collapse';

function Corners() {
  return (
    <>
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
    </>
  );
}

const ACTION_CHECKS_KEY = 'cispr_visa_kz_action_checks';

function loadActionChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(ACTION_CHECKS_KEY) || '[]'); } catch { return []; }
}

// Казахстан: та же структура, что у России/Беларуси (канал подачи → шаги с
// чекбоксами → плитки). Общие шаги 1–2 и 6–7 берём из российского сида,
// специфику 3–5 (проверка канала/запись → подача → ожидание) — из kz-сида.
export default function VisaKazakhstanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { visa, loading: loadingRu } = useVisa();
  const { kz, loading: loadingKz } = useVisaKz();
  const [stepsOpen, setStepsOpen] = useState(() => Boolean((location.state as { openSteps?: boolean } | null)?.openSteps));
  const [actionChecks, setActionChecks] = useState<string[]>(loadActionChecks);

  function toggleActionCheck(id: string) {
    setActionChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(ACTION_CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loadingRu || loadingKz) {
    return (
      <LoadingScreen className="bg-cream" />
    );
  }
  if (!visa || !kz) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <p className="font-serif text-navy/60 text-base text-center leading-relaxed">
            Не удалось загрузить гайд по визе. Попробуй обновить страницу.
          </p>
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  const ch = kz.channel_ru;

  // Общие шаги (поступление, Universitaly, доверенность, прилёт/ВНЖ) —
  // из российского сида; специфика подачи в Казахстане — из kz-сида.
  const ru = visa.action_steps_ru.steps;
  const combinedSteps: VisaByStep[] = [
    ru[0], ru[1],
    ...kz.embassy_steps_ru.steps,
    ru[5], ru[6],
  ].filter(Boolean) as VisaByStep[];
  const permessoIdx = combinedSteps.length - 1;

  const gridButtons = [
    { icon: FileText, title: 'Документы', to: '/path/visa/steps', seed: 1 },
    { icon: XCircle, title: 'Причины отказа', to: '/path/visa/rejections', seed: 2 },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Виза D</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Visto nazionale · studio</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {kz.meta.country_name_ru} · {kz.meta.academic_year}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
        Для учёбы в Италии нужна виза дольше 90 дней категории&nbsp;D.
      </p>

      {/* Куда подаёшься — канал подачи в Казахстане нестабилен (аналог «округа» РФ) */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">{ch.title_ru}</p>
      <p className="font-serif text-navy/70 text-sm px-6 mb-3 leading-relaxed">{ch.lead_ru}</p>
      <div className="mx-6 relative bg-navy rounded-2xl p-5">
        <Corners />
        <p className="font-serif text-gold text-xs font-bold uppercase tracking-wide">{ch.known_title_ru}</p>
        <div className="flex flex-col gap-2 mt-2">
          {ch.known_ru.map((k, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="font-serif text-cream/80 text-xs leading-relaxed">{k}</p>
            </div>
          ))}
        </div>
        <a
          href={ch.website}
          target="_blank"
          rel="noreferrer"
          className="font-serif text-gold text-xs underline mt-3 inline-block"
        >
          {ch.website.replace('https://', '')} ↗
        </a>
        <div className="bg-cream/10 rounded-xl px-3 py-2 mt-3">
          <p className="font-serif text-cream/80 text-xs leading-relaxed">
            Запись:{' '}
            <a href={ch.prenotami_url} target="_blank" rel="noreferrer" className="text-gold underline">
              {ch.prenotami_url.replace('https://', '')} ↗
            </a>
          </p>
        </div>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">О визе</h3>

      <div className="px-6 flex flex-col gap-3">
        {/* Шаги получения визы — тот же паттерн, что в России */}
        <div>
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="w-full flex items-center gap-3 text-left py-1"
          >
            <div className="flex-1 text-center">
              <h4 className="font-serif text-navy text-2xl font-bold">Шаги получения визы</h4>
              {!stepsOpen && (
                <p className="font-serif text-gold text-sm mt-1 font-bold">От поступления до permesso</p>
              )}
            </div>
            <svg
              width="16" height="16" viewBox="0 0 14 14"
              className={'text-navy flex-shrink-0 transition-transform ' + (stepsOpen ? 'rotate-180' : '')}
              fill="currentColor"
            >
              <path d="M7 10L1 4h12L7 10z" />
            </svg>
          </button>

          <Collapse open={stepsOpen}>

            <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-3">
              <p className="font-serif text-gold text-sm text-center italic">
                {visa.action_steps_ru.audience_note_ru}
              </p>

              {combinedSteps.map((step, idx) => {
                const stepId = `visa-kz-action-${idx}`;
                const done = actionChecks.includes(stepId);
                return (
                  <Fragment key={idx}>
                    <div className={idx === 0 ? '' : 'pt-4 border-t border-navy/10'}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">Шаг {idx + 1}</p>
                        <button onClick={() => toggleActionCheck(stepId)} className="w-6 h-6 flex-shrink-0">
                          {done ? (
                            <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
                          )}
                        </button>
                      </div>
                      <h5 className={
                        'font-serif text-lg font-bold mt-1 ' +
                        (done ? 'text-navy/50 line-through' : 'text-navy')
                      }>
                        {step.title_ru}
                      </h5>
                      <p className="font-serif text-navy/80 text-base mt-2 leading-relaxed">{step.description_ru}</p>
                      {step.details_ru && (
                        <div className="flex flex-col gap-1.5 mt-3">
                          {step.details_ru.map((d, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
                              <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {step.warning_ru && (
                        <div className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2 mt-3">
                          <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
                          <p className="font-serif text-navy/80 text-sm">{step.warning_ru}</p>
                        </div>
                      )}
                      {idx === permessoIdx && (
                        <button
                          onClick={() => navigate('/path/travel/permesso')}
                          className="mt-3 flex items-center gap-1.5 font-serif text-gold text-sm"
                        >
                          <span>Подробнее про permesso и следующие шаги — в разделе «Переезд»</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>

                    {/* Ссылка на подробный сбор документов — после шага 5 (ожидание) */}
                    {idx === 4 && (
                      <div className="bg-gold/10 border border-gold/40 rounded-xl px-4 py-3">
                        <p className="font-serif text-navy/80 text-xs leading-relaxed mb-1.5">
                          Для самого сбора документов есть отдельный раздел — там всё разобрано подробно, по каждому пункту.
                        </p>
                        <button
                          onClick={() => navigate('/path/visa/steps', { state: { openSteps: true } })}
                          className="font-serif text-gold text-sm font-bold"
                        >
                          Перейти к сбору документов →
                        </button>
                      </div>
                    )}
                  </Fragment>
                );
              })}

              <p className="font-serif text-navy/50 text-xs italic mt-1 pt-3 border-t border-navy/10 leading-relaxed">
                {kz.embassy_steps_ru.disclaimer_ru}
              </p>
            </div>
        </Collapse>
        </div>

        {/* Плитки — как в России */}
        <p className="font-serif text-gold text-sm font-bold mt-2">Подробнее о:</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {gridButtons.map((b, i) => (
            <GridButton key={b.to} {...b} wide={gridButtons.length % 2 === 1 && i === gridButtons.length - 1} />
          ))}
        </div>
      </div>

      {/* После приезда — permesso (общий блок, стандартный трек без сюрпризов) */}
      <div className="mx-6 mt-5 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-2 font-bold">{visa.permesso_di_soggiorno_ru.title_ru}</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{visa.intro_ru.after_arrival_ru}</p>
        <p className="font-serif text-navy/50 text-xs italic mt-2">{visa.permesso_di_soggiorno_ru.note_ru}</p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {kz.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
