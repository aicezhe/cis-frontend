import { useState } from 'react';
import iconUni from '../assets/iconUni.svg';
import iconVisa from '../assets/iconVisa.svg';
import iconTravel from '../assets/iconTravel.svg';
import iconInParma from '../assets/iconInParma.svg';
import { useExpenses } from '../hooks/useExpenses';
import { useCurrency } from '../hooks/useCurrency';
import type { Expense, ExpenseCategory } from '../lib/expenses';
import { ApiError } from '../lib/api';

const CATEGORIES: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'uni', label: 'Университет', icon: iconUni },
  { id: 'visa', label: 'Виза', icon: iconVisa },
  { id: 'travel', label: 'Переезд', icon: iconTravel },
  { id: 'parma', label: 'В Парме', icon: iconInParma },
];

interface Props {
  defaultCategory: ExpenseCategory;
  defaultLabel?: string;
  // Передай существующий расход — форма откроется в режиме редактирования
  // (сохраняет через PATCH, а не создаёт новый).
  expense?: Expense;
  onClose: () => void;
}

// Bottom-sheet «Добавить/изменить расход» — открывается долгим тапом по
// плитке «Оплата»/карточке «Расходы», кнопкой «+» на странице «Стоимость»,
// либо тапом по уже добавленному расходу (редактирование). Выбираешь
// категорию (совпадает с 4 разделами Path), вписываешь сумму в ТЕКУЩЕЙ
// валюте приложения — конвертируется в евро для бэкенда (там всё в EUR).
export function AddExpenseSheet({ defaultCategory, defaultLabel = '', expense, onClose }: Props) {
  const { addExpense, editExpense, removeExpense } = useExpenses();
  const { currency, info } = useCurrency();
  const isEdit = !!expense;
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? defaultCategory);
  const [label, setLabel] = useState(expense?.label ?? defaultLabel);
  // Показываем и принимаем сумму в текущей выбранной валюте приложения —
  // храним в евро только на бэкенде, конвертируем на границе формы.
  const [amount, setAmount] = useState(
    expense ? String(Math.round(expense.amount_eur * info.rate_to_eur)) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const amountLocal = Number(amount.replace(',', '.'));
  const amountEur = Math.round(amountLocal / info.rate_to_eur);
  const canSave = label.trim() !== '' && amount.trim() !== '' && amountEur > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await editExpense(expense.id, { category, label: label.trim(), amount_eur: amountEur });
      } else {
        await addExpense(category, label.trim(), amountEur);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError && (err.status === 401 || err.status === 403)
          ? 'Сессия истекла — обнови страницу и войди заново.'
          : 'Не удалось сохранить — попробуй ещё раз.',
      );
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;
    setSaving(true);
    setError('');
    try {
      await removeExpense(expense.id);
      onClose();
    } catch {
      setError('Не удалось удалить — попробуй ещё раз.');
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
          <h2 className="font-serif text-navy text-xl font-bold mb-4">
            {isEdit ? 'Изменить расход' : 'Добавить расход'}
          </h2>

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

          <label className="block font-serif text-navy/60 text-xs mb-1">
            Сумма, {info.symbol}
            {currency !== 'EUR' && (
              <span className="text-navy/40"> (валюта из Настроек — {info.name_ru.toLowerCase()})</span>
            )}
          </label>
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
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="w-full font-serif text-lg rounded-full py-3 border"
                style={{ color: '#a8332a', borderColor: '#a8332a55' }}
              >
                Удалить
              </button>
            )}
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
