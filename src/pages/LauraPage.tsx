import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import TabBar from '../components/TabBar';
import { ApiError, isAuthed } from '../lib/api';
import { INITIAL_GREETING, getLauraProfile, streamLaura } from '../lib/laura';
import {
  type Chat,
  appendMessages,
  createChat,
  deleteChat,
  getChatMessages,
  listChats,
  renameChat,
} from '../lib/chats';
import type { Message } from '../types/laura';

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
}

function formatChatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return d.toLocaleDateString('ru', { weekday: 'short' });
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function dbMessagesToLocal(dbMsgs: Awaited<ReturnType<typeof getChatMessages>>): Message[] {
  return dbMsgs.map((m) => ({
    id: m.id,
    from: m.role === 'user' ? 'user' : 'laura',
    text: m.content,
    ts: new Date(m.created_at).getTime(),
  }));
}

export default function LauraPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const authed = isAuthed();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const urlQHandled = useRef(false);
  const isFirstMessage = useRef(true);

  // ── авто-скролл ──
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // ── загрузка чатов при старте ──
  const loadInitialChats = useCallback(async () => {
    try {
      const list = await listChats();
      setChats(list);
      if (list.length > 0) {
        await selectChatById(list[0].id, list[0]);
      } else {
        const chat = await createChat('Новый чат');
        setChats([chat]);
        setActiveChatId(chat.id);
        setMessages([INITIAL_GREETING]);
        isFirstMessage.current = true;
      }
    } catch {
      // таблица ещё не создана или сеть — работаем без сохранения
      setMessages([INITIAL_GREETING]);
    } finally {
      setChatsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authed) return;
    loadInitialChats();
  }, [authed, loadInitialChats]);

  async function selectChatById(chatId: string, chatMeta?: Chat) {
    setActiveChatId(chatId);
    setSidebarOpen(false);
    setError(null);
    try {
      const dbMsgs = await getChatMessages(chatId);
      if (dbMsgs.length === 0) {
        setMessages([INITIAL_GREETING]);
        isFirstMessage.current = true;
      } else {
        setMessages(dbMessagesToLocal(dbMsgs));
        isFirstMessage.current = false;
      }
    } catch {
      setMessages([INITIAL_GREETING]);
    }
    // обновляем updated_at в списке чатов если есть мета
    if (chatMeta) {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, updated_at: chatMeta.updated_at } : c)),
      );
    }
  }

  async function handleNewChat() {
    try {
      const chat = await createChat('Новый чат');
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([INITIAL_GREETING]);
      isFirstMessage.current = true;
      setSidebarOpen(false);
      setError(null);
    } catch { /* ignore */ }
  }

  async function handleDeleteChat(chatId: string) {
    try {
      await deleteChat(chatId);
      const newList = chats.filter((c) => c.id !== chatId);
      setChats(newList);
      if (activeChatId === chatId) {
        if (newList.length > 0) {
          await selectChatById(newList[0].id);
        } else {
          const chat = await createChat('Новый чат');
          setChats([chat]);
          setActiveChatId(chat.id);
          setMessages([INITIAL_GREETING]);
          isFirstMessage.current = true;
        }
      }
    } catch { /* ignore */ }
  }

  // ── основная функция: отправить сообщение + стрим ответ ──
  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);

    const userMsg: Message = { id: Date.now(), from: 'user', text: trimmed, ts: Date.now() };
    const lauraMsgId = Date.now() + 1;
    const lauraMsg: Message = { id: lauraMsgId, from: 'laura', text: '', ts: Date.now() };

    const historyForRequest = [...messages, userMsg];
    setMessages([...historyForRequest, lauraMsg]);
    setInput('');
    autoGrow(inputRef.current);
    setIsStreaming(true);

    let lauraText = '';

    try {
      const profile = getLauraProfile();
      for await (const chunk of streamLaura(historyForRequest, profile)) {
        lauraText += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === lauraMsgId ? { ...m, text: m.text + chunk } : m)),
        );
      }

      // Сохраняем в БД (если чат создан)
      if (lauraText && activeChatId) {
        const cid = activeChatId;
        void appendMessages(cid, [
          { role: 'user', content: trimmed },
          { role: 'assistant', content: lauraText },
        ]).then(() => {
          // Обновляем updated_at у чата в списке
          setChats((prev) =>
            prev.map((c) =>
              c.id === cid ? { ...c, updated_at: new Date().toISOString() } : c,
            ),
          );
        });

        // Автоназвание при первом сообщении
        if (isFirstMessage.current) {
          isFirstMessage.current = false;
          const title = trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '');
          void renameChat(activeChatId, title).then((updated) => {
            setChats((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          });
        }
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
      setMessages((prev) => prev.filter((m) => m.id !== lauraMsgId || m.text.length > 0));
    } finally {
      setIsStreaming(false);
    }
  }

  // ── ?q= deep link ──
  useEffect(() => {
    if (urlQHandled.current || chatsLoading) return;
    const q = params.get('q');
    if (!q) return;
    urlQHandled.current = true;
    params.delete('q');
    setParams(params, { replace: true });
    setTimeout(() => void sendMessage(q), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatsLoading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
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
            Чтобы Лаура могла учитывать твой профиль и сохранять историю —
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
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-24 overflow-hidden">

      {/* ── Sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-30 bg-navy/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={
          'absolute top-0 left-0 bottom-0 z-40 w-72 bg-cream border-r border-navy/10 flex flex-col ' +
          'transition-transform duration-250 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-navy/10">
          <span className="font-serif text-navy font-bold text-base">Чаты</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-navy/50 hover:text-navy text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* New chat button */}
        <button
          onClick={() => void handleNewChat()}
          className="mx-3 mt-3 mb-2 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-navy/20 hover:bg-soft-cream transition-colors"
        >
          <span className="text-gold text-lg leading-none">+</span>
          <span className="font-serif text-navy text-sm">Новый чат</span>
        </button>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={
                  'group flex items-center gap-2 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ' +
                  (isActive ? 'bg-navy/10' : 'hover:bg-soft-cream')
                }
                onClick={() => void selectChatById(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className={
                    'font-serif text-sm truncate ' +
                    (isActive ? 'text-navy font-bold' : 'text-navy/80')
                  }>
                    {chat.title}
                  </p>
                  <p className="font-serif text-xs text-navy/40 mt-0.5">
                    {formatChatDate(chat.updated_at)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); void handleDeleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 text-navy/30 hover:text-red-500 transition-all text-base leading-none flex-shrink-0"
                  aria-label="Удалить чат"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-4 border-b border-navy/10 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-navy/60 hover:text-navy text-xl leading-none flex-shrink-0"
          aria-label="Открыть список чатов"
        >
          ☰
        </button>
        <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
          <span className="font-serif text-gold text-base">L</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-navy text-xl font-bold leading-tight truncate">
            {chats.find((c) => c.id === activeChatId)?.title || 'Laura'}
          </h1>
          <p className="font-serif text-gold text-xs italic">твой гид по Парме</p>
        </div>
        <button
          onClick={() => void handleNewChat()}
          className="font-serif text-navy/40 text-xs hover:text-navy/70 transition-colors flex-shrink-0"
          aria-label="Новый чат"
        >
          + новый
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-3 border rounded-2xl px-4 py-3 flex-shrink-0"
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
        {chatsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <TypingDots />
          </div>
        ) : (
          messages.map((msg) => {
            const isLaura = msg.from === 'laura';
            const isEmpty = msg.text.length === 0;
            return (
              <div
                key={msg.id}
                className={
                  'max-w-[85%] rounded-2xl px-4 py-3 ' +
                  (isLaura
                    ? 'self-start bg-soft-cream border border-navy/15'
                    : 'self-end bg-navy')
                }
              >
                {isEmpty && isLaura ? (
                  <TypingDots />
                ) : isLaura ? (
                  <LauraMarkdown text={msg.text} />
                ) : (
                  <p className="font-serif text-sm leading-relaxed whitespace-pre-wrap break-words text-cream">
                    {msg.text}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 bg-soft-cream border border-navy/20 rounded-3xl px-5 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoGrow(e.target); }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Лаура отвечает…' : 'Спроси что-нибудь…'}
            disabled={isStreaming || chatsLoading}
            rows={1}
            autoComplete="off"
            className="font-sans text-navy text-base flex-1 bg-transparent outline-none resize-none placeholder:text-navy/40 leading-snug disabled:opacity-50"
            style={{ maxHeight: '110px' }}
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={input.trim() === '' || isStreaming || chatsLoading}
            className={
              'font-serif text-base font-bold flex-shrink-0 ' +
              (input.trim() === '' || isStreaming || chatsLoading ? 'text-navy/30' : 'text-gold')
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

function LauraMarkdown({ text }: { text: string }) {
  const navigate = useNavigate();
  return (
    <div className="font-serif text-sm text-navy leading-relaxed break-words space-y-2">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-navy">{children}</strong>,
          em: ({ children }) => <em className="italic text-navy/80">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <p className="font-bold text-base">{children}</p>,
          h2: ({ children }) => <p className="font-bold">{children}</p>,
          h3: ({ children }) => <p className="font-bold">{children}</p>,
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            if (href.startsWith('/')) {
              return (
                <button type="button" onClick={() => navigate(href)} className="text-gold underline cursor-pointer">
                  {children}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noreferrer" className="text-gold underline break-all">{children}</a>;
          },
          code: ({ children }) => (
            <code className="font-mono text-xs bg-cream border border-navy/10 rounded px-1 py-0.5">{children}</code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
