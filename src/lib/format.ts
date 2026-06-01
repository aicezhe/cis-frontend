// Единая точка форматирования значений для UI.

// Форматирует цену в евро: 4000 -> "4 000 €". Без копеек.
export function formatPrice(amount: number, currency = 'EUR'): string {
  const symbol = currency === 'EUR' ? '€' : currency;
  const rounded = Math.round(amount);
  const grouped = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // неразрывный пробел как разделитель тысяч
  return `${grouped} ${symbol}`;
}
