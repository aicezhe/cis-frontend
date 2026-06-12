import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuizVisaPage() {
  const navigate = useNavigate();

  const [arriveDate, setArriveDate] = useState('');

  // страна/город теперь спрашиваются в регистрации (cispr_country / cispr_city)
  function goNext() {
    if (!arriveDate) return;
    localStorage.setItem('cispr_arrive_date', arriveDate);
    localStorage.setItem('cispr_passed_quiz', 'visa');
    navigate('/path');
  }

  const nextEnabled = arriveDate !== '';

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col">

      <div className="border-t-4 border-b-2 border-gold py-3 text-center">
        <span className="font-serif text-gold text-sm tracking-[0.2em]">
          ALMAE • VNIVERSITATIS • STVDII
        </span>
      </div>

      <div className="flex items-center gap-3 px-6 mt-10">
        <button onClick={() => navigate('/change-stage')} className="text-navy text-2xl">←</button>
        <div className="flex gap-2 flex-1">
          <div className="h-1.5 flex-1 rounded-full bg-navy" />
        </div>
      </div>

      <div className="flex flex-col items-center mt-16 px-8">

        <p className="font-serif text-gold text-sm tracking-widest mb-8">
          ВИЗА
        </p>

        <h1 className="font-serif text-navy text-3xl text-center mb-10">
          Когда ты должен приехать?
        </h1>
        <input
          type="date"
          value={arriveDate}
          onChange={(e) => setArriveDate(e.target.value)}
          className="w-full font-sans text-navy text-lg bg-cream border border-navy rounded-2xl px-5 py-4 outline-none"
        />

        <button
          onClick={goNext}
          disabled={!nextEnabled}
          className={
            'font-serif text-cream text-lg rounded-full px-10 py-3 mt-6 ' +
            (nextEnabled ? 'bg-navy' : 'bg-navy/30 cursor-not-allowed')
          }
        >
          ДАЛЕЕ
        </button>

      </div>

      <div className="flex-1 min-h-20" />

      <div className="border-t-4 border-b-2 border-gold py-3 text-center">
        <span className="font-serif text-gold text-sm tracking-[0.2em]">
          ALMAE • VNIVERSITATIS • STVDII
        </span>
      </div>

    </div>
  );
}
