import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation } from '../hooks/useFoundation';

export default function FoundationOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">
          Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.
        </p>
      </div>
    );
  }

  const p = data.program;

  const navCards = [
    { title: 'Предметы и треки', sub: 'Что учишь весь год', route: '/path/foundation/subjects' },
    { title: 'Финансы и потоки', sub: 'Стоимость, дедлайны подачи', route: '/path/foundation/finance' },
    { title: 'Языковые требования', sub: 'Итальянский, английский, сертификаты', route: '/path/foundation/languages' },
    { title: 'Как поступить', sub: 'Документы, апостиль, заявка', route: '/path/foundation/apply' },
  ];

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка */}
      <div className="mx-6 mt-4 bg-soft-cream border border-navy/20 rounded-3xl p-6">
        <div className="text-right">
          <h1 className="font-serif text-navy text-3xl font-bold">{p.name}</h1>
          <p className="font-serif text-gold text-base italic mt-1">{p.name_full}</p>
          <p className="font-serif text-navy/60 text-xs mt-1">
            {p.duration_months} мес · {p.period}
          </p>
        </div>
      </div>

      {/* Что это */}
      <div className="mx-6 mt-6">
        <h3 className="font-serif text-navy text-xl font-bold mb-3">Что это</h3>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{p.description_ru}</p>
      </div>

      {/* Важно: FY ≠ университет */}
      <div className="mx-6 mt-6 bg-navy rounded-2xl p-5 relative">
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-sm italic mb-2">Важно</p>
        <p className="font-serif text-cream text-sm leading-relaxed">{p.important_note_ru}</p>
      </div>

      {/* Как устроена учёба */}
      <div className="mx-6 mt-6">
        <h3 className="font-serif text-navy text-xl font-bold mb-3">Как устроена учёба</h3>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">{data.how_studies_work_ru}</p>
      </div>

      {/* Что получаешь */}
      <div className="mx-6 mt-6">
        <h3 className="font-serif text-navy text-xl font-bold mb-3">После завершения</h3>
        <div className="flex flex-col gap-2">
          {p.issued_after_completion.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5">◆</span>
              <p className="font-serif text-navy/80 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Навигация по подразделам */}
      <div className="mx-6 mt-8 flex flex-col gap-3">
        {navCards.map((card) => (
          <button
            key={card.route}
            onClick={() => navigate(card.route)}
            className="bg-soft-cream border border-navy/20 rounded-2xl p-4 text-left flex justify-between items-center"
          >
            <div>
              <h4 className="font-serif text-navy text-lg font-bold">{card.title}</h4>
              <p className="font-serif text-gold text-xs italic mt-0.5">{card.sub}</p>
            </div>
            <span className="text-navy text-xl">→</span>
          </button>
        ))}
      </div>

      {/* Контакты */}
      <div className="mx-6 mt-6 mb-2">
        <p className="font-serif text-navy/60 text-xs">
          Офиц. сайт:{' '}
          <a href={p.official_url} target="_blank" rel="noreferrer" className="text-gold underline">
            {p.official_url.replace('https://', '')}
          </a>
        </p>
        <p className="font-serif text-navy/60 text-xs mt-1">
          Почта:{' '}
          <a href={`mailto:${p.official_email}`} className="text-gold underline">
            {p.official_email}
          </a>
        </p>
        <p className="font-serif text-navy/40 text-[11px] italic mt-3">
          Данные: {data.meta.source} · уч. год {data.meta.academic_year} · обновлено {data.meta.last_updated}
        </p>
      </div>

      <TabBar active="path" />
    </div>
  );
}
