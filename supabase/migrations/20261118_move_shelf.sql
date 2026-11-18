create function public.move_store_shelf(p_drop text,p_shelf text,p_direction integer)
returns void language plpgsql security invoker set search_path='' as $$
declare ordered text[]; pos integer; neighbor integer; swap text;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'store_admin' then raise exception 'Admin access required'; end if;
 if p_direction is null or p_direction not in (-1,1) then raise exception 'Choose up or down'; end if;
 perform 1 from public.drops where slug=p_drop for update;
 select array_agg(shelf_code order by coalesce(rack_rank,display_order),display_order)
 into ordered from public.shelves where drop_slug=p_drop;
 pos=array_position(ordered,p_shelf);
 if pos is null then raise exception 'Shelf no longer exists'; end if;
 neighbor=pos+p_direction;
 if neighbor<1 or neighbor>cardinality(ordered) then return; end if;
 swap=ordered[neighbor]; ordered[neighbor]=ordered[pos]; ordered[pos]=swap;
 update public.shelves s set rack_rank=ranked.position
 from unnest(ordered) with ordinality as ranked(code,position)
 where s.drop_slug=p_drop and s.shelf_code=ranked.code;
end; $$;
revoke all on function public.move_store_shelf(text,text,integer) from public;
grant execute on function public.move_store_shelf(text,text,integer) to authenticated;
