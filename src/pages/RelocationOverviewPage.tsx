import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route, PackageOpen, FileText, IdCard } from 'lucide-react';
import TabBar from '../components/TabBar';
import { GridButton } from '../components/GridButton';
import { useRelocation } from '../hooks/useRelocation';
import { HomeAddressInput } from '../components/HomeAddressInput';

const STEPS_CHECKS_KEY = 'cispr_travel_steps_checks';

function loadStepsChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(STEPS_CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function RelocationOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { relocation, loading } = useRelocation();
  // Пришли по ссылке из шага (маршруты/LOCI) — возвращаем назад тоже с
  // раскрытыми «Шагами переезда».
  const [stepsOpen, setStepsOpen] = useState(() => Boolean((location.state as { openSteps?: boolean } | null)?.openSteps));
  const [checks, setChecks] = useState<string[]>(loadStepsChecks);

  function toggleCheck(id: string) {
    setChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(STEPS_CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }
  const isChecked = (id: string) => checks.includes(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  // нет seed для страны (ua/by/kz) — заглушка + маршруты LOCI всё равно доступны
  if (!relocation) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="font-serif text-navy text-2xl font-bold mb-3">Переезд</p>
            <p className="font-serif text-navy/60 text-base leading-relaxed mb-6">
              Детальный гайд для твоей страны в разработке. Типовые маршруты уже можно посмотреть.
            </p>
            <button
              onClick={() => navigate('/loci/routes')}
              className="font-serif text-cream bg-navy rounded-full px-8 py-3"
            >
              Предположить маршрут →
            </button>
          </div>
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  const gridButtons = [
    { icon: Route, title: 'Дорога в Парму', to: '/path/travel/routes', seed: 1 },
    { icon: PackageOpen, title: 'После приезда', to: '/path/travel/after', seed: 2 },
    { icon: FileText, title: 'Codice Fiscale', to: '/path/travel/codice-fiscale', seed: 3 },
    { icon: IdCard, title: 'Permesso di soggiorno', to: '/path/travel/permesso', seed: 4 },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как в Университете) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Переезд</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Дорога и первые дни</p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Интро — просто текст, без коробки-плашки */}
      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
        {relocation.intro_ru.what_ru}
      </p>

      {/* Шаги переезда — тот же паттерн, что «Шаги поступления»/«Шаги
          получения визы»: без рамки-«кнопки», свёрнуто по умолчанию,
          у каждого шага своя галочка. Перед подразделами. */}
      <div className="px-6 mt-8">
        <button
          onClick={() => setStepsOpen(!stepsOpen)}
          className="w-full flex items-center gap-3 text-left py-1"
        >
          <div className="flex-1 text-center">
            <h4 className="font-serif text-navy text-2xl font-bold">{relocation.steps_overview_ru.title_ru}</h4>
            {!stepsOpen && (
              <p className="font-serif text-gold text-sm mt-1 font-bold">От визы до полученного ВНЖ</p>
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

        {stepsOpen && (
          <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-3">
            {relocation.steps_overview_ru.steps.map((step, idx) => {
              const stepId = `travel-step-${idx}`;
              const done = isChecked(stepId);
              return (
                <div key={idx} className={idx === 0 ? '' : 'pt-4 border-t border-navy/10'}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">Шаг {idx + 1}</p>
                    <button onClick={() => toggleCheck(stepId)} className="w-6 h-6 flex-shrink-0">
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

                  {step.link_to && (
                    <button
                      onClick={() => navigate(step.link_to!, { state: { openSteps: true } })}
                      className="mt-3 flex items-center gap-1.5 font-serif text-gold text-sm"
                    >
                      {step.link_label || '→'}
                    </button>
                  )}

                  {step.links_ru && (
                    <div className="flex flex-col gap-2 mt-3">
                      {step.links_ru.map((l, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(l.to, { state: { openSteps: true } })}
                          className="flex items-center gap-1.5 font-serif text-gold text-sm"
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <p className="font-serif text-navy/50 text-xs italic mt-1 pt-3 border-t border-navy/10 leading-relaxed">
              {relocation.steps_overview_ru.disclaimer_ru}
            </p>
          </div>
        )}
      </div>

      {/* Навигация — компактная сетка мелких плиток, как в Университете */}
      <p className="font-serif text-gold text-sm font-bold px-6 mt-8 mb-3">Подробнее о:</p>
      <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-4">
        {gridButtons.map((b) => (
          <GridButton key={b.to} {...b} />
        ))}
      </div>

      {/* Жильё */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">{relocation.housing_search.title_ru}</p>
      <div className="px-6 flex flex-col gap-2">
        {relocation.housing_search.options.map((opt, i) => (
          <div key={i} className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
            <div className="flex justify-between items-baseline gap-2">
              <p className="font-serif text-navy text-sm font-bold">{opt.name}</p>
              {opt.price_min_eur != null && opt.price_max_eur != null && (
                <p className="font-serif text-navy/70 text-xs flex-shrink-0">
                  {opt.price_min_eur}–{opt.price_max_eur} €/мес
                </p>
              )}
            </div>
            <p className="font-serif text-navy/65 text-xs leading-relaxed mt-1">{opt.pros_ru}</p>
            {opt.url && (
              <a
                href={opt.url}
                target="_blank"
                rel="noreferrer"
                className="font-serif text-gold text-xs underline mt-1 inline-block"
              >
                {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка LOCI маршруты + адрес — в самом низу, после всех подразделов */}
      <button
        onClick={() => navigate('/loci/routes')}
        className="relative mx-6 mt-6 bg-navy rounded-2xl px-5 py-4 text-left"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ loci ¬</p>
        <p className="font-serif text-cream text-lg">Предположить маршрут ✈</p>
        <p className="font-serif text-cream/60 text-sm mt-1">Типичные пути из твоей страны до Пармы</p>
      </button>

      <div className="mx-6 mt-4">
        <HomeAddressInput />
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {relocation.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
