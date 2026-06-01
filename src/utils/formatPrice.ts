import { CURRENCIES, type CurrencyCode } from "../config/currencies";

/**
 * Конвертирует и форматирует цену.
 * @param eurAmount — сумма в евро (нативная валюта датасета)
 * @param targetCurrency — код целевой валюты
 * @param opts — дополнительные опции
 */
export function formatPrice(
  eurAmount: number,
  targetCurrency: CurrencyCode,
  opts: { showOriginal?: boolean; compact?: boolean } = {}
): string {
  const info = CURRENCIES[targetCurrency];
  const converted = eurAmount * info.rate_to_eur;

  // округление: для крупных сумм — до сотен, для мелких — до 1
  const rounded = converted >= 1000
    ? Math.round(converted / 100) * 100
    : Math.round(converted);

  const locale = targetCurrency === "EUR" ? "it-IT" :
                 targetCurrency === "UAH" ? "uk-UA" :
                 "ru-RU";
  const formatted = rounded.toLocaleString(locale);

  const main = `${formatted} ${info.symbol}`;
  if (opts.showOriginal && targetCurrency !== "EUR") {
    return `${main} (≈ ${eurAmount.toLocaleString("it-IT")} €)`;
  }
  return main;
}
