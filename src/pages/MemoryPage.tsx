import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { isAuthed } from '../lib/api';
import { getLauraProfile } from '../lib/laura';
import { listMemory, deleteMemory, clearMemory, type MemoryItem } from '../lib/memory';

const COUNTRY_LABELS: Record<string, string> = { ru: 'Россия', ua: 'Украина', by: 'Беларусь', kz: 'Казахстан' };
const PROGRAM_LABELS: Record<string, string> = {
  foundation: 'Foundation Year',
  bachelor: 'Бакалавриат',
  master: 'Магистратура',
};
const STAGE_LABELS: Record<string, string> = {
  uni: 'выбор программы / поступление',
  visa: 'оформление визы',
  travel: 'переезд',
  parma: 'уже в Парме',
};

// Базовые данные из профиля — Лаура получает их в каждом чате автоматически.
// Здесь показываем их read-only, чтобы экран памяти честно отражал, что она
// знает. В user_memory их не дублируем: профиль — источник истины (изменится
// в Настройках — тут сразу обновится).
function profileFacts(): { label: string; value: string }[] {
  const p = getLauraProfile();
  const rows: { label: string; value: string }[] = [];
  if (p.nickname) rows.push({ label: 'Имя/ник', value: p.nickname });
  if (p.age) rows.push({ label: 'Возраст', value: String(p.age) });
  if (p.country) rows.push({ label: 'Страна', value: COUNTRY_LABELS[p.country] ?? p.country });
  if (p.city) rows.push({ label: 'Город', value: p.city });
  if (p.program) rows.push({ label: 'Программа', value: PROGRAM_LABELS[p.program] ?? p.program });
  if (p.course_name) rows.push({ label: 'Курс', value: p.course_name });
  if (p.passed_quiz) rows.push({ label: 'Этап пути', value: STAGE_LABELS[p.passed_quiz] ?? p.passed_quiz });
  if (p.home_address) rows.push({ label: 'Адрес в Парме', value: p.home_address });
  return rows;
}

export default function MemoryPage() {
  const navigate = useNavigate();
  const profile = profileFacts();
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
        Лаура знает базовое из твоего профиля и запоминает новые факты из
        разговоров — всё это она учитывает в каждом чате. Здесь видно и то,
        и другое; факты из разговоров можно удалять.
      </p>

      {/* Базовое из профиля — read-only, всегда актуально (источник — Настройки) */}
      {profile.length > 0 && (
        <>
          <h3 className="font-serif text-gold text-sm italic px-6 mt-6 mb-2">Из профиля</h3>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
            {profile.map((row, i) => (
              <div
                key={row.label}
                className={
                  'flex items-baseline justify-between gap-3 px-5 py-3 ' +
                  (i < profile.length - 1 ? 'border-b border-navy/10' : '')
                }
              >
                <span className="font-serif text-navy/60 text-sm flex-shrink-0">{row.label}</span>
                <span className="font-serif text-navy text-sm font-bold text-right truncate">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="font-serif text-navy/40 text-xs italic px-6 mt-2">
            Меняется в Настройках — Лаура всегда видит актуальное.
          </p>
        </>
      )}

      {error && (
        <div
          className="mx-6 mt-4 border rounded-2xl px-4 py-3"
          style={{ backgroundColor: 'rgba(168, 51, 42, 0.08)', borderColor: 'rgba(168, 51, 42, 0.4)' }}
        >
          <p className="font-serif text-sm" style={{ color: '#a8332a' }}>{error}</p>
        </div>
      )}

      <h3 className="font-serif text-gold text-sm italic px-6 mt-6 mb-2">Из разговоров</h3>
      {loading ? (
        <p className="font-serif text-navy/50 italic px-6 mt-2">Загрузка…</p>
      ) : items.length === 0 ? (
        <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl px-5 py-4">
          <p className="font-serif text-navy/60 text-sm leading-relaxed">
            Пока пусто. Новые факты появятся сами по ходу общения с Лаурой —
            например, «уже получил(а) codice fiscale» или «нужна стипендия ER.GO».
          </p>
        </div>
      ) : (
        <>
          <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
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
