export interface IseeDocOption {
  id: string;
  label_ru: string;
  documents_ru: string[];
  note_ru?: string;
  cost_ru?: string;
  needs_reason?: boolean;
  follow_up?: string;
}

export interface IseePersonQuestion {
  id: string;
  question_ru: string;
  is_follow_up?: boolean;
  options: IseeDocOption[];
}

export interface IseeMemberType {
  id: string;
  label_ru: string;
}

export interface IseeScholarshipAmount {
  id: string;
  label_ru: string;
  amount_eur: number;
  is_default?: boolean;
  note_ru?: string;
}

export interface IseeSeed {
  meta: {
    source: string;
    academic_year: string;
    data_policy: string;
    reference_date_ru: string;
  };
  intro_ru: {
    what_is_ru: string;
    family_definition_ru: string;
    where_ru: string;
    key_rule_ru: string;
  };
  family_cert: {
    document_ru: string;
    cost_ru: string;
    note_ru: string;
  };
  parents_step: {
    question_ru: string;
    options: IseeDocOption[];
    reason_question_ru: string;
    reasons: IseeDocOption[];
  };
  members_step: {
    title_ru: string;
    note_ru: string;
    member_types: IseeMemberType[];
  };
  person_questions: IseePersonQuestion[];
  legalization_cost: {
    apostille_min_eur: number;
    apostille_max_eur: number;
    translation_min_eur: number;
    translation_max_eur: number;
    note_ru: string;
  };
  scholarship_estimate: {
    title_ru: string;
    isee_threshold_eur: number;
    threshold_note_ru: string;
    amounts: IseeScholarshipAmount[];
    bonuses_note_ru: string;
    source_note_ru: string;
  };
  final_steps_ru: string[];
  tips_ru: string[];
}
