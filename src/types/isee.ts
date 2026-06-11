export interface ShowIf {
  branch: string;
  option: string;
}

export interface IseeOption {
  id: string;
  label_ru: string;
  documents_ru: string[];
  note_ru?: string;
  cost_ru?: string;
}

export interface IseeBranch {
  id: string;
  question_ru: string;
  show_if?: ShowIf;
  options: IseeOption[];
}

export interface IseeDecisionTree {
  per_person_ru?: string;
  branches: IseeBranch[];
}

export interface IseeCategory {
  id: string;
  title_ru: string;
  icon: string;
  description_ru: string;
  base_document_ru: string;
  base_cost_ru?: string;
  decision_tree: IseeDecisionTree;
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
    who_counts_ru: string;
    where_ru: string;
    key_rule_ru: string;
    cost_hint_ru?: string;
  };
  categories: IseeCategory[];
  final_steps_ru: string[];
  tips_ru: string[];
}
