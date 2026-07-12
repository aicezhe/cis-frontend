import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useParmaLife } from '../hooks/useParmaLife';
import { parmaIconComponent } from '../components/ParmaIcon';
import { GridButton } from '../components/GridButton';
import { HomeAddressInput } from '../components/HomeAddressInput';

export default function ParmaLifeOverviewPage() {
  const navigate = useNavigate();
  const { parmaLife, loading } = useParmaLife();

  if (loading || !parmaLife) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  const isFoundation = (localStorage.getItem('cispr_program') || '') === 'foundation';
  const subsections = parmaLife.subsections.filter((s) => isFoundation || !s.foundation_only);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
      </div>

      {/* Шапка раздела — без коробки-плашки, текст прямо на странице (как в Университете) */}
      <div className="mt-4 px-6 text-center">
        <h1 className="font-serif text-navy text-3xl font-bold">В Парме</h1>
        <p className="font-serif text-gold text-base mt-1 italic">Жизнь после переезда</p>
        <span className="block bg-gold/60 mx-auto mt-3" style={{ width: 72, height: 1 }} />
      </div>

      {/* Интро — просто текст, без коробки-плашки */}
      <p className="font-serif text-navy/70 text-sm text-center px-6 mt-5 leading-relaxed">
        {parmaLife.intro_ru.what_ru}
      </p>

      {/* Карта мест Loci */}
      <button
        onClick={() => navigate('/map')}
        className="relative mx-6 mt-4 bg-navy rounded-2xl px-5 py-4 text-left"
      >
        <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />
        <p className="font-serif text-gold text-[10px] uppercase tracking-widest mb-1">⌐ loci ¬</p>
        <p className="font-serif text-cream text-lg">Места Пармы на карте</p>
        <p className="font-serif text-cream/60 text-sm mt-1">Корпуса UniPR, документы, здоровье, жильё</p>
      </button>

      {/* Мой адрес — фиксируется на карте Loci */}
      <div className="mx-6 mt-4">
        <HomeAddressInput />
      </div>

      {/* Подразделы — компактная сетка мелких плиток, как в Университете */}
      <p className="font-serif text-gold text-sm font-bold px-6 mt-8 mb-3">Подробнее о:</p>
      <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-4">
        {subsections.map((sec, i) => (
          <GridButton
            key={sec.id}
            icon={parmaIconComponent(sec.id)}
            title={sec.title_ru}
            to={`/path/parma/${sec.id}`}
            seed={i + 1}
            wide={subsections.length % 2 === 1 && i === subsections.length - 1}
          />
        ))}
      </div>

      <p className="font-serif text-navy/40 text-xs italic text-center px-6 mt-6">
        {parmaLife.meta.data_policy}
      </p>

      <TabBar active="path" />
    </div>
  );
}
