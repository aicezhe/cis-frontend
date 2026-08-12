// Единая точка обращения к бэкенду CIS.PR.
// Базовый URL берётся из VITE_API_URL (env). По умолчанию — локальный бэкенд.
import type {
  CourseCatalog,
  CourseFilters,
  CourseFull,
  CountryChange,
  OnboardingPatch,
  ScholarshipComputation,
  ScholarshipRead,
  TokenResponse,
  User,
} from '../types/api';

export const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

// Access-токен теперь ТОЛЬКО в памяти (не в localStorage — защита от XSS).
// При перезагрузке страницы обнуляется → AuthProvider на старте молча дёргает
// /auth/refresh и восстанавливает токен по httpOnly refresh-cookie.
let accessToken: string | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string): void {
  accessToken = token;
}

export function clearToken(): void {
  accessToken = null;
}

export function isAuthed(): boolean {
  return !!accessToken;
}

/**
 * Silent-refresh: обменять refresh-cookie на новый access-токен.
 * Возвращает true, если сессия жива. Зовётся на старте приложения и при 401.
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // без этого refresh-cookie не поедет
    });
    if (!res.ok) {
      clearToken();
      return false;
    }
    const data = (await res.json()) as TokenResponse;
    setToken(data.access_token);
    return true;
  } catch {
    clearToken();
    return false;
  }
}

/** Логаут: инвалидировать сессию на сервере + очистить токен из памяти. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // даже если сеть упала — локально всё равно разлогиниваемся
  }
  clearToken();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // прикрепить Bearer-токен
}

async function request<T>(path: string, opts: RequestOptions = {}, _retried = false): Promise<T> {
  const { method = 'GET', body, auth = false } = opts;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include', // чтобы httpOnly refresh-cookie ездила на бэк
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Не удаётся связаться с сервером. Проверь соединение.');
  }

  if ((res.status === 401 || res.status === 403) && auth) {
    // Только для запросов, которые ТРЕБУЮТ существующую сессию (auth: true).
    // 401 — токен протух. 403 — токена вообще нет в памяти (например, сразу
    // после перезагрузки страницы, пока AuthProvider ещё не восстановил его
    // через silent-refresh): так отвечает HTTPBearer FastAPI, когда заголовка
    // Authorization нет вовсе. В обоих случаях пробуем разово обновить токен
    // через refresh-cookie и повторить запрос.
    // Для auth:false запросов (/auth/login, /auth/register и т.п.) 401 значит
    // что-то другое (неверный пароль и т.п.) — НЕ перезаписываем его текстом
    // про истёкшую сессию, пусть ниже отработает обычная детализация ошибки.
    if (!_retried) {
      const ok = await refreshAccessToken();
      if (ok) return request<T>(path, opts, true);
    }
    clearToken();
    throw new ApiError(401, 'Сессия истекла, войди заново.');
  }

  if (!res.ok) {
    let detail = `Ошибка ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) {
        detail = typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail);
      }
    } catch {
      // тело не JSON — оставляем дефолтный текст
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function buildQuery(filters: CourseFilters): string {
  const params = new URLSearchParams();
  if (filters.level) params.set('level', filters.level);
  if (filters.dept_id != null) params.set('dept_id', String(filters.dept_id));
  if (filters.lang) params.set('lang', filters.lang);
  if (filters.is_stem != null) params.set('is_stem', String(filters.is_stem));
  const q = params.toString();
  return q ? `?${q}` : '';
}

export const api = {
  baseUrl: API_BASE,

  // --- Auth (/api/v1/auth) ---
  async register(email: string, username: string, password: string): Promise<User> {
    return request<User>('/api/v1/auth/register', {
      method: 'POST',
      body: { email, username, password },
    });
  },

  // Проверка занятости email/username для пошаговой валидации регистрации
  async checkAvailability(params: { email?: string; username?: string }): Promise<{
    email_taken?: boolean;
    username_taken?: boolean;
  }> {
    const q = new URLSearchParams();
    if (params.email) q.set('email', params.email);
    if (params.username) q.set('username', params.username);
    return request(`/api/v1/auth/availability?${q.toString()}`);
  },

  async login(email: string, password: string): Promise<TokenResponse> {
    return request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async me(): Promise<User> {
    return request<User>('/api/v1/auth/me', { auth: true });
  },

  async updateProfile(patch: OnboardingPatch): Promise<User> {
    return request<User>('/api/v1/auth/me', {
      method: 'PATCH',
      body: patch,
      auth: true,
    });
  },

  /** История смены страны, новые сверху. Пустой массив — страну ни разу не меняли. */
  async countryHistory(): Promise<CountryChange[]> {
    return request<CountryChange[]>('/api/v1/auth/me/country-history', { auth: true });
  },

  // Код подтверждения регистрации — обязателен, без него аккаунт не активен
  async verifyRegistrationCode(email: string, code: string): Promise<TokenResponse> {
    return request<TokenResponse>('/api/v1/auth/verify-registration', {
      method: 'POST',
      body: { email, code },
    });
  },

  async resendVerificationCode(email: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/api/v1/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  },

  // --- Courses (/api) ---
  async listCourses(filters: CourseFilters = {}): Promise<CourseCatalog[]> {
    return request<CourseCatalog[]>(`/api/courses${buildQuery(filters)}`);
  },

  async getCourse(id: string): Promise<CourseFull> {
    return request<CourseFull>(`/api/courses/${encodeURIComponent(id)}`);
  },

  async myCourse(): Promise<CourseFull | null> {
    return request<CourseFull | null>('/api/users/me/course', { auth: true });
  },

  // --- Scholarship (/api) ---
  async scholarship(): Promise<ScholarshipRead> {
    return request<ScholarshipRead>('/api/scholarship');
  },

  async myScholarship(): Promise<ScholarshipComputation> {
    return request<ScholarshipComputation>('/api/users/me/scholarship', { auth: true });
  },
};
