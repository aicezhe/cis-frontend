export interface IseeSubBranch {
  case_ru: string;
  documents_ru: string[];
}

export interface IseeOption {
  id: string;
  label_ru: string;
  documents_ru: string[];
  sub_branches?: IseeSubBranch[];
}

export interface IseeBranch {
  id: string;
  question_ru: string;
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
    who_counts_ru: string;
    where_ru: string;
    key_rule_ru: string;
  };
  categories: IseeCategory[];
  final_steps_ru: string[];
  tips_ru: string[];
}
