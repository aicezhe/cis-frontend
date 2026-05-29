// src/components/path/MyCourseButton.tsx
// Синяя кнопка "Твой курс" — фирменный navy с угловыми скобками.
// Ставится наверху раздела Универ в Path.

import { useNavigate } from "react-router-dom";
import { useMyCourse } from "../../hooks/useCourse";

export function MyCourseButton() {
  const navigate = useNavigate();
  const { course, loading } = useMyCourse();

  if (loading) return null;
  if (!course) {
    return (
      <button
        onClick={() => navigate("/onboarding")}
        className="w-full bg-cream/40 border border-navy/20 rounded-xl px-5 py-4
                   font-sans text-navy/70 text-sm hover:bg-cream/60 transition"
      >
        Ты ещё не выбрал курс — пройди тест
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate("/path/uni/my-course")}
      className="group w-full bg-navy text-cream rounded-xl px-5 py-4
                 flex items-center justify-between hover:bg-navy/90 transition"
    >
      <div className="flex flex-col items-start text-left">
        <span className="font-sans text-[10px] uppercase tracking-widest text-gold">
          ⌐ твой курс ¬
        </span>
        <span className="font-serif text-lg mt-0.5">{course.name}</span>
      </div>
      <span className="font-sans text-gold text-xl group-hover:translate-x-1 transition">→</span>
    </button>
  );
}
