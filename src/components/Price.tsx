import { useCurrency } from "../hooks/useCurrency";
import { formatPrice } from "../utils/formatPrice";

interface PriceProps {
  eur: number;
  showOriginal?: boolean;
  className?: string;
}

export function Price({ eur, showOriginal, className }: PriceProps) {
  const { currency } = useCurrency();
  return <span className={className}>{formatPrice(eur, currency, { showOriginal })}</span>;
}
