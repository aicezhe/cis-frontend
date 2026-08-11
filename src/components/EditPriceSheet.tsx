import { useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';
import { usePriceOverrides } from '../hooks/usePriceOverrides';
import { formatPrice } from '../utils/formatPrice';

interface Props {
  id: string;
  label: string;
  baseEur: number; // эталон из сида — не меняется, к нему возвращает «Сбросить»
  onClose: () => void;
}

// Bottom-sheet правки цены строки разбивки. В отличие от AddExpenseSheet (свой
// расход на бэкенде) — правит ЛОКАЛЬНЫЙ override поверх сида. Сумму вводишь в
// текущей валюте приложения, храним в EUR.
export function EditPriceSheet({ id, label, baseEur, onClose }: Props) {
  const { currency, info } = useCurrency();
  const { overrides, setOverride, clearOverride } = usePriceOverrides();
  const hasOverride = id in overrides;
  const currentEur = hasOverride ? overrides[id] : baseEur;

  const [amount, setAmount] = useState(String(Math.round(currentEur * info.rate_to_eur)));
  const amountLocal = Number(amount.replace(',', '.'));
  const amountEur = Math.round(amountLocal / info.rate_to_eur);
  const canSave = amount.trim() !== '' && amountEur >= 0 && amountEur !== currentEur;

  function save() {
    if (!canSave) return;
    setOverride(id, amountEur);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 flex items-end md:items-center justify-center md:p-8" onClick={onClose}>
      <div className="w-full max-w-md md:max-w-lg bg-cream rounded-t-3xl md:rounded-3xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <span className="w-10 h-1 rounded-full bg-navy/20" />
        </div>

        <div className="px-6 pb-6 pt-2">
          <h2 className="font-serif text-navy text-xl font-bold mb-1">Своя цена</h2>
          <p className="font-serif text-navy/60 text-sm mb-4">{label}</p>

          <label className="block font-serif text-navy/60 text-xs mb-1">
            Сумма, {info.symbol}
            {currency !== 'EUR' && (
              <span className="text-navy/40"> (валюта из Настроек — {info.name_ru.toLowerCase()})</span>
            )}
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full font-serif text-navy border border-navy/20 rounded-xl px-4 py-3 outline-none focus:border-gold"
          />

          <p className="font-serif text-navy/40 text-[11px] italic mt-2">
            Оценка приложения — {formatPrice(baseEur, currency)}. Твоя цифра видна только тебе.
          </p>

          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={save}
              disabled={!canSave}
              className={
                'w-full font-serif text-lg rounded-full py-3 ' +
                (canSave ? 'bg-navy text-cream' : 'bg-navy/30 text-cream/70')
              }
            >
              Сохранить
            </button>
            {hasOverride && (
              <button
                onClick={() => { clearOverride(id); onClose(); }}
                className="w-full font-serif text-navy border border-navy/30 rounded-full py-3 text-sm"
              >
                Сбросить к оценке {formatPrice(baseEur, currency)}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full font-serif text-navy/70 py-2 text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
