alter table public.drops add column theme jsonb not null default '{"background":"#eed8f2","surface":"#fff6ff","accent":"#702064","ink":"#44214f","sky":"#8dbaff"}';
alter table public.drops add column about_copy text not null default 'Small objects, made to keep close. Sample collection only.';
alter table public.drops add column is_active boolean not null default false;
create unique index one_active_drop on public.drops(is_active) where is_active;
create table public.store_orders (
 id uuid primary key default gen_random_uuid(),
 code text unique not null default ('ODD-' || replace(gen_random_uuid()::text,'-','')),
 request_id uuid unique not null,
 created_at timestamptz not null default now(),
 customer_name text not null,
 email text not null,
 items jsonb not null,
 total_centavos integer not null check(total_centavos>0),
 payment_status text not null default 'demo_unpaid' check(payment_status in ('demo_unpaid','demo_confirmed','cancelled')),
 order_status text not null default 'received' check(order_status in ('received','preparing','ready','shipped','completed','cancelled')),
 updated_at timestamptz not null default now()
);
alter table public.store_orders enable row level security;
create policy admin_orders on public.store_orders for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,update on public.store_orders to authenticated;
revoke all on public.store_orders from anon;
create table public.order_events(id bigint generated always as identity primary key, order_id uuid not null references public.store_orders(id),actor uuid,created_at timestamptz not null default now(),details jsonb not null);
alter table public.order_events enable row level security;
create policy admin_events on public.order_events for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select on public.order_events to authenticated;
create schema if not exists store_private;
revoke all on schema store_private from public,anon,authenticated;
create function store_private.audit_order() returns trigger language plpgsql security definer set search_path='' as $$ begin
new.updated_at=now();
insert into public.order_events(order_id,actor,details) values(new.id,auth.uid(),jsonb_build_object('payment',new.payment_status,'status',new.order_status));
return new; end; $$;
create trigger audit_store_order before update on public.store_orders for each row execute function store_private.audit_order();
create function public.create_sample_order(p_name text,p_email text,p_items jsonb,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
 select p.*,c.name as color_name into product from public.products p join public.drops d on d.slug=p.drop_slug join public.product_colors c on c.product_slug=p.slug where p.slug=line->>'slug' and c.slug=line->>'color' and c.is_visible and d.is_published and d.is_active;
 if not found then raise exception 'An item is unavailable. Refresh your cart.'; end if;
 total=total+product.price_centavos*qty;
 snapshot=snapshot||jsonb_build_array(jsonb_build_object('slug',product.slug,'name',product.name,'color',product.color_name,'quantity',qty,'price_centavos',product.price_centavos));
 end loop;
 insert into public.store_orders(request_id,customer_name,email,items,total_centavos) values(p_request_id,trim(p_name),lower(trim(p_email)),snapshot,total) returning * into o;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at);
end; $$;
create function public.lookup_sample_order(p_code text) returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('code',code,'total_centavos',total_centavos,'payment_status',payment_status,'order_status',order_status,'created_at',created_at,'updated_at',updated_at) from public.store_orders where code=upper(trim(p_code));
$$;
revoke all on function public.create_sample_order(text,text,jsonb,uuid) from public;
revoke all on function public.lookup_sample_order(text) from public;
grant execute on function public.create_sample_order(text,text,jsonb,uuid),public.lookup_sample_order(text) to anon,authenticated;
create function public.activate_drop(p_slug text) returns void language plpgsql security invoker set search_path='' as $$ begin
if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'store_admin' then raise exception 'Admin access required'; end if;
if not exists(select 1 from public.drops where slug=p_slug and is_published) then raise exception 'Publish the drop first'; end if;
update public.drops set is_active=false where is_active;
update public.drops set is_active=true where slug=p_slug;
end; $$;
revoke all on function public.activate_drop(text) from public;
grant execute on function public.activate_drop(text) to authenticated;

create policy store_admin_all on public.drops for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,insert,update,delete on public.drops to authenticated;

create policy store_admin_all on public.shelves for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,insert,update,delete on public.shelves to authenticated;

create policy store_admin_all on public.products for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,insert,update,delete on public.products to authenticated;

create policy store_admin_all on public.product_colors for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,insert,update,delete on public.product_colors to authenticated;

create policy store_admin_all on public.product_images for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='store_admin') with check ((select auth.jwt()->'app_metadata'->>'role')='store_admin');
grant select,insert,update,delete on public.product_images to authenticated;
