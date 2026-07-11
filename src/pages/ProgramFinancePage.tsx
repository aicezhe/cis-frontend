import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';
import { Price } from '../components/Price';

export default function ProgramFinancePage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (!program) return null;

  const fees = program.tuition_fees;
  const noTax = fees.no_tax_area;
  const withoutIsee = fees.without_isee;
  const ergo = fees.scholarships?.ergo_borsa;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Стоимость и стипендия</h1>
      </div>

      {/* Объяснение ISEE */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-2 font-bold">Как считается стоимость в Италии</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{fees.explanation_ru}</p>
      </div>

      {/* Сравнительные карточки */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Варианты стоимости в год</p>
      <div className="px-6 flex flex-col gap-3">

        {/* No tax area */}
        <div className="relative bg-navy rounded-2xl p-5">
          <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
          <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
          <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
          <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
          <p className="font-serif text-gold text-sm font-bold">С ISEE parificato ≤ {noTax.isee_threshold_eur.toLocaleString()} €</p>
          <p className="font-serif text-cream text-3xl font-bold mt-2">
            <Price eur={noTax.amount_eur} />
          </p>
          <p className="font-serif text-cream/70 text-sm mt-2 leading-relaxed">
            {noTax.components_ru || 'Региональный налог + виртуальная марка — это вся плата за год'}
          </p>
          <p className="font-serif text-gold text-xs mt-2 font-bold">
            ISEE parificato оформляется бесплатно через CAF в Италии
          </p>
        </div>

        {/* Без ISEE */}
        <div className="bg-soft-cream border border-navy/20 rounded-2xl p-5">
          <p className="font-serif text-navy/60 text-sm italic">Без ISEE / с высоким ISEE</p>
          <p className="font-serif text-navy text-2xl font-bold mt-2">
            <Price eur={withoutIsee.amount_eur_min} />
            {' – '}
            <Price eur={withoutIsee.amount_eur_max} />
          </p>
          <p className="font-serif text-navy/70 text-sm mt-2 leading-relaxed">{withoutIsee.note_ru}</p>
        </div>

      </div>

      {/* ER.GO */}
      {ergo && (
        <>
          <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">Стипендия</p>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-serif text-navy text-base font-bold">{ergo.name}</p>
                {ergo.for_whom && (
                  <p className="font-serif text-navy/70 text-sm mt-1 leading-relaxed">{ergo.for_whom}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="font-serif text-navy/60 text-xs">до</p>
                <p className="font-serif text-navy text-xl font-bold">
                  <Price eur={ergo.max_amount_eur} />
                </p>
                <p className="font-serif text-navy/60 text-xs">в год</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/scholarship')}
              className="w-full mt-4 font-serif text-navy bg-gold rounded-full py-2.5 text-sm"
            >
              Рассчитать мою стипендию ER.GO →
            </button>
            <p className="font-serif text-navy/40 text-[11px] italic mt-2">
              Подробная схема сбора документов для ER.GO — в разработке.
            </p>
          </div>
        </>
      )}

      {/* ISEE parificato */}
      <p className="font-serif text-gold text-sm px-6 mt-6 mb-3 font-bold">ISEE parificato</p>
      <button
        onClick={() => navigate('/path/uni/program/isee')}
        className="relative mx-6 bg-navy rounded-2xl px-5 py-4 text-left w-[calc(100%-3rem)]"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ документы ¬</p>
        <p className="font-serif text-cream text-lg leading-snug">Как собрать документы для ISEE</p>
        <p className="font-serif text-cream/60 text-sm mt-1">Персональная схема под твою семью</p>
      </button>

      {/* Совет */}
      <div className="mx-6 mt-5 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm mb-2 font-bold">💡 Как сэкономить</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">
          Сразу после приезда в Италию — иди в ближайший CAF и оформи ISEE parificato. Это бесплатно
          и займёт 1-2 визита. С ISEE ≤ 27 000 € ты платишь только 156 € в год вместо 1500-2500 €.
        </p>
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Точные суммы — на unipr.it/en/amounts-of-taxes-and-contributions
      </p>
    </div>
  );
}
