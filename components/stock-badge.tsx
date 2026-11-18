import type { ProductColor } from '@/lib/colors';

export function StockBadge({color}: {color?: ProductColor}) {
  const quantity = color?.stock_quantity;
  if (quantity == null) return null;
  const low = quantity > 0 && quantity <= (color?.low_stock_threshold ?? 3);
  return <div className="stock-badge" data-low={low}>
    <span>{quantity === 0 ? "Sold out" : `${quantity} left`}</span>
  </div>;
}
