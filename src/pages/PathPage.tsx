import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { NewsWidget } from '../components/NewsWidget';
import { Avatar } from '../components/Avatar';
import { SectionIcon } from '../components/SectionIcon';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { loadCachedAvatar } from '../lib/avatar';
import { longPressHandlers } from '../lib/longPress';
import { sectionsData, parsePrice } from '../lib/sectionsData';
import { useUniCosts } from '../hooks/useCosts';
import { useExpenses } from '../hooks/useExpenses';
import { useFoundation } from '../hooks/useFoundation';
import { useMyProgram } from '../hooks/useProgram';
import { useVisa } from '../hooks/useVisa';
import { useRelocation } from '../hooks/useRelocation';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from '../hooks/useCurrency';
import { COUNTRY_CURRENCY_MAP } from '../config/currencies';
import type { FoundationSeed } from '../types/foundation';
import type { LaureaSeed } from '../types/laurea';
import type { VisaSeed } from '../types/visa';
import type { RelocationSeed } from '../types/relocation';

// Реальные чек-листы (галочки, по которым юзер и правда кликает) появились
// отдельно на каждой странице раздела — эти функции строят те же id, что
// пишут FoundationOverviewPage/ProgramDocumentsPage+ProgramOverviewPage/
// VisaStepsPage, чтобы посчитать прогресс «Универ»/«Виза» на Path по тем
// же самым галочкам, а не по мёртвому generic-чек-листу sectionsData.
function foundationChecklistIds(data: FoundationSeed): string[] {
  const ids: string[] = [];
  data.steps_to_apply.forEach((s) => {
    ids.push(`apply-${s.id}`);
    (s.checklist || []).forEach((_, i) => ids.push(`apply-${s.id}-item-${i}`));
  });
  return ids;
}

function programChecklistIds(program: LaureaSeed): string[] {
  return [
    ...program.documents_required.map((d) => d.id),
    ...program.application_steps.map((s) => s.id),
  ];
}

function visaChecklistIds(visa: VisaSeed): string[] {
  // «Шаги получения визы» (visa-action-N, на VisaOverviewPage) + «Подробнее
  // о документах» (visa-step-…, на VisaStepsPage) — оба чек-листа считаются
  // в один общий процент по разделу «Виза».
  const ids: string[] = visa.action_steps_ru.steps.map((_, idx) => `visa-action-${idx}`);
  visa.steps.forEach((step) => {
    ids.push(`visa-step-${step.id}`);
    (step.checklist_ru || []).forEach((_, i) => ids.push(`visa-step-${step.id}-checklist-${i}`));
    (step.substeps_ru || []).forEach((_, i) => ids.push(`visa-step-${step.id}-substep-${i}`));
    (step.requirements_ru || []).forEach((_, i) => ids.push(`visa-step-${step.id}-req-${i}`));
  });
  return ids;
}

function relocationChecklistIds(relocation: RelocationSeed): string[] {
  return relocation.steps_overview_ru.steps.map((_, idx) => `travel-step-${idx}`);
}

// Возвращает null, если считать не по чему (нет id) — тогда остаётся старый расчёт.
function pctFromIds(ids: string[], storageKeys: string[]): number | null {
  if (ids.length === 0) return null;
  const checked = storageKeys.flatMap((k) => {
    try { return JSON.parse(localStorage.getItem(k) || '[]') as string[]; } catch { return []; }
  });
  const done = ids.filter((id) => checked.includes(id)).length;
  return Math.round((done / ids.length) * 100);
}

function getItemId(section: string, stepNum: number, subIndex: number | null = null): string {
  return subIndex === null
    ? `${section}-step-${stepNum}`
    : `${section}-step-${stepNum}-sub-${subIndex}`;
}

function getSectionSpent(sectionKey: string, isCompletedSection: boolean): number {
  const data = sectionsData[sectionKey];
  if (isCompletedSection) return data.budget;
  const completed = loadCompleted(sectionKey);
  let spent = 0;
  data.steps.forEach((step: any) => {
    if (step.substeps.length === 0) {
      if (completed.includes(getItemId(sectionKey, step.num))) spent += parsePrice(step.price);
    } else {
      step.substeps.forEach((sub: any, i: number) => {
        if (completed.includes(getItemId(sectionKey, step.num, i))) spent += parsePrice(sub.price);
      });
    }
  });
  return spent;
}

function loadCompleted(section: string): string[] {
  const raw = localStorage.getItem(`cispr_done_${section}`);
  return raw ? JSON.parse(raw) : [];
}

