import { API_BASE, ApiError, clearToken, getToken, refreshAccessToken } from './api';

export type ExpenseCategory = 'uni' | 'visa' | 'travel' | 'parma';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  label: string;
  amount_eur: number;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Как request() в api.ts: Bearer-токен + credentials:'include' для httpOnly
// refresh-cookie, и та же логика once-retry через тихий /auth/refresh — при
// 401 (токен протух) И при 403 (токена вообще нет в памяти — так отвечает
// HTTPBearer FastAPI, когда Authorization-заголовка нет вовсе, например
// сразу после перезагрузки страницы, пока AuthProvider ещё не восстановил
// токен). Без обработки 403 запрос падал сразу, до всякого ретрая.
async function expenseFetch(path: string, init: RequestInit = {}, _retried = false): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
    credentials: 'include',
  });
  if ((res.status === 401 || res.status === 403) && !_retried) {
    const ok = await refreshAccessToken();
    if (ok) return expenseFetch(path, init, true);
    clearToken();
  }
  return res;
}

async function ok<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Ошибка ${res.status}`;
    try {
      const d = await res.json();
      if (typeof d?.detail === 'string') detail = d.detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listExpenses(): Promise<Expense[]> {
  return ok<Expense[]>(await expenseFetch('/api/v1/expenses'));
}

export async function createExpense(
  category: ExpenseCategory,
  label: string,
  amountEur: number,
): Promise<Expense> {
  return ok<Expense>(await expenseFetch('/api/v1/expenses', {
    method: 'POST',
    body: JSON.stringify({ category, label, amount_eur: amountEur }),
  }));
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await ok<void>(await expenseFetch(`/api/v1/expenses/${expenseId}`, { method: 'DELETE' }));
}
