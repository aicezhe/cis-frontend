import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsee } from '../hooks/useIsee';
import { Price } from '../components/Price';
import type { IseeSeed, IseePersonQuestion, IseeDocOption } from '../types/isee';

// ── модель человека в опроснике ───────────────────────────────────────────────

interface Person {
  key: string;
  label: string;
  removable: boolean;
  adult: boolean;
}

interface Member {
  uid: number;
  typeId: string;
  adult: boolean;
}

type PersonAnswers = Record<string, Record<string, string>>;

function buildRoster(isee: IseeSeed, parentsChoice: string, members: Member[]): Person[] {
  const roster: Person[] = [{ key: 'me', label: 'Ты (студент)', removable: false, adult: true }];
  if (parentsChoice === 'both') {
    roster.push({ key: 'mom', label: 'Мама', removable: false, adult: true });
    roster.push({ key: 'dad', label: 'Папа', removable: false, adult: true });
  } else if (parentsChoice === 'one') {
    roster.push({ key: 'parent', label: 'Родитель', removable: false, adult: true });
  }
  const counts: Record<string, number> = {};
  for (const m of members) {
    counts[m.typeId] = (counts[m.typeId] || 0) + 1;
    const type = isee.members_step.member_types.find((t) => t.id === m.typeId);
    const base = type?.label_ru || 'Член семьи';
    const sameType = members.filter((x) => x.typeId === m.typeId).length;
    roster.push({
      key: `m${m.uid}`,
      label: sameType > 1 ? `${base} ${counts[m.typeId]}` : base,
      removable: true,
      adult: m.adult,
    });
  }
  return roster;
}

// вопросы, обязательные для человека с учётом follow-up (ипотека)
function requiredQuestions(isee: IseeSeed, answers: Record<string, string> | undefined): IseePersonQuestion[] {
  return isee.person_questions.filter((q) => {
    if (!q.is_follow_up) return true;
    // mortgage показываем только если по недвижимости выбрана опция с follow_up === q.id
    for (const main of isee.person_questions) {
      const chosen = answers?.[main.id];
      if (!chosen) continue;
      const opt = main.options.find((o) => o.id === chosen);
      if (opt?.follow_up === q.id) return true;
    }
    return false;
  });
}

// ── карточка человека ─────────────────────────────────────────────────────────

