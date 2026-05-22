import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [geolocation, setGeolocation] = useState(false);
  const [language, setLanguage] = useState('Русский');

  const nickname = localStorage.getItem('cispr_nickname') || 'Aicezhe';
  const email = localStorage.getItem('cispr_email') || 'anna@gmail.com';

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function handleDeleteAccount() {
    if (confirm('Удалить аккаунт? Это действие нельзя отменить.')) {
      localStorage.clear();
      navigate('/');
    }
  }

  function handleEditPath() {
    navigate('/change-stage');
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-10">

      {/* Шапка */}
      <div className="flex items-center gap-4 px-6 pt-12 pb-4">
        <button onClick={() => navigate('/path')} className="text-navy text-2xl">←</button>
        <h1 className="font-serif text-navy text-3xl font-bold">Настройки</h1>
      </div>

      {/* Профиль */}
      <div className="mx-6 mt-4 relative bg-soft-cream border border-navy/20 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-cream border border-navy/30 flex items-center justify-center text-3xl">
          👤
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-navy text-2xl font-bold truncate">{nickname}</h2>
          <p className="font-serif text-gold text-sm italic truncate">{email}</p>
        </div>
      </div>

      {/* Аккаунт */}
      <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
        Аккаунт
      </h3>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">

        <button className="w-full flex items-center justify-between px-5 py-4 border-b border-navy/10">
          <span className="font-serif text-navy text-base">Сменить пароль</span>
          <span className="text-navy/60 text-xl">→</span>
        </button>

        <button className="w-full flex items-center justify-between px-5 py-4">
          <span className="font-serif text-navy text-base">Изменить почту</span>
          <span className="text-navy/60 text-xl">→</span>
        </button>

      </div>

      {/* Мой путь */}
      <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
        Мой путь
      </h3>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">

        <button
          onClick={handleEditPath}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <div className="text-left">
            <span className="font-serif text-navy text-base block">Редактировать путь</span>
            <span className="font-serif text-gold text-xs italic">сменить этап обучения</span>
          </div>
          <span className="text-navy/60 text-xl">→</span>
        </button>

      </div>

      {/* Приложение */}
      <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
        Приложение
      </h3>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
          <span className="font-serif text-navy text-base">Уведомления</span>
          <button
            onClick={() => setNotifications(!notifications)}
            className={
              'w-12 h-7 rounded-full relative transition-colors ' +
              (notifications ? 'bg-navy' : 'bg-navy/20')
            }
          >
            <div className={
              'absolute top-0.5 w-6 h-6 rounded-full bg-cream transition-all ' +
              (notifications ? 'left-[22px]' : 'left-0.5')
            } />
          </button>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
          <div>
            <span className="font-serif text-navy text-base block">Геолокация</span>
            <span className="font-serif text-gold text-xs italic">для карты Loci</span>
          </div>
          <button
            onClick={() => setGeolocation(!geolocation)}
            className={
              'w-12 h-7 rounded-full relative transition-colors ' +
              (geolocation ? 'bg-navy' : 'bg-navy/20')
            }
          >
            <div className={
              'absolute top-0.5 w-6 h-6 rounded-full bg-cream transition-all ' +
              (geolocation ? 'left-[22px]' : 'left-0.5')
            } />
          </button>
        </div>

        <button
          onClick={() => {
            const next = language === 'Русский' ? 'Italiano' : language === 'Italiano' ? 'English' : 'Русский';
            setLanguage(next);
          }}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="font-serif text-navy text-base">Язык</span>
          <span className="font-serif text-gold text-base">{language}</span>
        </button>

      </div>

      {/* Действия */}
      <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
        Действия
      </h3>
      <div className="mx-6 bg-soft-cream border border-navy/20 rounded-2xl overflow-hidden">

        <button
          onClick={handleLogout}
          className="w-full text-left px-5 py-4 border-b border-navy/10"
        >
          <span className="font-serif text-navy text-base">Выйти из аккаунта</span>
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full text-left px-5 py-4"
        >
          <span className="font-serif text-base" style={{ color: '#a8332a' }}>
            Удалить аккаунт
          </span>
        </button>

      </div>

      {/* Версия */}
      <p className="text-center font-serif text-navy/40 text-xs mt-8">
        CIS.PR · v0.1.0
      </p>

    </div>
  );
}