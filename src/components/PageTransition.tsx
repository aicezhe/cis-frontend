// Общий плавный переход между страницами.
//
// Библиотеку анимаций не тянем — весь эффект в CSS (см. index.css, page-fade):
// одно свойство на GPU и ноль килобайт в бандле.
//
// Почему только проявление, без сдвига «вперёд справа / назад слева»: обёртка
// лежит выше страниц, а любой transform на предке делает его containing block
// для position: fixed внутри. TabBar и нижние панели действий на время анимации
// отвязываются от экрана и уезжают к концу длинной страницы. Настоящий слайд
// возможен через View Transitions API — он анимирует снимки экрана мимо
// вёрстки, но требует перевести все вызовы navigate() на роутерный
// viewTransition.

import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Маршруты со своей режиссурой входа: небо на Welcome, SkyIntro на логине,
// page-rise/page-descend на регистрации. Общий переход их бы задвоил.
const OWN_INTRO = new Set(['/', '/login', '/register']);

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navType = useNavigationType();

  // SPA сохраняет прокрутку документа между роутами: без сброса новая страница
  // проявляется уже промотанной вниз. На POP не трогаем — там пользователь
  // возвращается назад и ожидает застать экран примерно там же, где оставил.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  if (OWN_INTRO.has(location.pathname)) return <>{children}</>;

  // key по пути — иначе анимация не перезапустится на новом экране
  return (
    <div key={location.pathname} className="page-fade">
      {children}
    </div>
  );
}
