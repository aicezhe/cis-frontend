import skyline from '../assets/parma design.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';
import { api, ApiError, setToken } from '../lib/api';


const stars = [
  { top: '6%', left: '12%', size: 3 },
  { top: '9%', left: '78%', size: 2 },
  { top: '13%', left: '40%', size: 2 },
  { top: '16%', left: '88%', size: 3 },
  { top: '19%', left: '22%', size: 2 },
  { top: '22%', left: '63%', size: 2 },
  { top: '25%', left: '8%', size: 3 },
  { top: '11%', left: '55%', size: 2 },
  { top: '17%', left: '70%', size: 2 },
  { top: '8%', left: '30%', size: 2 },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (email.trim() === '' || password.trim() === '' || loading) return;
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.login(email.trim(), password);
      setToken(access_token);
      const user = await api.me();
      localStorage.setItem('cispr_email', user.email);
      localStorage.setItem('cispr_nickname', user.username);
      if (user.course_id) localStorage.setItem('cispr_course_id', user.course_id);
      // тип программы нужен разделу «Университет» для ветвления на Foundation Year
      if (user.program_level) localStorage.setItem('cispr_program', user.program_level);
      navigate('/path');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Не удалось войти';
      setError(/401|invalid|incorrect|неверн/i.test(msg) ? 'Неверный email или пароль' : msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  const canLogin = email.trim() !== '' && password.trim() !== '' && !loading;

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-gradient-to-b from-navy via-cream to-cream flex flex-col items-center px-8 overflow-hidden">

      <button
        onClick={() => navigate('/')}
        className="absolute top-12 left-6 text-cream text-2xl z-10"
      >
        ←
      </button>

      {stars.map((star, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-cream"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: 0.6,
          }}
        />
      ))}

      <h1 className="font-serif text-cream text-6xl mt-32 mb-12">
        Bentornati!
      </h1>

      <div className="w-full mb-2">
        <p className="font-serif text-gold text-sm italic mb-2">Email</p>
        <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="anna@gmail.com"
            autoComplete="off"
            className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
          />
          <Mail size={20} className="text-navy" />
        </div>
      </div>

      <div className="w-full mt-4 mb-10">
        <p className="font-serif text-gold text-sm italic mb-2">Пароль</p>
        <div className="w-full flex items-center border border-navy rounded-2xl px-5 py-4">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className="font-sans text-navy text-lg flex-1 bg-transparent outline-none"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-navy"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="font-serif text-sm italic mb-4 text-center" style={{ color: '#a8332a' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        disabled={!canLogin}
        className={
          'font-serif text-cream text-xl rounded-full px-16 py-4 mb-auto ' +
          (canLogin ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
        }
      >
        {loading ? '...' : 'ВОЙТИ'}
      </button>

      <img
        src={skyline}
        alt="Здания Пармы"
        className="w-full"
      />

      <div className="w-full flex flex-col gap-1 pb-6">
        <div className="h-0.5 bg-gold w-full" />
        <div className="h-0.5 bg-gold w-full" />
        <div className="h-0.5 bg-gold w-full" />
      </div>

    </div>
  );
}