import { CURRENCIES, type CurrencyCode } from "../config/currencies";
import { useCurrency } from "../hooks/useCurrency";

export function CurrencyPicker() {
  const { currency, setCurrency } = useCurrency();
  const codes: CurrencyCode[] = ["EUR", "RUB", "UAH", "BYN", "KZT"];

  return (
    <div className="space-y-2">
      <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
        ⌐ валюта отображения ¬
      </div>
      <div className="grid grid-cols-2 gap-2">
        {codes.map((c) => {
          const info = CURRENCIES[c];
          const active = c === currency;
          return (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`rounded-xl px-4 py-3 text-left transition border ${
                active
                  ? "bg-navy text-cream border-navy"
                  : "bg-white/70 text-navy border-navy/10 hover:bg-cream"
              }`}
            >
              <div className="font-serif text-base">
                {info.flag} {info.code}
              </div>
              <div className={`font-sans text-xs ${active ? "text-cream/70" : "text-navy/60"}`}>
                {info.name_ru}
              </div>
            </button>
          );
        })}
      </div>
      <p className="font-sans text-[11px] text-navy/40 mt-2">
        Все цены в датасете хранятся в евро. Конвертация по фиксированным курсам — для точной суммы используй банковский курс на день оплаты.
      </p>
    </div>
  );
}
