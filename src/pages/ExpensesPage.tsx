import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, X } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { sectionsData, parsePrice } from '../lib/sectionsData';
import { useUniCosts } from '../hooks/useCosts';
import { useExpenses } from '../hooks/useExpenses';
import type { ExpenseCategory } from '../lib/expenses';
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
// «+» здесь).
export default function ExpensesPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { expenses, totalByCategory, removeExpense } = useExpenses();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<ExpenseCategory | null>(null);

  // Универ — динамический бюджет (страна + программа), остальное — статика
  const dynamicUniBudget = uniCosts.loading ? sectionsData.uni.budget : uniCosts.total_eur;
  const baseBudget = (id: ExpenseCategory) => (id === 'uni' ? dynamicUniBudget : sectionsData[id].budget);

  const total = SECTIONS_ORDER.reduce((sum, id) => sum + baseBudget(id) + totalByCategory[id], 0);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Стоимость</h1>
      </div>

      <div className="mx-6 mt-5 bg-navy rounded-2xl px-5 py-4">
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
          const isOpen = expanded === id;
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
                  <ChevronDown size={12} className={'text-navy/40 transition-transform ' + (isOpen ? 'rotate-180' : '')} />
                </p>
                <p className="font-serif text-navy text-sm font-bold flex-shrink-0">{fmt(baseBudget(id))}</p>
              </button>

              {isOpen && (
                <div className="px-4 pb-2 flex flex-col gap-1.5">
                  {items.length === 0 ? (
                    <p className="font-serif text-navy/50 text-xs italic pb-1">
                      Нет данных для разбивки.
                    </p>
                  ) : (
                    items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <p className="font-serif text-navy/70 text-xs flex-1">
                          {'label_ru' in item ? item.label_ru : item.label}
                        </p>
                        <p className="font-serif text-navy/70 text-xs flex-shrink-0">{fmt(item.eur)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {custom.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-2.5 border-t border-navy/10">
                  <div className="flex-1">
                    <p className="font-serif text-navy text-sm">{e.label}</p>
                    <p className="font-serif text-gold text-[11px] italic mt-0.5">добавлено вручную</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="font-serif text-navy text-sm font-bold">{fmt(e.amount_eur)}</p>
                    <button onClick={() => removeExpense(e.id)} className="text-navy/40" aria-label="Удалить">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mx-6 mt-3 flex items-center justify-center gap-2 font-serif text-navy border border-navy/20 rounded-full py-2.5 text-sm"
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

      <TabBar active="path" />
    </div>
  );
}
