import { useState } from 'react';
import { useTrackSection } from '../hooks/useTrackSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { Route, PackageOpen, FileText, IdCard, Home, CreditCard, Smartphone, HeartPulse } from 'lucide-react';
import TabBar from '../components/TabBar';
import { GridButton } from '../components/GridButton';
import { useRelocation } from '../hooks/useRelocation';
import { HomeAddressInput } from '../components/HomeAddressInput';
import { LoadingScreen } from '../components/Loader';
import { Collapse } from '../components/Collapse';

const STEPS_CHECKS_KEY = 'cispr_travel_steps_checks';

function loadStepsChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(STEPS_CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function RelocationOverviewPage() {
  useTrackSection('travel');
  const navigate = useNavigate();
  const location = useLocation();
  const { relocation, loading, country } = useRelocation();
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
      <LoadingScreen className="bg-cream" />
    );
  }

  // Нет relocation-сида (сейчас — только Украина: у неё принципиально другой
  // трек легализации без визы D) — облегчённая заглушка, но маршруты и общие
  // блоки (жильё, SSN) всё равно доступны.
  if (!relocation) {
    return (
      <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-28 md:pb-12">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="mt-4 px-6 text-center">
          <h1 className="font-serif text-navy text-3xl font-bold">Переезд</h1>
          <p className="font-serif text-gold text-base mt-1 italic">Дорога и первые дни</p>
          <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
        </div>
        <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
          Детальный гайд для твоей страны в разработке. Типовые маршруты уже можно посмотреть.
        </p>

        <p className="font-serif text-gold text-sm font-bold px-6 mt-8 mb-3">Подробнее о:</p>
        <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-4 md:flex md:flex-wrap md:justify-center">
          <GridButton icon={Route} title="Дорога в Парму" to="/path/travel/routes" seed={1} />
          <GridButton icon={Home} title="Поиск жилья" to="/path/travel/housing" seed={2} />
          <GridButton icon={HeartPulse} title="SSN и tessera sanitaria" to="/path/travel/ssn" seed={3} wide />
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  // Общие для ru/by/kz (одна и та же итальянская бюрократия) + страновые
  // добавки. «После приезда» и «Карты и оплата» — РФ-специфика (обходные
  // схемы для российских карт), у Казахстана для этого свои страницы.
  const gridButtons = [
    { icon: Route, title: 'Дорога в Парму', to: '/path/travel/routes', seed: 1 },
    ...(country === 'ru' ? [{ icon: PackageOpen, title: 'После приезда', to: '/path/travel/after', seed: 2 }] : []),
    { icon: FileText, title: 'Codice Fiscale', to: '/path/travel/codice-fiscale', seed: 3 },
    { icon: IdCard, title: 'Permesso di soggiorno', to: '/path/travel/permesso', seed: 4 },
    { icon: Home, title: 'Поиск жилья', to: '/path/travel/housing', seed: 5 },
    ...(country === 'ru' ? [{ icon: CreditCard, title: 'Карты и оплата', to: '/path/travel/cards', seed: 6 }] : []),
    { icon: HeartPulse, title: 'SSN и tessera sanitaria', to: '/path/travel/ssn', seed: 7 },
    ...(country === 'kz' ? [
      { icon: Smartphone, title: 'Связь и SIM', to: '/path/travel/kz-sim', seed: 8 },
      { icon: CreditCard, title: 'Карты и оплата', to: '/path/travel/kz-cards', seed: 9 },
    ] : []),
  ];

  return (
    <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-28 md:pb-12">
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

        <Collapse open={stepsOpen}>{(() => {
          const allSteps = relocation.steps_overview_ru.steps;
          // Последний пункт — не пронумерованный шаг с галочкой, а заметка
          // в конце (ожидание после подачи не требует «сделать» действия).
          const numberedSteps = allSteps.slice(0, -1);
          const finalNote = allSteps[allSteps.length - 1];
          return (
          <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-3">
            {numberedSteps.map((step, idx) => {
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

                </div>
              );
            })}

            {/* Заметка в конце — что дальше, без галочки и номера */}
            {finalNote && (
              <div className="pt-4 border-t border-navy/10 bg-soft-cream rounded-xl px-4 py-3 -mx-0">
                <p className="font-serif text-navy text-base font-bold">{finalNote.title_ru}</p>
                <p className="font-serif text-navy/80 text-sm mt-1.5 leading-relaxed">{finalNote.description_ru}</p>
                {finalNote.details_ru && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {finalNote.details_ru.map((d, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
                        <p className="font-serif text-navy/70 text-xs leading-relaxed">{d}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* Ссылка на общий блок про SSN. Раньше она подхватывала пункт
                    про SSN в этом же списке, теперь пункта нет — ссылка стоит
                    сама по себе как отдельный вход в тему. */}
                <button
                  onClick={() => navigate('/path/travel/ssn')}
                  className="mt-3 flex items-center gap-1.5 font-serif text-gold text-sm font-bold"
                >
                  <span>Подробнее про SSN и tessera sanitaria</span>
                  <span>→</span>
                </button>
              </div>
            )}

            <p className="font-serif text-navy/50 text-xs italic mt-1 pt-3 border-t border-navy/10 leading-relaxed">
              {relocation.steps_overview_ru.disclaimer_ru}
            </p>
          </div>
          );
        })()}</Collapse>
      </div>

      {/* Навигация — компактная сетка мелких плиток, как в Университете */}
      <p className="font-serif text-gold text-sm font-bold px-6 mt-8 mb-3">Подробнее о:</p>
      <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-4 md:flex md:flex-wrap md:justify-center">
        {gridButtons.map((b, i) => (
          <GridButton key={b.to} {...b} wide={gridButtons.length % 2 === 1 && i === gridButtons.length - 1} />
        ))}
      </div>

      {/* Адрес — в самом низу, после всех подразделов */}
      <div className="mx-6 mt-6">
        <HomeAddressInput />
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {relocation.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
