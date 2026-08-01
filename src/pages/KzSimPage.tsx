import { useKzSimBanking } from '../hooks/useKzSimBanking';
import { ContentPage, PageHeader, TldrCard, Steps, Step } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function KzSimPage() {
  const { data, loading } = useKzSimBanking();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!data) return null;

  const s = data.sim;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд · Казахстан" title={s.title_ru} subtitle={s.subtitle_ru} backTo="/path/travel" />

      <TldrCard>{s.intro_ru}</TldrCard>

      <Steps>
        {s.steps_ru.map((step, i) => (
          <Step key={i} number={i + 1} title={step.title_ru}>{step.detail_ru}</Step>
        ))}
      </Steps>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">{data.meta.data_policy}</p>
    </ContentPage>
  );
}
