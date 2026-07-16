import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FileDown, Plus, X } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { sectionsData, parsePrice } from '../lib/sectionsData';
import { useUniCosts } from '../hooks/useCosts';
import { useExpenses } from '../hooks/useExpenses';
import type { Expense, ExpenseCategory } from '../lib/expenses';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';

const SECTIONS_ORDER: ExpenseCategory[] = ['uni', 'visa', 'travel', 'parma'];

interface LineItem {
  id: string;
  label: string;
  eur: number;
  approx?: boolean; // показываем «~» — оценка, а не точный тариф
  note?: string;
}

// Медицина в Парме — выбор юзера: частная страховка (~€150/год) или запись в
// госмедицину SSN (€700/год, тариф для студентов с 2024, подтверждён AUSL Parma).
// Пока переключателя нет — дефолт частная; выбор добавим следующим шагом.
function healthItem(): LineItem {
  const ssn = localStorage.getItem('cispr_health_ssn') === 'true';
  return ssn
    ? { id: 'parma-health', label: 'Медицина: SSN (год)', eur: 700 }
    : { id: 'parma-health', label: 'Медицина: частная страховка (год)', eur: 150, approx: true };
}

// Разворачиваем шаги раздела в отдельные позиции. Новая структура — плоские
// строки с id (для override) и флагом approx. Нулевые убираем.
function staticItems(id: 'visa' | 'travel' | 'parma'): LineItem[] {
  const items: LineItem[] = [];
  sectionsData[id].steps.forEach((step: any) => {
    if (step.substeps && step.substeps.length > 0) {
      step.substeps.forEach((sub: any, i: number) => {
        const eur = parsePrice(sub.price);
        if (eur > 0) items.push({ id: `${id}-${step.num}-${i}`, label: sub.title, eur });
      });
    } else {
      const eur = parsePrice(step.price);
      if (eur > 0) items.push({ id: step.id, label: step.title, eur, approx: step.approx });
    }
  });
  if (id === 'parma') items.push(healthItem());
  return items;
}

