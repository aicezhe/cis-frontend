import { useCallback, useEffect, useState } from 'react';
import { createExpense, deleteExpense, listExpenses } from '../lib/expenses';
import type { Expense, ExpenseCategory } from '../lib/expenses';

// Кэш на время сессии — чтоб не дёргать бэк на каждый рендер PathPage/Foundation.
let _cache: Expense[] | null = null;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  const reload = useCallback(() => {
    setLoading(true);
    return listExpenses()
      .then((data) => {
        _cache = data;
        setExpenses(data);
        setLoading(false);
        return data;
      })
      .catch(() => {
        setLoading(false);
        return [] as Expense[];
      });
  }, []);

  useEffect(() => {
    if (_cache) return;
    reload();
  }, [reload]);

  const addExpense = useCallback(
    async (category: ExpenseCategory, label: string, amountEur: number) => {
      const created = await createExpense(category, label, amountEur);
      _cache = [created, ...(_cache || [])];
      setExpenses(_cache);
      return created;
    },
    [],
  );

  const removeExpense = useCallback(async (id: string) => {
    await deleteExpense(id);
    _cache = (_cache || []).filter((e) => e.id !== id);
    setExpenses(_cache);
  }, []);

  // Сумма кастомных расходов по категориям — готово для PathPage.
  const totalByCategory = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount_eur;
      return acc;
    },
    { uni: 0, visa: 0, travel: 0, parma: 0 } as Record<ExpenseCategory, number>,
  );

  return { expenses, loading, totalByCategory, addExpense, removeExpense, reload };
}
