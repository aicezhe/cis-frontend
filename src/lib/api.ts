// Единая точка обращения к бэкенду CIS.PR.
// Базовый URL берётся из VITE_API_URL (env). По умолчанию — локальный бэкенд.
import type {
  CourseCatalog,
  CourseFilters,
  CourseFull,
  OnboardingPatch,
  ScholarshipComputation,
  ScholarshipRead,
  TokenResponse,
  User,
} from '../types/api';

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');

const TOKEN_KEY = 'cispr_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthed(): boolean {
  return !!getToken();
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

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
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
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Не удаётся связаться с сервером. Проверь соединение.');
  }

  if (res.status === 401) {
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

  // Регистрация + автологин: возвращает токен и юзера
  async registerAndLogin(
    email: string,
    username: string,
    password: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.register(email, username, password);
    const { access_token } = await this.login(email, password);
    setToken(access_token);
    return { user, token: access_token };
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
