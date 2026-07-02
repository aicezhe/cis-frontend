import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE, ApiError } from '../lib/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState('error');
      setErrorMsg('Ссылка не содержит токен');
      return;
    }
    fetch(`${API_BASE}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          let detail = `Ошибка ${res.status}`;
          try { const d = await res.json(); if (typeof d?.detail === 'string') detail = d.detail; } catch { /* */ }
          throw new ApiError(res.status, detail);
        }
        setState('ok');
      })
      .catch((e) => {
        setState('error');
        setErrorMsg(e instanceof ApiError ? e.message : 'Не удалось подтвердить email');
      });
  }, [params]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8">
        <p className="font-serif text-navy/60 text-base">Проверяем ссылку...</p>
      </div>
    );
  }

  if (state === 'ok') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8 text-center">
        <p className="font-serif text-gold text-sm tracking-widest mb-4">CIS.PR</p>
        <p className="font-serif text-navy text-3xl font-bold mb-3">Email подтверждён</p>
        <p className="font-serif text-navy/60 text-sm mb-10">
          Добро пожаловать. Теперь можешь пользоваться всеми функциями приложения.
        </p>
        <button
          onClick={() => navigate('/path')}
          className="font-serif text-cream bg-navy rounded-full px-10 py-3"
        >
          Открыть приложение
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-cream flex flex-col items-center justify-center px-8 text-center">
      <p className="font-serif text-navy text-2xl font-bold mb-3">Ссылка недействительна</p>
      <p className="font-serif text-navy/60 text-sm mb-8">{errorMsg}</p>
      <button
        onClick={() => navigate('/')}
        className="font-serif text-cream bg-navy rounded-full px-8 py-3"
      >
        На главную
      </button>
    </div>
  );
}
