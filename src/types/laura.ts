// Контракт чат-сообщений между UI, localStorage и бэкендом Лауры.

export type MessageRole = 'user' | 'laura';

export type Message = {
  id: number;
  from: MessageRole;
  text: string;
  ts?: number;
};

// Профиль юзера, который мы шлём вместе с каждым запросом для контекстных ответов.
// Бэк сольёт его с данными из БД (DB-приоритет, фронт-override для последних правок).
export type LauraProfile = {
  nickname?: string;
  age?: number;
  country?: string;
  city?: string;
  program?: string;
  course_name?: string;
  passed_quiz?: string;
  home_address?: string;
  gender?: string;
};
