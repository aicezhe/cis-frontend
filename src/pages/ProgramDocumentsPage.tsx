import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { useMyLegalization } from '../hooks/useFoundation';
import type { RequiredDocument, TwelfthYearOptions } from '../types/laurea';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';

const DOCS_KEY = 'cispr_docs_checklist';
const TWELFTH_YEAR_KEY = 'cispr_12year_path';
const BACHELOR_COUNTRY_KEY = 'cispr_bachelor_country';

function loadChecked(): string[] {
  try { return JSON.parse(localStorage.getItem(DOCS_KEY) || '[]'); } catch { return []; }
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

// Блок «12-й год» — только для бакалавриата.
function TwelfthYearBlock({ data }: { data: TwelfthYearOptions }) {
  const [answer, setAnswer] = useState<string | null>(() => localStorage.getItem(TWELFTH_YEAR_KEY));
  const [openId, setOpenId] = useState<string | null>(answer);

  function choose(id: string) {
    setAnswer(id);
    localStorage.setItem(TWELFTH_YEAR_KEY, id);
    setOpenId(id);
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      <Note>
        <b>{data.title_ru}.</b> {data.explanation_ru}
      </Note>

      <div>
        <p className="text-content-ink-2 text-[13px] mb-2">Ты получила 12 лет учёбы с помощью:</p>
        <div className="flex flex-col gap-2">
          {data.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={
                'w-full text-left rounded-xl border px-3.5 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold ' +
                (answer === opt.id
                  ? 'bg-content-navy border-content-navy text-white font-semibold'
                  : 'bg-content-surface border-content-line text-content-ink')
              }
            >
              {opt.name_ru}
            </button>
          ))}
        </div>
      </div>

      {data.options.map((opt) => {
        const isOpen = openId === opt.id;
        const isChosen = answer === opt.id;
        return (
          <div
            key={opt.id}
            className={
              'bg-content-surface border rounded-2xl overflow-hidden ' +
              (isChosen ? 'border-content-gold' : 'border-content-line')
            }
          >
            <button
              onClick={() => setOpenId(isOpen ? null : opt.id)}
              className="w-full px-4 py-4 flex items-start gap-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-content-navy text-base font-semibold">{opt.name_ru}</p>
                  {isChosen && (
                    <span className="text-[10px] text-content-gold bg-content-gold-bg rounded-full px-2 py-0.5 flex-shrink-0 font-semibold uppercase">
                      твой путь
                    </span>
                  )}
                </div>
                <p className="text-content-ink-2 text-[13px] mt-0.5 leading-relaxed">{opt.description_ru}</p>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 14 14"
                className={'text-content-navy flex-shrink-0 mt-1 transition-transform ' + (isOpen ? 'rotate-180' : '')}
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-content-line pt-3 flex flex-col gap-2">
                <p className="text-content-ink-2 text-xs">Документы для этого пути:</p>
                {opt.documents_ru.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-content-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                    <p className="text-content-ink text-[13px] leading-relaxed">{doc}</p>
                  </div>
                ))}
                <div className="mt-1 bg-content-gold-bg rounded-xl px-3 py-2">
                  <p className="text-content-ink text-[13px]">
                    <span className="text-content-gold">→</span> {opt.best_for_ru}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-content-ink-2 text-[11px] italic px-1">{data.note_ru}</p>
    </div>
  );
}

function DocCard({ doc, checked, toggle }: {
  doc: RequiredDocument;
  checked: boolean;
  toggle: () => void;
}) {
  const navigate = useNavigate();
  const isDiploma = doc.linked_to_country_seed;
  const extra = EXTRA_DETAILS[doc.id];

  return (
    <div className={
      'bg-content-surface border rounded-2xl px-4 py-4 ' +
      (doc.critical ? 'border-content-gold' : 'border-content-line') +
      (checked ? ' opacity-60' : '')
    }>
      <div className="flex items-start gap-3">
        <button onClick={toggle} className="w-6 h-6 mt-0.5 flex-shrink-0" aria-label={checked ? 'Снять отметку' : 'Отметить'}>
          {checked ? (
            <div className="w-6 h-6 rounded-full bg-content-gold flex items-center justify-center text-white text-xs">✓</div>
          ) : (
            <div className={'w-6 h-6 rounded-full border-2 ' + (doc.critical ? 'border-content-gold' : 'border-content-line')} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={'text-base font-semibold ' + (checked ? 'text-content-ink-2 line-through' : 'text-content-navy')}>
              {doc.name_ru}
            </p>
            {doc.critical && (
              <span className="text-[10px] text-content-gold bg-content-gold-bg rounded-full px-2 py-0.5 leading-none flex-shrink-0 font-semibold uppercase">
                важно
              </span>
            )}
            {doc.optional && (
              <span className="text-[10px] text-content-ink-2 border border-content-line rounded-full px-2 py-0.5 leading-none flex-shrink-0">
                по ситуации
              </span>
            )}
          </div>

          <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-1">{doc.details_ru}</p>

          {extra?.steps && (
            <div className="mt-2 flex flex-col gap-1">
              {extra.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-content-gold text-xs mt-0.5 flex-shrink-0">◆</span>
                  <p className="text-content-ink-2 text-[13px] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          )}
          {extra?.tip && (
            <div className="mt-2 bg-content-gold-bg rounded-xl px-3 py-2">
              <p className="text-content-ink text-[13px] leading-relaxed">{extra.tip}</p>
            </div>
          )}

          {isDiploma && (
            <button
              onClick={() => navigate('/path/uni/program/diploma')}
              className="mt-3 flex items-center gap-1.5 text-content-gold text-xs font-medium"
            >
              <span>Порядок легализации по стране</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProgramDocumentsPage() {
  const { program, programType, loading } = useMyProgram();
  const { legalization } = useMyLegalization();
  const [checked, setChecked] = useState<string[]>(loadChecked);
  const [bachelorCountry, setBachelorCountry] = useState<'home' | 'italy' | null>(
    () => localStorage.getItem(BACHELOR_COUNTRY_KEY) as 'home' | 'italy' | null,
  );

  function toggle(id: string) {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(DOCS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function chooseBachelorCountry(v: 'home' | 'italy') {
    setBachelorCountry(v);
    localStorage.setItem(BACHELOR_COUNTRY_KEY, v);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!program) return null;

  const skipRecognition = programType === 'master' && bachelorCountry === 'italy';
  const docs = program.documents_required.filter((d) => !(skipRecognition && d.id === 'recognition'));
  const total = docs.length;
  const doneCount = docs.filter((d) => checked.includes(d.id)).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const homeCountryLabel = legalization?.meta.country_name_ru || 'своей стране';

  return (
    <ContentPage>
      <PageHeader crumb="Университет · Программа" title="Документы" backTo="/path/uni/program" />

      <TldrCard stats={[{ value: `${doneCount}/${total}`, label: 'собрано' }]}>
        Пакет документов на поступление. Отмечай собранные — <b>прогресс сохраняется</b>.
        {programType === 'master'
          ? ' Для магистратуры признание диплома (CIMEA/DDV) нужно, только если бакалавриат не итальянский.'
          : ' Для бакалавриата важно закрыть 12 лет образования — способ выбери ниже.'}
      </TldrCard>

      {programType === 'master' && (
        <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 mt-4">
          <p className="text-content-navy text-sm font-semibold mb-2">Ты получила степень бакалавра в:</p>
          <div className="flex gap-2">
            <button
              onClick={() => chooseBachelorCountry('home')}
              className={
                'flex-1 rounded-xl border px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold ' +
                (bachelorCountry === 'home'
                  ? 'bg-content-navy border-content-navy text-white font-semibold'
                  : 'bg-content-bg border-content-line text-content-ink')
              }
            >
              {homeCountryLabel}
            </button>
            <button
              onClick={() => chooseBachelorCountry('italy')}
              className={
                'flex-1 rounded-xl border px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold ' +
                (bachelorCountry === 'italy'
                  ? 'bg-content-navy border-content-navy text-white font-semibold'
                  : 'bg-content-bg border-content-line text-content-ink')
              }
            >
              Италия
            </button>
          </div>
          {bachelorCountry === 'italy' && (
            <p className="text-content-ink-2 text-xs mt-2 leading-relaxed">
              Тогда признание диплома (CIMEA/DDV) не нужно — бакалавриат уже в итальянской системе. Убрали этот пункт из списка ниже.
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl bg-content-surface border border-content-line px-5 py-4 mt-4">
        <div className="flex justify-between items-baseline mb-2">
          <p className="text-content-navy text-sm font-medium">Готово</p>
          <p className="text-content-ink-2 text-xs">{doneCount} из {total}</p>
        </div>
        <div className="h-1.5 rounded-full bg-content-line overflow-hidden">
          <div className="h-full rounded-full bg-content-navy transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {docs.map((doc) => (
          <DocCard key={doc.id} doc={doc} checked={checked.includes(doc.id)} toggle={() => toggle(doc.id)} />
        ))}
      </div>

      {programType === 'bachelor' && program.twelfth_year_options && (
        <>
          <H2>12 лет образования — как закрыть</H2>
          <TwelfthYearBlock data={program.twelfth_year_options} />
        </>
      )}

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Актуальный список документов — проверяй на apply.unipr.it перед подачей
      </p>
    </ContentPage>
  );
}