// прогресс раздела в процентах
function getSectionProgress(sectionKey: string, isCompletedSection: boolean): number {
  if (isCompletedSection) return 100;
  const completed = loadCompleted(sectionKey);
  const data = sectionsData[sectionKey];
  let total = 0, done = 0;
  data.steps.forEach((step: any) => {
    if (step.substeps.length === 0) {
      total += 1;
      if (completed.includes(getItemId(sectionKey, step.num))) done += 1;
    } else {
      step.substeps.forEach((_: any, i: number) => {
        total += 1;
        if (completed.includes(getItemId(sectionKey, step.num, i))) done += 1;
      });
    }
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export default function PathPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { totalByCategory: customExpenses } = useExpenses();
  const { currency, setCurrency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  // Долгий тап по карточке «Расходы» — быстро добавить свой расход
  const [expenseFor, setExpenseFor] = useState<string | null>(null);

  // Реальные данные разделов — чтобы посчитать прогресс по настоящим
  // галочкам (см. foundationChecklistIds/programChecklistIds/visaChecklistIds)
  const { data: foundationData } = useFoundation();
  const { program: programData } = useMyProgram();
  const { visa: visaData } = useVisa();
  const { relocation: relocationData } = useRelocation();
  const cisprProgram = localStorage.getItem('cispr_program');

  // Динамический бюджет раздела «Универ» — по стране + программе
  const dynamicUniBudget = uniCosts.loading ? sectionsData.uni.budget : uniCosts.total_eur;

  const passed = localStorage.getItem('cispr_passed_quiz') || 'uni';
  const sectionsOrder = ['uni', 'visa', 'travel', 'parma'];
  const passedIndex = sectionsOrder.indexOf(passed);

  // готовим разделы для сетки
  const sections = sectionsOrder.map((id, i) => {
    const base = sectionsData[id];
    const isCompletedByQuiz = i < passedIndex;
    let progress = getSectionProgress(id, isCompletedByQuiz);
    if (!isCompletedByQuiz) {
      if (id === 'uni' && cisprProgram === 'foundation' && foundationData) {
        const p = pctFromIds(foundationChecklistIds(foundationData), ['cispr_foundation_checks']);
        if (p !== null) progress = p;
      } else if (id === 'uni' && (cisprProgram === 'bachelor' || cisprProgram === 'master') && programData) {
        const p = pctFromIds(programChecklistIds(programData), ['cispr_docs_checklist', 'cispr_steps_checks']);
        if (p !== null) progress = p;
      } else if (id === 'visa' && visaData) {
        const p = pctFromIds(visaChecklistIds(visaData), ['cispr_visa_action_checks', 'cispr_visa_docs_checks']);
        if (p !== null) progress = p;
      } else if (id === 'travel' && relocationData) {
        const p = pctFromIds(relocationChecklistIds(relocationData), ['cispr_travel_steps_checks']);
        if (p !== null) progress = p;
      }
    }
    const isCompletedSection = isCompletedByQuiz || progress === 100;
    const status = isCompletedSection ? 'done' : (i === passedIndex ? 'current' : 'future');
    return { id, title: base.title, icon: base.icon, status, progress, isCompletedSection };
  });

  // общие расходы — сумма по всем разделам + кастомные расходы юзера
  // (долгий тап по карточке шага — см. AddExpenseSheet), для uni берём
  // динамический бюджет (по стране + программе), для остальных — статика
  const totalSpent = sections.reduce(
    (sum, s) =>
      sum + getSectionSpent(s.id, s.isCompletedSection) + (customExpenses[s.id as keyof typeof customExpenses] || 0),
    0
  );
  const totalBudget = sectionsOrder.reduce(
    (sum, id) => sum + (id === 'uni' ? dynamicUniBudget : sectionsData[id].budget),
    0
  );
  const expensesPercent = totalBudget === 0 ? 0 : Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">

      <div className="flex items-center justify-between px-6 pt-12">
        <div>
          <p className="font-serif text-gold text-sm tracking-wide font-bold">Bentornata,</p>
          <h1 className="font-serif text-navy text-3xl leading-tight">
            {localStorage.getItem('cispr_nickname') || 'Aicezhe'}
          </h1>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="rounded-full border border-navy/25 overflow-hidden flex-shrink-0"
          aria-label="Профиль"
        >
          <Avatar
            src={loadCachedAvatar()}
            name={localStorage.getItem('cispr_nickname') || 'A'}
            size={48}
          />
        </button>
      </div>

      {/* Тонкий разделитель — отделяет шапку аккаунта от контента */}
      <div className="mx-6 mt-5 flex items-center gap-3">
        <span className="flex-1 h-px bg-navy/15" />
        <span className="w-1 h-1 rounded-full bg-gold/70" />
        <span className="flex-1 h-px bg-navy/15" />
      </div>

      {/* Виджет «Сегодня почитать» — 3 материала из мира международной учёбы,
          меняются каждый день детерминированно по дате */}
      <NewsWidget />

      <h3 className="font-serif text-navy text-xl text-center mt-8 mb-4">
        Твой путь
      </h3>

      {/* Этапы пути — вертикальный список с прогресс-баром.
          Решение: 4 квадрата 2×2 сжимали контент и выглядели игрушечно;
          горизонтальные строки дают воздух и фокус на прогрессе. */}
      <div className="mx-6 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden">
        {sections.map((section, i) => {
          const isDone = section.status === 'done';
          const isLast = i === sections.length - 1;
          return (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === 'uni') {
                  const country = localStorage.getItem('cispr_country') || '';
                  setCurrency(COUNTRY_CURRENCY_MAP[country] ?? 'EUR');
                } else {
                  setCurrency('EUR');
                }
                navigate('/path/' + section.id);
              }}
              className={
                'w-full flex items-center gap-4 px-4 py-3.5 text-left active:bg-cream transition-colors ' +
                (isLast ? '' : 'border-b border-navy/10')
              }
            >
              {/* Иконка-акцент в круглом контейнере: тонкие линии золотом.
                  Done: navy фон. Активный: cream фон. Обводка золотая в обоих. */}
              <div
                className={
                  'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ' +
                  (isDone ? 'bg-navy border border-gold/40' : 'bg-cream border border-gold/40')
                }
              >
                <SectionIcon id={section.id as 'uni' | 'visa' | 'travel' | 'parma'} className="w-6 h-6 text-gold" />
              </div>

              {/* Контент: название + прогресс-бар + проценты */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <h4 className="font-serif text-navy text-base font-bold">{section.title}</h4>
                  <p
                    className={
                      'font-serif text-xs flex-shrink-0 ' +
                      (isDone ? 'text-gold font-bold' : 'text-navy/50')
                    }
                  >
                    {isDone ? '✓ пройдено' : `${section.progress}%`}
                  </p>
                </div>
                <div className="h-1 rounded-full bg-navy/10 overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all duration-500 ' + (isDone ? 'bg-gold' : 'bg-navy')}
                    style={{ width: section.progress + '%' }}
                  />
                </div>
              </div>

              {/* Шеврон */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                className="text-navy/40 flex-shrink-0 -rotate-90"
                fill="currentColor"
              >
                <path d="M7 10L1 4h12L7 10z" />
              </svg>
            </button>
          );
        })}
      </div>

      <h3 className="font-serif text-gold text-lg italic px-6 mt-8 mb-2">
        Расходы
      </h3>
      {/* Тап — таблица «Стоимость» по всем разделам. Долгий тап — быстро
          добавить свой расход, не заходя на страницу. */}
      <button
        onClick={() => navigate('/path/expenses')}
        className="mx-6 text-left bg-soft-cream border border-navy/25 rounded-2xl p-5 select-none"
        style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}
        {...longPressHandlers(() => setExpenseFor('Расход'))}
      >
        <p className="font-serif text-navy text-lg">
          {fmt(totalSpent)} <span className="text-navy/60 text-sm">из {fmt(totalBudget)}</span>
        </p>
        <div className="h-1.5 rounded-full bg-navy/15 overflow-hidden mt-2">
          <div
            className="h-full bg-navy rounded-full transition-all duration-500"
            style={{ width: expensesPercent + '%' }}
          />
        </div>

        {/* Разбивка по разделам */}
        <div className="mt-3 pt-3 border-t border-navy/10 flex flex-col gap-1.5">
          {sectionsOrder.map((id) => {
            const budget = id === 'uni' ? dynamicUniBudget : sectionsData[id].budget;
            const label = sectionsData[id].titleFull;
            // «В Парме» — это годовой расход на жизнь после переезда (а не на разовое мероприятие)
            const perYear = id === 'parma';
            return (
              <div key={id} className="flex justify-between items-baseline">
                <p className="font-serif text-navy/60 text-xs">
                  {label}{perYear ? ' · в год' : ''}
                </p>
                <p className="font-serif text-navy/80 text-xs">{fmt(budget)}</p>
              </div>
            );
          })}
        </div>

        {/* Примечание об Украине (временная защита) */}
        {uniCosts.has_visa_waiver && (
          <p className="font-serif text-gold text-xs mt-3 font-bold">
            ✓ Временная защита ЕС: виза D не нужна — стоимость визы не включена
          </p>
        )}

        <p className="font-serif text-navy/40 text-[11px] italic mt-2">
          Оценки для {uniCosts.country?.toUpperCase()} · меняй валюту в Настройках
        </p>
      </button>

      {expenseFor && (
        <AddExpenseSheet
          defaultCategory="uni"
          defaultLabel={expenseFor}
          onClose={() => setExpenseFor(null)}
        />
      )}

      <TabBar active="path" />

    </div>
  );
}