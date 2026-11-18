alter table public.drops add column preorder_opens_at timestamptz, add column preorder_closes_at timestamptz,
 add check(preorder_closes_at is null or preorder_opens_at is null or preorder_closes_at>preorder_opens_at);
alter table public.products add column featured boolean not null default false;
alter table public.product_colors add column lifestyle_path text, add column preorder_limit integer check(preorder_limit between 1 and 20);
create table public.restock_requests (
 product_slug text not null, color_slug text not null, email text not null, requested_at timestamptz not null default now(),
 primary key(product_slug,color_slug,email),
 foreign key(product_slug,color_slug) references public.product_colors(product_slug,slug),
 check(length(email)<=254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);
alter table public.restock_requests enable row level security;
revoke all on public.restock_requests from anon,authenticated;
grant select on public.restock_requests to authenticated;
grant insert(product_slug,color_slug,email) on public.restock_requests to anon,authenticated;
create policy restock_insert on public.restock_requests for insert to anon,authenticated with check (
 exists(select 1 from public.product_colors c join public.products p on p.slug=c.product_slug join public.drops d on d.slug=p.drop_slug
 where c.product_slug=restock_requests.product_slug and c.slug=restock_requests.color_slug and c.is_visible and d.is_active and d.is_published)
);
create policy restock_admin on public.restock_requests for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin');

create or replace function public.create_sample_order(p_name text,p_email text,p_items jsonb,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare line jsonb; product record; qty int; total int:=0; snapshot jsonb:='[]'; o public.store_orders;
begin
 if length(trim(p_name))<2 or length(p_name)>100 or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a name and valid email format.'; end if;
 select * into o from public.store_orders where request_id=p_request_id;
 if found then
 if o.email<>lower(trim(p_email)) then raise exception 'Request already used'; end if;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at); end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Cart must contain 1–30 lines'; end if;
 if (select count(*) from public.store_orders where email=lower(trim(p_email)) and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many sample orders. Try again later.'; end if;
 for line in select * from jsonb_array_elements(p_items) loop
 qty=(line->>'quantity')::int;
 if qty is null or qty not between 1 and 20 then raise exception 'Quantity must be 1–20'; end if;
 select p.*,c.name as color_name,c.stock_quantity,c.preorder_limit into product from public.products p join public.drops d on d.slug=p.drop_slug join public.product_colors c on c.product_slug=p.slug where p.slug=line->>'slug' and c.slug=line->>'color' and c.is_visible and d.is_published and d.is_active and (d.preorder_opens_at is null or now()>=d.preorder_opens_at) and (d.preorder_closes_at is null or now()<d.preorder_closes_at);
 if not found then raise exception 'An item is unavailable. Refresh your cart.'; end if;
 if least(coalesce(product.stock_quantity,20),coalesce(product.preorder_limit,20)) < (
   select sum((entry->>'quantity')::int) from jsonb_array_elements(p_items) entry
   where entry->>'slug'=line->>'slug' and entry->>'color'=line->>'color'
 ) then raise exception 'Quantity exceeds stock or this color’s preorder limit.'; end if;
 total=total+product.price_centavos*qty;
 snapshot=snapshot||jsonb_build_array(jsonb_build_object('slug',product.slug,'name',product.name,'color',product.color_name,'quantity',qty,'price_centavos',product.price_centavos));
 end loop;
 insert into public.store_orders(request_id,customer_name,email,items,total_centavos) values(p_request_id,trim(p_name),lower(trim(p_email)),snapshot,total) returning * into o;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at);
end; $$;
