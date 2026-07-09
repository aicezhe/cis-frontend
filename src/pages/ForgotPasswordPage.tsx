import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { API_BASE, ApiError } from '../lib/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit() {
    if (!emailOk || loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        let detail = `Ошибка ${res.status}`;
        try { const d = await res.json(); if (typeof d?.detail === 'string') detail = d.detail; } catch { /* */ }
        throw new ApiError(res.status, detail);
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить письмо');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-6">
          <Mail size={28} className="text-navy" />
        </div>
        <p className="font-serif text-navy text-2xl font-bold mb-3">Проверь почту</p>
        <p className="font-serif text-navy/60 text-sm leading-relaxed mb-10">
          Если аккаунт с адресом <span className="text-navy font-bold">{email}</span> существует —
          мы отправили на него ссылку для сброса пароля.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="font-serif text-cream bg-navy rounded-full px-8 py-3"
        >
          Вернуться к входу
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-12 pb-6">
        <button onClick={() => navigate('/login')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-2xl font-bold">Забыли пароль?</h1>
      </div>

      <div className="px-6 flex flex-col gap-4">
        <p className="font-serif text-navy/60 text-sm mb-2">
          Введи email, привязанный к аккаунту — пришлём ссылку для сброса пароля.
        </p>

        <div className="flex items-center border border-navy/30 bg-soft-cream rounded-2xl px-4 py-3">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            autoComplete="email"
            placeholder="urmail@exmpl.com"
            className="font-sans text-navy flex-1 bg-transparent outline-none text-base placeholder:text-navy/30"
          />
        </div>

        {error && (
          <p className="font-serif text-sm italic" style={{ color: '#a8332a' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!emailOk || loading}
          className={
            'font-serif text-cream text-base rounded-full py-3 mt-2 transition-colors ' +
            (emailOk && !loading ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          {loading ? '...' : 'Отправить ссылку'}
        </button>
      </div>
    </div>
  );
}
