// Статические данные 4 разделов пути (Универ/Виза/Переезд/В Парме): шаги +
// примерные цены. Общий источник для PathPage (прогресс/бюджет) и
// ExpensesPage (таблица «Стоимость» с разбивкой по разделам).
import iconUni from '../assets/iconUni.svg';
import iconVisa from '../assets/iconVisa.svg';
import iconTravel from '../assets/iconTravel.svg';
import iconInParma from '../assets/iconInParma.svg';

export const sectionsData: Record<string, any> = {
  uni: {
    title: 'УНИВЕР',
    titleFull: 'Университет',
    icon: iconUni,
    budget: 2000,
    steps: [
      { num: 1, title: 'Выбор программы', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 2, title: 'Проверка учебной базы', deadline: '14 дней', price: '€0', substeps: [] },
      // Цен здесь намеренно нет. Раньше стояли €140 / €60 / €400–550 — по
      // России и одинаковые для всех стран, при том что смета берёт их из
      // costs_seed per country (BY 12, KZ 10, UA 20 за апостиль). Две цифры на
      // разных экранах противоречили друг другу, и этот хардкод был вторым,
      // разошедшимся источником правды. Смету считает useCosts, сюда цены
      // возвращать не надо.
      // Апостиль ИДЁТ ПЕРВЫМ: перевод без штампа придётся переделывать.
      // Перевод — за комплект «аттестат + приложение», приложение и есть
      // транскрипт, отдельной строкой его считать нельзя.
      { num: 3, title: 'Документы и легализация', deadline: '14 дней', price: '€0', substeps: [
        { title: 'Апостиль' },
        { title: 'Перевод аттестата' },
        { title: 'CIMEA или DDV' },
        { title: 'Сертификат B2' },
      ]},
      { num: 4, title: 'Регистрация интереса', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Входной тест', deadline: 'до 30 апр', price: '€0', substeps: [] },
      { num: 6, title: 'Учётка и пакет документов', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 7, title: 'Подача заявки в UniPR', deadline: 'до 15 июл', price: '€20', substeps: [] },
      { num: 8, title: 'Pre-enrolment Esse3', deadline: '7 дней', price: '€156', substeps: [] },
      { num: 9, title: 'Acceptance Letter', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },
  // ВИЗА — только визовые расходы. Документы (апостиль/перевод/CIMEA) считаются
  // в «Университете», permesso — в «Переезде». Здесь их НЕТ, чтобы не двоить.
  visa: {
    title: 'ВИЗА',
    titleFull: 'Виза',
    icon: iconVisa,
    steps: [
      { id: 'visa-consular', num: 1, title: 'Консульский сбор (виза D)', deadline: 'актуально', price: '€90', substeps: [] },
      { id: 'visa-service', num: 2, title: 'Сервисный сбор визового центра', deadline: 'актуально', price: '€40', substeps: [], approx: true },
      { id: 'visa-insurance', num: 3, title: 'Медстраховка для визы (год)', deadline: '14 дней', price: '€200', substeps: [], approx: true },
      { id: 'visa-photo', num: 4, title: 'Фото и бронь билета/жилья', deadline: '14 дней', price: '€20', substeps: [], approx: true },
    ],
  },
  travel: {
    title: 'ПЕРЕЕЗД',
    titleFull: 'Переезд',
    icon: iconTravel,
    steps: [
      { id: 'travel-flights', num: 1, title: 'Билеты в Италию (через третьи страны)', deadline: 'актуально', price: '€400', substeps: [], approx: true },
      { id: 'travel-housing-fee', num: 2, title: 'Поиск жилья (агентство / бронь)', deadline: 'актуально', price: '€450', substeps: [], approx: true },
      { id: 'travel-first-month', num: 3, title: 'Первый месяц аренды + депозит', deadline: '14 дней', price: '€1450', substeps: [], approx: true },
      // Permesso di soggiorno (учёба, до 1 года): bollo €16 + kit €30 + пермессо €70,46.
      // Источник: portaleimmigrazione.it → Tabelle Costi (2026).
      { id: 'travel-permesso', num: 4, title: 'Permesso di soggiorno', deadline: '8 дней', price: '€116', substeps: [] },
      { id: 'travel-sim', num: 5, title: 'SIM-карта (подключение)', deadline: '7 дней', price: '€10', substeps: [], approx: true },
      { id: 'travel-codice', num: 6, title: 'Codice fiscale', deadline: '7 дней', price: '€0', substeps: [] },
      { id: 'travel-bank', num: 7, title: 'Банковский счёт', deadline: '14 дней', price: '€0', substeps: [] },
    ],
  },
  // В ПАРМЕ — годовые расходы жизни. Медицина — отдельный выбор (частная/SSN),
  // подставляется в ExpensesPage, поэтому строки «медицина» здесь нет.
  parma: {
    title: 'В ПАРМЕ',
    titleFull: 'В Парме',
    icon: iconInParma,
    steps: [
      { id: 'parma-rent', num: 1, title: 'Аренда комнаты (оценка, год)', deadline: 'ежемесячно', price: '€6000', substeps: [], approx: true },
      { id: 'parma-food', num: 2, title: 'Питание и быт (оценка, год)', deadline: 'ежемесячно', price: '€2400', substeps: [], approx: true },
      { id: 'parma-transport', num: 3, title: 'Транспорт (TEP, студ. абонемент, год)', deadline: 'год', price: '€120', substeps: [] },
      { id: 'parma-mobile', num: 4, title: 'Мобильная связь (год)', deadline: 'ежемесячно', price: '€120', substeps: [], approx: true },
    ],
  },
};

// '€200' → 200, '€100–200' → 150, '~€170' → 170, '€0' → 0
export function parsePrice(price: string): number {
  const cleaned = price.replace(/[€~\s]/g, '');
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const [a, b] = cleaned.split(/[–-]/).map(Number);
    return Math.round((a + b) / 2);
  }
  return parseInt(cleaned) || 0;
}

// Базовая сумма раздела = сумма его статей (заголовок = разбивка). Заменяет
// прежнее хардкод-поле budget, которое расходилось с построчной разбивкой.
// Раздел «Университет» считается отдельно (useCosts по стране/программе), а для
// «Парма» строка «медицина» подставляется в ExpensesPage — здесь её нет.
export function sectionStaticTotal(id: string): number {
  const s = sectionsData[id];
  if (!s?.steps) return 0;
  return s.steps.reduce((sum: number, step: any) => {
    if (step.substeps && step.substeps.length > 0) {
      return sum + step.substeps.reduce((a: number, sub: any) => a + parsePrice(sub.price), 0);
    }
    return sum + parsePrice(step.price);
  }, 0);
}
