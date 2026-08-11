// Левое меню — десктопная замена нижнему TabBar.
//
// Почему отдельный компонент, а не респонсивные классы на TabBar: TabBar
// живёт внутри страницы и рендерится только на 14 экранах из ~60 (на
// вложенных страницах его нет, там кнопка «назад»). На телефоне это верно —
// так устроена навигация в мобильных приложениях. На широком экране левое
// меню обязано быть везде внутри приложения, иначе на любой вложенной
// странице оно пропадёт и экран будет выглядеть сломанным.
//
// Поэтому рейл живёт в PageTransition (общий для всех роутов), а активную
// вкладку выводит из pathname сам. Ручной проп active у TabBar не трогаем —
// он остаётся контрактом мобильной вёрстки.

import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/api';
import baptistery from '../assets/parmaBaptistery.png';
import iconPath from '../assets/iconPath.svg';
import iconLoci from '../assets/iconLoci.svg';

const tabs = [
  { id: 'laura', label: 'LAURA', icon: null, route: '/laura' },
  { id: 'path', label: 'PATH', icon: iconPath, route: '/path' },
  { id: 'loci', label: 'LOCI', icon: iconLoci, route: '/map' },
];

/** Какая вкладка активна для текущего пути. Всё, что не Лаура и не карта, — PATH. */
function activeTab(pathname: string): string {
  if (pathname.startsWith('/laura')) return 'laura';
  if (pathname.startsWith('/map')) return 'loci';
  return 'path';
}

export function DesktopRail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = activeTab(pathname);

  // Порядок как в Настройках: сначала отзыв refresh-токена на сервере, потом
  // чистка памяти. Наоборот нельзя — logout() ходит на /auth/logout, а после
  // clear() ему уже нечем представиться.
  async function handleLogout() {
    if (!confirm('Выйти из аккаунта? Прогресс и заметки на этом устройстве сотрутся.')) return;
    await logout();
    localStorage.clear();
    navigate('/');
  }

  return (
    <nav
      className="hidden md:flex sticky top-0 h-screen w-24 flex-shrink-0 flex-col items-center
                 border-r border-navy/15 bg-cream py-8"
      aria-label="Разделы"
    >
      {/* Знак — Баптистерий с того же рисунка Пармы, что на экране входа.
          Почему одно здание, а не вся тройка: рисунок нарисован тонкой
          линией под ширину ~384px, и на 84px (вся тройка в рейле) штрихи
          сливаются в грязь. Баптистерий узнаётся и на 64px, потому что
          масштаб уменьшения у него в три раза мягче.
          PNG, а не SVG: в исходнике здания лежат встроенным растром,
          векторных путей там нет вообще.
          Фоном, а не <img>: рейл скрыт через display:none до md, а картинку
          в теге браузер тянет всё равно — 42 КБ впустую на каждой загрузке
          с телефона. Фон у нерисуемого элемента не запрашивается вообще. */}
      <button
        onClick={() => navigate('/path')}
        className="mb-7 bg-contain bg-no-repeat bg-center print:hidden"
        style={{ width: 64, height: 87, backgroundImage: `url(${baptistery})` }}
        aria-label="На главную — Парма"
      />

      {/* Подпись и вкладки — по центру всей высоты рейла, а не остатка.
          my-auto здесь не годится: сверху рисунок на 115px, снизу выход на
          ~43px, и группа съезжала бы вниз на разницу. Поэтому вынимаем её из
          потока и центрируем абсолютно. Отсчёт идёт от самого <nav>: у него
          position: sticky, а это уже позиционированный элемент — добавлять
          relative нельзя, оно бы затёрло прилипание. */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex flex-col items-center">

      <p className="font-serif text-gold text-[10px] tracking-[0.22em] mb-5 print:hidden">МЕНЮ</p>

      <div className="flex flex-col items-center gap-9">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.route)}
            className={
              'flex flex-col items-center gap-1.5 ' +
              (active === tab.id ? '' : 'print:hidden')
            }
            aria-current={active === tab.id ? 'page' : undefined}
          >
            {tab.icon ? (
              <img
                src={tab.icon}
                alt=""
                className={'w-7 h-7 ' + (active === tab.id ? 'opacity-100' : 'opacity-40')}
              />
            ) : (
              /* Лаура — фирменная каллиграфическая «L» вместо SVG-паттерна */
              <span
                className={
                  'w-7 h-7 rounded-sm bg-navy flex items-center justify-center ' +
                  (active === tab.id ? 'opacity-100' : 'opacity-40')
                }
              >
                <span
                  className="font-script text-white text-lg leading-none"
                  style={{ transform: 'translate(-14%, 6%)' }}
                >
                  L
                </span>
              </span>
            )}
            <span
              className={
                'font-serif text-[11px] tracking-wide ' +
                (active === tab.id ? 'text-navy' : 'text-navy/40')
              }
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      </div>

      {/* Выход внизу. Спрашиваем подтверждение, хотя в Настройках выход
          молчаливый: там до кнопки надо дойти специально, а здесь она висит
          на каждом экране ровно там, где раньше был аватар — один промах
          мимо соседней иконки, и localStorage.clear() сотрёт все галочки,
          адрес и историю Лауры. На сервер прогресс не уходит, вернуть его
          после случайного выхода нечем. */}
      <button
        onClick={handleLogout}
        className="mt-auto flex flex-col items-center gap-1.5 text-navy/40
                   transition-colors hover:text-navy/70 print:hidden"
        aria-label="Выйти из аккаунта"
      >
        <LogOut className="w-6 h-6" strokeWidth={1.5} />
        <span className="font-serif text-[11px] tracking-wide">ВЫХОД</span>
      </button>
    </nav>
  );
}
