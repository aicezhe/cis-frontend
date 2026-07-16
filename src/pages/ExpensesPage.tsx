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

interface StaticItem {
  label: string;
  eur: number;
}

// Разворачиваем шаги раздела в отдельные позиции: если у шага есть подшаги —
// берём их (точнее), иначе сам шаг. Нулевые убираем — они не несут стоимости.
function staticItems(id: 'visa' | 'travel' | 'parma'): StaticItem[] {
  const items: StaticItem[] = [];
  sectionsData[id].steps.forEach((step: any) => {
    if (step.substeps.length > 0) {
      step.substeps.forEach((sub: any) => {
        const eur = parsePrice(sub.price);
        if (eur > 0) items.push({ label: sub.title, eur });
      });
    } else {
      const eur = parsePrice(step.price);
      if (eur > 0) items.push({ label: step.title, eur });
    }
  });
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

  // Универ — динамический бюджет (страна + программа), остальное — статика
  const dynamicUniBudget = uniCosts.loading ? sectionsData.uni.budget : uniCosts.total_eur;
  const baseBudget = (id: ExpenseCategory) => (id === 'uni' ? dynamicUniBudget : sectionsData[id].budget);

  const total = SECTIONS_ORDER.reduce((sum, id) => sum + baseBudget(id) + totalByCategory[id], 0);

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
          const items = id === 'uni' ? uniCosts.items : staticItems(id);
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
                <p className="font-serif text-navy text-sm font-bold flex-shrink-0">{fmt(baseBudget(id))}</p>
              </button>

              {isOpen && (
                <div className="px-4 pb-2 flex flex-col gap-2">
                  {items.length === 0 && custom.length === 0 ? (
                    <p className="font-serif text-navy/50 text-xs italic pb-1">
                      Нет данных для разбивки.
                    </p>
                  ) : (
                    <>
                      {items.map((item, i) => (
                        <div key={i} className="flex items-start justify-between gap-3">
                          <p className="font-serif text-navy/85 text-sm flex-1">
                            {'label_ru' in item ? item.label_ru : item.label}
                          </p>
                          <p className="font-serif text-navy/85 text-sm font-bold flex-shrink-0">{fmt(item.eur)}</p>
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
