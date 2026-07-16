// Группировка подразделов «В Парме» в 3 общих раздела. Обзор показывает эти
// группы плитками, внутри группы — подразделы карточками.
export interface ParmaGroup {
  id: string;
  title_ru: string;
  subtitle_ru: string;
  iconSubId: string;      // чью иконку подраздела взять для плитки группы
  subsectionIds: string[]; // порядок карточек внутри группы
}

export const PARMA_GROUPS: ParmaGroup[] = [
  {
    id: 'documents',
    title_ru: 'Важные документы',
    subtitle_ru: 'CIE, SPID, Tessera',
    iconSubId: 'cie',
    subsectionIds: ['spid', 'cie', 'tessera_sanitaria'],
  },
  {
    id: 'study_work',
    title_ru: 'Учёба и работа',
    subtitle_ru: 'Работа, ER.GO, Erasmus',
    iconSubId: 'work',
    // ergo_foundation и fy_to_bachelor помечены foundation_only — фильтруются
    // на странице группы, показываются только студентам Foundation.
    subsectionIds: ['work', 'ergo_foundation', 'fy_to_bachelor', 'erasmus'],
  },
  {
    id: 'other',
    title_ru: 'Остальное',
    subtitle_ru: 'Жизнь, транспорт, связь',
    iconSubId: 'social_life',
    subsectionIds: ['social_life', 'transport', 'language_sport', 'shops_services', 'sim_operators', 'support'],
  },
];

export function parmaGroupById(id: string | undefined): ParmaGroup | undefined {
  return PARMA_GROUPS.find((g) => g.id === id);
}
