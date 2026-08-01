import { useNavigate } from 'react-router-dom';
import { TriangleAlert, ArrowRight } from 'lucide-react';
import { useSsnTessera } from '../hooks/useSsnTessera';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

function Bullets({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {items.map((p, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
          <p className="text-content-ink text-[14.5px] leading-relaxed">{p}</p>
        </div>
      ))}
    </div>
  );
}

export default function SsnTesseraPage() {
  const navigate = useNavigate();
  const { ssn, loading } = useSsnTessera();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!ssn) {
    navigate('/path/travel');
    return null;
  }

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={ssn.meta.title_ru} subtitle={ssn.meta.subtitle_ru} backTo="/path/travel" />

      <TldrCard>{ssn.intro_ru}</TldrCard>

      {ssn.cases.map((c) => (
        <div key={c.id}>
          <H2>{c.title_ru}</H2>

          {c.lead_ru && (
            <p className="text-content-ink-2 text-[14.5px] leading-relaxed mt-2">{c.lead_ru}</p>
          )}

          {/* Студенческий случай — два варианта карточками */}
          {c.variants && (
            <div className="flex flex-col gap-3 mt-4">
              {c.variants.map((v, i) => (
                <div key={i} className="rounded-2xl bg-content-surface border border-content-line px-4 py-4">
                  <p className="text-content-navy text-[15.5px] font-semibold leading-snug">{v.label_ru}</p>
                  <Bullets items={v.points_ru} />
                  {v.warning_ru && (
                    <div className="mt-3">
                      <Note icon={<TriangleAlert size={15} />}>{v.warning_ru}</Note>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Простые случаи — текст в карточке */}
          {c.body_ru && (
            <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4 mt-4">
              <p className="text-content-ink text-[14.5px] leading-relaxed">{c.body_ru}</p>
              {c.link_ru && (
                <button
                  onClick={() => navigate(c.link_ru!.to, { state: { focus: c.link_ru!.focus } })}
                  className="mt-3 flex items-center gap-1.5 text-content-gold text-sm font-semibold"
                >
                  <span>{c.link_ru.label_ru}</span>
                  <ArrowRight size={15} className="flex-shrink-0" />
                </button>
              )}
            </div>
          )}

          {/* Куда идти в Парме — уточняется, адрес не выдумываем */}
          {c.todo_ru && (
            <div className="mt-4">
              <Note>{c.todo_ru}</Note>
            </div>
          )}
        </div>
      ))}

      <p className="text-content-ink-2 text-xs italic text-center mt-8">{ssn.meta.data_policy}</p>
    </ContentPage>
  );
}
