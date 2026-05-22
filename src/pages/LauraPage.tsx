import { useState } from 'react';
import TabBar from '../components/TabBar';

type Message = {
  id: number;
  from: 'laura' | 'user';
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    from: 'laura',
    text: 'Ciao! Я Laura. Знаю всё про переезд в Парму — документы, визу, университет, жильё. Спроси что угодно.',
  },
];

export default function LauraPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (input.trim() === '') return;

    const userMsg: Message = {
      id: Date.now(),
      from: 'user',
      text: input,
    };

    const lauraReply: Message = {
      id: Date.now() + 1,
      from: 'laura',
      text: 'Скоро смогу отвечать по-настоящему. Сейчас Анна доделывает мой мозг.',
    };

    setMessages([...messages, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [...prev, lauraReply]);
    }, 700);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  }

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

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto no-scrollbar">
        {messages.map((msg) => {
          const isLaura = msg.from === 'laura';
          const bubbleClass =
            'max-w-[80%] rounded-2xl px-4 py-3 ' +
            (isLaura
              ? 'self-start bg-soft-cream border border-navy/15'
              : 'self-end bg-navy');
          const textClass =
            'font-serif text-sm leading-snug ' +
            (isLaura ? 'text-navy' : 'text-cream');

          return (
            <div key={msg.id} className={bubbleClass}>
              <p className={textClass}>{msg.text}</p>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 bg-soft-cream border border-navy/20 rounded-full px-5 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спроси что-нибудь..."
            autoComplete="off"
            className="font-sans text-navy text-base flex-1 bg-transparent outline-none placeholder:text-navy/40"
          />
          <button
            onClick={sendMessage}
            disabled={input.trim() === ''}
            className={
              'font-serif text-sm font-bold ' +
              (input.trim() === '' ? 'text-navy/30' : 'text-gold')
            }
          >
            ↑
          </button>
        </div>
      </div>

      <TabBar active="laura" />

    </div>
  );
}