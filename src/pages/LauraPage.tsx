import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { ApiError, isAuthed } from '../lib/api';
import {
  INITIAL_GREETING,
  clearHistory,
  getLauraProfile,
  loadHistory,
  saveHistory,
  streamLaura,
} from '../lib/laura';
import type { Message } from '../types/laura';

// Растущий textarea: пересчитываем высоту по контенту, лимит 5 строк.
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  const max = 110; // ~5 строк
  el.style.height = `${Math.min(el.scrollHeight, max)}px`;
}

export default function LauraPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const authed = isAuthed();

  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const urlQHandled = useRef(false);

  // ── localStorage sync ──
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // ── авто-скролл вниз при новых сообщениях ──
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // ── основная функция: отправить сообщение + стрим ответ ──
  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);

    const userMsg: Message = {
      id: Date.now(),
      from: 'user',
      text: trimmed,
      ts: Date.now(),
    };
    const lauraMsgId = Date.now() + 1;
    const lauraMsg: Message = {
      id: lauraMsgId,
      from: 'laura',
      text: '', // будем дописывать чанки сюда
      ts: Date.now(),
    };

    const historyForRequest = [...messages, userMsg];
    setMessages([...historyForRequest, lauraMsg]);
    setInput('');
    autoGrow(inputRef.current);
    setIsStreaming(true);

    try {
      const profile = getLauraProfile();
      for await (const chunk of streamLaura(historyForRequest, profile)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === lauraMsgId ? { ...m, text: m.text + chunk } : m)),
        );
      }
    } catch (e) {
      const apiErr = e as ApiError;
      const msg =
        apiErr?.status === 401
          ? 'Войди в аккаунт, чтобы общаться с Лаурой.'
          : apiErr?.status === 429
            ? apiErr.message
            : apiErr?.status === 503
              ? 'Лаура временно недоступна. Попробуй позже.'
              : apiErr?.message || 'Что-то пошло не так. Попробуй ещё раз.';
      setError(msg);
      // удаляем пустой placeholder Лауры, иначе будет «пустой пузырь»
      setMessages((prev) => prev.filter((m) => m.id !== lauraMsgId || m.text.length > 0));
    } finally {
      setIsStreaming(false);
    }
  }

  // ── обработка ?q= (deep link «Спросить Лауру про X») ──
  useEffect(() => {
    if (urlQHandled.current) return;
    const q = params.get('q');
    if (!q) return;
    urlQHandled.current = true;
    // удаляем параметр чтобы при F5 не отправлялось повторно
    params.delete('q');
    setParams(params, { replace: true });
    setTimeout(() => void sendMessage(q), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter — отправить, Shift+Enter — перенос строки (как в ChatGPT)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  function doClear() {
    clearHistory();
    setMessages([INITIAL_GREETING]);
    setConfirmClear(false);
    setError(null);
  }

  // ── login-стена ──
  if (!authed) {
    return (
      <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-24">
        <div className="px-6 pt-12 pb-4 border-b border-navy/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center">
              <span className="font-serif text-gold text-xl">L</span>
            </div>
            <div>
              <h1 className="font-serif text-navy text-2xl font-bold">Laura</h1>
              <p className="font-serif text-gold text-xs italic">твой гид по Парме</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <p className="font-serif text-navy text-base leading-relaxed mb-6">
            Чтобы Лаура могла учитывать твой профиль и сохранять контекст —
            войди в аккаунт.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="font-serif text-cream bg-navy rounded-full px-8 py-3"
          >
            Войти
          </button>
        </div>
        <TabBar active="laura" />
      </div>
    );
  }

  // ── основной экран ──
  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-navy/10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-gold text-xl">L</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-navy text-2xl font-bold leading-tight">Laura</h1>
          <p className="font-serif text-gold text-xs italic">твой гид по Парме</p>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="font-serif text-navy/40 text-xs hover:text-navy/70 transition-colors"
          aria-label="Очистить чат"
        >
          очистить
        </button>
      </div>

      {/* Подтверждение очистки */}
      {confirmClear && (
        <div className="mx-4 mt-3 bg-gold/10 border border-gold/60 rounded-2xl px-4 py-3 flex flex-col gap-2">
          <p className="font-serif text-navy text-sm">Удалить всю историю чата с Лаурой?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmClear(false)}
              className="flex-1 font-serif text-navy border border-navy/30 rounded-full py-2 text-sm"
            >
              Отмена
            </button>
            <button
              onClick={doClear}
              className="flex-1 font-serif text-cream bg-navy rounded-full py-2 text-sm"
            >
              Удалить
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-3 border rounded-2xl px-4 py-3"
          style={{ backgroundColor: 'rgba(168, 51, 42, 0.08)', borderColor: 'rgba(168, 51, 42, 0.4)' }}
        >
          <p className="font-serif text-sm" style={{ color: '#a8332a' }}>{error}</p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto no-scrollbar"
      >
        {messages.map((msg) => {
          const isLaura = msg.from === 'laura';
          const isEmpty = msg.text.length === 0;
          const bubbleClass =
            'max-w-[80%] rounded-2xl px-4 py-3 ' +
            (isLaura
              ? 'self-start bg-soft-cream border border-navy/15'
              : 'self-end bg-navy');
          const textClass =
            'font-serif text-sm leading-relaxed whitespace-pre-wrap break-words ' +
            (isLaura ? 'text-navy' : 'text-cream');

          return (
            <div key={msg.id} className={bubbleClass}>
              {isEmpty && isLaura ? (
                <TypingDots />
              ) : (
                <p className={textClass}>{msg.text}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-2 bg-soft-cream border border-navy/20 rounded-3xl px-5 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoGrow(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Лаура отвечает…' : 'Спроси что-нибудь…'}
            disabled={isStreaming}
            rows={1}
            autoComplete="off"
            className="font-sans text-navy text-base flex-1 bg-transparent outline-none resize-none placeholder:text-navy/40 leading-snug disabled:opacity-50"
            style={{ maxHeight: '110px' }}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={input.trim() === '' || isStreaming}
            className={
              'font-serif text-base font-bold flex-shrink-0 ' +
              (input.trim() === '' || isStreaming ? 'text-navy/30' : 'text-gold')
            }
            aria-label="Отправить"
          >
            ↑
          </button>
        </div>
      </div>

      <TabBar active="laura" />
    </div>
  );
}

// ── вспомогательный компонент: анимированные точки «Лаура печатает» ──
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
