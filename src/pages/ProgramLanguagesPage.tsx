import { GraduationCap } from 'lucide-react';
import { useMyProgram } from '../hooks/useProgram';
import { ContentPage, PageHeader, TldrCard, H2, InfoCard, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

export default function ProgramLanguagesPage() {
  const { program, loading } = useMyProgram();
  const completedFY = localStorage.getItem('cispr_completed_fy') === 'true';

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }
  if (!program) return null;

  const lr = program.language_requirements;
  const stats = [
    { value: lr.italian_taught_courses.level, label: 'итальянский' },
    { value: lr.english_taught_courses.level, label: 'английский' },
  ];

  const certList = (certs: string[]) => (
    <div className="flex flex-col gap-1.5 mt-1">
      {certs.map((cert, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-content-gold text-sm">◆</span>
          <p className="text-content-ink text-[14.5px]">{cert}</p>
        </div>
      ))}
    </div>
  );

  return (
    <ContentPage>
      <PageHeader crumb="Университет · Программа" title="Языковые требования" backTo="/path/uni/program" />

      <TldrCard stats={stats}>
        Для италоязычных программ нужен сертификат <b>итальянского</b>, для англоязычных —
        <b> английского</b>. У UniPR есть собственный <b>бесплатный</b> языковой тест (CLA).
      </TldrCard>

      {completedFY && (
        <Note icon={<GraduationCap size={16} />}>
          <b>Foundation Year завершён.</b> Сертификат Italstudio B2 из Foundation Year UniPR
          засчитывается для поступления на италоязычный бакалавриат автоматически.
        </Note>
      )}

      <H2>Для программ на итальянском</H2>
      <div className="mt-4">
        <InfoCard tag={lr.italian_taught_courses.level} title="Итальянский">
          {certList(lr.italian_taught_courses.accepted_certificates)}
        </InfoCard>
      </div>
      {lr.italian_taught_courses.exemption_for_fy && !completedFY && (
        <Note>{lr.italian_taught_courses.exemption_for_fy}</Note>
      )}

      <H2>Для программ на английском</H2>
      <div className="mt-4">
        <InfoCard tag={lr.english_taught_courses.level} title="Английский">
          {certList(lr.english_taught_courses.accepted_certificates)}
        </InfoCard>
      </div>
      {lr.english_taught_courses.exemption_ru && <Note>{lr.english_taught_courses.exemption_ru}</Note>}

      <H2>Бесплатный тест UniPR</H2>
      <Note icon={<GraduationCap size={16} />}>
        UniPR предлагает собственный языковой тест через CLA (Centro Linguistico di Ateneo).
        Он признаётся для поступления и <b>не требует оплаты</b>. Можно сдать после приезда или
        уточнить возможность онлайн-сдачи.
      </Note>

      {lr.duolingo_note_ru && (
        <>
          <H2>Про Duolingo</H2>
          <p className="text-content-ink text-[15px] leading-relaxed mt-3">{lr.duolingo_note_ru}</p>
        </>
      )}

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Актуальные требования — проверяй на странице своей программы
      </p>
    </ContentPage>
  );
}
