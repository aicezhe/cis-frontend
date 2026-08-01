import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TriangleAlert } from 'lucide-react';
import { useRelocation } from '../hooks/useRelocation';
import { useMod209 } from '../hooks/useMod209';
import { Price } from '../components/Price';
import { ContentPage, PageHeader, TldrCard, H2, Steps, Step, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function PermessoPage() {
  const navigate = useNavigate();
  const { relocation, loading } = useRelocation();
  const { mod209 } = useMod209();
  const [m209Open, setM209Open] = useState(false);

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
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

      {/* Разбор Mod. 209 — по полям. Сворачиваемо, чтобы не раздувать страницу. */}
      {mod209 && (
        <div className="mt-8">
          <button
            onClick={() => setM209Open(!m209Open)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="flex-1">
              <p className="text-content-navy text-lg font-semibold leading-tight">{mod209.meta.title_ru}</p>
              <p className="text-content-gold text-xs font-semibold mt-0.5">{mod209.meta.subtitle_ru}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 14 14"
              className={'text-content-navy flex-shrink-0 transition-transform ' + (m209Open ? 'rotate-180' : '')} fill="currentColor">
              <path d="M7 10L1 4h12L7 10z" />
            </svg>
          </button>

          {m209Open && (
            <div className="mt-4 flex flex-col gap-4">
              <Note icon={<TriangleAlert size={15} />}>{mod209.meta.disclaimer_ru}</Note>

              <p className="text-content-ink text-[14.5px] leading-relaxed">{mod209.what_ru}</p>

              {/* Куда подавать */}
              <div className="rounded-2xl bg-content-surface border border-content-line px-4 py-4">
                <p className="text-content-gold text-xs font-semibold uppercase tracking-wide mb-2">{mod209.submit_ru.title_ru}</p>
                <div className="flex flex-col gap-2">
                  {mod209.submit_ru.points_ru.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-content-gold flex-shrink-0 mt-0.5 text-xs">◆</span>
                      <p className="text-content-ink text-[14px] leading-relaxed">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Поля Modulo 1 */}
              <H2>Modulo 1 — поле за полем</H2>
              <div className="flex flex-col gap-2.5">
                {mod209.fields_ru.map((f) => (
                  <div key={f.n} className="rounded-2xl bg-content-surface border border-content-line px-4 py-3 flex gap-3">
                    <span className="flex-shrink-0 w-[26px] h-[26px] rounded-full bg-content-gold-bg text-content-gold font-bold text-xs flex items-center justify-center">{f.n}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-content-navy text-[14.5px] font-semibold leading-snug">{f.label_ru}</p>
                      <p className="text-content-ink-2 text-[13.5px] leading-relaxed mt-0.5">{f.note_ru}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Note>{mod209.payments_note_ru}</Note>
              <Note icon={<TriangleAlert size={15} />}>{mod209.bottom_note_ru}</Note>
            </div>
          )}
        </div>
      )}
    </ContentPage>
  );
}