// Общая таблица «Стоимость» по всем 4 разделам пути (Универ/Виза/Переезд/
// В Парме) — та же цифра «Расходы» с главной страницы Path, только развёрнуто
// построчно. Тап по разделу разворачивает его подробную разбивку. Плюс можно
// добавить свой расход (долгий тап по карточке «Расходы» на Path или кнопка
// «+» здесь) и отредактировать/удалить уже добавленный тапом по строке.
export default function ExpensesPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { expenses, totalByCategory, removeExpense } = useExpenses();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expanded, setExpanded] = useState<ExpenseCategory | 'all' | null>(null);

  const sectionItems = (id: ExpenseCategory): LineItem[] =>
    id === 'uni'
      ? uniCosts.items.map((i) => ({ id: i.id, label: i.label_ru, eur: i.eur, note: i.note_ru }))
      : staticItems(id);

  // База раздела = сумма его статей (заголовок = разбивка). Универ на время
  // загрузки сида — прежняя оценка, чтобы не мигало нулём.
  const sectionBase = (id: ExpenseCategory): number =>
    id === 'uni' && uniCosts.loading
      ? sectionsData.uni.budget
      : sectionItems(id).reduce((sum, i) => sum + i.eur, 0);

  // Заголовок раздела = статьи + добавленные вручную. Раньше ручные в заголовок
  // не входили, а в «Итого» входили — расходилось.
  const sectionTotal = (id: ExpenseCategory): number => sectionBase(id) + totalByCategory[id];

  const total = SECTIONS_ORDER.reduce((sum, id) => sum + sectionTotal(id), 0);

  // Печать/сохранение в PDF — системный диалог печати браузера (в нём есть
  // «Сохранить как PDF»), без сторонних библиотек. Перед печатью разворачиваем
  // все разделы, чтобы в PDF попала полная разбивка, а не только открытый раздел.
  function handleExportPdf() {
    setExpanded('all');
    setTimeout(() => window.print(), 50);
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
          <h1 className="font-serif text-navy text-2xl font-bold">Стоимость</h1>
        </div>
        <button
          onClick={handleExportPdf}
          className="flex items-center gap-1.5 font-serif text-gold text-xs border border-gold/50 rounded-full px-3 py-2"
        >
          <FileDown size={14} /> PDF
        </button>
      </div>
      <h1 className="hidden print:block font-serif text-navy text-2xl font-bold px-6 pt-6">Стоимость</h1>

      <div className="mx-6 mt-5 bg-navy rounded-2xl px-5 py-4 print:border print:border-navy">
        <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold">Итого</p>
        <p className="font-serif text-cream text-3xl font-bold mt-1">{fmt(total)}</p>
        <p className="font-serif text-cream/60 text-xs mt-1">
          Оценка по твоим данным (страна, программа, разделы) + расходы, добавленные вручную
        </p>
      </div>

      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden">
        {SECTIONS_ORDER.map((id, idx) => {
          const custom = expenses.filter((e) => e.category === id);
          const perYear = id === 'parma';
          const isOpen = expanded === id || expanded === 'all';
          const items = sectionItems(id);
          return (
            <div key={id} className={idx > 0 ? 'border-t border-navy/15' : ''}>
              <button
                onClick={() => setExpanded(isOpen ? null : id)}
                className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <p className="font-serif text-gold text-xs uppercase tracking-widest font-bold flex items-center gap-1.5">
                  {sectionsData[id].titleFull}{perYear ? ' · в год' : ''}
                  {id === 'uni' && uniCosts.loading && <span className="text-navy/40 normal-case font-normal">— считаю…</span>}
                  <ChevronDown size={12} className={'text-navy/40 transition-transform print:hidden ' + (isOpen ? 'rotate-180' : '')} />
                </p>
                <p className="font-serif text-navy text-sm font-bold flex-shrink-0">{fmt(sectionTotal(id))}</p>
              </button>

              {isOpen && (
                <div className="px-4 pb-2 flex flex-col gap-2">
                  {items.length === 0 && custom.length === 0 ? (
                    <p className="font-serif text-navy/50 text-xs italic pb-1">
                      Нет данных для разбивки.
                    </p>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3">
                          <p className="font-serif text-navy/85 text-sm flex-1">{item.label}</p>
                          <p className="font-serif text-navy/85 text-sm font-bold flex-shrink-0">
                            {item.approx ? '~' : ''}{fmt(item.eur)}
                          </p>
                        </div>
                      ))}

                      {/* Ручные расходы — теми же строками, что seed-разбивка, а не
                          коробкой-плашкой. Отличает только золотая точка-маркер:
                          тап по строке — изменить, крестик — удалить. */}
                      {custom.map((e) => (
                        <div key={e.id} className="flex items-center justify-between gap-3">
                          <button
                            onClick={() => setEditing(e)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" aria-hidden />
                            <span className="font-serif text-navy/85 text-sm">{e.label}</span>
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-serif text-navy/85 text-sm font-bold">{fmt(e.amount_eur)}</span>
                            <span
                              role="button"
                              onClick={() => removeExpense(e.id)}
                              className="text-navy/30 print:hidden"
                              aria-label="Удалить"
                            >
                              <X size={13} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mx-6 mt-3 flex items-center justify-center gap-2 font-serif text-navy border border-navy/20 rounded-full py-2.5 text-sm print:hidden"
      >
        <Plus size={16} /> Добавить расход
      </button>

      {uniCosts.country && (
        <p className="font-serif text-navy/40 text-[11px] italic text-center mt-6 px-6">
          Оценки для {uniCosts.country.toUpperCase()} · меняй валюту в Настройках
        </p>
      )}

      {adding && (
        <AddExpenseSheet defaultCategory="uni" onClose={() => setAdding(false)} />
      )}
      {editing && (
        <AddExpenseSheet
          defaultCategory={editing.category}
          expense={editing}
          onClose={() => setEditing(null)}
        />
      )}

      <TabBar active="path" />
    </div>
  );
}
