'use client';

import { useRackSession, useProductColor } from './rack-session';
import { CartControls, ColorChooser } from './color-controls';
import { ProductGallery } from './product-gallery';
import { RestockForm } from './restock-form';
import { peso } from '@/lib/products';

export function ProductDetails({ slug, name: fallbackName, type: fallbackType, price: fallbackPrice }: {
  slug: string; name: string; type: string; price: number;
}) {
  const {catalog}=useRackSession();
  const item=catalog?.products.find(p=>p.slug===slug);
  const name=item?.name??fallbackName,type=item?.type??fallbackType,price=item?.price??fallbackPrice;
  const { options, color, select } = useProductColor(slug);

  return <>
    <div className="detail-colors"><ColorChooser slug={slug} name={name} options={options} color={color} select={select} /></div>
    <ProductGallery key={color?.slug} type={type} color={color} />
    <h1>{name}</h1>
    <p>{peso(price)} · Price</p>
    <p>{item?.description??""}</p>
    <p>{item?.materials}</p><p>{item?.sizing}</p>
    <div className="product-cart">
      <CartControls slug={slug} name={name} color={color} />
      {color && <RestockForm key={color.slug} product={slug} color={color.slug} />}
    </div>
  </>;
}
