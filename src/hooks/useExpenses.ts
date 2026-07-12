import { useCallback, useEffect, useState } from 'react';
import { createExpense, deleteExpense, listExpenses, updateExpense } from '../lib/expenses';
import type { Expense, ExpenseCategory } from '../lib/expenses';

// Кэш на время сессии — чтоб не дёргать бэк на каждый рендер PathPage/Foundation.
let _cache: Expense[] | null = null;
// Каждый вызов useExpenses() держит СВОЙ useState — без подписчиков соседние
// компоненты (например ExpensesPage, пока открыт AddExpenseSheet поверх неё)
// не узнают об изменении кэша и покажут устаревшую сумму, пока не
// перемонтируются. Транслируем обновления кэша всем активным инстансам.
const listeners = new Set<(expenses: Expense[]) => void>();

function broadcast(next: Expense[]) {
  _cache = next;
  listeners.forEach((l) => l(next));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(_cache || []);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    listeners.add(setExpenses);
    return () => { listeners.delete(setExpenses); };
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    return listExpenses()
      .then((data) => {
        broadcast(data);
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
      broadcast([created, ...(_cache || [])]);
      return created;
    },
    [],
  );

  const editExpense = useCallback(
    async (id: string, patch: Partial<{ category: ExpenseCategory; label: string; amount_eur: number }>) => {
      const updated = await updateExpense(id, patch);
      broadcast((_cache || []).map((e) => (e.id === id ? updated : e)));
      return updated;
    },
    [],
  );

  const removeExpense = useCallback(async (id: string) => {
    await deleteExpense(id);
    broadcast((_cache || []).filter((e) => e.id !== id));
  }, []);

  // Сумма кастомных расходов по категориям — готово для PathPage.
  const totalByCategory = expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount_eur;
      return acc;
    },
    { uni: 0, visa: 0, travel: 0, parma: 0 } as Record<ExpenseCategory, number>,
  );

  return { expenses, loading, totalByCategory, addExpense, editExpense, removeExpense, reload };
}
