update public.product_colors c set lifestyle_path=v.path,preorder_limit=v.cap
from (values
 ('moon-pool','seafoam','/images/moon-pool-mint-lifestyle.webp',3),
 ('moon-pool','lilac','/images/moon-pool-lilac-lifestyle.webp',2),
 ('blue-hour','cobalt','/images/blue-hour-lifestyle.webp',1),
 ('honey-signal','amber','/images/honey-signal-lifestyle.webp',3)
) v(product,color,path,cap) where c.product_slug=v.product and c.slug=v.color;
