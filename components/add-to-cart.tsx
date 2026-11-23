'use client';

import {ShopChime} from './shop-chime';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRackSession, useProductColor } from './rack-session';
import { CartControls, ColorChooser } from './color-controls';
import { ProductGallery } from './product-gallery';
import { RestockForm } from './restock-form';
import { SizeHelper,MatchingPieces,PackagingPreview } from './shopping-help';
import { peso } from '@/lib/products';

export function ProductDetails({ slug, name: fallbackName, type: fallbackType, price: fallbackPrice }: {
  slug: string; name: string; type: string; price: number;
}) {
  const {catalog, count, position}=useRackSession();
  const mounted=useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const item=catalog?.products.find(p=>p.slug===slug);
  const name=item?.name??fallbackName,type=item?.type??fallbackType,price=item?.price??fallbackPrice;
  const { options, color, select } = useProductColor(slug);

  return <>
    <div className="product-sound"><ShopChime/></div>
    <div className="detail-colors"><ColorChooser slug={slug} name={name} options={options} color={color} select={select} /></div>
    <ProductGallery key={color?.slug} type={type} color={color} />
    <h1>{name}</h1>
    <p>{peso(price)} · Price</p>
    <p>{item?.description??""}</p>
    <p>{item?.materials}</p><p>{item?.sizing}</p>
    {type.toLowerCase()==='bracelet'&&<SizeHelper sizing={item?.sizing}/>}
    <div className="product-cart">
      {color && <RestockForm key={color.slug} product={slug} color={color.slug} />}
    </div>
    <PackagingPreview/>
    <MatchingPieces slug={slug} type={type}/>
    <div className="product-dock-space" aria-hidden="true"/>
    {mounted && createPortal(
      <nav className="product-dock" aria-label="Product purchase actions">
        <CartControls slug={slug} name={name} color={color} showQuantity={false}/>
        {count > 0
          ? <Link className="product-dock-checkout" href="/?checkout=1#cart" onNavigate={()=>{position.current=null;}}>Checkout</Link>
          : <button className="product-dock-checkout" type="button" disabled>Checkout</button>}
      </nav>,
      document.body
    )}
  </>;
}


const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
