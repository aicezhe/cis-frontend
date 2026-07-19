import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { isAuthed } from '../lib/api';
import { listMemory, deleteMemory, clearMemory, type MemoryItem } from '../lib/memory';

export default function MemoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listMemory()
      .then((m) => { if (!cancelled) setItems(m); })
      .catch(() => { if (!cancelled) setError('Не удалось загрузить память'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function handleDelete(id: string) {
    const prev = items;
    setItems((xs) => xs.filter((x) => x.id !== id)); // оптимистично
    try {
      await deleteMemory(id);
    } catch {
      setItems(prev); // откат
      setError('Не удалось удалить факт');
    }
  }

  async function handleClear() {
    if (!confirm('Очистить всю память Лауры о тебе? Это нельзя отменить.')) return;
    const prev = items;
    setItems([]);
    try {
      await clearMemory();
    } catch {
      setItems(prev);
      setError('Не удалось очистить память');
    }
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-10">
      <div className="flex items-center gap-4 px-6 pt-12 pb-4">
        <button onClick={() => navigate('/settings')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-3xl font-bold">Память Лауры</h1>
      </div>

      <p className="font-serif text-navy/70 text-sm leading-relaxed px-6 mt-1">
        Лаура запоминает ключевые факты о тебе из разговоров (страна, программа,
        этап, что уже сделано) и учитывает их во всех чатах. Здесь можно
        посмотреть и удалить то, что она помнит.
      </p>

      {error && (
        <div
          className="mx-6 mt-4 border rounded-2xl px-4 py-3"
          style={{ backgroundColor: 'rgba(168, 51, 42, 0.08)', borderColor: 'rgba(168, 51, 42, 0.4)' }}
        >
          <p className="font-serif text-sm" style={{ color: '#a8332a' }}>{error}</p>
        </div>
      )}

      {loading ? (
        <p className="font-serif text-navy/50 italic px-6 mt-8">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-10 mt-10">
          <p className="font-serif text-navy/60 text-base leading-relaxed">
            Пока пусто. Лаура запомнит факты о тебе по ходу разговоров.
          </p>
        </div>
      ) : (
        <>
          <div className="mx-6 mt-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={
                  'flex items-start gap-3 px-5 py-4 ' +
                  (i < items.length - 1 ? 'border-b border-navy/10' : '')
                }
              >
                <span className="text-gold mt-1 text-xs flex-shrink-0">◆</span>
                <p className="font-serif text-navy text-sm leading-relaxed flex-1">{item.content}</p>
                <button
                  onClick={() => void handleDelete(item.id)}
                  className="text-navy/30 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                  aria-label="Удалить факт"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => void handleClear()}
            className="mx-6 mt-4 font-serif text-sm underline self-start"
            style={{ color: '#a8332a' }}
          >
            Очистить всю память
          </button>
        </>
      )}
    </div>
  );
}
