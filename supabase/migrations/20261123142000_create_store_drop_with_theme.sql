create or replace function public.create_store_drop_with_theme(p_slug text,p_title text,p_layout text) returns void language plpgsql security invoker set search_path='' as $$
begin
 if p_layout is null or p_layout not in ('aero','professional','profile','sari-sari','fiesta','last-trip') then raise exception 'Choose a storefront theme'; end if;
 perform public.create_store_drop(p_slug,p_title);
 update public.drops set theme=coalesce(theme,'{}'::jsonb)||jsonb_build_object('layout',p_layout) where slug=p_slug;
end; $$;
revoke all on function public.create_store_drop_with_theme(text,text,text) from public;
grant execute on function public.create_store_drop_with_theme(text,text,text) to authenticated;
