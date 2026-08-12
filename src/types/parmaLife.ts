export interface ParmaLink {
  label: string;
  url: string;
}

export interface ParmaBlock {
  title_ru: string;
  description_ru: string;
  url?: string;
  tip_ru?: string;
}

export interface ParmaContracts {
  title_ru: string;
  types_ru: string[];
  student_limit_ru: string;
  /** Разбор заблуждения «по неделям можно как угодно, лишь бы 1040 за год». */
  limit_myth_ru?: string;
  /** Легальный путь работать больше — смена типа permesso. */
  need_more_hours_ru?: string;
  avg_hourly_eur_min: number;
  avg_hourly_eur_max: number;
  avg_monthly_eur_min: number;
  avg_monthly_eur_max: number;
  avg_hours_ru: string;
}

export interface ParmaResource {
  name_ru: string;
  description_ru: string;
  url?: string;
}

export interface ParmaStaticTip {
  label_ru: string;
  url?: string;
}

// Гибкий тип под разные подразделы — большая часть полей опциональна.
export interface ParmaSubsection {
  id: string;
  icon: string;
  title_ru: string;
  subtitle_ru?: string;
  foundation_only?: boolean;

  // Общие поля
  what_ru?: string;
  intro_ru?: string;
  description_ru?: string;
  note_ru?: string;
  warning_ru?: string;
  official_note_ru?: string;
  procedure_ru?: string | string[];
  where_ru?: string;
  documents_ru?: string[];
  requirements_ru?: string[];
  steps_ru?: string[];
  free_option_ru?: string;
  functionality_ru?: string[];
  why_ru?: string[];
  important_for_foreigners_ru?: string[];
  important_ru?: string;
  cost_eur?: number;
  laura_help_ru?: string;

  // Работа
  contracts_ru?: ParmaContracts;
  tip_ru?: string;

  // Ссылка на общий блок «SSN и tessera sanitaria» в разделе Переезд
  link_to_ssn?: string;
  // ER.GO + FY переход
  link_to_isee?: string;
  link_to_scholarship?: string;
  trigger_action?: 'switch_to_bachelor';
  language_logic_ru?: { b2_ru: string; b1_ru: string };
  process_ru?: string[];

  // Транспорт / язык-спорт / эразмус
  blocks_ru?: ParmaBlock[];

  // Соц.жизнь
  status?: 'mobile_version';
  mobile_version_note_ru?: string;
  static_tips_ru?: ParmaStaticTip[];

  // Поддержка
  resources_ru?: ParmaResource[];

  // Внешние ссылки
  links?: Array<{ label: string; url: string }>;
}

export interface ParmaLifeSeed {
  meta: {
    source: string;
    last_updated: string;
    data_policy: string;
  };
  intro_ru: {
    what_ru: string;
    order_ru: string;
  };
  subsections: ParmaSubsection[];
}
