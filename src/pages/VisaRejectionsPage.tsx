import { useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useVisa, useVisaKz } from '../hooks/useVisa';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function VisaRejectionsPage() {
  const navigate = useNavigate();
  const { visa, loading, country } = useVisa();
  const { kz } = useVisaKz();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!visa) {
    navigate('/path/visa');
    return null;
  }

  const rj = visa.rejection_reasons_ru;
  // Интро в общем сиде написано «по-российски» (мультивизы россиянам) — для
  // других стран показываем нейтральную формулировку без сравнений.
  const intro = country === 'ru'
    ? rj.intro_ru
    : 'Проверка заявлений на визу D ужесточилась. Все основания для отказа — в статье 32 Визового кодекса ЕС.';

  return (
    <ContentPage>
      <PageHeader crumb="Виза" title={rj.title_ru} backTo="/path/visa" />

      <TldrCard>{intro}</TldrCard>

      {/* Казахстанский акцент: выписка Kaspi — топовая страновая причина отказа */}
      {country === 'kz' && kz?.rejection_note_ru && (
        <Note icon={<TriangleAlert size={15} />}>{kz.rejection_note_ru}</Note>
      )}

      <H2>Причины отказа</H2>
      <div className="flex flex-col gap-3 mt-4">
        {rj.reasons.map((r) => (
          <div
            key={r.n}
            className="rounded-2xl border px-4 py-3.5"
            style={{ backgroundColor: 'rgba(168, 51, 42, 0.06)', borderColor: 'rgba(168, 51, 42, 0.35)' }}
          >
            <div className="flex items-start gap-3">
              <span
                className="font-bold text-sm flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: '#a8332a' }}
              >
                {r.n}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-content-navy text-[15px] font-semibold">{r.title_ru}</p>
                <p className="text-content-ink-2 text-[13px] leading-relaxed mt-1">{r.detail_ru}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <H2>Как не попасть под отказ</H2>
      <Note>
        <div className="flex flex-col gap-2">
          {rj.universal_tips_ru.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">✓</span>
              <p className="text-content-ink text-[14.5px] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Note>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Источник: ст. 32 Визового кодекса ЕС · проверяй актуальные правила своего консульства
      </p>
    </ContentPage>
  );
}
