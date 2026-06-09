import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';

function Corners() {
  return (
    <>
      <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
      <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
      <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
    </>
  );
}

interface NavCardProps {
  title: string;
  sub: string;
  to: string;
}

function NavCard({ title, sub, to }: NavCardProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="relative w-full bg-navy rounded-2xl p-5 text-left"
    >
      <Corners />
      <h4 className="font-serif text-cream text-lg font-bold">{title}</h4>
      <p className="font-serif text-gold text-sm italic mt-1">{sub}</p>
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gold text-xl">→</span>
    </button>
  );
}

export default function ProgramOverviewPage() {
  const navigate = useNavigate();
  const { program, programType, loading } = useMyProgram();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (!program || !programType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <div className="text-center">
          <p className="font-serif text-navy text-base mb-4">
            Программа не определена. Пройди онбординг, чтобы выбрать бакалавриат или магистратуру.
          </p>
          <button onClick={() => navigate('/onboarding')} className="font-serif text-cream bg-navy rounded-full px-8 py-3">
            Пройти онбординг
          </button>
        </div>
      </div>
    );
  }

  const p = program.program;
  const isMag = programType === 'master';

  const cards = [
    { title: 'Дедлайны и шаги', sub: 'Что и когда делать', to: '/path/uni/program/steps' },
    { title: 'Документы', sub: 'Чек-лист всего что нужно', to: '/path/uni/program/documents' },
    { title: 'Стоимость и стипендия', sub: 'ISEE, ER.GO, no tax area', to: '/path/uni/program/finance' },
    { title: 'Языковые требования', sub: 'Сертификаты, тесты UniPR', to: '/path/uni/program/languages' },
    ...(!isMag ? [{ title: 'Numero chiuso и тесты', sub: 'IMAT, TOLC-MED, TOLC-A…', to: '/path/uni/program/numero-chiuso' }] : []),
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          <h1 className="font-serif text-navy text-3xl font-bold">{p.name_ru}</h1>
          <p className="font-serif text-gold text-base italic mt-1">{p.name_it}</p>
          <p className="font-serif text-navy/60 text-xs mt-1">
            {p.duration_years} {p.duration_years === 2 ? 'года' : 'лет'} · {p.ects_total} CFU · {p.title_after}
          </p>
        </div>
      </div>

      {/* Описание */}
      <div className="mx-6 mt-5 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
        <p className="font-serif text-navy/80 text-base leading-relaxed">{p.description_ru}</p>
      </div>

      {/* Важные заметки */}
      {p.important_notes_ru.length > 0 && (
        <div className="mx-6 mt-4 relative bg-navy rounded-2xl p-5">
          <Corners />
          <p className="font-serif text-gold text-xs italic uppercase tracking-widest mb-3 px-2">Важно знать</p>
          <div className="flex flex-col gap-3 px-2">
            {p.important_notes_ru.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold mt-0.5 flex-shrink-0">◆</span>
                <p className="font-serif text-cream text-sm leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Карточки навигации */}
      <h3 className="font-serif text-navy text-xl font-bold px-6 mt-8 mb-4">
        Что нужно знать
      </h3>
      <div className="px-6 flex flex-col gap-3">
        {cards.map((card) => (
          <NavCard key={card.to} {...card} />
        ))}
      </div>

      {/* Дисклеймер */}
      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Дедлайны актуальны на 2026/2027 — проверяй на apply.unipr.it перед подачей
      </p>
    </div>
  );
}
