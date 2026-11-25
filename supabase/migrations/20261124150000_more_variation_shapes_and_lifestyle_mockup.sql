alter table public.product_colors drop constraint product_colors_shape_check, add constraint product_colors_shape_check check (shape in ('star','diamond','crescent','triangle','square','circle'));
update public.product_colors set lifestyle_path=mockup_paths[1],mockup_paths=coalesce(mockup_paths[2:4],'{}') where lifestyle_path is null and cardinality(mockup_paths)>0;
