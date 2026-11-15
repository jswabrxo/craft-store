alter table public.store_orders alter column code set default ('ODD-' || upper(replace(gen_random_uuid()::text,'-','')));
create or replace function public.lookup_sample_order(p_code text) returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('code',code,'total_centavos',total_centavos,'payment_status',payment_status,'order_status',order_status,'created_at',created_at,'updated_at',updated_at) from public.store_orders where upper(code)=upper(trim(p_code));
$$;
create index store_order_code_casefold on public.store_orders(upper(code));
create index store_orders_email_created on public.store_orders(email,created_at);
