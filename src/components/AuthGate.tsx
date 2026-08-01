import { useEffect, useState } from 'react';
import { refreshAccessToken } from '../lib/api';
import { LoadingScreen, useMinCycle } from './Loader';

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
  // Заставка на старте держится хотя бы один круг анимации: refresh с живой
  // cookie отвечает за десятки миллисекунд, и кольца иначе моргали бы.
  const showLoader = useMinCycle(!ready);

  useEffect(() => {
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (showLoader) return <LoadingScreen />;

  return <>{children}</>;
}
