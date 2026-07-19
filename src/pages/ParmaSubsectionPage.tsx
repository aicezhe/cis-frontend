import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TriangleAlert, Info } from 'lucide-react';
import { useParmaLife } from '../hooks/useParmaLife';
import { Price } from '../components/Price';
import type { ParmaSubsection } from '../types/parmaLife';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';

function BulletList({ items, icon = '◆' }: { items: string[]; icon?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">{icon}</span>
          <p className="text-content-ink text-[14.5px] leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}

// Карточка-контейнер секции на токенах.
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-content-surface border border-content-line rounded-2xl px-5 py-4 mt-4">{children}</div>;
}

// Полноширинная navy-полоса «Важно для иностранцев» — full-bleed внутри
// ContentPage (компенсируем боковой паддинг через -mx-5).
function ForeignersBanner({ items }: { items: string[] }) {
  return (
    <div className="mt-6 -mx-5 bg-content-navy px-5 py-5">
      <div className="flex items-center gap-2 mb-2.5">
        <Info size={15} className="text-content-gold flex-shrink-0" />
        <p className="text-content-gold text-xs uppercase tracking-widest font-semibold">Важно для иностранцев</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((s, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <span className="w-1 h-1 rounded-full bg-content-gold/70 flex-shrink-0 mt-2" />
            <p className="text-white/90 text-[14.5px] leading-relaxed">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FyToBachelorButton() {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  function doSwitch() {
    localStorage.setItem('cispr_program', 'bachelor');
    localStorage.removeItem('cispr_passed_quiz');
    localStorage.removeItem('cispr_course_id');
    localStorage.removeItem('cispr_course_name');
    localStorage.removeItem('cispr_quiz_level');
    localStorage.removeItem('cispr_quiz_lang');
    localStorage.removeItem('cispr_quiz_dept');
    localStorage.setItem('cispr_came_from_fy', 'true');
    navigate('/onboarding');
  }

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="w-full text-white bg-content-navy rounded-full py-3 text-sm">
        Я перехожу на бакалавриат →
      </button>
    );
  }

  return (
    <div className="bg-content-gold-bg rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-content-ink text-[14.5px] leading-relaxed">
        Ты завершаешь Foundation и переходишь к поступлению на бакалавриат. Раздел Университет обновится под бакалавриат. Продолжить?
      </p>
      <div className="flex gap-2">
        <button onClick={() => setConfirming(false)} className="flex-1 text-content-navy border border-content-line rounded-full py-2.5 text-sm">
          Отмена
        </button>
        <button onClick={doSwitch} className="flex-1 text-white bg-content-navy rounded-full py-2.5 text-sm">
          Продолжить
        </button>
      </div>
    </div>
  );
}

function Renderer({ sec }: { sec: ParmaSubsection }) {
  const navigate = useNavigate();

  return (
    <>
      {sec.status === 'mobile_version' && sec.mobile_version_note_ru && (
        <Card>
          <p className="text-content-gold text-[10px] uppercase tracking-widest mb-1.5">скоро в мобильной версии</p>
          <p className="text-content-ink text-[14.5px] leading-relaxed">{sec.mobile_version_note_ru}</p>
        </Card>
      )}

      {sec.warning_ru && (
        <Note icon={<TriangleAlert size={16} />}><b>{sec.warning_ru}</b></Note>
      )}

      {sec.why_ru && (
        <>
          <H2>Зачем нужна</H2>
          <Card><BulletList items={sec.why_ru} /></Card>
        </>
      )}

      {sec.important_for_foreigners_ru && <ForeignersBanner items={sec.important_for_foreigners_ru} />}

      {sec.steps_ru && (
        <>
          <H2>Шаги</H2>
          <Card>
            <ol className="flex flex-col gap-2.5">
              {sec.steps_ru.map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-content-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                  <p className="text-content-ink text-[14.5px] leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}

      {sec.documents_ru && (
        <>
          <H2>Документы</H2>
          <Card><BulletList items={sec.documents_ru} /></Card>
        </>
      )}

      {sec.requirements_ru && (
        <>
          <H2>Требования</H2>
          <Card><BulletList items={sec.requirements_ru} icon="✓" /></Card>
        </>
      )}

      {sec.functionality_ru && (
        <>
          <H2>Что можно делать через SPID</H2>
          <Card><BulletList items={sec.functionality_ru} icon="✓" /></Card>
        </>
      )}

      {sec.free_option_ru && (
        <div className="rounded-2xl bg-content-navy px-5 py-5 mt-4">
          <p className="text-content-gold text-xs font-semibold">бесплатный вариант</p>
          <p className="text-white text-[14.5px] leading-relaxed mt-1">{sec.free_option_ru}</p>
        </div>
      )}

      {sec.cost_eur != null && (
        <div className="bg-content-surface border border-content-line rounded-xl px-4 py-3 flex justify-between items-center mt-4">
          <p className="text-content-gold text-xs font-semibold uppercase tracking-wide">Стоимость</p>
          <p className="text-content-navy text-base font-bold"><Price eur={sec.cost_eur} /></p>
        </div>
      )}

      {sec.procedure_ru && (
        <>
          <H2>Процедура</H2>
          <Card>
            {Array.isArray(sec.procedure_ru) ? (
              <ol className="flex flex-col gap-2.5">
                {sec.procedure_ru.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-content-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                    <p className="text-content-ink text-[14.5px] leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-content-ink text-[14.5px] leading-relaxed">{sec.procedure_ru}</p>
            )}
          </Card>
        </>
      )}

      {sec.where_ru && (
        <div className="bg-content-surface border border-content-line rounded-xl px-4 py-3 mt-3">
          <p className="text-content-gold text-xs mb-1 font-semibold uppercase tracking-wide">Куда идти</p>
          <p className="text-content-ink text-[14.5px] leading-relaxed">{sec.where_ru}</p>
        </div>
      )}

      {sec.contracts_ru && (
        <>
          <H2>{sec.contracts_ru.title_ru}</H2>
          <Card>
            <BulletList items={sec.contracts_ru.types_ru} />
            <div className="bg-content-gold-bg rounded-xl px-4 py-3 mt-3 flex gap-2">
              <TriangleAlert size={15} className="text-content-gold flex-shrink-0 mt-0.5" />
              <p className="text-content-ink text-[13px] leading-relaxed font-medium">{sec.contracts_ru.student_limit_ru}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-content-bg border border-content-line rounded-xl px-3 py-3">
                <p className="text-content-ink-2 text-[10px] uppercase tracking-widest">в час</p>
                <p className="text-content-navy text-base font-bold mt-1">
                  <Price eur={sec.contracts_ru.avg_hourly_eur_min} />–<Price eur={sec.contracts_ru.avg_hourly_eur_max} />
                </p>
                <p className="text-content-ink-2 text-[10px] mt-0.5">net</p>
              </div>
              <div className="bg-content-bg border border-content-line rounded-xl px-3 py-3">
                <p className="text-content-ink-2 text-[10px] uppercase tracking-widest">в месяц</p>
                <p className="text-content-navy text-base font-bold mt-1">
                  <Price eur={sec.contracts_ru.avg_monthly_eur_min} />–<Price eur={sec.contracts_ru.avg_monthly_eur_max} />
                </p>
                <p className="text-content-ink-2 text-[10px] mt-0.5">20 ч/нед</p>
              </div>
            </div>
            <p className="text-content-ink-2 text-xs italic mt-3 leading-relaxed">{sec.contracts_ru.avg_hours_ru}</p>
          </Card>
        </>
      )}

      {sec.language_logic_ru && (
        <>
          <H2>По уровню итальянского</H2>
          <div className="flex flex-col gap-3 mt-4">
            <div className="bg-content-surface border border-content-line rounded-2xl px-4 py-3">
              <p className="text-content-navy text-sm font-semibold mb-1">B2 — отлично</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{sec.language_logic_ru.b2_ru}</p>
            </div>
            <div className="bg-content-surface border border-content-gold rounded-2xl px-4 py-3">
              <p className="text-content-navy text-sm font-semibold mb-1">B1 — нужны доп. курсы</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed">{sec.language_logic_ru.b1_ru}</p>
            </div>
          </div>
        </>
      )}

      {sec.process_ru && (
        <>
          <H2>Как это происходит</H2>
          <Card>
            <ol className="flex flex-col gap-2.5">
              {sec.process_ru.map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-content-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                  <p className="text-content-ink text-[14.5px] leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}

      {sec.important_ru && <Note>{sec.important_ru}</Note>}

      {sec.link_to_ssn && (
        <button
          onClick={() => navigate(sec.link_to_ssn!)}
          className="w-full text-white bg-content-navy rounded-full py-3 text-sm mt-4"
        >
          Подробнее: SSN и tessera sanitaria →
        </button>
      )}

      {(sec.link_to_isee || sec.link_to_scholarship) && (
        <div className="flex flex-col gap-3 mt-4">
          {sec.link_to_isee && (
            <button onClick={() => navigate(sec.link_to_isee!)} className="w-full text-white bg-content-navy rounded-full py-3 text-sm">
              Документы для ISEE parificato →
            </button>
          )}
          {sec.link_to_scholarship && (
            <button onClick={() => navigate(sec.link_to_scholarship!)} className="w-full text-content-navy border border-content-line rounded-full py-3 text-sm">
              Калькулятор ER.GO →
            </button>
          )}
        </div>
      )}

      {sec.blocks_ru && (
        <div className="flex flex-col gap-3 mt-5">
          {sec.blocks_ru.map((b, i) => (
            <div key={i} className="bg-content-surface border border-content-line rounded-2xl px-4 py-3.5">
              <p className="text-content-navy text-base font-semibold">{b.title_ru}</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1">{b.description_ru}</p>
              {b.tip_ru && (
                <div className="bg-content-gold-bg rounded-lg px-3 py-2 mt-2">
                  <p className="text-content-gold text-[10px] uppercase tracking-widest mb-0.5 font-semibold">Совет</p>
                  <p className="text-content-ink text-xs leading-relaxed">{b.tip_ru}</p>
                </div>
              )}
              {b.url && (
                <a href={b.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-1 inline-block">
                  {b.url.replace('https://www.', '').replace('https://', '')} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {sec.resources_ru && (
        <div className="flex flex-col gap-3 mt-5">
          {sec.resources_ru.map((r, i) => (
            <div key={i} className="bg-content-surface border border-content-line rounded-2xl px-4 py-3.5">
              <p className="text-content-navy text-base font-semibold">{r.name_ru}</p>
              <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1">{r.description_ru}</p>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-1 inline-block">
                  {r.url.replace('https://www.', '').replace('https://', '')} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {sec.static_tips_ru && (
        <Card>
          <p className="text-content-gold text-xs mb-3 font-semibold uppercase tracking-wide">Пока что — статичные советы</p>
          <div className="flex flex-col gap-2">
            {sec.static_tips_ru.map((t, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-content-ink text-[14.5px] leading-relaxed">{t.label_ru}</p>
                  {t.url && (
                    <a href={t.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline">
                      {t.url.replace('https://', '')} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sec.tip_ru && (
        <Note>
          <p className="text-content-gold text-[10px] uppercase tracking-widest mb-1 font-semibold">Совет</p>
          {sec.tip_ru}
        </Note>
      )}

      {sec.note_ru && <p className="text-content-ink-2 text-xs italic mt-4 leading-relaxed">{sec.note_ru}</p>}
      {sec.official_note_ru && <p className="text-content-ink-2 text-xs italic mt-2 leading-relaxed">{sec.official_note_ru}</p>}

      {sec.laura_help_ru && (
        <button
          onClick={() => navigate('/laura')}
          className="w-full text-content-navy bg-content-gold-bg border border-content-line rounded-full py-3 text-sm mt-5"
        >
          ✦ Спросить Лауру про {sec.title_ru}
        </button>
      )}

      {sec.trigger_action === 'switch_to_bachelor' && (
        <div className="mt-6"><FyToBachelorButton /></div>
      )}

      {sec.links && sec.links.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-5">
          {sec.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default function ParmaSubsectionPage() {
  const navigate = useNavigate();
  const { subsection: subId } = useParams();
  const { parmaLife, loading } = useParmaLife();

  if (loading || !parmaLife) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }

  const sec = parmaLife.subsections.find((s) => s.id === subId);
  if (!sec) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-content-bg px-8 text-center">
        <p className="font-golos text-content-ink text-base mb-4">Раздел не найден</p>
        <button onClick={() => navigate('/path/parma')} className="font-golos text-white bg-content-navy rounded-full px-6 py-2 text-sm">
          ← В Парме
        </button>
      </div>
    );
  }

  const introText = [sec.what_ru, sec.intro_ru, sec.description_ru].filter(Boolean).join(' ');

  return (
    <ContentPage>
      <PageHeader
        crumb="В Парме"
        title={sec.title_ru}
        subtitle={introText ? sec.subtitle_ru : undefined}
        backTo="/path/parma"
      />

      <TldrCard>{introText || sec.subtitle_ru || sec.title_ru}</TldrCard>

      <Renderer sec={sec} />

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Адреса, цены и сроки могут меняться — проверяй на офиц. сайтах
      </p>
    </ContentPage>
  );
}
