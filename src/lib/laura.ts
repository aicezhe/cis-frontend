// Хелперы для Лауры: localStorage история, профиль из онбординга, SSE-стриминг.
import { API_BASE, getToken, ApiError } from './api';
import type { LauraProfile, Message } from '../types/laura';

const STORAGE_KEY = 'cispr_laura_history';

export const INITIAL_GREETING: Message = {
  id: 1,
  from: 'laura',
  text:
    'Ciao! Я Laura — твой гид по поступлению в UniPR и жизни в Парме. ' +
    'Спрашивай про визу, документы, ISEE, программы, переезд, всё что нужно. ' +
    'Маленькая просьба: мои ответы и данные в приложении стоит сверять с официальными сайтами перед важными шагами — правила меняются.',
  ts: Date.now(),
};

// ── localStorage ──────────────────────────────────────────────────────────────

export function loadHistory(): Message[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [INITIAL_GREETING];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // битый JSON — игнорируем, отдаём дефолт
  }
  return [INITIAL_GREETING];
}

export function saveHistory(messages: Message[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── профиль из онбординга ─────────────────────────────────────────────────────

export function getLauraProfile(): LauraProfile {
  const ageRaw = localStorage.getItem('cispr_age');
  const age = ageRaw ? parseInt(ageRaw, 10) : undefined;
  return {
    nickname: localStorage.getItem('cispr_nickname') || undefined,
    age: Number.isFinite(age) ? age : undefined,
    country: localStorage.getItem('cispr_country') || undefined,
    city: localStorage.getItem('cispr_city') || undefined,
    program: localStorage.getItem('cispr_program') || undefined,
    course_name: localStorage.getItem('cispr_course_name') || undefined,
    passed_quiz: localStorage.getItem('cispr_passed_quiz') || undefined,
    home_address: localStorage.getItem('cispr_home_address') || undefined,
  };
}

// ── SSE-стриминг ──────────────────────────────────────────────────────────────

// Тело запроса к бэку — массив сообщений в формате Anthropic + опциональный профиль.
type BackendMessage = { role: 'user' | 'assistant'; content: string };

export interface LauraAttachment {
  filename: string;
  media_type: string;
  data_b64: string;
}

function toBackendMessages(messages: Message[]): BackendMessage[] {
  return messages.map((m) => ({
    role: m.from === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));
}

/** Прочитать File → base64 (без "data:...;base64," префикса) + определить media_type. */
export async function fileToAttachment(file: File): Promise<LauraAttachment> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
  const b64 = dataUrl.split(',')[1] ?? '';
  return { filename: file.name, media_type: file.type, data_b64: b64 };
}

/**
 * Стримит ответ Лауры. Возвращает async-итератор по текстовым чанкам.
 * Использовать через `for await (const chunk of streamLaura(...)) { ... }`.
 *
 * `attachment` (если есть) прикрепляется только к последнему (текущему) сообщению —
 * разово, без сохранения на сервере.
 *
 * Throws ApiError при HTTP-ошибках (401 → надо логиниться, 429 → лимит, 503 → выключена).
 */
export async function* streamLaura(
  messages: Message[],
  profile?: LauraProfile,
  attachment?: LauraAttachment | null,
): AsyncGenerator<string, void, void> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/laura/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: toBackendMessages(messages),
        profile: profile ?? null,
        attachment: attachment ?? null,
      }),
    });
  } catch {
    throw new ApiError(0, 'Не удаётся связаться с сервером. Проверь интернет.');
  }

  if (!res.ok) {
    // По SSE-эндпоинту FastAPI кидает JSON-ошибку обычным application/json
    let detail = `Ошибка ${res.status}`;
    try {
      const data = await res.json();
      if (typeof data?.detail === 'string') detail = data.detail;
    } catch {
      // если не JSON — оставим стандартное сообщение
    }
    throw new ApiError(res.status, detail);
  }

  if (!res.body) {
    throw new ApiError(0, 'Сервер не отдаёт поток данных.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // SSE-кадры разделены двойным переводом строки. Берём готовые, незавершённый
    // оставляем в буфере до следующей итерации.
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      // В кадре могут быть несколько `data: ...` строк — у нас по одной всегда,
      // но обрабатываем устойчиво.
      for (const line of frame.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') return;
        try {
          const obj = JSON.parse(payload);
          if (typeof obj.error === 'string') {
            throw new ApiError(500, obj.error);
          }
          if (typeof obj.text === 'string' && obj.text.length > 0) {
            yield obj.text;
          }
        } catch (e) {
          if (e instanceof ApiError) throw e;
          // битый JSON в кадре — пропускаем
        }
      }
    }
  }
}
