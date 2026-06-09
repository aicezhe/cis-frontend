import { useNavigate } from 'react-router-dom';
import { useMyProgram } from '../hooks/useProgram';

export default function ProgramLanguagesPage() {
  const navigate = useNavigate();
  const { program, loading } = useMyProgram();

  const completedFY = localStorage.getItem('cispr_completed_fy') === 'true';

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><p className="font-serif text-navy/60 italic">Загрузка…</p></div>;
  if (!program) return null;

  const lr = program.language_requirements;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12 flex items-center gap-4">
        <button onClick={() => navigate('/path/uni/program')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Языковые требования</h1>
      </div>

      {/* Italstudio из FY */}
      {completedFY && (
        <div className="mx-6 mt-5 bg-navy rounded-2xl px-5 py-4">
          <p className="font-serif text-gold text-sm italic mb-1">Foundation Year завершён</p>
          <p className="font-serif text-cream text-sm leading-relaxed">
            Сертификат Italstudio B2 из Foundation Year UniPR засчитывается для поступления на италоязычный бакалавриат автоматически.
          </p>
        </div>
      )}

      {/* Итальянский */}
      <div className="px-6 mt-6">
        <p className="font-serif text-gold text-sm italic mb-3">Для программ на итальянском</p>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-serif text-navy text-base font-bold">Итальянский</p>
            <span className="font-serif text-gold text-sm border border-gold/60 rounded-full px-3 py-1">
              {lr.italian_taught_courses.level}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {lr.italian_taught_courses.accepted_certificates.map((cert, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gold text-sm">◆</span>
                <p className="font-serif text-navy/80 text-sm">{cert}</p>
              </div>
            ))}
          </div>
          {lr.italian_taught_courses.exemption_for_fy && !completedFY && (
            <p className="font-serif text-navy/60 text-xs italic mt-3 leading-relaxed">
              💡 {lr.italian_taught_courses.exemption_for_fy}
            </p>
          )}
        </div>
      </div>

      {/* Английский */}
      <div className="px-6 mt-5">
        <p className="font-serif text-gold text-sm italic mb-3">Для программ на английском</p>
        <div className="bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-serif text-navy text-base font-bold">Английский</p>
            <span className="font-serif text-gold text-sm border border-gold/60 rounded-full px-3 py-1">
              {lr.english_taught_courses.level}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {lr.english_taught_courses.accepted_certificates.map((cert, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gold text-sm">◆</span>
                <p className="font-serif text-navy/80 text-sm">{cert}</p>
              </div>
            ))}
          </div>
          {lr.english_taught_courses.exemption_ru && (
            <p className="font-serif text-navy/60 text-xs italic mt-3 leading-relaxed">
              💡 {lr.english_taught_courses.exemption_ru}
            </p>
          )}
        </div>
      </div>

      {/* UniPR Language Test */}
      <div className="mx-6 mt-5 bg-soft-cream border border-gold/40 rounded-2xl px-5 py-4">
        <p className="font-serif text-gold text-sm italic mb-2">🎓 UniPR Language Test — бесплатно</p>
        <p className="font-serif text-navy/80 text-sm leading-relaxed">
          UniPR предлагает собственный языковой тест через CLA (Centro Linguistico di Ateneo).
          Он признаётся для поступления и не требует оплаты.
          Можно сдать после приезда или уточнить возможность онлайн-сдачи.
        </p>
      </div>

      {/* Duolingo */}
      {lr.duolingo_note_ru && (
        <div className="mx-6 mt-4 bg-soft-cream border border-navy/15 rounded-2xl px-5 py-4">
          <p className="font-serif text-gold text-sm italic mb-1">Про Duolingo</p>
          <p className="font-serif text-navy/70 text-sm leading-relaxed">{lr.duolingo_note_ru}</p>
        </div>
      )}

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        Актуальные требования — проверяй на странице своей программы
      </p>
    </div>
  );
}
