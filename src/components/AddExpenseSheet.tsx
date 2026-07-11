import { useState } from 'react';
import iconUni from '../assets/iconUni.svg';
import iconVisa from '../assets/iconVisa.svg';
import iconTravel from '../assets/iconTravel.svg';
import iconInParma from '../assets/iconInParma.svg';
import { useExpenses } from '../hooks/useExpenses';
import type { ExpenseCategory } from '../lib/expenses';

const CATEGORIES: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'uni', label: 'Университет', icon: iconUni },
  { id: 'visa', label: 'Виза', icon: iconVisa },
  { id: 'travel', label: 'Переезд', icon: iconTravel },
  { id: 'parma', label: 'В Парме', icon: iconInParma },
];

interface Props {
  defaultCategory: ExpenseCategory;
  defaultLabel?: string;
  onClose: () => void;
}

// Bottom-sheet «Добавить расход» — открывается долгим тапом по карточке шага.
// Выбираешь категорию (совпадает с 4 разделами Path), вписываешь сумму и на
// что она — сохраняется на бэкенде и сразу учитывается в общих расходах.
export function AddExpenseSheet({ defaultCategory, defaultLabel = '', onClose }: Props) {
  const { addExpense } = useExpenses();
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory);
  const [label, setLabel] = useState(defaultLabel);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const amountNum = Math.round(Number(amount.replace(',', '.')));
  const canSave = label.trim() !== '' && amount.trim() !== '' && amountNum > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await addExpense(category, label.trim(), amountNum);
      onClose();
    } catch {
      setError('Не удалось сохранить — попробуй ещё раз.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md bg-cream rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        <div className="px-6 pb-6 pt-2">
          <h2 className="font-serif text-navy text-xl font-bold mb-4">Добавить расход</h2>

          <div className="flex gap-2 mb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={
                  'flex-1 flex flex-col items-center gap-1 rounded-2xl border py-2.5 ' +
                  (category === c.id ? 'bg-navy border-navy' : 'bg-soft-cream border-navy/15')
                }
              >
                <img
                  src={c.icon}
                  alt=""
                  className="w-5 h-5"
                  style={{ opacity: category === c.id ? 1 : 0.55 }}
                />
                <span
                  className={
                    'font-serif text-[10px] leading-tight text-center ' +
                    (category === c.id ? 'text-cream' : 'text-navy/70')
                  }
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          <label className="block font-serif text-navy/60 text-xs mb-1">На что</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Например, апостиль диплома"
            className="w-full font-serif text-navy border border-navy/20 rounded-xl px-4 py-3 mb-4 outline-none focus:border-gold"
          />

          <label className="block font-serif text-navy/60 text-xs mb-1">Сумма, €</label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full font-serif text-navy border border-navy/20 rounded-xl px-4 py-3 outline-none focus:border-gold"
          />

          {error && (
            <p className="font-serif text-sm italic mt-3 text-center" style={{ color: '#a8332a' }}>
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={
                'w-full font-serif text-lg rounded-full py-3 ' +
                (canSave ? 'bg-navy text-cream' : 'bg-navy/30 text-cream/70')
              }
            >
              {saving ? '…' : 'Сохранить'}
            </button>
            <button
              onClick={onClose}
              className="w-full font-serif text-navy border border-navy/30 rounded-full py-3 text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
