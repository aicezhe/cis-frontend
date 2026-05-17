# CIS.PR Frontend

Web app for Russian-speaking students from CIS countries applying to the University of Parma. Structured relocation plan, AI chatbot powered by RAG, and Parma map in one product.

![CIS.PR welcome screen](./docs/design/01-welcome-first-visit.png)

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, React Router

## Design

[Full Figma file](https://www.figma.com/design/JVjzBULODXS2dX6oOIBMsH/CIS-PR?node-id=1-2&t=g3SphMpDNVGJPXVi-1)

17 screens designed so far: welcome flow, registration, onboarding quiz (University, Visa, Travel sections). All screens available in `docs/design/`.

## Status

Done: welcome screens, registration flow, onboarding quiz

In progress: dashboard Your Way, Laura chat interface, Parma map, profile

## Project

Built solo: product strategy, design, frontend code.

## Development

Требования: Node.js 18+ и npm.

```bash
# установить зависимости
npm install

# запустить dev-сервер (http://localhost:5173)
npm run dev

# собрать продакшен-бандл
npm run build

# превью продакшен-сборки
npm run preview

# линтер и форматирование
npm run lint
npm run format
```

Структура `src/`:

- `pages/` — страницы-роуты
- `components/` — переиспользуемые компоненты
- `lib/` — утилиты и API-клиент
- `types/` — TypeScript-типы