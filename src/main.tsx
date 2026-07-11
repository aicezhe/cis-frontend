import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthGate } from './components/AuthGate';
import { PageTransitionProvider } from './components/PageTransition';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthGate>
        <PageTransitionProvider>
          <App />
        </PageTransitionProvider>
      </AuthGate>
    </BrowserRouter>
  </React.StrictMode>,
);
