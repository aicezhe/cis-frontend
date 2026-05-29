// src/hooks/useCourse.ts
// Хук читает seed-файлы из public/data и достаёт курс юзера по id из localStorage.
// Когда бэк будет готов — заменить fetch('/data/...') на fetch('/api/...').

import { useEffect, useState } from "react";
import type { CoursesSeed, Scholarship, CourseFull } from "../types/course";

const LS_COURSE_ID = "cispr_course_id";   // id выбранного курса (cdl-ig, cdlm-ig, ...)
const LS_GENDER    = "cispr_gender";       // "f" | "m" | undefined
const LS_RESIDENCE = "cispr_residence_status"; // "fuori_sede" | "pendolare" | "in_sede"

let _coursesCache: CoursesSeed | null = null;
let _scholarshipCache: Scholarship | null = null;

async function loadCourses(): Promise<CoursesSeed> {
  if (_coursesCache) return _coursesCache;
  const r = await fetch("/data/courses_seed.json");
  _coursesCache = await r.json();
  return _coursesCache!;
}

async function loadScholarship(): Promise<Scholarship> {
  if (_scholarshipCache) return _scholarshipCache;
  const r = await fetch("/data/scholarship_seed.json");
  _scholarshipCache = await r.json();
  return _scholarshipCache!;
}

// Курс юзера (полная карточка)
export function useMyCourse() {
  const [course, setCourse] = useState<CourseFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem(LS_COURSE_ID);
    if (!id) { setLoading(false); return; }
    loadCourses().then(seed => {
      setCourse(seed.courses.find(c => c.id === id) ?? null);
      setLoading(false);
    });
  }, []);

  return { course, loading };
}

// Стипендия + рассчитанная сумма для конкретного юзера
export function useScholarshipForUser(course: CourseFull | null) {
  const [data, setData] = useState<Scholarship | null>(null);
  useEffect(() => { loadScholarship().then(setData); }, []);

  if (!data) return { scholarship: null, computed: null };

  const status = (localStorage.getItem(LS_RESIDENCE) ?? "fuori_sede") as
    "fuori_sede" | "pendolare" | "in_sede";
  const gender = localStorage.getItem(LS_GENDER);
  const base = data.amounts_eur[status];

  // применимые бонусы (без ISEE — он зависит от документов, не из профиля)
  const applicable = data.bonuses.filter(b => {
    if (b.code === "stem_female") return gender === "f" && course?.is_stem;
    return false; // low_isee/disability — оставляем как информацию, не считаем авто
  });
  const totalPct = applicable.reduce((s, b) => s + parseInt(b.modifier), 0);
  const total = Math.round(base * (1 + totalPct / 100));

  return {
    scholarship: data,
    computed: { status, base, applicable_bonuses: applicable, total_eur: total },
  };
}

// Список курсов для экрана "уже выбрал свой курс" (U1 → ДА)
export function useCoursesList(level?: "laurea" | "magistrale") {
  const [list, setList] = useState<CoursesSeed["catalog"]>([]);
  useEffect(() => {
    loadCourses().then(seed => {
      const ids = level ? seed.by_level[level] : null;
      setList(ids
        ? seed.catalog.filter(c => ids.includes(c.id))
        : seed.catalog);
    });
  }, [level]);
  return list;
}

export function saveMyCourse(id: string) {
  localStorage.setItem(LS_COURSE_ID, id);
}
