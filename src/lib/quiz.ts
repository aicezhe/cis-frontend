// Маппинг выборов онбординг-квиза в фильтры API курсов и поля профиля.
import type { CourseFilters, ProgramLevel } from '../types/api';

// Порядок строго совпадает с OnboardingPage.areas → dept_id = index + 1
// (DEPARTMENTS 1..10 в cispr_scraper/courses_catalog.py).
export const AREA_TO_DEPT: Record<string, number> = {
  'Гуманитарные / культура': 1,
  'Право / политика': 2,
  'Инженерия / технологии': 3,
  'Архитектура / дизайн': 4,
  'Медицина / здоровье': 5,
  'Биология / химия': 6,
  'Пищевые науки': 7,
  'Экономика / бизнес': 8,
  'Математика / физика / IT': 9,
  'Ветеринария / зоотехния': 10,
};

// Уровень из квиза → фильтр списка курсов (laurea = бакалавриат + единый цикл)
export function levelToFilter(level: string): 'laurea' | 'magistrale' | undefined {
  if (level === 'Магистратура') return 'magistrale';
  if (level === 'Бакалавриат' || level === 'Foundation Year') return 'laurea';
  return undefined;
}

// Уровень из квиза → program_level профиля (PATCH /me)
export function levelToProgramLevel(level: string): ProgramLevel | undefined {
  if (level === 'Магистратура') return 'master';
  if (level === 'Бакалавриат') return 'bachelor';
  if (level === 'Foundation Year') return 'foundation';
  return undefined;
}

export function languageToFilter(language: string): 'it' | 'en' | undefined {
  if (language === 'Английский') return 'en';
  if (language === 'Итальянский') return 'it';
  return undefined;
}

// Ключи localStorage для проброса выбора квиза в ChoiceProgramPage
const KEYS = {
  level: 'cispr_quiz_level',
  lang: 'cispr_quiz_lang',
  dept: 'cispr_quiz_dept',
} as const;

export function saveQuizFilters(filters: CourseFilters): void {
  if (filters.level) localStorage.setItem(KEYS.level, filters.level);
  else localStorage.removeItem(KEYS.level);
  if (filters.lang) localStorage.setItem(KEYS.lang, filters.lang);
  else localStorage.removeItem(KEYS.lang);
  if (filters.dept_id != null) localStorage.setItem(KEYS.dept, String(filters.dept_id));
  else localStorage.removeItem(KEYS.dept);
}

export function loadQuizFilters(): CourseFilters {
  const filters: CourseFilters = {};
  const level = localStorage.getItem(KEYS.level);
  const lang = localStorage.getItem(KEYS.lang);
  const dept = localStorage.getItem(KEYS.dept);
  if (level === 'laurea' || level === 'magistrale') filters.level = level;
  if (lang === 'it' || lang === 'en') filters.lang = lang;
  if (dept) filters.dept_id = Number(dept);
  return filters;
}
