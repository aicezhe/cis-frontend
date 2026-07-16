import type { ReactNode } from 'react';

// H2 раздела внутри страницы (заменяет крупные золотые serif-подзаголовки).
export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-content-navy text-xl font-bold leading-tight" style={{ marginTop: 36 }}>
      {children}
    </h2>
  );
}

// Обычный абзац тела. <b> внутри — 600, navy (навигационный якорь для глаза).
export function BodyText({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-content-ink mt-4 [&_b]:font-semibold [&_b]:text-content-navy"
      style={{ fontSize: 17, lineHeight: 1.6 }}
    >
      {children}
    </p>
  );
}
