import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { API_BASE, ApiError, getToken } from '../lib/api';

export default function ChangeEmailPage() {
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim());
  const valid = emailOk && password.length >= 1;

  async function handleSubmit() {
    if (!valid || loading) return;
    setError('');
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/auth/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ current_password: password, new_email: newEmail.trim() }),
      });
      if (!res.ok) {
        let detail = `Ошибка ${res.status}`;
        try { const d = await res.json(); if (typeof d?.detail === 'string') detail = d.detail; } catch { /* */ }
        throw new ApiError(res.status, detail);
      }
      localStorage.setItem('cispr_email', newEmail.trim());
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось изменить почту');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col items-center justify-center px-8">
        <p className="font-serif text-navy text-2xl font-bold mb-3">Email изменён</p>
        <p className="font-serif text-navy/60 text-sm text-center mb-8">
          На <span className="text-navy font-bold">{newEmail}</span> отправлен код подтверждения.
          Подтверди его сейчас — без этого при следующем входе понадобится ввести код заново.
        </p>
        <button
          onClick={() => navigate('/verify-code', { state: { email: newEmail.trim(), mode: 'login' } })}
          className="font-serif text-cream bg-navy rounded-full px-8 py-3"
        >
          Ввести код
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="font-serif text-navy/60 text-sm underline mt-4"
        >
          Позже
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md md:max-w-2xl mx-auto bg-cream flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button onClick={() => navigate('/settings')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Изменить почту</h1>
      </div>

      <div className="px-6 flex flex-col gap-4">

        <div>
          <p className="font-serif text-navy/60 text-xs mb-1.5">Новый email</p>
          <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setError(''); }}
              autoComplete="email"
              placeholder="nova@mail.com"
              className="font-sans text-navy flex-1 bg-transparent outline-none text-base placeholder:text-navy/30"
            />
          </div>
        </div>

        <div>
          <p className="font-serif text-navy/60 text-xs mb-1.5">Текущий пароль для подтверждения</p>
          <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoComplete="current-password"
              className="font-sans text-navy flex-1 bg-transparent outline-none text-base"
            />
            <button onClick={() => setShow(!show)} className="text-navy/50">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
