import { useNavigate } from 'react-router-dom';
import { useRelocation } from '../hooks/useRelocation';
import { ContentPage, PageHeader, TldrCard, H2, Steps, Step } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function CodiceFiscalePage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!relocation) {
    navigate('/path/travel');
    return null;
  }

  const cf = relocation.codice_fiscale;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={cf.title_ru} backTo="/path/travel" />

      <TldrCard>{cf.what_ru} {cf.if_not_in_russia_ru}</TldrCard>

      {/* Где + цена — тап открывает точку на карте Loci */}
      <button
        onClick={() => navigate('/map', { state: { focus: 'agenzia_entrate' } })}
        className="w-full rounded-2xl bg-content-navy px-5 py-4 text-left mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
      >
        <p className="text-content-gold text-[11px] uppercase tracking-widest font-semibold">куда идти · на карте →</p>
        <p className="text-white text-lg font-semibold mt-0.5">{cf.where_ru}</p>
        <p className="text-[#D8BC85] text-sm mt-1">{cf.cost_ru}</p>
      </button>

      <H2>Документы с собой</H2>
      <div className="bg-content-surface border border-content-line rounded-2xl px-5 py-4 mt-4">
        <div className="flex flex-col gap-2">
          {cf.documents_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="text-content-ink text-[14.5px] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <H2>Как получить</H2>
      <Steps>
        {cf.steps_ru.map((s, i) => (
          <Step key={i} number={i + 1} title={s} />
        ))}
      </Steps>
    </ContentPage>
  );
}
