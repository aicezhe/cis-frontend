import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthGate } from './components/AuthGate';
import './index.css';

// После деплоя Cloudflare может отдать старый index.html, ссылающийся на уже
// удалённый хэшированный чанк (ленивая карта /map) — импорт падает и экран
// пустеет. Ловим ошибку предзагрузки и один раз жёстко перезагружаемся, чтобы
// подтянуть свежий index.html; флаг в sessionStorage защищает от цикла.
window.addEventListener('vite:preloadError', (e) => {
  if (sessionStorage.getItem('cispr_chunk_reloaded')) return;
  sessionStorage.setItem('cispr_chunk_reloaded', '1');
  e.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthGate>
        <App />
      </AuthGate>
    </BrowserRouter>
  </React.StrictMode>,
);
