import { useNavigate } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import { useMyProgram } from '../hooks/useProgram';
import { Price } from '../components/Price';
import { ContentPage, PageHeader, TldrCard, H2, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function ProgramFinancePage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!program) return null;

  const fees = program.tuition_fees;
  const noTax = fees.no_tax_area;
  const withoutIsee = fees.without_isee;
  const ergo = fees.scholarships?.ergo_borsa;

  const stats = [
    { value: `${noTax.amount_eur} €`, label: `с ISEE ≤${Math.round(noTax.isee_threshold_eur / 1000)}к` },
    { value: `до ${withoutIsee.amount_eur_max} €`, label: 'без ISEE' },
  ];

  return (
    <ContentPage>
      <PageHeader crumb="Университет · Программа" title="Стоимость и стипендия" backTo="/path/uni/program" />

      <TldrCard stats={stats}>{fees.explanation_ru}</TldrCard>

      <H2>Стоимость в год</H2>

      <div className="flex flex-col gap-3 mt-4">
        <div className="rounded-2xl bg-content-navy px-5 py-5">
          <p className="text-content-gold text-sm font-semibold">
            С ISEE parificato ≤ {noTax.isee_threshold_eur.toLocaleString()} €
          </p>
          <p className="text-white font-bold mt-2" style={{ fontSize: 30, lineHeight: 1 }}>
            <Price eur={noTax.amount_eur} />
          </p>
          <p className="text-white/70 text-[14.5px] mt-2 leading-relaxed">
            {noTax.components_ru || 'Региональный налог + виртуальная марка — это вся плата за год'}
          </p>
          <p className="text-[#D8BC85] text-xs mt-2 font-semibold">
            ISEE parificato оформляется бесплатно через CAF в Италии
          </p>
        </div>

        <div className="rounded-2xl bg-content-surface border border-content-line px-5 py-5">
          <p className="text-content-ink-2 text-sm">Без ISEE / с высоким ISEE</p>
          <p className="text-content-navy font-bold mt-2" style={{ fontSize: 24, lineHeight: 1 }}>
            <Price eur={withoutIsee.amount_eur_min} /> – <Price eur={withoutIsee.amount_eur_max} />
          </p>
          <p className="text-content-ink-2 text-[14.5px] mt-2 leading-relaxed">{withoutIsee.note_ru}</p>
        </div>
      </div>

      {ergo && (
        <>
          <H2>Стипендия</H2>
          <div className="rounded-2xl bg-content-surface border border-content-line px-5 py-4 mt-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-content-navy text-[16.5px] font-semibold">{ergo.name}</p>
                {ergo.for_whom && (
                  <p className="text-content-ink-2 text-[14.5px] mt-1 leading-relaxed">{ergo.for_whom}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-content-ink-2 text-xs">до</p>
                <p className="text-content-navy text-xl font-bold"><Price eur={ergo.max_amount_eur} /></p>
                <p className="text-content-ink-2 text-xs">в год</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/scholarship')}
              className="w-full mt-4 text-content-navy bg-content-gold-bg border border-content-line rounded-full py-2.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
            >
              Рассчитать мою стипендию ER.GO →
            </button>
            <p className="text-content-ink-2 text-[11px] italic mt-2">
              Подробная схема сбора документов для ER.GO — в разработке.
            </p>
          </div>
        </>
      )}

      <H2>ISEE parificato</H2>
      <button
        onClick={() => navigate('/path/uni/program/isee')}
        className="w-full rounded-2xl bg-content-navy px-5 py-4 text-left mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-gold"
      >
        <p className="text-content-gold text-[11px] uppercase tracking-widest font-semibold mb-1">Документы</p>
        <p className="text-white text-lg leading-snug">Как собрать документы для ISEE</p>
        <p className="text-white/60 text-sm mt-1">Персональная схема под твою семью</p>
      </button>

      <Note icon={<Lightbulb size={16} />}>
        Сразу после приезда в Италию — иди в ближайший CAF и оформи ISEE parificato. Это <b>бесплатно</b> и
        займёт 1–2 визита. С ISEE ≤ 27 000 € ты платишь только <b>156 € в год</b> вместо 1500–2500 €.
      </Note>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Точные суммы — на unipr.it/en/amounts-of-taxes-and-contributions
      </p>
    </ContentPage>
  );
}
