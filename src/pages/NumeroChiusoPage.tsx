import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNumeroChiuso } from '../hooks/useProgram';
import { Price } from '../components/Price';
import type { TestEntry } from '../types/laurea';

function TestCard({ test }: { test: TestEntry }) {
  const [open, setOpen] = useState(false);
  const hasSections = test.structure.sections && test.structure.sections.length > 0;

  return (
    <div className={
      'bg-soft-cream border rounded-2xl overflow-hidden ' +
      (test.is_new_2026 ? 'border-gold/60' : 'border-navy/20')
    }>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-4 flex items-start gap-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-serif text-navy text-base font-bold">{test.name}</p>
            {test.is_new_2026 && (
              <span className="font-serif text-[10px] text-gold border border-gold/60 rounded-full px-2 py-0.5 flex-shrink-0">
                новый 2026
              </span>
            )}
          </div>
          <p className="font-serif text-navy/60 text-xs mt-0.5 leading-relaxed">{test.for_ru}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="font-serif text-navy/50 text-[10px]">тест</p>
            <p className="font-serif text-navy text-sm font-bold"><Price eur={test.cost_eur} /></p>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 14 14"
            className={'text-navy transition-transform ' + (open ? 'rotate-180' : '')}
            fill="currentColor"
          >
            <path d="M7 10L1 4h12L7 10z" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-navy/10 pt-3">

          {/* Структура секций */}
          {hasSections && (
            <div>
              <p className="font-serif text-navy/60 text-xs italic mb-1.5">Структура теста</p>
              <div className="flex flex-col gap-1">
                {test.structure.sections!.map((sec, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <p className="font-serif text-navy/80 text-xs">{sec.name_ru}</p>
                    <p className="font-serif text-navy/50 text-xs flex-shrink-0 ml-2">{sec.questions} вопр.</p>
                  </div>
                ))}
              </div>
              {test.structure.english_section && (
                <p className="font-serif text-navy/40 text-[11px] italic mt-1">
                  + {test.structure.english_section}
                </p>
              )}
              {test.structure.language && (
                <p className="font-serif text-gold text-xs mt-1 font-bold">
                  Язык: {test.structure.language}
                </p>
              )}
            </div>
          )}

          {/* Структура без секций (note_ru) */}
          {!hasSections && test.structure.note_ru && (
            <p className="font-serif text-navy/70 text-xs leading-relaxed">{test.structure.note_ru}</p>
          )}

          {/* Длительность + баллы */}
          <div className="flex gap-3 flex-wrap">
            {test.structure.duration_min > 0 && (
              <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2 flex-1 min-w-0">
                <p className="font-serif text-navy/50 text-[10px] italic">время</p>
                <p className="font-serif text-navy text-sm font-bold">{test.structure.duration_min} мин</p>
              </div>
            )}
            <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2 flex-1 min-w-0">
              <p className="font-serif text-navy/50 text-[10px] italic">баллы</p>
              <p className="font-serif text-navy text-xs leading-snug">{test.scoring_ru}</p>
            </div>
          </div>

          {/* Где сдавать */}
          <div className="flex items-start gap-2">
            <span className="text-gold text-xs mt-0.5 flex-shrink-0">◆</span>
            <p className="font-serif text-navy/70 text-xs leading-relaxed">{test.where_ru}</p>
          </div>

          {/* Проходной балл */}
          {test.passing_ru && (
            <p className="font-serif text-navy/50 text-xs italic">{test.passing_ru}</p>
          )}

          {/* Примечание */}
          {test.note_ru && (
            <div className="bg-cream border border-gold/30 rounded-xl px-3 py-2">
              <p className="font-serif text-navy/70 text-xs leading-relaxed">💡 {test.note_ru}</p>
            </div>
          )}

          {/* Ссылка */}
          <a
            href={test.url}
            target="_blank"
            rel="noreferrer"
            className="font-serif text-gold text-xs underline"
          >
            {test.url.replace('https://', '')} ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function NumeroChiusoPage() {
  const navigate = useNavigate();
  const data = useNumeroChiuso();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  const at = data.access_types_explained;
  const howTo = data.how_to_take_ru;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Numero chiuso и тесты</h1>
      </div>

      {/* CEnT-S предупреждение 2026 */}
      <div className="mx-6 mt-5 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex gap-3">
        <span className="text-gold text-sm flex-shrink-0 mt-0.5">⚠</span>
        <p className="font-serif text-navy/80 text-xs leading-relaxed">
          {data.meta.important_2026_change_ru}
        </p>
      </div>

      {/* Libero vs Chiuso — 2 карточки */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">
        Типы доступа к программам
      </p>
      <div className="px-6 flex flex-col gap-3">

        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
          <p className="font-serif text-navy text-base font-bold mb-1">{at.libero_accesso.name_ru}</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed mb-2">{at.libero_accesso.description_ru}</p>
          <div className="bg-cream border border-navy/10 rounded-xl px-3 py-2">
            <p className="font-serif text-navy text-xs font-bold">✓ {at.libero_accesso.key_point_ru}</p>
          </div>
        </div>

        <div className="relative bg-navy rounded-2xl px-4 py-4">
          <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
          <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
          <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
          <p className="font-serif text-cream text-base font-bold mb-1">{at.numero_chiuso.name_ru}</p>
          <p className="font-serif text-cream/70 text-sm leading-relaxed mb-2">{at.numero_chiuso.description_ru}</p>
          <div className="bg-cream/10 rounded-xl px-3 py-2">
            <p className="font-serif text-gold text-xs font-bold">◆ {at.numero_chiuso.key_point_ru}</p>
          </div>
        </div>

      </div>

      {/* Список тестов */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">
        Все тесты UniPR (9 типов)
      </p>
      <div className="px-6 flex flex-col gap-3">
        {data.tests.map((t) => (
          <TestCard key={t.id} test={t} />
        ))}
      </div>

      {/* Как сдавать */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Как и где сдавать</p>
      <div className="px-6 flex flex-col gap-3">
        {[
          { label: 'TOLC@CASA vs TOLC@UNI', text: howTo.tolc_casa_vs_uni },
          { label: 'Пересдача', text: howTo.can_retake },
          { label: 'Из стран СНГ', text: howTo.where_cis_countries },
          { label: 'Подготовка', text: howTo.preparation_ru },
        ].map((item, i) => (
          <div key={i} className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-3">
            <p className="font-serif text-navy text-sm font-bold mb-1">{item.label}</p>
            <p className="font-serif text-navy/70 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Структура актуальна на 2026/2027 — проверяй syllabus на cisiaonline.it перед подготовкой
      </p>
    </div>
  );
}
