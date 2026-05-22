import { useState } from 'react';
import TabBar from '../components/TabBar';

const categories = ['Все', 'Учёба', 'Жильё', 'Документы', 'Жизнь'];

// моковые места с координатами в процентах от карты
const places = [
  { id: 1, name: 'Università di Parma', category: 'Учёба', address: "Strada dell'Università 12", note: 'Главный кампус. Сюда за справками и в Segreteria.', x: 48, y: 34, type: 'navy' },
  { id: 2, name: 'Общежитие ER.GO', category: 'Жильё', address: 'Vicolo Grossardi 4', note: 'Бюджетный вариант жилья для студентов.', x: 24, y: 52, type: 'gold' },
  { id: 3, name: 'Questura di Parma', category: 'Документы', address: 'Borgo della Posta 14', note: 'Сюда за permesso di soggiorno.', x: 70, y: 58, type: 'navy' },
  { id: 4, name: 'Mercato della Ghiaia', category: 'Жизнь', address: 'Piazzale della Ghiaia', note: 'Городской рынок, дешёвые продукты.', x: 60, y: 24, type: 'gold' },
  { id: 5, name: 'Cinema Astra', category: 'Жизнь', address: 'Piazzale Volta 3', note: 'Студенческий кинотеатр.', x: 34, y: 72, type: 'navy' },
];

export default function MapPage() {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [selectedId, setSelectedId] = useState(1);

  // фильтр по категории
  const filtered = activeCategory === 'Все'
    ? places
    : places.filter(p => p.category === activeCategory);

  const selected = places.find(p => p.id === selectedId);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-24">

      {/* Шапка */}
      <div className="px-6 pt-12 pb-3">
        <h1 className="font-serif text-navy text-4xl font-bold">Loci</h1>
        <p className="font-serif text-gold text-sm italic mt-1">
          места Пармы, которые тебе пригодятся
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 px-6 pb-3 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={
              'font-serif text-sm px-4 py-2 rounded-full border whitespace-nowrap flex-shrink-0 ' +
              (activeCategory === cat
                ? 'bg-navy text-gold border-navy'
                : 'bg-soft-cream text-navy border-navy/20')
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Карта */}
      <div className="mx-4 mt-2 flex-1 relative rounded-3xl border border-navy/20 bg-soft-cream overflow-hidden">

        {/* схематичные улицы и река */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <g stroke="rgba(28,42,72,0.10)" strokeWidth="6" fill="none">
            <line x1="0" y1="120" x2="400" y2="90" />
            <line x1="0" y1="260" x2="400" y2="300" />
            <line x1="0" y1="420" x2="400" y2="380" />
            <line x1="90" y1="0" x2="120" y2="600" />
            <line x1="240" y1="0" x2="210" y2="600" />
          </g>
          <path
            d="M -20 40 Q 120 180 180 280 Q 240 380 200 600"
            stroke="rgba(28,42,72,0.10)"
            strokeWidth="14"
            fill="none"
          />
        </svg>

        {/* метки */}
        {filtered.map((place) => {
          const isSelected = place.id === selectedId;
          return (
            <button
              key={place.id}
              onClick={() => setSelectedId(place.id)}
              className="absolute"
              style={{
                left: `${place.x}%`,
                top: `${place.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div
                className={
                  'rounded-tl-full rounded-tr-full rounded-bl-full flex items-center justify-center shadow-lg ' +
                  (isSelected ? 'w-11 h-11' : 'w-8 h-8') + ' ' +
                  (place.type === 'navy' ? 'bg-navy' : 'bg-gold') + ' ' +
                  (isSelected ? 'ring-4 ring-gold/40' : '')
                }
                style={{ transform: 'rotate(-45deg)' }}
              >
                <span
                  className="text-cream text-xs"
                  style={{ transform: 'rotate(45deg)' }}
                >
                  {place.category === 'Учёба' && '🎓'}
                  {place.category === 'Жильё' && '🏠'}
                  {place.category === 'Документы' && '📄'}
                  {place.category === 'Жизнь' && '🍽'}
                </span>
              </div>
            </button>
          );
        })}

        {/* Карточка выбранного места */}
        {selected && (
          <div className="absolute left-3 right-3 bottom-3 bg-soft-cream border border-navy/20 rounded-2xl p-4 shadow-xl">
            <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-gold" />
            <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gold" />
            <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-gold" />
            <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-gold" />

            <span className="inline-block font-serif text-gold text-xs border border-gold rounded-full px-2 py-0.5 mb-2">
              {selected.category}
            </span>
            <h3 className="font-serif text-navy text-lg font-bold">{selected.name}</h3>
            <p className="font-serif text-navy/60 text-xs mt-0.5">{selected.address}</p>

            <div className="flex justify-between items-end mt-3 gap-3">
              <p className="font-serif text-navy/70 text-xs italic flex-1">{selected.note}</p>
              <span className="font-serif text-navy text-sm font-bold whitespace-nowrap">
                Маршрут →
              </span>
            </div>
          </div>
        )}
      </div>

      <TabBar active="loci" />

    </div>
  );
}
