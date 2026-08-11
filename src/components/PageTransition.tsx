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

import { useLayoutEffect, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { DesktopRail } from './DesktopRail';

// Маршруты со своей режиссурой входа: небо на Welcome, SkyIntro на логине,
// page-rise/page-descend на регистрации. Общий переход их бы задвоил.
const OWN_INTRO = new Set(['/', '/login', '/register']);

// Роуты до входа в приложение: вход, восстановление пароля, онбординг и квизы.
// Левое меню на них не показываем — вкладок ещё нет, а пустой рейл сбоку
// превратил бы форму входа в кусок интерфейса, в который некуда нажать.
// Вход и линейный первый запуск. /change-stage и /change-course в списке НЕТ:
// на них ходят и из онбординга, и из настроек, а во втором случае человек уже
// внутри приложения — исчезнувшее меню читалось бы как поломка.
// /choice-program здесь при том, что тоже открывается изнутри: это
// полноэкранный герой на ночном небе, и cream-полоса меню рядом с navy-фоном
// выглядела как обрезок чужого экрана.
const NO_RAIL = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-code',
  '/onboarding',
  '/choice-program',
  '/quiz-visa',
  '/quiz-travel',
]);

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navType = useNavigationType();

  // SPA сохраняет прокрутку документа между роутами: без сброса новая страница
  // проявляется уже промотанной вниз. На POP не трогаем — там пользователь
  // возвращается назад и ожидает застать экран примерно там же, где оставил.
  //
  // Именно useLayoutEffect, а не useEffect: обычный эффект выполняется ПОСЛЕ
  // отрисовки, поэтому браузер успевал показать один кадр новой страницы на
  // старой прокрутке и только потом дёрнуть её вверх. Этот кадр и читался как
  // рывок в начале перехода.
  useLayoutEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [location.pathname, navType]);

  // key по пути — иначе анимация не перезапустится на новом экране
  const page = OWN_INTRO.has(location.pathname) ? (
    children
  ) : (
    <div key={location.pathname} className="page-fade">
      {children}
    </div>
  );

  if (NO_RAIL.has(location.pathname)) return <>{page}</>;

  // Рейл — обычный flex-сосед, а не fixed-панель: тогда колонка контента
  // центрируется своим mx-auto по остатку ширины, без магических отступов
  // под ширину меню. На телефоне обёртка ничего не делает (md:flex).
  return (
    <div className="md:flex md:items-start">
      <DesktopRail />
      <div className="md:flex-1 md:min-w-0">{page}</div>
    </div>
  );
}
