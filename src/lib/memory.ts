import { API_BASE, ApiError, getToken, refreshAccessToken, clearToken } from './api';

// Долговременная память Лауры о пользователе — факты, общие на все чаты.
// Тот же паттерн авторизованного fetch с once-retry на 401/403, что и в chats.ts.

export interface MemoryItem {
  id: string;
  content: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function memFetch(path: string, init: RequestInit = {}, _retried = false): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers ?? {}) },
    credentials: 'include',
  });
  if ((res.status === 401 || res.status === 403) && !_retried) {
    const ok = await refreshAccessToken();
    if (ok) return memFetch(path, init, true);
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

export async function listMemory(): Promise<MemoryItem[]> {
  return ok<MemoryItem[]>(await memFetch('/api/v1/laura/memory'));
}

export async function deleteMemory(id: string): Promise<void> {
  await ok<void>(await memFetch(`/api/v1/laura/memory/${id}`, { method: 'DELETE' }));
}

export async function clearMemory(): Promise<void> {
  await ok<void>(await memFetch('/api/v1/laura/memory', { method: 'DELETE' }));
}

// Вызывается после каждого ответа Лауры. Best-effort: ошибки игнорируем, чтобы
// не мешать чату. Возвращает добавленные факты (может быть пусто).
export async function extractMemory(userMessage: string, assistantMessage: string): Promise<MemoryItem[]> {
  try {
    return await ok<MemoryItem[]>(await memFetch('/api/v1/laura/memory/extract', {
      method: 'POST',
      body: JSON.stringify({ user_message: userMessage, assistant_message: assistantMessage }),
    }));
  } catch {
    return [];
  }
}
