import { useNavigate } from 'react-router-dom';
import iconUni from '../assets/iconUni.svg';
import iconVisa from '../assets/iconVisa.svg';
import iconTravel from '../assets/iconTravel.svg';
import iconInParma from '../assets/iconInParma.svg';
import iconTime from '../assets/time sign.svg';
import TabBar from '../components/TabBar';

// ВНИМАНИЕ: это та же структура что в SectionPage — должна совпадать
// (в будущем вынесем в один файл, пока дублируется)
const sectionsData: Record<string, any> = {
  uni: {
    title: 'УНИВЕР',
    titleFull: 'Университет',
    icon: iconUni,
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

// первый невыполненный шаг
function getCurrentStep(sectionKey: string): any {
  const completed = loadCompleted(sectionKey);
  const data = sectionsData[sectionKey];
  for (const step of data.steps) {
    if (step.substeps.length === 0) {
      if (!completed.includes(getItemId(sectionKey, step.num))) return step;
    } else {
      const allDone = step.substeps.every((_: any, i: number) =>
        completed.includes(getItemId(sectionKey, step.num, i))
      );
      if (!allDone) return step;
    }
  }
  return null;
}

export default function PathPage() {
  const navigate = useNavigate();

  const passed = localStorage.getItem('cispr_passed_quiz') || 'uni';
  const sectionsOrder = ['uni', 'visa', 'travel', 'parma'];
  const passedIndex = sectionsOrder.indexOf(passed);

  // готовим разделы для сетки
  const sections = sectionsOrder.map((id, i) => {
    const base = sectionsData[id];
    const isCompletedSection = i < passedIndex;
    const progress = getSectionProgress(id, isCompletedSection);
    const status = isCompletedSection ? 'done' : (i === passedIndex ? 'current' : 'future');
    return { id, title: base.title, icon: base.icon, status, progress };
  });

  // карточка "Сейчас важно" — берём из текущего раздела
  const currentSectionData = sectionsData[passed];
  const currentStep = getCurrentStep(passed);

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

      {/* Карточка "Сейчас важно" — динамическая */}
      {currentStep && (
        <div className="mx-6 mt-8 relative bg-navy rounded-3xl p-6">
          <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
          <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
          <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

          <span className="inline-block font-serif text-gold text-xs border border-gold rounded-full px-3 py-1 mb-4">
            {currentSectionData.title}
          </span>

          <h2 className="font-serif text-cream text-2xl">
            {currentStep.title}
          </h2>

          <div className="flex items-center gap-2 mt-3">
            <img src={iconTime} alt="" className="w-4 h-4" />
            <p className="font-serif text-gold text-sm">{currentStep.deadline}</p>
          </div>
        </div>
      )}

      <h3 className="font-serif text-gold text-2xl font-bold text-center mt-8 mb-5">
        Твой путь
      </h3>

      <div className="grid grid-cols-2 gap-4 px-6">
        {sections.map((section) => {
          const isDone = section.status === 'done';
          return (
            <button
              key={section.id}
              onClick={() => navigate('/path/' + section.id)}
              className={
                'relative rounded-2xl p-4 h-44 flex flex-col border ' +
                (isDone
                  ? 'bg-gold border-gold'
                  : 'bg-soft-cream border-navy/25')
              }
            >
              {isDone && (
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-navy flex items-center justify-center">
                  <span className="text-gold text-base">✓</span>
                </div>
              )}

              <div className={isDone ? 'flex justify-start' : 'flex justify-end'}>
                <img
                  src={section.icon}
                  alt={section.title}
                  className={'w-12 h-12 ' + (isDone ? 'opacity-70' : '')}
                />
              </div>

              <div className="mt-auto text-left">
                <h4 className={
                  'font-serif text-lg font-bold mb-2 ' +
                  (isDone ? 'text-cream' : 'text-navy')
                }>
                  {section.title}
                </h4>
                <div className={
                  'h-1.5 rounded-full overflow-hidden ' +
                  (isDone ? 'bg-cream/40' : 'bg-navy/15')
                }>
                  <div
                    className={'h-full rounded-full transition-all duration-500 ' + (isDone ? 'bg-cream' : 'bg-navy')}
                    style={{ width: section.progress + '%' }}
                  />
                </div>
                <p className={
                  'font-serif text-sm mt-1 ' +
                  (isDone ? 'text-cream' : 'text-navy')
                }>
                  {section.progress}%
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <h3 className="font-serif text-gold text-lg italic px-6 mt-8 mb-2">
        Расходы
      </h3>
      <button
        onClick={() => navigate('/path/expenses')}
        className="mx-6 bg-soft-cream border border-navy/25 rounded-2xl p-5 flex items-center gap-4"
      >
        <div className="flex-1">
          <p className="font-serif text-navy text-lg">
            €500 <span className="text-navy/60 text-sm">из €2000</span>
          </p>
          <div className="h-1.5 rounded-full bg-navy/15 overflow-hidden mt-2">
            <div className="h-full bg-navy rounded-full" style={{ width: '25%' }} />
          </div>
        </div>
        <span className="text-navy text-2xl">→</span>
      </button>

      <TabBar active="path" />

    </div>
  );
}