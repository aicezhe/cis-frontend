import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { useMyLegalization } from '../hooks/useFoundation';
import type { RequiredDocument, TwelfthYearOptions } from '../types/laurea';

const DOCS_KEY = 'cispr_docs_checklist';

function loadChecked(): string[] {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]'); } catch { return []; }
}

// Блок страновой легализации — встраивается в карточку диплома
function LegalizationInline() {
  const { legalization, loading } = useMyLegalization();

  if (loading) {
    return (
      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="font-serif text-navy/50 text-xs italic">Загрузка данных по стране…</p>
      </div>
    );
  }

  if (!legalization) {
    // Страна не определена — показываем общий порядок
    return (
      <div className="mt-4 border-t border-navy/10 pt-3 flex flex-col gap-2">
        <p className="font-serif text-gold text-xs italic">Общий порядок легализации</p>
        <div className="flex flex-col gap-1.5">
          {[
            '1. Апостиль документа об образовании — через уполномоченный орган своей страны',
            '2. Нотариально заверенный перевод на итальянский у аккредитованного переводчика',
            '3. Признание в Италии: CIMEA (cimea-diplome.it) или DDV через консульство Италии',
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold text-xs flex-shrink-0 mt-0.5">◆</span>
              <p className="font-serif text-navy/70 text-xs leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        <p className="font-serif text-navy/40 text-[11px] italic">
          Для точного порядка по твоей стране — выбери страну в Настройках
        </p>
      </div>
    );
  }
  const leg = legalization.diploma_legalization;
  return (
    <div className="mt-4 border-t border-navy/10 pt-4 flex flex-col gap-3">
      <p className="font-serif text-gold text-xs italic">
        Порядок для {legalization.meta.country_name_ru}
        <span className="text-navy/40 ml-1">(источник: {legalization.meta.source})</span>
      </p>

      {/* Тип легализации */}
      <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2">
        <p className="font-serif text-navy text-xs font-bold">
          {leg.country_in_hague ? '✓ Гаагская конвенция — апостиль' : 'Консульская легализация'}
        </p>
        <p className="font-serif text-navy/60 text-xs mt-0.5">
          Уполномоченный орган: {leg.competent_authority.name_ru}
        </p>
        {leg.competent_authority.website && (
          <a
            href={leg.competent_authority.website}
            target="_blank"
            rel="noreferrer"
            className="font-serif text-gold text-xs underline mt-0.5 inline-block"
          >
            {leg.competent_authority.website.replace('https://', '')} ↗
          </a>
        )}
      </div>

      {/* Шаги легализации */}
      {leg.steps.map((step, i) => (
        <div key={step.id} className="bg-cream border border-navy/10 rounded-xl px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-navy flex items-center justify-center text-cream text-[10px] flex-shrink-0">
              {i + 1}
            </span>
            <p className="font-serif text-navy text-sm font-bold">{step.title_ru}</p>
          </div>
          <p className="font-serif text-navy/70 text-xs leading-relaxed pl-7">{step.description_ru}</p>

          {(step.cost_local || step.cost_eur_approx) && (
            <p className="font-serif text-navy/60 text-xs pl-7 mt-1">
              💰 {step.cost_local}{step.cost_eur_approx ? ` (~${step.cost_eur_approx} €)` : ''}
              {step.duration_days ? ` · ⏱ ${step.duration_days}` : ''}
            </p>
          )}

          {step.options && step.options.length > 0 && (
            <div className="pl-7 mt-2 flex flex-col gap-1.5">
              {step.options.map((opt, j) => (
                <div key={j} className="border-l-2 border-gold pl-2">
                  <p className="font-serif text-navy text-xs font-bold">{opt.name}</p>
                  <p className="font-serif text-navy/60 text-xs">{opt.cost_eur} € · {opt.duration}</p>
                  {opt.pros_ru.map((pr, k) => (
                    <p key={k} className="font-serif text-navy/60 text-[11px]">＋ {pr}</p>
                  ))}
                  {opt.cons_ru.map((cn, k) => (
                    <p key={k} className="font-serif text-navy/40 text-[11px]">－ {cn}</p>
                  ))}
                </div>
              ))}
              {step.recommendation_ru && (
                <p className="font-serif text-gold text-xs italic">💡 {step.recommendation_ru}</p>
              )}
            </div>
          )}

          {step.warnings_ru && step.warnings_ru.length > 0 && (
            <div className="pl-7 mt-2 flex flex-col gap-1">
              {step.warnings_ru.map((w, k) => (
                <div key={k} className="flex items-start gap-1.5 bg-soft-cream border border-gold/50 rounded-lg px-2 py-1.5">
                  <span className="text-gold text-xs flex-shrink-0">!</span>
                  <p className="font-serif text-navy/70 text-[11px] leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Частые ошибки */}
      {legalization.common_pitfalls_ru.length > 0 && (
        <div className="bg-soft-cream border border-gold/30 rounded-xl px-3 py-3">
          <p className="font-serif text-gold text-xs italic mb-2">Частые ошибки при легализации</p>
          <div className="flex flex-col gap-1.5">
            {legalization.common_pitfalls_ru.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold text-xs flex-shrink-0 mt-0.5">◆</span>
                <p className="font-serif text-navy/70 text-xs leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Расширенное описание по id документа
const EXTRA_DETAILS: Record<string, { steps?: string[]; tip?: string }> = {
  language_cert: {
    steps: [
      'Для итальянского: CILS, CELI, PLIDA, Roma Tre — или бесплатный тест UniPR (CLA)',
      'Для английского: IELTS 6.0+, TOEFL iBT 80+, Cambridge FCE/CAE/CPE, TOEIC 785+',
      'UniPR Language Test сдаётся бесплатно через CLA — можно после приезда',
    ],
    tip: 'Если бакалавриат был полностью на английском — попроси у своего вуза Director\'s Statement (заменяет сертификат)',
  },
  recognition: {
    steps: [
      'CIMEA Statement of Verification — быстрее и проще, рекомендуется',
      'Dichiarazione di Valore (DDV) — через итальянское консульство в твоей стране, занимает дольше',
      'Для magistrale CIMEA предпочтительнее — комиссия лучше понимает структуру документа',
    ],
    tip: 'CIMEA можно заказать онлайн на cimea-diplome.it. DDV — в консульстве Италии лично.',
  },
  transcript_bachelor: {
    steps: [
      'Запроси в своём вузе транскрипт со всеми дисциплинами, оценками и количеством часов/кредитов',
      'Если вуз выдаёт Diploma Supplement — обязательно возьми',
      'Переведи на итальянский у аккредитованного переводчика',
      'Апостилируй аналогично диплому',
    ],
    tip: 'Чем подробнее транскрипт — тем проще пройдёт pre-evaluation. Комиссия смотрит именно на названия предметов.',
  },
  cv: {
    steps: [
      'Формат Europass (europass.europa.eu) — предпочтительный для Италии',
      'Укажи образование, языки, опыт (если есть), дополнительные курсы',
      'Язык: итальянский или английский в зависимости от программы',
    ],
  },
  motivation_letter: {
    steps: [
      'Объясни почему хочешь поступить именно на эту программу и именно в UniPR',
      'Свяжи свой бакалавриат с выбранной магистратурой',
      'Упомяни профессиональные планы и как программа помогает их реализовать',
      'Объём: 300-500 слов, язык программы',
    ],
    tip: 'Мотивационное письмо особенно важно при конкурсном отборе (IBD, FSM, MUNER).',
  },
};

// Блок «12-й год» — только для бакалавриата
function TwelfthYearBlock({ data }: { data: TwelfthYearOptions }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-cream border border-gold/30 rounded-2xl px-4 py-3">
        <p className="font-serif text-gold text-sm italic mb-1">{data.title_ru}</p>
        <p className="font-serif text-navy/70 text-sm leading-relaxed">{data.explanation_ru}</p>
      </div>
      {data.options.map((opt) => {
        const isOpen = openId === opt.id;
        return (
          <div key={opt.id} className="bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : opt.id)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left"
            >
              <div className="flex-1">
                <p className="font-serif text-navy text-base font-bold">{opt.name_ru}</p>
                <p className="font-serif text-navy/60 text-xs mt-0.5 leading-relaxed">{opt.description_ru}</p>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 14 14"
                className={'text-navy flex-shrink-0 mt-1 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-navy/10 pt-3 flex flex-col gap-2">
                <p className="font-serif text-navy/50 text-xs italic">Документы для этого пути:</p>
                {opt.documents_ru.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                    <p className="font-serif text-navy/80 text-xs leading-relaxed">{doc}</p>
                  </div>
                ))}
                <div className="mt-1 bg-cream border border-navy/10 rounded-xl px-3 py-2">
                  <p className="font-serif text-navy/60 text-xs">
                    <span className="text-gold">→</span> {opt.best_for_ru}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="font-serif text-navy/40 text-[11px] italic px-1">{data.note_ru}</p>
    </div>
  );
}

function DocCard({ doc, checked, toggle }: {
  doc: RequiredDocument;
  checked: boolean;
  toggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDiploma = doc.linked_to_country_seed;
  const extra = EXTRA_DETAILS[doc.id];

  return (
    <div className={
      'bg-soft-cream border rounded-2xl px-4 py-4 ' +
      (doc.critical ? 'border-gold/60' : 'border-navy/20') +
      (checked ? ' opacity-60' : '')
    }>
      <div className="flex items-start gap-3">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={
              'font-serif text-base font-bold ' +
              (checked ? 'text-navy/50 line-through' : 'text-navy')
            }>
              {doc.name_ru}
            </p>
            {doc.critical && (
              <span className="font-serif text-[10px] text-gold border border-gold/60 rounded-full px-2 py-0.5 leading-none flex-shrink-0">
                важно
              </span>
            )}
            {doc.optional && (
              <span className="font-serif text-[10px] text-navy/50 border border-navy/20 rounded-full px-2 py-0.5 leading-none flex-shrink-0">
                по ситуации
              </span>
            )}
          </div>

          <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{doc.details_ru}</p>

          {/* Дополнительные шаги из EXTRA_DETAILS */}
          {extra?.steps && (
            <div className="mt-2 flex flex-col gap-1">
              {extra.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                  <p className="font-serif text-navy/70 text-xs leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          )}
          {extra?.tip && (
            <div className="mt-2 bg-cream border border-navy/10 rounded-xl px-3 py-2">
              <p className="font-serif text-navy/60 text-xs">💡 {extra.tip}</p>
            </div>
          )}

          {/* Кнопка «Подробнее» для диплома — показывает страновую легализацию */}
          {isDiploma && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1.5 font-serif text-gold text-xs"
            >
              <span>{expanded ? 'Скрыть' : 'Показать'} порядок легализации по стране</span>
              <svg
                width="12" height="12" viewBox="0 0 14 14"
                className={'transition-transform ' + (expanded ? 'rotate-180' : '')}
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
          )}

          {isDiploma && expanded && <LegalizationInline />}
        </div>
      </div>
    </div>
  );
}

export default function ProgramDocumentsPage() {
  const navigate = useNavigate();
  const { program, programType, loading } = useMyProgram();
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

      {/* 12-й год образования — только для бакалавриата */}
      {programType === 'bachelor' && program.twelfth_year_options && (
        <>
          <p className="font-serif text-gold text-sm italic px-6 mt-8 mb-3">
            12 лет образования — как закрыть
          </p>
          <div className="px-6">
            <TwelfthYearBlock data={program.twelfth_year_options} />
          </div>
        </>
      )}

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Актуальный список документов — проверяй на apply.unipr.it перед подачей
      </p>
    </div>
  );
}
