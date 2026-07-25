import { useEffect } from 'react';
import { API_BASE } from '../lib/api';

// Анонимный счётчик посещений разделов (для админ-статистики). Шлём раздел +
// страну из профиля, БЕЗ user_id — персональные данные не копим. Раз в сессию
// на раздел, чтобы навигация туда-сюда не накручивала счётчик.
export function trackSection(section: string): void {
  try {
    const key = `cispr_tracked_${section}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const country = localStorage.getItem('cispr_country') || undefined;
    void fetch(`${API_BASE}/api/v1/stats/section-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, country }),
      keepalive: true,
    }).catch(() => { /* статистика не критична */ });
  } catch { /* sessionStorage может быть недоступен (приватный режим) */ }
}

export function useTrackSection(section: string): void {
  useEffect(() => {
    trackSection(section);
  }, [section]);
}
