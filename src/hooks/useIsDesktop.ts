import { useEffect, useState } from 'react';

// Порог должен совпадать с брейкпоинтом md в tailwind.config — по нему же
// расходятся все остальные десктопные правки. Разъедутся — вёрстка и логика
// начнут спорить друг с другом на 767-768px.
const DESKTOP_QUERY = '(min-width: 768px)';

/**
 * Широкий ли сейчас экран.
 *
 * Нужен там, где одними CSS-классами не обойтись: например, экран входа на
 * десктопе собран другой разметкой, а не теми же блоками с другими отступами.
 * Рисовать обе версии и прятать одну через md:hidden нельзя — в DOM оказались
 * бы два комплекта полей email/пароля, и менеджер паролей полез бы заполнять
 * невидимый.
 *
 * Первое значение считаем сразу в useState, а не в эффекте: иначе первый кадр
 * рисуется мобильной вёрсткой и на десктопе виден скачок.
 */
export function useIsDesktop(): boolean {
  // Опциональный вызов, а не window.matchMedia(...) в лоб: в jsdom этого API
  // нет, и без «?» хук роняет любой тест, который рендерит страницу с ним.
  // Ту же осторожность соблюдает проверка prefers-reduced-motion на Welcome.
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia?.(DESKTOP_QUERY).matches ?? false,
  );

  useEffect(() => {
    const update = () =>
      setIsDesktop(window.matchMedia?.(DESKTOP_QUERY).matches ?? false);
    const mq = window.matchMedia?.(DESKTOP_QUERY);
    // Слушаем и mq.change, и window.resize. Дублирование намеренное:
    // change — штатный сигнал, но в эмулированных вьюпортах (DevTools,
    // автоматизация) он местами не стреляет, и страница застревала в
    // десктопной ветке после сужения окна. resize стреляет везде; update
    // идемпотентен, лишний вызов ничего не стоит.
    mq?.addEventListener('change', update);
    window.addEventListener('resize', update);
    // между первым рендером и подпиской окно могли успеть перетащить
    update();
    return () => {
      mq?.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return isDesktop;
}
