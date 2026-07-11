import { useNavigate } from 'react-router-dom';
import { useFoundation } from '../hooks/useFoundation';

export default function FoundationLanguagesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center bg-cream px-6"><p className="font-serif text-navy text-center">Не удалось загрузить данные Foundation Year. Попробуй обновить страницу.</p></div>;

  const lr = data.language_requirements;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Языковые требования</h1>
      </div>

      <div className="mx-6 mt-5 flex flex-col gap-3">
        <div className="bg-soft-cream border border-navy/15 rounded-xl px-4 py-3">
          <p className="font-serif text-navy/80 text-base leading-relaxed">
            Зависит от трека: можно зайти{' '}
            <span className="text-navy font-bold">с нуля</span>, с базовым итальянским{' '}
            <span className="text-navy font-bold">A1/A2</span> либо с английским{' '}
            <span className="text-navy font-bold">B2</span>.
          </p>
        </div>

        <div>
          <p className="font-serif text-gold text-sm mb-1.5 font-bold">Если идёшь на англоязычный bachelor — нужен B2:</p>
          <div className="flex flex-col gap-1">
            {lr.accepted_english_b2_certificates.map((cert, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-gold mt-0.5 text-sm">◆</span>
                <p className="font-serif text-navy/80 text-base">{cert}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-soft-cream border border-gold rounded-xl px-4 py-3">
          <p className="font-serif text-gold text-sm mb-1 font-bold">Про Duolingo</p>
          <p className="font-serif text-navy/80 text-sm leading-relaxed">{lr.duolingo_note_ru}</p>
        </div>
      </div>
    </div>
  );
}
