// Типы для разделов Бакалавриат и Магистратура.
// Соответствуют public/data/laurea_seed.json и magistrale_seed.json.

// Значения из levelToProgramLevel() в quiz.ts → localStorage cispr_program
export type ProgramType = 'bachelor' | 'master';

export interface ApplicationStep {
  id: string;
  title_ru: string;
  description_ru: string;
  duration_ru?: string;
  cost_eur?: string | number;
  platform_url?: string;
  warnings_ru?: string[];
  tip_ru?: string;
  warning_ru?: string;
  next_step_ru?: string;
  deadline_ru?: string;
  linked_to_country_seed?: boolean;
  skip_if_libero_accesso?: boolean;
  skip_if_not_required?: boolean;
  critical?: boolean;
  optional?: boolean;
}

export interface RequiredDocument {
  id: string;
  name_ru: string;
  details_ru: string;
  linked_to_country_seed?: boolean;
  critical?: boolean;
  optional?: boolean;
}

// --- Новые типы для numero_chiuso_seed.json (v2, 2026) ---

export interface TestSection {
  name_ru: string;
  questions: number;
}

export interface TestStructure {
  total_questions: number;
  sections?: TestSection[];
  duration_min: number;
  english_section?: string;
  language?: string;
  note_ru?: string;
}

export interface TestEntry {
  id: string;
  name: string;
  for_ru: string;
  structure: TestStructure;
  scoring_ru: string;
  where_ru: string;
  cost_eur: number;
  provider: string;
  url: string;
  passing_ru?: string;
  note_ru?: string;
  is_new_2026?: boolean;
}

export interface AccessTypeInfo {
  name_ru: string;
  description_ru: string;
  key_point_ru: string;
}

export interface NumeroChiusoSeed {
  meta: {
    source: string;
    academic_year: string;
    data_policy: string;
    important_2026_change_ru: string;
  };
  access_types_explained: {
    libero_accesso: AccessTypeInfo;
    numero_chiuso: AccessTypeInfo;
  };
  tests: TestEntry[];
  how_to_take_ru: {
    tolc_casa_vs_uni: string;
    can_retake: string;
    where_cis_countries: string;
    preparation_ru: string;
  };
}

// --- Типы для twelfth_year_options ---

export interface TwelfthYearOption {
  id: string;
  name_ru: string;
  description_ru: string;
  documents_ru: string[];
  best_for_ru: string;
}

export interface TwelfthYearOptions {
  title_ru: string;
  explanation_ru: string;
  options: TwelfthYearOption[];
  note_ru: string;
}

// --- Основной тип LaureaSeed ---

export interface LaureaSeed {
  meta: {
    program_type: ProgramType;
    source: string;
    academic_year: string;
    last_updated: string;
    data_policy: string;
  };
  program: {
    name_ru: string;
    name_it: string;
    duration_years: number;
    duration_special_cases?: Record<string, string[]>;
    ects_total: number;
    ects_total_ciclo_unico?: string;
    title_after: string;
    description_ru: string;
    important_notes_ru: string[];
  };
  platforms: Record<string, { name: string; url: string; description_ru: string }>;
  deadlines_2026_2027: Record<string, string | string[]>;
  documents_required: RequiredDocument[];
  language_requirements: {
    italian_taught_courses: {
      level: string;
      accepted_certificates: string[];
      exemption_for_fy?: string;
    };
    english_taught_courses: {
      level: string;
      accepted_certificates: string[];
      exemption_ru?: string;
    };
    duolingo_note_ru?: string;
  };
  tuition_fees: {
    currency: string;
    model: string;
    explanation_ru: string;
    no_tax_area: {
      isee_threshold_eur: number;
      amount_eur: number;
      components_ru?: string;
    };
    without_isee: {
      amount_eur_min: number;
      amount_eur_max: number;
      note_ru: string;
    };
    scholarships: Record<string, {
      name: string;
      max_amount_eur: number;
      for_whom?: string;
    }>;
  };
  application_steps: ApplicationStep[];
  twelfth_year_options?: TwelfthYearOptions;
  scholarship_section?: {
    title_ru: string;
    status: string;
    note_ru: string;
  };
  common_pitfalls_ru: string[];
  useful_links: Record<string, string>;
}
