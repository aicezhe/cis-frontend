export interface VisaHousingOption {
  name: string;
  price_note_ru?: string;
  price_min_eur?: number;
  price_max_eur?: number;
  pros_ru: string;
  url?: string;
}

export interface VisaHousingSearch {
  title_ru: string;
  options: VisaHousingOption[];
  estimated_costs_ru: string;
}

export interface VisaInsuranceRecommended {
  name: string;
  price_ru: string;
  price_year_eur?: number;
  price_half_year_eur?: number;
  url: string;
  why_ru: string;
}

export interface VisaSlotsStrategy {
  title_ru: string;
  details_ru: string[];
}

export interface VisaStep {
  id: string;
  title_ru: string;
  description_ru?: string;
  substeps_ru?: string[];
  checklist_ru?: string[];
  details_ru?: string[];
  options_ru?: string[];
  what_happens_ru?: string[];
  requirements_ru?: string[];
  warning_ru?: string;
  important_ru?: string;
  link_to_section_ru?: string;
  best_practice_ru?: string;
  extra_ru?: string;
  note_ru?: string;
  check_ru?: string;
  on_receipt_ru?: string;
  prepare_ru?: string;
  laura_help_ru?: string;
  url?: string;
  sponsor_letter_template_id?: string;
  housing_search_ru?: VisaHousingSearch;
  recommended_ru?: VisaInsuranceRecommended;
  alternative_ru?: string;
  after_arrival_ru?: string;
  slots_strategy_ru?: VisaSlotsStrategy;
}

export interface VisaRejectionReason {
  n: number;
  title_ru: string;
  detail_ru: string;
}

export interface VisaDistrict {
  name_ru: string;
  website: string;
  regions_ru: string[] | string;
  note_ru: string;
}

export interface VisaSeed {
  meta: {
    country_code: string;
    country_name_ru: string;
    source: string;
    academic_year: string;
    last_updated: string;
    data_policy: string;
  };
  intro_ru: {
    what_ru: string;
    prerequisites_ru: string;
    after_arrival_ru: string;
  };
  process_overview_ru: string[];
  consular_districts: {
    description_ru: string;
    spb_district: VisaDistrict;
    moscow_district: VisaDistrict;
    operators_ru: {
      moscow: string;
      regions: string;
      note_ru: string;
    };
  };
  steps: VisaStep[];
  rejection_reasons_ru: {
    title_ru: string;
    intro_ru: string;
    reasons: VisaRejectionReason[];
    universal_tips_ru: string[];
  };
  templates: {
    sponsor_declaration: {
      title_ru: string;
      language: string;
      body: string;
    };
  };
  permesso_di_soggiorno_ru: {
    title_ru: string;
    description_ru: string;
    note_ru: string;
  };
}
