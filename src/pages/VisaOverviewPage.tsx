import { Fragment, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, XCircle } from 'lucide-react';
import TabBar from '../components/TabBar';
import { GridButton } from '../components/GridButton';
import { useVisa, getConsularDistrict } from '../hooks/useVisa';
import VisaUkrainePage from './VisaUkrainePage';
import VisaBelarusPage from './VisaBelarusPage';

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

const ACTION_CHECKS_KEY = 'cispr_visa_action_checks';

function loadActionChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(ACTION_CHECKS_KEY) || '[]'); } catch { return []; }
}

export default function VisaOverviewPage() {
  const country = localStorage.getItem('cispr_country') || 'ru';
  // у Украины свой трек: безвиз + permesso / временная защита, без визы D
  if (country === 'ua') return <VisaUkrainePage />;
  // Беларусь: виза D, но подача напрямую в посольство в Минске
  if (country === 'by') return <VisaBelarusPage />;
  return <VisaRuOverview />;
}

function VisaRuOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { visa, loading } = useVisa();
  // Если вернулись сюда со страницы «Подробнее о документах» (ссылка внутри
  // шагов) — снова разворачиваем «Шаги получения визы».
  const [stepsOpen, setStepsOpen] = useState(() => Boolean((location.state as { openSteps?: boolean } | null)?.openSteps));
  const [actionChecks, setActionChecks] = useState<string[]>(loadActionChecks);

  function toggleActionCheck(id: string) {
    setActionChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(ACTION_CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  // нет seed для страны юзера (ua/by/kz) — заглушка
  if (!visa) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
        <div className="px-6 pt-12">
          <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        </div>
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="font-serif text-navy text-2xl font-bold mb-3">Виза</p>
            <p className="font-serif text-navy/60 text-base leading-relaxed">
              Раздел для твоей страны в разработке. Скоро здесь будет пошаговый гайд по визе.
            </p>
          </div>
        </div>
        <TabBar active="path" />
      </div>
    );
  }

  const city = localStorage.getItem('cispr_city') || '';
  const districtKey = getConsularDistrict(city, visa);
  const district = districtKey === 'spb'
    ? visa.consular_districts.spb_district
    : visa.consular_districts.moscow_district;
  const operators = visa.consular_districts.operators_ru;

  const gridButtons = [
    { icon: FileText, title: 'Документы', to: '/path/visa/steps', seed: 1 },
    { icon: XCircle, title: 'Причины отказа', to: '/path/visa/rejections', seed: 2 },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как в Университете) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Виза D</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Visto nazionale · studio</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {visa.meta.country_name_ru} · {visa.meta.academic_year}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Что это — просто текст, без коробки-плашки */}
      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
        Для учёбы в Италии нужна виза дольше 90 дней категории&nbsp;D.
      </p>

      {/* Консульский округ */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Твой консульский округ</p>
      <div className="mx-6 relative bg-navy rounded-2xl p-5">
        <Corners />
        <p className="font-serif text-gold text-xs font-bold">
          {city ? `по твоему городу: ${city}` : 'город не указан — по умолчанию'}
        </p>
        <p className="font-serif text-cream text-xl font-bold mt-1">{district.name_ru}</p>
        <p className="font-serif text-cream/70 text-xs mt-2 leading-relaxed">
          {Array.isArray(district.regions_ru) ? district.regions_ru.join(', ') : district.regions_ru}
        </p>
        <a
          href={district.website}
          target="_blank"
          rel="noreferrer"
          className="font-serif text-gold text-xs underline mt-2 inline-block"
        >
          {district.website.replace('https://', '')} ↗
        </a>
        <div className="bg-cream/10 rounded-xl px-3 py-2 mt-3">
          <p className="font-serif text-cream/80 text-xs leading-relaxed">
            Операторы: {operators.moscow} · {operators.regions}
          </p>
          <p className="font-serif text-cream/50 text-[11px] mt-1 leading-relaxed">{operators.note_ru}</p>
        </div>
        <p className="font-serif text-gold/70 text-[10px] mt-3 font-bold">
          Распределение округов меняется — проверь на официальном сайте перед подачей
        </p>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">О визе</h3>

      <div className="px-6 flex flex-col gap-3">

        {/* Шаги получения визы — тот же паттерн, что «Шаги поступления» в
            Университете: без рамки-«кнопки», просто кликабельный заголовок,
            свёрнуто по умолчанию. */}
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

          {stepsOpen && (
            <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-3">
              <p className="font-serif text-gold text-sm text-center italic">
                {visa.action_steps_ru.audience_note_ru}
              </p>

              {visa.action_steps_ru.steps.map((step, idx) => {
                const stepId = `visa-action-${idx}`;
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
                    {idx === 6 && (
                      <button
                        onClick={() => navigate('/path/travel/permesso')}
                        className="mt-3 flex items-center gap-1.5 font-serif text-gold text-sm"
                      >
                        <span>Подробнее про permesso и следующие шаги — в разделе «Переезд»</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>

                  {/* Доп. инфо между шагом 3 и 4 — ссылка на подробный сбор документов */}
                  {idx === 2 && (
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
                {visa.action_steps_ru.disclaimer_ru}
              </p>
            </div>
          )}
        </div>

        {/* Остальное — компактная сетка мелких плиток, как в Университете */}
        <p className="font-serif text-gold text-sm font-bold mt-2">Подробнее о:</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          {gridButtons.map((b, i) => (
            <GridButton key={b.to} {...b} wide={gridButtons.length % 2 === 1 && i === gridButtons.length - 1} />
          ))}
        </div>
      </div>

      {/* После приезда */}
      <div className="mx-6 mt-5 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-2 font-bold">{visa.permesso_di_soggiorno_ru.title_ru}</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{visa.intro_ru.after_arrival_ru}</p>
        <p className="font-serif text-navy/50 text-xs italic mt-2">{visa.permesso_di_soggiorno_ru.note_ru}</p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {visa.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
