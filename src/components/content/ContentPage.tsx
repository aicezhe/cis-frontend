import type { ReactNode } from 'react';

// Обёртка контентной страницы: фон, макс. ширина 640, паддинги 20px, шрифт
// тела Golos Text. Используется всеми вложенными article/detail-страницами.
export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-content-bg font-golos">
      <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
        <div className="px-5 pb-24">{children}</div>
      </div>
    </div>
  );
}
