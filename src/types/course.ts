// src/types/course.ts
// Типы под courses_seed.json и scholarship_seed.json

export type Level = "triennale" | "ciclo_unico" | "magistrale";

export interface Subject {
  name: string;
  cfu: number;
  year: number | null;
  optional: boolean;
}

export interface ScaleValue {
  score: number;          // 1-5
  reason_ru: string;
}

export interface CourseCatalog {
  id: string;
  name: string;
  dept_id: number;
  level: Level;
  lang: "it" | "en";
  classe: string;
  accesso: "libero" | "programmato" | "altro";
  blended: boolean;
  is_stem: boolean;
  short_ru: string;
  jobs_ru: string[];
  italy_relevance: ScaleValue;
}

export interface CourseFull extends CourseCatalog {
  dept_name: string;
  url: string;
  difficulty: ScaleValue;
  scales_source: "ai_estimate";
  subjects: Subject[];
  sbocchi_raw: string;
}

export interface CoursesSeed {
  meta: {
    source: string;
    academic_year: string;
    departments: Record<number, string>;
    scales_disclaimer: string;
    level_note: string;
    count: number;
    count_by_level: { foundation: number; laurea: number; magistrale: number };
  };
  by_level: { foundation: string[]; laurea: string[]; magistrale: string[] };
  catalog: CourseCatalog[];
  courses: CourseFull[];
}

export interface Bonus {
  code: string;
  title_ru: string;
  condition_ru: string;
  modifier: string;
  stackable: boolean;
  depends_on_course?: boolean;
}

export interface Scholarship {
  provider: string;
  provider_full: string;
  academic_year: string;
  source_url: string;
  source_bando: string;
  isee_threshold_eur: number;
  isee_note_ru: string;
  amounts_eur: {
    fuori_sede: number;
    pendolare: number;
    in_sede: number;
  };
  amounts_note_ru: string;
  bonuses: Bonus[];
  benefits: string[];
  deadlines_2025_26: Record<string, string>;
  deadlines_note_ru: string;
  how_to_apply_ru: string[];
  disclaimer_ru: string;
}
