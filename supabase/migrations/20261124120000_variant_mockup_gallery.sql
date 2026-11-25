alter table public.product_colors add column if not exists mockup_paths text[] not null default '{}'
check (cardinality(mockup_paths)<=4);
