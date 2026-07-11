import { useEffect, useState } from 'react';
import { refreshAccessToken } from '../lib/api';

/**
 * Silent-refresh при старте приложения.
 *
 * Access-токен живёт только в памяти → после перезагрузки страницы он пуст.
 * Здесь на старте мы молча дёргаем /auth/refresh: если у пользователя жива
 * httpOnly refresh-cookie, бэкенд вернёт новый access-токен, и сессия
 * восстановится сама. Пока проверка идёт — показываем загрузку, чтобы страницы
 * не отрендерились как «не залогинен» на долю секунды.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  return <>{children}</>;
}
