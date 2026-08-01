import { useHousingSearch } from '../hooks/useHousingSearch';
import { ContentPage, PageHeader, TldrCard, InfoCard } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function HousingSearchPage() {
  // Поиск жилья одинаков для всех стран — грузим из единого источника, а не из
  // relocation-сида конкретной страны (у ua/kz его нет).
  const { housing, loading } = useHousingSearch();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!housing) return null;

  const hs = housing;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={hs.title_ru} backTo="/path/travel" />

      <TldrCard>Где искать жильё в Парме — варианты с ценами и ссылками ниже.</TldrCard>

      <div className="flex flex-col gap-3 mt-5">
        {hs.options.map((opt, i) => (
          <InfoCard
            key={i}
            tag={opt.price_min_eur != null && opt.price_max_eur != null ? `${opt.price_min_eur}–${opt.price_max_eur} €/мес` : undefined}
            title={opt.name}
          >
            <p className="leading-relaxed">{opt.pros_ru}</p>
            {opt.url && (
              <a href={opt.url} target="_blank" rel="noreferrer" className="text-content-gold text-xs underline mt-1 inline-block">
                {opt.url.replace('https://', '').replace(/\/$/, '')} ↗
              </a>
            )}
          </InfoCard>
        ))}
      </div>
    </ContentPage>
  );
}
