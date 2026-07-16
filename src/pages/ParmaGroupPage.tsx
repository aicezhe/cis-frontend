import { useNavigate, useParams } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useParmaLife } from '../hooks/useParmaLife';
import { ParmaIcon } from '../components/ParmaIcon';
import { parmaGroupById } from '../lib/parmaGroups';
import type { ParmaSubsection } from '../types/parmaLife';

// Карточка подраздела — навайный треугольник по диагонали с иконкой, название
// на кремовой половине. Единый стиль плиток внутри раздела «В Парме».
function SubsectionCard({ sec, onClick }: { sec: ParmaSubsection; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-28 rounded-2xl overflow-hidden border-2 border-gold/50 bg-soft-cream text-left"
    >
      {/* Навайный треугольник (верх-лево), диагональ из верх-право в низ-лево */}
      <span
        className="absolute inset-0 bg-navy"
        style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
      />
      <ParmaIcon id={sec.id} className="absolute top-4 left-4 w-8 h-8 text-gold" strokeWidth={1.5} />
      <div className="absolute bottom-3 right-4 left-1/2 text-right">
        <p className="font-serif text-navy text-lg font-bold leading-tight">{sec.title_ru}</p>
        {sec.subtitle_ru && (
          <p className="font-serif text-gold text-[11px] leading-tight mt-0.5">{sec.subtitle_ru}</p>
        )}
      </div>
    </button>
  );
}

export default function ParmaGroupPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { parmaLife, loading } = useParmaLife();

  const group = parmaGroupById(groupId);

  if (loading || !parmaLife) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-8 text-center">
        <p className="font-serif text-navy text-base mb-4">Раздел не найден</p>
        <button
          onClick={() => navigate('/path/parma')}
          className="font-serif text-cream bg-navy rounded-full px-6 py-2 text-sm"
        >
          ← В Парме
        </button>
      </div>
    );
  }

  const isFoundation = (localStorage.getItem('cispr_program') || '') === 'foundation';
  // Порядок — как в группе; foundation_only показываем только студентам FY.
  const cards = group.subsectionIds
    .map((id) => parmaLife.subsections.find((s) => s.id === id))
    .filter((s): s is ParmaSubsection => !!s && (isFoundation || !s.foundation_only));

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path/parma')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">{group.title_ru}</h1>
        <p className="font-serif text-gold text-base mt-1 italic">{group.subtitle_ru}</p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      <div className="px-6 mt-6 flex flex-col gap-4">
        {cards.map((sec) => (
          <SubsectionCard key={sec.id} sec={sec} onClick={() => navigate(`/path/parma/${sec.id}`)} />
        ))}
      </div>

      <TabBar active="path" />
    </div>
  );
}
