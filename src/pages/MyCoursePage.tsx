// src/pages/MyCoursePage.tsx
// Экран-хаб "Твой курс" — две карточки:
//   1. Твои предметы и план учёбы → /path/uni/my-course/subjects
//   2. Стоимость обучения и стипендия → /path/uni/my-course/finance

import { useNavigate } from "react-router-dom";
import { useMyCourse } from "../hooks/useCourse";

export default function MyCoursePage() {
  const navigate = useNavigate();
  const { course, loading } = useMyCourse();

  if (loading) return <div className="p-6 text-navy/60">Загрузка…</div>;
  if (!course) {
    navigate("/path");
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-cream px-5 pt-12 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="font-sans text-navy/60 mb-4">← назад</button>

      <div className="mb-6">
        <span className="font-sans text-[10px] uppercase tracking-widest text-gold">
          твой курс
        </span>
        <h1 className="font-serif text-3xl text-navy leading-tight mt-1">
          {course.name}
        </h1>
        <p className="font-sans text-sm text-navy/60 mt-2">
          {course.dept_name}
        </p>
      </div>

      <div className="space-y-3">
        <SectionCard
          eyebrow="01 — предметы"
          title="Твои предметы и план учёбы"
          desc={`${course.subjects.length} дисциплин · CFU по годам`}
          onClick={() => navigate("/path/uni/my-course/subjects")}
        />
        <SectionCard
          eyebrow="02 — финансы"
          title="Стоимость обучения и стипендия"
          desc="ER.GO 2025/26 · расчёт под твой статус"
          onClick={() => navigate("/path/uni/my-course/finance")}
        />
      </div>
    </div>
  );
}

function SectionCard({ eyebrow, title, desc, onClick }: {
  eyebrow: string; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-navy text-cream rounded-xl px-5 py-5 text-left
                 hover:bg-navy/90 transition">
      <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
        ⌐ {eyebrow} ¬
      </div>
      <div className="font-serif text-xl mt-1">{title}</div>
      <div className="font-sans text-sm text-cream/70 mt-1">{desc}</div>
    </button>
  );
}
