import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TabBar from '../components/TabBar';
import iconTime from '../assets/time sign.svg';

const sectionsData: Record<string, any> = {
  uni: {
    title: 'Университет',
    subtitle: 'Программа не выбрана',
    meta: 'non-EU · laurea · 2026/27',
    budget: { total: 2000 },
    stepsTitle: 'Шаги поступления',
    steps: [
      { num: 1, title: 'Выбор программы', sub: 'Выбор программы · €0', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 2, title: 'Проверка учебной базы', sub: 'Языки, профильные предметы · €0', deadline: '14 дней', price: '€0', substeps: [] },
      // Цены и порядок — из public/data/costs_seed.json (countries.ru.documents).
      // Апостиль ИДЁТ ПЕРВЫМ: перевод без штампа придётся переделывать. Перевод
      // (€60) — за комплект «аттестат + приложение», приложение и есть транскрипт.
      { num: 3, title: 'Документы и легализация', sub: '€400–550', deadline: '14 дней', price: '€400–550', substeps: [
        { title: 'Апостиль на аттестат', price: '€140' },
        { title: 'Перевод аттестата на итальянский', price: '€60' },
        { title: 'Сделать CIMEA или Dichiarazione di valore', price: '€75–150' },
        { title: 'Сертификат итальянского B2', price: '€120–200' },
      ]},
      { num: 4, title: 'Регистрация интереса', sub: 'Let\'s keep in touch · €0', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Входной тест', sub: 'Test di ingresso · €0', deadline: 'до 30 апр', price: '€0', substeps: [] },
      { num: 6, title: 'Учётка и пакет документов', sub: 'Step 1–2 · €0', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 7, title: 'Подача заявки в UniPR', sub: 'Apply for Admission · €0–20', deadline: 'до 15 июл', price: '€20', substeps: [] },
      { num: 8, title: 'Pre-enrolment Esse3', sub: 'Первая rata · €156', deadline: '7 дней', price: '€156', substeps: [] },
      { num: 9, title: 'Acceptance Letter', sub: '→ Раздел Виза · €0', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },

  visa: {
    title: 'Виза',
    subtitle: 'Visto nazionale tipo D',
    meta: 'студенческая · РФ · 2026',
    budget: { total: 600 },
    stepsTitle: 'Этапы получения визы',
    steps: [
      { num: 1, title: 'Понять свою схему', sub: 'Консульство, визовый центр · €0', deadline: '3 дня', price: '€0', substeps: [
        { title: 'Определить консульский округ', price: '€0' },
        { title: 'Выбрать визовый центр (VMS / Almaviva)', price: '€0' },
        { title: 'Проверить что виза подходит — национальная тип D', price: '€0' },
      ]},
      { num: 2, title: 'Завершить поступление', sub: 'Acceptance letter · €0', deadline: 'актуально', price: '€340', substeps: [
        { title: 'Получить официальное письмо о зачислении', price: '€0' },
        { title: 'Апостиль на аттестат', price: '€20–50' },
        { title: 'Перевод документов об образовании', price: '€150–250' },
        { title: 'Dichiarazione di Valore (по запросу вуза)', price: '€30–60' },
      ]},
      { num: 3, title: 'Регистрация на Universitaly', sub: 'Pre-enrolment · €0', deadline: '7 дней', price: '€0', substeps: [
        { title: 'Создать аккаунт на Universitaly', price: '€0' },
        { title: 'Заполнить заявку pre-enrolment', price: '€0' },
        { title: 'Распечатать подтверждение заявки', price: '€0' },
      ]},
      { num: 4, title: 'Подготовка документов', sub: 'Пакет для визы · €50–100', deadline: '14 дней', price: '€80', substeps: [
        { title: 'Загранпаспорт (срок +3 мес после курса)', price: '€0' },
        { title: 'Копии страниц загранпаспорта', price: '€0' },
        { title: 'Внутренний паспорт РФ + копии', price: '€0' },
        { title: 'Анкета национальной визы тип D', price: '€0' },
        { title: 'Фото 35×45 мм, 1–4 шт.', price: '€10–20' },
        { title: 'Бронь авиабилетов или план поездки', price: '€0–50' },
      ]},
      { num: 5, title: 'Финансы и страховка', sub: 'Подтверждение средств · €150–300', deadline: '14 дней', price: '€225', substeps: [
        { title: 'Выписка из банка (на год проживания)', price: '€0' },
        { title: 'Спонсорское письмо', price: '€0' },
        { title: 'Медицинская страховка на год', price: '€150–300' },
      ]},
      { num: 6, title: 'Подача в визовый центр', sub: 'Запись + сборы · ~€110', deadline: 'актуально', price: '€110', substeps: [
        { title: 'Запись на VMS/Almaviva', price: '€0' },
        { title: 'Консульский сбор', price: '~€90' },
        { title: 'Сервисный сбор', price: '~€20' },
        { title: 'Прийти в назначенный день, сдать биометрию', price: '€0' },
      ]},
      { num: 7, title: 'Ожидание и получение визы', sub: '4–7 рабочих дней · €0', deadline: '7 дней', price: '€0', substeps: [
        { title: 'Отслеживать статус заявки', price: '€0' },
        { title: 'Забрать паспорт с визой', price: '€0' },
      ]},
      { num: 8, title: 'После въезда в Италию', sub: '→ Раздел Переезд · €50–70', deadline: 'актуально', price: '€60', substeps: [
        { title: 'Заполнить kit на permesso (8 дней)', price: '€50–70' },
        { title: 'Сдать конверт на почте', price: '€0' },
        { title: 'Прийти в questura — фото и отпечатки', price: '€0' },
        { title: 'Забрать карту permesso di soggiorno', price: '€0' },
      ]},
    ],
  },

  travel: {
    title: 'Переезд',
    subtitle: 'Прибытие и обустройство',
    meta: 'первые недели в Парме',
    budget: { total: 1700 },
    stepsTitle: 'Шаги переезда',
    steps: [
      { num: 1, title: 'Билеты в Италию', sub: '€100–900', deadline: 'актуально', price: '€500', substeps: [] },
      { num: 2, title: 'Поиск жилья в Парме', sub: 'Комната или общежитие · €300–600/мес', deadline: 'актуально', price: '€450', substeps: [] },
      { num: 3, title: 'Первый месяц + депозит', sub: '€1200–1700', deadline: '14 дней', price: '€1450', substeps: [] },
      { num: 4, title: 'Codice fiscale', sub: 'Налоговый номер · €0', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Permesso di soggiorno', sub: 'Вид на жительство · €50–70', deadline: '8 дней', price: '€60', substeps: [] },
      { num: 6, title: 'Банковский счёт', sub: 'Или итальянская карта · €0', deadline: '14 дней', price: '€0', substeps: [] },
    ],
  },

  parma: {
    title: 'В Парме',
    subtitle: 'Жизнь, учёба, работа',
    meta: 'когда уже на месте',
    budget: { total: 3000 },
    stepsTitle: 'Что важно',
    steps: [
      { num: 1, title: 'Медицина', sub: 'SSN, врач, страховка студента', deadline: 'актуально', price: '€150', substeps: [] },
      { num: 2, title: 'Транспорт', sub: 'Карта tep, велосипед', deadline: '7 дней', price: '€100', substeps: [] },
      { num: 3, title: 'Стипендия ER.GO', sub: 'Заявка осенью', deadline: 'до сентября', price: '€0', substeps: [] },
      { num: 4, title: 'Подработка', sub: 'До 20 часов в неделю по визе', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 5, title: 'Социальная жизнь', sub: 'ESN, события, комьюнити', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 6, title: 'Когда тяжело', sub: 'UniPR Counseling, поддержка', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },
};

// парсер цены: '€200' → 200, '€100–200' → 150 (среднее), '~€170' → 170, '€0' → 0
function parsePrice(price: string): number {
  const cleaned = price.replace(/[€~\s]/g, '');
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const [a, b] = cleaned.split(/[–-]/).map(Number);
    return Math.round((a + b) / 2);
  }
  return parseInt(cleaned) || 0;
}

function getItemId(section: string, stepNum: number, subIndex: number | null = null): string {
  return subIndex === null
    ? `${section}-step-${stepNum}`
    : `${section}-step-${stepNum}-sub-${subIndex}`;
}

function loadCompleted(section: string): string[] {
  const raw = localStorage.getItem(`cispr_done_${section}`);
  return raw ? JSON.parse(raw) : [];
}

export default function SectionPage() {
  const navigate = useNavigate();
  const { section } = useParams();
  const sectionKey = section || 'uni';
  const data = sectionsData[sectionKey];

  // Раздел «Университет» ветвится по cispr_program:
  //   foundation → /path/foundation
  //   laurea / magistrale → /path/uni/program (новый гайд поступления)
  //   иначе → показываем текущую SectionPage (старый плейсхолдер)
  const programType = localStorage.getItem('cispr_program');
  useEffect(() => {
    if (sectionKey !== 'uni') return;
    if (programType === 'foundation') navigate('/path/foundation', { replace: true });
    else if (programType === 'bachelor' || programType === 'master') navigate('/path/uni/program', { replace: true });
  }, [programType, sectionKey, navigate]);

  const [completed, setCompleted] = useState<string[]>(() => loadCompleted(sectionKey));

  // Реальная выбранная программа (из онбординга/настроек) подменяет placeholder
  // в шапке раздела «Университет» и в подзаголовке шага «Выбор программы».
  const selectedCourseName = localStorage.getItem('cispr_course_name') || '';
  const headerSubtitle =
    sectionKey === 'uni' && selectedCourseName ? selectedCourseName : data.subtitle;

  const passedQuiz = localStorage.getItem('cispr_passed_quiz') || 'uni';
  const sectionsOrder = ['uni', 'visa', 'travel', 'parma'];
  const passedIndex = sectionsOrder.indexOf(passedQuiz);
  const sectionIndex = sectionsOrder.indexOf(sectionKey);
  const isCompletedSection = sectionIndex < passedIndex;

  const currentStepRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(0);

  function isItemDone(stepNum: number, subIndex: number | null = null): boolean {
    if (isCompletedSection) return true;
    return completed.includes(getItemId(sectionKey, stepNum, subIndex));
  }

  // прогресс по пунктам
  function calculateProgress(): number {
    if (isCompletedSection) return 100;
    let total = 0, done = 0;
    data.steps.forEach((step: any) => {
      if (step.substeps.length === 0) {
        total += 1;
        if (isItemDone(step.num)) done += 1;
      } else {
        step.substeps.forEach((_: any, i: number) => {
          total += 1;
          if (isItemDone(step.num, i)) done += 1;
        });
      }
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }

  // потраченный бюджет
  function calculateSpent(): number {
    if (isCompletedSection) return data.budget.total;
    let spent = 0;
    data.steps.forEach((step: any) => {
      if (step.substeps.length === 0) {
        if (isItemDone(step.num)) spent += parsePrice(step.price);
      } else {
        step.substeps.forEach((sub: any, i: number) => {
          if (isItemDone(step.num, i)) spent += parsePrice(sub.price);
        });
      }
    });
    return spent;
  }

  const progress = calculateProgress();
  const spent = calculateSpent();

  function getFirstIncompleteStep(): any {
    if (isCompletedSection) return null;
    for (const step of data.steps) {
      if (step.substeps.length === 0) {
        if (!isItemDone(step.num)) return step;
      } else {
        const allSubsDone = step.substeps.every((_: any, i: number) => isItemDone(step.num, i));
        if (!allSubsDone) return step;
      }
    }
    return null;
  }

  const currentStep = getFirstIncompleteStep();
  const currentStepNum = currentStep?.num || 0;

  useEffect(() => {
    if (!isCompletedSection && currentStepRef.current) {
      currentStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [section]);

  function toggleItem(itemId: string) {
    if (isCompletedSection) return;
    const newCompleted = completed.includes(itemId)
      ? completed.filter((id) => id !== itemId)
      : [...completed, itemId];
    setCompleted(newCompleted);
    localStorage.setItem(`cispr_done_${sectionKey}`, JSON.stringify(newCompleted));
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy">Раздел не найден</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col pb-28 md:pb-12">

      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-center">
          <h1 className="font-serif text-navy text-3xl font-bold">{data.title}</h1>
          <p className="font-serif text-gold text-base mt-1 font-bold">{headerSubtitle}</p>
          <p className="font-serif text-navy/60 text-xs mt-1">{data.meta}</p>
        </div>

        <div className="mt-5">
          <p className="font-serif text-navy text-base mb-2">Прогресс</p>
          <div className="h-1.5 rounded-full bg-navy/15 overflow-hidden">
            <div
              className="h-full bg-navy rounded-full transition-all duration-500"
              style={{ width: progress + '%' }}
            />
          </div>
          <p className="font-serif text-navy/60 text-xs italic mt-1">{progress}%</p>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-baseline">
            <p className="font-serif text-navy text-base">Бюджет раздела</p>
            <p className="font-serif text-navy/60 text-xs italic">
              €{spent} из €{data.budget.total}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-navy/15 overflow-hidden mt-2">
            <div
              className="h-full bg-navy rounded-full transition-all duration-500"
              style={{ width: Math.min(100, Math.round((spent / data.budget.total) * 100)) + '%' }}
            />
          </div>
        </div>
      </div>

      {/* Сейчас важно — берёт текущий невыполненный шаг */}
      {currentStep && (
        <>
          <h3 className="font-serif text-gold text-base font-bold px-6 mt-8 mb-3">
            Сейчас важно
          </h3>

          <div className="mx-6 relative bg-navy rounded-2xl p-5">
            <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

            <div className="flex justify-between items-start">
              <p className="font-serif text-gold text-sm font-bold">Шаг {currentStep.num}</p>
              <p className="font-serif text-gold text-sm">{currentStep.price}</p>
            </div>

            <h4 className="font-serif text-cream text-xl mt-6 mb-5 px-2">
              {currentStep.title}
            </h4>

            <div className="flex items-center gap-2">
              <img src={iconTime} alt="" className="w-4 h-4" />
              <p className="font-serif text-gold text-sm">{currentStep.deadline}</p>
            </div>
          </div>
        </>
      )}

      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        {data.stepsTitle}
      </h3>

      <div className="px-6 flex flex-col gap-3">
        {data.steps.map((step: any) => {
          const isExpanded = expanded === step.num;
          const isCurrent = step.num === currentStepNum;
          const hasSubsteps = step.substeps.length > 0;

          const isStepDone = hasSubsteps
            ? step.substeps.every((_: any, i: number) => isItemDone(step.num, i))
            : isItemDone(step.num);

          return (
            <div
              key={step.num}
              ref={isCurrent ? currentStepRef : null}
              className={
                'rounded-2xl border p-4 ' +
                (isExpanded && !isStepDone ? 'bg-soft-cream border-gold border-2' : 'bg-soft-cream border-navy/20')
              }
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => {
                    if (hasSubsteps) {
                      if (isStepDone) {
                        step.substeps.forEach((_: any, i: number) => {
                          if (isItemDone(step.num, i)) toggleItem(getItemId(sectionKey, step.num, i));
                        });
                      } else {
                        step.substeps.forEach((_: any, i: number) => {
                          if (!isItemDone(step.num, i)) toggleItem(getItemId(sectionKey, step.num, i));
                        });
                      }
                    } else {
                      toggleItem(getItemId(sectionKey, step.num));
                    }
                  }}
                  className="w-6 h-6 mt-1 flex-shrink-0"
                >
                  {isStepDone ? (
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">
                      ✓
                    </div>
                  ) : (
                    <div className={
                      'w-6 h-6 rounded-full border-2 ' +
                      (isCurrent ? 'border-gold' : 'border-navy/30')
                    } />
                  )}
                </button>

                <button
                  onClick={() => setExpanded(isExpanded ? 0 : step.num)}
                  className="flex-1 text-left"
                >
                  <p className="font-serif text-gold text-sm font-bold">Шаг {step.num}</p>
                  <h4 className={
                    'font-serif text-lg font-bold ' +
                    (isStepDone ? 'text-navy/60 line-through' : 'text-navy')
                  }>
                    {step.title}
                  </h4>
                  <p className="font-serif text-gold text-xs mt-0.5 font-bold">
                    {sectionKey === 'uni' && step.num === 1 && selectedCourseName
                      ? `${selectedCourseName} · €0`
                      : step.sub}
                  </p>
                </button>

                {/* синий треугольник раскрытия */}
                <button
                  onClick={() => setExpanded(isExpanded ? 0 : step.num)}
                  className="text-navy mt-1 flex-shrink-0"
                  aria-label="Развернуть"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    className={'transition-transform ' + (isExpanded ? 'rotate-180' : '')}
                    fill="currentColor"
                  >
                    <path d="M7 10L1 4h12L7 10z" />
                  </svg>
                </button>
              </div>

              {/* Раскрытое содержимое */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-navy/10">
                  {hasSubsteps ? (
                    <div className="flex flex-col gap-3">
                      {step.substeps.map((sub: any, i: number) => {
                        const subDone = isItemDone(step.num, i);
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItem(getItemId(sectionKey, step.num, i))}
                              className="w-5 h-5 mt-0.5 flex-shrink-0"
                            >
                              {subDone ? (
                                <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-cream text-[10px]">
                                  ✓
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-navy/30" />
                              )}
                            </button>
                            <div className="flex-1 flex justify-between items-baseline">
                              <p className={
                                'font-serif text-sm ' +
                                (subDone ? 'text-navy/50 line-through' : 'text-navy')
                              }>
                                {sub.title}
                              </p>
                              <p className="font-serif text-navy/60 text-xs ml-2 flex-shrink-0">
                                {sub.price}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : sectionKey === 'parma' && step.num === 3 ? (
                    <div className="flex flex-col gap-3">
                      <p className="font-serif text-navy/70 text-sm">
                        Рассчитай сумму стипендии ER.GO под свой профиль и посмотри дедлайны.
                      </p>
                      <button
                        onClick={() => navigate('/scholarship')}
                        className="font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
                      >
                        Открыть стипендию ER.GO
                      </button>
                      <div className="border-t border-navy/10 pt-3">
                        <p className="font-serif text-navy/60 text-xs italic mb-2">
                          Для ER.GO нужен ISEE parificato — вот как его собрать:
                        </p>
                        <button
                          onClick={() => navigate('/path/parma/isee')}
                          className="w-full font-serif text-cream bg-navy rounded-xl py-3 text-sm"
                        >
                          Документы для ISEE parificato →
                        </button>
                      </div>
                    </div>
                  ) : sectionKey === 'uni' && step.num === 1 ? (
                    (() => {
                      const courseId = localStorage.getItem('cispr_course_id');
                      const courseName = localStorage.getItem('cispr_course_name');
                      return courseId ? (
                        <div className="flex flex-col gap-3">
                          <p className="font-serif text-gold text-xs font-bold">
                            Твоя программа
                          </p>
                          <div className="bg-cream border border-navy/20 rounded-2xl px-4 py-3">
                            <p className="font-serif text-navy text-base font-bold leading-snug">
                              {courseName || 'Программа выбрана'}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate('/course/' + courseId)}
                            className="font-serif text-cream bg-navy rounded-full py-2.5 text-sm"
                          >
                            Открыть программу
                          </button>
                          <p className="font-serif text-navy/50 text-xs italic">
                            Поменять курс можно в Настройках.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <p className="font-serif text-navy/70 text-sm">
                            Подбери и открой свою программу из каталога UniPR.
                          </p>
                          <button
                            onClick={() => navigate('/choice-program')}
                            className="font-serif text-cream bg-navy rounded-full py-2.5 text-sm"
                          >
                            Выбрать программу
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="font-serif text-navy/50 text-sm italic">
                      Здесь будут расписаны подробные действия по этому шагу
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TabBar active="path" />

    </div>
  );
}