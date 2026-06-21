import { useNavigate } from 'react-router-dom';
import iconUni from '../assets/iconUni.svg';
import iconVisa from '../assets/iconVisa.svg';
import iconTravel from '../assets/iconTravel.svg';
import iconInParma from '../assets/iconInParma.svg';
import TabBar from '../components/TabBar';
import { NewsWidget } from '../components/NewsWidget';
import { useUniCosts } from '../hooks/useCosts';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from '../hooks/useCurrency';
import { COUNTRY_CURRENCY_MAP } from '../config/currencies';

// ВНИМАНИЕ: это та же структура что в SectionPage — должна совпадать
// (в будущем вынесем в один файл, пока дублируется)
const sectionsData: Record<string, any> = {
  uni: {
    title: 'УНИВЕР',
    titleFull: 'Университет',
    icon: iconUni,
    budget: 2000,
    steps: [
      { num: 1, title: 'Выбор программы', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 2, title: 'Проверка учебной базы', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 3, title: 'Документы и легализация', deadline: '14 дней', price: '~€170', substeps: [
        { title: 'Перевод аттестата', price: '€200' },
        { title: 'Апостиль', price: '€150' },
        { title: 'CIMEA', price: '~€170' },
        { title: 'Транскрипт', price: '~€60' },
        { title: 'Сертификат B2', price: '€100–200' },
      ]},
      { num: 4, title: 'Регистрация интереса', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Входной тест', deadline: 'до 30 апр', price: '€0', substeps: [] },
      { num: 6, title: 'Учётка и пакет документов', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 7, title: 'Подача заявки в UniPR', deadline: 'до 15 июл', price: '€20', substeps: [] },
      { num: 8, title: 'Pre-enrolment Esse3', deadline: '7 дней', price: '€156', substeps: [] },
      { num: 9, title: 'Acceptance Letter', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },
  visa: {
    title: 'ВИЗА',
    titleFull: 'Виза',
    icon: iconVisa,
    budget: 600,
    steps: [
      { num: 1, title: 'Понять свою схему', deadline: '3 дня', price: '€0', substeps: [
        { title: 'Консульский округ', price: '€0' },
        { title: 'Визовый центр', price: '€0' },
        { title: 'Тип D', price: '€0' },
      ]},
      { num: 2, title: 'Завершить поступление', deadline: 'актуально', price: '€340', substeps: [
        { title: 'Письмо о зачислении', price: '€0' },
        { title: 'Апостиль', price: '€20–50' },
        { title: 'Перевод', price: '€150–250' },
        { title: 'Dichiarazione', price: '€30–60' },
      ]},
      { num: 3, title: 'Universitaly', deadline: '7 дней', price: '€0', substeps: [
        { title: 'Аккаунт', price: '€0' },
        { title: 'Заявка', price: '€0' },
        { title: 'Подтверждение', price: '€0' },
      ]},
      { num: 4, title: 'Подготовка документов', deadline: '14 дней', price: '€80', substeps: [
        { title: 'Загранпаспорт', price: '€0' },
        { title: 'Копии', price: '€0' },
        { title: 'Паспорт РФ', price: '€0' },
        { title: 'Анкета', price: '€0' },
        { title: 'Фото', price: '€10–20' },
        { title: 'Бронь', price: '€0–50' },
      ]},
      { num: 5, title: 'Финансы и страховка', deadline: '14 дней', price: '€225', substeps: [
        { title: 'Выписка', price: '€0' },
        { title: 'Спонсорское', price: '€0' },
        { title: 'Страховка', price: '€150–300' },
      ]},
      { num: 6, title: 'Подача в визовый центр', deadline: 'актуально', price: '€110', substeps: [
        { title: 'Запись', price: '€0' },
        { title: 'Консульский сбор', price: '~€90' },
        { title: 'Сервисный сбор', price: '~€20' },
        { title: 'Биометрия', price: '€0' },
      ]},
      { num: 7, title: 'Ожидание визы', deadline: '7 дней', price: '€0', substeps: [
        { title: 'Статус', price: '€0' },
        { title: 'Забрать паспорт', price: '€0' },
      ]},
      { num: 8, title: 'После въезда', deadline: 'актуально', price: '€60', substeps: [
        { title: 'Kit permesso', price: '€50–70' },
        { title: 'Конверт', price: '€0' },
        { title: 'Questura', price: '€0' },
        { title: 'Карта permesso', price: '€0' },
      ]},
    ],
  },
  travel: {
    title: 'ПЕРЕЕЗД',
    titleFull: 'Переезд',
    icon: iconTravel,
    budget: 1700,
    steps: [
      { num: 1, title: 'Билеты в Италию', deadline: 'актуально', price: '€500', substeps: [] },
      { num: 2, title: 'Поиск жилья', deadline: 'актуально', price: '€450', substeps: [] },
      { num: 3, title: 'Первый месяц + депозит', deadline: '14 дней', price: '€1450', substeps: [] },
      { num: 4, title: 'Codice fiscale', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Permesso di soggiorno', deadline: '8 дней', price: '€60', substeps: [] },
      { num: 6, title: 'Банковский счёт', deadline: '14 дней', price: '€0', substeps: [] },
    ],
  },
  parma: {
    title: 'В ПАРМЕ',
    titleFull: 'В Парме',
    icon: iconInParma,
    budget: 3000,
    steps: [
      { num: 1, title: 'Медицина', deadline: 'актуально', price: '€150', substeps: [] },
      { num: 2, title: 'Транспорт', deadline: '7 дней', price: '€100', substeps: [] },
      { num: 3, title: 'Стипендия ER.GO', deadline: 'до сентября', price: '€0', substeps: [] },
      { num: 4, title: 'Подработка', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 5, title: 'Социальная жизнь', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 6, title: 'Когда тяжело', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },
};

function getItemId(section: string, stepNum: number, subIndex: number | null = null): string {
  return subIndex === null
    ? `${section}-step-${stepNum}`
    : `${section}-step-${stepNum}-sub-${subIndex}`;
}

// '€200' → 200, '€100–200' → 150, '~€170' → 170, '€0' → 0
function parsePrice(price: string): number {
  const cleaned = price.replace(/[€~\s]/g, '');
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const [a, b] = cleaned.split(/[–-]/).map(Number);
    return Math.round((a + b) / 2);
  }
  return parseInt(cleaned) || 0;
}

function getSectionSpent(sectionKey: string, isCompletedSection: boolean): number {
  const data = sectionsData[sectionKey];
  if (isCompletedSection) return data.budget;
  const completed = loadCompleted(sectionKey);
  let spent = 0;
  data.steps.forEach((step: any) => {
    if (step.substeps.length === 0) {
      if (completed.includes(getItemId(sectionKey, step.num))) spent += parsePrice(step.price);
    } else {
      step.substeps.forEach((sub: any, i: number) => {
        if (completed.includes(getItemId(sectionKey, step.num, i))) spent += parsePrice(sub.price);
      });
    }
  });
  return spent;
}

function loadCompleted(section: string): string[] {
  const raw = localStorage.getItem(`cispr_done_${section}`);
  return raw ? JSON.parse(raw) : [];
}

// прогресс раздела в процентах
function getSectionProgress(sectionKey: string, isCompletedSection: boolean): number {
  if (isCompletedSection) return 100;
  const completed = loadCompleted(sectionKey);
  const data = sectionsData[sectionKey];
  let total = 0, done = 0;
  data.steps.forEach((step: any) => {
    if (step.substeps.length === 0) {
      total += 1;
      if (completed.includes(getItemId(sectionKey, step.num))) done += 1;
    } else {
      step.substeps.forEach((_: any, i: number) => {
        total += 1;
        if (completed.includes(getItemId(sectionKey, step.num, i))) done += 1;
      });
    }
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export default function PathPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { currency, setCurrency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);

  // Динамический бюджет раздела «Универ» — по стране + программе
  const dynamicUniBudget = uniCosts.loading ? sectionsData.uni.budget : uniCosts.total_eur;

  const passed = localStorage.getItem('cispr_passed_quiz') || 'uni';
  const sectionsOrder = ['uni', 'visa', 'travel', 'parma'];
  const passedIndex = sectionsOrder.indexOf(passed);

  // готовим разделы для сетки
  const sections = sectionsOrder.map((id, i) => {
    const base = sectionsData[id];
    const isCompletedByQuiz = i < passedIndex;
    const progress = getSectionProgress(id, isCompletedByQuiz);
    const isCompletedSection = isCompletedByQuiz || progress === 100;
    const status = isCompletedSection ? 'done' : (i === passedIndex ? 'current' : 'future');
    return { id, title: base.title, icon: base.icon, status, progress, isCompletedSection };
  });

  // общие расходы — сумма по всем разделам
  // для uni берём динамический бюджет (по стране + программе), для остальных — статика
  const totalSpent = sections.reduce(
    (sum, s) => sum + getSectionSpent(s.id, s.isCompletedSection),
    0
  );
  const totalBudget = sectionsOrder.reduce(
    (sum, id) => sum + (id === 'uni' ? dynamicUniBudget : sectionsData[id].budget),
    0
  );
  const expensesPercent = totalBudget === 0 ? 0 : Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">

      <div className="flex items-center justify-between px-6 pt-12">
        <div>
          <p className="font-serif text-gold text-lg italic">Bentornata,</p>
          <h1 className="font-serif text-navy text-4xl">
            {localStorage.getItem('cispr_nickname') || 'Aicezhe'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="w-14 h-14 rounded-full bg-soft-cream border border-navy/30 flex items-center justify-center text-2xl"
        >
          👤
        </button>
      </div>

      {/* Виджет «Сегодня почитать» — 3 материала из мира международной учёбы,
          меняются каждый день детерминированно по дате */}
      <NewsWidget />

      <div className="text-center mt-8 mb-5">
        <span className="inline-block font-serif text-gold text-sm bg-navy border border-gold/70 rounded-full px-4 py-1">
          Твой путь
        </span>
      </div>

      {/* Этапы пути — вертикальный список с прогресс-баром.
          Решение: 4 квадрата 2×2 сжимали контент и выглядели игрушечно;
          горизонтальные строки дают воздух и фокус на прогрессе. */}
      <div className="mx-6 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden">
        {sections.map((section, i) => {
          const isDone = section.status === 'done';
          const isLast = i === sections.length - 1;
          return (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === 'uni') {
                  const country = localStorage.getItem('cispr_country') || '';
                  setCurrency(COUNTRY_CURRENCY_MAP[country] ?? 'EUR');
                } else {
                  setCurrency('EUR');
                }
                navigate('/path/' + section.id);
              }}
              className={
                'w-full flex items-center gap-4 px-4 py-3.5 text-left active:bg-cream transition-colors ' +
                (isLast ? '' : 'border-b border-navy/10')
              }
            >
              {/* Иконка-акцент в круглом контейнере.
                  Done: navy с золотой иконкой. Активный: cream с золотой иконкой и золотой обводкой.
                  Золотой цвет — единственный устойчивый акцент бренда, его и держим. */}
              <div
                className={
                  'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ' +
                  (isDone ? 'bg-navy border border-gold/40' : 'bg-cream border border-gold/40')
                }
              >
                <img
                  src={section.icon}
                  alt=""
                  className="w-7 h-7"
                  style={{
                    // Подкрашиваем SVG в gold (#c1a050) — для контраста на любом фоне
                    filter:
                      'brightness(0) saturate(100%) invert(72%) sepia(46%) saturate(478%) hue-rotate(2deg) brightness(91%) contrast(85%)',
                  }}
                />
              </div>

              {/* Контент: название + прогресс-бар + проценты */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h4 className="font-serif text-navy text-base font-bold">{section.title}</h4>
                  <p
                    className={
                      'font-serif text-xs flex-shrink-0 ' +
                      (isDone ? 'text-gold font-bold' : 'text-navy/50')
                    }
                  >
                    {isDone ? '✓ пройдено' : `${section.progress}%`}
                  </p>
                </div>
                <div className="h-1 rounded-full bg-navy/10 overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all duration-500 ' + (isDone ? 'bg-gold' : 'bg-navy')}
                    style={{ width: section.progress + '%' }}
                  />
                </div>
              </div>

              {/* Шеврон */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                className="text-navy/40 flex-shrink-0 -rotate-90"
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
          );
        })}
      </div>

      <h3 className="font-serif text-gold text-lg italic px-6 mt-8 mb-2">
        Расходы
      </h3>
      <div className="mx-6 bg-soft-cream border border-navy/25 rounded-2xl p-5">
        <p className="font-serif text-navy text-lg">
          {fmt(totalSpent)} <span className="text-navy/60 text-sm">из {fmt(totalBudget)}</span>
        </p>
        <div className="h-1.5 rounded-full bg-navy/15 overflow-hidden mt-2">
          <div
            className="h-full bg-navy rounded-full transition-all duration-500"
            style={{ width: expensesPercent + '%' }}
          />
        </div>

        {/* Разбивка по разделам */}
        <div className="mt-3 pt-3 border-t border-navy/10 flex flex-col gap-1.5">
          {sectionsOrder.map((id) => {
            const budget = id === 'uni' ? dynamicUniBudget : sectionsData[id].budget;
            const label = sectionsData[id].titleFull;
            // «В Парме» — это годовой расход на жизнь после переезда (а не на разовое мероприятие)
            const perYear = id === 'parma';
            return (
              <div key={id} className="flex justify-between items-baseline">
                <p className="font-serif text-navy/60 text-xs">
                  {label}{perYear ? ' · в год' : ''}
                </p>
                <p className="font-serif text-navy/80 text-xs">{fmt(budget)}</p>
              </div>
            );
          })}
        </div>

        {/* Примечание об Украине (временная защита) */}
        {uniCosts.has_visa_waiver && (
          <p className="font-serif text-gold text-xs italic mt-3">
            ✓ Временная защита ЕС: виза D не нужна — стоимость визы не включена
          </p>
        )}

        <p className="font-serif text-navy/40 text-[11px] italic mt-2">
          Оценки для {uniCosts.country?.toUpperCase()} · меняй валюту в Настройках
        </p>
      </div>

      <TabBar active="path" />

    </div>
  );
}