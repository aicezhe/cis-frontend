// src/pages/MyCourseFinancePage.tsx
// Стоимость обучения и стипендия ER.GO 2025/26.
// Расчёт автоматический под статус юзера + STEM-надбавка если is_stem курса.

import { useNavigate } from "react-router-dom";
import { useMyCourse, useScholarshipForUser } from "../hooks/useCourse";

const STATUS_LABEL = {
  fuori_sede: "fuori sede · снимаешь жильё в Парме",
  pendolare:  "pendolare · ездишь из другого города",
  in_sede:    "in sede · прописан в Парме",
};

export default function MyCourseFinancePage() {
  const navigate = useNavigate();
  const { course, loading } = useMyCourse();
  const { scholarship, computed } = useScholarshipForUser(course);

  if (loading || !scholarship) return <div className="p-6 text-navy/60">Загрузка…</div>;
  if (!course) { navigate("/path"); return null; }

  return (
    <div className="min-h-screen bg-soft-cream px-5 pt-12 pb-24">
      <button onClick={() => navigate(-1)}
              className="font-sans text-navy/60 mb-4">← назад</button>

      <div className="mb-6">
        <span className="font-sans text-[10px] uppercase tracking-widest text-gold">
          стоимость и стипендия
        </span>
        <h1 className="font-serif text-3xl text-navy leading-tight mt-1">
          Сколько стоит и что вернут
        </h1>
        <p className="font-sans text-sm text-navy/60 mt-2">
          {course.name} · {course.is_stem ? "STEM" : "не STEM"}
        </p>
      </div>

      {/* Стоимость */}
      <div className="bg-white/70 border border-navy/10 rounded-xl p-5 mb-4">
        <h2 className="font-serif text-xl text-navy mb-2">Стоимость обучения</h2>
        <p className="font-sans text-sm text-navy/80 leading-relaxed">
          Базовая такса универа зависит от ISEE и одинаковая для всех курсов.
          <span className="block mt-1 text-navy/60">
            Региональная такса: 140 €.
          </span>
        </p>
        <p className="font-sans text-[12px] text-gold mt-3">
          Идонеи стипендии ER.GO освобождаются от tasse полностью.
        </p>
      </div>

      {/* Расчёт под юзера */}
      {computed && (
        <div className="bg-navy text-cream rounded-xl p-5 mb-4">
          <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
            ⌐ твой расчёт ¬
          </div>
          <div className="font-sans text-xs text-cream/60 mt-1">
            {STATUS_LABEL[computed.status]}
          </div>
          <div className="font-serif text-4xl text-cream mt-3">
            {computed.total_eur.toLocaleString("it-IT")} €
            <span className="text-sm text-cream/60 ml-2">в год</span>
          </div>
          <div className="font-sans text-xs text-cream/70 mt-2">
            База {computed.base.toLocaleString("it-IT")} €
            {computed.applicable_bonuses.length > 0 && (
              <> · применены бонусы:{" "}
                {computed.applicable_bonuses.map(b => b.modifier).join(" ")}
              </>
            )}
          </div>
        </div>
      )}

      {/* Условия и бонусы */}
      <div className="bg-white/70 border border-navy/10 rounded-xl p-5 mb-4">
        <h2 className="font-serif text-xl text-navy mb-3">Условия</h2>
        <div className="font-sans text-sm text-navy/80 space-y-2">
          <div>
            <span className="text-navy/50">Порог ISEE:</span>{" "}
            ≤ {scholarship.isee_threshold_eur.toLocaleString("it-IT")} €
          </div>
          <div className="text-navy/60 text-[12px] mt-1">
            {scholarship.isee_note_ru}
          </div>
        </div>

        <h3 className="font-serif text-sm text-navy mt-4 mb-2 uppercase tracking-wider">
          Возможные бонусы
        </h3>
        <ul className="space-y-2">
          {scholarship.bonuses.map(b => {
            const active = computed?.applicable_bonuses.some(x => x.code === b.code);
            return (
              <li key={b.code}
                  className={`flex justify-between text-sm font-sans
                              ${active ? "text-navy" : "text-navy/60"}`}>
                <span>
                  {active && "✓ "}{b.title_ru}
                  <span className="block text-[11px] text-navy/40">
                    {b.condition_ru}
                  </span>
                </span>
                <span className="font-serif text-gold">{b.modifier}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Что даёт стипендия */}
      <div className="bg-white/70 border border-navy/10 rounded-xl p-5 mb-4">
        <h2 className="font-serif text-xl text-navy mb-3">Что входит</h2>
        <ul className="space-y-2 font-sans text-sm text-navy/80 list-disc pl-5">
          {scholarship.benefits.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>

      {/* Как подать */}
      <div className="bg-white/70 border border-navy/10 rounded-xl p-5 mb-4">
        <h2 className="font-serif text-xl text-navy mb-3">Как подать</h2>
        <ol className="space-y-2 font-sans text-sm text-navy/80 list-decimal pl-5">
          {scholarship.how_to_apply_ru.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <a href={scholarship.source_bando} target="_blank" rel="noreferrer"
           className="block mt-4 font-sans text-xs text-gold underline">
          Открыть официальный bando →
        </a>
      </div>

      {/* Дедлайны */}
      <div className="bg-white/70 border border-navy/10 rounded-xl p-5 mb-4">
        <h2 className="font-serif text-xl text-navy mb-3">Дедлайны {scholarship.academic_year}</h2>
        <ul className="space-y-1 font-sans text-sm text-navy/80">
          {Object.entries(scholarship.deadlines_2025_26).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="text-navy/60">{k.replace(/_/g, " ")}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
        <p className="font-sans text-[11px] text-navy/40 mt-3">
          {scholarship.deadlines_note_ru}
        </p>
      </div>

      <p className="font-sans text-[11px] text-navy/40 mt-2 leading-relaxed">
        {scholarship.disclaimer_ru}
      </p>
    </div>
  );
}