function PersonCard({
  person, isee, answers, onAnswer, onRemove, open, onToggle,
}: {
  person: Person;
  isee: IseeSeed;
  answers: Record<string, string> | undefined;
  onAnswer: (qId: string, optId: string) => void;
  onRemove?: () => void;
  open: boolean;
  onToggle: () => void;
}) {
  const qs = requiredQuestions(isee, answers);
  const answered = qs.filter((q) => !!answers?.[q.id]).length;
  const done = answered === qs.length;

  return (
    <div className={
      'rounded-2xl border overflow-hidden ' +
      (done ? 'border-gold/60 bg-soft-cream' : 'border-navy/20 bg-soft-cream')
    }>
      <div className="w-full px-4 py-3.5 flex items-center gap-3">
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left">
          <span className={done ? 'text-gold' : 'text-navy/30'}>{done ? '✓' : '◆'}</span>
          <span className="font-serif text-navy text-base font-bold flex-1">{person.label}</span>
          <span className={'font-serif text-xs ' + (done ? 'text-gold' : 'text-navy/40')}>
            {answered}/{qs.length}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            className={'text-navy transition-transform ' + (open ? 'rotate-180' : '')}
            fill="currentColor"
          >
            <path d="M7 10L1 4h12L7 10z" />
          </svg>
        </button>
        {onRemove && (
          <button onClick={onRemove} className="text-navy/40 text-lg px-1" aria-label="Убрать">
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-navy/10 pt-3 flex flex-col gap-4">
          {qs.map((q) => (
            <div key={q.id}>
              <p className="font-serif text-navy text-sm font-bold mb-2">{q.question_ru}</p>
              <div className="flex flex-col gap-1.5">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onAnswer(q.id, opt.id)}
                    className={
                      'w-full text-left rounded-xl px-3.5 py-2.5 font-serif text-sm transition-all border ' +
                      (answers?.[q.id] === opt.id
                        ? 'bg-navy text-cream border-navy'
                        : 'bg-cream text-navy border-navy/15')
                    }
                  >
                    {opt.label_ru}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── обзорный режим: все документы статично ───────────────────────────────────

function OverviewDocs({ isee }: { isee: IseeSeed }) {
  const renderOpt = (opt: IseeDocOption) => (
    <div key={opt.id} className="border-l-2 border-gold/50 pl-3 py-0.5">
      <p className="font-serif text-navy text-sm font-medium">{opt.label_ru}</p>
      {opt.note_ru && <p className="font-serif text-navy/50 text-xs italic mt-0.5">{opt.note_ru}</p>}
      {opt.documents_ru.map((d, i) => (
        <p key={i} className="font-serif text-navy/65 text-xs leading-relaxed mt-0.5">— {d}</p>
      ))}
      {opt.cost_ru && <p className="font-serif text-gold/80 text-[11px] mt-0.5 font-bold">{opt.cost_ru}</p>}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Базовая справка */}
      <div className="bg-cream border border-gold/40 rounded-xl px-4 py-3">
        <p className="font-serif text-navy/50 text-[10px] uppercase tracking-widest mb-1">Всегда нужна — одна на семью</p>
        <p className="font-serif text-navy text-sm">{isee.family_cert.document_ru}</p>
        <p className="font-serif text-gold/80 text-[11px] mt-1 font-bold">{isee.family_cert.cost_ru}</p>
      </div>

      {/* Родители */}
      <div className="bg-soft-cream border border-navy/15 rounded-2xl px-4 py-4">
        <p className="font-serif text-navy text-sm font-bold mb-2">{isee.parents_step.question_ru}</p>
        <div className="flex flex-col gap-2">
          {isee.parents_step.options.map(renderOpt)}
        </div>
        <p className="font-serif text-navy text-sm font-bold mt-4 mb-2">{isee.parents_step.reason_question_ru}</p>
        <div className="flex flex-col gap-2">
          {isee.parents_step.reasons.map(renderOpt)}
        </div>
      </div>

      {/* Вопросы по каждому человеку */}
      <div className="bg-soft-cream border border-navy/15 rounded-2xl px-4 py-4">
        <p className="font-serif text-gold text-xs mb-3 font-bold">Для КАЖДОГО члена семьи 18+ (включая тебя):</p>
        {isee.person_questions.map((q) => (
          <div key={q.id} className="mb-4 last:mb-0">
            <p className="font-serif text-navy text-sm font-bold mb-2">{q.question_ru}</p>
            <div className="flex flex-col gap-2">
              {q.options.filter((o) => o.documents_ru.length > 0).map(renderOpt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── главная страница ──────────────────────────────────────────────────────────

let nextUid = 1;

export default function IseeDocumentsPage() {
  const navigate = useNavigate();
  const { isee, loading } = useIsee();

  const [mode, setMode] = useState<'overview' | 'builder'>('builder');
  const [parentsChoice, setParentsChoice] = useState('');
  const [parentsReason, setParentsReason] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [personAnswers, setPersonAnswers] = useState<PersonAnswers>({});
  const [openPerson, setOpenPerson] = useState<string>('me');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  if (!isee) return null;

  const roster = buildRoster(isee, parentsChoice, members);
  const adults = roster.filter((p) => p.adult);
  const minors = roster.filter((p) => !p.adult);

  const parentsDone = !!parentsChoice && (parentsChoice !== 'one' || !!parentsReason);
  const personsDone = adults.every((p) => {
    const qs = requiredQuestions(isee, personAnswers[p.key]);
    return qs.every((q) => !!personAnswers[p.key]?.[q.id]);
  });
  const allAnswered = parentsDone && personsDone;

  function addMember(typeId: string, adult: boolean) {
    setMembers((m) => [...m, { uid: nextUid++, typeId, adult }]);
  }

  function removeMember(uid: number) {
    setMembers((m) => m.filter((x) => x.uid !== uid));
    setPersonAnswers((a) => {
      const copy = { ...a };
      delete copy[`m${uid}`];
      return copy;
    });
  }

  // ── собрать итоговый список ──
  // стрелочная константа, а не function declaration — иначе TS теряет narrowing isee
  const collectResult = () => {
    type DocItem = { doc: string; note?: string; cost?: string };
    const familyDocs: DocItem[] = [
      { doc: isee.family_cert.document_ru, note: isee.family_cert.note_ru, cost: isee.family_cert.cost_ru },
    ];

    const parentOpt = isee.parents_step.options.find((o) => o.id === parentsChoice);
    parentOpt?.documents_ru.forEach((d) => familyDocs.push({ doc: d, cost: parentOpt.cost_ru }));
    if (parentsChoice === 'one' && parentsReason) {
      const reason = isee.parents_step.reasons.find((r) => r.id === parentsReason);
      reason?.documents_ru.forEach((d) => familyDocs.push({ doc: d, cost: reason.cost_ru }));
    }

    const perPerson = adults.map((p) => {
      const docs: DocItem[] = [];
      const qs = requiredQuestions(isee, personAnswers[p.key]);
      for (const q of qs) {
        const chosen = personAnswers[p.key]?.[q.id];
        if (!chosen) continue;
        const opt = q.options.find((o) => o.id === chosen);
        opt?.documents_ru.forEach((d, i) => {
          docs.push({ doc: d, note: i === 0 ? opt.note_ru : undefined, cost: i === 0 ? opt.cost_ru : undefined });
        });
      }
      return { person: p.label, docs };
    });

    const totalDocs = familyDocs.length + perPerson.reduce((s, x) => s + x.docs.length, 0);
    const lc = isee.legalization_cost;
    const costMin = totalDocs * (lc.apostille_min_eur + lc.translation_min_eur);
    const costMax = totalDocs * (lc.apostille_max_eur + lc.translation_max_eur);

    return { familyDocs, perPerson, totalDocs, costMin, costMax };
  };

  const result = allAnswered ? collectResult() : null;
  const sch = isee.scholarship_estimate;

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

      {/* Кто в семье */}
      <div className="mx-6 mt-5 bg-gold/10 border border-gold/50 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy text-sm font-bold mb-1.5">Кто входит в «семью» для ISEE?</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{isee.intro_ru.family_definition_ru}</p>
      </div>

      {/* Переключатель */}
      <div className="px-6 mt-5 flex gap-2">
        <button
          onClick={() => setMode('builder')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'builder' ? 'bg-navy text-cream' : 'bg-soft-cream text-navy border border-navy/20')
          }
        >
          Собрать мой список
        </button>
        <button
          onClick={() => setMode('overview')}
          className={
            'flex-1 rounded-xl py-3 font-serif text-sm transition-all ' +
            (mode === 'overview' ? 'bg-navy text-cream' : 'bg-soft-cream text-navy border border-navy/20')
          }
        >
          Все документы
        </button>
      </div>

      {/* ── OVERVIEW ── */}
      {mode === 'overview' && (
        <div className="px-6 mt-5">
          <div className="bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4 mb-4">
            <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{isee.intro_ru.what_is_ru}</p>
            <p className="font-serif text-navy/70 text-sm leading-relaxed">{isee.intro_ru.where_ru}</p>
          </div>
          <OverviewDocs isee={isee} />
        </div>
      )}

      {/* ── BUILDER ── */}
      {mode === 'builder' && (
        <div className="px-6 mt-6">

          {/* Шаг 1: родители */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif text-gold font-bold">1.</span>
            <p className="font-serif text-navy text-base font-bold">{isee.parents_step.question_ru}</p>
          </div>
          <div className="flex flex-col gap-2">
            {isee.parents_step.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setParentsChoice(opt.id); if (opt.id !== 'one') setParentsReason(''); }}
                className={
                  'w-full text-left rounded-xl px-4 py-3 font-serif text-sm transition-all border ' +
                  (parentsChoice === opt.id
                    ? 'bg-navy text-cream border-navy'
                    : 'bg-soft-cream text-navy border-navy/20')
                }
              >
                {opt.label_ru}
              </button>
            ))}
          </div>

          {parentsChoice === 'one' && (
            <div className="mt-4">
              <p className="font-serif text-gold text-[11px] mb-1 font-bold">↳ уточни:</p>
              <p className="font-serif text-navy text-sm font-bold mb-2">{isee.parents_step.reason_question_ru}</p>
              <div className="flex flex-col gap-2">
                {isee.parents_step.reasons.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setParentsReason(r.id)}
                    className={
                      'w-full text-left rounded-xl px-4 py-3 font-serif text-sm transition-all border ' +
                      (parentsReason === r.id
                        ? 'bg-navy text-cream border-navy'
                        : 'bg-soft-cream text-navy border-navy/20')
                    }
                  >
                    {r.label_ru}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Шаг 2: остальные прописанные */}
          <div className="flex items-center gap-2 mt-8 mb-1">
            <span className="font-serif text-gold font-bold">2.</span>
            <p className="font-serif text-navy text-base font-bold">{isee.members_step.title_ru}</p>
          </div>
          <p className="font-serif text-navy/60 text-xs leading-relaxed mb-3">{isee.members_step.note_ru}</p>

          <div className="flex flex-wrap gap-2">
            {isee.members_step.member_types.map((t) => (
              <div key={t.id} className="flex rounded-full border border-navy/25 overflow-hidden">
                <button
                  onClick={() => addMember(t.id, true)}
                  className="font-serif text-navy text-xs px-3 py-2 bg-soft-cream"
                >
                  + {t.label_ru}
                </button>
                <button
                  onClick={() => addMember(t.id, false)}
                  className="font-serif text-navy/50 text-[10px] px-2 py-2 bg-cream border-l border-navy/15"
                  title="Младше 18 лет"
                >
                  &lt;18
                </button>
              </div>
            ))}
          </div>
          <p className="font-serif text-navy/40 text-[10px] italic mt-1.5">
            Кнопка «&lt;18» — для членов семьи младше 18 (документы по ним не нужны)
          </p>

          {/* Превью всех добавленных — и взрослых, и младше 18 — чипами сразу под
              кнопками, чтобы было видно, что человек добавился (детали по
              взрослым — ниже, в шаге 3). Метки берём из roster, чтобы совпадали
              с карточками. */}
          {roster.some((p) => p.removable) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {roster.filter((p) => p.removable).map((p) => {
                const uid = Number(p.key.slice(1));
                return (
                  <span
                    key={p.key}
                    className={
                      'inline-flex items-center gap-1.5 font-serif text-xs rounded-full px-3 py-1.5 border ' +
                      (p.adult
                        ? 'text-navy/85 bg-soft-cream border-navy/25'
                        : 'text-navy/55 bg-cream border-navy/15')
                    }
                  >
                    {p.label}{!p.adult && ' (младше 18)'}
                    <button onClick={() => removeMember(uid)} className="text-navy/40" aria-label="Убрать">×</button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Шаг 3: вопросы по каждому 18+ */}
          {parentsDone && (
            <>
              <div className="flex items-center gap-2 mt-8 mb-1">
                <span className="font-serif text-gold font-bold">3.</span>
                <p className="font-serif text-navy text-base font-bold">Теперь — про каждого (18+)</p>
              </div>
              <p className="font-serif text-navy/60 text-xs leading-relaxed mb-3">
                Доходы, счета и имущество — отдельно по каждому взрослому из твоей семьи.
              </p>

              <div className="flex flex-col gap-3">
                {adults.map((p) => {
                  const member = p.removable ? members.find((m) => `m${m.uid}` === p.key) : undefined;
                  return (
                    <PersonCard
                      key={p.key}
                      person={p}
                      isee={isee}
                      answers={personAnswers[p.key]}
                      open={openPerson === p.key}
                      onToggle={() => setOpenPerson(openPerson === p.key ? '' : p.key)}
                      onAnswer={(qId, optId) =>
                        setPersonAnswers((a) => ({
                          ...a,
                          [p.key]: { ...a[p.key], [qId]: optId },
                        }))
                      }
                      onRemove={member ? () => removeMember(member.uid) : undefined}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* Шаг 4: результат */}
          <div className={
            'relative rounded-2xl p-5 mt-8 transition-all ' +
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

            {!allAnswered && (
              <p className="font-serif text-cream/50 text-sm italic">
                {!parentsDone
                  ? 'Ответь про родителей — и продолжим'
                  : 'Ответь на вопросы по каждому человеку — список сформируется здесь'}
              </p>
            )}

            {result && (
              <>
                <p className="font-serif text-cream/60 text-xs mb-4">
                  Итого документов: {result.totalDocs} · легализация примерно{' '}
                  <span className="text-gold"><Price eur={result.costMin} /> – <Price eur={result.costMax} /></span>
                </p>

                {/* Семейные документы */}
                <div className="mb-5">
                  <h3 className="font-serif text-cream/70 text-sm font-bold uppercase tracking-wide mb-2">
                    На всю семью
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {result.familyDocs.map((item, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-cream/90 text-xs leading-relaxed">{item.doc}</p>
                          {item.cost && <p className="font-serif text-gold/70 text-[11px] mt-0.5">{item.cost}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* По каждому человеку */}
                {result.perPerson.map((block, bi) => (
                  <div key={bi} className="mb-5">
                    <h3 className="font-serif text-cream/70 text-sm font-bold uppercase tracking-wide mb-2">
                      {block.person}
                    </h3>
                    {block.docs.length === 0 ? (
                      <p className="font-serif text-cream/40 text-xs italic">Документы не требуются</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {block.docs.map((item, ii) => (
                          <div key={ii} className="flex gap-2 items-start">
                            <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-cream/90 text-xs leading-relaxed">{item.doc}</p>
                              {item.note && (
                                <p className="font-serif text-cream/45 text-[11px] italic mt-0.5">{item.note}</p>
                              )}
                              {item.cost && <p className="font-serif text-gold/70 text-[11px] mt-0.5">{item.cost}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {minors.length > 0 && (
                  <p className="font-serif text-cream/40 text-[11px] italic mb-4">
                    Члены семьи младше 18 ({minors.length}) — просто в справке о составе семьи, документы не нужны.
                  </p>
                )}

                <div className="border-t border-cream/20 pt-3">
                  <p className="font-serif text-cream/40 text-[11px] italic">{isee.legalization_cost.note_ru}</p>
                </div>
              </>
            )}
          </div>

          {/* Стипендия — после результата */}
          {allAnswered && (
            <div className="bg-soft-cream border border-gold/50 rounded-2xl px-5 py-4 mt-4">
              <p className="font-serif text-gold text-sm mb-2 font-bold">{sch.title_ru}</p>
              <p className="font-serif text-navy/70 text-xs leading-relaxed mb-3">{sch.threshold_note_ru}</p>
              <div className="flex flex-col gap-2 mb-3">
                {sch.amounts.map((a) => (
                  <div
                    key={a.id}
                    className={
                      'flex justify-between items-center rounded-xl px-4 py-2.5 ' +
                      (a.is_default ? 'bg-navy' : 'bg-cream border border-navy/10')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <p className={'font-serif text-xs leading-snug ' + (a.is_default ? 'text-cream' : 'text-navy/70')}>
                        {a.label_ru}
                      </p>
                      {a.note_ru && (
                        <p className={'font-serif text-[10px] ' + (a.is_default ? 'text-gold font-bold' : 'text-navy/40')}>
                          {a.note_ru}
                        </p>
                      )}
                    </div>
                    <p className={'font-serif text-base font-bold flex-shrink-0 ml-3 ' + (a.is_default ? 'text-gold' : 'text-navy')}>
                      до <Price eur={a.amount_eur} />
                    </p>
                  </div>
                ))}
              </div>
              <p className="font-serif text-navy/60 text-xs leading-relaxed mb-3">{sch.bonuses_note_ru}</p>
              <button
                onClick={() => navigate('/scholarship')}
                className="w-full font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
              >
                Рассчитать мою стипендию точнее →
              </button>
              <p className="font-serif text-navy/40 text-[10px] italic mt-2">{sch.source_note_ru}</p>
            </div>
          )}
        </div>
      )}

      {/* Финальные шаги + советы */}
      <div className="mx-6 mt-6 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-3 font-bold">Что делать дальше</p>
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
        <p className="font-serif text-gold text-sm mb-3 font-bold">Советы</p>
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
        Требования актуальны на 2026/2027 — уточняй на unipr.it и er-go.it
      </p>
    </div>
  );
}
