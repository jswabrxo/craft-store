create function public.delete_rack_draft(p_slug text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'store_admin' then raise exception 'Admin access required'; end if;
 perform 1 from public.products where slug=p_slug and status='draft' for update;
 if not found then raise exception 'Only draft products can be deleted'; end if;
 delete from public.product_colors where product_slug=p_slug;
 delete from public.product_images where product_slug=p_slug;
 delete from public.products where slug=p_slug;
end; $$;
revoke all on function public.delete_rack_draft(text) from public;
grant execute on function public.delete_rack_draft(text) to authenticated;

create function public.create_store_drop(p_slug text,p_title text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'store_admin' then raise exception 'Admin access required'; end if;
 if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>50 or length(trim(p_title)) not between 1 and 100 then raise exception 'Enter a title and a valid lowercase drop code'; end if;
 insert into public.drops(slug,title,brand_name,hero_eyebrow,hero_copy,preorder_details,sample_notice,meta_description)
 values(p_slug,trim(p_title),'ODD OBJECTS','NEW DROP','','','',trim(p_title));
 insert into public.shelves(drop_slug,shelf_code,title,display_order) values(p_slug,'01','Shelf 1',1);
end; $$;
revoke all on function public.create_store_drop(text,text) from public;
grant execute on function public.create_store_drop(text,text) to authenticated;
