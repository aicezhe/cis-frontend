import { useEffect, useState, useCallback } from "react";
import { CURRENCIES, DEFAULT_CURRENCY, LS_CURRENCY_KEY, type CurrencyCode } from "../config/currencies";

const listeners = new Set<(c: CurrencyCode) => void>();

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(LS_CURRENCY_KEY) as CurrencyCode | null;
    return stored && CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;
  });

  useEffect(() => {
    const cb = (c: CurrencyCode) => setCurrencyState(c);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  const setCurrency = useCallback((c: CurrencyCode) => {
    localStorage.setItem(LS_CURRENCY_KEY, c);
    listeners.forEach(l => l(c));
  }, []);

  return { currency, setCurrency, info: CURRENCIES[currency] };
}
