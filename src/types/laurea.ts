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

export interface NumeroChiusoProgram {
  course_id: string;
  course_name: string;
  test: string;
  test_provider?: string;
  test_url?: string;
  test_cost_eur?: number;
  test_when?: string;
  passing_score?: string;
}

export interface NumeroChiusoSeed {
  meta: { source: string; academic_year: string; data_policy: string };
  numero_chiuso_programs: NumeroChiusoProgram[];
  general_info_ru: {
    what_is_numero_chiuso: string;
    how_to_prepare_ru: string[];
    where_to_take_ru: {
      tolc_at_home: string;
      tolc_in_centers: string;
      imat_in_centers: string;
    };
  };
}

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
  common_pitfalls_ru: string[];
  useful_links: Record<string, string>;
}
