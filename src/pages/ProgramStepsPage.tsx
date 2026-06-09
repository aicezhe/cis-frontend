import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { useMyLegalization } from '../hooks/useFoundation';
import { Price } from '../components/Price';
import type { ApplicationStep } from '../types/laurea';

const CHECKS_KEY = 'cispr_steps_checks';

function loadChecks(): string[] {
  try { return JSON.parse(localStorage.getItem(CHECKS_KEY) || '[]'); } catch { return []; }
}

function CheckBox({ id, checks, toggle }: { id: string; checks: string[]; toggle: (id: string) => void }) {
  const done = checks.includes(id);
  return (
    <button onClick={() => toggle(id)} className="w-6 h-6 mt-0.5 flex-shrink-0">
      {done ? (
        <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-cream text-xs">✓</div>
      ) : (
        <div className="w-6 h-6 rounded-full border-2 border-navy/30" />
      )}
    </button>
  );
}

function LegalizationBlock() {
  const { legalization, loading } = useMyLegalization();
  if (loading || !legalization) return null;
  return (
    <div className="mt-3 bg-soft-cream border border-gold rounded-xl px-4 py-3">
      <p className="font-serif text-gold text-xs italic mb-2">
        Легализация документов — {legalization.meta.country_name_ru}
      </p>
      <div className="flex flex-col gap-2">
        {legalization.diploma_legalization.steps.map((s) => (
          <div key={s.id} className="flex items-start gap-2">
            <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
            <div>
              <p className="font-serif text-navy text-sm font-bold">{s.title_ru}</p>
              <p className="font-serif text-navy/70 text-xs leading-relaxed mt-0.5">{s.description_ru}</p>
              {s.cost_local && (
                <p className="font-serif text-navy/60 text-xs mt-0.5">
                  {s.cost_local}{s.cost_eur_approx ? ` (~${s.cost_eur_approx} €)` : ''}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="font-serif text-navy/40 text-[11px] italic mt-2">
        Источник: {legalization.meta.source}
      </p>
    </div>
  );
}

function StepCard({ step, idx, checks, toggle }: {
  step: ApplicationStep;
  idx: number;
  checks: string[];
  toggle: (id: string) => void;
}) {
  const isDone = checks.includes(step.id);
  const hasCost = step.cost_eur !== undefined && step.cost_eur !== 0;

  return (
    <div className={
      'bg-soft-cream border rounded-2xl px-4 py-4 ' +
      (isDone ? 'border-navy/15 opacity-70' : 'border-navy/20')
    }>
      <div className="flex items-start gap-3">
        <CheckBox id={step.id} checks={checks} toggle={toggle} />
        <div className="flex-1">
          <p className="font-serif text-gold text-xs italic">Шаг {idx + 1}</p>
          <h5 className={
            'font-serif text-lg font-bold mt-0.5 ' +
            (isDone ? 'text-navy/50 line-through' : 'text-navy')
          }>
            {step.title_ru}
          </h5>

          {step.duration_ru && (
            <span className="inline-block font-serif text-navy/60 text-xs bg-cream border border-navy/15 rounded-full px-2.5 py-1 mt-2">
              🕑 {step.duration_ru}
            </span>
          )}
          {step.deadline_ru && (
            <span className="inline-block font-serif text-gold text-xs bg-soft-cream border border-gold/50 rounded-full px-2.5 py-1 mt-2 ml-1">
              ⚑ {step.deadline_ru}
            </span>
          )}

          <p className="font-serif text-navy/75 text-sm leading-relaxed mt-2">
            {step.description_ru}
          </p>

          {hasCost && (
            <p className="font-serif text-navy text-sm mt-2">
              Стоимость:{' '}
              {typeof step.cost_eur === 'number'
                ? <Price eur={step.cost_eur} />
                : <span className="text-gold">{step.cost_eur} €</span>
              }
            </p>
          )}

          {step.tip_ru && (
            <div className="mt-2 bg-cream border border-navy/10 rounded-xl px-3 py-2">
              <p className="font-serif text-navy/70 text-xs">💡 {step.tip_ru}</p>
            </div>
          )}

          {step.platform_url && (
            <a
              href={step.platform_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block font-serif text-gold text-xs underline mt-2"
            >
              {step.platform_url.replace('https://', '')} ↗
            </a>
          )}

          {step.warnings_ru && step.warnings_ru.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-3">
              {step.warnings_ru.map((w, i) => (
                <div key={i} className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2">
                  <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
                  <p className="font-serif text-navy/80 text-xs">{w}</p>
                </div>
              ))}
            </div>
          )}

          {step.warning_ru && (
            <div className="flex items-start gap-2 bg-soft-cream border border-gold rounded-lg px-3 py-2 mt-3">
              <span className="text-gold mt-0.5 text-sm flex-shrink-0">!</span>
              <p className="font-serif text-navy/80 text-xs">{step.warning_ru}</p>
            </div>
          )}

          {/* Встраиваем блок страновой легализации */}
          {step.linked_to_country_seed && <LegalizationBlock />}

          {step.next_step_ru && (
            <p className="font-serif text-gold text-sm italic mt-3">
              → {step.next_step_ru}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProgramStepsPage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();
  const [checks, setChecks] = React.useState<string[]>(loadChecks);

  function toggle(id: string) {
    setChecks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(CHECKS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (!program) return null;

  const deadline = program.deadlines_2026_2027;
  const windowStr = (deadline['application_window'] || deadline['application_window_english'] || '') as string;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Шаги поступления</h1>
      </div>

      {/* Дедлайны */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-2">Ориентировочные сроки 2026/2027</p>
        {windowStr && (
          <p className="font-serif text-navy text-sm font-bold">📅 Подача: {windowStr}</p>
        )}
        {(deadline['universitaly_preenrolment'] as string) && (
          <p className="font-serif text-navy/80 text-sm mt-1">
            Universitaly: {deadline['universitaly_preenrolment'] as string}
          </p>
        )}
        {(deadline['warnings_ru'] as string[] | undefined)?.map((w, i) => (
          <p key={i} className="font-serif text-navy/60 text-xs italic mt-1">⚠ {w}</p>
        ))}
        <p className="font-serif text-navy/40 text-xs italic mt-2">
          Дедлайны актуальны на 2026/2027 — проверяй на apply.unipr.it
        </p>
      </div>

      {/* Шаги */}
      <div className="px-6 mt-6 flex flex-col gap-3">
        {program.application_steps.map((step, idx) => (
          <StepCard key={step.id} step={step} idx={idx} checks={checks} toggle={toggle} />
        ))}
      </div>

      {/* Кнопка → Виза */}
      <div className="px-6 mt-6">
        <button
          onClick={() => navigate('/path/visa')}
          className="w-full font-serif text-cream bg-navy rounded-full py-3 text-base"
        >
          Перейти к разделу Виза →
        </button>
      </div>

      {/* Частые ошибки */}
      <div className="px-6 mt-6">
        <p className="font-serif text-gold text-sm italic mb-2">Частые ошибки</p>
        <div className="flex flex-col gap-2">
          {program.common_pitfalls_ru.map((p, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
              <p className="font-serif text-navy/80 text-sm">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
