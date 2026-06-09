import { useNavigate } from 'react-router-dom';
import { useNumeroChiuso } from '../hooks/useProgram';
import { Price } from '../components/Price';
import type { NumeroChiusoProgram } from '../types/laurea';

function TestCard({ p }: { p: NumeroChiusoProgram }) {
  return (
    <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className="font-serif text-navy text-base font-bold leading-snug">{p.course_name}</p>
          <span className="inline-block font-serif text-gold text-xs border border-gold/60 rounded-full px-2.5 py-0.5 mt-1">
            {p.test}
          </span>
        </div>
        {p.test_cost_eur !== undefined && (
          <div className="text-right flex-shrink-0">
            <p className="font-serif text-navy/60 text-xs">тест</p>
            <p className="font-serif text-navy text-base font-bold">
              <Price eur={p.test_cost_eur} />
            </p>
          </div>
        )}
      </div>

      {p.test_when && (
        <p className="font-serif text-navy/70 text-xs mt-2">🕑 {p.test_when}</p>
      )}
      {p.passing_score && (
        <p className="font-serif text-navy/60 text-xs italic mt-1">{p.passing_score}</p>
      )}
      {p.test_url && (
        <a
          href={p.test_url}
          target="_blank"
          rel="noreferrer"
          className="inline-block font-serif text-gold text-xs underline mt-2"
        >
          {p.test_url.replace('https://', '')} ↗
        </a>
      )}
      {p.test_provider && (
        <p className="font-serif text-navy/40 text-xs mt-1">Провайдер: {p.test_provider}</p>
      )}
    </div>
  );
}

export default function NumeroChiusoPage() {
  const navigate = useNavigate();
  const data = useNumeroChiuso();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  const info = data.general_info_ru;
  const where = info.where_to_take_ru;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Numero chiuso и тесты</h1>
      </div>

      {/* Что это */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-2">Что такое numero chiuso</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{info.what_is_numero_chiuso}</p>
      </div>

      {/* Программы */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">
        Программы UniPR с ограничением мест
      </p>
      <div className="px-6 flex flex-col gap-3">
        {data.numero_chiuso_programs.map((p) => (
          <TestCard key={p.course_id} p={p} />
        ))}
      </div>

      {/* Где сдавать */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">Где сдавать</p>
      <div className="px-6 flex flex-col gap-3">
        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
          <p className="font-serif text-navy text-base font-bold mb-1">TOLC@CASA</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed">{where.tolc_at_home}</p>
        </div>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
          <p className="font-serif text-navy text-base font-bold mb-1">TOLC в тест-центрах</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed">{where.tolc_in_centers}</p>
        </div>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-4 py-4">
          <p className="font-serif text-navy text-base font-bold mb-1">IMAT</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed">{where.imat_in_centers}</p>
        </div>
      </div>

      {/* Советы по подготовке */}
      <p className="font-serif text-gold text-sm italic px-6 mt-6 mb-3">Советы по подготовке</p>
      <div className="px-6 flex flex-col gap-2">
        {info.how_to_prepare_ru.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-gold mt-0.5 text-sm flex-shrink-0">◆</span>
            <p className="font-serif text-navy/80 text-sm">{tip}</p>
          </div>
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Актуальные бандо — проверяй на unipr.it и cisiaonline.it
      </p>
    </div>
  );
}
