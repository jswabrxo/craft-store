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
 select p.*,c.name as color_name,c.stock_quantity into product from public.products p join public.drops d on d.slug=p.drop_slug join public.product_colors c on c.product_slug=p.slug where p.slug=line->>'slug' and c.slug=line->>'color' and c.is_visible and d.is_published and d.is_active;
 if not found then raise exception 'An item is unavailable. Refresh your cart.'; end if;
 if product.stock_quantity is not null and product.stock_quantity < (
   select sum((entry->>'quantity')::int) from jsonb_array_elements(p_items) entry
   where entry->>'slug'=line->>'slug' and entry->>'color'=line->>'color'
 ) then raise exception 'Stock changed. Adjust your cart and try again.'; end if;
 total=total+product.price_centavos*qty;
 snapshot=snapshot||jsonb_build_array(jsonb_build_object('slug',product.slug,'name',product.name,'color',product.color_name,'quantity',qty,'price_centavos',product.price_centavos));
 end loop;
 insert into public.store_orders(request_id,customer_name,email,items,total_centavos) values(p_request_id,trim(p_name),lower(trim(p_email)),snapshot,total) returning * into o;
 return jsonb_build_object('code',o.code,'total_centavos',o.total_centavos,'payment_status',o.payment_status,'order_status',o.order_status,'created_at',o.created_at);
end; $$;
