alter table public.product_colors
  add column stock_quantity integer check (stock_quantity >= 0),
  add column low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0);
