import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import TabBar from '../components/TabBar';
import { useVisaUa } from '../hooks/useVisa';
import type { VisaUaBorderCategory } from '../types/visa';
import { ContentPage, PageHeader, TldrCard, H2, Note, InfoCard } from '../components/content';

// Уровень риска выезда — семантический цвет (ok/warn/hard), не акцент.
const LEVEL_STYLES: Record<VisaUaBorderCategory['level'], { border: string; bg: string; badge: string }> = {
  ok: { border: 'rgba(58, 109, 64, 0.4)', bg: 'rgba(58, 109, 64, 0.07)', badge: '#3a6d40' },
  warn: { border: 'rgba(180, 140, 40, 0.5)', bg: 'rgba(180, 140, 40, 0.09)', badge: '#a8842a' },
  hard: { border: 'rgba(168, 51, 42, 0.4)', bg: 'rgba(168, 51, 42, 0.07)', badge: '#a8332a' },
};

function BorderCard({ cat }: { cat: VisaUaBorderCategory }) {
  const [open, setOpen] = useState(false);
  const s = LEVEL_STYLES[cat.level];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: s.border, backgroundColor: s.bg }}>
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-content-navy text-base font-semibold">{cat.label_ru}</p>
          <p className="text-xs mt-0.5 font-semibold" style={{ color: s.badge }}>{cat.status_ru}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14"
          className={'text-content-navy transition-transform flex-shrink-0 ' + (open ? 'rotate-180' : '')} fill="currentColor">
          <path d="M7 10L1 4h12L7 10z" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
          {cat.details_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: s.badge }}>◆</span>
              <p className="text-content-ink text-[14.5px] leading-relaxed">{d}</p>
            </div>
          ))}
          {cat.conclusion_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3 py-2.5 mt-1">
              <p className="text-content-ink text-[13px] leading-relaxed">{cat.conclusion_ru}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProsCons({ title, items, positive }: { title: string; items: string[]; positive: boolean }) {
  return (
    <InfoCard tag={positive ? 'плюсы' : 'минусы'} title={title}>
      <div className="flex flex-col gap-1.5 mt-1">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className={'flex-shrink-0 mt-0.5 text-xs ' + (positive ? 'text-content-gold' : 'text-content-ink-2')}>
              {positive ? '✓' : '–'}
            </span>
            <p className="text-content-ink text-[14px] leading-relaxed">{it}</p>
          </div>
        ))}
      </div>
    </InfoCard>
  );
}

