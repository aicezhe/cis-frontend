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
    // Сумма шагов ниже (500+450+1450+0+136+0). Permesso — marca da bollo (€16) + KIT (€120),
    // см. relocation_ru_seed.json → permesso_di_soggiorno.steps_ru.
    budget: 2536,
    steps: [
      { num: 1, title: 'Билеты в Италию', deadline: 'актуально', price: '€500', substeps: [] },
      { num: 2, title: 'Поиск жилья', deadline: 'актуально', price: '€450', substeps: [] },
      { num: 3, title: 'Первый месяц + депозит', deadline: '14 дней', price: '€1450', substeps: [] },
      { num: 4, title: 'Codice fiscale', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Permesso di soggiorno', deadline: '8 дней', price: '€136', substeps: [] },
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

// '€200' → 200, '€100–200' → 150, '~€170' → 170, '€0' → 0
export function parsePrice(price: string): number {
  const cleaned = price.replace(/[€~\s]/g, '');
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const [a, b] = cleaned.split(/[–-]/).map(Number);
    return Math.round((a + b) / 2);
  }
  return parseInt(cleaned) || 0;
}
