import { useKzSimBanking } from '../hooks/useKzSimBanking';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';

// Инициалы провайдера для аватарки-плитки (как в российской «Карты и оплата»).
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function KzCardsPage() {
  const { data, loading } = useKzSimBanking();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!data) return null;

  const c = data.cards;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд · Казахстан" title={c.title_ru} subtitle={c.subtitle_ru} backTo="/path/travel" />

      <TldrCard>{c.intro_ru}</TldrCard>

      <H2>Какие карты работают</H2>
      <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{c.works_intro_ru}</p>
      <div className="flex flex-col gap-3 mt-4">
        {c.options_ru.map((opt, i) => (
          <div key={i} className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-content-navy flex items-center justify-center flex-shrink-0">
              <span className="text-content-gold text-sm font-bold">{initials(opt.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-content-navy text-lg font-semibold leading-tight">{opt.name}</p>
              <p className="text-content-ink-2 text-[14px] leading-relaxed mt-0.5">{opt.note_ru}</p>
            </div>
          </div>
        ))}
      </div>

      <H2>Нюансы</H2>
      <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{c.nuances_intro_ru}</p>
      <div className="flex flex-col gap-3 mt-4">
        {c.nuances_ru.map((n, i) => (
          <div key={i} className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 flex gap-3.5">
            <span className="flex-shrink-0 w-[30px] h-[30px] rounded-full bg-content-gold-bg text-content-gold font-bold text-sm flex items-center justify-center">{i + 1}</span>
            <p className="text-content-ink text-[14.5px] leading-relaxed flex-1">{n}</p>
          </div>
        ))}
      </div>

      <Note><b>Итог:</b> {c.bottom_line_ru}</Note>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">{data.meta.data_policy}</p>
    </ContentPage>
  );
}