export default function VisaUkrainePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { visa, loading } = useVisaUa();
  const [protOpen, setProtOpen] = useState(false);
  // Пришли по ссылке из блока «SSN и tessera sanitaria» — прокручиваем к развилке.
  // Страница длинная: скроллим с задержкой, чтобы вёрстка успела разложиться.
  const pathChoiceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const focus = (location.state as { focus?: string } | null)?.focus;
    if (focus !== 'ua-path-choice') return;
    const t = setTimeout(() => {
      pathChoiceRef.current?.scrollIntoView({ block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, [location.state, visa]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!visa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg px-8">
        <p className="font-golos text-content-ink-2 italic text-center">Не удалось загрузить данные. Попробуй обновить страницу.</p>
      </div>
    );
  }

  const tp = visa.temporary_protection;
  const pc = visa.path_choice_ru;

  return (
    <ContentPage>
      <PageHeader
        crumb="Виза"
        title="Легализация"
        subtitle={`для граждан Украины · ${visa.meta.academic_year}`}
        backTo="/path"
      />

      <TldrCard>{visa.intro_ru.visa_free_ru} {visa.intro_ru.two_paths_ru}</TldrCard>

      <Note>{visa.intro_ru.same_uni_part_ru}</Note>

      {/* Граница — главная развилка */}
      <H2>{visa.border_rules.title_ru}</H2>
      <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{visa.border_rules.intro_ru}</p>
      <div className="flex flex-col gap-3 mt-4">
        {visa.border_rules.categories.map((cat) => (
          <BorderCard key={cat.id} cat={cat} />
        ))}
      </div>
      <Note icon={<TriangleAlert size={15} />}>{visa.border_rules.disclaimer_ru}</Note>

      {/* Путь 1 — студенческий */}
      <H2>{visa.study_path.title_ru}</H2>
      <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{visa.study_path.description_ru}</p>
      <div className="flex flex-col gap-3 mt-4">
        {visa.study_path.steps.map((step, i) => (
          <div key={step.id} className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 flex gap-3.5">
            <span className="flex-shrink-0 w-[30px] h-[30px] rounded-full bg-content-gold-bg text-content-gold font-bold text-sm flex items-center justify-center">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-content-navy text-base font-semibold leading-snug">{step.title_ru}</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1">{step.description_ru}</p>
              {step.link_to_section_ru && (
                <button onClick={() => navigate('/path/uni/program/documents')} className="text-content-gold text-xs underline mt-1.5">
                  {step.link_to_section_ru} →
                </button>
              )}
              {step.url && (
                <a href={step.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-1.5 inline-block">
                  {step.url.replace('https://www.', '')} ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Путь 2 — временная защита (navy-карточка-хайлайт) */}
      <H2>{tp.title_ru}</H2>
      <div className="rounded-2xl bg-content-navy p-5 mt-4">
        <p className="text-white/85 text-[14.5px] leading-relaxed">{tp.what_ru}</p>

        {tp.validity_ru && (
          <div className="bg-white/10 rounded-xl px-3.5 py-3 mt-3">
            <p className="text-content-gold text-xs font-semibold mb-1">Срок действия</p>
            <p className="text-white/85 text-[13px] leading-relaxed">{tp.validity_ru}</p>
          </div>
        )}

        <p className="text-content-gold text-xs mt-4 mb-2 font-semibold uppercase tracking-wide">Что даёт</p>
        <div className="flex flex-col gap-1.5">
          {tp.gives_ru.map((g, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">✓</span>
              <p className="text-white/85 text-[13px] leading-relaxed">{g}</p>
            </div>
          ))}
        </div>

        <p className="text-content-gold text-xs mt-4 mb-2 font-semibold uppercase tracking-wide">Кому положена</p>
        <div className="flex flex-col gap-1.5">
          {tp.who_ru.map((w, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="text-white/70 text-[13px] leading-relaxed">{w}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setProtOpen(!protOpen)} className="w-full mt-4 text-content-navy bg-content-gold rounded-full py-2.5 text-sm font-medium">
          {protOpen ? 'Свернуть' : 'Как подать — пошагово'}
        </button>

        {protOpen && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="bg-white/10 rounded-xl px-3.5 py-3">
              <p className="text-content-gold text-xs mb-1 font-semibold">Шаг 0 — если нет штампа Шенгена</p>
              <p className="text-white/85 text-[13px] leading-relaxed">{tp.first_step_ru}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-3">
              <p className="text-content-gold text-xs mb-1 font-semibold">Куда идти</p>
              <p className="text-white/85 text-[13px] leading-relaxed">{tp.how_to_apply_ru.where_ru}</p>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-3">
              <p className="text-content-gold text-xs mb-2 font-semibold">Документы с собой</p>
              <div className="flex flex-col gap-1.5">
                {tp.how_to_apply_ru.documents_ru.map((d, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                    <p className="text-white/85 text-[13px] leading-relaxed">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl px-3.5 py-3">
              <p className="text-content-gold text-xs mb-2 font-semibold">Как проходит</p>
              <div className="flex flex-col gap-1.5">
                {tp.how_to_apply_ru.process_ru.map((p, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-content-gold text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-white/85 text-[13px] leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-[11px] italic mt-2 leading-relaxed">{tp.how_to_apply_ru.moving_note_ru}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {tp.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline">
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Какой путь выбрать (новый блок) */}
      {pc && (
        <div ref={pathChoiceRef} className="scroll-mt-4">
          <H2>{pc.title_ru}</H2>
          <p className="text-content-ink text-[15px] leading-relaxed mt-2">{pc.short_answer_ru}</p>
          <div className="flex flex-col gap-3 mt-4">
            <ProsCons title="Временная защита" items={pc.tp_pros_ru} positive />
            <ProsCons title="Временная защита" items={pc.tp_cons_ru} positive={false} />
            <ProsCons title="Студенческий permesso" items={pc.study_pros_ru} positive />
            <ProsCons title="Студенческий permesso" items={pc.study_cons_ru} positive={false} />
          </div>

          <div className="rounded-2xl bg-content-navy p-5 mt-4">
            <p className="text-content-gold text-xs font-semibold uppercase tracking-wide mb-1.5">{pc.longterm_ru.title_ru}</p>
            <p className="text-white/85 text-[14px] leading-relaxed">{pc.longterm_ru.intro_ru}</p>
            <div className="flex flex-col gap-2 mt-3">
              {pc.longterm_ru.points_ru.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                  <p className="text-white/80 text-[13px] leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>

          <Note>{pc.bottom_line_ru}</Note>
        </div>
      )}

      {/* Доверенность перед отъездом */}
      {visa.power_of_attorney_ru && (
        <>
          <H2>{visa.power_of_attorney_ru.title_ru}</H2>
          <div className="rounded-2xl bg-content-surface border border-content-line px-5 py-4 mt-4">
            <p className="text-content-ink text-[14.5px] leading-relaxed mb-3">{visa.power_of_attorney_ru.why_ru}</p>
            <p className="text-content-gold text-xs mb-2 font-semibold uppercase tracking-wide">Как сделать</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {visa.power_of_attorney_ru.how_ru.map((h, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-content-gold text-xs font-bold flex-shrink-0 mt-0.5 w-4">{i + 1}.</span>
                  <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{h}</p>
                </div>
              ))}
            </div>
            <p className="text-content-gold text-xs mb-2 font-semibold uppercase tracking-wide">Какие полномочия вписать</p>
            <div className="flex flex-col gap-1.5 mb-3">
              {visa.power_of_attorney_ru.include_ru.map((d, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                  <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
            <div className="bg-content-gold-bg rounded-xl px-3.5 py-2.5 flex gap-2">
              <TriangleAlert size={15} className="text-content-gold flex-shrink-0 mt-0.5" />
              <p className="text-content-ink text-[13px] leading-relaxed">{visa.power_of_attorney_ru.warning_ru}</p>
            </div>
          </div>
        </>
      )}

      {/* Главное */}
      <H2>Главное</H2>
      <Note>
        <div className="flex flex-col gap-2">
          {visa.tips_ru.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="text-content-ink text-[14.5px] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Note>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">{visa.meta.data_policy}</p>

      <div className="print:hidden"><TabBar active="path" /></div>
    </ContentPage>
  );
}
