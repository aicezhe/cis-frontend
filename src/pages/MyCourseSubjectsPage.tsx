// src/pages/MyCourseSubjectsPage.tsx
// Список предметов курса юзера, сгруппированных по годам.
// Источник — поле subjects[] в courses_seed.json (берётся из карточки UniPR
// блок "Cosa imparerai").

import { useNavigate } from "react-router-dom";
import { useMyCourse } from "../hooks/useCourse";
import type { Subject } from "../types/course";

const YEAR_LABELS: Record<number, string> = {
  1: "Primo anno",
  2: "Secondo anno",
  3: "Terzo anno",
  4: "Quarto anno",
  5: "Quinto anno",
  6: "Sesto anno",
};

export default function MyCourseSubjectsPage() {
  const navigate = useNavigate();
  const { course, loading } = useMyCourse();

  if (loading) return <div className="p-6 text-navy/60">Загрузка…</div>;
  if (!course) { navigate("/path"); return null; }

  // группировка по году
  const byYear = new Map<number | null, Subject[]>();
  for (const s of course.subjects) {
    const k = s.year ?? 0;
    if (!byYear.has(k)) byYear.set(k, []);
    byYear.get(k)!.push(s);
  }
  const years = Array.from(byYear.keys()).sort((a, b) => (a ?? 99) - (b ?? 99));
  const totalCfu = course.subjects.reduce((s, x) => s + (x.cfu || 0), 0);

  return (
    <div className="min-h-screen bg-soft-cream px-5 pt-12 pb-24">
      <button onClick={() => navigate(-1)}
              className="font-sans text-navy/60 mb-4">← назад</button>

      <div className="mb-6">
        <span className="font-sans text-[10px] uppercase tracking-widest text-gold">
          твои предметы
        </span>
        <h1 className="font-serif text-3xl text-navy leading-tight mt-1">
          План учёбы
        </h1>
        <p className="font-sans text-sm text-navy/60 mt-2">
          {course.name} · {course.subjects.length} предметов · {totalCfu} CFU всего
        </p>
      </div>

      <div className="space-y-6">
        {years.map((y) => (
          <div key={y ?? "x"}>
            <h2 className="font-serif text-xl text-navy mb-3">
              {y ? YEAR_LABELS[y as number] ?? `Anno ${y}` : "Другое"}
            </h2>
            <ul className="space-y-2">
              {byYear.get(y)!.map((s, i) => (
                <li key={i}
                    className="bg-white/70 border border-navy/10 rounded-lg
                               px-4 py-3 flex justify-between items-start">
                  <div className="flex-1 pr-3">
                    <div className="font-sans text-navy text-[15px] leading-snug">
                      {s.name}
                    </div>
                    {s.optional && (
                      <div className="font-sans text-[11px] text-gold mt-1">
                        per scelta · по выбору
                      </div>
                    )}
                  </div>
                  <div className="font-serif text-navy text-lg whitespace-nowrap">
                    {s.cfu} <span className="text-xs text-navy/50">CFU</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="font-sans text-[11px] text-navy/40 mt-8 leading-relaxed">
        Источник: corsi.unipr.it, блок «Cosa imparerai».
        Подробная программа предметов (семестр, преподаватель, программа) —
        на офиц. сайте курса.
      </p>
    </div>
  );
}
