import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TabBar from '../components/TabBar';
import { useFoundation } from '../hooks/useFoundation';

export default function FoundationApplyPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFoundation();
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-serif text-navy/60 italic">Загрузка…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <p className="font-serif text-navy text-center">Не удалось загрузить данные.</p>
      </div>
    );
  }

  const emailTemplate = data.email_templates['fy_application_email'];

  function copyEmail() {
    if (!emailTemplate) return;
    const text = `Subject: ${emailTemplate.subject}\n\n${emailTemplate.body_en}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-cream flex flex-col pb-28">
      <div className="px-6 pt-12">
        <button onClick={() => navigate('/path/foundation')} className="text-navy text-2xl">←</button>
      </div>

      <div className="mx-6 mt-4">
        <h1 className="font-serif text-navy text-3xl font-bold">Как поступить</h1>
        <p className="font-serif text-gold text-base italic mt-1">Шаги подачи на Foundation Year</p>
      </div>

      {/* Шаги */}
      <div className="mx-6 mt-6 flex flex-col gap-3">
        {data.steps_to_apply.map((step, idx) => (
          <div key={step.id} className="bg-soft-cream border border-navy/20 rounded-2xl p-5">
            <p className="font-serif text-gold text-sm italic">Шаг {idx + 1}</p>
            <h4 className="font-serif text-navy text-lg font-bold mt-0.5">{step.title}</h4>

            {step.description_ru && (
              <p className="font-serif text-navy/80 text-sm mt-2 leading-relaxed">
                {step.description_ru}
              </p>
            )}

            {step.items && (
              <div className="flex flex-col gap-2 mt-3">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">◆</span>
                    <p className="font-serif text-navy/80 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {step.substeps && (
              <div className="flex flex-col gap-2 mt-3">
                {step.substeps.map((sub, i) => (
                  <div key={i} className="bg-cream border border-navy/15 rounded-xl px-3 py-2">
                    <p className="font-serif text-navy text-sm">{sub.name}</p>
                    <div className="flex gap-3 mt-1">
                      {sub.cost_rub && (
                        <span className="font-serif text-navy/60 text-xs">≈ {sub.cost_rub} ₽</span>
                      )}
                      {sub.duration_days && (
                        <span className="font-serif text-navy/60 text-xs">{sub.duration_days} дн.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step.warnings && (
              <div className="flex flex-col gap-2 mt-3">
                {step.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 bg-cream border border-gold rounded-xl px-3 py-2">
                    <span className="text-gold mt-0.5">!</span>
                    <p className="font-serif text-navy/80 text-xs">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Шаблон письма */}
      {emailTemplate && (
        <div className="mx-6 mt-8">
          <h3 className="font-serif text-navy text-xl font-bold mb-3">Шаблон заявки (email)</h3>
          <div className="bg-navy rounded-2xl p-5">
            <p className="font-serif text-gold text-xs italic mb-1">Subject</p>
            <p className="font-serif text-cream text-sm mb-4">{emailTemplate.subject}</p>
            <p className="font-serif text-gold text-xs italic mb-1">Body</p>
            <pre className="font-serif text-cream/90 text-xs whitespace-pre-wrap leading-relaxed">
{emailTemplate.body_en}
            </pre>
          </div>
          <button
            onClick={copyEmail}
            className="w-full mt-3 font-serif text-navy bg-gold rounded-full py-3 text-sm"
          >
            {copied ? 'Скопировано ✓' : 'Скопировать письмо'}
          </button>
          <p className="font-serif text-navy/50 text-xs italic mt-2">
            Заполни поля в [скобках] и отправь на {data.program.official_email}
          </p>
        </div>
      )}

      {/* Частые ошибки */}
      <div className="mx-6 mt-8">
        <h3 className="font-serif text-navy text-xl font-bold mb-3">Частые ошибки</h3>
        <div className="flex flex-col gap-2">
          {data.common_pitfalls_ru.map((pitfall, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gold mt-0.5">◆</span>
              <p className="font-serif text-navy/80 text-sm">{pitfall}</p>
            </div>
          ))}
        </div>
      </div>

      <TabBar active="path" />
    </div>
  );
}
