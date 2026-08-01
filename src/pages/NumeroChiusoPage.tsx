import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useNumeroChiuso } from '../hooks/useProgram';
import { Price } from '../components/Price';
import type { TestEntry } from '../types/laurea';
import { ContentPage, PageHeader, TldrCard, H2, InfoCard, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

function TestCard({ test }: { test: TestEntry }) {
  const [open, setOpen] = useState(false);
  const hasSections = test.structure.sections && test.structure.sections.length > 0;

  return (
    <div className={
      'bg-content-surface border rounded-2xl overflow-hidden ' +
      (test.is_new_2026 ? 'border-content-gold' : 'border-content-line')
    }>
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-4 flex items-start gap-3 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-content-navy text-base font-semibold">{test.name}</p>
            {test.is_new_2026 && (
              <span className="text-[10px] text-content-gold bg-content-gold-bg rounded-full px-2 py-0.5 flex-shrink-0 font-semibold uppercase">
                новый 2026
              </span>
            )}
          </div>
          <p className="text-content-ink-2 text-xs mt-0.5 leading-relaxed">{test.for_ru}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-content-ink-2 text-[10px]">тест</p>
            <p className="text-content-navy text-sm font-bold"><Price eur={test.cost_eur} /></p>
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14"
            className={'text-content-navy transition-transform ' + (open ? 'rotate-180' : '')} fill="currentColor">
            <path d="M7 10L1 4h12L7 10z" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-content-line pt-3">
          {hasSections && (
            <div>
              <p className="text-content-ink-2 text-xs mb-1.5">Структура теста</p>
              <div className="flex flex-col gap-1">
                {test.structure.sections!.map((sec, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <p className="text-content-ink text-[13px]">{sec.name_ru}</p>
                    <p className="text-content-ink-2 text-xs flex-shrink-0 ml-2">{sec.questions} вопр.</p>
                  </div>
                ))}
              </div>
              {test.structure.english_section && (
                <p className="text-content-ink-2 text-[11px] italic mt-1">+ {test.structure.english_section}</p>
              )}
              {test.structure.language && (
                <p className="text-content-gold text-xs mt-1 font-semibold">Язык: {test.structure.language}</p>
              )}
            </div>
          )}

          {!hasSections && test.structure.note_ru && (
            <p className="text-content-ink-2 text-[13px] leading-relaxed">{test.structure.note_ru}</p>
          )}

          <div className="flex gap-3 flex-wrap">
            {test.structure.duration_min > 0 && (
              <div className="bg-content-bg border border-content-line rounded-xl px-3 py-2 flex-1 min-w-0">
                <p className="text-content-ink-2 text-[10px]">время</p>
                <p className="text-content-navy text-sm font-bold">{test.structure.duration_min} мин</p>
              </div>
            )}
            <div className="bg-content-bg border border-content-line rounded-xl px-3 py-2 flex-1 min-w-0">
              <p className="text-content-ink-2 text-[10px]">баллы</p>
              <p className="text-content-ink text-xs leading-snug">{test.scoring_ru}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-content-gold text-xs mt-0.5 flex-shrink-0">◆</span>
            <p className="text-content-ink-2 text-[13px] leading-relaxed">{test.where_ru}</p>
          </div>

          {test.passing_ru && <p className="text-content-ink-2 text-xs italic">{test.passing_ru}</p>}

          {test.note_ru && (
            <div className="bg-content-gold-bg rounded-xl px-3 py-2">
              <p className="text-content-ink text-[13px] leading-relaxed">{test.note_ru}</p>
            </div>
          )}

          <a href={test.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline">
            {test.url.replace('https://', '')} ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function NumeroChiusoPage() {
  const data = useNumeroChiuso();

  if (!data) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }

  const at = data.access_types_explained;
  const howTo = data.how_to_take_ru;

  return (
    <ContentPage>
      <PageHeader crumb="Университет · Программа" title="Numero chiuso и тесты" backTo="/path/uni/program" />

      <TldrCard stats={[{ value: String(data.tests.length), label: 'типов теста' }]}>
        Программы бывают со <b>свободным доступом</b> (libero) и с <b>отбором</b> (numero chiuso).
        Для многих нужен вступительный тест TOLC — типы и структура ниже.
      </TldrCard>

      <Note icon={<TriangleAlert size={15} />}>{data.meta.important_2026_change_ru}</Note>

      <H2>Типы доступа</H2>
      <div className="flex flex-col gap-3 mt-4">
        <InfoCard title={at.libero_accesso.name_ru}>
          <p className="leading-relaxed">{at.libero_accesso.description_ru}</p>
          <div className="bg-content-gold-bg rounded-xl px-3 py-2 mt-2">
            <p className="text-content-navy text-[13px] font-semibold">✓ {at.libero_accesso.key_point_ru}</p>
          </div>
        </InfoCard>

        <div className="rounded-2xl bg-content-navy px-4 py-4">
          <p className="text-white text-base font-semibold mb-1">{at.numero_chiuso.name_ru}</p>
          <p className="text-white/70 text-[14.5px] leading-relaxed mb-2">{at.numero_chiuso.description_ru}</p>
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <p className="text-[#D8BC85] text-[13px] font-semibold">◆ {at.numero_chiuso.key_point_ru}</p>
          </div>
        </div>
      </div>

      <H2>Все тесты UniPR</H2>
      <div className="flex flex-col gap-3 mt-4">
        {data.tests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>

      <H2>Как и где сдавать</H2>
      <div className="flex flex-col gap-3 mt-4">
        {[
          { label: 'TOLC@CASA vs TOLC@UNI', text: howTo.tolc_casa_vs_uni },
          { label: 'Пересдача', text: howTo.can_retake },
          { label: 'Из стран СНГ', text: howTo.where_cis_countries },
          { label: 'Подготовка', text: howTo.preparation_ru },
        ].map((item, i) => (
          <InfoCard key={i} title={item.label}>{item.text}</InfoCard>
        ))}
      </div>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Структура актуальна на 2026/2027 — проверяй syllabus на cisiaonline.it перед подготовкой
      </p>
    </ContentPage>
  );
}
