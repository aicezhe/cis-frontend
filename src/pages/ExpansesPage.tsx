import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TabBar from '../components/TabBar';



const sectionsData: Record<string, any> = {
  uni: {
    title: 'Университет',
    subtitle: 'Ingegneria gestionale',
    meta: 'non-EU · laurea · 2026/27',
    budget: { total: 2000 },
    stepsTitle: 'Шаги поступления',
    steps: [
      { num: 1, title: 'Выбор программы', sub: 'Ingegneria gestionale · €0', deadline: 'актуально', price: '€0', substeps: [] },
      { num: 2, title: 'Проверка учебной базы', sub: 'Языки, профильные предметы · €0', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 3, title: 'Документы и легализация', sub: '€200–400', deadline: '14 дней', price: '€800', substeps: [
        { title: 'Перевод аттестата на итальянский', price: '€200' },
        { title: 'Апостиль на аттестат', price: '€150' },
        { title: 'Сделать CIMEA или Dichiarazione di valore', price: '~€170' },
        { title: 'Транскрипт оценок с переводом', price: '~€60' },
        { title: 'Сертификат итальянского B2', price: '€100–200' },
      ]},
      { num: 4, title: 'Регистрация интереса', sub: 'Let\'s keep in touch · €0', deadline: '7 дней', price: '€0', substeps: [] },
      { num: 5, title: 'Входной тест', sub: 'Test di ingresso · €0', deadline: 'до 30 апр', price: '€0', substeps: [] },
      { num: 6, title: 'Учётка и пакет документов', sub: 'Step 1–2 · €0', deadline: '14 дней', price: '€0', substeps: [] },
      { num: 7, title: 'Подача заявки в UniPR', sub: 'Apply for Admission · €0–20', deadline: 'до 15 июл', price: '€20', substeps: [] },
      { num: 8, title: 'Pre-enrolment Esse3', sub: 'Первая rata · €156', deadline: '7 дней', price: '€156', substeps: [] },
      { num: 9, title: 'Acceptance Letter', sub: '→ Раздел Виза · €0', deadline: 'актуально', price: '€0', substeps: [] },
    ],
  },