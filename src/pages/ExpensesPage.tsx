import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import TabBar from '../components/TabBar';
import { AddExpenseSheet } from '../components/AddExpenseSheet';
import { useUniCosts } from '../hooks/useCosts';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../hooks/useCurrency';
import { formatPrice } from '../utils/formatPrice';

// Общая страница «Стоимость» для всего раздела «Университет» (и Foundation, и
// бакалавриат/магистратура ведут сюда с плитки «Оплата»). Базовые строки —
// из useUniCosts() (страна + программа юзера, уже посчитано реальными
// данными), сверху — расходы, добавленные вручную (долгий тап по плитке
// «Оплата» или кнопка «+» здесь).
export default function ExpensesPage() {
  const navigate = useNavigate();
  const uniCosts = useUniCosts();
  const { expenses, totalByCategory, removeExpense } = useExpenses();
  const { currency } = useCurrency();
  const fmt = (eur: number) => formatPrice(eur, currency);
  const [adding, setAdding] = useState(false);

  const customUni = expenses.filter((e) => e.category === 'uni');
  const total = uniCosts.total_eur + totalByCategory.uni;
  const rowCount = uniCosts.items.length + customUni.length;

  const program = localStorage.getItem('cispr_program');
  const financeTo = program === 'foundation' ? '/path/foundation/finance' : '/path/uni/program/finance';

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
          Оценка по твоим данным (страна, программа) + расходы, добавленные вручную
        </p>
      </div>

      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl overflow-hidden">
        {uniCosts.loading ? (
          <p className="font-serif text-navy/60 italic text-center py-6">Загрузка…</p>
        ) : rowCount === 0 ? (
          <p className="font-serif text-navy/60 text-sm text-center py-6 px-4">
            Пока пусто. Заполни профиль (страна, программа), чтобы увидеть расчёт.
          </p>
        ) : (
          <>
            {uniCosts.items.map((item, i) => (
              <div
                key={`base-${i}`}
                className={'flex items-start justify-between gap-3 px-4 py-3 ' + (i > 0 ? 'border-t border-navy/10' : '')}
              >
                <div className="flex-1">
                  <p className="font-serif text-navy text-sm">{item.label_ru}</p>
                  {item.optional && (
                    <p className="font-serif text-navy/50 text-[11px] italic mt-0.5">необязательно</p>
                  )}
                  {item.note_ru && (
                    <p className="font-serif text-navy/50 text-[11px] mt-0.5">{item.note_ru}</p>
                  )}
                </div>
                <p className="font-serif text-navy text-sm font-bold flex-shrink-0">{fmt(item.eur)}</p>
              </div>
            ))}
            {customUni.map((e, i) => (
              <div
                key={e.id}
                className={
                  'flex items-start justify-between gap-3 px-4 py-3 ' +
                  (uniCosts.items.length + i > 0 ? 'border-t border-navy/10' : '')
                }
              >
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
          </>
        )}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mx-6 mt-3 flex items-center justify-center gap-2 font-serif text-navy border border-navy/20 rounded-full py-2.5 text-sm"
      >
        <Plus size={16} /> Добавить расход
      </button>

      <button
        onClick={() => navigate(financeTo)}
        className="font-serif text-gold text-sm text-center mt-6 px-6"
      >
        Подробнее об оплате и стипендиях →
      </button>

      {adding && (
        <AddExpenseSheet defaultCategory="uni" onClose={() => setAdding(false)} />
      )}

      <TabBar active="path" />
    </div>
  );
}
