import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsee } from '../hooks/useIsee';
import type { IseeCategory, IseeBranch } from '../types/isee';

// ── helpers ───────────────────────────────────────────────────────────────────

function getVisibleBranches(cat: IseeCategory, sel: Record<string, string>): IseeBranch[] {
  return cat.decision_tree.branches.filter((b) => {
    if (!b.show_if) return true;
    return sel[`${cat.id}.${b.show_if.branch}`] === b.show_if.option;
  });
}

// ── Overview accordion ────────────────────────────────────────────────────────

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
          <p className="font-serif text-navy/70 text-sm mb-3 leading-relaxed">{category.description_ru}</p>

          {/* Base doc — always required */}
          {category.base_document_ru && (
            <div className="bg-cream border border-gold/40 rounded-xl px-4 py-3 mb-4">
              <p className="font-serif text-navy/50 text-[10px] uppercase tracking-widest mb-1">Всегда нужен</p>
              <p className="font-serif text-navy text-sm">{category.base_document_ru}</p>
              {category.base_cost_ru && (
                <p className="font-serif text-gold/80 text-[11px] italic mt-1">{category.base_cost_ru}</p>
              )}
            </div>
          )}

          {category.decision_tree.per_person_ru && (
            <div className="flex gap-2 mb-3 bg-gold/10 border border-gold/40 rounded-xl px-3 py-2">
              <span className="text-gold flex-shrink-0 text-sm">⚠</span>
              <p className="font-serif text-navy/80 text-xs leading-relaxed">{category.decision_tree.per_person_ru}</p>
            </div>
          )}

          {category.decision_tree.branches.map((branch) => (
            <div key={branch.id} className="mb-4">
              <p className="font-serif text-navy text-sm font-bold mb-1.5">
                {branch.show_if && (
                  <span className="font-serif text-gold text-[11px] font-normal mr-1">↳ если применимо: </span>
                )}
                {branch.question_ru}
              </p>
              <div className="flex flex-col gap-2">
                {branch.options.map((opt) => (
                  <div key={opt.id} className="border-l-2 border-gold/50 pl-3 py-0.5">
                    <p className="font-serif text-navy text-sm font-medium">{opt.label_ru}</p>
                    {opt.note_ru && (
                      <p className="font-serif text-navy/50 text-xs italic mt-0.5 leading-relaxed">{opt.note_ru}</p>
                    )}
                    {opt.documents_ru.filter(Boolean).map((d, i) => (
                      <p key={i} className="font-serif text-navy/65 text-xs leading-relaxed mt-0.5">— {d}</p>
                    ))}
                    {opt.cost_ru && (
                      <p className="font-serif text-gold/80 text-[11px] italic mt-0.5">{opt.cost_ru}</p>
                    )}
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

// ── Main page ─────────────────────────────────────────────────────────────────

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

  // Only check visible branches (respects show_if)
  const allAnswered = isee.categories.every((cat) =>
    getVisibleBranches(cat, selections).every((b) => !!selections[`${cat.id}.${b.id}`])
  );

  // Build personalised document list
  const collectDocuments = () => {
    return isee.categories.map((cat) => {
      const items: Array<{ doc: string; note: string; cost: string }> = [];

      if (cat.base_document_ru) {
        items.push({ doc: cat.base_document_ru, note: '', cost: cat.base_cost_ru || '' });
      }

      for (const branch of cat.decision_tree.branches) {
        // Respect show_if — skip if condition not met
        if (branch.show_if) {
          const condKey = `${cat.id}.${branch.show_if.branch}`;
          if (selections[condKey] !== branch.show_if.option) continue;
        }

        const key = `${cat.id}.${branch.id}`;
        const chosen = selections[key];
        if (!chosen) continue;

        const opt = branch.options.find((o) => o.id === chosen);
        if (!opt) continue;

        const validDocs = opt.documents_ru.filter(Boolean);
        validDocs.forEach((d, i) => {
          items.push({
            doc: d,
            note: i === 0 ? (opt.note_ru || '') : '',
            cost: i === 0 ? (opt.cost_ru || '') : '',
          });
        });
      }

      return { category: cat.title_ru, items };
    });
  };

  const docBlocks = allAnswered ? collectDocuments() : [];
  const totalDocs = docBlocks.reduce((s, b) => s + b.items.filter((i) => i.doc).length, 0);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">

      {/* Header */}
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
        <div>
          <p className="font-serif text-gold text-[10px] uppercase tracking-widest">ISEE parificato</p>
          <h1 className="font-serif text-navy text-2xl font-bold leading-tight">Документы для расчёта</h1>
        </div>
      </div>

      {/* Family definition — always visible, both modes */}
      <div className="mx-6 mt-5 bg-gold/10 border border-gold/50 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy text-sm font-bold mb-1.5">Кто входит в «семью» для ISEE?</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{isee.intro_ru.family_definition_ru}</p>
      </div>

      {/* What is ISEE — overview only */}
      {mode === 'overview' && (
        <div className="mx-6 mt-4 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
          <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{isee.intro_ru.what_is_ru}</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed mb-2">{isee.intro_ru.who_counts_ru}</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed mb-3">{isee.intro_ru.where_ru}</p>
          <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2">
            <p className="font-serif text-navy/80 text-xs font-bold leading-relaxed">{isee.intro_ru.key_rule_ru}</p>
          </div>
          {isee.intro_ru.cost_hint_ru && (
            <p className="font-serif text-navy/50 text-xs italic mt-2 leading-relaxed">{isee.intro_ru.cost_hint_ru}</p>
          )}
        </div>
      )}

      {/* Mode switcher */}
      <div className="px-6 mt-5 flex gap-2">
        <button
          onClick={() => setMode('overview')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'overview' ? 'bg-navy text-cream' : 'bg-soft-cream text-navy border border-navy/20')
          }
        >
          Все документы
        </button>
        <button
          onClick={() => setMode('builder')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'builder' ? 'bg-navy text-cream' : 'bg-soft-cream text-navy border border-navy/20')
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
            Ответь на вопросы — список сформируется внизу
          </p>

          {isee.categories.map((cat) => {
            const vis = getVisibleBranches(cat, selections);
            const answeredCount = vis.filter((b) => !!selections[`${cat.id}.${b.id}`]).length;
            const isDone = answeredCount === vis.length;

            return (
              <div key={cat.id} className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={isDone ? 'text-gold' : 'text-navy/40'}>◆</span>
                  <h2 className="font-serif text-navy text-lg font-bold flex-1">{cat.title_ru}</h2>
                  <span className={
                    'font-serif text-xs ' +
                    (isDone ? 'text-gold' : 'text-navy/40')
                  }>
                    {answeredCount}/{vis.length}
                  </span>
                </div>
                <p className="font-serif text-navy/60 text-xs mb-3 leading-relaxed">{cat.description_ru}</p>

                {cat.decision_tree.per_person_ru && (
                  <div className="flex gap-2 mb-3 bg-gold/10 border border-gold/40 rounded-xl px-3 py-2">
                    <span className="text-gold flex-shrink-0 text-sm">⚠</span>
                    <p className="font-serif text-navy/80 text-xs leading-relaxed">{cat.decision_tree.per_person_ru}</p>
                  </div>
                )}

                {vis.map((branch) => {
                  const key = `${cat.id}.${branch.id}`;
                  const chosen = selections[key];
                  return (
                    <div key={branch.id} className="mb-4">
                      {branch.show_if && (
                        <p className="font-serif text-gold text-[11px] italic mb-1">↳ уточни:</p>
                      )}
                      <p className="font-serif text-navy text-sm font-bold mb-2">{branch.question_ru}</p>
                      <div className="flex flex-col gap-2">
                        {branch.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setSelections((s) => ({ ...s, [key]: opt.id }))}
                            className={
                              'w-full text-left rounded-xl px-4 py-3 font-serif text-sm transition-all border ' +
                              (chosen === opt.id
                                ? 'bg-navy text-cream border-navy'
                                : 'bg-soft-cream text-navy border-navy/20')
                            }
                          >
                            {opt.label_ru}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Result block */}
          <div className={
            'relative rounded-2xl p-5 mt-2 transition-all ' +
            (allAnswered ? 'bg-navy' : 'bg-navy/30')
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

            {!allAnswered ? (
              <p className="font-serif text-cream/50 text-sm italic">
                Ответь на все вопросы выше — список сформируется здесь
              </p>
            ) : (
              <>
                <p className="font-serif text-cream/50 text-xs mb-4">
                  Итого документов: {totalDocs}
                </p>

                {docBlocks.map((block, bi) => (
                  <div key={bi} className="mb-5">
                    <h3 className="font-serif text-cream text-sm font-bold uppercase tracking-wide mb-2 opacity-70">
                      {block.category}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {block.items.map((item, ii) => (
                        <div key={ii} className="flex gap-2 items-start">
                          <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-cream/90 text-xs leading-relaxed">{item.doc}</p>
                            {item.note && (
                              <p className="font-serif text-cream/45 text-[11px] italic mt-0.5 leading-relaxed">
                                {item.note}
                              </p>
                            )}
                            {item.cost && (
                              <p className="font-serif text-gold/70 text-[11px] mt-0.5 leading-relaxed">
                                {item.cost}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-t border-cream/20 pt-3 mt-1">
                  <p className="font-serif text-cream/40 text-[11px] italic">
                    Каждый документ: апостиль + перевод на итальянский
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Final steps + tips — always */}
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
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
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
