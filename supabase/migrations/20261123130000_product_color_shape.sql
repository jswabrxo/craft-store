alter table public.product_colors
  add column if not exists shape text not null default 'star'
  check (shape in ('star', 'diamond', 'crescent'));
