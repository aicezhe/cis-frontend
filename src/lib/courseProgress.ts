// Сброс прогресса раздела «Университет» при смене курса/этапа.
//
// Зачем: галочки Foundation и бакалавриата лежат в разных ключах, но между
// двумя разными специальностями бакалавриата ключи общие — при переключении
// курса на дашборде оставался процент, набранный по прошлой программе.
// Списки документов и шагов у программ разные, поэтому старые галочки после
// смены не значат ничего.
//
// Сбрасываем только «Университет». Виза, Переезд и «В Парме» — про личную
// бюрократию и страну, а не про специальность: человек, перешедший с Foundation
// на бакалавриат, визу уже сделал, и стирать её прогресс нельзя.

const UNI_PROGRESS_KEYS = [
  'cispr_foundation_checks', // FoundationOverviewPage / FoundationFinancePage
  'cispr_docs_checklist', // ProgramDocumentsPage
  'cispr_steps_checks', // ProgramOverviewPage
  'cispr_done_uni', // легаси-галочки SectionPage
];

export function resetUniProgress(): void {
  UNI_PROGRESS_KEYS.forEach((k) => localStorage.removeItem(k));
}

/** Поменялся ли курс или этап настолько, что старые галочки уже не про него. */
export function courseChanged(
  prevProgram: string | null,
  nextProgram: string,
  prevCourseId: string | null,
  nextCourseId: string | null,
): boolean {
  if (prevProgram !== nextProgram) return true;
  // у Foundation специальности нет — сравнивать нечего
  if (nextProgram === 'foundation') return false;
  return Boolean(prevCourseId) && prevCourseId !== nextCourseId;
}
