import { API_BASE, ApiError, getToken } from './api';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
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

export async function listChats(): Promise<Chat[]> {
  return ok<Chat[]>(await fetch(`${API_BASE}/api/v1/chats`, { headers: authHeaders() }));
}

export async function createChat(title = 'Новый чат'): Promise<Chat> {
  return ok<Chat>(await fetch(`${API_BASE}/api/v1/chats`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  }));
}

export async function renameChat(chatId: string, title: string): Promise<Chat> {
  return ok<Chat>(await fetch(`${API_BASE}/api/v1/chats/${chatId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ title }),
  }));
}

export async function deleteChat(chatId: string): Promise<void> {
  await ok<void>(await fetch(`${API_BASE}/api/v1/chats/${chatId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }));
}

export async function getChatMessages(chatId: string): Promise<ChatApiMessage[]> {
  return ok<ChatApiMessage[]>(await fetch(`${API_BASE}/api/v1/chats/${chatId}/messages`, {
    headers: authHeaders(),
  }));
}

export async function appendMessages(
  chatId: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<void> {
  await ok<unknown>(await fetch(`${API_BASE}/api/v1/chats/${chatId}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  }));
}
