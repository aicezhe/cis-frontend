const DEFAULT_MS = 500;
// Если палец/мышь ушли дальше этого — это скролл/драг, а не долгий тап.
const MOVE_TOLERANCE_PX = 10;

interface Options {
  ms?: number;
}

/**
 * Долгий тап (touch + mouse). Отменяется при заметном движении, чтобы не
 * конфликтовать со скроллом страницы. Спреди возвращаемые хендлеры на
 * элемент: {...longPressHandlers(() => ...)}.
 *
 * Намеренно НЕ хук (без useRef/useCallback, без префикса use*) — так его
 * можно звать внутри .map() на список карточек, не нарушая Rules of Hooks.
 * React пересоздаёт JSX-хендлеры на каждый рендер в любом случае, так что
 * состояние жмякания можно спокойно хранить в обычных переменных замыкания.
 */
export function longPressHandlers(onLongPress: () => void, { ms = DEFAULT_MS }: Options = {}) {
  let timer: number | null = null;
  let start: { x: number; y: number } | null = null;
  let fired = false;

  function clear() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    start = null;
  }

  function begin(x: number, y: number) {
    clear();
    fired = false;
    start = { x, y };
    timer = window.setTimeout(() => {
      fired = true;
      onLongPress();
    }, ms);
  }

  function move(x: number, y: number) {
    if (!start) return;
    const dx = x - start.x;
    const dy = y - start.y;
    if (Math.sqrt(dx * dx + dy * dy) > MOVE_TOLERANCE_PX) clear();
  }

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) begin(t.clientX, t.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    },
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseDown: (e: React.MouseEvent) => begin(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: clear,
    onMouseLeave: clear,
    // На части мобильных браузеров долгий тап иначе открывает системное меню
    // выделения/копирования — гасим его.
    onContextMenu: (e: React.MouseEvent) => {
      if (fired) e.preventDefault();
    },
  };
}
