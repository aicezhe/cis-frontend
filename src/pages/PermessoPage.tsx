import { useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useRelocation } from '../hooks/useRelocation';
import { Price } from '../components/Price';
import { ContentPage, PageHeader, TldrCard, H2, Steps, Step, Note } from '../components/content';

export default function PermessoPage() {
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

  const pm = relocation.permesso_di_soggiorno;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title={pm.title_ru} backTo="/path/travel" />

      <TldrCard stats={[{ value: String(pm.steps_ru.length), label: 'шагов' }]}>
        Вид на жительство — оформляется в <b>первые дни</b> после приезда. Дедлайн и порядок ниже.
      </TldrCard>

      <Note icon={<TriangleAlert size={16} />}>
        <b>{pm.deadline_ru}</b>
      </Note>

      <H2>{pm.steps_ru.length} шагов</H2>
      <Steps>
        {pm.steps_ru.map((s) => (
          <Step
            key={s.step}
            number={s.step}
            title={s.title_ru}
          >
            {s.cost_eur != null && (
              <p className="text-content-navy text-[13px] font-semibold mb-1"><Price eur={s.cost_eur} /></p>
            )}
            {s.detail_ru}
          </Step>
        ))}
      </Steps>

      <button
        onClick={() => navigate('/laura')}
        className="w-full text-content-navy bg-content-gold-bg border border-content-line rounded-full py-3 text-sm mt-4"
      >
        ✦ Спросить Лауру про заполнение KIT
      </button>

      <H2>Пакет документов</H2>
      <div className="bg-content-surface border border-content-line rounded-2xl px-5 py-4 mt-4">
        <div className="flex flex-col gap-2">
          {pm.documents_ru.map((d, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
              <p className="text-content-ink text-[14.5px] leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-content-navy px-5 py-4 mt-4">
        <p className="text-content-gold text-[11px] uppercase tracking-widest font-semibold">отслеживание</p>
        <p className="text-white/80 text-sm leading-relaxed mt-1">{pm.tracking_ru}</p>
        <a href={pm.tracking_url} target="_blank" rel="noreferrer" className="text-[#D8BC85] text-xs underline mt-1.5 inline-block">
          {pm.tracking_url.replace('https://', '')} ↗
        </a>
      </div>
    </ContentPage>
  );
}
