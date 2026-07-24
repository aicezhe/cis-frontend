// Типы ответов бэкенда CIS.PR. Должны совпадать с app/schemas/*.py.

export type ProgramLevel = 'bachelor' | 'master' | 'foundation';
export type Gender = 'f' | 'm';
export type ResidenceStatus = 'fuori_sede' | 'pendolare' | 'in_sede';

// GET /api/v1/auth/me, ответ register / patch — UserResponse
export interface User {
  id: string;
  email: string;
  username: string;
  age: number | null;
  country: string | null;
  city: string | null;
  program_level: string | null;
  onboarding_completed: boolean;
  course_id: string | null;
  gender: string | null;
  residence_status: string | null;
  avatar_b64: string | null;
  created_at: string;
}

// POST /api/v1/auth/login — TokenResponse
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// PATCH /api/v1/auth/me — OnboardingRequest (все поля опциональны)
export interface OnboardingPatch {
  age?: number | null;
  country?: string | null;
  city?: string | null;
  program_level?: ProgramLevel | null;
  language?: 'it' | 'en' | null;
  arrival_date?: 'within_3m' | '3_6m' | '6_12m' | 'unknown' | null;
  onboarding_completed?: boolean;
  course_id?: string | null;
  gender?: Gender | null;
  residence_status?: ResidenceStatus | null;
  avatar_b64?: string | null;
}

// GET /api/courses — CourseCatalog
export interface CourseCatalog {
  id: string;
  name: string;
  dept_id: number;
  level: string; // triennale | ciclo_unico | magistrale
  lang: string; // it | en
  classe: string;
  accesso: string;
  blended: boolean;
  is_stem: boolean;
  short_ru: string;
  jobs_ru: string[];
}

export interface CourseSubject {
  name: string;
  cfu: number;
  year: number | null;
  optional: boolean;
}

// Направление учебного плана (ИИ-разбор). subjects сгруппированы по годам в UI.
export interface Curriculum {
  id: string;
  name: string;
  note: string;
  subjects: CourseSubject[];
}

// GET /api/courses/{id} и /api/users/me/course — CourseFull
export interface CourseFull extends CourseCatalog {
  dept_name: string;
  url: string;
  sbocchi_raw: string;
  // ИИ-оценки 1..5 (0 — ещё не сгенерировано)
  difficulty: number;
  demand_it: number;
  difficulty_note: string;
  demand_note: string;
  subjects: CourseSubject[];
  curricula: Curriculum[];
}

// GET /api/scholarship — ScholarshipRead
export interface ScholarshipRead {
  provider: string;
  academic_year: string;
  data: Record<string, unknown>;
}

export interface AppliedBonus {
  code: string;
  title_ru: string;
  modifier: string;
  amount_eur: number;
}

// GET /api/users/me/scholarship — ScholarshipComputation
export interface ScholarshipComputation {
  base_eur: number;
  residence_status: string;
  applicable_bonuses: AppliedBonus[];
  total_eur: number;
  status: string;
  full_data: Record<string, unknown>;
}

// Фильтры списка курсов
export interface CourseFilters {
  level?: 'laurea' | 'magistrale';
  dept_id?: number;
  lang?: 'it' | 'en';
  is_stem?: boolean;
}
