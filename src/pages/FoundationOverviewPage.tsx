import { useState } from 'react';
import { useTrackSection } from '../hooks/useTrackSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Euro, Languages, BookOpen } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { GridButton } from '../components/GridButton';
import { useFoundation, useMyLegalization } from '../hooks/useFoundation';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';
import { LoadingScreen } from '../components/Loader';
import { Collapse } from '../components/Collapse';

const CHECKS_KEY = 'cispr_foundation_checks';

export default function FoundationOverviewPage() {
  useTrackSection('uni');
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error } = useFoundation();
  const { legalization } = useMyLegalization();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  // Если вернулись сюда со страницы, открытой по ссылке из шага (например,
  // «Языковой сертификат →»), снова разворачиваем «Шаги поступления» —
  // иначе после перехода назад юзер попадает на свёрнутую страницу.
  const [stepsOpen, setStepsOpen] = useState(() => Boolean((location.state as { openSteps?: boolean } | null)?.openSteps));
  const [copied, setCopied] = useState(false);
  // Долгий тап по карточке шага «Шаги поступления» → добавить свой расход
  const [expenseFor, setExpenseFor] = useState<string | null>(null);
  const [checks, setChecks] = useState<string[]>(() => {
    const raw = localStorage.getItem(CHECKS_KEY);
    return raw ? JSON.parse(raw) : [];
  });

  function toggleCheck(id: string) {
    setChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }
  const isChecked = (id: string) => checks.includes(id);

  // Общая галочка шага (справа сверху блока) — отмечает/снимает сразу все
  // пункты чек-листа этого шага одним нажатием, а не просто «шаг выполнен».
  function toggleStepAll(mainId: string, itemIds: string[]) {
    const nowChecked = !isChecked(mainId);
    setChecks((prev) => {
      const allIds = [mainId, ...itemIds];
      const next = nowChecked
        ? [...prev.filter((x) => !allIds.includes(x)), ...allIds]
        : prev.filter((x) => !allIds.includes(x));
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) {
    return (
      <LoadingScreen className="bg-cream" />
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">
          Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.
        </p>
      </div>
    );
  }

  const p = data.program;
  const c = data.costs;
  const emailTemplate = data.email_templates['fy_application_email'];

  function copyEmail() {
    if (!emailTemplate) return;
    const text = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body_en}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }

  // Круглый чекбокс в стиле раздела «Виза»
  const CheckBox = ({ id }: { id: string }) => (
    <button onClick={() => toggleCheck(id)} className="w-6 h-6 mt-0.5 flex-shrink-0">
      {isChecked(id) ? (
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
      )}
    </button>
  );

  // Общая примерная смета: курс + документы/тест на этапе подачи + легализация
  // диплома (если известна страна) — суммируем всё в одну цифру. Нижняя
  // граница тоже считается по полной стоимости курса (tuition_full) — скидка
  // Dante не гарантирована каждому, так что не занижаем ей стартовую цифру.
  const am = data.apply_meta;
  const totalMinEur =
    c.tuition_full + am.apply_extra_cost_min_eur + (legalization?.total_cost_estimate.documents_only_min_eur ?? 0);
  const totalMaxEur =
    c.tuition_full + am.apply_extra_cost_max_eur + (legalization?.total_cost_estimate.documents_only_max_eur ?? 0);

  const gridButtons = [
    { icon: GraduationCap, title: 'Программа', to: '/path/foundation/structure', seed: 1 },
    {
      icon: Euro, title: 'Оплата', to: '/path/expenses', seed: 2,
      // Долгий тап по «Оплате» — добавить свой расход (раньше было на карточках шагов)
      onLongPress: () => setExpenseFor('Расход'),
    },
    { icon: Languages, title: 'Языки', to: '/path/foundation/languages', seed: 3 },
    { icon: BookOpen, title: 'Диплом', to: '/path/uni/program/diploma', seed: 4 },
  ];

  return (
    <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-28 md:pb-12">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">Foundation Year</h1>
        <p className="font-serif text-gold text-base mt-1 italic">{p.name_full}</p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          {p.duration_months} мес · {p.period}
        </p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Важно: FY ≠ университет — просто длинный синий блок, без декора */}
      <div className="mx-6 mt-6 bg-navy rounded-2xl p-5">
        <p className="font-serif text-cream text-base leading-relaxed">{p.important_note_ru}</p>
      </div>

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Об универе
      </h3>

      <div className="px-6 flex flex-col gap-3">

        {/* Шаги поступления — единственный раздел прямо на странице. Можно
            свернуть/развернуть, но без рамки-«кнопки» — просто заголовок,
            кликабельный, контент течёт дальше как обычный текст страницы. */}
        <div>
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="w-full flex items-center gap-3 text-left py-1
                       md:py-4 md:px-6 md:rounded-2xl md:border md:border-navy/15 md:bg-soft-cream/60
                       md:transition-colors md:hover:border-navy/25 md:hover:bg-soft-cream"
          >
            <div className="flex-1 text-center md:pl-7">
              <h4 className="font-serif text-navy text-2xl font-bold">Шаги поступления</h4>
              {!stepsOpen && (
                <p className="font-serif text-gold text-sm mt-1 font-bold">Документы, апостиль, заявка, сроки</p>
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
              <p className="font-serif text-gold text-base text-center italic">
                ~ Приём {data.apply_meta.target_year_ru} ~
              </p>

              <div className="bg-navy rounded-xl px-4 py-3">
                <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">
                  Итого ориентировочно
                </p>
                <p className="font-serif text-cream text-2xl font-bold mt-1">
                  {fmt(totalMinEur)} – {fmt(totalMaxEur)}
                </p>
                <p className="font-serif text-cream/70 text-xs mt-1 leading-relaxed">
                  Курс + документы/языковой тест{legalization ? ' + легализация диплома' : ''}.
                  {!legalization && ' Выбери страну в профиле, чтобы учесть и легализацию диплома.'}
                </p>
              </div>

              {data.steps_to_apply.map((step, idx) => {
                const mainId = `apply-${step.id}`;
                const itemIds = (step.checklist || []).map((_, i) => `${mainId}-item-${i}`);
                const stepTemplate = step.email_template_id ? data.email_templates[step.email_template_id] : null;
                return (
                  <div key={step.id} className={idx === 0 ? '' : 'pt-4 border-t border-navy/10'}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">Шаг {idx}</p>
                      <button onClick={() => toggleStepAll(mainId, itemIds)} className="w-6 h-6 flex-shrink-0">
                        {isChecked(mainId) ? (
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
                        )}
                      </button>
                    </div>
                    <h5 className="font-serif text-navy text-lg font-bold mt-1">{step.title}</h5>

                    {step.warning_ru && (
                      <div className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2 mt-2">
                        <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
                        <p className="font-serif text-navy/80 text-sm">{step.warning_ru}</p>
                      </div>
                    )}

                    {step.description_ru && (
                      <p className="font-serif text-navy/80 text-base mt-2 leading-relaxed">{step.description_ru}</p>
                    )}

                    {stepTemplate && (
                      <div className="bg-navy rounded-xl p-4 mt-3">
                        <p className="font-serif text-gold text-xs mb-1 font-bold">Subject</p>
                        <p className="font-serif text-cream text-sm mb-3">{stepTemplate.subject}</p>
                        <p className="font-serif text-gold text-xs mb-1 font-bold">Body</p>
                        <pre className="font-serif text-cream/90 text-xs whitespace-pre-wrap leading-relaxed">
{stepTemplate.body_en}
                        </pre>
                        <button
                          onClick={copyEmail}
                          className="w-full mt-3 font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
                        >
                          {copied ? 'Скопировано ✓' : 'Скопировать письмо'}
                        </button>
                      </div>
                    )}

                    {step.checklist && (
                      <div className="flex flex-col gap-2 mt-3">
                        {step.checklist.map((item, i) => {
                          const cid = `${mainId}-item-${i}`;
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <CheckBox id={cid} />
                              <p className={
                                'font-serif text-base flex-1 ' +
                                (isChecked(cid) ? 'text-navy/50 line-through' : 'text-navy/80')
                              }>
                                {item.text}
                                {item.link_to && (
                                  <button
                                    onClick={() => navigate(item.link_to!, { state: { openSteps: true } })}
                                    className="ml-2 font-serif text-gold text-sm no-underline"
                                  >
                                    {item.link_label || '→'}
                                  </button>
                                )}
                              </p>
                            </div>
                          );
                        })}
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

              <div className="mt-1">
                <p className="font-serif text-gold text-sm mb-1.5 font-bold">Частые ошибки</p>
                <div className="flex flex-col gap-1.5">
                  {data.common_pitfalls_ru.map((pitfall, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5 text-sm">◆</span>
                      <p className="font-serif text-navy/80 text-sm">{pitfall}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </Collapse>
        </div>

        {/* Остальное — компактная сетка мелких плиток вместо длинных строк */}
        <p className="font-serif text-gold text-sm font-bold mt-2">Подробнее о:</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 md:flex md:flex-wrap md:justify-center">
          {gridButtons.map((b, i) => (
            <GridButton key={b.to} {...b} wide={gridButtons.length % 2 === 1 && i === gridButtons.length - 1} />
          ))}
        </div>
      </div>

      {/* Контакты */}
      <div className="mx-6 mt-6">
        <p className="font-serif text-navy/60 text-xs">
          Офиц. сайт:{' '}
          <a href={p.official_url} target="_blank" rel="noreferrer" className="text-gold underline">
            {p.official_url.replace('https://', '')}
          </a>
        </p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          Почта:{' '}
          <a href={`mailto:${p.official_email}`} className="text-gold underline">
            {p.official_email}
          </a>
        </p>
        <p className="font-serif text-navy/40 text-[11px] italic mt-3">
          Данные: {data.meta.source} · уч. год {data.meta.academic_year}
        </p>
      </div>

      {expenseFor && (
        <AddExpenseSheet
          defaultCategory="uni"
          defaultLabel={expenseFor}
          onClose={() => setExpenseFor(null)}
        />
      )}

      <TabBar active="path" />
    </div>
  );
}
