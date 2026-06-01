export type CurrencyCode = "EUR" | "RUB" | "UAH" | "BYN" | "KZT";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name_ru: string;
  flag: string;
  // курс к EUR (1 EUR = X местной валюты)
  // Курсы фиксированные на месяц, обновляются вручную или через API.
  rate_to_eur: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EUR: { code: "EUR", symbol: "€",  name_ru: "Евро",                flag: "🇪🇺", rate_to_eur: 1 },
  RUB: { code: "RUB", symbol: "₽",  name_ru: "Российский рубль",    flag: "🇷🇺", rate_to_eur: 95 },
  UAH: { code: "UAH", symbol: "₴",  name_ru: "Гривна",              flag: "🇺🇦", rate_to_eur: 45 },
  BYN: { code: "BYN", symbol: "Br", name_ru: "Белорусский рубль",   flag: "🇧🇾", rate_to_eur: 3.5 },
  KZT: { code: "KZT", symbol: "₸",  name_ru: "Казахстанский тенге", flag: "🇰🇿", rate_to_eur: 540 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";
export const LS_CURRENCY_KEY = "cispr_currency";

// TODO v2: автообновление курсов через https://api.frankfurter.app/latest?from=EUR
// Сейчас курсы статичные — обновлять вручную при значительных изменениях.
