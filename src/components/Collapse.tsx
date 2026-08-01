// Плавное раскрытие свёрнутых блоков — «Шаги поступления», «Шаги визы»,
// «Шаги переезда» и прочие списки под треугольником.
//
// Высоту анимируем через grid-template-rows 0fr → 1fr, а не max-height:
// max-height требует угадать конечную высоту, и на длинных списках либо
// обрезает хвост, либо оставляет паузу в конце анимации, когда высота уже
// доросла до контента, а переход ещё идёт. Сетка доводит ровно до auto.
//
// Содержимое монтируется лениво — до первого раскрытия его в дереве нет,
// чтобы не платить рендером длинного списка на каждой загрузке страницы, —
// и размонтируется после закрытия.

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Должно совпадать с .collapse-grid в index.css: по этому сроку снимаем
// содержимое с монтирования после закрытия.
const DURATION_MS = 340;

export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Кадров между вставкой узла и сменой на 1fr нужно ДВА. Колбэк одного
      // requestAnimationFrame выполняется ещё до отрисовки текущего кадра,
      // поэтому браузер успевает увидеть только конечное состояние и переход
      // не запускается — блок раскрывается рывком. Второй кадр гарантирует,
      // что 0fr был отрисован.
      raf.current = requestAnimationFrame(() => {
        raf.current = requestAnimationFrame(() => setExpanded(true));
      });
      return () => {
        if (raf.current !== null) cancelAnimationFrame(raf.current);
      };
    }
    setExpanded(false);
    const t = setTimeout(() => setMounted(false), DURATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className="collapse-grid grid"
      style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
    >
      {/* overflow-hidden обязателен: он и обрезает содержимое на нулевой
          строке, и не даёт внутренним отступам протечь наружу */}
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
