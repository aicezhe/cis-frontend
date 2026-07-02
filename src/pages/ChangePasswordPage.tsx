import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE, ApiError, getToken } from '../lib/api';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const valid = current.length >= 1 && next.length >= 8 && next === confirm;

  async function handleSubmit() {
    if (!valid || loading) return;
    setError('');
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      if (!res.ok) {
        let detail = `Ошибка ${res.status}`;
        try { const d = await res.json(); if (typeof d?.detail === 'string') detail = d.detail; } catch { /* */ }
        throw new ApiError(res.status, detail);
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось сменить пароль');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8">
        <p className="font-serif text-navy text-2xl font-bold mb-3">Пароль изменён</p>
        <p className="font-serif text-navy/60 text-sm text-center mb-8">
          Новый пароль сохранён. Используй его при следующем входе.
        </p>
        <button
          onClick={() => navigate('/settings')}
          className="font-serif text-cream bg-navy rounded-full px-8 py-3"
        >
          Готово
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button onClick={() => navigate('/settings')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Смена пароля</h1>
      </div>

      <div className="px-6 flex flex-col gap-4">

        <div>
          <p className="font-serif text-navy/60 text-xs mb-1.5">Текущий пароль</p>
          <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
            <input
              type={show ? 'text' : 'password'}
              value={current}
              onChange={(e) => { setCurrent(e.target.value); setError(''); }}
              autoComplete="current-password"
              className="font-sans text-navy flex-1 bg-transparent outline-none text-base"
            />
            <button onClick={() => setShow(!show)} className="text-navy/50">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <p className="font-serif text-navy/60 text-xs mb-1.5">Новый пароль</p>
          <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
            <input
              type={show ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              placeholder="минимум 8 символов"
              className="font-sans text-navy flex-1 bg-transparent outline-none text-base placeholder:text-navy/30"
            />
          </div>
          {next.length > 0 && next.length < 8 && (
            <p className="font-serif text-gold text-xs italic mt-1">Минимум 8 символов</p>
          )}
        </div>

        <div>
          <p className="font-serif text-navy/60 text-xs mb-1.5">Повтори новый пароль</p>
          <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="font-sans text-navy flex-1 bg-transparent outline-none text-base"
            />
          </div>
          {next.length >= 8 && confirm.length > 0 && next !== confirm && (
            <p className="font-serif text-gold text-xs italic mt-1">Пароли не совпадают</p>
          )}
        </div>

        {error && (
          <p className="font-serif text-sm italic" style={{ color: '#a8332a' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!valid || loading}
          className={
            'font-serif text-cream text-base rounded-full py-3 mt-2 transition-colors ' +
            (valid && !loading ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          {loading ? '...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
