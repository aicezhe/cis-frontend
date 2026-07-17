import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';
import { ContentPage, PageHeader, TldrCard, InfoCard } from '../components/content';

export default function HousingSearchPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (!relocation) {
    navigate('/path/travel');
    return null;
  }

  const hs = relocation.housing_search;

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
