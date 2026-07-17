import { useLocation, useNavigate } from 'react-router-dom';
import { useFoundation } from '../hooks/useFoundation';
import { ContentPage, PageHeader, TldrCard, H2, InfoCard, Note } from '../components/content';

export default function FoundationLanguagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Пришли по ссылке из «Шаги поступления» — возвращаем назад тоже с
  // раскрытыми шагами, а не на свёрнутую страницу.
  const openSteps = Boolean((location.state as { openSteps?: boolean } | null)?.openSteps);
  const { data, loading, error } = useFoundation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg">
        <p className="font-golos text-content-ink-2 italic">Загрузка…</p>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-content-bg px-6">
        <p className="font-golos text-content-ink text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p>
      </div>
    );
  }

  const lr = data.language_requirements;

  return (
    <ContentPage>
      <PageHeader
        crumb="Foundation Year"
        title="Языковые требования"
        onBack={() => navigate('/path/foundation', openSteps ? { state: { openSteps: true } } : undefined)}
      />

      <TldrCard>
        Зависит от трека: можно зайти <b>с нуля</b>, с базовым итальянским <b>A1/A2</b> либо с
        английским <b>B2</b>.
      </TldrCard>

      <H2>Англоязычный bachelor — нужен B2</H2>
      <div className="mt-4">
        <InfoCard tag="B2" title="Принимаемые сертификаты английского">
          <div className="flex flex-col gap-1 mt-1">
            {lr.accepted_english_b2_certificates.map((cert, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-content-gold mt-0.5 text-sm">◆</span>
                <p className="text-content-ink text-[15px]">{cert}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <H2>Про Duolingo</H2>
      <Note>{lr.duolingo_note_ru}</Note>
    </ContentPage>
  );
}
