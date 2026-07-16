import { useNavigate } from 'react-router-dom';

// Шапка контентной страницы: круглая кнопка «назад» (surface+line),
// золотой uppercase-крамб раздела, H1 (Playfair 600), серый подзаголовок.
export function PageHeader({
  crumb, title, subtitle, backTo,
}: {
  crumb?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
}) {
  const navigate = useNavigate();
  return (
    <header className="pt-12">
      <button
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        aria-label="Назад"
        className="w-10 h-10 rounded-full bg-content-surface border border-content-line flex items-center justify-center text-content-navy text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
      >
        ←
      </button>

      {crumb && (
        <p className="text-content-gold text-[13px] font-semibold uppercase tracking-widest mt-5">{crumb}</p>
      )}
      <h1
        className="font-serif font-semibold text-content-navy mt-1.5"
        style={{ fontSize: 'clamp(30px, 8vw, 36px)', lineHeight: 1.15 }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-content-ink-2 text-base mt-2 leading-snug">{subtitle}</p>
      )}
    </header>
  );
}
