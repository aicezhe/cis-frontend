import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useVisaUa } from '../hooks/useVisa';
import type { VisaUaBorderCategory } from '../types/visa';

const LEVEL_STYLES: Record<VisaUaBorderCategory['level'], { border: string; bg: string; badge: string }> = {
  ok: { border: 'rgba(58, 109, 64, 0.4)', bg: 'rgba(58, 109, 64, 0.06)', badge: '#3a6d40' },
  warn: { border: 'rgba(180, 140, 40, 0.5)', bg: 'rgba(180, 140, 40, 0.08)', badge: '#a8842a' },
  hard: { border: 'rgba(168, 51, 42, 0.4)', bg: 'rgba(168, 51, 42, 0.06)', badge: '#a8332a' },
};

function BorderCard({ cat }: { cat: VisaUaBorderCategory }) {
  const [open, setOpen] = useState(false);
  const s = LEVEL_STYLES[cat.level];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: s.border, backgroundColor: s.bg }}
    >
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="flex-1">
          <p className="font-serif text-navy text-base font-bold">{cat.label_ru}</p>
          <p className="font-serif text-xs mt-0.5 font-bold" style={{ color: s.badge }}>
            {cat.status_ru}
          </p>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 14 14"
          className={'text-navy transition-transform flex-shrink-0 ' + (open ? 'rotate-180' : '')}
          fill="currentColor"
        >
          <path d="M7 10L1 4h12L7 10z" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
          {cat.details_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: s.badge }}>◆</span>
              <p className="font-serif text-navy/75 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
          {cat.conclusion_ru && (
            <div className="bg-cream border border-gold/40 rounded-xl px-3 py-2.5 mt-1">
              <p className="font-serif text-navy/80 text-xs leading-relaxed">💡 {cat.conclusion_ru}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VisaUkrainePage() {
  const navigate = useNavigate();
  const { visa, loading } = useVisaUa();
  const [protOpen, setProtOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }
  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-8">
        <p className="font-serif text-navy/60 italic text-center">
          Не удалось загрузить данные. Попробуй обновить страницу.
        </p>
      </div>
    );
  }

  const tp = visa.temporary_protection;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          <h1 className="font-serif text-navy text-3xl font-bold">Легализация</h1>
          <p className="font-serif text-gold text-lg italic mt-0.5">для граждан Украины</p>
          <p className="font-serif text-navy/60 text-xs mt-1">{visa.meta.academic_year}</p>
        </div>
      </div>

      {/* Интро: безвиз + два пути */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-sm leading-relaxed mb-2">{visa.intro_ru.visa_free_ru}</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{visa.intro_ru.two_paths_ru}</p>
      </div>
      <div className="mx-6 mt-3 bg-gold/10 border border-gold/50 rounded-2xl px-5 py-3.5">
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{visa.intro_ru.same_uni_part_ru}</p>
      </div>

      {/* Граница — главная развилка */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-1">{visa.border_rules.title_ru}</p>
      <p className="font-serif text-navy/60 text-xs px-6 mb-3 leading-relaxed">{visa.border_rules.intro_ru}</p>
      <div className="px-6 flex flex-col gap-3">
        {visa.border_rules.categories.map((cat) => (
          <BorderCard key={cat.id} cat={cat} />
        ))}
      </div>
      <div className="mx-6 mt-3 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex gap-2">
        <span className="text-gold flex-shrink-0 text-sm">⚠</span>
        <p className="font-serif text-navy/80 text-xs leading-relaxed">{visa.border_rules.disclaimer_ru}</p>
      </div>

      {/* Путь 1 — студенческий */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">{visa.study_path.title_ru}</p>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/70 text-sm leading-relaxed mb-4">{visa.study_path.description_ru}</p>
        <div className="flex flex-col gap-3">
          {visa.study_path.steps.map((step, i) => (
            <div key={step.id} className="flex gap-3 items-start">
              <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
              <div className="flex-1">
                <p className="font-serif text-navy text-sm font-bold">{step.title_ru}</p>
                <p className="font-serif text-navy/70 text-xs leading-relaxed mt-0.5">{step.description_ru}</p>
                {step.link_to_section_ru && (
                  <button
                    onClick={() => navigate('/path/uni/program/documents')}
                    className="font-serif text-gold text-xs underline mt-1"
                  >
                    {step.link_to_section_ru} →
                  </button>
                )}
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-serif text-gold text-xs underline mt-1 inline-block"
                  >
                    {step.url.replace('https://www.', '')} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Путь 2 — временная защита */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">{tp.title_ru}</p>
      <div className="mx-6 relative bg-navy rounded-2xl p-5">
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

        <p className="font-serif text-cream/80 text-sm leading-relaxed">{tp.what_ru}</p>

        <p className="font-serif text-gold text-xs italic mt-4 mb-2">Что даёт</p>
        <div className="flex flex-col gap-1.5">
          {tp.gives_ru.map((g, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">✓</span>
              <p className="font-serif text-cream/80 text-xs leading-relaxed">{g}</p>
            </div>
          ))}
        </div>

        <p className="font-serif text-gold text-xs italic mt-4 mb-2">Кому положена</p>
        <div className="flex flex-col gap-1.5">
          {tp.who_ru.map((w, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="font-serif text-cream/70 text-xs leading-relaxed">{w}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setProtOpen(!protOpen)}
          className="w-full mt-4 font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
        >
          {protOpen ? 'Свернуть' : 'Как подать — пошагово'}
        </button>

        {protOpen && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="bg-cream/10 rounded-xl px-3.5 py-3">
              <p className="font-serif text-gold text-xs italic mb-1">Шаг 0 — если нет штампа Шенгена</p>
              <p className="font-serif text-cream/80 text-xs leading-relaxed">{tp.first_step_ru}</p>
            </div>

            <div className="bg-cream/10 rounded-xl px-3.5 py-3">
              <p className="font-serif text-gold text-xs italic mb-1">Куда идти</p>
              <p className="font-serif text-cream/80 text-xs leading-relaxed">{tp.how_to_apply_ru.where_ru}</p>
            </div>

            <div className="bg-cream/10 rounded-xl px-3.5 py-3">
              <p className="font-serif text-gold text-xs italic mb-2">Документы с собой</p>
              <div className="flex flex-col gap-1.5">
                {tp.how_to_apply_ru.documents_ru.map((d, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                    <p className="font-serif text-cream/80 text-xs leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cream/10 rounded-xl px-3.5 py-3">
              <p className="font-serif text-gold text-xs italic mb-2">Как проходит</p>
              <div className="flex flex-col gap-1.5">
                {tp.how_to_apply_ru.process_ru.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="font-serif text-gold text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="font-serif text-cream/80 text-xs leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
              <p className="font-serif text-cream/50 text-[11px] italic mt-2 leading-relaxed">
                {tp.how_to_apply_ru.moving_note_ru}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {tp.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-gold text-xs underline"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Советы */}
      <div className="mx-6 mt-6 bg-gold/10 border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-3">Главное</p>
        <div className="flex flex-col gap-2">
          {visa.tips_ru.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {visa.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
