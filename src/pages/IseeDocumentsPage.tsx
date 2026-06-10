import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsee } from '../hooks/useIsee';
import type { IseeCategory, IseeBranch } from '../types/isee';

// ─── Overview accordion ───────────────────────────────────────────────────────

function CategoryAccordion({ category }: { category: IseeCategory }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full relative bg-navy text-cream rounded-2xl px-5 py-4 text-left flex justify-between items-center"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-8 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-8 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <span className="font-serif text-lg ml-2">{category.title_ru}</span>
        <span className="text-gold text-xl flex-shrink-0">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="bg-soft-cream border border-navy/15 rounded-b-2xl px-5 py-4 -mt-1">
          <p className="font-serif text-navy/70 text-sm mb-4 leading-relaxed">{category.description_ru}</p>

          {/* base doc */}
          <div className="bg-cream border border-gold/40 rounded-xl px-4 py-3 mb-4">
            <p className="font-serif text-navy/60 text-[10px] uppercase tracking-widest mb-1">Базовый документ</p>
            <p className="font-serif text-navy text-sm">{category.base_document_ru}</p>
          </div>

          {category.decision_tree.per_person_ru && (
            <div className="flex gap-2 mb-4">
              <span className="text-gold flex-shrink-0">⚠</span>
              <p className="font-serif text-navy/80 text-xs leading-relaxed">{category.decision_tree.per_person_ru}</p>
            </div>
          )}

          {category.decision_tree.branches.map((branch: IseeBranch) => (
            <div key={branch.id} className="mb-4">
              <p className="font-serif text-navy text-sm font-bold mb-2">{branch.question_ru}</p>
              <div className="flex flex-col gap-2">
                {branch.options.map((opt) => (
                  <div key={opt.id} className="border-l-2 border-gold/60 pl-3">
                    <p className="font-serif text-navy text-sm mb-1">{opt.label_ru}</p>
                    {opt.documents_ru.filter(Boolean).map((d, i) => (
                      <p key={i} className="font-serif text-navy/60 text-xs leading-relaxed">— {d}</p>
                    ))}
                    {opt.sub_branches?.map((sb, i) => (
                      <div key={i} className="mt-1.5 pl-2 border-l border-navy/20">
                        <p className="font-serif text-navy/70 text-xs font-bold">{sb.case_ru}:</p>
                        {sb.documents_ru.map((d, j) => (
                          <p key={j} className="font-serif text-navy/55 text-xs">— {d}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IseeDocumentsPage() {
  const navigate = useNavigate();
  const { isee, loading } = useIsee();
  const [mode, setMode] = useState<'overview' | 'builder'>('overview');
  const [selections, setSelections] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (!isee) return null;

  // Собрать персональный список документов из выбранных опций
  const collectDocuments = (): Array<{ category: string; docs: string[] }> => {
    return isee.categories.map((cat) => {
      const docs: string[] = [cat.base_document_ru];
      for (const branch of cat.decision_tree.branches) {
        const key = `${cat.id}.${branch.id}`;
        const chosen = selections[key];
        if (chosen) {
          const opt = branch.options.find((o) => o.id === chosen);
          if (opt) {
            docs.push(...opt.documents_ru.filter(Boolean));
            opt.sub_branches?.forEach((sb) => {
              docs.push(`[${sb.case_ru}]: ${sb.documents_ru.join('; ')}`);
            });
          }
        }
      }
      return { category: cat.title_ru, docs };
    });
  };

  const allAnswered = isee.categories.every((cat) =>
    cat.decision_tree.branches.every((branch) => {
      const key = `${cat.id}.${branch.id}`;
      return !!selections[key];
    })
  );

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">

      {/* Хедер */}
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
        <div>
          <p className="font-serif text-gold text-[10px] uppercase tracking-widest">ISEE parificato</p>
          <h1 className="font-serif text-navy text-2xl font-bold leading-tight">Документы для расчёта</h1>
        </div>
      </div>

      {/* Intro-блок */}
      {mode === 'overview' && (
        <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
          <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{isee.intro_ru.what_is_ru}</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed mb-2">{isee.intro_ru.who_counts_ru}</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed mb-3">{isee.intro_ru.where_ru}</p>
          <div className="bg-gold/15 border border-gold/40 rounded-xl px-4 py-2">
            <p className="font-serif text-navy text-xs font-bold leading-relaxed">{isee.intro_ru.key_rule_ru}</p>
          </div>
        </div>
      )}

      {/* Переключатель режимов */}
      <div className="px-6 mt-5 flex gap-2">
        <button
          onClick={() => setMode('overview')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'overview'
              ? 'bg-navy text-cream'
              : 'bg-soft-cream text-navy border border-navy/20')
          }
        >
          Все документы
        </button>
        <button
          onClick={() => setMode('builder')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'builder'
              ? 'bg-navy text-cream'
              : 'bg-soft-cream text-navy border border-navy/20')
          }
        >
          Мой список
        </button>
      </div>

      {/* ── OVERVIEW ── */}
      {mode === 'overview' && (
        <div className="px-6 mt-5">
          <p className="font-serif text-gold text-sm italic mb-3">3 категории документов</p>
          {isee.categories.map((cat) => (
            <CategoryAccordion key={cat.id} category={cat} />
          ))}
        </div>
      )}

      {/* ── BUILDER ── */}
      {mode === 'builder' && (
        <div className="px-6 mt-5">
          <p className="font-serif text-gold text-sm italic mb-4">
            Ответь на вопросы — получи персональный список
          </p>

          {isee.categories.map((cat) => (
            <div key={cat.id} className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gold">◆</span>
                <h2 className="font-serif text-navy text-lg font-bold">{cat.title_ru}</h2>
              </div>
              <p className="font-serif text-navy/60 text-xs mb-3 leading-relaxed">{cat.description_ru}</p>

              {cat.decision_tree.per_person_ru && (
                <div className="flex gap-2 mb-3 bg-gold/10 border border-gold/40 rounded-xl px-4 py-2">
                  <span className="text-gold flex-shrink-0 text-sm">⚠</span>
                  <p className="font-serif text-navy/80 text-xs leading-relaxed">{cat.decision_tree.per_person_ru}</p>
                </div>
              )}

              {cat.decision_tree.branches.map((branch) => {
                const key = `${cat.id}.${branch.id}`;
                const chosen = selections[key];
                return (
                  <div key={branch.id} className="mb-4">
                    <p className="font-serif text-navy text-sm font-bold mb-2">{branch.question_ru}</p>
                    <div className="flex flex-col gap-2">
                      {branch.options.map((opt) => {
                        const active = chosen === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setSelections((s) => ({ ...s, [key]: opt.id }))
                            }
                            className={
                              'w-full text-left rounded-xl px-4 py-3 font-serif text-sm transition-all border ' +
                              (active
                                ? 'bg-navy text-cream border-navy'
                                : 'bg-soft-cream text-navy border-navy/20')
                            }
                          >
                            {opt.label_ru}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Результат */}
          <div className={
            'relative rounded-2xl p-5 mt-2 transition-all ' +
            (allAnswered ? 'bg-navy' : 'bg-navy/40')
          }>
            {allAnswered && (
              <>
                <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
                <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
                <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
              </>
            )}
            <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-3">
              ⌐ твой список документов ¬
            </p>

            {!allAnswered && (
              <p className="font-serif text-cream/50 text-sm italic">
                Ответь на все вопросы выше — список сформируется здесь
              </p>
            )}

            {allAnswered && collectDocuments().map((block, i) => (
              <div key={i} className="mb-5">
                <h3 className="font-serif text-cream text-base font-bold mb-2">{block.category}</h3>
                <div className="flex flex-col gap-1.5">
                  {block.docs.map((d, j) => (
                    <div key={j} className="flex gap-2 items-start">
                      <span className="text-gold flex-shrink-0 mt-0.5">◆</span>
                      <p className="font-serif text-cream/80 text-xs leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {allAnswered && (
              <div className="border-t border-cream/20 pt-3 mt-1">
                <p className="font-serif text-cream/50 text-[11px] italic">
                  Каждый документ — апостиль + перевод на итальянский
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Финальные шаги + советы — всегда */}
      <div className="mx-6 mt-6 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-3">Что делать дальше</p>
        <ol className="flex flex-col gap-2">
          {isee.final_steps_ru.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="font-serif text-gold font-bold text-sm flex-shrink-0">{i + 1}.</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-6 mt-4 bg-gold/10 border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-3">Советы</p>
        <div className="flex flex-col gap-2">
          {isee.tips_ru.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5">◆</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Требования актуальны на 2026/2027 — уточняй на unipr.it/en/tuition-fees
      </p>
    </div>
  );
}
