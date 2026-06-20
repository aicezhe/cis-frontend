import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken, isAuthed } from '../lib/api';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { Avatar } from '../components/Avatar';
import { cacheAvatar, fileToAvatarB64, loadCachedAvatar } from '../lib/avatar';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [geolocation, setGeolocation] = useState(false);
  const [language, setLanguage] = useState('Русский');

  const [nickname, setNickname] = useState(
    localStorage.getItem('cispr_nickname') || 'Aicezhe',
  );
  const [email, setEmail] = useState(
    localStorage.getItem('cispr_email') || 'anna@gmail.com',
  );
  const [avatar, setAvatar] = useState<string | null>(loadCachedAvatar());
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // подтягиваем актуальный профиль с бэкенда
  useEffect(() => {
    if (!isAuthed()) return;
    let cancelled = false;
    api
      .me()
      .then((u) => {
        if (cancelled) return;
        setNickname(u.username);
        setEmail(u.email);
        setAvatar(u.avatar_b64 || null);
        cacheAvatar(u.avatar_b64 || null);
        localStorage.setItem('cispr_nickname', u.username);
        localStorage.setItem('cispr_email', u.email);
      })
      .catch(() => {
        // токен мог истечь — остаёмся на локальных значениях
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const b64 = await fileToAvatarB64(file);
      // оптимистично — показываем сразу, потом подтверждаем на бэке
      setAvatar(b64);
      cacheAvatar(b64);
      await api.updateProfile({ avatar_b64: b64 });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Не удалось загрузить аватар');
    } finally {
      setAvatarUploading(false);
      // сбрасываем input, чтобы можно было выбрать тот же файл снова
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAvatarRemove() {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      setAvatar(null);
      cacheAvatar(null);
      await api.updateProfile({ avatar_b64: null });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Не удалось удалить аватар');
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleLogout() {
    clearToken();
    localStorage.clear();
    navigate('/');
  }

  function handleDeleteAccount() {
    if (confirm('Удалить аккаунт? Это действие нельзя отменить.')) {
      clearToken();
      localStorage.clear();
      navigate('/');
    }
  }

  function handleEditPath() {
    navigate('/change-stage');
  }

  function handleChangeCourse() {
    navigate('/change-course');
  }

  const courseName = localStorage.getItem('cispr_course_name');

  const COUNTRY_LABELS: Record<string, string> = { ru: 'Россия', ua: 'Украина', by: 'Беларусь', kz: 'Казахстан' };
  const [country, setCountryState] = useState(localStorage.getItem('cispr_country') || '');

  function handleCountryChange(code: string) {
    setCountryState(code);
    localStorage.setItem('cispr_country', code);
    try { api.updateProfile({ country: code }); } catch { /* non-critical */ }
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
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative group flex-shrink-0"
          aria-label="Сменить аватар"
        >
          <Avatar src={avatar} name={nickname} size={80} className="border border-navy/30" />
          {/* Тёмная подсказка при наведении / тапе */}
          <span
            className={
              'absolute inset-0 rounded-full flex items-center justify-center bg-navy/60 transition-opacity ' +
              (avatarUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-active:opacity-100')
            }
          >
            <span className="font-serif text-cream text-[10px] uppercase tracking-widest">
              {avatarUploading ? '...' : 'сменить'}
            </span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarPick}
          className="hidden"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-navy text-2xl font-bold truncate">{nickname}</h2>
          <p className="font-serif text-gold text-sm italic truncate">{email}</p>
          <div className="flex gap-3 mt-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="font-serif text-navy/60 text-xs underline disabled:opacity-50"
            >
              {avatar ? 'заменить фото' : 'загрузить фото'}
            </button>
            {avatar && (
              <button
                onClick={handleAvatarRemove}
                disabled={avatarUploading}
                className="font-serif text-xs underline disabled:opacity-50"
                style={{ color: '#a8332a' }}
              >
                убрать
              </button>
            )}
          </div>
          {avatarError && (
            <p className="font-serif text-xs italic mt-1" style={{ color: '#a8332a' }}>
              {avatarError}
            </p>
          )}
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
          className="w-full flex items-center justify-between px-5 py-4 border-b border-navy/10"
        >
          <div className="text-left">
            <span className="font-serif text-navy text-base block">Редактировать путь</span>
            <span className="font-serif text-gold text-xs italic">сменить этап обучения</span>
          </div>
          <span className="text-navy/60 text-xl">→</span>
        </button>

        <button
          onClick={handleChangeCourse}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-navy/10"
        >
          <div className="text-left min-w-0 pr-3">
            <span className="font-serif text-navy text-base block">Поменять мой курс</span>
            <span className="font-serif text-gold text-xs italic truncate block">
              {courseName || 'курс ещё не выбран'}
            </span>
          </div>
          <span className="text-navy/60 text-xl flex-shrink-0">→</span>
        </button>

        {/* Страна — влияет на расчёт расходов и блок легализации документов */}
        <div className="px-5 py-4">
          <span className="font-serif text-navy text-base block mb-2">Моя страна</span>
          <div className="flex gap-2 flex-wrap">
            {(['ru', 'ua', 'by', 'kz'] as const).map((code) => (
              <button
                key={code}
                onClick={() => handleCountryChange(code)}
                className={
                  'font-serif text-sm rounded-xl px-3 py-1.5 border transition-colors ' +
                  (country === code
                    ? 'bg-navy text-gold border-navy'
                    : 'bg-cream text-navy border-navy/25')
                }
              >
                {COUNTRY_LABELS[code]}
              </button>
            ))}
          </div>
          {country && (
            <p className="font-serif text-navy/50 text-xs italic mt-2">
              Влияет на расходы и инструкцию по документам
            </p>
          )}
        </div>

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

      {/* Валюта отображения */}
      <h3 className="font-serif text-gold text-sm italic px-6 mt-8 mb-2">
        Валюта
      </h3>
      <div className="mx-6">
        <CurrencyPicker />
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