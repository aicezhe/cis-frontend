import '@testing-library/jest-dom';

// jsdom не реализует matchMedia, а на нём держатся проверки ширины экрана
// (useIsDesktop) и prefers-reduced-motion. Без заглушки такие компоненты
// падают в тестах, хотя в браузере работают. Отдаём «не совпало» — то есть
// тесты видят мобильную вёрстку, как и было до появления десктопных веток.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
