import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import type { RequiredDocument } from '../types/laurea';

const DOCS_KEY = 'cispr_docs_checklist';

function loadChecked(): string[] {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]'); } catch { return []; }
}

function DocCard({ doc, checked, toggle }: {
  doc: RequiredDocument;
  checked: boolean;
  toggle: () => void;
}) {
  return (
    <div className={
      'flex items-start gap-3 bg-soft-cream border rounded-2xl px-4 py-4 ' +
      (doc.critical ? 'border-gold/60' : 'border-navy/20') +
      (checked ? ' opacity-60' : '')
    }>
      <button onClick={toggle} className="w-6 h-6 mt-0.5 flex-shrink-0">
        {checked ? (
          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
        ) : (
          <div className={
            'w-6 h-6 rounded-full border-2 ' +
            (doc.critical ? 'border-gold' : 'border-navy/30')
          } />
        )}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={
            'font-serif text-base font-bold ' +
            (checked ? 'text-navy/50 line-through' : 'text-navy')
          }>
            {doc.name_ru}
          </p>
          {doc.critical && (
            <span className="font-serif text-[10px] text-gold border border-gold/60 rounded-full px-2 py-0.5 leading-none">
              важно
            </span>
          )}
          {doc.optional && (
            <span className="font-serif text-[10px] text-navy/50 border border-navy/20 rounded-full px-2 py-0.5 leading-none">
              по ситуации
            </span>
          )}
        </div>
        <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{doc.details_ru}</p>
        {doc.linked_to_country_seed && (
          <p className="font-serif text-gold text-xs italic mt-1">
            ↳ Порядок зависит от страны — смотри блок «Легализация документов»
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProgramDocumentsPage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();
  const [checked, setChecked] = useState<string[]>(loadChecked);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(DOCS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (!program) return null;

  const docs = program.documents_required;
  const total = docs.length;
  const doneCount = docs.filter((d) => checked.includes(d.id)).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Документы</h1>
      </div>

      {/* Прогресс */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <div className="flex justify-between items-baseline mb-2">
          <p className="font-serif text-navy text-sm">Готово</p>
          <p className="font-serif text-navy/60 text-xs">{doneCount} из {total}</p>
        </div>
        <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-navy transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Список */}
      <div className="px-6 mt-5 flex flex-col gap-3">
        {docs.map((doc) => (
          <DocCard
            key={doc.id}
            doc={doc}
            checked={checked.includes(doc.id)}
            toggle={() => toggle(doc.id)}
          />
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Актуальный список документов — проверяй на apply.unipr.it перед подачей
      </p>
    </div>
  );
}
