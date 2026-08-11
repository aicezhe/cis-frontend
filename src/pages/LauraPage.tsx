import { useCallback, useEffect, useRef, useState } from 'react';
import { useTrackSection } from '../hooks/useTrackSection';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import TabBar from '../components/TabBar';
import { Loader } from '../components/Loader';
import { ApiError, isAuthed } from '../lib/api';
import { INITIAL_GREETING, MAX_MESSAGE_CHARS, getLauraProfile, streamLaura, fileToAttachment, type LauraAttachment } from '../lib/laura';
import { Paperclip, X, FileText, Image as ImageIcon, Pencil, Check, Menu, Plus, ArrowUp } from 'lucide-react';
import {
  type Chat,
  appendMessages,
  createChat,
  deleteChat,
  getChatMessages,
  listChats,
  renameChat,
} from '../lib/chats';
import { extractMemory } from '../lib/memory';
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
  useTrackSection('laura');
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

  const [attachment, setAttachment] = useState<LauraAttachment | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);

  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  async function handleAttachmentPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    setError(null);
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
      setError('Поддерживаются PDF и изображения (JPEG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Файл больше 15 МБ — выбери поменьше');
      return;
    }
    setAttachmentLoading(true);
    try {
      const att = await fileToAttachment(file);
      setAttachment(att);
    } catch {
      setError('Не удалось прочитать файл');
    } finally {
      setAttachmentLoading(false);
    }
  }
  const urlQHandled = useRef(false);
  const isFirstMessage = useRef(true);

  // ── авто-скролл ──
  // Во время стрима ответ растёт по кусочкам: smooth на каждый чанк дерётся сам
  // с собой и дёргает экран, поэтому пока стримит — доводим мгновенно. И не
  // тянем вниз, если человек сам отмотал вверх перечитать историю.
  const pinnedToBottom = useRef(true);

  function handleListScroll() {
    const el = listRef.current;
    if (!el) return;
    pinnedToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  useEffect(() => {
    const el = listRef.current;
    if (!el || !pinnedToBottom.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages, isStreaming]);

  // Высоту поля пересчитываем после коммита, а не в момент setInput(''):
  // на отправке в DOM ещё лежит старый текст, и поле оставалось раздутым на
  // два ряда с пустой второй строкой.
  useEffect(() => {
    autoGrow(inputRef.current);
  }, [input]);

  // ── загрузка чатов при старте ──
  const loadInitialChats = useCallback(async () => {
    try {
      const list = await listChats();
      setChats(list);
      if (list.length > 0) {
        // Приветствие показываем только у самого первого чата (когда он один
        // и пустой). Остальные новые чаты стартуют без приветствия.
        await selectChatById(list[0].id, list[0], list.length === 1);
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

  async function selectChatById(chatId: string, chatMeta?: Chat, allowGreeting = false) {
    setActiveChatId(chatId);
    setSidebarOpen(false);
    setError(null);
    try {
      const dbMsgs = await getChatMessages(chatId);
      if (dbMsgs.length === 0) {
        // Приветствие — только в первом чате; в остальных пустой чат стартует
        // с чистого листа (empty state ниже).
        setMessages(allowGreeting ? [INITIAL_GREETING] : []);
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
      // Новый чат (когда у тебя уже есть чаты) стартует без приветствия.
      setMessages([]);
      isFirstMessage.current = true;
      setSidebarOpen(false);
      setError(null);
    } catch { /* ignore */ }
  }

  function startRenaming(chat: Chat) {
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
    // ждём рендера инпута, потом фокусируемся и выделяем текст
    setTimeout(() => renameInputRef.current?.select(), 0);
  }

  async function commitRename() {
    const chatId = renamingChatId;
    const title = renameValue.trim();
    setRenamingChatId(null);
    if (!chatId) return;
    const original = chats.find((c) => c.id === chatId)?.title;
    if (!title || title === original) return;
    try {
      const updated = await renameChat(chatId, title.slice(0, 200));
      setChats((prev) => prev.map((c) => (c.id === chatId ? updated : c)));
    } catch { /* не критично — оставляем старое название */ }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); void commitRename(); }
    if (e.key === 'Escape') { e.preventDefault(); setRenamingChatId(null); }
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

    const userMsg: Message = {
      id: Date.now(),
      from: 'user',
      text: attachment ? `${trimmed}\n\n📎 ${attachment.filename}` : trimmed,
      ts: Date.now(),
    };
    const lauraMsgId = Date.now() + 1;
    const lauraMsg: Message = { id: lauraMsgId, from: 'laura', text: '', ts: Date.now() };

    const historyForRequest = [...messages, userMsg];
    const attachmentForRequest = attachment;
    setMessages([...historyForRequest, lauraMsg]);
    setInput('');
    setAttachment(null);
    autoGrow(inputRef.current);
    setIsStreaming(true);

    let lauraText = '';

    // Стрим приходит мелкими кусками — иногда по несколько слов. Рисовать на
    // каждый кусок значит гонять весь markdown-рендер десятки раз в секунду:
    // именно от этого чат подтормаживал на длинных ответах. Копим куски и
    // отдаём в стейт пачкой, чуть реже кадра.
    let pending = '';
    let flushTimer: number | null = null;

    const flush = () => {
      flushTimer = null;
      if (!pending) return;
      const chunk = pending;
      pending = '';
      setMessages((prev) =>
        prev.map((m) => (m.id === lauraMsgId ? { ...m, text: m.text + chunk } : m)),
      );
    };

    try {
      const profile = getLauraProfile();
      for await (const chunk of streamLaura(historyForRequest, profile, attachmentForRequest)) {
        lauraText += chunk;
        pending += chunk;
        if (flushTimer === null) flushTimer = window.setTimeout(flush, 60);
      }
      // хвост короче интервала иначе потерялся бы
      if (flushTimer !== null) clearTimeout(flushTimer);
      flush();

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

      // Долговременная память: выделяем факты о юзере из обмена (best-effort,
      // общая на все чаты — не зависит от того, сохранился ли чат в БД).
      if (lauraText) {
        void extractMemory(trimmed, lauraText);
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
      // на ошибке таймер мог остаться заряженным — иначе он выстрелит уже
      // после того, как реплику убрали из ленты
      if (flushTimer !== null) clearTimeout(flushTimer);
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
      <div className="relative min-h-screen max-w-md md:max-w-3xl mx-auto bg-cream flex flex-col pb-24 md:pb-12">
        <div className="px-6 pt-12 pb-4">
          <h1 className="font-serif text-navy text-2xl font-bold">
            <span
              className="font-script text-gold font-normal"
              style={{ fontSize: '1.9em', lineHeight: 0, verticalAlign: '-0.22em' }}
            >
              L
            </span>
            aura
          </h1>
          {/* хвост каллиграфической «L» спускается ниже строки — без запаса
              он наезжает на подзаголовок */}
          <p className="font-serif text-gold text-sm italic mt-3">твой гид по Парме</p>
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
  // Высота ровно в вьюпорт (h-dvh, а не min-h-screen) и overflow-hidden: иначе
  // лента растёт вниз и выталкивает строку ввода под экран. Вся прокрутка живёт
  // внутри ленты, композер остаётся последним элементом колонки — то есть
  // всегда на виду, прямо над таббаром.
  return (
    <div
      className="relative h-dvh max-w-md md:max-w-3xl mx-auto bg-cream flex flex-col overflow-hidden"
      style={{ paddingBottom: 'var(--tabbar-h)' }}
    >

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
            const isRenaming = renamingChatId === chat.id;
            return (
              <div
                key={chat.id}
                className={
                  'group flex items-center gap-2 px-3 py-2.5 rounded-2xl cursor-pointer transition-colors ' +
                  (isActive ? 'bg-navy/10' : 'hover:bg-soft-cream')
                }
                onClick={() => { if (!isRenaming) void selectChatById(chat.id); }}
              >
                <div className="flex-1 min-w-0">
                  {isRenaming ? (
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      onBlur={() => void commitRename()}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      maxLength={200}
                      className="font-serif text-navy text-sm font-bold bg-cream border border-navy/30 rounded-lg px-2 py-0.5 w-full outline-none"
                    />
                  ) : (
                    <p className={
                      'font-serif text-sm truncate ' +
                      (isActive ? 'text-navy font-bold' : 'text-navy/80')
                    }>
                      {chat.title}
                    </p>
                  )}
                  <p className="font-serif text-xs text-navy/40 mt-0.5">
                    {formatChatDate(chat.updated_at)}
                  </p>
                </div>
                {isRenaming ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); void commitRename(); }}
                    className="text-navy/50 hover:text-navy flex-shrink-0"
                    aria-label="Сохранить название"
                  >
                    <Check size={15} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); startRenaming(chat); }}
                      className="opacity-0 group-hover:opacity-100 text-navy/30 hover:text-navy transition-all flex-shrink-0"
                      aria-label="Переименовать чат"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); void handleDeleteChat(chat.id); }}
                      className="opacity-0 group-hover:opacity-100 text-navy/30 hover:text-red-500 transition-all text-base leading-none flex-shrink-0"
                      aria-label="Удалить чат"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Header ──
          Тонкая полоса вместо блока-шапки: в чате главное — сам разговор.
          Подзаголовок «твой гид по Парме» переехал на пустой экран, название
          чата идёт спокойным текстом, а «новый чат» — иконкой. */}
      <div className="px-4 pt-11 pb-2.5 flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-navy/45 hover:text-navy transition-colors flex-shrink-0 -ml-0.5"
          aria-label="Открыть список чатов"
        >
          <Menu size={19} />
        </button>
        <h1 className="font-golos text-navy/70 text-sm flex-1 min-w-0 truncate">
          {chats.find((c) => c.id === activeChatId)?.title || 'Laura'}
        </h1>
        <button
          onClick={() => void handleNewChat()}
          className="text-navy/45 hover:text-navy transition-colors flex-shrink-0"
          aria-label="Новый чат"
        >
          <Plus size={19} />
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
        onScroll={handleListScroll}
        className="flex-1 min-h-0 px-5 pt-4 pb-6 flex flex-col gap-6 overflow-y-auto no-scrollbar"
      >
        {chatsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size={44} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-2">
            {/* Приветствие: текст ровный, фирменным serif; каллиграфическая —
                только заглавная «L» (как в логотипе). */}
            <p className="font-serif text-navy text-2xl text-center max-w-[300px]" style={{ lineHeight: 1.4 }}>
              <span
                className="font-script text-gold font-normal"
                style={{ fontSize: '2.4em', lineHeight: 0, verticalAlign: '-0.3em' }}
              >
                L
              </span>
              aura готова тебе помочь!
            </p>
            <p className="font-serif text-gold text-sm italic">твой гид по Парме</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isLaura = msg.from === 'laura';
            const isEmpty = msg.text.length === 0;
            // Лаура говорит во всю ширину экрана, без плашки — её ответ это не
            // реплика-пузырь, а «страница» текста. Реплики юзера остаются
            // выключенным вправо navy-пузырём, чтобы визуально отделить свой
            // голос от голоса ассистента (паттерн ChatGPT/Claude).
            if (isLaura) {
              return (
                <div key={msg.id} className="self-stretch w-full msg-in">
                  {isEmpty ? (
                    <Loader size={26} />
                  ) : (
                    <LauraMarkdown
                      text={msg.text}
                      streaming={isStreaming && msg.id === messages[messages.length - 1]?.id}
                    />
                  )}
                </div>
              );
            }
            return (
              <div
                key={msg.id}
                className="self-end max-w-[82%] rounded-3xl rounded-br-lg px-4 py-2.5 bg-navy msg-in"
              >
                <p className="font-golos text-cream text-[15px] leading-[1.5] whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Input — последний элемент колонки, поэтому всегда виден над таббаром */}
      <div className="px-4 pt-1 pb-3 flex-shrink-0">
        {attachment && (
          <div className="flex items-center gap-2 bg-soft-cream border border-navy/20 rounded-2xl px-4 py-2 mb-2">
            {attachment.media_type === 'application/pdf' ? (
              <FileText size={16} className="text-navy/60 flex-shrink-0" />
            ) : (
              <ImageIcon size={16} className="text-navy/60 flex-shrink-0" />
            )}
            <span className="font-serif text-navy text-xs truncate flex-1">{attachment.filename}</span>
            <button
              onClick={() => setAttachment(null)}
              className="text-navy/40 hover:text-navy flex-shrink-0"
              aria-label="Убрать файл"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-soft-cream border border-navy/15 rounded-3xl pl-4 pr-2 py-2 shadow-[0_1px_8px_rgba(28,42,72,0.05)]">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
            onChange={handleAttachmentPick}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming || chatsLoading || attachmentLoading}
            className="text-navy/40 hover:text-navy transition-colors flex-shrink-0 disabled:opacity-40 mb-1.5"
            aria-label="Прикрепить файл"
          >
            <Paperclip size={17} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoGrow(e.target); }}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Лаура отвечает…' : attachmentLoading ? 'Загружаю файл…' : 'Спроси что-нибудь…'}
            disabled={isStreaming || chatsLoading}
            rows={1}
            autoComplete="off"
            // Столько же принимает бэкенд; без потолка здесь длинный вопрос
            // отправлялся бы и возвращался 422 уже после нажатия «отправить».
            // Обрезать молча — тоже плохо, поэтому именно maxLength: браузер
            // просто перестаёт принимать ввод, и это видно сразу.
            maxLength={MAX_MESSAGE_CHARS}
            // no-scrollbar: autoGrow выставляет height ровно в scrollHeight, и на
            // округлении вылезала нативная полоса прокрутки — тонкая вертикальная
            // чёрточка у правого края поля.
            className="no-scrollbar font-sans text-navy text-[15px] flex-1 bg-transparent outline-none resize-none placeholder:text-navy/35 leading-relaxed disabled:opacity-50 py-1.5"
            style={{ maxHeight: '110px' }}
          />
          {/* Кнопка отправки «наливается» золотом, когда есть что отправить —
              это единственный акцент во всей строке, поэтому она круглая. */}
          <button
            onClick={() => void sendMessage(input)}
            disabled={input.trim() === '' || isStreaming || chatsLoading}
            className={
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ' +
              (input.trim() === '' || isStreaming || chatsLoading
                ? 'bg-navy/10 text-navy/30'
                : 'bg-gold text-cream scale-100 active:scale-90')
            }
            aria-label="Отправить"
          >
            <ArrowUp size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <TabBar active="laura" />
    </div>
  );
}

// Типографика ответа намеренно «лёгкая»: крупнее кегль, больше интерлиньяж и
// воздуха между блоками, полужирный вместо жирного. Ответ Лауры читают с
// телефона по дороге в квестуру — плотный текст в рамках здесь не работает.
function LauraMarkdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      className={'font-golos text-[15px] text-navy/90 break-words space-y-3' + (streaming ? ' streaming' : '')}
      style={{ lineHeight: 1.6 }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p>{children}</p>,
          // semibold, а не bold: жирный выделяет, только пока его мало
          strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
          em: ({ children }) => <em className="italic text-navy/70">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 marker:text-gold/70">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 marker:text-gold/70">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          // Заголовки внутри реплики — это всё ещё речь, а не документ:
          // отделяем воздухом сверху, а не размером и жирностью.
          h1: ({ children }) => <p className="font-semibold text-navy pt-1">{children}</p>,
          h2: ({ children }) => <p className="font-semibold text-navy pt-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-navy pt-1">{children}</p>,
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

