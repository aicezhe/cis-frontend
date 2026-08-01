import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRelocation, useLociRoutes } from '../hooks/useRelocation';
import { Price } from '../components/Price';
import { RouteCard } from '../components/RouteCard';
import type { ArrivalStep } from '../types/relocation';
import { ContentPage, PageHeader, TldrCard, H2, BodyText, Note } from '../components/content';
import { LoadingScreen } from '../components/Loader';

function StepBox({ s }: { s: ArrivalStep }) {
  return (
    <div className="border border-content-line rounded-xl px-3.5 py-3 bg-content-surface">
      <div className="flex justify-between items-baseline gap-2">
        <p className="text-content-navy text-sm font-semibold flex-1">{s.transport}</p>
        <p className="text-content-navy text-sm font-bold flex-shrink-0"><Price eur={s.cost_eur} /></p>
      </div>
      <p className="text-content-ink-2 text-xs leading-relaxed mt-0.5">
        {s.step}{s.duration_ru ? ` · ${s.duration_ru}` : ''}
      </p>
      {s.note_ru && <p className="text-content-ink-2 text-[11px] italic mt-1 leading-relaxed">{s.note_ru}</p>}
    </div>
  );
}

function ArrivalSection({
  name, subtitle, steps, first = false,
}: {
  name: string; subtitle?: string; steps: ArrivalStep[]; first?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const toCenter = steps.slice(0, -1);
  const toParma = steps[steps.length - 1];
  return (
    <div className={first ? '' : 'pt-4 border-t border-content-line'}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 text-left py-1">
        <div className="flex-1 min-w-0">
          <p className="text-content-navy text-lg font-semibold">{name}</p>
          {subtitle && <p className="text-content-ink-2 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14"
          className={'text-content-navy flex-shrink-0 transition-transform ' + (open ? 'rotate-180' : '')} fill="currentColor">
          <path d="M7 10L1 4h12L7 10z" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 pb-5">
          {toCenter.length > 0 && (
            <>
              <p className="text-content-gold text-[11px] uppercase tracking-widest font-semibold mb-2">
                Добраться до центра{toCenter.length > 1 ? ' — 2 варианта' : ''}
              </p>
              <div className="flex flex-col gap-2">
                {toCenter.map((s, i) => <StepBox key={i} s={s} />)}
              </div>
            </>
          )}
          {toParma && (
            <>
              <p className="text-content-gold text-[11px] uppercase tracking-widest font-semibold mb-2 mt-4">
                Дальше → до Пармы
              </p>
              <StepBox s={toParma} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TravelRoutesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { relocation, loading } = useRelocation();
  const { routes: lociRoutes } = useLociRoutes();
  const openSteps = Boolean((location.state as { openSteps?: boolean } | null)?.openSteps);
  const back = () => navigate('/path/travel', openSteps ? { state: { openSteps: true } } : undefined);

  if (loading) {
    return (
      <LoadingScreen className="bg-content-bg" />
    );
  }

  const routesBlock = (
    <>
      <H2>Варианты маршрутов</H2>
      <div className="flex flex-col gap-3 mt-4">
        {lociRoutes.length === 0 ? (
          <p className="text-content-ink-2 text-sm italic">Маршруты для твоей страны уточняются.</p>
        ) : (
          lociRoutes.map((route) => <RouteCard key={route.id} route={route} />)
        )}
      </div>
    </>
  );

  // Нет детального seed'а для страны (ua/by/kz) — показываем только маршруты.
  if (!relocation) {
    return (
      <ContentPage>
        <PageHeader crumb="Переезд" title="Дорога в Парму" onBack={back} />
        <TldrCard>Основные маршруты в Парму — ниже. Подробный гайд по дороге и первым дням для твоей страны в разработке.</TldrCard>
        {routesBlock}
      </ContentPage>
    );
  }

  const tr = relocation.travel_routes;
  const ar = relocation.arrival_routes;

  return (
    <ContentPage>
      <PageHeader crumb="Переезд" title="Дорога в Парму" onBack={back} />

      <TldrCard>{tr.first_trip_logic_ru}</TldrCard>

      <BodyText>{tr.airports_ru}</BodyText>

      {routesBlock}

      <H2>Стоимость перелёта</H2>
      <BodyText>{tr.flight_cost_ru.estimate_ru}</BodyText>
      <p className="text-content-ink-2 text-xs italic leading-relaxed mt-2">{tr.flight_cost_ru.tip_ru}</p>

      <H2>{ar.title_ru}</H2>
      <div className="flex flex-col mt-4">
        <ArrivalSection name={ar.via_bologna.name_ru} steps={ar.via_bologna.steps_ru} first />
        <ArrivalSection name={ar.via_milan.name_ru} subtitle={ar.via_milan.airports_ru} steps={ar.via_milan.steps_ru} />
      </div>

      <Note>{ar.trenit_app_ru}</Note>

      <p className="text-content-ink-2 text-xs italic text-center mt-8">
        Цены перелётов и тарифы — проверь перед поездкой
      </p>
    </ContentPage>
  );
}
