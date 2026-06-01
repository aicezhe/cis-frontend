import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, isAuthed } from '../lib/api';
import { Price } from '../components/Price';
import type {
  Gender,
  ResidenceStatus,
  ScholarshipComputation,
  User,
} from '../types/api';

const RESIDENCE_OPTIONS: { value: ResidenceStatus; label: string; hint: string }[] = [
  { value: 'fuori_sede', label: 'Fuori sede', hint: 'снимаю жильё в Парме' },
  { value: 'pendolare', label: 'Pendolare', hint: 'езжу каждый день' },
  { value: 'in_sede', label: 'In sede', hint: 'прописан в Парме' },
];

function asNum(v: unknown): number | null {
  return typeof v === 'number' ? v : null;
}

export default function ScholarshipPage() {
  const navigate = useNavigate();
  const authed = isAuthed();

  const [comp, setComp] = useState<ScholarshipComputation | null>(null);
  const [generalData, setGeneralData] = useState<Record<string, unknown> | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [residence, setResidence] = useState<ResidenceStatus>('fuori_sede');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  async function loadComputation() {
    const c = await api.myScholarship();
    setComp(c);
    setResidence((c.residence_status as ResidenceStatus) || 'fuori_sede');
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (authed) {
          let me: User | null = null;
          try {
            me = await api.me();
          } catch {
            me = null;
          }
          if (!cancelled && me) setGender((me.gender as Gender) || null);
          await loadComputation();
        } else {
          const s = await api.scholarship();
          if (!cancelled) setGeneralData(s.data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Не удалось загрузить данные');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patchAndRecompute(patch: { residence_status?: ResidenceStatus; gender?: Gender }) {
    if (!authed || updating) return;
    setUpdating(true);
    setError('');
    try {
      await api.updateProfile(patch);
      await loadComputation();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось обновить профиль');
    } finally {
      setUpdating(false);
    }
  }

  function pickResidence(value: ResidenceStatus) {
    setResidence(value);
    patchAndRecompute({ residence_status: value });
  }

  function pickGender(value: Gender) {
    setGender(value);
    patchAndRecompute({ gender: value });
  }

  // источник bando-данных: из расчёта (authed) или из общего эндпоинта
  const data = (comp?.full_data || generalData || {}) as Record<string, any>;
  const deadlines = (data.deadlines_2025_26 || {}) as Record<string, string>;
  const howTo = (data.how_to_apply_ru || []) as string[];
  const benefits = (data.benefits || []) as string[];
  const isee = asNum(data.isee_threshold_eur);

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-16">

      <div className="px-6 pt-12">
        <button onClick={() => navigate(-1)} className="text-navy text-2xl">←</button>
      </div>

      <div className="px-6 mt-2">
        <h1 className="font-serif text-navy text-3xl font-bold">Стипендия ER.GO</h1>
        <p className="font-serif text-gold text-sm italic mt-1">
          {data.academic_year ? `Бандо ${data.academic_year}` : 'право на учёбу в Эмилии-Романье'}
        </p>
      </div>

      {loading && (
        <div className="px-6 mt-8 flex flex-col gap-4">
          <div className="h-28 rounded-3xl bg-navy/10 animate-pulse" />
          <div className="h-20 rounded-2xl bg-navy/10 animate-pulse" />
        </div>
      )}

      {error && !loading && (
        <p className="font-serif text-sm italic px-6 mt-6" style={{ color: '#a8332a' }}>
          {error}
        </p>
      )}

      {!loading && (
        <>
          {/* Расчёт суммы (только для залогиненных) */}
          {authed && comp && (
            <div className="mx-6 mt-6 relative bg-navy rounded-3xl p-6">
              <span className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-gold" />
              <span className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-gold" />
              <span className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-gold" />
              <span className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-gold" />

              <p className="font-serif text-gold text-sm italic">Твоя оценка</p>
              <p className="font-serif text-cream text-4xl mt-1">
                <Price eur={comp.total_eur} />
              </p>
              <p className="font-serif text-cream/70 text-xs mt-1">
                база <Price eur={comp.base_eur} />
                {comp.applicable_bonuses.map((b) => ` + ${b.modifier} (${b.title_ru})`).join('')}
              </p>
              {comp.applicable_bonuses.length > 0 && (
                <div className="mt-3 flex flex-col gap-1">
                  {comp.applicable_bonuses.map((b) => (
                    <p key={b.code} className="font-serif text-gold text-xs">
                      + <Price eur={b.amount_eur} /> — {b.title_ru}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Логин-CTA для гостя */}
          {!authed && (
            <div className="mx-6 mt-6 bg-soft-cream border border-navy/20 rounded-2xl p-5">
              <p className="font-serif text-navy text-sm">
                Войди в аккаунт, чтобы рассчитать сумму под твой профиль (статус проживания, STEM-бонус).
              </p>
              <button
                onClick={() => navigate('/login')}
                className="font-serif text-cream bg-navy rounded-full px-6 py-2 mt-3 text-sm"
              >
                Войти
              </button>
            </div>
          )}

          {/* Профиль для расчёта */}
          {authed && (
            <>
              <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">Статус проживания</h3>
              <div className="mx-6 grid grid-cols-3 gap-2">
                {RESIDENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => pickResidence(opt.value)}
                    disabled={updating}
                    className={
                      'rounded-2xl border px-2 py-3 text-center ' +
                      (residence === opt.value
                        ? 'bg-navy border-navy text-gold'
                        : 'bg-soft-cream border-navy/20 text-navy')
                    }
                  >
                    <span className="font-serif text-sm block">{opt.label}</span>
                    <span className={
                      'font-serif text-[10px] leading-tight block mt-0.5 ' +
                      (residence === opt.value ? 'text-cream/70' : 'text-navy/50')
                    }>
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>

              <h3 className="font-serif text-gold text-sm italic px-6 mt-6 mb-2">Пол (для STEM-бонуса)</h3>
              <div className="mx-6 grid grid-cols-2 gap-2">
                {([['f', 'Женский'], ['m', 'Мужской']] as [Gender, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => pickGender(val)}
                    disabled={updating}
                    className={
                      'rounded-2xl border px-2 py-3 font-serif text-sm ' +
                      (gender === val
                        ? 'bg-navy border-navy text-gold'
                        : 'bg-soft-cream border-navy/20 text-navy')
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="font-serif text-navy/50 text-xs italic px-6 mt-2">
                Бонус +20% — девушкам на STEM-программе. Бонусы за низкий ISEE и инвалидность зависят от документов и не считаются автоматически.
              </p>
            </>
          )}

          {/* Порог ISEE */}
          {isee != null && (
            <div className="mx-6 mt-8 bg-soft-cream border border-navy/20 rounded-2xl p-4">
              <p className="font-serif text-navy text-sm">
                Порог ISEE: <span className="font-bold"><Price eur={isee} /></span>
              </p>
              {typeof data.isee_note_ru === 'string' && (
                <p className="font-serif text-navy/60 text-xs mt-1">{data.isee_note_ru}</p>
              )}
            </div>
          )}

          {/* Что даёт */}
          {benefits.length > 0 && (
            <>
              <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">Что даёт стипендия</h3>
              <ul className="mx-6 flex flex-col gap-2">
                {benefits.map((b, i) => (
                  <li key={i} className="font-serif text-navy text-sm flex gap-2">
                    <span className="text-gold">•</span>{b}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Как подать */}
          {howTo.length > 0 && (
            <>
              <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">Как подать</h3>
              <ol className="mx-6 flex flex-col gap-2">
                {howTo.map((step, i) => (
                  <li key={i} className="font-serif text-navy text-sm flex gap-2">
                    <span className="text-gold font-bold">{i + 1}.</span>{step}
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Дедлайны */}
          {Object.keys(deadlines).length > 0 && (
            <>
              <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">Дедлайны</h3>
              <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">
                {Object.entries(deadlines).map(([k, v], i, arr) => (
                  <div
                    key={k}
                    className={
                      'flex justify-between items-baseline gap-3 px-4 py-3 ' +
                      (i < arr.length - 1 ? 'border-b border-navy/10' : '')
                    }
                  >
                    <span className="font-serif text-navy/70 text-xs">{k}</span>
                    <span className="font-serif text-navy text-sm flex-shrink-0">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {typeof data.disclaimer_ru === 'string' && (
            <p className="font-serif text-navy/50 text-xs italic px-6 mt-8">{data.disclaimer_ru}</p>
          )}
        </>
      )}

    </div>
  );
}
