alter table public.store_orders add column contact_platform text, add column contact_handle text;
create function public.create_store_order(p_name text,p_email text,p_items jsonb,p_request_id uuid,p_contact_platform text,p_contact_handle text) returns jsonb language plpgsql security definer set search_path='' as $$
declare line jsonb; product record; qty int; total int:=0; snapshot jsonb:='[]'; o public.store_orders;
begin
 if (p_contact_platform is null) <> (p_contact_handle is null) or
 (p_contact_platform is not null and (p_contact_platform not in ('facebook','instagram') or length(trim(p_contact_handle)) not between 1 and 150)) then
 raise exception 'Choose Facebook or Instagram and enter a profile name or handle.'; end if;
 if length(trim(p_name))<2 or length(p_name)>100 or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a name and valid email format.'; end if;
 select * into o from public.store_orders where request_id=p_request_id;
 if found then
 if o.email<>lower(trim(p_email)) then raise exception 'Request already used'; end if;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at); end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Cart must contain 1–30 lines'; end if;
 if (select count(*) from public.store_orders where email=lower(trim(p_email)) and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many orders. Try again later.'; end if;
 for line in select * from jsonb_array_elements(p_items) loop
 qty=(line->>'quantity')::int;
 if qty is null or qty not between 1 and 20 then raise exception 'Quantity must be 1–20'; end if;
 select p.*,c.name as color_name,c.stock_quantity,c.preorder_limit into product from public.products p join public.drops d on d.slug=p.drop_slug join public.product_colors c on c.product_slug=p.slug where p.slug=line->>'slug' and c.slug=line->>'color' and c.is_visible and p.status='published' and d.is_published and d.is_active and (d.preorder_opens_at is null or now()>=d.preorder_opens_at) and (d.preorder_closes_at is null or now()<d.preorder_closes_at);
 if not found then raise exception 'An item is unavailable. Refresh your cart.'; end if;
 if least(coalesce(product.stock_quantity,20),coalesce(product.preorder_limit,20)) < (
   select sum((entry->>'quantity')::int) from jsonb_array_elements(p_items) entry
   where entry->>'slug'=line->>'slug' and entry->>'color'=line->>'color'
 ) then raise exception 'Quantity exceeds stock or this color’s preorder limit.'; end if;
 total=total+product.price_centavos*qty;
 snapshot=snapshot||jsonb_build_array(jsonb_build_object('slug',product.slug,'name',product.name,'color',product.color_name,'quantity',qty,'price_centavos',product.price_centavos));
 end loop;
 insert into public.store_orders(request_id,customer_name,email,items,total_centavos,contact_platform,contact_handle) values(p_request_id,trim(p_name),lower(trim(p_email)),snapshot,total,p_contact_platform,trim(p_contact_handle)) returning * into o;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at);
end; $$;

revoke all on function public.create_store_order(text,text,jsonb,uuid,text,text) from public;
grant execute on function public.create_store_order(text,text,jsonb,uuid,text,text) to anon,authenticated;
