import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useParmaLife } from '../hooks/useParmaLife';
import { Price } from '../components/Price';
import type { ParmaSubsection } from '../types/parmaLife';

function Corners() {
  return (
    <>
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
    </>
  );
}

function BulletList({ items, icon = '◆' }: { items: string[]; icon?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((s, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-gold flex-shrink-0 mt-0.5 text-xs">{icon}</span>
          <p className="font-serif text-navy/80 text-sm leading-relaxed">{s}</p>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">{children}</p>;
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
      <button
        onClick={() => setConfirming(true)}
        className="w-full font-serif text-cream bg-navy rounded-full py-3 text-sm"
      >
        Я перехожу на бакалавриат →
      </button>
    );
  }

  return (
    <div className="bg-gold/10 border border-gold/60 rounded-2xl p-4 flex flex-col gap-3">
      <p className="font-serif text-navy text-sm leading-relaxed">
        Ты завершаешь Foundation и переходишь к поступлению на бакалавриат. Раздел Университет обновится под бакалавриат. Продолжить?
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 font-serif text-navy border border-navy/30 rounded-full py-2.5 text-sm"
        >
          Отмена
        </button>
        <button
          onClick={doSwitch}
          className="flex-1 font-serif text-cream bg-navy rounded-full py-2.5 text-sm"
        >
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
      {/* Главное описание */}
      {(sec.what_ru || sec.intro_ru || sec.description_ru) && (
        <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
          {sec.what_ru && (
            <p className="font-serif text-navy/80 text-sm leading-relaxed">{sec.what_ru}</p>
          )}
          {sec.intro_ru && (
            <p className="font-serif text-navy/80 text-sm leading-relaxed">{sec.intro_ru}</p>
          )}
          {sec.description_ru && (
            <p className="font-serif text-navy/80 text-sm leading-relaxed">{sec.description_ru}</p>
          )}
        </div>
      )}

      {/* Предупреждение (gold) */}
      {sec.warning_ru && (
        <div className="mx-6 mt-4 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex gap-3">
          <span className="text-gold text-sm flex-shrink-0 mt-0.5">⚠</span>
          <p className="font-serif text-navy/85 text-sm leading-relaxed font-bold">{sec.warning_ru}</p>
        </div>
      )}

      {/* Mobile version status */}
      {sec.status === 'mobile_version' && sec.mobile_version_note_ru && (
        <div className="mx-6 mt-4 bg-soft-cream border border-gold/40 rounded-2xl px-4 py-3 flex gap-3">
          <span className="text-gold text-lg flex-shrink-0">📱</span>
          <p className="font-serif text-navy/80 text-sm leading-relaxed italic">{sec.mobile_version_note_ru}</p>
        </div>
      )}

      {/* Зачем нужна (why) */}
      {sec.why_ru && (
        <>
          <SectionLabel>Зачем нужна</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
            <BulletList items={sec.why_ru} />
          </div>
        </>
      )}

      {/* Important for foreigners */}
      {sec.important_for_foreigners_ru && (
        <>
          <SectionLabel>Важно для иностранцев</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
            <BulletList items={sec.important_for_foreigners_ru} icon="⚠" />
          </div>
        </>
      )}

      {/* Шаги (steps) */}
      {sec.steps_ru && (
        <>
          <SectionLabel>Шаги</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <ol className="flex flex-col gap-2.5">
              {sec.steps_ru.map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                  <p className="font-serif text-navy/80 text-sm leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Documents */}
      {sec.documents_ru && (
        <>
          <SectionLabel>Документы</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <BulletList items={sec.documents_ru} />
          </div>
        </>
      )}

      {/* Requirements */}
      {sec.requirements_ru && (
        <>
          <SectionLabel>Требования</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <BulletList items={sec.requirements_ru} icon="✓" />
          </div>
        </>
      )}

      {/* Functionality */}
      {sec.functionality_ru && (
        <>
          <SectionLabel>Что можно делать через SPID</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <BulletList items={sec.functionality_ru} icon="✓" />
          </div>
        </>
      )}

      {/* Free option highlight */}
      {sec.free_option_ru && (
        <div className="mx-6 mt-4 relative bg-navy rounded-2xl p-5">
          <Corners />
          <p className="font-serif text-gold text-xs italic">бесплатный вариант</p>
          <p className="font-serif text-cream text-sm leading-relaxed mt-1">{sec.free_option_ru}</p>
        </div>
      )}

      {/* Cost (number) */}
      {sec.cost_eur != null && (
        <div className="mx-6 mt-4 relative bg-navy rounded-2xl p-5">
          <Corners />
          <p className="font-serif text-gold text-xs italic">стоимость</p>
          <p className="font-serif text-cream text-3xl font-bold mt-1">
            <Price eur={sec.cost_eur} />
          </p>
        </div>
      )}

      {/* Procedure */}
      {sec.procedure_ru && (
        <>
          <SectionLabel>Процедура</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            {Array.isArray(sec.procedure_ru) ? (
              <ol className="flex flex-col gap-2.5">
                {sec.procedure_ru.map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                    <p className="font-serif text-navy/80 text-sm leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="font-serif text-navy/80 text-sm leading-relaxed">{sec.procedure_ru}</p>
            )}
          </div>
        </>
      )}

      {/* Where */}
      {sec.where_ru && (
        <div className="mx-6 mt-3 bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
          <p className="font-serif text-gold text-xs italic mb-1">Куда идти</p>
          <p className="font-serif text-navy/80 text-sm leading-relaxed">{sec.where_ru}</p>
        </div>
      )}

      {/* Contracts (work) */}
      {sec.contracts_ru && (
        <>
          <SectionLabel>{sec.contracts_ru.title_ru}</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <BulletList items={sec.contracts_ru.types_ru} />
            <div className="bg-gold/10 border border-gold/60 rounded-xl px-4 py-3 mt-3 flex gap-2">
              <span className="text-gold text-sm flex-shrink-0">⚠</span>
              <p className="font-serif text-navy/85 text-xs leading-relaxed font-bold">
                {sec.contracts_ru.student_limit_ru}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-cream border border-navy/15 rounded-xl px-3 py-3">
                <p className="font-serif text-navy/50 text-[10px] italic uppercase tracking-widest">в час</p>
                <p className="font-serif text-navy text-base font-bold mt-1">
                  <Price eur={sec.contracts_ru.avg_hourly_eur_min} />–<Price eur={sec.contracts_ru.avg_hourly_eur_max} />
                </p>
                <p className="font-serif text-navy/50 text-[10px] mt-0.5">net</p>
              </div>
              <div className="bg-cream border border-navy/15 rounded-xl px-3 py-3">
                <p className="font-serif text-navy/50 text-[10px] italic uppercase tracking-widest">в месяц</p>
                <p className="font-serif text-navy text-base font-bold mt-1">
                  <Price eur={sec.contracts_ru.avg_monthly_eur_min} />–<Price eur={sec.contracts_ru.avg_monthly_eur_max} />
                </p>
                <p className="font-serif text-navy/50 text-[10px] mt-0.5">20 ч/нед</p>
              </div>
            </div>

            <p className="font-serif text-navy/60 text-xs italic mt-3 leading-relaxed">{sec.contracts_ru.avg_hours_ru}</p>
          </div>
        </>
      )}

      {/* Language logic (B1/B2 for FY → bachelor) */}
      {sec.language_logic_ru && (
        <>
          <SectionLabel>По уровню итальянского</SectionLabel>
          <div className="px-6 flex flex-col gap-3">
            <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-3">
              <p className="font-serif text-navy text-sm font-bold mb-1">B2 — отлично</p>
              <p className="font-serif text-navy/70 text-sm leading-relaxed">{sec.language_logic_ru.b2_ru}</p>
            </div>
            <div className="bg-soft-cream border border-gold/40 rounded-2xl px-4 py-3">
              <p className="font-serif text-navy text-sm font-bold mb-1">B1 — нужны доп. курсы</p>
              <p className="font-serif text-navy/70 text-sm leading-relaxed">{sec.language_logic_ru.b1_ru}</p>
            </div>
          </div>
        </>
      )}

      {/* Process (FY → bachelor) */}
      {sec.process_ru && (
        <>
          <SectionLabel>Как это происходит</SectionLabel>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <ol className="flex flex-col gap-2.5">
              {sec.process_ru.map((s, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="font-serif text-gold font-bold text-sm flex-shrink-0 w-4">{i + 1}.</span>
                  <p className="font-serif text-navy/80 text-sm leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Important after-process note */}
      {sec.important_ru && (
        <div className="mx-6 mt-3 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex gap-3">
          <span className="text-gold text-sm flex-shrink-0 mt-0.5">◆</span>
          <p className="font-serif text-navy/85 text-sm leading-relaxed">{sec.important_ru}</p>
        </div>
      )}

      {/* ER.GO foundation block (link to ISEE + scholarship) */}
      {(sec.link_to_isee || sec.link_to_scholarship) && (
        <div className="px-6 mt-4 flex flex-col gap-3">
          {sec.link_to_isee && (
            <button
              onClick={() => navigate(sec.link_to_isee!)}
              className="w-full font-serif text-cream bg-navy rounded-full py-3 text-sm"
            >
              Документы для ISEE parificato →
            </button>
          )}
          {sec.link_to_scholarship && (
            <button
              onClick={() => navigate(sec.link_to_scholarship!)}
              className="w-full font-serif text-navy border border-navy/30 rounded-full py-3 text-sm"
            >
              Калькулятор ER.GO →
            </button>
          )}
        </div>
      )}

      {/* Blocks (transport / language-sport / erasmus) */}
      {sec.blocks_ru && (
        <div className="px-6 mt-5 flex flex-col gap-3">
          {sec.blocks_ru.map((b, i) => (
            <div key={i} className="bg-soft-cream border border-navy/15 rounded-2xl px-4 py-3.5">
              <p className="font-serif text-navy text-base font-bold">{b.title_ru}</p>
              <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{b.description_ru}</p>
              {b.url && (
                <a
                  href={b.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-gold text-xs underline mt-1 inline-block"
                >
                  {b.url.replace('https://www.', '').replace('https://', '')} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resources (support) */}
      {sec.resources_ru && (
        <div className="px-6 mt-5 flex flex-col gap-3">
          {sec.resources_ru.map((r, i) => (
            <div key={i} className="bg-soft-cream border border-navy/15 rounded-2xl px-4 py-3.5">
              <p className="font-serif text-navy text-base font-bold">{r.name_ru}</p>
              <p className="font-serif text-navy/70 text-sm leading-relaxed mt-1">{r.description_ru}</p>
              {r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-serif text-gold text-xs underline mt-1 inline-block"
                >
                  {r.url.replace('https://www.', '').replace('https://', '')} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Static tips (social_life) */}
      {sec.static_tips_ru && (
        <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
          <p className="font-serif text-gold text-xs italic mb-3">Пока что — статичные советы</p>
          <div className="flex flex-col gap-2">
            {sec.static_tips_ru.map((t, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                <div className="flex-1">
                  <p className="font-serif text-navy/80 text-sm leading-relaxed">{t.label_ru}</p>
                  {t.url && (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-serif text-gold text-xs underline"
                    >
                      {t.url.replace('https://', '')} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      {sec.tip_ru && (
        <div className="mx-6 mt-4 bg-gold/10 border border-gold/40 rounded-2xl px-4 py-3">
          <p className="font-serif text-navy/80 text-sm leading-relaxed">💡 {sec.tip_ru}</p>
        </div>
      )}

      {/* Note */}
      {sec.note_ru && (
        <p className="font-serif text-navy/60 text-xs italic px-6 mt-4 leading-relaxed">{sec.note_ru}</p>
      )}

      {/* Official note */}
      {sec.official_note_ru && (
        <p className="font-serif text-navy/50 text-xs italic px-6 mt-2 leading-relaxed">{sec.official_note_ru}</p>
      )}

      {/* Лаура */}
      {sec.laura_help_ru && (
        <button
          onClick={() => navigate('/laura')}
          className="mx-6 mt-5 font-serif text-navy bg-gold/20 border border-gold/50 rounded-full py-3 text-sm"
        >
          ✦ Спросить Лауру про {sec.title_ru}
        </button>
      )}

      {/* FY → bachelor trigger */}
      {sec.trigger_action === 'switch_to_bachelor' && (
        <div className="px-6 mt-6">
          <FyToBachelorButton />
        </div>
      )}

      {/* External links */}
      {sec.links && sec.links.length > 0 && (
        <div className="px-6 mt-5 flex flex-wrap gap-3">
          {sec.links.map((l) => (
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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  const sec = parmaLife.subsections.find((s) => s.id === subId);
  if (!sec) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-8 text-center">
        <p className="font-serif text-navy text-base mb-4">Раздел не найден</p>
        <button
          onClick={() => navigate('/path/parma')}
          className="font-serif text-cream bg-navy rounded-full px-6 py-2 text-sm"
        >
          ← В Парме
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/parma')} className="text-navy text-2xl">←</button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{sec.icon}</span>
          <div className="min-w-0">
            <h1 className="font-serif text-navy text-2xl font-bold leading-tight">{sec.title_ru}</h1>
            {sec.subtitle_ru && (
              <p className="font-serif text-gold text-sm italic leading-tight">{sec.subtitle_ru}</p>
            )}
          </div>
        </div>
      </div>

      <Renderer sec={sec} />

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-8">
        Адреса, цены и сроки могут меняться — проверяй на офиц. сайтах
      </p>
    </div>
  );
}
