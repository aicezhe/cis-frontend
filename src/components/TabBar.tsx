import { useNavigate } from 'react-router-dom';
import iconLaura from '../assets/iconLaura.svg';
import iconPath from '../assets/iconPath.svg';
import iconLoci from '../assets/iconLoci.svg';

// какой таб сейчас активен — приходит снаружи
type TabBarProps = {
  active: 'laura' | 'path' | 'loci';
};

const tabs = [
  { id: 'laura', label: 'LAURA', icon: iconLaura, route: '/laura' },
  { id: 'path', label: 'PATH', icon: iconPath, route: '/path' },
  { id: 'loci', label: 'LOCI', icon: iconLoci, route: '/map' },
];

export default function TabBar({ active }: TabBarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-cream border-t border-navy/15 flex justify-around py-3 z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.route)}
          className="flex flex-col items-center gap-1"
        >
          {tab.id === 'laura' ? (
            /* Лаура — фирменная каллиграфическая «L» вместо SVG-паттерна */
            <span
              className={
                'w-7 h-7 rounded-lg bg-navy flex items-center justify-center ' +
                (active === tab.id ? 'opacity-100' : 'opacity-40')
              }
            >
              <span className="font-script text-gold text-lg leading-none" style={{ marginTop: '-0.15em' }}>L</span>
            </span>
          ) : (
            <img
              src={tab.icon}
              alt={tab.label}
              className={'w-7 h-7 ' + (active === tab.id ? 'opacity-100' : 'opacity-40')}
            />
          )}
          <span
            className={
              'font-serif text-xs ' +
              (active === tab.id ? 'text-navy' : 'text-navy/40')
            }
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}