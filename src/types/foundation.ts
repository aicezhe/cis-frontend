// Типы данных Foundation Year. Соответствуют public/data/foundation_seed.json.
// Все поля основаны на офиц. данных UniPR (foundationyear.unipr.it). Данные не выдумываются.

export type FoundationModality = 'in_presenza' | 'blended' | 'online';
export type FoundationGrading = 'attendance' | 'pass_fail' | 'graded';
export type FoundationTrackId = 'absolute_beginners' | 'elementary' | 'english_track';

export interface FoundationSubject {
  name: string;
  cfu: number;
  modality?: FoundationModality;
  period?: string;
  grading?: FoundationGrading;
  note?: string;
  optional?: boolean;
}

export interface FoundationTrack {
  id: FoundationTrackId;
  name: string;
  name_ru: string;
  italian_level_start: string;
  italian_level_end: string;
  english_required?: string;
  for_whom_ru: string;
  is_default_for_russian: boolean;
}

export interface FoundationEnrollmentType {
  id: string;
  name: string;
  name_ru: string;
  deadline_template: string;
  description_ru: string;
  discount_pct?: number;
}

export interface FoundationCosts {
  currency: string;
  tuition_full: number;
  tuition_dante: number;
  deposit_pct: number;
  deposit_amount: number;
  deposit_refundable_if_visa_denied: boolean;
  notes_ru: string[];
}

export interface FoundationInstallmentDeadline {
  stream: string;
  date: string;
}

export interface FoundationInstallment {
  id: string;
  label_ru: string;
  pct: number;
  amount_general: number;
  amount_dante: number;
  when_ru?: string;
  refundable_if_visa_denied?: boolean;
  deadlines: FoundationInstallmentDeadline[];
}

export interface FoundationPaymentSchedule {
  source: string;
  note_ru: string;
  installments: FoundationInstallment[];
}

export interface FoundationLanguageRequirements {
  by_track: Record<
    FoundationTrackId,
    { italian: string; english: string }
  >;
  accepted_english_b2_certificates: string[];
  duolingo_note_ru: string;
  visa_note_ru: string;
}

export interface FoundationSubjectsByTrack {
  source: string;
  total_cfu?: number;
  total_note_ru?: string;
  note?: string;
  list: FoundationSubject[];
}

export interface FoundationSubstep {
  name: string;
  cost_rub?: string;
  cost_note_ru?: string;
  duration_days?: string;
}

export interface FoundationStep {
  id: string;
  title: string;
  timing_ru?: string;
  items?: string[];
  substeps?: FoundationSubstep[];
  warnings?: string[];
  description_ru?: string;
  email_template_id?: string;
}

export interface FoundationApplyMeta {
  target_year_ru: string;
  dates_disclaimer_ru: string;
  total_cost_note_ru: string;
  // числовой диапазон той же оценки (300-600 €) — для расчёта общей сметы
  apply_extra_cost_min_eur: number;
  apply_extra_cost_max_eur: number;
}

export interface FoundationEmailTemplate {
  subject: string;
  body_en: string;
}

export interface FoundationProgram {
  id: string;
  name: string;
  name_full: string;
  duration_months: string;
  period: string;
  type: string;
  issued_after_completion: string[];
  description_ru: string;
  important_note_ru: string;
  official_email: string;
  official_url: string;
}

export interface LegalizationOption {
  name: string;
  description_ru: string;
  cost_eur: string;
  duration: string;
  pros_ru: string[];
  cons_ru: string[];
}

export interface LegalizationStep {
  id: string;
  title_ru: string;
  description_ru: string;
  cost_local?: string;
  cost_eur_approx?: number;
  duration_days?: string;
  warnings_ru?: string[];
  options?: LegalizationOption[];
  recommendation_ru?: string;
}

export interface SpecialStatus {
  name_ru: string;
  active: boolean;
  active_until?: string;
  description_ru: string;
  implication_ru: string;
  alternative_path_steps_ru?: string[];
  website?: string;
}

export interface FoundationLegalizationSeed {
  meta: {
    country_code: 'ru' | 'ua' | 'by' | 'kz';
    country_name_ru: string;
    country_name_local: string;
    source: string;
    last_updated: string;
    data_policy: string;
  };
  special_status: SpecialStatus | null;
  diploma_legalization: {
    country_in_hague: boolean;
    procedure_type: 'apostille' | 'consular_legalization';
    competent_authority: {
      name: string;
      name_ru: string;
      website: string;
      submit_address_ru: string;
    };
    steps: LegalizationStep[];
  };
  visa: {
    type: string;
    needed_if_no_temporary_protection: boolean;
    embassy_address: string;
    embassy_website: string;
    duration_days_estimate: string;
    financial_guarantee_eur: string;
    warnings_ru: string[];
  };
  total_cost_estimate: {
    currency: string;
    documents_only: string;
    documents_only_min_eur: number;
    documents_only_max_eur: number;
    with_visa: string;
    course_separately: string;
  };
  common_pitfalls_ru: string[];
}

export interface FoundationSeed {
  meta: {
    source: string;
    academic_year: string;
    data_policy: string;
    last_updated: string;
  };
  program: FoundationProgram;
  tracks: FoundationTrack[];
  enrollment_types: FoundationEnrollmentType[];
  costs: FoundationCosts;
  payment_schedule: FoundationPaymentSchedule;
  language_requirements: FoundationLanguageRequirements;
  subjects_by_track: Record<FoundationTrackId, FoundationSubjectsByTrack>;
  how_studies_work_ru: string;
  apply_meta: FoundationApplyMeta;
  steps_to_apply: FoundationStep[];
  email_templates: Record<string, FoundationEmailTemplate>;
  common_pitfalls_ru: string[];
}
