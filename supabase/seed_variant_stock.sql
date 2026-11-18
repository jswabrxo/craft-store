insert into public.products(slug,drop_slug,shelf_code,object_code,name,product_type,price_centavos,description,materials,sizing,display_order) values
('blue-hour','drop-02','01','MP—02','Blue Hour','Bracelet',35000,'Exclusive cobalt glass bracelet with a silver-tone crescent.','Glass beads and silver-tone hardware','Sample size: 17 cm',2),
('honey-signal','drop-02','01','MP—03','Honey Signal','Keychain',24000,'Amber glass bead and silver-tone star on a split ring.','Glass bead and steel split ring','Sample length: 6 cm',3);
insert into public.product_colors(product_slug,slug,name,swatch_hex,image_path,image_alt,display_order,is_visible,stock_quantity) values
('blue-hour','cobalt','Exclusive Cobalt','#2545b8','/images/blue-hour.webp','AI-generated cobalt bracelet with a silver crescent',1,true,2),
('honey-signal','amber','Honey Amber','#b96f1b','/images/honey-signal.webp','AI-generated amber bead keychain with a silver star',1,true,9);
insert into public.product_images(product_slug,storage_path,alt_text,display_order)
select product_slug,image_path,image_alt,1 from public.product_colors where product_slug in ('blue-hour','honey-signal');
update public.product_colors set stock_quantity=case slug when 'seafoam' then 12 when 'lilac' then 3 end where product_slug='moon-pool';
