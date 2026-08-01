// Пилот дизайн-системы «Маршрут»: виза D · Казахстан.
//
// Страница ничего не знает о форме сида — только о схеме Guide. Всю раскладку
// делает адаптер lib/guides/visaKz.ts, поэтому следующие страницы подключаются
// своим адаптером, а не копией этой вёрстки.

import { useNavigate } from 'react-router-dom';
import { useTrackSection } from '../../hooks/useTrackSection';
import { useVisaKz } from '../../hooks/useVisa';
import { LoadingScreen } from '../../components/Loader';
// Таббар общий с остальным приложением: свой, «маршрутный», сделал бы в
// приложении два разных нижних меню (см. RouteTabBar — оставлен в системе,
// но не применён).
import TabBar from '../../components/TabBar';
import { buildVisaKzGuide } from '../../lib/guides/visaKz';
import type { GuideBlock } from '../../types/guide';
import {
  Card,
  CardText,
  DarkBand,
  DiamondList,
  GuideHero,
  RouteBar,
  RouteOutro,
  RoutePage,
  RouteSpine,
  RouteStop,
  StopHeader,
  TtlNote,
  withTerms,
} from '../../components/path';

function Block({ block }: { block: GuideBlock }) {
  if (block.kind === 'card') {
    return (
      <Card>
        {block.paragraphs?.map((p, i) => (
          <div key={i} className={i > 0 ? 'mt-[11px]' : ''}>
            <CardText>{withTerms(p)}</CardText>
          </div>
        ))}
        {block.items && (
          <div className={block.paragraphs?.length ? 'mt-[11px]' : ''}>
            <DiamondList items={block.items.map((it) => withTerms(it))} />
          </div>
        )}
      </Card>
    );
  }
  return (
    <DarkBand label={block.label} link={block.link}>
      {block.paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? 'mt-[11px]' : ''}>
          {withTerms(p)}
        </p>
      ))}
    </DarkBand>
  );
}

export default function VisaKzRoutePage() {
  useTrackSection('visa');
  const navigate = useNavigate();
  const { kz, loading } = useVisaKz();

  if (loading) return <LoadingScreen className="bg-rt-paper" />;
  if (!kz) {
    return (
      <RoutePage>
        <RouteBar onBack={() => navigate('/path')} />
        <p className="pt-10 text-[15.5px] leading-[1.55] text-rt-ink-2">
          Не удалось загрузить гайд по визе. Попробуй обновить страницу.
        </p>
        <TabBar active="path" />
      </RoutePage>
    );
  }

  const guide = buildVisaKzGuide(kz);

  return (
    <RoutePage>
      <RouteBar onBack={() => navigate('/path')} />

      <GuideHero
        eyebrow={guide.eyebrow}
        title={guide.title}
        gloss={guide.gloss}
        lead={guide.lead}
      />

      <RouteSpine>
        {guide.sections.map((s) => (
          <RouteStop key={s.id} confidence={s.confidence}>
            <StopHeader
              index={s.index}
              gloss={s.gloss}
              title={s.title}
              confidence={s.confidence}
            />
            {s.body.map((b, i) => (
              <div key={i} className={i > 0 ? 'mt-3' : ''}>
                <Block block={b} />
              </div>
            ))}
            {s.ttlNote && <TtlNote>{s.ttlNote}</TtlNote>}
          </RouteStop>
        ))}

        {/* Навигация в подстраницы визы. Референс переходы между гайдами не
            описывает, поэтому пока — списком в языке маршрута; тексты те же,
            что были на плитках. См. MIGRATION-TODO.md. */}
        <RouteStop confidence="confirmed">
          <StopHeader index={guide.sections.length + 1} gloss="" title="Дальше по визе" confidence="confirmed" />
          <Card>
            <DiamondList
              items={[
                <button
                  key="docs"
                  onClick={() => navigate('/path/visa/steps')}
                  className="text-left underline decoration-rt-gold-soft underline-offset-4"
                >
                  Документы
                </button>,
                <button
                  key="rej"
                  onClick={() => navigate('/path/visa/rejections')}
                  className="text-left underline decoration-rt-gold-soft underline-offset-4"
                >
                  Причины отказа
                </button>,
              ]}
            />
          </Card>
          {guide.outro && <RouteOutro>{guide.outro}</RouteOutro>}
        </RouteStop>
      </RouteSpine>

      <TabBar active="path" />
    </RoutePage>
  );
}
